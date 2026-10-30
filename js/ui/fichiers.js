/* Échanges de fichiers avec le téléphone : téléchargement et ouverture. */
import { ouvrirPanneau } from "./panneau.js";
import { toast } from "./toast.js";

export function telecharger(nom, contenu, type) {
  try {
    const url = URL.createObjectURL(new Blob([contenu], { type }));
    const lien = Object.assign(document.createElement("a"), { href: url, download: nom });
    document.body.appendChild(lien);
    lien.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      lien.remove();
    }, 1500);
    toast(`Fichier créé : ${nom}`);
  } catch {
    proposerCopie(contenu);
  }
}

function proposerCopie(contenu) {
  ouvrirPanneau({
    titre: "Copier le contenu",
    contenu: `
      <p class="aide">Le téléchargement a échoué. Copiez ce texte et collez-le dans un tableur.</p>
      <textarea id="dump"></textarea>
      <button class="fab" data-selection>Tout sélectionner</button>`,
    monter(corps) {
      const zone = corps.querySelector("#dump");
      zone.value = contenu;
      corps.querySelector("[data-selection]").addEventListener("click", () => {
        zone.select();
        zone.setSelectionRange(0, contenu.length);
      });
    },
  });
}

/** Ouvre le sélecteur de fichiers et renvoie le texte du fichier choisi. */
export function lireFichierTexte(accept) {
  return new Promise((resolve) => {
    const champ = Object.assign(document.createElement("input"), { type: "file", accept });
    champ.addEventListener("change", () => {
      const fichier = champ.files[0];
      if (fichier) fichier.text().then(resolve);
    });
    champ.click();
  });
}
