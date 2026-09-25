import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('www/index.html is compiled as full SaaS workspace with 766 videos', () => {
  const html = fs.readFileSync('www/index.html', 'utf8');
  assert.ok(html.includes('saas-layout-wrapper'), 'www/index.html must be SaaS layout');
  assert.ok(html.includes('studio-grid-layout'), 'www/index.html must have Study Studio');
  assert.ok(html.includes('command-palette-modal'), 'www/index.html must have Command Palette');
  assert.ok(html.includes('saas-data-table'), 'www/index.html must have Curriculum Data Table');
  assert.ok(html.includes('exportBackup'), 'Must have backup export');
  assert.ok(html.includes('importBackup'), 'Must have backup import');
});
