// Service Worker for ESWATINI CARS PWA
// Provides offline caching for the app shell
//
// VERSION HISTORY:
//   v7 (2026-10-27 PM4): Vehicle Requests — fix persistence bug + add
//                        edit + delete features.
//                        - POST /api/requests now actually persists requests
//                          to Turso DB (was only being stored in local React
//                          state, so they vanished on refresh — that was the
//                          "after I post a request, request disappears after
//                          refresh of app" bug)
//                        - New useEffect fetches requests on mount + every
//                          30s, so users always see their own (and others')
//                          requests across page refreshes
//                        - New PATCH /api/requests/[id] endpoint + Edit button
//                          in My Requests UI (pre-fills form, "Save changes")
//                        - New DELETE /api/requests/[id] endpoint + Delete
//                          button in My Requests UI (with confirmation prompt)
//                        - Server enforces ownership: only the original
//                          requester (matched by session email) or an admin
//                          can edit/delete a request
//                        - Request form auto-fills name + email from the
//                          logged-in user, so creating a request is faster
//                          for registered users
//                        - VehicleRequest type updated to reflect that
//                          make/model/minBudget/maxBudget/description/
//                          requesterPhone are nullable in the DB
//   v5 (2026-10-27 PM2): Restore previously-working UI features that regressed
//                        during the auth migration:
//                        - 'Saved' button in header is faint (opacity-40) when
//                          logged out + requires login to view
//                        - 'Saved Vehicles' drawer item is faint + grey when
//                          logged out + requires login to view
//                        - Hamburger button hidden when drawer is open so the
//                          X (close) button at the top of the drawer is
//                          visible and clickable
//                        - 'Most Recent' sort now actually re-sorts listings
//                          on the client (was relying on server default order,
//                          which was being masked by featured-first ordering)
//                        - apiFetchListings now falls back to cached listings
//                          if the API is unreachable (was returning empty
//                          array, causing the homepage to look broken)
//   v4 (2026-10-27 PM): Fix "r.filter is not a function" — root caused to a
//                       non-array cachedListings value in localStorage (likely
//                       written by a pre-Vercel build of the app). Page.tsx
//                       initializers now validate Array.isArray before use.
//   v3 (2026-10-27 AM): Force cache invalidation — previous deploys left stale JS
//                       chunks on user devices that crashed the page on hydration.
//                       New SW deletes the v2 cache on activation, so all users get
//                       a clean fetch on next load.
//   v2: initial SW for the Vercel-hosted app
//   v1: legacy SW from the Netlify-hosted app

const CACHE_NAME = 'eswatini-cars-v10';
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
