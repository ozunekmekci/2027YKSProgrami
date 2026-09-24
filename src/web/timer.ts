/**
 * YKS 2027 Koçu - Break Timer & Audio Chime Engine
 * Accurate timestamp-based countdown with background-tab drift protection,
 * pause/resume/reset mechanics, and dual-tone Web Audio chimes.
 */

import type { TimerCallbacks, BreakTimer, TimerState } from './types.js';

let globalAudioCtx: AudioContext | null = null;

/**
 * Initializes and warms up the AudioContext safely.
 * Returns AudioContext if available, or null if unsupported.
 */
export function initAudioContext(): AudioContext | null {
  try {
    const AudioCtx = (typeof window !== 'undefined' && ((window as any).AudioContext || (window as any).webkitAudioContext))
      || (typeof globalThis !== 'undefined' && (globalThis as any).AudioContext);

    if (!globalAudioCtx && AudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays a pleasant dual-tone chime:
 * - D5 (587.33 Hz) for 0.18s
 * - Followed by A5 (880.0 Hz) for 0.4s
 * Uses soft exponential gain fade-outs to eliminate audio clicks and pops.
 */
export function playChime(audioContext?: AudioContext): void {
  try {
    const ctx = audioContext || initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime || 0;

    // Tone 1: D5 (587.33 Hz) for 0.18s
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Tone 2: A5 (880.0 Hz) for 0.4s (starting at now + 0.18s)
    const tone2Start = now + 0.18;
    const tone2End = tone2Start + 0.4;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, tone2Start);
    gain2.gain.setValueAtTime(0.3, tone2Start);
    gain2.gain.exponentialRampToValueAtTime(0.0001, tone2End);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(tone2Start);
    osc2.stop(tone2End);
  } catch {
    // Web Audio unsupported or permission blocked - fail gracefully
  }
}

/**
 * Creates a high-precision break timer resilient to tab background throttling.
 */
export function createBreakTimer(
  durationSeconds: number,
  callbacks: TimerCallbacks = {}
): BreakTimer {
  let duration = Math.max(0, durationSeconds);
  let remaining = duration;
  let running = false;
  let targetEndTime = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function stopInterval(): void {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function start(): void {
    if (running) return;
    if (remaining <= 0) {
      remaining = duration;
    }
    running = true;
    targetEndTime = Date.now() + remaining * 1000;

    stopInterval();
    intervalId = setInterval(() => {
      const now = Date.now();
      remaining = Math.max(0, Math.round((targetEndTime - now) / 1000));
      callbacks.onTick?.(remaining);

      if (remaining <= 0) {
        stopInterval();
        running = false;
        targetEndTime = 0;
        callbacks.onComplete?.();
      }
    }, 100);
  }

  function pause(): void {
    if (!running) return;
    stopInterval();
    running = false;
    const now = Date.now();
    remaining = Math.max(0, Math.round((targetEndTime - now) / 1000));
    targetEndTime = 0;
  }

  function resume(): void {
    if (running) return;
    if (remaining <= 0) return;
    start();
  }

  function reset(durationSec?: number): void {
    stopInterval();
    running = false;
    if (typeof durationSec === 'number' && durationSec >= 0) {
      duration = durationSec;
    }
    remaining = duration;
    targetEndTime = 0;
  }

  function getState(): TimerState {
    let currentRemaining = remaining;
    if (running) {
      const now = Date.now();
      currentRemaining = Math.max(0, Math.round((targetEndTime - now) / 1000));
    }
    return {
      duration,
      remaining: currentRemaining,
      running,
      targetEndTime
    };
  }

  return {
    start,
    pause,
    resume,
    reset,
    getState,
    playChime
  };
}
