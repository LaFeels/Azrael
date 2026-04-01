const CACHE = 'azrael-v1';
const ASSETS = [
  '/Azrael/',
  '/Azrael/index.html',
  '/Azrael/styles.css',
  '/Azrael/app.js',
  '/Azrael/manifest.json',
  '/Azrael/icon-192.png',
  '/Azrael/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('fonts.googleapis') || e.request.url.includes('fonts.gstatic')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        fetch(e.request).then(response => {
          cache.put(e.request, response.clone());
          return response;
        }).catch(() => caches.match(e.request))
      )
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
