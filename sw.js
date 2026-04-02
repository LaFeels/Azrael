var CACHE = 'azrael-v3';
var ASSETS = [
  '/Azrael/',
  '/Azrael/index.html',
  '/Azrael/styles.css',
  '/Azrael/app.js',
  '/Azrael/manifest.json',
  '/Azrael/icon-192.png',
  '/Azrael/icon-512.png'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  /* Always go network-first for JS and HTML so updates come through */
  var url = e.request.url;
  if (url.indexOf('.js') !== -1 || url.indexOf('.html') !== -1) {
    e.respondWith(
      fetch(e.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return response;
      }).catch(function() { return caches.match(e.request); })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) { return cached || fetch(e.request); })
  );
});
