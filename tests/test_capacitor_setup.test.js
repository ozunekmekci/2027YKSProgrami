import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('capacitor setup and configuration validity', () => {
  assert.ok(fs.existsSync('capacitor.config.json'), 'capacitor.config.json should exist');
  const config = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));

  assert.equal(config.appId, 'com.yks.planner');
  assert.equal(config.appName, 'YKS 2027 Koçu');
  assert.equal(config.webDir, 'www');

  assert.ok(fs.existsSync('package.json'), 'package.json should exist');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  assert.ok(pkg.dependencies, 'package.json should have dependencies');
  assert.ok(pkg.dependencies['@capacitor/core'], '@capacitor/core should be in dependencies');
  assert.ok(pkg.dependencies['@capacitor/android'], '@capacitor/android should be in dependencies');
  assert.ok(fs.existsSync('www'), 'www directory should exist');
});
