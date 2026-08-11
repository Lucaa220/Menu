/* =========================================================
   Trattoria da Franca — Menu digitale
   SERVICE WORKER — cache la "shell" statica del sito (HTML, CSS, JS,
   dati di riserva, icone) così il menu si apre istantaneamente anche
   con connessione lenta/assente, e mostra comunque l'ultimo menu
   visto in caso di rete del tutto assente (i dati Firebase più
   recenti restano invece raggiungibili quando la rete c'è: questo
   service worker NON intercetta le chiamate a Firebase, solo i file
   statici del sito).

   IMPORTANTE: quando pubblichi un aggiornamento a questi stessi file
   (style.css, app.js, ecc.), aumenta il numero di versione qui sotto
   (es. "df-v1" -> "df-v2"): è così che i telefoni dei clienti
   capiscono che devono scaricare la nuova versione invece di usare
   quella salvata in cache.
   ========================================================= */

const VERSIONE_CACHE = 'df-v3';

const FILE_SHELL = [
  './',
  './index.html',
  './admin.html',
  './style.css',
  './admin.css',
  './app.js',
  './admin.js',
  './admin-menu.js',
  './dati-menu.js',
  './dati-foto.js',
  './firebase-config.js',
  './firebase-init.js',
  './menu-data.js',
  './cloudinary-config.js',
  './manifest.json',
  './logo-trattoria.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(VERSIONE_CACHE)
      .then((cache) => cache.addAll(FILE_SHELL))
      .catch((e) => console.warn('[sw] precache parziale/fallita:', e.message))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((chiavi) =>
      Promise.all(chiavi.filter((k) => k !== VERSIONE_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Strategia: "cache-first" per i file statici dello stesso dominio,
   con aggiornamento in background della cache quando la rete risponde
   (stale-while-revalidate). Richieste verso altri domini (Firebase,
   Google Fonts, CDN, ecc.) non vengono toccate: vanno sempre in rete
   normalmente, per non rischiare di mostrare dati vecchi. */
self.addEventListener('fetch', (evento) => {
  const richiesta = evento.request;
  if (richiesta.method !== 'GET') return;

  const url = new URL(richiesta.url);
  if (url.origin !== self.location.origin) return; // lascia stare domini esterni (Firebase, CDN...)

  evento.respondWith(
    caches.match(richiesta).then((risposteCache) => {
      const risposteRete = fetch(richiesta).then((risposta) => {
        if (risposta && risposta.ok) {
          const copia = risposta.clone();
          caches.open(VERSIONE_CACHE).then((cache) => cache.put(richiesta, copia));
        }
        return risposta;
      }).catch(() => risposteCache); // offline: usa la cache se la rete fallisce

      return risposteCache || risposteRete;
    })
  );
});
