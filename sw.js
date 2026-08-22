/* ============================================================
   UNIVERSO CÍCLOPE · Service Worker
   · HTML / JS / CSS  -> NETWORK-FIRST: siempre trae lo más nuevo
     si hay internet (las actualizaciones llegan solas, sin que
     nadie tenga que reinstalar). Cae al caché solo si no hay red.
   · Imágenes / fuentes / audio / juegos -> CACHE-FIRST: cargan
     al instante y se guardan la primera vez.
   Sube VERSION al publicar para limpiar cachés viejos.
   ============================================================ */
const VERSION = 'uc-v12';
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

const esFresco = url =>
  url.origin === location.origin &&
  /\.(html|js|css|webmanifest)$|\/$/.test(url.pathname);

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // NETWORK-FIRST para el código de la app (frescura garantizada)
  if (esFresco(url)) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // CACHE-FIRST para todo lo demás (imágenes, fuentes, audio, juegos)
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
    })
  );
});
