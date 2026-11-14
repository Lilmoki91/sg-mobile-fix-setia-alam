const CACHE_NAME = 'sg-mobile-fix-V16';

// Hanya aset awam. Jangan cache shell login, respons API atau data pengguna.
const urlsToCache = [
  '/styles.css', '/auth.css', '/manifest.json',
  '/loader.js', '/script.js', '/utils.js', '/translations.js', '/i18n.js',
  '/theme.js', '/navigation.js', '/scroll-dots.js', '/gallery-ui.js',
  '/testimonials-ui.js', '/service-filters.js', '/social-share.js',
  '/business-card.js', '/pwa-install.js',
  '/firebase-config.js', '/auth-client.js', '/profile.js',
  '/booking-firebase.js', '/shop-hours.js', '/services-firebase.js',
  '/booking-ui.js', '/services-ui.js', '/gallery-client.js',
  '/phones.js', '/testimonial-videos.js', '/ai-chatbot.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter(name => name.startsWith('sg-mobile-fix-') && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Sesi mesti datang daripada pelayan supaya cookie/logout/expiry sentiasa dipatuhi.
  // Navigasi juga tidak dibalas daripada HTML lama yang mungkin mengandungi auth lama.
  if (url.pathname.startsWith('/api/') || request.mode === 'navigate') return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      const cacheControl = response.headers.get('Cache-Control') || '';
      if (response.ok && response.type === 'basic' && !cacheControl.includes('no-store')) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (_) {
      return (await caches.match(request)) || Response.error();
    }
  })());
});
