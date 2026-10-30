/* Un événement : ses caisses et la somme des corrections. */
import { calculerBilan, montant } from "../calculs.js";
import { classeSigne, echapper, euros, pluriel, signe } from "../format.js";
import { bande, blocControle, etatVide } from "./composants.js";

export function rendre({ depot, vue }) {
  const evenement = depot.evenement(vue.evenementId);
  const caisses = depot.caissesDe(evenement.id);
  const bilan = calculerBilan(caisses, depot.mouvementsEvenement(evenement.id));

  return `
    <div class="appbar col">
      <button class="retour" data-act="evenements">← Événements</button>
      <div class="appbar-ligne">
        <h1 data-act="renommer-evenement">${echapper(evenement.nom)}</h1>
        ${caisses.length ? '<button class="lienbar" data-act="comptage">Comptage →</button>' : ""}
      </div>
    </div>
    ${caisses.length ? controle(bilan) : etatVide("Ouvrez une caisse pour chaque contenant d'argent de la fête : Vendredi, Samedi, Tombola, Loto, Bar…")}
    ${caisses.map((c) => carteCaisse(c, depot, bilan)).join("")}
    <button class="fab" data-act="nouvelle-caisse">Ouvrir une caisse</button>
    <button class="lien-bas" data-act="supprimer-evenement">Supprimer cet événement</button>`;
}

const controle = (bilan) =>
  blocControle({
    titre: "Somme des corrections",
    valeur: signe(bilan.somme),
    details: [
      ["Apports", euros(bilan.apports)],
      ["Dépenses", euros(bilan.depenses)],
      ["Virements", euros(bilan.virements)],
    ],
  });

function carteCaisse(caisse, depot, bilan) {
  const fond = depot.fondDe(caisse.id);
  const nbMouvements = depot.mouvementsCaisse(caisse.id).length;
  const correction = bilan.correction[caisse.id] || 0;
  const sousTitre =
    (fond ? `Fond ${euros(montant(fond))}` : "Pas de fond noté") +
    (nbMouvements ? ` · ${pluriel(nbMouvements, "mouvement")}` : "");

  return `
    <button class="carte" data-act="ouvrir-caisse" data-id="${caisse.id}">
      <div class="carte-haut">
        <div>
          <div class="carte-nom">${echapper(caisse.nom)}</div>
          <div class="carte-sous">${sousTitre}</div>
        </div>
        <div class="corr ${classeSigne(correction)}">${signe(correction)}</div>
      </div>
      ${bande(fond?.counts ?? null)}
    </button>`;
}
