// Service Worker for Cyber Witches Game

const CACHE_NAME = 'cyber-witches-cache-v1';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/data.js',
    '/js/utils.js',
    '/js/errorHandler.js',
    '/js/commonUtils.js',
    '/js/animations.js',
    '/js/virtualScroll.js',
    '/js/covenSystem.js',
    '/js/mobile.js',
    '/js/accessibility.js',
    '/js/cloudSave.js',
    '/js/analytics.js',
    '/js/particleEffects.js',
    '/js/performanceMonitor.js',
    '/js/gameState.js',
    '/js/dailyRituals.js',
    '/js/achievements.js',
    '/js/comboSystem.js',
    '/js/eventSystem.js',
    '/js/game.js'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME))
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
        });
});

// Activate event
self.addEventListener('activate', (Event) => {
    console.log('Service Worker activating...');
    Event.waitUntil(caches.open(CACHE_NAME))
        .then((cache) => {
            console.log('Service Worker activated, cache opened');
            return cache.addAll(CACHE_URLS.map(url => new Request(url)));
        })
        .then(() => {
            console.log('Service Worker activated, files cached');
            self.clients.claim().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'CACHE_UPDATED' });
                });
            });
        })
        .catch((error) => {
            console.error('Service Worker activation failed:', error);
        });
});

// Fetch event
self.addEventListener('fetch', (Event) => {
    Event.respondWith(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.match(Event.request)
                    .then((response) => {
                        // Return cached version if available
                        if (response) {
                            return response;
                        }
                        
                        // Otherwise fetch from network
                        return fetch(Event.request)
                            .then((fetchResponse) => {
                                // Cache the response for future use
                                if (fetchResponse.status === 200) {
                                    cache.put(Event.request, fetchResponse.clone());
                                }
                                return fetchResponse;
                            })
                            .catch((error) => {
                                console.error('Fetch failed:', error);
                                return new Response('Network error', { status: 500 });
                            });
                    });
            })
            .catch((error) => {
                console.error('Cache error:', error);
                return new Response('Cache error', { status: 500 });
            });
    });
});