/* ==========================================================================
   TABLA PERIÓDICA INTERACTIVA — Service Worker
   Estrategia: cache-first para recursos estáticos, con actualización en
   segundo plano. Permite el funcionamiento completo sin conexión.
   ========================================================================== */

const CACHE_NAME = "tabla-periodica-v3";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./data/elements.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/favicon.png",
  "./icons/apple-touch-icon.png"
];

// Instalación: precachear todos los recursos necesarios
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpiar cachés antiguas de versiones previas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first, con actualización silenciosa en segundo plano
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type !== "opaque") {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      // For page navigations, fall back to the cached app shell when offline.
      if (event.request.mode === "navigate") {
        return networkFetch.catch(() => caches.match("./index.html"));
      }
      return cachedResponse || networkFetch;
    })
  );
});
