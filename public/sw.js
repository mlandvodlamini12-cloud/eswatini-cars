// Service Worker for ESWATINI CARS PWA
// Provides offline caching for the app shell
//
// VERSION HISTORY:
//   v3 (2026-10-27): Force cache invalidation — previous deploys left stale JS
//                     chunks on user devices that crashed the page on hydration.
//                     New SW deletes the v2 cache on activation, so all users get
//                     a clean fetch on next load.
//   v2: initial SW for the Vercel-hosted app
//   v1: legacy SW from the Netlify-hosted app

const CACHE_NAME = 'eswatini-cars-v3';
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

// Activate: clean up old caches and force all open tabs to reload with fresh assets.
// This is critical when a deploy ships broken JS chunks: without the reload, the
// already-open tab keeps running the old (broken) code even after the new SW
// takes over.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        const deletions = keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key));
        return Promise.all(deletions);
      })
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clientList) => {
        // Tell every open tab to do a hard reload (bypassing cache) so the user
        // picks up the new JS chunks immediately, no manual close/reopen needed.
        clientList.forEach((client) => {
          try {
            client.navigate(client.url);
          } catch {}
        });
      })
  );
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
