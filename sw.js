/* Service worker : met l'application en cache pour un usage hors connexion.
   VERSION est remplacée automatiquement à chaque publication (deploy-pages.yml).
   Tout fichier ajouté dans css/ ou js/ doit figurer dans FICHIERS (vérifié en CI). */
const VERSION = "caisse-v1";
const FICHIERS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/actions.js",
  "./js/calculs.js",
  "./js/config.js",
  "./js/depot.js",
  "./js/export-csv.js",
  "./js/format.js",
  "./js/id.js",
  "./js/main.js",
  "./js/migration.js",
  "./js/panneaux/fond.js",
  "./js/panneaux/mouvement.js",
  "./js/panneaux/transfert.js",
  "./js/routeur.js",
  "./js/stockage.js",
  "./js/ui/compteur.js",
  "./js/ui/dialogues.js",
  "./js/ui/fichiers.js",
  "./js/ui/panneau.js",
  "./js/ui/toast.js",
  "./js/vues/caisse.js",
  "./js/vues/composants.js",
  "./js/vues/comptage.js",
  "./js/vues/donnees.js",
  "./js/vues/evenement.js",
  "./js/vues/evenements.js",
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
