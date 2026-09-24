import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateCalendarDays } from '../src/calendar_engine.js';

test('calendar generator maps 746 videos across ~42 weeks with 4 blocks/day and Sunday off', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const weeks = generateCalendarDays(data);
  
  assert.ok(weeks.length >= 38 && weeks.length <= 42, `Week count should be around 38-42, got ${weeks.length}`);
  
  // Verify Week 1 Monday
  const week1 = weeks[0];
  const monday = week1.days.find(d => d.dayName === 'Pazartesi');
  assert.equal(monday.blocks.length, 4);
  assert.equal(monday.blocks[0].subject, 'TYT Türkçe');
  assert.equal(monday.blocks[0].video.index, 1);
  assert.equal(monday.blocks[1].subject, 'TYT Türkçe');
  assert.equal(monday.blocks[1].video.index, 2);
  assert.equal(monday.blocks[2].subject, 'TYT Coğrafya');
  assert.equal(monday.blocks[2].video.index, 1);
  assert.equal(monday.blocks[3].subject, 'TYT Coğrafya');
  assert.equal(monday.blocks[3].video.index, 2);

  // Verify Sunday
  const sunday = week1.days.find(d => d.dayName === 'Pazar');
  assert.equal(sunday.isRestDay, true);
});

test('comprehensive validation of calendar structure, transitions, and video integrity', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const weeks = generateCalendarDays(data);

  const expectedDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const scheduledVideoIds = new Set();
  const subjectIndices = {};
  let realVideoCount = 0;

  for (const week of weeks) {
    assert.ok(week.weekNum >= 1 && week.weekNum <= 42, `Invalid week number: ${week.weekNum}`);
    assert.equal(week.days.length, 7, `Week ${week.weekNum} does not have 7 days`);

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const day = week.days[dayIdx];
      assert.equal(day.dayName, expectedDays[dayIdx]);

      if (day.dayName === 'Pazar') {
        assert.equal(day.isRestDay, true);
        assert.ok(!day.blocks || day.blocks.length === 0);
      } else {
        assert.equal(day.isRestDay, false);
        assert.equal(day.blocks.length, 4, `Week ${week.weekNum} ${day.dayName} must have exactly 4 blocks`);

        for (let bIdx = 0; bIdx < 4; bIdx++) {
          const block = day.blocks[bIdx];
          assert.equal(block.blockNum, bIdx + 1);
          assert.ok(block.subject, `Missing subject in week ${week.weekNum} ${day.dayName} block ${bIdx + 1}`);
          assert.ok(block.video, `Missing video in week ${week.weekNum} ${day.dayName} block ${bIdx + 1}`);

          if (block.video.id) {
            // Real curriculum video
            realVideoCount++;
            assert.ok(!scheduledVideoIds.has(block.video.id), `Duplicate video ${block.video.id} found in calendar`);
            scheduledVideoIds.add(block.video.id);

            // Sequential order check
            const lastIdx = subjectIndices[block.subject] || 0;
            assert.equal(block.video.index, lastIdx + 1, `Subject ${block.subject} out of sequence: expected ${lastIdx + 1}, got ${block.video.index}`);
            subjectIndices[block.subject] = block.video.index;
          } else {
            // Review block fallback
            assert.equal(block.video.title, 'Konu Tekrarı & Soru Çözümü');
            assert.equal(block.video.duration_min, 40);
          }
        }
      }
    }
  }

  // Verify all 766 videos are scheduled
  let totalCurriculumVideos = 0;
  for (const info of Object.values(data)) {
    totalCurriculumVideos += info.videos.length;
  }
  assert.equal(totalCurriculumVideos, 766);
  assert.equal(realVideoCount, 766, `Expected all 766 videos to be scheduled, got ${realVideoCount}`);
  assert.equal(scheduledVideoIds.size, 766);

  // Verify transition: AYT Edebiyat to AYT Coğrafya on Friday
  // AYT Edebiyat has 62 videos (30 on Wed, 30 on Fri across w1-15, w16 Wed finishes with v61, v62)
  // Week 16 Friday must feature AYT Coğrafya v1, v2
  const week16 = weeks[15];
  const w16Friday = week16.days.find(d => d.dayName === 'Cuma');
  assert.equal(w16Friday.blocks[2].subject, 'AYT Coğrafya');
  assert.equal(w16Friday.blocks[2].video.index, 1);
  assert.equal(w16Friday.blocks[3].subject, 'AYT Coğrafya');
  assert.equal(w16Friday.blocks[3].video.index, 2);

  // Verify transition: TYT Biyoloji ends at week 20 (80 videos / 4 per week)
  // Week 21 Saturday block 3 & 4 should be Tekrar & Soru Çözümü
  const week21 = weeks[20];
  const w21Saturday = week21.days.find(d => d.dayName === 'Cumartesi');
  assert.equal(w21Saturday.blocks[2].subject, 'Tekrar & Soru Çözümü');
  assert.equal(w21Saturday.blocks[2].video.title, 'Konu Tekrarı & Soru Çözümü');
});
