import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSaaSApp } from '../src/generate_saas_app.js';

test('SaaS web app embeds YouTube player, uses square YouTube button, and eliminates cringe AI copy', () => {
  const html = generateSaaSApp();

  // 1. Embedded YouTube player inside cards
  assert.ok(html.includes('video-embed-ratio') || html.includes('video-embed-container'), 'Must have embedded video player container');
  assert.ok(html.includes('youtube-nocookie.com/embed/'), 'Must use privacy-enhanced embedded YouTube iframe');
  assert.ok(html.includes('allowfullscreen'), 'Embedded iframe must have allowfullscreen');

  // 2. Compact square YouTube button & native intent scheme
  assert.ok(html.includes('btn-watch-youtube-square'), 'Must have compact square YouTube button');
  assert.ok(html.includes('vnd.youtube:'), 'Must include vnd.youtube: native intent protocol');

  // 3. In-site video theater modal for table & search
  assert.ok(html.includes('id="in-site-video-modal"'), 'Must have in-site video player modal');
  assert.ok(html.includes('openInSiteVideoModal'), 'Must define openInSiteVideoModal');
  assert.ok(html.includes('closeInSiteVideoModal'), 'Must define closeInSiteVideoModal');

  // 4. Clean professional copy: NO cringe AI cheerleading
  assert.ok(!html.includes('Sıfır suçluluk'), 'Banned: "Sıfır suçluluk"');
  assert.ok(!html.includes('sıfır stres'), 'Banned: "sıfır stres"');
  assert.ok(!html.includes('✨ Program başarıyla güncellendi'), 'Banned: "✨ Program başarıyla güncellendi"');
  assert.ok(!html.includes('asla yıldırmasın'), 'Banned: "asla yıldırmasın"');
});
