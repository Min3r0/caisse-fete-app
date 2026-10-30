/* Fiche d'une caisse : fond d'ouverture, mouvements, correction. */
import { TYPES_MOUVEMENT } from "../config.js";
import { calculerBilan, montant } from "../calculs.js";
import { classeSigne, echapper, euros, signe } from "../format.js";
import { bande, detailCoupures, enTeteRetour, resumeCoupures } from "./composants.js";

export function rendre({ depot, vue }) {
  const caisse = depot.caisse(vue.caisseId);
  const evenement = depot.evenement(caisse.evenementId);
  const bilan = calculerBilan(depot.caissesDe(evenement.id), depot.mouvementsEvenement(evenement.id));
  const correction = bilan.correction[caisse.id] || 0;
  const mouvements = depot.mouvementsCaisse(caisse.id);

  return `
    ${enTeteRetour({ retour: evenement.nom, action: "retour-evenement", titre: caisse.nom, actionTitre: "renommer-caisse" })}
    ${sectionFond(depot.fondDe(caisse.id), depot)}
    <div class="titre-section">Mouvements</div>
    ${mouvements.length ? "" : '<p class="note">Aucun mouvement.</p>'}
    ${mouvements.map((m) => ligneMouvement(m, caisse, depot)).join("")}
    ${blocCorrection(correction, caisse)}
    <div class="actions">
      ${Object.entries(TYPES_MOUVEMENT)
        .map(([type, t]) => `<button class="btn ${t.classe}" data-act="mouvement" data-type="${type}">${t.titre}</button>`)
        .join("")}
    </div>
    <button class="lien-bas" data-act="supprimer-caisse">Supprimer cette caisse</button>`;
}

function sectionFond(fond, depot) {
  const titre = `
    <div class="titre-section">Fond d'ouverture
      <button class="lien" data-act="fond">${fond ? "Modifier" : "Compter"}</button>
    </div>`;
  if (!fond) return titre + `<p class="note">Notez le fond dès l'ouverture, sinon la correction sera fausse.</p>`;

  const origine = fond.fromId ? depot.nomCaisse(fond.fromId) : null;
  return `${titre}
    <div class="fond">
      <div class="fond-haut">
        <div>
          <div class="eyebrow">${origine ? `Repris de ${echapper(origine)}` : "Apporté par le comité"}</div>
          <div class="fond-origine">${origine ? "La sortie est notée sur cette caisse-là" : "Sera déduit du bénéfice"}</div>
        </div>
        <div class="mono gros">${euros(montant(fond))}</div>
      </div>
      ${fond.counts ? detailCoupures(fond.counts) : '<div class="incomplet">Montant global, coupures non détaillées</div>'}
    </div>`;
}

function phraseMouvement(m, caisse, depot) {
  const nom = (texte) => `<b>${echapper(texte)}</b>`;
  switch (m.type) {
    case "apport": return "Reçu de l'extérieur";
    case "depense": return `Payé à ${nom(m.tiers || "un fournisseur")}`;
    case "virement": return `Liquide remis à ${nom(m.tiers || "quelqu'un")}`;
    default:
      return m.fromId === caisse.id
        ? `Transféré vers ${nom(depot.nomCaisse(m.toId))}`
        : `Reçu de ${nom(depot.nomCaisse(m.fromId))}`;
  }
}

function ligneMouvement(m, caisse, depot) {
  const sortant = m.fromId === caisse.id;
  const meta = (m.counts ? resumeCoupures(m.counts) : "montant global") + (m.note ? ` · ${m.note}` : "");
  return `
    <div class="mv">
      <div class="mv-fleche ${sortant ? "neg" : "pos"}">${sortant ? "↗" : "↘"}</div>
      <div class="mv-corps">
        <div class="mv-ligne">${phraseMouvement(m, caisse, depot)}</div>
        <div class="mv-meta">${echapper(meta)}</div>
        ${m.counts ? bande(m.counts) : ""}
      </div>
      <div class="mv-droite">
        <div class="mono">${euros(montant(m))}</div>
        <button class="suppr" data-act="supprimer-mouvement" data-id="${m.id}">Supprimer</button>
      </div>
    </div>`;
}

function blocCorrection(correction, caisse) {
  const verbe = correction >= 0 ? "ajoutez cette somme à" : "retranchez cette somme de";
  return `
    <div class="netbox">
      <div class="eyebrow">Correction au comptage</div>
      <div class="net ${classeSigne(correction)}">${signe(correction)}</div>
      <p>Le jour du comptage, ${verbe} ce que vous trouverez dans la caisse ${echapper(caisse.nom)}.</p>
    </div>`;
}
