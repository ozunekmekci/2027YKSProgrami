import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('src/default_blueprint.json exists and defines 6 study days with valid subjects', () => {
  const raw = fs.readFileSync('src/default_blueprint.json', 'utf8');
  const bp = JSON.parse(raw);
  assert.ok(bp.pazartesi && bp.pazartesi.length === 4, 'Pazartesi must have 4 blocks');
  assert.ok(bp.sali && bp.sali.length === 4, 'Sali must have 4 blocks');
  assert.ok(bp.carsamba && bp.carsamba.length === 4, 'Carsamba must have 4 blocks');
  assert.ok(bp.persembe && bp.persembe.length === 4, 'Persembe must have 4 blocks');
  assert.ok(bp.cuma && bp.cuma.length === 4, 'Cuma must have 4 blocks');
  assert.ok(bp.cumartesi && bp.cumartesi.length === 4, 'Cumartesi must have 4 blocks');
  assert.ok(!bp.pazar || bp.pazar.length === 0, 'Pazar must not contain study blocks');
});

test('calendar_engine generates date-anchored schedule with real dates and strict Sunday rest', async () => {
  const { generateCalendarDays } = await import('../src/calendar_engine.js');
  const playlists = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const schedule = generateCalendarDays(playlists, {
    startDate: '2026-09-25' // Cuma
  });

  assert.ok(schedule.length > 0);
  // Days 0..3: 21-24 Sep (Pazartesi - Perşembe) are past days before plan start
  assert.equal(schedule[0].days[0].isPast, true);
  assert.equal(schedule[0].days[0].dayName, 'Pazartesi');

  // Day 4: 25 Eylül 2026 Cuma (Study Day 1)
  const day1 = schedule[0].days[4];
  assert.equal(day1.dateIso, '2026-09-25');
  assert.equal(day1.dayName, 'Cuma');
  assert.equal(day1.studyDayNumber, 1);
  assert.equal(day1.isRestDay, false);

  // Day 5: 26 Eylül 2026 Cumartesi (Study Day 2)
  const day2 = schedule[0].days[5];
  assert.equal(day2.dateIso, '2026-09-26');
  assert.equal(day2.dayName, 'Cumartesi');
  assert.equal(day2.studyDayNumber, 2);
  assert.equal(day2.isRestDay, false);

  // Day 6: Sunday check: 27 Eylül 2026 must be Pazar and isRestDay = true
  const sunday = schedule[0].days[6];
  assert.equal(sunday.dateIso, '2026-09-27');
  assert.equal(sunday.dayName, 'Pazar');
  assert.equal(sunday.isRestDay, true);
  assert.equal(sunday.blocks.length, 0);

  // Week 2 Day 0: 28 Eylül 2026 Pazartesi (Study Day 3)
  const day3 = schedule[1].days[0];
  assert.equal(day3.dateIso, '2026-09-28');
  assert.equal(day3.dayName, 'Pazartesi');
  assert.equal(day3.studyDayNumber, 3);
});

test('calendar_engine preserves uncompleted subject queue (missed Coğrafya #1 is served on next Coğrafya slot)', async () => {
  const { shiftScheduleWithBlueprint } = await import('../src/calendar_engine.js');
  const playlists = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));

  // Mark only first two videos of Türkçe as completed
  const completed = {
    [playlists['TYT Türkçe'].videos[0].id]: true,
    [playlists['TYT Türkçe'].videos[1].id]: true
  };

  const result = shiftScheduleWithBlueprint(playlists, completed, { startDate: '2026-09-25' });
  
  // Find next Coğrafya block in the schedule
  let firstScheduledCografya = null;
  for (const week of result.schedule) {
    for (const day of week.days) {
      for (const block of (day.blocks || [])) {
        if (block.subject === 'TYT Coğrafya' && !completed[block.video.id]) {
          firstScheduledCografya = block.video;
          break;
        }
      }
      if (firstScheduledCografya) break;
    }
    if (firstScheduledCografya) break;
  }

  assert.ok(firstScheduledCografya, 'Must find a scheduled Coğrafya block');
  assert.equal(firstScheduledCografya.id, playlists['TYT Coğrafya'].videos[0].id, 'Must serve Coğrafya #1, not #3');
});

test('calendar_engine supports custom blueprint with variable block counts per day', async () => {
  const { generateCalendarDays } = await import('../src/calendar_engine.js');
  const playlists = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const customBlueprint = {
    pazartesi: ['TYT Türkçe', 'TYT Türkçe', 'TYT Coğrafya'],
    sali: ['TYT Matematik', 'TYT Matematik'],
    carsamba: ['TYT Biyoloji', 'TYT Biyoloji', 'AYT Edebiyat', 'AYT Edebiyat'],
    persembe: ['TYT Matematik', 'TYT Kimya'],
    cuma: ['TYT Fizik', 'TYT Fizik', 'AYT Edebiyat'],
    cumartesi: ['TYT-AYT Tarih', 'TYT-AYT Tarih', 'TYT Biyoloji', 'TYT Biyoloji', 'TYT Kimya'], // 5 blocks
    pazar: []
  };

  const schedule = generateCalendarDays(playlists, {
    startDate: '2026-09-25', // Friday
    blueprint: customBlueprint
  });

  const friday = schedule[0].days[4];
  assert.equal(friday.blocks.length, 3, 'Study Day 1 (Friday) should have 3 blocks per pazartesi template');

  const saturday = schedule[0].days[5];
  assert.equal(saturday.blocks.length, 2, 'Study Day 2 (Saturday) should have 2 blocks per sali template');

  const sunday = schedule[0].days[6];
  assert.equal(sunday.isRestDay, true);

  const monday = schedule[1].days[0];
  assert.equal(monday.blocks.length, 4, 'Study Day 3 (Monday) should have 4 blocks per carsamba template');
});

test('rolling calendar starting on Saturday starts with Curriculum Day 1 (TYT Türkçe #1), Sunday is rest, Monday is Day 2', async () => {
  const { generateCalendarDays } = await import('../src/calendar_engine.js');
  const playlists = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));

  const schedule = generateCalendarDays(playlists, {
    startDate: '2026-09-26' // Saturday (Cumartesi)
  });

  assert.ok(schedule.length > 0);
  const week1 = schedule[0];

  // Days 0..4: 21-25 Sep are past days
  assert.equal(week1.days[0].dayName, 'Pazartesi');
  assert.equal(week1.days[0].isPast, true);

  // Day 5: Saturday (Cumartesi, 26 Sep) -> Study Day 1 (TYT Türkçe #1, #2 & TYT Coğrafya #1, #2)
  const saturday = week1.days[5];
  assert.equal(saturday.dateIso, '2026-09-26');
  assert.equal(saturday.dayName, 'Cumartesi');
  assert.equal(saturday.studyDayNumber, 1);
  assert.equal(saturday.isRestDay, false);
  assert.equal(saturday.blocks.length, 4);
  assert.equal(saturday.blocks[0].subject, 'TYT Türkçe');
  assert.equal(saturday.blocks[0].video.id, playlists['TYT Türkçe'].videos[0].id);
  assert.equal(saturday.blocks[2].subject, 'TYT Coğrafya');
  assert.equal(saturday.blocks[2].video.id, playlists['TYT Coğrafya'].videos[0].id);

  // Day 6: Sunday (Pazar, 27 Sep) -> Non-negotiable Rest Day (0 blocks)
  const sunday = week1.days[6];
  assert.equal(sunday.dateIso, '2026-09-27');
  assert.equal(sunday.dayName, 'Pazar');
  assert.equal(sunday.isRestDay, true);
  assert.equal(sunday.blocks.length, 0);

  // Week 2 Day 0: Monday (Pazartesi, 28 Sep) -> Study Day 2 (TYT Matematik #1, #2 & TYT-AYT Tarih #1, #2)
  const monday = schedule[1].days[0];
  assert.equal(monday.dateIso, '2026-09-28');
  assert.equal(monday.dayName, 'Pazartesi');
  assert.equal(monday.studyDayNumber, 2);
  assert.equal(monday.isRestDay, false);
  assert.equal(monday.blocks.length, 4);
  assert.equal(monday.blocks[0].subject, 'TYT Matematik');
  assert.equal(monday.blocks[0].video.id, playlists['TYT Matematik'].videos[0].id);
  assert.equal(monday.blocks[2].subject, 'TYT-AYT Tarih');
  assert.equal(monday.blocks[2].video.id, playlists['TYT-AYT Tarih'].videos[0].id);

  // Week 2 Day 4: Friday (Cuma, 2 Oct) -> Study Day 6 (TYT-AYT Tarih & TYT Biyoloji)
  const friday = schedule[1].days[4];
  assert.equal(friday.dateIso, '2026-10-02');
  assert.equal(friday.dayName, 'Cuma');
  assert.equal(friday.studyDayNumber, 6);
  assert.equal(friday.isRestDay, false);

  // Week 2 Day 5: Saturday (Cumartesi, 3 Oct) -> Study Day 7 (Cycles to Study Day 1 template: Türkçe & Coğrafya)
  const week2Saturday = schedule[1].days[5];
  assert.equal(week2Saturday.dateIso, '2026-10-03');
  assert.equal(week2Saturday.dayName, 'Cumartesi');
  assert.equal(week2Saturday.studyDayNumber, 7);
  assert.equal(week2Saturday.isRestDay, false);
  assert.equal(week2Saturday.blocks[0].subject, 'TYT Türkçe');
});

test('REGRESSION CHECK: clicking Cumartesi (dIdx 5) in Week 1 strictly displays Saturday 26 Sep and Study Day 1 (Türkçe), never Thursday or 1 Oct', async () => {
  const { generateCalendarDays } = await import('../src/calendar_engine.js');
  const playlists = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));

  const schedule = generateCalendarDays(playlists, {
    startDate: '2026-09-26'
  });

  const week1 = schedule[0];
  assert.equal(week1.days.length, 7, 'Week 1 must have 7 days (Monday to Sunday)');

  // dIdx 5 MUST be Cumartesi
  const cumartesiDay = week1.days[5];
  assert.equal(cumartesiDay.dayName, 'Cumartesi');
  assert.equal(cumartesiDay.dateIso, '2026-09-26');
  assert.equal(cumartesiDay.dateFormatted, '26 Eylül 2026, Cumartesi');
  assert.equal(cumartesiDay.studyDayNumber, 1);
  assert.notEqual(cumartesiDay.dayName, 'Perşembe', 'Cumartesi button must never load Thursday');
  assert.notEqual(cumartesiDay.dateIso, '2026-10-01', 'Cumartesi button must never load 1 October');
  assert.equal(cumartesiDay.blocks[0].subject, 'TYT Türkçe', 'First block must be TYT Türkçe');
  assert.equal(cumartesiDay.blocks[0].video.id, playlists['TYT Türkçe'].videos[0].id);
});
