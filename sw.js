const CACHE_NAME = 'fbr-tax-cache-v1';
const FILES_TO_CACHE = [
  '/tax_calc/',
  '/tax_calc/index.html',
  '/tax_calc/manifest.json',
  '/tax_calc/icon-192.png',
  '/tax_calc/icon-512.png'
];

// Install — cache all files
self.addEventListener('install', function(e) {
  console.log('[SW] Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[SW] Caching files');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(e) {
  console.log('[SW] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          console.log('[SW] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch — serve from cache first, fallback to network
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response) {
        return response; // serve from cache
      }
      return fetch(e.request).then(function(networkResponse) {
        return networkResponse;
      });
    }).catch(function() {
      // If offline and not cached, return index.html
      return caches.match('/tax_calc/index.html');
    })
  );
});
