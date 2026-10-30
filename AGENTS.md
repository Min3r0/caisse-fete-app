# Consignes pour les assistants IA

Lire et respecter `CONTRIBUTING.md` (architecture, principes de code, conventions). En résumé :
- PWA statique sans build : `index.html`, `css/`, `js/` (modules ES natifs), `manifest.webmanifest`, `sw.js`.
- Modèle : Événement → Caisses → Mouvements. Seul `js/depot.js` modifie les données.
- Logique métier pure dans `calculs.js`, `migration.js`, `export-csv.js`, couverte par `tests/` (`node --test`).
- Données stockées uniquement dans le téléphone : tout changement de format passe par une migration dans `migration.js`.
- Chemins relatifs uniquement ; tout nouveau fichier de `css/` ou `js/` va dans `FICHIERS` de `sw.js`.
- Avant de proposer une PR : `node .github/scripts/verifier.mjs` et `node --test` doivent passer.
- Commits Conventional Commits en français, une branche par changement, PR vers `main`.
