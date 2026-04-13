// Basic service worker for Fit PWA
const CACHE_NAME = 'fit-v2';
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/n3Logo.png',
];

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

    // Never handle hashed build assets — let the network serve them directly.
    // Caching these would let a stale SW serve the HTML SPA-fallback under a
    // .js URL, which the browser then tries to parse as JavaScript.
    if (url.pathname.startsWith('/static/')) return;

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
