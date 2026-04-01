var CACHE = 'azrael-v2';
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
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.indexOf('fonts.googleapis') !== -1 || e.request.url.indexOf('fonts.gstatic') !== -1) {
    e.respondWith(caches.open(CACHE).then(function(cache){
      return fetch(e.request).then(function(response){ cache.put(e.request, response.clone()); return response; }).catch(function(){ return caches.match(e.request); });
    })); return;
  }
  e.respondWith(caches.match(e.request).then(function(cached){ return cached || fetch(e.request); }));
});
