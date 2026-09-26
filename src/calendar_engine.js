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

export const DEFAULT_WEEKLY_BLUEPRINT = {
  pazartesi: ['TYT Türkçe', 'TYT Türkçe', 'TYT Coğrafya', 'TYT Coğrafya'],
  sali: ['TYT Matematik', 'TYT Matematik', 'TYT-AYT Tarih', 'TYT-AYT Tarih'],
  carsamba: ['TYT Biyoloji', 'TYT Biyoloji', 'AYT Edebiyat', 'AYT Edebiyat'],
  persembe: ['TYT Matematik', 'TYT Matematik', 'TYT Kimya', 'TYT Kimya'],
  cuma: ['TYT Fizik', 'TYT Fizik', 'AYT Edebiyat', 'AYT Edebiyat'],
  cumartesi: ['TYT-AYT Tarih', 'TYT-AYT Tarih', 'TYT Biyoloji', 'TYT Biyoloji'],
  pazar: []
};

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const TURKISH_DAY_NAMES = [
  'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

const DAY_KEY_MAP = [
  'pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'
];

export function formatTurkishDate(date) {
  const day = date.getUTCDate();
  const month = TURKISH_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const dayName = TURKISH_DAY_NAMES[date.getUTCDay()];
  return `${day} ${month} ${year}, ${dayName}`;
}

export function toIsoDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(isoStr) {
  const parts = isoStr.split('-').map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

export function generateCalendarDays(playlistData, options = {}) {
  if (!playlistData || Object.keys(playlistData).length === 0) {
    return [];
  }

  // Deep clone video queues so callers can safely reuse data
  const queues = {};
  for (const [subj, info] of Object.entries(playlistData)) {
    queues[subj] = [...(info.videos || [])];
  }

  const blueprint = options.blueprint || DEFAULT_WEEKLY_BLUEPRINT;
  const weeks = [];
  let weekNum = 1;
  const maxWeeks = options.maxWeeks || 45;

  if (options.startDate) {
    // Date-anchored rolling schedule starting from real date
    let currentDate = parseIsoDate(options.startDate);
    let studyDayNumber = 1;

    // Ordered study templates from weekly blueprint (excluding Sunday)
    const standardStudyDayKeys = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'];
    const activeStudyKeys = standardStudyDayKeys.filter(k => Array.isArray(blueprint[k]) && blueprint[k].length > 0);

    while (weekNum <= maxWeeks) {
      const days = [];
      let hasAnyVideoThisWeek = false;

      for (let dIdx = 0; dIdx < 7; dIdx++) {
        const dayOfWeek = currentDate.getUTCDay();
        const dayName = TURKISH_DAY_NAMES[dayOfWeek];
        const dateIso = toIsoDate(currentDate);
        const dateFormatted = formatTurkishDate(currentDate);

        // Sunday is always a non-negotiable Rest Day (or if no active study keys defined)
        const isRestDay = (dayOfWeek === 0 || activeStudyKeys.length === 0);

        if (isRestDay) {
          days.push({
            dayName,
            dateIso,
            dateFormatted,
            isRestDay: true,
            blocks: []
          });
        } else {
          // Take the next study day template in the rolling cycle
          const templateIndex = (studyDayNumber - 1) % activeStudyKeys.length;
          const studyTemplateKey = activeStudyKeys[templateIndex];
          const slots = blueprint[studyTemplateKey] || [];
          const blocks = [];

          for (let bIdx = 0; bIdx < slots.length; bIdx++) {
            let subj = slots[bIdx];
            if (subj === 'AYT Edebiyat' && (!queues['AYT Edebiyat'] || queues['AYT Edebiyat'].length === 0) && (queues['AYT Coğrafya']?.length > 0)) {
              subj = 'AYT Coğrafya';
            }
            if (subj === 'TYT Biyoloji' && (!queues['TYT Biyoloji'] || queues['TYT Biyoloji'].length === 0)) {
              subj = 'Tekrar & Soru Çözümü';
            }

            const v = queues[subj]?.shift();
            if (v) {
              hasAnyVideoThisWeek = true;
              blocks.push({
                blockNum: bIdx + 1,
                subject: subj,
                video: v,
                instructor: v.instructor || playlistData[subj]?.metadata?.instructor || playlistData[subj]?.instructor || ''
              });
            } else {
              blocks.push({
                blockNum: bIdx + 1,
                subject: subj,
                video: {
                  title: 'Konu Tekrarı & Soru Çözümü',
                  duration_min: 40,
                  url: ''
                },
                instructor: ''
              });
            }
          }

          days.push({
            dayName,
            dateIso,
            dateFormatted,
            studyDayNumber,
            blueprintOriginDay: studyTemplateKey,
            isRestDay: false,
            blocks
          });
          studyDayNumber++;
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      weeks.push({ weekNum, days });

      const remainingVideos = Object.values(queues).reduce((sum, q) => sum + q.length, 0);
      if (remainingVideos === 0) break;
      if (!hasAnyVideoThisWeek && weekNum > 40) break;

      weekNum++;
    }

    return weeks;
  }

  // Baseline Monday-Sunday scheduling (for backward compatibility when no startDate is provided)
  const dayOrderKeys = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar'];
  const dayDisplayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  while (weekNum <= maxWeeks) {
    const days = [];
    let hasAnyVideo = false;

    for (let dIdx = 0; dIdx < 7; dIdx++) {
      const dayKey = dayOrderKeys[dIdx];
      const dayName = dayDisplayNames[dIdx];
      const slots = blueprint[dayKey] || [];

      if (dayKey === 'pazar' || slots.length === 0) {
        days.push({ dayName, isRestDay: true, blocks: [] });
        continue;
      }

      const blocks = [];
      for (let bIdx = 0; bIdx < slots.length; bIdx++) {
        let subj = slots[bIdx];
        if (subj === 'AYT Edebiyat' && (!queues['AYT Edebiyat'] || queues['AYT Edebiyat'].length === 0) && (queues['AYT Coğrafya']?.length > 0)) {
          subj = 'AYT Coğrafya';
        }
        if (subj === 'TYT Biyoloji' && (!queues['TYT Biyoloji'] || queues['TYT Biyoloji'].length === 0)) {
          subj = 'Tekrar & Soru Çözümü';
        }

        const v = queues[subj]?.shift();
        if (v) {
          hasAnyVideo = true;
          blocks.push({
            blockNum: bIdx + 1,
            subject: subj,
            video: v,
            instructor: v.instructor || playlistData[subj]?.metadata?.instructor || playlistData[subj]?.instructor || ''
          });
        } else {
          blocks.push({
            blockNum: bIdx + 1,
            subject: subj,
            video: {
              title: 'Konu Tekrarı & Soru Çözümü',
              duration_min: 40,
              url: ''
            },
            instructor: ''
          });
        }
      }

      days.push({ dayName, isRestDay: false, blocks });
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
 * Shifts uncompleted videos forward using date anchoring and the weekly blueprint.
 * Preserves strict FIFO chronological order for each subject.
 *
 * @param {Object} playlistData - 9 subject playlists
 * @param {Object} completedVideos - Map of videoId -> boolean
 * @param {Object} [options] - Options { startDate, blueprint }
 * @returns {{ schedule: Array, nextActiveWeek: number, nextActiveDay: number, projectedEndDate: string|null, completesBeforeYks: boolean }}
 */
export function shiftScheduleWithBlueprint(playlistData, completedVideos = {}, options = {}) {
  const blueprint = options.blueprint || DEFAULT_WEEKLY_BLUEPRINT;
  const startDateStr = options.startDate || toIsoDate(new Date());

  if (!playlistData || Object.keys(playlistData).length === 0) {
    return { schedule: [], nextActiveWeek: 1, nextActiveDay: 0, projectedEndDate: null, completesBeforeYks: true };
  }

  const completedSet = new Set(Object.keys(completedVideos || {}).filter(k => completedVideos[k]));

  // Build uncompleted FIFO queues for all subjects
  const uncompletedQueues = {};
  let totalCurriculumCount = 0;
  for (const [subj, info] of Object.entries(playlistData)) {
    const vids = info?.videos || [];
    totalCurriculumCount += vids.length;
    uncompletedQueues[subj] = vids.filter(v => !completedSet.has(v.id));
  }

  if (completedSet.size >= totalCurriculumCount) {
    return { schedule: [], nextActiveWeek: 1, nextActiveDay: 0, projectedEndDate: null, completesBeforeYks: true };
  }

  // Construct uncompleted data set for generateCalendarDays
  const uncompletedData = {};
  for (const [subj, info] of Object.entries(playlistData)) {
    uncompletedData[subj] = {
      ...info,
      videos: [...uncompletedQueues[subj]]
    };
  }

  const schedule = generateCalendarDays(uncompletedData, {
    startDate: startDateStr,
    blueprint
  });

  // Calculate projected completion date
  let projectedEndDate = null;
  for (const week of schedule) {
    for (const day of week.days) {
      const hasRealVideo = (day.blocks || []).some(b => b.video?.id && !b.video.id.startsWith('tekrar-'));
      if (hasRealVideo && day.dateIso) {
        projectedEndDate = day.dateIso;
      }
    }
  }

  const completesBeforeYks = projectedEndDate ? (new Date(projectedEndDate) <= new Date('2027-06-19')) : true;

  return {
    schedule,
    nextActiveWeek: 1,
    nextActiveDay: 0,
    projectedEndDate,
    completesBeforeYks
  };
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
  let firstIncompleteWeek = 1;
  let firstIncompleteDay = 0;
  let firstFound = false;

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

      const s1 = typeof rawCfg.s1 === 'function' ? rawCfg.s1() : rawCfg.s1;
      const s2 = typeof rawCfg.s2 === 'function' ? rawCfg.s2() : rawCfg.s2;
      const c1 = rawCfg.c1 ?? 2;
      const c2 = rawCfg.c2 ?? 2;
      const blocks = [];

      for (let bIdx = 0; bIdx < 4; bIdx++) {
        const baseBlock = baseBlocks[bIdx];
        const vid = baseBlock?.video?.id;
        const isCompleted = vid && !vid.startsWith('tekrar-') && completedSet.has(vid);

        if (isCompleted) {
          // Preserve completed block anchored at this day and slot
          blocks.push(JSON.parse(JSON.stringify(baseBlock)));
        } else {
          // Fill uncompleted slot from subject queue
          const targetSubj = (bIdx < c1) ? s1 : s2;
          const nextV = uncompletedQueues[targetSubj]?.shift();
          if (nextV) {
            const instructor = nextV.instructor || playlistData[targetSubj]?.metadata?.instructor || playlistData[targetSubj]?.instructor || '';
            blocks.push({
              blockNum: bIdx + 1,
              subject: targetSubj,
              video: nextV,
              instructor
            });
          } else {
            blocks.push({
              blockNum: bIdx + 1,
              subject: targetSubj,
              video: {
                id: `tekrar-${targetSubj.replace(/[^a-zA-Z0-9]/g, '_')}-w${weekNum}-d${dIdx}-b${bIdx + 1}`,
                title: 'Konu Tekrarı & Soru Çözümü',
                duration_min: 40,
                duration_sec: 2400,
                url: ''
              },
              instructor: ''
            });
          }
        }
      }

      if (!firstFound) {
        const hasIncomplete = blocks.some(b => {
          const vid = b.video?.id;
          return vid && !vid.startsWith('tekrar-') && !completedSet.has(vid);
        });
        if (hasIncomplete) {
          firstIncompleteWeek = weekNum;
          firstIncompleteDay = dIdx;
          firstFound = true;
        }
      }

      newDays.push({ dayName: rawCfg.name, isRestDay: false, blocks });
    }

    newWeeks.push({ weekNum, days: newDays });
  }

  // If there are still remaining uncompleted videos after baseline weeks, append extra weeks
  let remainingCount = Object.values(uncompletedQueues).reduce((sum, q) => sum + q.length, 0);
  let extraWeekNum = newWeeks.length + 1;
  while (remainingCount > 0 && extraWeekNum <= 52) {
    const extraDays = [];
    for (let dIdx = 0; dIdx < 7; dIdx++) {
      const rawCfg = dayConfigs[dIdx];
      if (rawCfg.isRestDay || dIdx === 6) {
        extraDays.push({ dayName: 'Pazar', isRestDay: true });
        continue;
      }
      const s1 = typeof rawCfg.s1 === 'function' ? rawCfg.s1() : rawCfg.s1;
      const s2 = typeof rawCfg.s2 === 'function' ? rawCfg.s2() : rawCfg.s2;
      const c1 = rawCfg.c1 ?? 2;
      const c2 = rawCfg.c2 ?? 2;
      const blocks = [];
      for (let i = 0; i < c1; i++) {
        const v = uncompletedQueues[s1]?.shift();
        const bIdx = blocks.length;
        if (v) {
          const instructor = v.instructor || playlistData[s1]?.metadata?.instructor || playlistData[s1]?.instructor || '';
          blocks.push({ blockNum: bIdx + 1, subject: s1, video: v, instructor });
        } else {
          blocks.push({
            blockNum: bIdx + 1,
            subject: s1,
            video: {
              id: `tekrar-${s1.replace(/[^a-zA-Z0-9]/g, '_')}-w${extraWeekNum}-d${dIdx}-b${bIdx + 1}`,
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
          const instructor = v.instructor || playlistData[s2]?.metadata?.instructor || playlistData[s2]?.instructor || '';
          blocks.push({ blockNum: bIdx + 1, subject: s2, video: v, instructor });
        } else {
          blocks.push({
            blockNum: bIdx + 1,
            subject: s2,
            video: {
              id: `tekrar-${s2.replace(/[^a-zA-Z0-9]/g, '_')}-w${extraWeekNum}-d${dIdx}-b${bIdx + 1}`,
              title: 'Konu Tekrarı & Soru Çözümü',
              duration_min: 40,
              duration_sec: 2400,
              url: ''
            },
            instructor: ''
          });
        }
      }

      if (!firstFound) {
        const hasIncomplete = blocks.some(b => {
          const vid = b.video?.id;
          return vid && !vid.startsWith('tekrar-') && !completedSet.has(vid);
        });
        if (hasIncomplete) {
          firstIncompleteWeek = extraWeekNum;
          firstIncompleteDay = dIdx;
          firstFound = true;
        }
      }

      extraDays.push({ dayName: rawCfg.name, isRestDay: false, blocks });
    }
    newWeeks.push({ weekNum: extraWeekNum, days: extraDays });
    remainingCount = Object.values(uncompletedQueues).reduce((sum, q) => sum + q.length, 0);
    extraWeekNum++;
  }

  return {
    schedule: newWeeks,
    nextActiveWeek: firstIncompleteWeek,
    nextActiveDay: firstIncompleteDay
  };
}
