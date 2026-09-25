import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSaaSApp } from '../src/generate_saas_app.js';

test('Command Palette modal exists with keyboard shortcut binding', () => {
  const html = generateSaaSApp();
  assert.ok(html.includes('id="command-palette-modal"'), 'Must have command-palette-modal');
  assert.ok(html.includes('id="command-palette-input"'), 'Must have command-palette-input');
  assert.ok(html.includes('openCommandPalette'), 'Must define openCommandPalette');
  assert.ok(html.includes('closeCommandPalette'), 'Must define closeCommandPalette');
  assert.ok(html.includes("e.key.toLowerCase() === 'k'"), 'Must bind Ctrl+K or Cmd+K');
});
