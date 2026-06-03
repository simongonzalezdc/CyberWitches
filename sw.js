// Service Worker for Hex Compiler

// Bump CACHE_VERSION on every deploy that changes cached assets. The activate
// handler deletes any cache whose name !== CACHE_NAME, so changing this string
// purges stale assets and forces one fresh fetch for returning players. The
// prefix was renamed from the legacy "spellwright-cache" to match the product.
const CACHE_VERSION = 'v19';
const CACHE_NAME = `hex-compiler-cache-${CACHE_VERSION}`;
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit

const CACHE_URLS = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/base.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/css/utilities.css',
    '/manifest.json',
    '/sw.js',
    '/offline.html',
    // External dependencies (CDN)
    'https://cdn.jsdelivr.net/npm/tone@15.1.22/build/Tone.js'
];

// Cache strategies
const CACHE_STRATEGIES = {
    static: 'cache-first',      // HTML, CSS, JS bundles
    images: 'cache-first',       // Images
    api: 'network-first',        // API calls
    cdn: 'stale-while-revalidate' // CDN resources
};

/**
 * Determine cache strategy for a request
 */
function getCacheStrategy(request) {
    const url = new URL(request.url);
    
    // Static assets - cache first
    if (url.pathname.match(/\.(html|css|js|json)$/)) {
        return 'cache-first';
    }
    
    // Images - cache first
    if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif)$/)) {
        return 'cache-first';
    }
    
    // CDN - stale while revalidate
    if (url.hostname.includes('cdn.jsdelivr.net')) {
        return 'stale-while-revalidate';
    }
    
    // API - network first
    if (url.pathname.startsWith('/api/')) {
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
            return cache.match('/offline.html') || new Response('Offline', { status: 503 });
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
    console.log('Service Worker installing...');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker installed, cache opened');
                return cache.addAll(CACHE_URLS.map(url => new Request(url)));
            })
            .then(() => {
                console.log('Service Worker installed, files cached');
                self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker installation failed:', error);
            })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Enforce cache size limit
            enforceCacheSizeLimit()
        ]).then(() => {
            console.log('Service Worker activated, old caches cleaned');
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

    // Handle same-origin and CDN requests
    const isSameOrigin = event.request.url.startsWith(self.location.origin);
    const isCDN = event.request.url.includes('cdn.jsdelivr.net');

    if (!isSameOrigin && !isCDN) {
        return; // Skip other cross-origin requests
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
                return caches.match('/offline.html') || new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/html' }
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
