/* Comptage de fin de fête : montant trouvé dans chaque caisse → recette et bénéfice. */
import { calculerBilan, estComptee, recette, resultatComptage } from "../calculs.js";
import { classeSigne, echapper, euros, lireMontant, montantSaisi, pluriel, signe } from "../format.js";
import { blocControle, enTeteRetour } from "./composants.js";

function contexte(depot, vue) {
  const evenement = depot.evenement(vue.evenementId);
  const caisses = depot.caissesDe(evenement.id);
  const mouvements = depot.mouvementsEvenement(evenement.id);
  return { evenement, caisses, mouvements, bilan: calculerBilan(caisses, mouvements) };
}

export function rendre({ depot, vue }) {
  const { evenement, caisses, mouvements, bilan } = contexte(depot, vue);
  return `
    ${enTeteRetour({ retour: evenement.nom, action: "retour-evenement", titre: "Comptage" })}
    <p class="note">Comptez chaque caisse, saisissez le montant trouvé, la recette se calcule.</p>
    ${caisses.map((c) => ligneCaisse(c, bilan)).join("")}
    ${blocBenefice(resultatComptage(caisses, bilan), bilan)}
    ${avertissements(caisses, mouvements, depot)}
    <div class="formule">recette d'une caisse<br>= <b>montant compté</b> + correction</div>
    <button class="fab" data-act="exporter-csv">Exporter le tableur</button>`;
}

/** Met à jour la recette d'une caisse pendant la saisie, sans redessiner l'écran. */
export function brancher(racine, { depot, vue }) {
  racine.addEventListener("input", (e) => {
    const caisseId = e.target.dataset.compte;
    if (!caisseId) return;
    const texte = e.target.value.trim();
    depot.noterComptage(caisseId, texte === "" ? null : lireMontant(texte));

    const { bilan } = contexte(depot, vue);
    const caisse = depot.caisse(caisseId);
    e.target.parentNode.querySelector(".cpt-recette").textContent =
      estComptee(caisse) ? `Recette ${euros(recette(caisse, bilan))}` : "";
  });
}

function ligneCaisse(caisse, bilan) {
  const correction = bilan.correction[caisse.id] || 0;
  const comptee = estComptee(caisse);
  return `
    <div class="cpt">
      <div class="cpt-haut">
        <span class="cpt-nom">${echapper(caisse.nom)}</span>
        <span class="cpt-op ${classeSigne(correction)}">${signe(correction)}</span>
      </div>
      <div class="cpt-bas">
        <input inputmode="decimal" placeholder="Montant compté" data-compte="${caisse.id}"
          value="${comptee ? montantSaisi(caisse.compte) : ""}">
        <span class="cpt-recette">${comptee ? `Recette ${euros(recette(caisse, bilan))}` : ""}</span>
      </div>
    </div>`;
}

function blocBenefice(resultat, bilan) {
  if (!resultat.nbComptees) return "";
  return blocControle({
    titre: "Bénéfice" + (resultat.complet ? "" : " provisoire"),
    valeur: euros(resultat.benefice),
    details: [
      ["Recettes", euros(resultat.totalRecettes)],
      ["Apports déduits", euros(bilan.apports)],
      ["Caisses comptées", `${resultat.nbComptees} / ${resultat.nbCaisses}`],
    ],
  });
}

function avertissements(caisses, mouvements, depot) {
  const nbIncompletes = mouvements.filter((m) => !m.counts && (m.manual || 0) > 0).length;
  const sansFond = caisses.filter((c) => !depot.fondDe(c.id));
  if (!nbIncompletes && !sansFond.length) return "";

  const messages = [];
  if (sansFond.length) {
    const noms = echapper(sansFond.map((c) => c.nom).join(", "));
    messages.push(`Sans fond d'ouverture noté : ${noms}. Leur correction est probablement fausse.`);
  }
  if (nbIncompletes) {
    const accord = nbIncompletes > 1 ? "s" : "";
    messages.push(`${pluriel(nbIncompletes, "somme")} saisie${accord} sans détail des coupures. ` +
      "Le total reste juste, mais le tableau des coupures sera incomplet.");
  }
  return `
    <div class="verif">
      <div class="eyebrow">À vérifier avant de compter</div>
      ${messages.map((m) => `<p>${m}</p>`).join("")}
    </div>`;
}
