// ==============================================
// SERVICE WORKER V8
// CACHE STRATEGIC + AUTO CLEAN OLD
// ==============================================

const CACHE_NAME = 'sg-mobile-fix-V8';

// 🔥 FAIL PENTING UNTUK DI-CACHE
const FILES_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './sg-mobile-fix-icon-192.png',  // <-- GUNA LALUAN TEMPATAN
  './sg-mobile-fix-icon-512.png'   // <-- GUNA LALUAN TEMPATAN
];

// ==============================================
// 📦 INSTALL - PRECACHE FAIL PENTING
// ==============================================
self.addEventListener('install', (event) => {
    console.log('Sg Mobile Fix V8: Install');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Pre-caching essential files...');
            return cache.addAll(FILES_TO_CACHE).catch((err) => {
                console.warn('⚠️ Some files failed to pre-cache:', err);
            });
        })
    );
    self.skipWaiting();
});

// ==============================================
// 🚀 ACTIVATE - BUANG CACHE LAMA SAHAJA
// ==============================================
self.addEventListener('activate', (event) => {
    console.log('Sg Mobile Fix V8: Activate');
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    // 🔥 HANYA BUANG CACHE YANG BUKAN VERSI SEMASA
                    if (key !== CACHE_NAME) {
                        console.log('🗑️ Old cache deleted:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Activation complete — cache V8 ready');
            return self.clients.claim();
        })
    );
});

// ==============================================
// 🔄 FETCH - CACHE FIRST, NETWORK FALLBACK
// ==============================================
self.addEventListener('fetch', (event) => {
    // Skip untuk API calls
    const url = event.request.url;
    if (url.includes('onrender.com') || url.includes('api/')) {
        return; // Biar network handle — jangan cache API
    }
    
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // ✅ Guna cache dulu (loading laju)
            if (cachedResponse) {
                // Update cache di background
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            
            // Tiada cache — cuba network
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Offline fallback
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

// ==============================================
// ⚡ MESSAGE - SKIP WAITING
// ==============================================
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        console.log('SW V8: Skip waiting');
        self.skipWaiting();
    }
});
