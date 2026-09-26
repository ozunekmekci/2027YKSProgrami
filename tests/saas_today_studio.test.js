import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSaaSApp } from '../src/generate_saas_app.js';

test('Study Studio renders 2-column layout with 4 video cards and inline break timer', () => {
  const html = generateSaaSApp();
  assert.ok(html.includes('studio-grid-layout'), 'Must have 2-column studio-grid-layout');
  assert.ok(html.includes('studio-blocks-column'), 'Must have studio-blocks-column');
  assert.ok(html.includes('studio-aside-column'), 'Must have studio-aside-column');
  assert.ok(html.includes('saas-break-timer-card'), 'Must have inline saas-break-timer-card');
  assert.ok(html.includes('svg-timer-circle'), 'Must have circular SVG timer');
  assert.ok(html.includes('PAZAR: ÇALIŞMAK KESİNLİKLE YASAK'), 'Must contain Sunday rest banner');
  assert.ok(html.includes('renderStudioDay'), 'Must define renderStudioDay function');
  assert.ok(html.includes('playChime'), 'Must define Web Audio playChime function');
  assert.ok(html.includes('587.33') && html.includes('880'), 'Must use D5 (587.33 Hz) and A5 (880 Hz) chime frequencies');
});

test('Study Studio dynamically renders day tabs without static hardcoded Monday buttons or activeDayIndex===6 bugs', () => {
  const html = generateSaaSApp();
  assert.ok(html.includes('renderStudioDayTabs'), 'Must define renderStudioDayTabs function');
  assert.ok(!html.includes('onclick="setStudioDay(0)">Pazartesi</button>'), 'Must not have hardcoded static Pazartesi day tab button in HTML template');
  assert.ok(!html.includes('activeDayIndex === 6'), 'Must not treat day index 6 as hardcoded Sunday in renderStudioDay');
  assert.ok(!html.includes('dayIdx === 6'), 'Must not treat day index 6 as hardcoded Sunday in renderRadarView');
});
