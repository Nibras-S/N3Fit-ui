// Basic service worker for N3FitBook PWA
// CACHE_NAME is rewritten at build time so every deploy gets a fresh cache
// and the activate handler evicts the previous version's entries.
const CACHE_NAME = 'n3fitbook-__BUILD_ID__';

// Static app-shell entries that exist in /public at dev time.
const STATIC_PRECACHE = [
    '/',
    '/index.html',
    '/n3fitbook-192.png',
    '/n3fitbook-192.webp',
    '/n3fitbook.svg',
    '/manifest.json',
];

// Hashed build assets (main.<hash>.js, <chunk>.<hash>.chunk.js, main.<hash>.css, ...)
// are injected at build time by scripts/sw-inject.js — it replaces the
// __PRECACHE_MANIFEST__ token below with a real array. At dev time the token
// stays in place and the parsed value is an empty array, so the dev SW only
// precaches the static shell (which is what we want — webpack-dev-server
// serves unhashed bundles).
const HASHED_PRECACHE = self.__PRECACHE_MANIFEST__ || [];

const PRECACHE_URLS = [...STATIC_PRECACHE, ...HASHED_PRECACHE];

// Install — cache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Never handle API requests
    if (url.pathname.startsWith('/api/')) return;

    // Hashed build assets under /static/ are immutable (filename contains the
    // content hash). Cache-first is safe — a different hash == a different URL,
    // so stale entries can never collide with a new build, and the activate
    // handler evicts the previous build's entries via the bumped CACHE_NAME.
    // Extra guard: if a /static/ fetch ever returned an HTML fallback (the
    // previous cache-poisoning bug), refuse to store it.
    if (url.pathname.startsWith('/static/')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (!response || response.status !== 200 || response.type === 'opaque') {
                        return response;
                    }
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('text/html')) return response;
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // Network-first for navigation requests, with cache fallback for offline.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
        );
        return;
    }

    // Cache-first for other same-origin static assets (images, fonts, manifest).
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                // Guard: never cache an HTML response under a non-HTML URL.
                // This is what previously poisoned the cache for chunk URLs.
                const contentType = response.headers.get('content-type') || '';
                const looksLikeHtml = contentType.includes('text/html');
                const urlLooksLikeAsset = /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|ico)$/i.test(url.pathname);
                if (looksLikeHtml && urlLooksLikeAsset) {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                return response;
            }).catch(() => cached);
        })
    );
});
