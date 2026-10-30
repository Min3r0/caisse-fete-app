# Règles du projet

## Branches
- `main` est protégée : on n'y pousse jamais directement, tout passe par une Pull Request.
- Une branche par changement : `feat/…`, `fix/…`, `docs/…`, `chore/…`
  (ex. `feat/export-csv`, `fix/arrondi-total`).

## Commits (Conventional Commits, en français)
`type: description courte à l'impératif`
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `style:` mise en forme, CSS, sans changement de comportement
- `refactor:` réorganisation du code sans changement visible
- `chore:` outillage, workflows, dépendances

## Pull Requests
- Le check `verifications` doit être vert.
- Fusion en **squash** uniquement (historique linéaire).
- Remplir la checklist « Vérifié sur téléphone ».

## Règles techniques
- Chemins **relatifs** uniquement (`icon-192.png`, jamais `/icon-192.png`) : le site est servi sous `/caisse-fete-app/`.
- Tout nouveau fichier utilisé par l'appli doit être ajouté au tableau `FICHIERS` de `sw.js`.
- Ne pas toucher à `VERSION` dans `sw.js` : la publication la change automatiquement.
- Aucune donnée des fêtes dans le dépôt : elles restent dans le téléphone.
- Ne jamais committer de clé de signature Android (`*.keystore`, `signing-key-info.txt`).
