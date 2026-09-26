import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('curriculum_units.json exists and strictly covers all 766 videos without gaps or overlaps', () => {
  const unitsPath = path.resolve(process.cwd(), 'src/data/curriculum_units.json');
  assert.ok(fs.existsSync(unitsPath), 'src/data/curriculum_units.json must exist');

  const playlistsPath = path.resolve(process.cwd(), 'playlists_data_tr.json');
  const playlists = JSON.parse(fs.readFileSync(playlistsPath, 'utf8'));
  const unitsData = JSON.parse(fs.readFileSync(unitsPath, 'utf8'));

  const subjectNames = Object.keys(playlists);
  assert.equal(Object.keys(unitsData).length, subjectNames.length, 'Must define units for all 9 subjects');

  let totalUnitVideos = 0;
  for (const subj of subjectNames) {
    const units = unitsData[subj];
    assert.ok(Array.isArray(units) && units.length > 0, `Units for ${subj} must be a non-empty array`);

    const playlistVideos = playlists[subj].videos || [];
    let expectedNextStart = 1;

    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      assert.ok(u.id, `Unit ${i} in ${subj} must have an id`);
      assert.ok(u.title, `Unit ${i} in ${subj} must have a title`);
      assert.equal(u.startVideo, expectedNextStart, `Unit ${u.title} in ${subj} startVideo must be ${expectedNextStart} but got ${u.startVideo}`);
      assert.ok(u.endVideo >= u.startVideo, `Unit ${u.title} in ${subj} endVideo must be >= startVideo`);

      const videoSpan = (u.endVideo - u.startVideo + 1);
      totalUnitVideos += videoSpan;
      expectedNextStart = u.endVideo + 1;
    }

    assert.equal(expectedNextStart - 1, playlistVideos.length, `${subj} last unit must end at ${playlistVideos.length}`);
  }

  assert.equal(totalUnitVideos, 766, 'All units combined must account for exactly 766 videos');

  // Verify zero emojis in curriculum_units.json
  const rawContent = fs.readFileSync(unitsPath, 'utf8');
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.ok(!emojiRegex.test(rawContent), 'curriculum_units.json must contain zero emojis');
});
