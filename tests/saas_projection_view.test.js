import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('www/index.html includes projection tab, interactive Gantt matrix, and drilldown panel', () => {
  const html = fs.readFileSync(path.resolve(process.cwd(), 'www/index.html'), 'utf8');

  // Navigation tab
  assert.ok(html.includes('data-tab="projection"'), 'Must have projection tab button');
  assert.ok(html.includes('id="view-projection"'), 'Must have projection view container');

  // Gantt Matrix structure
  assert.ok(html.includes('id="curriculum-gantt-matrix"'), 'Must have Gantt matrix element');
  assert.ok(html.includes('id="projection-drilldown"'), 'Must have drilldown panel');
  assert.ok(html.includes('gantt-timeline-header'), 'Must have timeline header');
  assert.ok(html.includes('gantt-row'), 'Must have Gantt course rows');
  assert.ok(html.includes('tabular-nums'), 'Must use tabular-nums for numeric alignment');

  // Verify zero emojis in www/index.html
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.ok(!emojiRegex.test(html), 'www/index.html must not contain emojis');
});

test('www/index.html scripts must be syntactically valid JavaScript', async () => {
  const vm = await import('node:vm');
  const html = fs.readFileSync(path.resolve(process.cwd(), 'www/index.html'), 'utf8');
  const matches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(matches.length >= 2, 'Must have at least 2 script tags in index.html');

  for (let i = 0; i < matches.length; i++) {
    const code = matches[i][1];
    assert.doesNotThrow(() => {
      new vm.Script(code);
    }, `Script index ${i} must compile cleanly without SyntaxError`);
  }
});
