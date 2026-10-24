// Service Worker for ESWATINI CARS PWA
// Provides offline caching for the app shell

const CACHE_NAME = 'eswatini-cars-v2';
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {
        // If any single resource fails, the install still succeeds
        // (so the SW doesn't get stuck)
        return Promise.all(
          APP_SHELL.map(url =>
            cache.add(url).catch(() => null)
          )
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for pages, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests (analytics, external images, etc.)
  if (url.origin !== self.location.origin) return;

  // Skip API requests (always fetch fresh)
  if (url.pathname.startsWith('/api/')) return;

  // Skip uploaded images (too large to cache, and they may be new)
  if (url.pathname.startsWith('/uploads/')) return;

  // For navigation requests (HTML pages): network-first, fall back to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache the latest version
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('/', clone));
          return response;
        })
        .catch(() =>
          caches.match('/').then(cached => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // For static assets: cache-first, fall back to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then(response => {
        // Cache successful responses
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
