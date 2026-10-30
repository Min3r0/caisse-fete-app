/* Construction du tableur CSV d'un événement (séparateur « ; », format français). */
import { COUPURES, LIBELLE_TYPE } from "./config.js";
import { calculerBilan, estComptee, fondDe, montant, recette, totalCoupures } from "./calculs.js";
import { libelleCoupure, nombreCSV } from "./format.js";

const BOM = "﻿";
const somme = (valeurs) => valeurs.reduce((s, v) => s + v, 0);
const libelleType = (type) => LIBELLE_TYPE[type] || type;

function celluleCSV(valeur) {
  const texte = String(valeur ?? "");
  return /[";\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
}

const ligneCSV = (cellules) => cellules.map(celluleCSV).join(";");

export function construireCSV({ evenement, caisses, mouvements, nomCaisse }) {
  const bilan = calculerBilan(caisses, mouvements);
  const fonds = caisses.map((c) => fondDe(mouvements, c.id));
  const lignes = [
    ["EVENEMENT", evenement.nom],
    [],
    ...sectionRecapitulatif(caisses, fonds, bilan),
    ...sectionFonds(caisses, fonds, bilan),
    ...sectionMouvements(mouvements, nomCaisse),
    ...sectionDetailCoupures(mouvements, nomCaisse),
    ...sectionSyntheseCoupures(mouvements),
  ];
  return BOM + lignes.map(ligneCSV).join("\r\n");
}

function sectionRecapitulatif(caisses, fonds, bilan) {
  return [
    ["RECAPITULATIF"],
    ["Caisse", "Fond d'ouverture", "Entrees", "Sorties", "Correctif", "Montant compte", "Recette"],
    ...caisses.map((c, i) => [
      c.nom,
      nombreCSV(montant(fonds[i])),
      nombreCSV(bilan.entrees[c.id]),
      nombreCSV(bilan.sorties[c.id]),
      nombreCSV(bilan.correction[c.id]),
      estComptee(c) ? nombreCSV(c.compte) : "",
      estComptee(c) ? nombreCSV(recette(c, bilan)) : "",
    ]),
    [],
    ["Apports exterieurs", nombreCSV(bilan.apports)],
    ["Depenses", nombreCSV(bilan.depenses)],
    ["Virements recus sur le compte", nombreCSV(bilan.virements)],
    ["Somme des correctifs", nombreCSV(bilan.somme)],
    [],
    [],
  ];
}

function sectionFonds(caisses, fonds, bilan) {
  const correction = (i) => bilan.correction[caisses[i].id] || 0;
  const ligneParCaisse = (libelle, valeurDe) => {
    const valeurs = fonds.map(valeurDe);
    return [libelle, ...valeurs.map(nombreCSV), nombreCSV(somme(valeurs))];
  };
  const ligneCoupure = (coupure) => {
    const quantites = fonds.map((f) => f?.counts?.[coupure] || 0);
    return [libelleCoupure(coupure), ...quantites, somme(quantites)];
  };

  return [
    ["FONDS DE CAISSE - nombre de billets et de pieces"],
    ["Coupure", ...caisses.map((c) => c.nom), "Total"],
    ...COUPURES.map(ligneCoupure),
    ligneParCaisse("Valeur detaillee (EUR)", (f) => (f?.counts ? totalCoupures(f.counts) : 0)),
    ligneParCaisse("Saisi sans detail (EUR)", (f) => (f && !f.counts ? f.manual || 0 : 0)),
    [],
    ligneParCaisse("Total du fond (EUR)", (f) => montant(f)),
    ligneParCaisse("Transferts, depenses et virements (EUR)", (f, i) => correction(i) + montant(f)),
    ligneParCaisse("CORRECTIF A APPLIQUER (EUR)", (f, i) => correction(i)),
    [],
    [],
  ];
}

function sectionMouvements(mouvements, nomCaisse) {
  return [
    ["MOUVEMENTS"],
    ["Type", "De", "Vers", "Personne", "Montant", "Detaille", "Commentaire"],
    ...mouvements.map((m) => [
      libelleType(m.type),
      m.fromId ? nomCaisse(m.fromId) : "Exterieur",
      m.toId ? nomCaisse(m.toId) : "Sortie",
      m.tiers || "",
      nombreCSV(montant(m)),
      m.counts ? "oui" : "non",
      m.note || "",
    ]),
    [],
    [],
  ];
}

function sectionDetailCoupures(mouvements, nomCaisse) {
  return [
    ["DETAIL DES COUPURES PAR MOUVEMENT"],
    ["Type", "Caisse", ...COUPURES.map(libelleCoupure), "Total"],
    ...mouvements
      .filter((m) => m.counts)
      .map((m) => [
        libelleType(m.type),
        nomCaisse(m.fromId || m.toId),
        ...COUPURES.map((d) => m.counts[d] || 0),
        nombreCSV(montant(m)),
      ]),
    [],
    [],
  ];
}

function sectionSyntheseCoupures(mouvements) {
  const enFonds = {}, circulees = {};
  for (const d of COUPURES) {
    enFonds[d] = 0;
    circulees[d] = 0;
  }
  for (const m of mouvements.filter((x) => x.counts)) {
    const cible = m.type === "fond" ? enFonds : circulees;
    for (const d of COUPURES) cible[d] += m.counts[d] || 0;
  }
  return [
    ["SYNTHESE PAR COUPURE - pour preparer l'an prochain"],
    ["Coupure", "Quantite en fonds", "Valeur en fonds", "Quantite circulee", "Valeur circulee"],
    ...COUPURES.map((d) => [libelleCoupure(d), enFonds[d], nombreCSV(enFonds[d] * d), circulees[d], nombreCSV(circulees[d] * d)]),
  ];
}
