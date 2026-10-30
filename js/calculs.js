/* Règles de calcul de la caisse. Fonctions pures, testées dans tests/. */
import { COUPURES } from "./config.js";

export const totalCoupures = (counts) =>
  COUPURES.reduce((somme, coupure) => somme + coupure * (counts?.[coupure] || 0), 0);

/** Montant d'un mouvement : détail des coupures, sinon montant global saisi. */
export const montant = (mouvement) => {
  if (!mouvement) return 0;
  return mouvement.counts ? totalCoupures(mouvement.counts) : mouvement.manual || 0;
};

export const fondDe = (mouvements, caisseId) =>
  mouvements.find((m) => m.type === "fond" && m.toId === caisseId) ?? null;

export const estComptee = (caisse) => typeof caisse.compte === "number";

/**
 * Correction à appliquer au comptage de chaque caisse :
 * ce qui est sorti s'ajoute, ce qui est entré se retranche.
 */
export function calculerBilan(caisses, mouvements) {
  const correction = {}, entrees = {}, sorties = {};
  for (const c of caisses) {
    correction[c.id] = 0;
    entrees[c.id] = 0;
    sorties[c.id] = 0;
  }
  let apports = 0, depenses = 0, virements = 0;

  for (const m of mouvements) {
    const valeur = montant(m);
    if (m.fromId in correction) {
      correction[m.fromId] += valeur;
      sorties[m.fromId] += valeur;
    }
    if (m.toId in correction) {
      correction[m.toId] -= valeur;
      entrees[m.toId] += valeur;
    }
    if (!m.fromId) apports += valeur;
    if (m.type === "depense") depenses += valeur;
    if (m.type === "virement") virements += valeur;
  }

  const somme = Object.values(correction).reduce((s, v) => s + v, 0);
  return { correction, entrees, sorties, apports, depenses, virements, somme };
}

export const recette = (caisse, bilan) => caisse.compte + (bilan.correction[caisse.id] || 0);

export function resultatComptage(caisses, bilan) {
  const comptees = caisses.filter(estComptee);
  const totalRecettes = comptees.reduce((s, c) => s + recette(c, bilan), 0);
  return {
    nbComptees: comptees.length,
    nbCaisses: caisses.length,
    complet: comptees.length === caisses.length,
    totalRecettes,
    benefice: totalRecettes - bilan.apports,
  };
}
