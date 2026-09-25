import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSaaSApp } from '../src/generate_saas_app.js';

test('Radar Calendar view renders 42-week selector, weekly matrix, and Shift Engine', () => {
  const html = generateSaaSApp();
  assert.ok(html.includes('radar-week-selector'), 'Must have radar-week-selector');
  assert.ok(html.includes('radar-weekly-matrix'), 'Must have radar-weekly-matrix');
  assert.ok(html.includes('triggerShiftEngine'), 'Must bind triggerShiftEngine');
  assert.ok(html.includes('resetSchedule'), 'Must have resetSchedule to revert shift');
  assert.ok(html.includes('renderRadarView'), 'Must define renderRadarView function');
  assert.ok(html.includes('shiftSchedule'), 'Must implement shiftSchedule engine');
  assert.ok(html.includes('Hafta Planı'), 'Must label weekly plan matrix');
});
