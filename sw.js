const CACHE_NAME = 'sagra-bastia-v1';

const URLS_DA_CACHEARE = [
  '/app.html',
  '/programma.html',
  '/la-sagra.html',
  '/css/style.css',
  '/js/bastia.js',
  '/data.json',
  '/img/icons/icon-192.png'
];

// Installazione: salva in cache le pagine essenziali
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_DA_CACHEARE.map(url => new Request(url, { cache: 'reload' })))
        .catch(err => console.log('Cache parziale:', err));
    })
  );
  self.skipWaiting();
});

// Attivazione: rimuove cache vecchie
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomiCache) => {
      return Promise.all(
        nomiCache
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      );
    })
  );
  self.clients.claim();
});

// Strategia: network-first per data.json (sempre dati freschi se online),
// cache-first per il resto (veloce e funziona offline)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('data.json')) {
    event.respondWith(
      fetch(event.request)
        .then((risposta) => {
          const clone = risposta.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return risposta;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((rispostaCache) => {
      return rispostaCache || fetch(event.request).then((risposta) => {
        if (risposta && risposta.status === 200) {
          const clone = risposta.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return risposta;
      });
    }).catch(() => caches.match('/app.html'))
  );
});
