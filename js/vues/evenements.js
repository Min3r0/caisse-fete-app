/* Accueil : liste des événements (Fête de Goulier, Marché de Noël…). */
import { calculerBilan, resultatComptage } from "../calculs.js";
import { echapper, euros, pluriel } from "../format.js";
import { etatVide } from "./composants.js";

export function rendre({ depot }) {
  const evenements = depot.evenements();
  return `
    <div class="appbar"><h1>Événements</h1></div>
    ${evenements.length ? "" : etatVide("Créez un événement pour chaque fête : Fête de Goulier, Marché de Noël… Vous y ouvrirez ensuite les caisses.")}
    ${evenements.map((e) => carteEvenement(e, depot)).join("")}
    <button class="fab" data-act="nouvel-evenement">Ouvrir un événement</button>
    <button class="fab clair" data-act="donnees">Sauvegarde</button>`;
}

function carteEvenement(evenement, depot) {
  const caisses = depot.caissesDe(evenement.id);
  const resultat = resultatComptage(caisses, calculerBilan(caisses, depot.mouvementsEvenement(evenement.id)));
  const sousTitre = caisses.length ? pluriel(caisses.length, "caisse") : "Aucune caisse";
  const benefice = resultat.nbComptees
    ? `<div class="corr">${euros(resultat.benefice)}</div>`
    : "";
  const etat = resultat.nbComptees ? (resultat.complet ? " · bénéfice" : " · bénéfice provisoire") : "";

  return `
    <button class="carte" data-act="ouvrir-evenement" data-id="${evenement.id}">
      <div class="carte-haut">
        <div>
          <div class="carte-nom">${echapper(evenement.nom)}</div>
          <div class="carte-sous">${sousTitre}${etat}</div>
        </div>
        ${benefice}
      </div>
    </button>`;
}
