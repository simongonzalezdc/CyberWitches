// Service Worker for Hex Compiler

// Bump CACHE_VERSION on every deploy that changes cached assets. The activate
// handler deletes any cache whose name !== CACHE_NAME, so changing this string
// purges stale assets and forces one fresh fetch for returning players. The
// prefix was renamed from the legacy "spellwright-cache" to match the product.
const CACHE_VERSION = 'v23';
const CACHE_NAME = `hex-compiler-cache-${CACHE_VERSION}`;
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit
const scopeUrl = new URL(self.registration.scope);
const scopePath = scopeUrl.pathname.endsWith('/') ? scopeUrl.pathname : `${scopeUrl.pathname}/`;
const toScopeUrl = (assetPath) => new URL(assetPath, scopeUrl).toString();
const OFFLINE_URL = toScopeUrl('offline.html');

// Core app shell — same-origin assets required for the PWA to work offline.
// This list is precached ATOMICALLY (any failure rejects the install), so it must
// contain ONLY assets we control and that must always be present.
// NOTE: the service worker must NOT precache itself ('sw.js') — doing so can
// serve a stale worker and wedge updates. URLs are resolved against the active
// scope so the app works both at / and under GitHub Pages project paths.
const CORE_CACHE_URLS = [
    './',
    'index.html',
    'css/main.css',
    'css/base.css',
    'css/layout.css',
    'css/components.css',
    'css/animations.css',
    'css/responsive.css',
    'css/utilities.css',
    'manifest.json',
    'offline.html'
].map(toScopeUrl);

// Best-effort precache: a miss here only warns and must NEVER fail the install.
//  - The production JS bundle is absent on the dev server (ES modules are fetched
//    individually and runtime-cached instead).
//  - Tone.js is now SELF-HOSTED (vendored, same-origin). It's kept here as
//    best-effort rather than in the atomic core list because audio is optional
//    (graceful no-music fallback), so a precache hiccup must never break install.
//    Being same-origin, it's also runtime-cached on first load -> true offline.
const OPTIONAL_CACHE_URLS = [
    'js/game.bundle.js',
    'vendor/tone-15.1.22.js'
].map(toScopeUrl);

/**
 * Determine cache strategy for a request
 */
function getCacheStrategy(request) {
    const url = new URL(request.url);
    const relativePath = url.pathname.startsWith(scopePath)
        ? url.pathname.slice(scopePath.length)
        : url.pathname.replace(/^\/+/, '');
    
    // Static assets - cache first
    if (relativePath.match(/\.(html|css|js|json)$/)) {
        return 'cache-first';
    }
    
    // Images - cache first
    if (relativePath.match(/\.(png|jpg|jpeg|webp|svg|gif)$/)) {
        return 'cache-first';
    }
    
    // API - network first
    if (relativePath.startsWith('api/')) {
        return 'network-first';
    }
    
    // Default: cache first for same-origin
    if (url.origin === self.location.origin) {
        return 'cache-first';
    }
    
    return 'network-first';
}

/**
 * Cache-first strategy
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        // If network fails and no cache, return offline page
        if (request.mode === 'navigate') {
            const offlineResponse = await cache.match(OFFLINE_URL);
            return offlineResponse || new Response('Offline', { status: 503 });
        }
        throw error;
    }
}

/**
 * Network-first strategy
 */
async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
        throw error;
    }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    // Start fetch in background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => null);
    
    // Return cached immediately if available
    if (cached) {
        return cached;
    }
    
    // Otherwise wait for network
    return fetchPromise || new Response('Network error', { status: 503 });
}

/**
 * Enforce cache size limit
 */
async function enforceCacheSizeLimit() {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    let totalSize = 0;
    const entries = [];
    
    for (const request of keys) {
        const response = await cache.match(request);
        // cache.match() can return undefined if the request isn't cached
        if (!response) {
            console.warn(`No cached response found for: ${request.url}`);
            continue;
        }
        
        const blob = await response.blob();
        const size = blob.size;
        totalSize += size;
        entries.push({ request, size, timestamp: Date.now() });
    }
    
    // Remove oldest entries if over limit
    if (totalSize > MAX_CACHE_SIZE) {
        entries.sort((a, b) => a.timestamp - b.timestamp);
        for (const entry of entries) {
            if (totalSize <= MAX_CACHE_SIZE) break;
            await cache.delete(entry.request);
            totalSize -= entry.size;
        }
    }
}

// Install event
self.addEventListener('install', (event) => {
    console.info('Service Worker installing...');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.info('Service Worker installed, cache opened');
                // CORE shell is atomic: if ANY required asset fails, the whole
                // install REJECTS so this worker does not activate and the previous
                // worker + its complete cache are preserved. Activating with a
                // half-populated core (then deleting the old cache in `activate`)
                // would break offline/cache-first navigations.
                const core = cache.addAll(CORE_CACHE_URLS);
                // OPTIONAL assets are best-effort: a miss (e.g. the prod bundle on
                // the dev server) only warns and must never fail the install.
                const optional = OPTIONAL_CACHE_URLS.map(url =>
                    cache.add(new Request(url)).catch(() => {
                        console.warn(`SW: optional asset not precached (expected on dev): ${url}`);
                    })
                );
                return Promise.all([core, ...optional]);
            })
            .then(() => {
                console.info('Service Worker installed, files cached');
                self.skipWaiting();
            })
            .catch((error) => {
                // Re-throw so waitUntil() rejects and the install fails — keeping the
                // last good worker instead of activating a broken one.
                console.error('Service Worker installation failed (core precache):', error);
                throw error;
            })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.info('Service Worker activating...');
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.info('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Enforce cache size limit
            enforceCacheSizeLimit()
        ]).then(() => {
            console.info('Service Worker activated, old caches cleaned');
            return self.clients.claim();
        }).then(() => {
            return self.clients.matchAll();
        }).then((clients) => {
            clients.forEach((client) => {
                client.postMessage({ type: 'CACHE_UPDATED' });
            });
        }).catch((error) => {
            console.error('Service Worker activation failed:', error);
        })
    );
});

// Fetch event - Improved caching strategies
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Only handle same-origin requests. Tone.js is now self-hosted, so there are
    // no external CDN requests for the worker to special-case.
    const isSameOrigin = event.request.url.startsWith(self.location.origin);
    if (!isSameOrigin) {
        return; // Skip cross-origin requests
    }

    const strategy = getCacheStrategy(event.request);
    
    let responsePromise;
    
    switch (strategy) {
        case 'cache-first':
            responsePromise = cacheFirst(event.request);
            break;
        case 'network-first':
            responsePromise = networkFirst(event.request);
            break;
        case 'stale-while-revalidate':
            responsePromise = staleWhileRevalidate(event.request);
            break;
        default:
            responsePromise = networkFirst(event.request);
    }
    
    event.respondWith(
        responsePromise.catch((error) => {
            console.error('Fetch failed:', error);
            // Final fallback: offline page for navigation requests
            if (event.request.mode === 'navigate') {
                return caches.match(OFFLINE_URL).then((offlineResponse) => {
                    return offlineResponse || new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/html' }
                    });
                });
            }
            return new Response('Network error', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain' }
            });
        })
    );
});
