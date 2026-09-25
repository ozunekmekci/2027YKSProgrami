import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateAdminApp } from '../src/generate_admin_app.js';
import { generateSaaSApp } from '../src/generate_saas_app.js';

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2300}-\u{23FF}]/u;

test('src/generate_admin_app.js generates dedicated admin console www/admin.html with zero emojis', () => {
  assert.equal(typeof generateAdminApp, 'function');
  const html = generateAdminApp();

  // Zero emojis rule
  assert.equal(EMOJI_REGEX.test(html), false, 'Admin HTML must contain zero emojis');

  // Core admin tools
  assert.ok(html.includes('Yönetim Paneli'), 'Must have Admin title');
  assert.ok(html.includes('admin-kpi-card'), 'Must contain KPI cards');
  assert.ok(html.includes('exportBackup'), 'Must have backup export');
  assert.ok(html.includes('importBackup'), 'Must have backup import');
  assert.ok(html.includes('triggerAdminShift'), 'Must have Shift Engine trigger');
  assert.ok(html.includes('resetAdminSchedule'), 'Must have schedule reset');
  assert.ok(html.includes('resetAllProgress'), 'Must have Danger Zone hard reset');
  assert.ok(html.includes('admin-table'), 'Must display 9-course progress breakdown');
  assert.ok(html.includes('admin-clock-text'), 'Must include live date and clock');
});

test('www/index.html student interface is emoji-free, date-aware, and has no student settings tab', () => {
  const html = generateSaaSApp();

  // Zero emojis rule
  assert.equal(EMOJI_REGEX.test(html), false, 'SaaS index.html must contain zero emojis');

  // Live date & clock awareness
  assert.ok(html.includes('topbar-live-clock'), 'Must have topbar-live-clock');
  assert.ok(html.includes('live-clock-text'), 'Must have live-clock-text');
  assert.ok(html.includes('updateLiveDateTime'), 'Must implement updateLiveDateTime function');
  assert.ok(html.includes('goToRealToday'), 'Must implement goToRealToday quick-jump');
  assert.ok(html.includes('btn-today-now'), 'Must have Bugün quick-jump button in studio nav');
  assert.ok(html.includes('is-real-today'), 'Must have is-real-today CSS selector for current day');

  // Dedicated admin separation: student UI has no admin link or settings tab
  assert.ok(!html.includes('sidebar-admin-link'), 'Student workspace must not have admin link in sidebar');
  assert.ok(!html.includes('<div class="saas-tab-view" id="tab-settings">'), 'Student screen must not contain tab-settings DOM view');
  assert.ok(html.includes('Programı Dengele'), 'Must have renamed Programı Dengele button');
  assert.ok(!html.includes('Stressiz Kaydır'), 'Must not contain old Stressiz Kaydır text');
});
