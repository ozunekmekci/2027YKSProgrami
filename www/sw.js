// YKS 2027 Koçu — Offline-First Service Worker
const CACHE_NAME = 'yks-kochu-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

// Install: Cache all core application assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Purge obsolete caches and claim existing clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Cache-First strategy for local assets with navigation offline fallback
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Ignore YouTube API, media streams, and external video services
  if (
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('youtu.be') ||
    url.hostname.includes('ytimg.com') ||
    url.hostname.includes('googlevideo.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Put successful same-origin responses into cache
          const origin = self.location ? self.location.origin : '';
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (!origin || url.origin === origin)
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html').then((fallback) => {
              return fallback || caches.match('./');
            });
          }
        });
    })
  );
});
