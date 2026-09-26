import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// ---------------------------------------------------------------------------
// 1. PWA Manifest (www/manifest.json) Validation
// ---------------------------------------------------------------------------
test('www/manifest.json exists and is valid JSON', () => {
  assert.ok(fs.existsSync('www/manifest.json'), 'www/manifest.json must exist');
  const raw = fs.readFileSync('www/manifest.json', 'utf8');
  let manifest;
  assert.doesNotThrow(() => {
    manifest = JSON.parse(raw);
  }, 'www/manifest.json must be valid JSON');
  assert.ok(manifest && typeof manifest === 'object', 'manifest must parse to an object');
});

test('www/manifest.json satisfies all W3C and project requirements', () => {
  const manifest = JSON.parse(fs.readFileSync('www/manifest.json', 'utf8'));

  assert.equal(
    manifest.name,
    'YKS 2027 Koçu — Çalışma Programı & Dijital Asistan',
    'name must match exact spec'
  );
  assert.equal(manifest.short_name, 'YKS 2027', 'short_name must match YKS 2027');
  assert.equal(
    manifest.description,
    'Sıfırdan başlayan YKS öğrencileri için 766 videoluk planlayıcı, mola sayacı ve shift motoru',
    'description must match exact spec'
  );
  assert.equal(manifest.start_url, './index.html', 'start_url must be ./index.html');
  assert.equal(manifest.display, 'standalone', 'display must be standalone');
  assert.equal(manifest.orientation, 'any', 'orientation must be any');
  assert.equal(manifest.background_color, '#0f172a', 'background_color must be Slate #0f172a');
  assert.equal(manifest.theme_color, '#0f172a', 'theme_color must be Slate #0f172a');
  assert.equal(manifest.lang, 'tr', 'lang must be tr');

  assert.ok(Array.isArray(manifest.categories), 'categories must be an array');
  assert.ok(manifest.categories.includes('education'), 'categories must include education');
  assert.ok(manifest.categories.includes('productivity'), 'categories must include productivity');

  assert.ok(Array.isArray(manifest.icons), 'icons must be an array');
  assert.ok(manifest.icons.length >= 2, 'icons must define at least 192x192 and 512x512');

  const icon192 = manifest.icons.find((i) => i.sizes === '192x192');
  assert.ok(icon192, '192x192 icon entry must exist in manifest');
  assert.equal(icon192.src, 'icons/icon-192.svg');
  assert.equal(icon192.type, 'image/svg+xml');
  assert.ok(icon192.purpose && icon192.purpose.includes('maskable'), '192x192 must support maskable purpose');

  const icon512 = manifest.icons.find((i) => i.sizes === '512x512');
  assert.ok(icon512, '512x512 icon entry must exist in manifest');
  assert.equal(icon512.src, 'icons/icon-512.svg');
  assert.equal(icon512.type, 'image/svg+xml');
  assert.ok(icon512.purpose && icon512.purpose.includes('maskable'), '512x512 must support maskable purpose');
});

// ---------------------------------------------------------------------------
// 2. Vector SVG Icons (www/icons/icon-192.svg & icon-512.svg)
// ---------------------------------------------------------------------------
test('www/icons/icon-192.svg exists and is valid vector SVG', () => {
  const iconPath = 'www/icons/icon-192.svg';
  assert.ok(fs.existsSync(iconPath), 'icon-192.svg must exist');

  const content = fs.readFileSync(iconPath, 'utf8').trim();
  assert.ok(content.startsWith('<svg') && content.endsWith('</svg>'), 'must be a valid SVG document root');
  assert.match(content, /viewBox="[^"]*192[^"]*"/, 'must have viewBox with 192 dimensions');
  assert.match(content, /width="192"/, 'must declare width 192');
  assert.match(content, /height="192"/, 'must declare height 192');
  assert.ok(content.includes('#0f172a'), 'must use Slate #0f172a background');
  assert.ok(content.includes('#10b981'), 'must use Mint #10b981 accent');
});

test('www/icons/icon-512.svg exists and is valid vector SVG', () => {
  const iconPath = 'www/icons/icon-512.svg';
  assert.ok(fs.existsSync(iconPath), 'icon-512.svg must exist');

  const content = fs.readFileSync(iconPath, 'utf8').trim();
  assert.ok(content.startsWith('<svg') && content.endsWith('</svg>'), 'must be a valid SVG document root');
  assert.match(content, /viewBox="[^"]*512[^"]*"/, 'must have viewBox with 512 dimensions');
  assert.match(content, /width="512"/, 'must declare width 512');
  assert.match(content, /height="512"/, 'must declare height 512');
  assert.ok(content.includes('#0f172a'), 'must use Slate #0f172a background');
  assert.ok(content.includes('#10b981'), 'must use Mint #10b981 accent');
});

// ---------------------------------------------------------------------------
// 3. Service Worker (www/sw.js) Syntax & Constants
// ---------------------------------------------------------------------------
test('www/sw.js exists, compiles cleanly, and defines core cache assets', () => {
  assert.ok(fs.existsSync('www/sw.js'), 'www/sw.js must exist');
  const code = fs.readFileSync('www/sw.js', 'utf8');

  // Verify JavaScript syntax by compiling in vm
  assert.doesNotThrow(() => {
    new vm.Script(code);
  }, 'www/sw.js must be syntactically valid JavaScript');

  assert.match(code, /yks-kochu-v[12]/, 'must define cache name yks-kochu-v2');
  assert.match(code, /'\.\/'/, "must include './' in core assets");
  assert.match(code, /'\.\/index\.html'/, "must include './index.html' in core assets");
  assert.match(code, /'\.\/manifest\.json'/, "must include './manifest.json' in core assets");
  assert.match(code, /icons\/icon-192\.svg/, 'must include icon-192.svg in core assets');
  assert.match(code, /icons\/icon-512\.svg/, 'must include icon-512.svg in core assets');
});

// ---------------------------------------------------------------------------
// 4. Service Worker Lifecycle & Cache Logic
// ---------------------------------------------------------------------------
function createMockServiceWorkerEnv(options = {}) {
  const {
    fetch = async () => ({ status: 200, clone: () => ({ status: 200 }) }),
    origin = 'http://localhost:3000'
  } = options;

  const listeners = {};
  let skipWaitingCalled = false;
  let clientsClaimCalled = false;
  const mockCacheStore = new Map();

  const mockCache = {
    addAll: async (assets) => {
      for (const asset of assets) {
        mockCacheStore.set(asset, { url: asset, status: 200 });
      }
    },
    put: async (request, response) => {
      const key = typeof request === 'string' ? request : request.url;
      mockCacheStore.set(key, response);
    },
    match: async (request) => {
      const key = typeof request === 'string' ? request : request.url;
      return mockCacheStore.get(key) || null;
    }
  };

  const cachesMap = new Map();
  cachesMap.set('yks-kochu-v2', mockCache);

  const mockCaches = {
    open: async (name) => {
      if (!cachesMap.has(name)) {
        cachesMap.set(name, {
          addAll: async () => {},
          put: async (req, res) => mockCacheStore.set(typeof req === 'string' ? req : req.url, res),
          match: async (req) => mockCacheStore.get(typeof req === 'string' ? req : req.url) || null
        });
      }
      return cachesMap.get(name);
    },
    match: async (request) => {
      const key = typeof request === 'string' ? request : request.url;
      return mockCacheStore.get(key) || null;
    },
    keys: async () => Array.from(cachesMap.keys()),
    delete: async (name) => cachesMap.delete(name)
  };

  const mockSelf = {
    location: { origin },
    addEventListener: (event, fn) => {
      listeners[event] = fn;
    },
    skipWaiting: () => {
      skipWaitingCalled = true;
    },
    clients: {
      claim: async () => {
        clientsClaimCalled = true;
      }
    }
  };

  const sandbox = {
    self: mockSelf,
    caches: mockCaches,
    fetch,
    URL,
    Promise,
    console
  };

  const context = vm.createContext(sandbox);
  const code = fs.readFileSync('www/sw.js', 'utf8');
  vm.runInContext(code, context);

  return {
    listeners,
    mockCacheStore,
    cachesMap,
    mockCaches,
    mockSelf,
    getSkipWaitingCalled: () => skipWaitingCalled,
    getClientsClaimCalled: () => clientsClaimCalled
  };
}

test('sw.js install event caches core assets and skips waiting', async () => {
  const env = createMockServiceWorkerEnv();
  assert.ok(env.listeners['install'], 'install listener must be registered');

  let waitPromise = null;
  env.listeners['install']({
    waitUntil: (p) => {
      waitPromise = p;
    }
  });

  await waitPromise;

  assert.ok(env.getSkipWaitingCalled(), 'self.skipWaiting() must be called on install');
  assert.ok(env.mockCacheStore.has('./index.html'), './index.html must be cached');
  assert.ok(env.mockCacheStore.has('./manifest.json'), './manifest.json must be cached');
  assert.ok(env.mockCacheStore.has('./icons/icon-192.svg'), 'icon-192.svg must be cached');
  assert.ok(env.mockCacheStore.has('./icons/icon-512.svg'), 'icon-512.svg must be cached');
});

test('sw.js activate event removes obsolete caches and claims clients', async () => {
  const env = createMockServiceWorkerEnv();
  assert.ok(env.listeners['activate'], 'activate listener must be registered');

  // Add stale caches to verify deletion
  env.cachesMap.set('yks-kochu-v1', {});
  env.cachesMap.set('old-unused-cache', {});

  let waitPromise = null;
  env.listeners['activate']({
    waitUntil: (p) => {
      waitPromise = p;
    }
  });

  await waitPromise;

  assert.ok(env.getClientsClaimCalled(), 'self.clients.claim() must be called on activate');
  assert.ok(!env.cachesMap.has('yks-kochu-v1'), 'old cache yks-kochu-v1 must be purged');
  assert.ok(!env.cachesMap.has('old-unused-cache'), 'old-unused-cache must be purged');
  assert.ok(env.cachesMap.has('yks-kochu-v2'), 'current cache yks-kochu-v2 must be preserved');
});

test('sw.js fetch handler uses network-first for navigation requests and updates cache', async () => {
  const freshResponse = {
    status: 200,
    body: '<html>fresh navigation html</html>',
    clone: () => ({ status: 200, body: '<html>cloned fresh html</html>' })
  };

  const env = createMockServiceWorkerEnv({
    fetch: async () => freshResponse
  });

  // Seed cache with older content
  env.mockCacheStore.set('./index.html', { status: 200, body: '<html>old cached</html>' });

  let respondedPromise = null;
  env.listeners['fetch']({
    request: {
      url: 'http://localhost:3000/index.html',
      method: 'GET',
      mode: 'navigate'
    },
    respondWith: (p) => {
      respondedPromise = p;
    }
  });

  const response = await respondedPromise;
  assert.equal(response, freshResponse, 'Navigation request must return fresh network response, not stale cache');
  assert.ok(env.mockCacheStore.has('http://localhost:3000/index.html'), 'Fresh navigation response must be stored in cache');
});

test('sw.js fetch handler uses cache-first for cached assets', async () => {
  const env = createMockServiceWorkerEnv();
  assert.ok(env.listeners['fetch'], 'fetch listener must be registered');

  // Seed cache with index.html
  const cachedContent = { status: 200, body: '<html>cached index</html>' };
  env.mockCacheStore.set('http://localhost:3000/index.html', cachedContent);

  let respondedPromise = null;

  env.listeners['fetch']({
    request: {
      url: 'http://localhost:3000/index.html',
      method: 'GET'
    },
    respondWith: (p) => {
      respondedPromise = p;
    }
  });

  const response = await respondedPromise;
  assert.equal(response, cachedContent, 'Cache-first must return cached asset directly');
});

test('sw.js fetch handler fetches and caches non-cached same-origin assets', async () => {
  let putKey = null;
  let putValue = null;
  const mockResponse = {
    status: 200,
    body: 'fresh data',
    clone: () => ({ status: 200, body: 'cloned fresh data' })
  };

  const env = createMockServiceWorkerEnv({
    fetch: async () => mockResponse
  });

  let respondedPromise = null;
  env.listeners['fetch']({
    request: {
      url: 'http://localhost:3000/api/extra-data',
      method: 'GET'
    },
    respondWith: (p) => {
      respondedPromise = p;
    }
  });

  const res = await respondedPromise;
  assert.equal(res.status, 200);
  assert.ok(env.mockCacheStore.has('http://localhost:3000/api/extra-data'), 'Should cache fetched same-origin asset');
});

test('sw.js fetch handler bypasses YouTube API and external video services', async () => {
  const env = createMockServiceWorkerEnv();

  const externalUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
    'https://rr1---sn-4g5ednks.googlevideo.com/videoplayback?id=123'
  ];

  for (const url of externalUrls) {
    let respondWithCalled = false;
    env.listeners['fetch']({
      request: {
        url,
        method: 'GET'
      },
      respondWith: () => {
        respondWithCalled = true;
      }
    });

    assert.equal(
      respondWithCalled,
      false,
      `Service worker must not intercept external media URL: ${url}`
    );
  }
});

test('sw.js fetch handler ignores non-GET requests', () => {
  const env = createMockServiceWorkerEnv();

  let respondWithCalled = false;
  env.listeners['fetch']({
    request: {
      url: 'http://localhost:3000/api/save',
      method: 'POST'
    },
    respondWith: () => {
      respondWithCalled = true;
    }
  });

  assert.equal(respondWithCalled, false, 'Non-GET requests must not be intercepted');
});

test('sw.js fetch handler gracefully falls back to cached index.html for navigation when offline', async () => {
  const cachedFallback = { status: 200, body: '<html>offline fallback</html>' };

  const env = createMockServiceWorkerEnv({
    fetch: async () => {
      throw new Error('Network failure (offline)');
    }
  });
  env.mockCacheStore.set('./index.html', cachedFallback);

  let respondedPromise = null;
  env.listeners['fetch']({
    request: {
      url: 'http://localhost:3000/calendar',
      method: 'GET',
      mode: 'navigate'
    },
    respondWith: (p) => {
      respondedPromise = p;
    }
  });

  const response = await respondedPromise;
  assert.equal(response, cachedFallback, 'Navigation request offline must fall back to cached index.html');
});
