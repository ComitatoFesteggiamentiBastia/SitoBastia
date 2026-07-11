const CACHE_NAME = 'sagra-bastia-v2';

const URLS_DA_CACHEARE = [
  './app.html',
  './programma.html',
  './la-sagra.html',
  './css/style.css',
  './js/bastia.js',
  './data.json',
  './img/icons/icon-192.png'
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

// Strategia: NETWORK-FIRST per tutto
// Prova sempre la rete → aggiorna la cache → restituisce risposta
// Se offline → usa la cache salvata
self.addEventListener('fetch', (event) => {
  // Ignora richieste non GET e richieste a domini esterni (Supabase, Maps, ecc.)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((risposta) => {
        // Aggiorna la cache con la versione fresca
        if (risposta && risposta.status === 200) {
          const clone = risposta.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return risposta;
      })
      .catch(() => {
        // Offline: usa la cache
        return caches.match(event.request).then(cached => cached || caches.match('./app.html'));
      })
  );
});
