/**
 * Curriculum Milestone Projection Engine
 * Dynamically computes start/end weeks, calendar dates, completion percentages,
 * and milestone status for each pedagogical unit and course across the YKS timeline.
 */

import type {
  CurriculumUnitDef,
  UnitProjection,
  SubjectProjection,
  CurriculumProjectionReport,
  WeekSchedule
} from './types.js';

interface VideoScheduleEntry {
  weekNum: number;
  dateIso: string;
  dateFormatted: string;
  videoIndex: number;
  videoId: string;
}

export function calculateCurriculumProjection(
  calendarWeeks: WeekSchedule[],
  unitsData: Record<string, CurriculumUnitDef[]>,
  completedVideos: Record<string, boolean> = {},
  currentWeekNum: number = 1
): CurriculumProjectionReport {
  if (!Array.isArray(calendarWeeks) || calendarWeeks.length === 0 || !unitsData) {
    return {
      subjects: [],
      totalUnits: 0,
      completedUnits: 0,
      activeUnits: [],
      projectedCompletionDate: '',
      projectedCompletionDateIso: '',
      completesBeforeYks: true,
      weeksBeforeYks: 0
    };
  }

  // 1. Build an index of all scheduled videos: subject -> array of VideoScheduleEntry
  const scheduledVideosBySubject: Record<string, VideoScheduleEntry[]> = {};

  for (const week of calendarWeeks) {
    const wNum = week.weekNum;
    for (const day of (week.days || [])) {
      if (day.isRestDay || !day.blocks) continue;

      const dateIso = day.dateIso || '';
      const dateFormatted = day.dateFormatted || '';

      for (const block of day.blocks) {
        if (!block || !block.subject || !block.video) continue;
        const subj = block.subject;
        const v = block.video;
        const vIndex = v.index || (v as any).order || 0;
        const vId = v.id || '';

        // Ignore synthetic filler videos
        if (vId.startsWith('tekrar-')) continue;

        if (!scheduledVideosBySubject[subj]) {
          scheduledVideosBySubject[subj] = [];
        }

        scheduledVideosBySubject[subj].push({
          weekNum: wNum,
          dateIso,
          dateFormatted,
          videoIndex: vIndex,
          videoId: vId
        });
      }
    }
  }

  // Sort scheduled videos for each subject by videoIndex ascending
  for (const subj of Object.keys(scheduledVideosBySubject)) {
    scheduledVideosBySubject[subj].sort((a, b) => a.videoIndex - b.videoIndex);
  }

  const subjects: SubjectProjection[] = [];
  let totalUnitsCount = 0;
  let completedUnitsCount = 0;
  const activeUnits: UnitProjection[] = [];

  let overallMaxDateIso = '';
  let overallMaxDateFormatted = '';

  for (const [subj, units] of Object.entries(unitsData)) {
    const scheduledList = scheduledVideosBySubject[subj] || [];
    const unitProjections: UnitProjection[] = [];

    let subjTotalVideos = 0;
    let subjCompletedVideos = 0;
    let subjMinWeek = Infinity;
    let subjMaxWeek = -Infinity;
    let subjStartDate = '';
    let subjEndDate = '';

    for (const u of units) {
      totalUnitsCount++;
      const totalVideosInUnit = u.endVideo - u.startVideo + 1;
      subjTotalVideos += totalVideosInUnit;

      // Find all scheduled entries belonging to this unit (startVideo <= index <= endVideo)
      const matchingEntries = scheduledList.filter(
        item => item.videoIndex >= u.startVideo && item.videoIndex <= u.endVideo
      );

      // Count completed videos in this unit
      let unitCompletedCount = 0;
      for (const entry of matchingEntries) {
        if (completedVideos[entry.videoId]) {
          unitCompletedCount++;
        }
      }
      subjCompletedVideos += unitCompletedCount;

      let startWeek = 1;
      let endWeek = 1;
      let startDateIso = '';
      let endDateIso = '';
      let startDate = '';
      let endDate = '';

      if (matchingEntries.length > 0) {
        startWeek = matchingEntries[0].weekNum;
        endWeek = matchingEntries[matchingEntries.length - 1].weekNum;
        startDateIso = matchingEntries[0].dateIso;
        endDateIso = matchingEntries[matchingEntries.length - 1].dateIso;
        startDate = matchingEntries[0].dateFormatted;
        endDate = matchingEntries[matchingEntries.length - 1].dateFormatted;

        if (startWeek < subjMinWeek) {
          subjMinWeek = startWeek;
          subjStartDate = startDate;
        }
        if (endWeek > subjMaxWeek) {
          subjMaxWeek = endWeek;
          subjEndDate = endDate;
        }

        if (endDateIso > overallMaxDateIso) {
          overallMaxDateIso = endDateIso;
          overallMaxDateFormatted = endDate;
        }
      }

      const progressPercent = totalVideosInUnit > 0
        ? Math.round((unitCompletedCount / totalVideosInUnit) * 100)
        : 0;

      let status: 'completed' | 'in_progress' | 'upcoming' = 'upcoming';
      if (unitCompletedCount >= totalVideosInUnit && totalVideosInUnit > 0) {
        status = 'completed';
        completedUnitsCount++;
      } else if (
        unitCompletedCount > 0 ||
        (currentWeekNum >= startWeek && currentWeekNum <= endWeek)
      ) {
        status = 'in_progress';
      }

      const unitProj: UnitProjection = {
        id: u.id,
        title: u.title,
        subject: subj,
        startVideo: u.startVideo,
        endVideo: u.endVideo,
        totalVideos: totalVideosInUnit,
        startWeek,
        endWeek,
        startDate,
        endDate,
        startDateIso,
        endDateIso,
        completedVideos: unitCompletedCount,
        progressPercent,
        status
      };

      unitProjections.push(unitProj);

      if (status === 'in_progress') {
        activeUnits.push(unitProj);
      }
    }

    const subjProgressPct = subjTotalVideos > 0
      ? Math.round((subjCompletedVideos / subjTotalVideos) * 100)
      : 0;

    subjects.push({
      subject: subj,
      startWeek: subjMinWeek === Infinity ? 1 : subjMinWeek,
      endWeek: subjMaxWeek === -Infinity ? 1 : subjMaxWeek,
      startDate: subjStartDate,
      endDate: subjEndDate,
      totalVideos: subjTotalVideos,
      completedVideos: subjCompletedVideos,
      progressPercent: subjProgressPct,
      units: unitProjections
    });
  }

  // Calculate difference from YKS target date (19 June 2027)
  const yksTargetIso = '2027-06-19';
  const completesBeforeYks = overallMaxDateIso ? overallMaxDateIso <= yksTargetIso : true;

  let weeksBeforeYks = 0;
  if (overallMaxDateIso) {
    const diffMs = new Date(yksTargetIso).getTime() - new Date(overallMaxDateIso).getTime();
    weeksBeforeYks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  }

  return {
    subjects,
    totalUnits: totalUnitsCount,
    completedUnits: completedUnitsCount,
    activeUnits,
    projectedCompletionDate: overallMaxDateFormatted,
    projectedCompletionDateIso: overallMaxDateIso,
    completesBeforeYks,
    weeksBeforeYks
  };
}
