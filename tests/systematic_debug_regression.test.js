import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import http from 'node:http';

// ---------------------------------------------------------------------------
// 1. Service Worker Protocol Guard Tests
// ---------------------------------------------------------------------------
test('www/index.html guards service worker registration against file: protocol and null origin', () => {
  const html = fs.readFileSync('www/index.html', 'utf8');

  // Verify that navigator.serviceWorker.register is guarded with protocol check
  assert.ok(
    html.includes("location.protocol.startsWith('http')") ||
    html.includes("location.protocol === 'https:' || location.protocol === 'http:'") ||
    (html.includes("location.protocol") && html.includes("localhost")),
    'www/index.html must check location.protocol before registering service worker to prevent DOMException on file://'
  );
});

test('src/web/app.ts registerServiceWorker checks protocol before registration', () => {
  const code = fs.readFileSync('src/web/app.ts', 'utf8');

  assert.ok(
    code.includes("window.location.protocol.startsWith('http')") ||
    code.includes("window.location.protocol === 'https:'") ||
    (code.includes("location.protocol") && code.includes("localhost")),
    'src/web/app.ts must guard registerServiceWorker against file: protocol'
  );
});

// ---------------------------------------------------------------------------
// 2. HTML Entity Escaping & XSS Protection Tests
// ---------------------------------------------------------------------------
test('escapeHtml sanitizes &, <, >, ", and \' characters properly', async () => {
  const appModule = await import('../src/web/app.js').catch(() => null) || await import('../dist/web/app.js');
  assert.ok(typeof appModule.escapeHtml === 'function', 'escapeHtml must be exported as a function');

  const raw = `<script>alert("XSS & 'quotes'")</script>`;
  const escaped = appModule.escapeHtml(raw);

  assert.ok(!escaped.includes('<script>'), 'Must escape <');
  assert.ok(!escaped.includes('</script>'), 'Must escape >');
  assert.ok(!escaped.includes('"XSS'), 'Must escape double quotes');
  assert.ok(!escaped.includes("'quotes'"), 'Must escape single quotes');
  assert.ok(!escaped.includes('& '), 'Must escape ampersand');

  assert.equal(
    escaped,
    '&lt;script&gt;alert(&quot;XSS &amp; &#39;quotes&#39;&quot;)&lt;/script&gt;'
  );
});

// ---------------------------------------------------------------------------
// 3. Service Worker Quota Exceeded Catch Guard Tests
// ---------------------------------------------------------------------------
test('www/sw.js guards cache.put against quota exceptions with error catch handler', () => {
  const swCode = fs.readFileSync('www/sw.js', 'utf8');

  // Verify that caches.open(...).then(...cache.put...) has an explicit .catch attached
  assert.match(
    swCode,
    /cache\.put\([^)]+\)\s*\.catch|\.then\([^)]*cache\.put[^)]*\)\s*\.catch/,
    'cache.put or its caches.open promise chain in sw.js must have an explicit .catch handler'
  );
});

// ---------------------------------------------------------------------------
// 4. Server HEAD Request & Host Configuration Tests
// ---------------------------------------------------------------------------
test('serve_web handles HEAD requests cleanly with 200 OK', async () => {
  const { startServer } = await import('../src/serve_web.js');
  const { server, port } = await startServer(0);

  try {
    const res = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/',
          method: 'HEAD'
        },
        resolve
      );
      req.on('error', reject);
      req.end();
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
  } finally {
    server.close();
  }
});
