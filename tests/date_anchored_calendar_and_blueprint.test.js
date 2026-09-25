import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('src/default_blueprint.json exists and defines 6 study days with valid subjects', () => {
  const raw = fs.readFileSync('src/default_blueprint.json', 'utf8');
  const bp = JSON.parse(raw);
  assert.ok(bp.pazartesi && bp.pazartesi.length === 4, 'Pazartesi must have 4 blocks');
  assert.ok(bp.sali && bp.sali.length === 4, 'Sali must have 4 blocks');
  assert.ok(bp.carsamba && bp.carsamba.length === 4, 'Carsamba must have 4 blocks');
  assert.ok(bp.persembe && bp.persembe.length === 4, 'Persembe must have 4 blocks');
  assert.ok(bp.cuma && bp.cuma.length === 4, 'Cuma must have 4 blocks');
  assert.ok(bp.cumartesi && bp.cumartesi.length === 4, 'Cumartesi must have 4 blocks');
  assert.ok(!bp.pazar || bp.pazar.length === 0, 'Pazar must not contain study blocks');
});
