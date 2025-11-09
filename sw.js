// Service Worker for Cyber Witches Game

const CACHE_NAME = 'spellwright-cache-v3';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.json',
    '/sw.js',
    // Bundled JavaScript (production) or individual files (development)
    '/js/game.bundle.js',
    // Fallback for development - individual files
    '/js/loadingState.js',
    '/js/errorHandler.js',
    '/js/commonUtils.js',
    '/js/utils.js',
    '/js/data.js',
    '/js/gameState.js',
    '/js/game.js',
    // External dependencies (CDN)
    'https://cdn.jsdelivr.net/npm/tone@15.1.22/build/Tone.js'
];

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
        caches.keys()
            .then((cacheNames) => {
                // Delete old caches
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated, old caches cleaned');
                return self.clients.claim();
            })
            .then(() => {
                return self.clients.matchAll();
            })
            .then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'CACHE_UPDATED' });
                });
            })
            .catch((error) => {
                console.error('Service Worker activation failed:', error);
            })
    );
});

// Fetch event - Network first, cache fallback strategy
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
    
    event.respondWith(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Try network first, fallback to cache
                return fetch(event.request)
                    .then((fetchResponse) => {
                        // Cache successful responses
                        if (fetchResponse.status === 200) {
                            const responseToCache = fetchResponse.clone();
                            cache.put(event.request, responseToCache);
                        }
                        return fetchResponse;
                    })
                    .catch((error) => {
                        // Network failed, try cache
                        return cache.match(event.request)
                            .then((cachedResponse) => {
                                if (cachedResponse) {
                                    return cachedResponse;
                                }
                                // If no cache and network fails, return error
                                console.error('Fetch failed and no cache:', error);
                                return new Response('Offline - Network error', { 
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: { 'Content-Type': 'text/plain' }
                                });
                            });
                    });
            })
            .catch((error) => {
                console.error('Cache error:', error);
                // Final fallback: try network
                return fetch(event.request).catch(() => 
                    new Response('Service Unavailable', { 
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain' }
                    })
                );
            })
    );
});