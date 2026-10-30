/* Service worker : met l'application en cache pour un usage hors connexion.
   Changez VERSION quand vous remplacez un fichier, pour forcer la mise à jour. */
const VERSION = "caisse-v1";
const FICHIERS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./favicon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((rep) => {
      if (rep) return rep;
      return fetch(e.request)
        .then((res) => {
          const copie = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copie));
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
