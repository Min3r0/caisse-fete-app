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

## Architecture
Appli statique sans build : modules JavaScript natifs (`<script type="module">`).

| Dossier / fichier | Rôle |
|---|---|
| `js/config.js` | Données de référence (coupures, couleurs, types de mouvement) |
| `js/format.js` | Mise en forme des nombres et textes (pur) |
| `js/calculs.js` | Règles de calcul : corrections, recettes, bénéfice (pur, testé) |
| `js/migration.js` | Format des données et reprise des anciennes versions (pur, testé) |
| `js/depot.js` | **Seul** module qui lit/modifie les données (testé) |
| `js/stockage.js` | Accès au `localStorage` |
| `js/export-csv.js` | Tableur d'un événement (pur, testé) |
| `js/vues/` | Un écran = `rendre(ctx) → html` + `brancher?(conteneur, ctx)` |
| `js/panneaux/` | Panneaux de saisie (fond, mouvement, transfert) |
| `js/ui/` | Composants génériques (compteur de billets, panneau, dialogues, fichiers, toast) |
| `js/actions.js` | Ce que fait chaque bouton `data-act="…"` |
| `js/routeur.js`, `js/main.js` | Navigation et démarrage |

Modèle : **Événement** → **Caisses** → **Mouvements** (un mouvement relie deux caisses d'un même événement, ou une caisse et l'extérieur).

## Principes de code
- **Une responsabilité par module** ; la logique métier reste dans des fonctions pures, sans DOM.
- **Ouvert à l'extension** : nouvelle action = une entrée dans `actions.js` ; nouvel écran = un module dans `vues/` déclaré dans `routeur.js`.
- **YAGNI** : pas de framework, pas de build, pas de dépendance tant qu'on n'en a pas besoin.
- Noms en français, explicites ; pas de nombres magiques (tout dans `config.js`).
- Toute règle de calcul modifiée doit être couverte par un test dans `tests/` (`node --test`).
- Changer le format des données = incrémenter `VERSION_DONNEES` et ajouter la migration dans `migration.js` : les données déjà dans les téléphones ne doivent jamais être perdues.

## Règles techniques
- Chemins **relatifs** uniquement (`icon-192.png`, jamais `/icon-192.png`) : le site est servi sous `/caisse-fete-app/`.
- Tout nouveau fichier utilisé par l'appli doit être ajouté au tableau `FICHIERS` de `sw.js` (vérifié par la CI).
- Ne pas toucher à `VERSION` dans `sw.js` : la publication la change automatiquement.
- Aucune donnée des fêtes dans le dépôt : elles restent dans le téléphone.
- Ne jamais committer de clé de signature Android (`*.keystore`, `signing-key-info.txt`).
