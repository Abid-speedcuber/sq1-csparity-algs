const CACHE_NAME = 'sq1-parity-v1.0.0';
const urlsToCache = [
  '/',
  '/cspapp.html',
  '/src/css/styles.css',
  '/src/js/svgs/svg.js',
  '/src/js/lib/database/shapeIndex.js',
  '/src/js/lib/database/algs.js',
  '/src/js/lib/tools/kalesParityTracer.js',
  '/src/js/lib/tools/scramblegenerator.js',
  '/src/js/lib/tools/draw-scramble.js',
  '/src/js/display/rendering/scrambleFormatting.js',
  '/src/js/js/constants-and-config.js',
  '/src/js/js/state-management.js',
  '/src/js/display/rendering/display-names.js',
  '/src/js/display/rendering/algorithm-display.js',
  '/src/js/display/rendering/search-and-filter.js',
  '/src/js/js/learning-state.js',
  '/src/js/display/rendering/card-rendering.js',
  '/src/js/lib/tools/scramble-generator.js',
  '/src/js/display/modals/modal-case-details.js',
  '/src/js/display/modals/modal-settings.js',
  '/src/js/display/modals/modal-case-names.js',
  '/src/js/display/modals/modal-parity-orientation.js',
  '/src/js/display/modals/modal-parity-analysis.js',
  '/src/js/display/modals/modal-info.js',
  '/src/js/display/modals/training-modal.js',
  '/src/js/js/global-event-handlers.js',
  '/src/js/js/initialization.js',
  '/src/media/icon-settings.svg'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Cache installation failed:', err);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(err => {
          console.error('Fetch failed:', err);
          // You could return a custom offline page here
          return new Response('Offline - please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});