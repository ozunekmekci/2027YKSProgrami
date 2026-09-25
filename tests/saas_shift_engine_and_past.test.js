import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateCalendarDays, shiftSchedulePreservingPast } from '../src/calendar_engine.js';

test('Shift Engine preserves past completed days and shifts uncompleted forward', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const baselineCalendar = generateCalendarDays(data);

  // Complete the 4 videos of Week 1 Monday
  const mon1Blocks = baselineCalendar[0].days[0].blocks;
  const completed = {};
  const completedIds = [];
  mon1Blocks.forEach(b => {
    completed[b.video.id] = true;
    completedIds.push(b.video.id);
  });

  assert.equal(Object.keys(completed).length, 4);

  // Shift schedule with past preservation
  const result = shiftSchedulePreservingPast(data, completed, baselineCalendar);
  const shiftedSchedule = result.schedule;

  assert.ok(shiftedSchedule.length >= 42, 'Schedule must maintain full span');

  // 1. Week 1 Monday MUST retain its 4 completed videos!
  const week1Mon = shiftedSchedule[0].days[0];
  assert.equal(week1Mon.dayName, 'Pazartesi');
  assert.equal(week1Mon.blocks.length, 4);
  assert.equal(week1Mon.blocks[0].video.id, completedIds[0], 'Week 1 Mon Block 1 must be the completed video');
  assert.equal(week1Mon.blocks[1].video.id, completedIds[1], 'Week 1 Mon Block 2 must be the completed video');
  assert.equal(week1Mon.blocks[2].video.id, completedIds[2], 'Week 1 Mon Block 3 must be the completed video');
  assert.equal(week1Mon.blocks[3].video.id, completedIds[3], 'Week 1 Mon Block 4 must be the completed video');

  // 2. Next active day must be Week 1 Tuesday (Day 1)
  assert.equal(result.nextActiveWeek, 1, 'Next active week should be 1');
  assert.equal(result.nextActiveDay, 1, 'Next active day should be Tuesday (Day 1)');

  // 3. Week 1 Tuesday must contain TYT Matematik #1 & #2 and TYT-AYT Tarih #1 & #2 (uncompleted)
  const week1Tue = shiftedSchedule[0].days[1];
  assert.equal(week1Tue.dayName, 'Salı');
  assert.equal(week1Tue.blocks[0].subject, 'TYT Matematik');
  assert.equal(week1Tue.blocks[0].video.index, 1);
  assert.equal(week1Tue.blocks[1].video.index, 2);
  assert.equal(week1Tue.blocks[2].subject, 'TYT-AYT Tarih');
  assert.equal(week1Tue.blocks[2].video.index, 1);
  assert.equal(week1Tue.blocks[3].video.index, 2);

  // 4. Verify all 766 curriculum videos are scheduled across the timeline
  let scheduledRealVideos = 0;
  const scheduledIds = new Set();

  for (const week of shiftedSchedule) {
    for (const day of week.days) {
      for (const block of (day.blocks || [])) {
        const vid = block.video?.id;
        if (vid && !vid.startsWith('tekrar-')) {
          assert.ok(!scheduledIds.has(vid), `Duplicate video: ${vid}`);
          scheduledIds.add(vid);
          scheduledRealVideos++;
        }
      }
    }
  }

  assert.equal(scheduledRealVideos, 766, 'All 766 curriculum videos must be in the schedule');
  assert.equal(scheduledIds.size, 766, 'All 766 curriculum videos must be unique');
});

test('Shift Engine preserves entire Week 1 when Week 1 is fully completed', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const baselineCalendar = generateCalendarDays(data);

  // Complete all 24 study blocks of Week 1
  const completed = {};
  for (let d = 0; d < 6; d++) {
    (baselineCalendar[0].days[d].blocks || []).forEach(b => {
      completed[b.video.id] = true;
    });
  }

  assert.equal(Object.keys(completed).length, 24);

  const result = shiftSchedulePreservingPast(data, completed, baselineCalendar);
  assert.equal(result.nextActiveWeek, 2, 'Next active week should advance to Week 2');
  assert.equal(result.nextActiveDay, 0, 'Next active day should be Monday (Day 0) of Week 2');

  // Verify Week 1 is 100% preserved
  for (let d = 0; d < 6; d++) {
    const originalBlocks = baselineCalendar[0].days[d].blocks;
    const shiftedBlocks = result.schedule[0].days[d].blocks;
    for (let b = 0; b < 4; b++) {
      assert.equal(shiftedBlocks[b].video.id, originalBlocks[b].video.id);
    }
  }
});
