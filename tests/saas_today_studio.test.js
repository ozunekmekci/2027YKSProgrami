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
