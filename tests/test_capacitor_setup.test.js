import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('capacitor.config.json is properly configured for YKS 2027 Koçu', () => {
  assert.ok(fs.existsSync('capacitor.config.json'), 'capacitor.config.json must exist');
  const config = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));

  assert.equal(config.appId, 'com.yks.planner');
  assert.equal(config.appName, 'YKS 2027 Koçu');
  assert.equal(config.webDir, 'www');
  assert.equal(config.server?.androidScheme, 'https');
  assert.equal(config.plugins?.Haptics?.enabled, true);
  assert.equal(config.bundledWebRuntime, undefined, 'bundledWebRuntime should not be present');
});

test('package.json contains Capacitor 7 dependencies', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // Dependencies
  assert.ok(pkg.dependencies['@capacitor/core'], '@capacitor/core must be in dependencies');
  assert.ok(pkg.dependencies['@capacitor/android'], '@capacitor/android must be in dependencies');
  assert.ok(pkg.dependencies['@capacitor/haptics'], '@capacitor/haptics must be in dependencies');

  // DevDependencies
  assert.ok(pkg.devDependencies['@capacitor/cli'], '@capacitor/cli must be in devDependencies');

  // Verify Capacitor 7 versions
  assert.match(pkg.dependencies['@capacitor/core'], /^\^7\./, '@capacitor/core must be version 7');
  assert.match(pkg.dependencies['@capacitor/android'], /^\^7\./, '@capacitor/android must be version 7');
  assert.match(pkg.dependencies['@capacitor/haptics'], /^\^7\./, '@capacitor/haptics must be version 7');
  assert.match(pkg.devDependencies['@capacitor/cli'], /^\^7\./, '@capacitor/cli must be version 7');
});
