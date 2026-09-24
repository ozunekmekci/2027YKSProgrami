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
