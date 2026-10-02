// Praisa IA - service worker
// Solo guarda la "cáscara" de la página (HTML, estilos, logos) para que abra rápido.
// Nunca guarda conversaciones ni respuestas del asistente: todo lo que va a n8n pasa directo.
const CACHE = 'praisa-ia-v43c';
const BASE = ['./', 'index.html', 'styles-v43.css?v=43', 'app-v43.js?v=43c',
  'logo.svg', 'logo-dark.svg', 'logo-light.svg', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Solo GET de este mismo sitio; n8n, CDN y cualquier otro servidor van directo a la red.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Páginas: primero la red (siempre la versión más nueva); si no hay internet, la guardada.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put('./', copia)); return r; })
      .catch(() => caches.match('./')));
    return;
  }

  // Estilos, scripts e imágenes: la guardada al instante y se actualiza en segundo plano.
  e.respondWith(caches.match(req).then(guardada => {
    const red = fetch(req).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return r;
    }).catch(() => guardada);
    return guardada || red;
  }));
});
