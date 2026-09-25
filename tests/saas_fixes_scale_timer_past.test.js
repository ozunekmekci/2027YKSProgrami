import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Scale & Percentage formatting: 4 / 766 produces %0.5 without extra space', () => {
  const totalVideos = 766;
  const formatPct = (completedCount) => {
    const rawPct = (completedCount / totalVideos) * 100;
    const pctFormatted = completedCount === 0 ? '0' : (rawPct < 10 ? rawPct.toFixed(1) : Math.round(rawPct).toString());
    return {
      topbarText: `${completedCount} / ${totalVideos} Video (%${pctFormatted})`,
      sidebarText: `%${pctFormatted}`,
      fillWidth: `${(completedCount === 0 ? 0 : Math.max(1, Math.min(100, rawPct))).toFixed(2)}%`
    };
  };

  const zero = formatPct(0);
  assert.equal(zero.topbarText, '0 / 766 Video (%0)');
  assert.equal(zero.sidebarText, '%0');
  assert.equal(zero.fillWidth, '0.00%');

  const four = formatPct(4);
  assert.equal(four.topbarText, '4 / 766 Video (%0.5)');
  assert.equal(four.sidebarText, '%0.5');
  assert.equal(four.fillWidth, '1.00%');
  assert.ok(!four.topbarText.includes('(% '), 'Must not have space after opening parenthesis: (% ');

  const eighty = formatPct(80);
  assert.equal(eighty.topbarText, '80 / 766 Video (%10)');
  assert.equal(eighty.sidebarText, '%10');

  const allDone = formatPct(766);
  assert.equal(allDone.topbarText, '766 / 766 Video (%100)');
  assert.equal(allDone.sidebarText, '%100');
  assert.equal(allDone.fillWidth, '100.00%');
});

test('www/index.html includes updated timer single-use extension, reset, and past preservation', () => {
  const htmlPath = path.resolve(__dirname, '../www/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify button ID and 1-time extension logic
  assert.ok(html.includes('id="btn-timer-add-minutes"'), 'HTML must include id="btn-timer-add-minutes"');
  assert.ok(html.includes('timerExtended'), 'HTML must track timerExtended state');
  assert.ok(html.includes('+5 Dk Eklendi (Kullanıldı)'), 'Extension button must display used status');
  assert.ok(html.includes('.btn-timer-add:disabled'), 'CSS must include disabled styles for extension button');

  // Verify reset button functionality
  assert.ok(html.includes('function resetBreakTimer()'), 'Must define resetBreakTimer');
  assert.ok(html.includes('timerDuration = 1200'), 'resetBreakTimer must reset timerDuration to 1200');
  assert.ok(html.includes('timerRemaining = 1200'), 'resetBreakTimer must reset timerRemaining to 1200');

  // Verify Shift Engine preserving past
  assert.ok(html.includes('shiftSchedulePreservingPast'), 'HTML must include shiftSchedulePreservingPast');
  assert.ok(html.includes('nextActiveWeek'), 'Shift engine must calculate nextActiveWeek');
  assert.ok(html.includes('nextActiveDay'), 'Shift engine must calculate nextActiveDay');
  assert.ok(html.includes('day-done'), 'HTML must have day-done indicator for completed days');

  // Verify video embed scaling
  assert.ok(html.includes('max-width: 720px'), 'video-embed-container must have max-width constraint for responsive scale');
  assert.ok(html.includes('.studio-grid-layout.is-sunday'), 'Must define is-sunday layout class');
});
