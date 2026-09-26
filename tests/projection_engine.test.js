import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateCalendarDays } from '../src/calendar_engine.js';
import { calculateCurriculumProjection } from '../src/web/projection_engine.ts';

test('projection_engine calculates accurate start and end weeks and dates for all units', () => {
  const playlists = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'playlists_data_tr.json'), 'utf8'));
  const unitsData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'src/data/curriculum_units.json'), 'utf8'));
  const calendarWeeks = generateCalendarDays(playlists, { startDate: '2026-09-26' });

  const report = calculateCurriculumProjection(calendarWeeks, unitsData, {});

  assert.ok(report.subjects.length > 0, 'Must produce projections for subjects');
  assert.ok(report.totalUnits > 0, 'Must calculate total units');
  assert.equal(report.completedUnits, 0, 'Completed units must be 0 initially');

  const tarih = report.subjects.find(s => s.subject === 'TYT-AYT Tarih');
  assert.ok(tarih, 'TYT-AYT Tarih projection must exist');
  assert.equal(tarih.units.length, 9, 'Tarih must have exactly 9 units');

  for (const u of tarih.units) {
    assert.ok(u.startWeek <= u.endWeek, `Unit ${u.title} startWeek (${u.startWeek}) must be <= endWeek (${u.endWeek})`);
    assert.ok(u.startDateIso <= u.endDateIso, `Unit ${u.title} startDateIso must be <= endDateIso`);
    assert.ok(u.startDate, `Unit ${u.title} must have formatted startDate`);
    assert.ok(u.endDate, `Unit ${u.title} must have formatted endDate`);
    assert.ok(['upcoming', 'in_progress', 'completed'].includes(u.status), `Valid status for ${u.title}`);
  }

  // Check specific Tarih Ottoman unit: "Klasik Çağda Osmanlı Devleti (Kuruluş ve Yükselme)"
  const osmanliUnit = tarih.units.find(u => u.id === 'tar-u2');
  assert.ok(osmanliUnit, 'Osmanli unit must exist');
  assert.ok(osmanliUnit.startWeek >= 2, 'Osmanli unit starts after unit 1');
  assert.ok(osmanliUnit.endWeek >= osmanliUnit.startWeek, 'Osmanli unit endWeek >= startWeek');

  // Check Turkish Ses Bilgisi unit: starts in week 1
  const turkce = report.subjects.find(s => s.subject === 'TYT Türkçe');
  assert.ok(turkce, 'TYT Türkçe projection must exist');
  const sesBilgisi = turkce.units.find(u => u.id === 'tr-u1');
  assert.ok(sesBilgisi, 'Ses Bilgisi unit must exist');
  assert.equal(sesBilgisi.startWeek, 1, 'Ses Bilgisi starts in week 1');
  assert.equal(sesBilgisi.startDate, '26 Eylül 2026, Cumartesi');
});

test('projection_engine reacts to completed videos and updates unit progress & status', () => {
  const playlists = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'playlists_data_tr.json'), 'utf8'));
  const unitsData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'src/data/curriculum_units.json'), 'utf8'));
  const calendarWeeks = generateCalendarDays(playlists, { startDate: '2026-09-26' });

  // Mark all 8 videos of Ses Bilgisi (indices 1 to 8) as completed
  const completedMap = {};
  const trVideos = playlists['TYT Türkçe'].videos;
  for (let i = 0; i < 8; i++) {
    completedMap[trVideos[i].id] = true;
  }

  const report = calculateCurriculumProjection(calendarWeeks, unitsData, completedMap);
  const turkce = report.subjects.find(s => s.subject === 'TYT Türkçe');
  const sesBilgisi = turkce.units.find(u => u.id === 'tr-u1');

  assert.equal(sesBilgisi.completedVideos, 8, 'All 8 videos of Ses Bilgisi completed');
  assert.equal(sesBilgisi.progressPercent, 100, 'Ses Bilgisi is 100% completed');
  assert.equal(sesBilgisi.status, 'completed', 'Ses Bilgisi status is completed');
  assert.ok(report.completedUnits >= 1, 'At least 1 unit completed in report');
});

test('projection_engine and types strictly comply with zero emoji directive', () => {
  const engineCode = fs.readFileSync(path.resolve(process.cwd(), 'src/web/projection_engine.ts'), 'utf8');
  const typesCode = fs.readFileSync(path.resolve(process.cwd(), 'src/web/types.ts'), 'utf8');
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  assert.ok(!emojiRegex.test(engineCode), 'projection_engine.ts must contain zero emojis');
  assert.ok(!emojiRegex.test(typesCode), 'types.ts must contain zero emojis');
});

