/* Morceaux d'interface réutilisés par plusieurs vues. */
import { COUPURES, COULEUR_COUPURE } from "../config.js";
import { totalCoupures } from "../calculs.js";
import { echapper, euros, libelleCoupure } from "../format.js";

export function enTeteRetour({ retour, action, titre, actionTitre = "" }) {
  const attributTitre = actionTitre ? ` data-act="${actionTitre}"` : "";
  return `
    <div class="appbar col">
      <button class="retour" data-act="${action}">← ${echapper(retour)}</button>
      <h1${attributTitre}>${echapper(titre)}</h1>
    </div>`;
}

export const etatVide = (texte) => `<div class="vide"><div class="marque">€</div><p>${texte}</p></div>`;

/** Bandeau noir de synthèse : un titre, une valeur, des chiffres secondaires. */
export function blocControle({ titre, valeur, details }) {
  return `
    <div class="control">
      <div class="eyebrow">${titre}</div>
      <strong>${valeur}</strong>
      <div class="control-grid">
        ${details.map(([libelle, v]) => `<div>${libelle}<b>${v}</b></div>`).join("")}
      </div>
    </div>`;
}

/** Barre colorée proportionnelle à la valeur de chaque coupure. */
export function bande(counts) {
  const total = totalCoupures(counts);
  if (!total) return '<div class="bande vide"></div>';
  const segments = COUPURES.filter((d) => counts[d])
    .map((d) => `<i style="width:${((d * counts[d]) / total) * 100}%;background:${COULEUR_COUPURE[d]}"></i>`)
    .join("");
  return `<div class="bande">${segments}</div>`;
}

export function detailCoupures(counts) {
  const lignes = COUPURES.filter((d) => counts[d])
    .map((d) => `
      <div class="detail-ligne">
        <span class="puce" style="background:${COULEUR_COUPURE[d]}"></span>
        <span class="dnom">${libelleCoupure(d)}</span>
        <span class="dqte">× ${counts[d]}</span>
        <span class="dval">${euros(d * counts[d])}</span>
      </div>`)
    .join("");
  return `<div class="detail">${lignes}</div>`;
}

export const resumeCoupures = (counts) =>
  COUPURES.filter((d) => counts[d]).map((d) => `${counts[d]} × ${libelleCoupure(d)}`).join(" · ");
