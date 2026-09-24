import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../src/serve_web.js';

test('serve_web: starts server on ephemeral port and serves PWA static assets cleanly', async () => {
  // Start server on ephemeral port 0
  const { server, url, port } = await startServer(0);
  assert.ok(server, 'Server instance should be returned');
  assert.ok(port > 0, `Ephemeral port should be a positive integer, got ${port}`);
  assert.ok(url.startsWith('http://localhost:'), `URL should start with http://localhost:, got ${url}`);

  try {
    // 1. Fetch /index.html and assert 200 status, HTML doctype, and PWA headers
    const indexRes = await fetch(`${url}/index.html`);
    assert.equal(indexRes.status, 200, '/index.html should return status 200');
    assert.ok(
      indexRes.headers.get('content-type')?.includes('text/html'),
      'Content-Type should be text/html'
    );
    assert.equal(
      indexRes.headers.get('service-worker-allowed'),
      '/',
      'Service-Worker-Allowed header must be set to /'
    );
    const indexText = await indexRes.text();
    assert.ok(
      indexText.toLowerCase().includes('<!doctype html>'),
      '/index.html must contain <!DOCTYPE html>'
    );
    assert.ok(
      indexText.includes('YKS 2027 Koçu') || indexText.includes('YKS'),
      '/index.html must contain YKS app title'
    );

    // 2. Fetch / (root) and verify it also serves index.html
    const rootRes = await fetch(`${url}/`);
    assert.equal(rootRes.status, 200, '/ should return status 200');
    const rootText = await rootRes.text();
    assert.ok(
      rootText.toLowerCase().includes('<!doctype html>'),
      'Root / should serve index.html with <!DOCTYPE html>'
    );

    // 3. Fetch /manifest.json and assert application/json and valid JSON
    const manifestRes = await fetch(`${url}/manifest.json`);
    assert.equal(manifestRes.status, 200, '/manifest.json should return status 200');
    assert.ok(
      manifestRes.headers.get('content-type')?.includes('application/json'),
      'Content-Type for manifest.json should include application/json'
    );
    const manifestJson = await manifestRes.json();
    assert.equal(typeof manifestJson, 'object', 'manifest.json must be valid JSON');
    assert.ok(manifestJson.name, 'manifest.json must contain a name');
    assert.ok(manifestJson.icons?.length > 0, 'manifest.json must contain icons');

    // 4. Fetch /sw.js and assert 200 status and JS content-type
    const swRes = await fetch(`${url}/sw.js`);
    assert.equal(swRes.status, 200, '/sw.js should return status 200');
    assert.ok(
      swRes.headers.get('content-type')?.includes('javascript'),
      'Content-Type for sw.js should be javascript'
    );
    assert.equal(
      swRes.headers.get('service-worker-allowed'),
      '/',
      'sw.js must have Service-Worker-Allowed header set to /'
    );
    const swText = await swRes.text();
    assert.ok(
      swText.includes('CACHE_NAME') || swText.includes('self.addEventListener'),
      'sw.js should contain Service Worker cache logic'
    );

    // 5. Fetch SVG icon and verify image/svg+xml content-type
    const iconRes = await fetch(`${url}/icons/icon-192.svg`);
    assert.equal(iconRes.status, 200, '/icons/icon-192.svg should return status 200');
    assert.ok(
      iconRes.headers.get('content-type')?.includes('image/svg+xml'),
      'Content-Type for icon-192.svg should be image/svg+xml'
    );

    // 6. Fetch non-existent file and assert 404
    const notFoundRes = await fetch(`${url}/non-existent-file.xyz`);
    assert.equal(notFoundRes.status, 404, 'Non-existent file should return status 404');
  } finally {
    // 7. Clean shutdown without hanging
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});
