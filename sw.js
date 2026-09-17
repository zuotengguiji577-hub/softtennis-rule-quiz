const CACHE_NAME = 'softtennis-rule-challenge-v1';

const APP_SHELL = [
  './',
  './index.html',
  './site.webmanifest',
  './apple-touch-icon.png',
  './app-icon-192.png',
  './app-icon-512.png',
  './favicon-32.png',
  './favicon-16.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request)
        .then(response => {
          if (
            response &&
            response.ok &&
            request.url.startsWith(self.location.origin)
          ) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, copy);
            });
          }

          return response;
        })
        .catch(() => cached);

      if (request.mode === 'navigate') {
        return networkFetch.catch(() => {
          return caches.match('./index.html');
        });
      }

      return cached || networkFetch;
    })
  );
});
