/**
 * YKS Chronological Calendar Distribution Engine
 *
 * Distributes all curriculum videos across ~42 weeks into daily blocks:
 * - 4 blocks per study day (Monday to Saturday); 1 block = 1 video.
 * - Sunday is strictly a rest day (isRestDay: true).
 * - Schedule mapping:
 *   - Pazartesi: TYT Türkçe (2), TYT Coğrafya (2)
 *   - Salı: TYT Matematik (2), TYT-AYT Tarih (2)
 *   - Çarşamba: TYT Biyoloji (2), AYT Edebiyat (2)
 *   - Perşembe: TYT Matematik (2), TYT Kimya (2)
 *   - Cuma: TYT Fizik (2), AYT Edebiyat (2 -> then AYT Coğrafya when finished)
 *   - Cumartesi: TYT-AYT Tarih (2), TYT Biyoloji (2 -> then Tekrar & Soru Çözümü when finished)
 *   - Pazar: Rest day (isRestDay: true)
 */

export function generateCalendarDays(playlistData, options = {}) {
  if (!playlistData || Object.keys(playlistData).length === 0) {
    return [];
  }

  // Deep clone video queues so callers can safely reuse data
  const queues = {};
  for (const [subj, info] of Object.entries(playlistData)) {
    queues[subj] = [...(info.videos || [])];
  }

  const weeks = [];
  let weekNum = 1;
  const maxWeeks = options.maxWeeks || 45;

  while (weekNum <= maxWeeks) {
    const days = [];

    const dayConfigs = [
      { name: 'Pazartesi', s1: 'TYT Türkçe', c1: 2, s2: 'TYT Coğrafya', c2: 2 },
      { name: 'Salı', s1: 'TYT Matematik', c1: 2, s2: 'TYT-AYT Tarih', c2: 2 },
      { name: 'Çarşamba', s1: 'TYT Biyoloji', c1: 2, s2: 'AYT Edebiyat', c2: 2 },
      { name: 'Perşembe', s1: 'TYT Matematik', c1: 2, s2: 'TYT Kimya', c2: 2 },
      {
        name: 'Cuma',
        s1: 'TYT Fizik',
        c1: 2,
        s2: () => (queues['AYT Edebiyat']?.length > 0 ? 'AYT Edebiyat' : 'AYT Coğrafya'),
        c2: 2
      },
      {
        name: 'Cumartesi',
        s1: 'TYT-AYT Tarih',
        c1: 2,
        s2: () => (queues['TYT Biyoloji']?.length > 0 ? 'TYT Biyoloji' : 'Tekrar & Soru Çözümü'),
        c2: 2
      },
      { name: 'Pazar', isRestDay: true }
    ];

    let hasAnyVideo = false;

    for (const rawCfg of dayConfigs) {
      if (rawCfg.isRestDay) {
        days.push({ dayName: rawCfg.name, isRestDay: true });
        continue;
      }

      const s1 = typeof rawCfg.s1 === 'function' ? rawCfg.s1() : rawCfg.s1;
      const s2 = typeof rawCfg.s2 === 'function' ? rawCfg.s2() : rawCfg.s2;
      const c1 = rawCfg.c1;
      const c2 = rawCfg.c2;

      const blocks = [];

      // Subject 1
      for (let i = 0; i < c1; i++) {
        const v = queues[s1]?.shift();
        if (v) {
          hasAnyVideo = true;
          blocks.push({
            blockNum: blocks.length + 1,
            subject: s1,
            video: v,
            instructor: v.instructor || playlistData[s1]?.metadata?.instructor || ''
          });
        } else {
          blocks.push({
            blockNum: blocks.length + 1,
            subject: s1,
            video: { title: 'Konu Tekrarı & Soru Çözümü', duration_min: 40, url: '' },
            instructor: ''
          });
        }
      }

      // Subject 2
      for (let i = 0; i < c2; i++) {
        const v = queues[s2]?.shift();
        if (v) {
          hasAnyVideo = true;
          blocks.push({
            blockNum: blocks.length + 1,
            subject: s2,
            video: v,
            instructor: v.instructor || playlistData[s2]?.metadata?.instructor || ''
          });
        } else {
          blocks.push({
            blockNum: blocks.length + 1,
            subject: s2,
            video: { title: 'Konu Tekrarı & Soru Çözümü', duration_min: 40, url: '' },
            instructor: ''
          });
        }
      }

      days.push({ dayName: rawCfg.name, isRestDay: false, blocks });
    }

    weeks.push({ weekNum, days });

    const remainingVideos = Object.values(queues).reduce((sum, q) => sum + q.length, 0);
    if (remainingVideos === 0) break;
    if (!hasAnyVideo && weekNum > 40) break;

    weekNum++;
  }

  return weeks;
}

/**
 * Shifts uncompleted videos forward while preserving historical completed days in the past.
 *
 * @param {Object} playlistData - 9 subject playlists with videos
 * @param {Object} completedVideos - Map of videoId -> boolean
 * @param {Array} [baseSchedule] - Baseline 42-week schedule
 * @returns {{ schedule: Array, nextActiveWeek: number, nextActiveDay: number }}
 */
export function shiftSchedulePreservingPast(playlistData, completedVideos = {}, baseSchedule = null) {
  if (!playlistData || Object.keys(playlistData).length === 0) {
    return { schedule: [], nextActiveWeek: 1, nextActiveDay: 0 };
  }

  const baseline = baseSchedule || generateCalendarDays(playlistData);
  const completedSet = new Set(Object.keys(completedVideos || {}));

  if (completedSet.size === 0) {
    return { schedule: JSON.parse(JSON.stringify(baseline)), nextActiveWeek: 1, nextActiveDay: 0 };
  }

  // Check if all videos are completed
  let totalCurriculumCount = 0;
  for (const info of Object.values(playlistData)) {
    totalCurriculumCount += (info.videos || []).length;
  }
  if (completedSet.size >= totalCurriculumCount) {
    return { schedule: [], nextActiveWeek: 1, nextActiveDay: 0 };
  }

  // Queues of UNCOMPLETED videos for each subject in strict original sequence
  const uncompletedQueues = {};
  for (const [subj, info] of Object.entries(playlistData)) {
    uncompletedQueues[subj] = (info?.videos || []).filter(v => !completedSet.has(v.id));
  }

  const newWeeks = [];
  let shiftStarted = false;
  let firstIncompleteWeek = 1;
  let firstIncompleteDay = 0;

  const dayConfigs = [
    { name: 'Pazartesi', s1: 'TYT Türkçe', c1: 2, s2: 'TYT Coğrafya', c2: 2 },
    { name: 'Salı', s1: 'TYT Matematik', c1: 2, s2: 'TYT-AYT Tarih', c2: 2 },
    { name: 'Çarşamba', s1: 'TYT Biyoloji', c1: 2, s2: 'AYT Edebiyat', c2: 2 },
    { name: 'Perşembe', s1: 'TYT Matematik', c1: 2, s2: 'TYT Kimya', c2: 2 },
    {
      name: 'Cuma',
      s1: 'TYT Fizik',
      c1: 2,
      s2: () => ((uncompletedQueues['AYT Edebiyat']?.length ?? 0) > 0 ? 'AYT Edebiyat' : 'AYT Coğrafya'),
      c2: 2
    },
    {
      name: 'Cumartesi',
      s1: 'TYT-AYT Tarih',
      c1: 2,
      s2: () => ((uncompletedQueues['TYT Biyoloji']?.length ?? 0) > 0 ? 'TYT Biyoloji' : 'Tekrar & Soru Çözümü'),
      c2: 2
    },
    { name: 'Pazar', isRestDay: true }
  ];

  for (let wIdx = 0; wIdx < baseline.length; wIdx++) {
    const baseWeek = baseline[wIdx];
    const weekNum = wIdx + 1;
    const newDays = [];

    for (let dIdx = 0; dIdx < 7; dIdx++) {
      const rawCfg = dayConfigs[dIdx];
      if (rawCfg.isRestDay || dIdx === 6) {
        newDays.push({ dayName: 'Pazar', isRestDay: true });
        continue;
      }

      const baseDay = baseWeek.days?.[dIdx];
      const baseBlocks = baseDay?.blocks || [];

      // Check if this day is fully completed in the past BEFORE shift has started
      if (!shiftStarted && baseBlocks.length > 0) {
        const hasUncompleted = baseBlocks.some(b => {
          const vid = b.video?.id;
          return vid && !vid.startsWith('tekrar-') && !completedSet.has(vid);
        });

        if (!hasUncompleted) {
          // 100% completed day in the past - preserve intact!
          newDays.push(JSON.parse(JSON.stringify(baseDay)));
          continue;
        } else {
          // First day that has an uncompleted video: shift starts here!
          shiftStarted = true;
          firstIncompleteWeek = weekNum;
          firstIncompleteDay = dIdx;
        }
      }

      // Populate blocks from uncompleted queues
      const s1 = typeof rawCfg.s1 === 'function' ? rawCfg.s1() : rawCfg.s1;
      const s2 = typeof rawCfg.s2 === 'function' ? rawCfg.s2() : rawCfg.s2;
      const c1 = rawCfg.c1 ?? 2;
      const c2 = rawCfg.c2 ?? 2;
      const blocks = [];

      for (let i = 0; i < c1; i++) {
        const v = uncompletedQueues[s1]?.shift();
        const bIdx = blocks.length;
        if (v) {
          const instructor = v.instructor || playlistData[s1]?.metadata?.instructor || '';
          blocks.push({ blockNum: bIdx + 1, subject: s1, video: v, instructor });
        } else {
          blocks.push({
            blockNum: bIdx + 1,
            subject: s1,
            video: {
              id: 'tekrar-' + s1.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + weekNum + '-d' + dIdx + '-b' + (bIdx + 1),
              title: 'Konu Tekrarı & Soru Çözümü',
              duration_min: 40,
              duration_sec: 2400,
              url: ''
            },
            instructor: ''
          });
        }
      }

      for (let i = 0; i < c2; i++) {
        const v = uncompletedQueues[s2]?.shift();
        const bIdx = blocks.length;
        if (v) {
          const instructor = v.instructor || playlistData[s2]?.metadata?.instructor || '';
          blocks.push({ blockNum: bIdx + 1, subject: s2, video: v, instructor });
        } else {
          blocks.push({
            blockNum: bIdx + 1,
            subject: s2,
            video: {
              id: 'tekrar-' + s2.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + weekNum + '-d' + dIdx + '-b' + (bIdx + 1),
              title: 'Konu Tekrarı & Soru Çözümü',
              duration_min: 40,
              duration_sec: 2400,
              url: ''
            },
            instructor: ''
          });
        }
      }

      newDays.push({ dayName: rawCfg.name, isRestDay: false, blocks });
    }

    newWeeks.push({ weekNum, days: newDays });
  }

  // If there are still remaining uncompleted videos after baseline weeks, append extra weeks
  let remainingCount = Object.values(uncompletedQueues).reduce((sum, q) => sum + q.length, 0);
  let extraWeekNum = newWeeks.length + 1;
  while (remainingCount > 0 && extraWeekNum <= 45) {
    const extraDays = [];
    for (let dIdx = 0; dIdx < 7; dIdx++) {
      const rawCfg = dayConfigs[dIdx];
      if (rawCfg.isRestDay || dIdx === 6) {
        extraDays.push({ dayName: 'Pazar', isRestDay: true });
        continue;
      }
      const s1 = typeof rawCfg.s1 === 'function' ? rawCfg.s1() : rawCfg.s1;
      const s2 = typeof rawCfg.s2 === 'function' ? rawCfg.s2() : rawCfg.s2;
      const blocks = [];
      for (let i = 0; i < (rawCfg.c1 ?? 2); i++) {
        const v = uncompletedQueues[s1]?.shift();
        const bIdx = blocks.length;
        if (v) {
          const instructor = v.instructor || playlistData[s1]?.metadata?.instructor || '';
          blocks.push({ blockNum: bIdx + 1, subject: s1, video: v, instructor });
        } else {
          blocks.push({
            blockNum: bIdx + 1,
            subject: s1,
            video: {
              id: 'tekrar-' + s1.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + extraWeekNum + '-d' + dIdx + '-b' + (bIdx + 1),
              title: 'Konu Tekrarı & Soru Çözümü',
              duration_min: 40,
              duration_sec: 2400,
              url: ''
            },
            instructor: ''
          });
        }
      }
      for (let i = 0; i < (rawCfg.c2 ?? 2); i++) {
        const v = uncompletedQueues[s2]?.shift();
        const bIdx = blocks.length;
        if (v) {
          const instructor = v.instructor || playlistData[s2]?.metadata?.instructor || '';
          blocks.push({ blockNum: bIdx + 1, subject: s2, video: v, instructor });
        } else {
          blocks.push({
            blockNum: bIdx + 1,
            subject: s2,
            video: {
              id: 'tekrar-' + s2.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + extraWeekNum + '-d' + dIdx + '-b' + (bIdx + 1),
              title: 'Konu Tekrarı & Soru Çözümü',
              duration_min: 40,
              duration_sec: 2400,
              url: ''
            },
            instructor: ''
          });
        }
      }
      extraDays.push({ dayName: rawCfg.name, isRestDay: false, blocks });
    }
    newWeeks.push({ weekNum: extraWeekNum, days: extraDays });
    remainingCount = Object.values(uncompletedQueues).reduce((sum, q) => sum + q.length, 0);
    extraWeekNum++;
  }

  // If all days up to the end were completed:
  if (!shiftStarted) {
    firstIncompleteWeek = baseline.length;
    firstIncompleteDay = 5;
  }

  return {
    schedule: newWeeks,
    nextActiveWeek: firstIncompleteWeek,
    nextActiveDay: firstIncompleteDay
  };
}
