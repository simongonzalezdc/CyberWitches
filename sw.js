// Service Worker for Cyber Witches Game

const CACHE_NAME = 'cyber-witches-cache-v2';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.json',
    '/sw.js',
    // Core utilities
    '/js/data.js',
    '/js/utils.js',
    '/js/errorHandler.js',
    '/js/commonUtils.js',
    '/js/animations.js',
    // Game systems
    '/js/gameState.js',
    '/js/game.js',
    '/js/designTierSystem.js',
    // UI and rendering
    '/js/virtualScroll.js',
    '/js/particleEffects.js',
    '/js/celebrationAnimations.js',
    // Game features
    '/js/achievements.js',
    '/js/comboSystem.js',
    '/js/dailyRituals.js',
    '/js/eventSystem.js',
    // Coven system files archived - see ARCHIVED_COVEN_FEATURES.md
    // '/js/covenSystem.js',
    // '/js/covenChat.js',
    // '/js/covenEvents.js',
    // '/js/covenAchievements.js',
    // '/js/socialLeaderboards.js', // Archived
    // Meditation system
    '/js/meditationState.js',
    '/js/meditationUI.js',
    '/js/meditationTowers.js',
    // Audio and accessibility
    '/js/audioSystem.js',
    '/js/accessibility.js',
    // Additional features
    '/js/mobile.js',
    '/js/cloudSave.js',
    '/js/analytics.js',
    '/js/performanceMonitor.js',
    '/js/debug.js',
    '/js/easterEggs.js',
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