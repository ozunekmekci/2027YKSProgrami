/**
 * YKS 2027 Koçu - Core Domain Types and Data Contracts
 * Strict TypeScript models for video curriculum, calendar scheduling,
 * shift engine, timer state, and backup/restore payloads.
 */

export interface Video {
  id: string;
  title: string;
  duration_min: number;
  duration_sec: number;
  url: string;
  index?: number;
  order?: number;
}

export interface PlaylistInfo {
  title: string;
  instructor: string;
  channel: string;
  url: string;
  count: number;
  duration_hours: number;
  videos: Video[];
}

export type PlaylistsData = Record<string, PlaylistInfo>;

export interface StudyBlock {
  blockNum: number;
  subject: string;
  instructor: string;
  video: Video;
}

export interface DaySchedule {
  dayName: string;
  isRestDay?: boolean;
  blocks?: StudyBlock[];
}

export interface WeekSchedule {
  weekNum: number;
  days: DaySchedule[];
}

export interface BackupPayload {
  appName: string;
  version: string;
  exportedAt: string;
  completedCount: number;
  completedVideos: Record<string, boolean>;
  activeWeek?: number;
  activeDay?: number;
}

export interface TimerState {
  duration: number;
  remaining: number;
  running: boolean;
  targetEndTime: number;
}

export interface CourseProgress {
  subject: string;
  totalVideos: number;
  completedVideos: number;
  progressPct: number;
}

export interface StoredProgress {
  completedVideos: Record<string, boolean>;
  activeWeek: number;
  activeDay: number;
  shiftedSchedule?: WeekSchedule[] | null;
}

export interface TimerCallbacks {
  onTick?: (remainingSec: number) => void;
  onComplete?: () => void;
}

export interface BreakTimer {
  start: () => void;
  pause: () => void;
  reset: () => void;
  getState: () => TimerState;
}
