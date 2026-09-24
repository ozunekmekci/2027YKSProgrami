/**
 * YKS 2027 Koçu - Storage & Progress State Management Module
 * Manages persistence across browser storage and in-memory fallbacks,
 * validates JSON backup files, and computes course completion analytics.
 */

import type { StoredProgress, BackupPayload, CourseProgress, PlaylistsData, WeekSchedule } from './types.js';

export class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

const defaultMemoryStorage = new MemoryStorage();

function getEffectiveStorage(storage?: Storage): Storage {
  if (storage) {
    return storage;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined' && localStorage) {
      return localStorage;
    }
  } catch {
    // If localStorage is blocked (e.g. sandboxed iframe or disabled cookies)
  }
  return defaultMemoryStorage;
}

/**
 * Loads stored user progress from storage with fallback defaults.
 */
export function loadProgress(storage?: Storage): StoredProgress {
  const s = getEffectiveStorage(storage);
  let completedVideos: Record<string, boolean> = {};
  let activeWeek = 1;
  let activeDay = 0;
  let shiftedSchedule: WeekSchedule[] | null = null;

  try {
    const rawVideos = s.getItem('yks_completed_videos');
    if (rawVideos) {
      const parsed = JSON.parse(rawVideos);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        completedVideos = parsed;
      }
    }
  } catch {
    // ignore parse error
  }

  try {
    const rawWeek = s.getItem('yks_active_week');
    if (rawWeek !== null) {
      const parsed = parseInt(rawWeek, 10);
      if (!isNaN(parsed) && parsed > 0) {
        activeWeek = parsed;
      }
    }
  } catch {
    // ignore parse error
  }

  try {
    const rawDay = s.getItem('yks_active_day');
    if (rawDay !== null) {
      const parsed = parseInt(rawDay, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        activeDay = parsed;
      }
    }
  } catch {
    // ignore parse error
  }

  try {
    const rawShifted = s.getItem('yks_shifted_schedule');
    if (rawShifted) {
      const parsed = JSON.parse(rawShifted);
      if (Array.isArray(parsed)) {
        shiftedSchedule = parsed;
      }
    }
  } catch {
    // ignore parse error
  }

  return {
    completedVideos,
    activeWeek,
    activeDay,
    shiftedSchedule
  };
}

/**
 * Persists partial progress updates to storage.
 */
export function saveProgress(data: Partial<StoredProgress>, storage?: Storage): void {
  const s = getEffectiveStorage(storage);
  try {
    if (data.completedVideos !== undefined) {
      s.setItem('yks_completed_videos', JSON.stringify(data.completedVideos));
    }
    if (data.activeWeek !== undefined) {
      s.setItem('yks_active_week', String(data.activeWeek));
    }
    if (data.activeDay !== undefined) {
      s.setItem('yks_active_day', String(data.activeDay));
    }
    if (data.shiftedSchedule !== undefined) {
      if (data.shiftedSchedule === null) {
        s.removeItem('yks_shifted_schedule');
      } else {
        s.setItem('yks_shifted_schedule', JSON.stringify(data.shiftedSchedule));
      }
    }
  } catch (err) {
    console.warn('saveProgress error:', err);
  }
}

/**
 * Formats a schema-compliant backup payload.
 */
export function exportBackup(progress: StoredProgress): BackupPayload {
  const completedVideos = progress.completedVideos || {};
  const completedCount = Object.keys(completedVideos).filter(k => Boolean(completedVideos[k])).length;

  return {
    appName: 'YKS 2027 Koçu',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    completedCount,
    completedVideos: { ...completedVideos },
    activeWeek: progress.activeWeek,
    activeDay: progress.activeDay
  };
}

/**
 * Validates untrusted input data as a valid BackupPayload.
 * Returns the typed payload if valid, or null if schema constraints fail.
 */
export function validateBackup(data: unknown): BackupPayload | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }

  const d = data as Record<string, unknown>;

  if (typeof d.appName !== 'string' || d.appName.trim() === '') {
    return null;
  }

  if (typeof d.version !== 'string' || d.version.trim() === '') {
    return null;
  }

  if (!d.completedVideos || typeof d.completedVideos !== 'object' || Array.isArray(d.completedVideos)) {
    return null;
  }

  const completedMap: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(d.completedVideos as Record<string, unknown>)) {
    if (typeof value === 'boolean') {
      completedMap[key] = value;
    } else if (value === 1 || value === 'true') {
      completedMap[key] = true;
    } else {
      return null;
    }
  }

  const payload: BackupPayload = {
    appName: d.appName,
    version: d.version,
    exportedAt: typeof d.exportedAt === 'string' ? d.exportedAt : new Date().toISOString(),
    completedCount: typeof d.completedCount === 'number'
      ? d.completedCount
      : Object.keys(completedMap).filter(k => completedMap[k]).length,
    completedVideos: completedMap
  };

  if (typeof d.activeWeek === 'number' && !isNaN(d.activeWeek) && d.activeWeek > 0) {
    payload.activeWeek = d.activeWeek;
  }
  if (typeof d.activeDay === 'number' && !isNaN(d.activeDay) && d.activeDay >= 0) {
    payload.activeDay = d.activeDay;
  }

  return payload;
}

/**
 * Calculates completion percentage and counts for all courses.
 */
export function calculateCourseProgress(
  playlists: PlaylistsData,
  completedVideos: Record<string, boolean> = {}
): CourseProgress[] {
  const result: CourseProgress[] = [];

  for (const [subject, info] of Object.entries(playlists)) {
    const videos = info?.videos || [];
    const totalVideos = videos.length;
    let completedCount = 0;

    for (const v of videos) {
      if (completedVideos[v.id]) {
        completedCount++;
      }
    }

    const progressPct = totalVideos > 0
      ? Number(((completedCount / totalVideos) * 100).toFixed(1))
      : 0;

    result.push({
      subject,
      totalVideos,
      completedVideos: completedCount,
      progressPct
    });
  }

  return result;
}
