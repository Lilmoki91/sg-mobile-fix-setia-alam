// Nama cache (versi) - Tukar jika ada kemaskini
const CACHE_NAME = 'sg-mobile-fix-v1';

// Senarai fail yang hendak di-cache
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './assets/pwa-icon/sg-mobile-icon-192.jpeg',
  './assets/pwa-icon/sg-mobile-fix-icon-512.jpeg'
];

// 1. Install Service Worker (Cache fail)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Aktifkan Service Worker (Padam cache lama)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Intercept Request (Hidangkan dari cache atau network)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Clone request dan fetch dari network
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(response => {
          // Cek response valid
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // Clone response untuk cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});
