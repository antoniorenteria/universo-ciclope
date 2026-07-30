/* ============================================================
   UNIVERSO CÍCLOPE · Service Worker
   Cache "app shell" para carga inmediata y uso con conexión
   limitada. Sube el número de versión al publicar cambios.
   ============================================================ */
const VERSION = 'uc-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/universo.css',
  './assets/js/reglas.js',
  './assets/js/contenido.js',
  './assets/js/estado.js',
  './assets/js/app.js',
  './assets/img/isotipo.png',
  './assets/img/app-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Estrategia: cache-first para el shell y assets; network-first
   para todo lo demás (juegos grandes, fuentes). Nunca rompe si
   no hay red: sirve lo cacheado. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
    })
  );
});
