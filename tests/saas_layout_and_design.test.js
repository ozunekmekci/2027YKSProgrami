import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('src/generate_saas_app.js exists and generates SaaS layout with sidebar and topbar', async () => {
  assert.ok(fs.existsSync('src/generate_saas_app.js'), 'src/generate_saas_app.js must exist');
  const generator = await import('../src/generate_saas_app.js');
  assert.equal(typeof generator.generateSaaSApp, 'function');

  const html = generator.generateSaaSApp();
  assert.ok(html.includes('saas-layout-wrapper'), 'Must contain saas-layout-wrapper');
  assert.ok(html.includes('saas-sidebar'), 'Must contain saas-sidebar');
  assert.ok(html.includes('saas-topbar'), 'Must contain saas-topbar');
  assert.ok(html.includes('saas-content-canvas'), 'Must contain saas-content-canvas');
  assert.ok(html.includes('--slate-900'), 'Must define Slate design tokens');
  assert.ok(html.includes('--mint-500'), 'Must define Mint accent tokens');
  assert.ok(html.includes('font-variant-numeric: tabular-nums'), 'Must enforce tabular-nums on numbers');
  assert.ok(html.includes('tab-today'), 'Must have tab-today navigation');
  assert.ok(html.includes('tab-radar'), 'Must have tab-radar navigation');
  assert.ok(html.includes('tab-curriculum'), 'Must have tab-curriculum navigation');
  assert.ok(html.includes('tab-settings'), 'Must have tab-settings navigation');
});
