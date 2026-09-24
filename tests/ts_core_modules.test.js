import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { shiftSchedule } from '../src/web/shift_engine.ts';
import { createBreakTimer, playChime, initAudioContext } from '../src/web/timer.ts';
import {
  loadProgress,
  saveProgress,
  exportBackup,
  validateBackup,
  calculateCourseProgress,
  MemoryStorage
} from '../src/web/storage.ts';

// ---------------------------------------------------------------------------
// 1. TypeScript Strict Compilation Verification
// ---------------------------------------------------------------------------
test('all 3 core TypeScript engine modules compile cleanly via npx tsc --noEmit', () => {
  let output = '';
  try {
    output = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    assert.fail(`tsc --noEmit failed: ${err.message}\nOutput: ${err.stdout || ''}\n${err.stderr || ''}`);
  }
  assert.equal(output.trim(), '', 'Strict TypeScript compilation must produce zero errors');
});

// ---------------------------------------------------------------------------
// 2. Shift Engine (shiftSchedule)
// ---------------------------------------------------------------------------
test('shiftSchedule: when 0 videos completed, produces 42 weeks matching original distribution', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const weeks = shiftSchedule(data, {});

  assert.equal(weeks.length, 42, 'Schedule must span exactly 42 weeks when 0 videos are completed');

  const scheduledVideoIds = new Set();
  const subjectIndices = {};
  let realCurriculumCount = 0;
  let fillerCount = 0;

  for (let wIdx = 0; wIdx < weeks.length; wIdx++) {
    const week = weeks[wIdx];
    assert.equal(week.weekNum, wIdx + 1, `Week number must be ${wIdx + 1}`);
    assert.equal(week.days.length, 7, `Week ${week.weekNum} must have 7 days`);

    for (let dIdx = 0; dIdx < 7; dIdx++) {
      const day = week.days[dIdx];
      if (day.dayName === 'Pazar') {
        assert.equal(day.isRestDay, true, `Pazar in week ${week.weekNum} must be a rest day`);
        assert.ok(!day.blocks || day.blocks.length === 0, 'Sunday must have no study blocks');
      } else {
        assert.equal(day.isRestDay, false);
        assert.equal(day.blocks?.length, 4, `Weekday ${day.dayName} must have 4 study blocks`);

        for (let bIdx = 0; bIdx < 4; bIdx++) {
          const block = day.blocks[bIdx];
          assert.equal(block.blockNum, bIdx + 1);
          assert.ok(block.subject, `Block ${bIdx + 1} must have a subject`);
          assert.ok(block.video, `Block ${bIdx + 1} must have a video`);

          if (block.video.id.startsWith('tekrar-')) {
            fillerCount++;
            // Verify synthetic ID format
            const expectedId = 'tekrar-' + block.subject.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + week.weekNum + '-d' + dIdx + '-b' + (bIdx + 1);
            assert.equal(block.video.id, expectedId, `Synthetic filler ID mismatch`);
            assert.equal(block.video.title, 'Konu Tekrarı & Soru Çözümü');
            assert.equal(block.video.duration_min, 40);
          } else {
            realCurriculumCount++;
            assert.ok(!scheduledVideoIds.has(block.video.id), `Duplicate video ${block.video.id} in schedule`);
            scheduledVideoIds.add(block.video.id);

            // Chronological sequence verification
            const lastIdx = subjectIndices[block.subject] || 0;
            assert.equal(block.video.index, lastIdx + 1, `Subject ${block.subject} sequence broken: expected ${lastIdx + 1}, got ${block.video.index}`);
            subjectIndices[block.subject] = block.video.index;
          }
        }
      }
    }
  }

  assert.equal(realCurriculumCount, 766, 'All 766 curriculum videos must be scheduled');
  assert.equal(scheduledVideoIds.size, 766, 'All 766 scheduled videos must be unique');
  assert.ok(fillerCount > 0, 'Filler blocks must be scheduled once individual subject queues exhaust');
});

test('shiftSchedule: when all videos completed, returns empty array', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const allCompleted = {};
  for (const info of Object.values(data)) {
    for (const v of info.videos || []) {
      allCompleted[v.id] = true;
    }
  }

  const weeks = shiftSchedule(data, allCompleted);
  assert.deepEqual(weeks, [], 'shiftSchedule must return empty array when all curriculum videos are done');
});

test('shiftSchedule: when partial videos completed, shifts uncompleted videos forward without skipping or dropping', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  
  // Complete the first 25 videos of TYT Türkçe and first 10 of TYT Matematik
  const completed = {};
  const completedIds = new Set();
  
  (data['TYT Türkçe'].videos || []).slice(0, 25).forEach(v => {
    completed[v.id] = true;
    completedIds.add(v.id);
  });
  (data['TYT Matematik'].videos || []).slice(0, 10).forEach(v => {
    completed[v.id] = true;
    completedIds.add(v.id);
  });

  const totalExpectedRemaining = 766 - completedIds.size;
  const shiftedWeeks = shiftSchedule(data, completed);

  assert.ok(shiftedWeeks.length > 0 && shiftedWeeks.length <= 42);

  // Week 1 Monday should immediately start from TYT Türkçe video #26
  const week1Mon = shiftedWeeks[0].days.find(d => d.dayName === 'Pazartesi');
  assert.equal(week1Mon.blocks[0].subject, 'TYT Türkçe');
  assert.equal(week1Mon.blocks[0].video.index, 26, 'Should shift forward to the next uncompleted video (index 26)');
  assert.equal(week1Mon.blocks[1].video.index, 27);

  // Week 1 Tuesday should start from TYT Matematik video #11
  const week1Tue = shiftedWeeks[0].days.find(d => d.dayName === 'Salı');
  assert.equal(week1Tue.blocks[0].subject, 'TYT Matematik');
  assert.equal(week1Tue.blocks[0].video.index, 11, 'Should shift forward to the next uncompleted video (index 11)');
  assert.equal(week1Tue.blocks[1].video.index, 12);

  // Verify none of the completed videos appear, and all uncompleted videos appear
  let scheduledRealVideos = 0;
  for (const week of shiftedWeeks) {
    for (const day of week.days) {
      for (const block of (day.blocks || [])) {
        if (!block.video.id.startsWith('tekrar-')) {
          assert.ok(!completedIds.has(block.video.id), `Completed video ${block.video.id} must not be rescheduled`);
          scheduledRealVideos++;
        }
      }
    }
  }

  assert.equal(scheduledRealVideos, totalExpectedRemaining, 'Every remaining uncompleted video must be scheduled');
});

test('shiftSchedule: handles empty or invalid playlists safely', () => {
  assert.deepEqual(shiftSchedule({}), []);
  assert.deepEqual(shiftSchedule(null), []);
});

// ---------------------------------------------------------------------------
// 3. Break Timer (createBreakTimer & playChime)
// ---------------------------------------------------------------------------
test('createBreakTimer: tick and complete callbacks fire properly', async () => {
  let tickCount = 0;
  let lastRemaining = -1;
  let completed = false;

  const timer = createBreakTimer(1, {
    onTick: (rem) => {
      tickCount++;
      lastRemaining = rem;
    },
    onComplete: () => {
      completed = true;
    }
  });

  const initial = timer.getState();
  assert.equal(initial.duration, 1);
  assert.equal(initial.remaining, 1);
  assert.equal(initial.running, false);

  timer.start();
  assert.equal(timer.getState().running, true);

  // Wait for 1.2 seconds for timer countdown to complete
  await new Promise(resolve => setTimeout(resolve, 1250));

  assert.ok(tickCount >= 1, `Expected at least 1 tick, got ${tickCount}`);
  assert.equal(lastRemaining, 0, 'Last tick remaining should be 0');
  assert.equal(completed, true, 'onComplete callback must fire upon reaching 0');
  assert.equal(timer.getState().running, false, 'Timer must stop running on completion');
});

test('createBreakTimer: pause, resume, and reset update remaining time and state', async () => {
  const timer = createBreakTimer(10);
  assert.equal(timer.getState().remaining, 10);
  assert.equal(timer.getState().running, false);

  timer.start();
  assert.equal(timer.getState().running, true);
  assert.ok(timer.getState().targetEndTime > Date.now());

  // Let it tick slightly
  await new Promise(resolve => setTimeout(resolve, 250));

  timer.pause();
  const pausedState = timer.getState();
  assert.equal(pausedState.running, false);
  assert.equal(pausedState.targetEndTime, 0);
  assert.ok(pausedState.remaining <= 10 && pausedState.remaining >= 9);

  // Resume
  timer.resume();
  assert.equal(timer.getState().running, true);
  assert.ok(timer.getState().targetEndTime > Date.now());

  // Reset to original
  timer.reset();
  const resetState = timer.getState();
  assert.equal(resetState.running, false);
  assert.equal(resetState.remaining, 10);
  assert.equal(resetState.duration, 10);

  // Reset with new duration
  timer.reset(300);
  const reset300 = timer.getState();
  assert.equal(reset300.running, false);
  assert.equal(reset300.remaining, 300);
  assert.equal(reset300.duration, 300);
});

test('playChime: verifies D5 (587.33 Hz) and A5 (880.0 Hz) dual-tone frequencies and envelope', () => {
  const oscillators = [];
  const gains = [];

  const mockCtx = {
    currentTime: 10.0,
    destination: {},
    createOscillator() {
      const osc = {
        type: '',
        frequency: {
          freqCalls: [],
          setValueAtTime(freq, time) {
            this.freqCalls.push({ freq, time });
          }
        },
        connect() {},
        startCalls: [],
        stopCalls: [],
        start(time) { this.startCalls.push(time); },
        stop(time) { this.stopCalls.push(time); }
      };
      oscillators.push(osc);
      return osc;
    },
    createGain() {
      const gain = {
        gain: {
          valCalls: [],
          rampCalls: [],
          setValueAtTime(val, time) {
            this.valCalls.push({ val, time });
          },
          exponentialRampToValueAtTime(val, time) {
            this.rampCalls.push({ val, time });
          }
        },
        connect() {}
      };
      gains.push(gain);
      return gain;
    }
  };

  playChime(mockCtx);

  assert.equal(oscillators.length, 2, 'Exactly 2 oscillators must be created for dual chime');
  assert.equal(gains.length, 2, 'Exactly 2 gain nodes must be created for dual chime');

  // Tone 1: D5 (587.33 Hz)
  const osc1 = oscillators[0];
  assert.equal(osc1.type, 'sine');
  assert.equal(osc1.frequency.freqCalls[0].freq, 587.33, 'Tone 1 must be D5 at 587.33 Hz');
  assert.equal(osc1.frequency.freqCalls[0].time, 10.0);
  assert.equal(osc1.startCalls[0], 10.0);
  assert.equal(Number(osc1.stopCalls[0].toFixed(2)), 10.18, 'Tone 1 must play for 0.18s');

  // Gain 1: soft exponential fade
  const gain1 = gains[0];
  assert.equal(gain1.gain.valCalls[0].val, 0.25);
  assert.equal(gain1.gain.rampCalls[0].val, 0.0001);
  assert.equal(Number(gain1.gain.rampCalls[0].time.toFixed(2)), 10.18);

  // Tone 2: A5 (880.0 Hz) starting after Tone 1 (10.18) for 0.4s (ending at 10.58)
  const osc2 = oscillators[1];
  assert.equal(osc2.type, 'sine');
  assert.equal(osc2.frequency.freqCalls[0].freq, 880.0, 'Tone 2 must be A5 at 880.0 Hz');
  assert.equal(Number(osc2.frequency.freqCalls[0].time.toFixed(2)), 10.18);
  assert.equal(Number(osc2.startCalls[0].toFixed(2)), 10.18);
  assert.equal(Number(osc2.stopCalls[0].toFixed(2)), 10.58, 'Tone 2 must play for 0.4s');

  // Gain 2: soft exponential fade
  const gain2 = gains[1];
  assert.equal(gain2.gain.valCalls[0].val, 0.3);
  assert.equal(gain2.gain.rampCalls[0].val, 0.0001);
  assert.equal(Number(gain2.gain.rampCalls[0].time.toFixed(2)), 10.58);
});

test('initAudioContext: handles environment without throwing', () => {
  const ctx = initAudioContext();
  // In Node.js environment without web audio, should return null safely
  assert.ok(ctx === null || typeof ctx === 'object');
});

// ---------------------------------------------------------------------------
// 4. Storage & Progress Analytics (storage.ts)
// ---------------------------------------------------------------------------
test('storage: loadProgress & saveProgress persist to MemoryStorage properly', () => {
  const memStorage = new MemoryStorage();

  // Initial load on empty storage
  const initial = loadProgress(memStorage);
  assert.deepEqual(initial.completedVideos, {});
  assert.equal(initial.activeWeek, 1);
  assert.equal(initial.activeDay, 0);
  assert.equal(initial.shiftedSchedule, null);

  // Save partial progress
  saveProgress({
    completedVideos: { 'vid_101': true, 'vid_102': true },
    activeWeek: 4,
    activeDay: 2
  }, memStorage);

  const loaded = loadProgress(memStorage);
  assert.equal(loaded.completedVideos['vid_101'], true);
  assert.equal(loaded.completedVideos['vid_102'], true);
  assert.equal(loaded.activeWeek, 4);
  assert.equal(loaded.activeDay, 2);

  // Save and clear shifted schedule
  saveProgress({
    shiftedSchedule: [{ weekNum: 1, days: [] }]
  }, memStorage);
  assert.equal(loadProgress(memStorage).shiftedSchedule?.length, 1);

  saveProgress({ shiftedSchedule: null }, memStorage);
  assert.equal(loadProgress(memStorage).shiftedSchedule, null);
});

test('storage: exportBackup produces schema-compliant backup payload', () => {
  const progress = {
    completedVideos: { 'v1': true, 'v2': true, 'v3': false },
    activeWeek: 5,
    activeDay: 3
  };

  const backup = exportBackup(progress);
  assert.equal(backup.appName, 'YKS 2027 Koçu');
  assert.equal(backup.version, '1.0');
  assert.equal(typeof backup.exportedAt, 'string');
  assert.equal(backup.completedCount, 2);
  assert.equal(backup.completedVideos['v1'], true);
  assert.equal(backup.activeWeek, 5);
  assert.equal(backup.activeDay, 3);
});

test('storage: validateBackup rejects invalid payloads and accepts valid ones', () => {
  // Valid payload
  const valid = {
    appName: 'YKS 2027 Koçu',
    version: '1.0',
    exportedAt: '2026-09-24T12:00:00.000Z',
    completedCount: 2,
    completedVideos: { 'vid_1': true, 'vid_2': true },
    activeWeek: 2,
    activeDay: 1
  };
  const validated = validateBackup(valid);
  assert.ok(validated !== null);
  assert.equal(validated.appName, 'YKS 2027 Koçu');
  assert.equal(validated.completedCount, 2);
  assert.equal(validated.completedVideos['vid_1'], true);

  // Invalid cases
  assert.equal(validateBackup(null), null, 'null must be rejected');
  assert.equal(validateBackup(undefined), null, 'undefined must be rejected');
  assert.equal(validateBackup('string'), null, 'string must be rejected');
  assert.equal(validateBackup([]), null, 'array must be rejected');
  assert.equal(validateBackup({}), null, 'empty object must be rejected');
  assert.equal(validateBackup({ appName: '', version: '1.0', completedVideos: {} }), null, 'empty appName must be rejected');
  assert.equal(validateBackup({ appName: 'YKS 2027 Koçu', version: '', completedVideos: {} }), null, 'empty version must be rejected');
  assert.equal(validateBackup({ appName: 'YKS 2027 Koçu', version: '1.0', completedVideos: 'not_an_object' }), null, 'non-object completedVideos must be rejected');
  assert.equal(validateBackup({ appName: 'YKS 2027 Koçu', version: '1.0', completedVideos: ['invalid'] }), null, 'array completedVideos must be rejected');
  assert.equal(validateBackup({ appName: 'YKS 2027 Koçu', version: '1.0', completedVideos: { 'v1': 'invalid_value' } }), null, 'invalid value in completedVideos must be rejected');
});

test('storage: calculateCourseProgress computes accurate percentage and counts across all 9 subjects', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));

  // Test 1: 0 completed videos
  const initialProgress = calculateCourseProgress(data, {});
  assert.equal(initialProgress.length, 9, 'Must calculate progress for all 9 subjects');
  for (const cp of initialProgress) {
    assert.equal(cp.completedVideos, 0);
    assert.equal(cp.progressPct, 0);
    assert.ok(cp.totalVideos > 0, `${cp.subject} must have videos`);
  }

  // Test 2: Mark all videos of TYT Türkçe and half of TYT Fizik
  const completed = {};
  const turkceVideos = data['TYT Türkçe'].videos;
  turkceVideos.forEach(v => { completed[v.id] = true; });

  const fizikVideos = data['TYT Fizik'].videos;
  const halfFizik = Math.floor(fizikVideos.length / 2);
  fizikVideos.slice(0, halfFizik).forEach(v => { completed[v.id] = true; });

  const progress = calculateCourseProgress(data, completed);
  const turkce = progress.find(p => p.subject === 'TYT Türkçe');
  assert.equal(turkce.completedVideos, turkceVideos.length);
  assert.equal(turkce.progressPct, 100);

  const fizik = progress.find(p => p.subject === 'TYT Fizik');
  assert.equal(fizik.completedVideos, halfFizik);
  const expectedPct = Number(((halfFizik / fizikVideos.length) * 100).toFixed(1));
  assert.equal(fizik.progressPct, expectedPct);

  // Test 3: All videos completed across all 9 subjects
  const allCompleted = {};
  for (const info of Object.values(data)) {
    for (const v of info.videos || []) {
      allCompleted[v.id] = true;
    }
  }
  const allProgress = calculateCourseProgress(data, allCompleted);
  for (const cp of allProgress) {
    assert.equal(cp.completedVideos, cp.totalVideos);
    assert.equal(cp.progressPct, 100);
  }
});
