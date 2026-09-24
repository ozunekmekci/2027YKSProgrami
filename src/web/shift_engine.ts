/**
 * YKS 2027 Koçu - Stress-Free Shift Engine
 * Chronologically distributes remaining curriculum videos across weeks.
 */

import type { PlaylistsData, WeekSchedule, StudyBlock, DaySchedule, Video } from './types.js';

interface DayConfig {
  name: string;
  isRestDay?: boolean;
  s1?: string | (() => string);
  c1?: number;
  s2?: string | (() => string);
  c2?: number;
}

/**
 * Shifts uncompleted curriculum videos forward into a stress-free schedule.
 * - Filters uncompleted videos in strict original sequence.
 * - Re-distributes sequentially into 4-blocks-per-day weeks (Monday to Saturday, Sunday rest).
 * - Follows canonical weekday subject mapping with dynamic fallback transitions.
 * - Generates deterministic synthetic IDs for filler/review blocks.
 * - Stops as soon as all uncompleted videos are distributed (or returns empty array if all completed).
 */
export function shiftSchedule(
  rawPlaylists: PlaylistsData,
  completedVideos: Record<string, boolean> = {}
): WeekSchedule[] {
  if (!rawPlaylists || Object.keys(rawPlaylists).length === 0) {
    return [];
  }

  // Filter uncompleted videos for each subject in strict original chronological sequence
  const queues: Record<string, Video[]> = {};
  let totalRemaining = 0;

  for (const [subj, info] of Object.entries(rawPlaylists)) {
    const uncompleted = (info?.videos || []).filter(v => !completedVideos[v.id]);
    queues[subj] = [...uncompleted];
    totalRemaining += uncompleted.length;
  }

  // When all videos completed, return empty array
  if (totalRemaining === 0) {
    return [];
  }

  const weeks: WeekSchedule[] = [];
  let weekNum = 1;
  const maxWeeks = 45;

  while (weekNum <= maxWeeks) {
    const days: DaySchedule[] = [];

    const dayConfigs: DayConfig[] = [
      { name: 'Pazartesi', s1: 'TYT Türkçe', c1: 2, s2: 'TYT Coğrafya', c2: 2 },
      { name: 'Salı', s1: 'TYT Matematik', c1: 2, s2: 'TYT-AYT Tarih', c2: 2 },
      { name: 'Çarşamba', s1: 'TYT Biyoloji', c1: 2, s2: 'AYT Edebiyat', c2: 2 },
      { name: 'Perşembe', s1: 'TYT Matematik', c1: 2, s2: 'TYT Kimya', c2: 2 },
      {
        name: 'Cuma',
        s1: 'TYT Fizik',
        c1: 2,
        s2: () => ((queues['AYT Edebiyat']?.length ?? 0) > 0 ? 'AYT Edebiyat' : 'AYT Coğrafya'),
        c2: 2
      },
      {
        name: 'Cumartesi',
        s1: 'TYT-AYT Tarih',
        c1: 2,
        s2: () => ((queues['TYT Biyoloji']?.length ?? 0) > 0 ? 'TYT Biyoloji' : 'Tekrar & Soru Çözümü'),
        c2: 2
      },
      { name: 'Pazar', isRestDay: true }
    ];

    let hasAnyVideo = false;

    for (let dayIdx = 0; dayIdx < dayConfigs.length; dayIdx++) {
      const rawCfg = dayConfigs[dayIdx];

      if (rawCfg.isRestDay) {
        days.push({ dayName: 'Pazar', isRestDay: true });
        continue;
      }

      const s1 = typeof rawCfg.s1 === 'function' ? rawCfg.s1() : rawCfg.s1!;
      const s2 = typeof rawCfg.s2 === 'function' ? rawCfg.s2() : rawCfg.s2!;
      const c1 = rawCfg.c1 ?? 2;
      const c2 = rawCfg.c2 ?? 2;

      const blocks: StudyBlock[] = [];

      // Subject 1
      for (let i = 0; i < c1; i++) {
        const v = queues[s1]?.shift();
        const blockIdx = blocks.length;
        if (v) {
          hasAnyVideo = true;
          const instructor = (v as any).instructor || rawPlaylists[s1]?.instructor || (rawPlaylists[s1] as any)?.metadata?.instructor || '';
          blocks.push({
            blockNum: blockIdx + 1,
            subject: s1,
            video: v,
            instructor
          });
        } else {
          blocks.push({
            blockNum: blockIdx + 1,
            subject: s1,
            video: {
              id: 'tekrar-' + s1.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + weekNum + '-d' + dayIdx + '-b' + (blockIdx + 1),
              title: 'Konu Tekrarı & Soru Çözümü',
              duration_min: 40,
              duration_sec: 2400,
              url: ''
            },
            instructor: ''
          });
        }
      }

      // Subject 2
      for (let i = 0; i < c2; i++) {
        const v = queues[s2]?.shift();
        const blockIdx = blocks.length;
        if (v) {
          hasAnyVideo = true;
          const instructor = (v as any).instructor || rawPlaylists[s2]?.instructor || (rawPlaylists[s2] as any)?.metadata?.instructor || '';
          blocks.push({
            blockNum: blockIdx + 1,
            subject: s2,
            video: v,
            instructor
          });
        } else {
          blocks.push({
            blockNum: blockIdx + 1,
            subject: s2,
            video: {
              id: 'tekrar-' + s2.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + weekNum + '-d' + dayIdx + '-b' + (blockIdx + 1),
              title: 'Konu Tekrarı & Soru Çözümü',
              duration_min: 40,
              duration_sec: 2400,
              url: ''
            },
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
