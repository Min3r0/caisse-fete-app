/* Panneau qui monte du bas de l'écran. Un seul à la fois. */
import { echapper } from "../format.js";

const hote = document.getElementById("panel");

hote.addEventListener("click", (e) => {
  if (e.target.dataset.voile !== undefined || e.target.closest("[data-fermer]")) fermerPanneau();
});

/**
 * @param {{titre: string, contenu: string, monter?: (corps: HTMLElement) => void}} options
 *   monter reçoit le corps du panneau pour y brancher les événements.
 */
export function ouvrirPanneau({ titre, contenu, monter }) {
  hote.innerHTML = `
    <div class="voile" data-voile>
      <div class="panneau">
        <div class="panneau-haut">
          <h3>${echapper(titre)}</h3>
          <button class="lien" data-fermer>Fermer</button>
        </div>
        <div class="panneau-corps">${contenu}</div>
      </div>
    </div>`;
  monter?.(hote.querySelector(".panneau-corps"));
}

export function fermerPanneau() {
  hote.innerHTML = "";
}
