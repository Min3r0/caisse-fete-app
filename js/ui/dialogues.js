/* Dialogues génériques : saisie d'un nom, confirmation. */
import { echapper } from "../format.js";
import { ouvrirPanneau, fermerPanneau } from "./panneau.js";
import { toast } from "./toast.js";

export function demanderNom({ titre, valeur = "", libelle, placeholder, messageVide, onValider }) {
  ouvrirPanneau({
    titre,
    contenu: `
      <div class="lbl">Nom</div>
      <input id="nnom" value="${echapper(valeur)}" placeholder="${echapper(placeholder)}">
      <button class="fab" data-valider>${echapper(libelle)}</button>`,
    monter(corps) {
      const champ = corps.querySelector("#nnom");
      const valider = () => {
        const nom = champ.value.trim();
        if (!nom) return toast(messageVide);
        fermerPanneau();
        onValider(nom);
      };
      corps.querySelector("[data-valider]").addEventListener("click", valider);
      champ.addEventListener("keydown", (e) => e.key === "Enter" && valider());
      champ.focus();
    },
  });
}

export function confirmer({ titre, message, libelle, onConfirmer }) {
  ouvrirPanneau({
    titre,
    contenu: `
      <p class="note">${echapper(message)}</p>
      <div class="actions">
        <button class="btn" data-fermer>Annuler</button>
        <button class="btn b-out" data-confirmer>${echapper(libelle)}</button>
      </div>`,
    monter(corps) {
      corps.querySelector("[data-confirmer]").addEventListener("click", () => {
        fermerPanneau();
        onConfirmer();
      });
    },
  });
}
