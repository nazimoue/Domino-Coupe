/* Minimal service worker to make the app installable as a PWA.
   Caches basic assets and serves cached responses when offline.
*/
const CACHE_NAME = 'domino-2026-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        // ignore individual failures
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // network-first for API requests, cache-first for others
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.url.includes('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      // cache the fetched resource
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(req, res.clone());
        return res;
      });
    }).catch(() => {
      // fallback to root
      return caches.match('/');
    }))
  );
});
