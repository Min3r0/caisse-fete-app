// Vérifications lancées à chaque Pull Request (check « verifications »).
import { readFileSync, existsSync, readdirSync } from "node:fs";

let erreurs = 0;
const ko = (m) => { console.error("✗ " + m); erreurs++; };
const ok = (m) => console.log("✓ " + m);

// 1. Le manifest est un JSON valide avec les champs requis
try {
  const m = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
  for (const champ of ["name", "short_name", "start_url", "display", "icons"]) {
    if (!m[champ]) ko(`manifest : champ « ${champ} » manquant`);
  }
  for (const i of m.icons || []) {
    if (!existsSync(i.src)) ko(`manifest : icône introuvable ${i.src}`);
  }
  ok("manifest.webmanifest valide");
} catch (e) { ko("manifest.webmanifest n'est pas un JSON valide : " + e.message); }

// 2. Tous les fichiers mis en cache par sw.js existent
const sw = readFileSync("sw.js", "utf8");
if (!/const VERSION = "[^"]+";/.test(sw)) ko('sw.js : ligne const VERSION = "..."; introuvable');
const bloc = sw.match(/const FICHIERS = \[([\s\S]*?)\]/);
if (!bloc) ko("sw.js : tableau FICHIERS introuvable");
else {
  for (const f of bloc[1].match(/"([^"]+)"/g).map((s) => s.slice(1, -1))) {
    if (f === "./") continue;
    if (!existsSync(f.replace(/^\.\//, ""))) ko(`sw.js : fichier en cache introuvable ${f}`);
  }
  ok("fichiers du cache présents");

  // 2 bis. Tout fichier de css/ et js/ est bien mis en cache (sinon l'appli casse hors connexion)
  const enCache = new Set(bloc[1].match(/"([^"]+)"/g).map((s) => s.slice(1, -1).replace(/^\.\//, "")));
  const sources = ["css", "js"].flatMap((d) => readdirSync(d, { recursive: true }).map((f) => `${d}/${f}`.replace(/\\/g, "/")));
  for (const f of sources.filter((f) => /\.(js|css)$/.test(f))) {
    if (!enCache.has(f)) ko(`sw.js : ${f} absent de FICHIERS`);
  }
  ok("css/ et js/ entièrement mis en cache");
}

// 3. index.html : pas de lien absolu vers la racine (casse GitHub Pages)
const html = readFileSync("index.html", "utf8");
const absolus = html.match(/(?:src|href)="\/[^/][^"]*"/g);
if (absolus) ko("index.html : chemins absolus à remplacer par des chemins relatifs : " + absolus.join(", "));
else ok("index.html : chemins relatifs");

if (erreurs) { console.error(`\n${erreurs} erreur(s).`); process.exit(1); }
console.log("\nTout est bon.");
