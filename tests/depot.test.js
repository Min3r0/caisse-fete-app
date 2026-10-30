import { test } from "node:test";
import assert from "node:assert/strict";
import { creerDepot } from "../js/depot.js";

const stockageMemoire = (initial = null) => {
  let contenu = initial;
  return { lire: () => contenu, ecrire: (d) => (contenu = structuredClone(d)), contenu: () => contenu };
};

test("les caisses et mouvements sont rattachés à leur événement", () => {
  const depot = creerDepot(stockageMemoire());
  const goulier = depot.ajouterEvenement("Fête de Goulier");
  const noel = depot.ajouterEvenement("Marché de Noël");
  const bar = depot.ajouterCaisse(goulier, "Bar");
  const loto = depot.ajouterCaisse(goulier, "Loto");
  depot.ajouterCaisse(noel, "Vin chaud");
  depot.ajouterMouvement({ type: "transfert", fromId: bar, toId: loto, manual: 20 });

  assert.equal(depot.caissesDe(goulier).length, 2);
  assert.equal(depot.caissesDe(noel).length, 1);
  assert.equal(depot.mouvementsEvenement(goulier).length, 1);
  assert.equal(depot.mouvementsEvenement(noel).length, 0);
});

test("supprimer un événement supprime ses caisses et mouvements, pas les autres", () => {
  const depot = creerDepot(stockageMemoire());
  const a = depot.ajouterEvenement("A");
  const b = depot.ajouterEvenement("B");
  const ca = depot.ajouterCaisse(a, "Bar");
  const cb = depot.ajouterCaisse(b, "Bar");
  depot.definirFond(ca, { fromId: null, counts: null, manual: 50 });
  depot.definirFond(cb, { fromId: null, counts: null, manual: 80 });

  depot.supprimerEvenement(a);

  assert.equal(depot.evenement(a), null);
  assert.equal(depot.caisse(ca), null);
  assert.equal(depot.fondDe(ca), null);
  assert.equal(depot.fondDe(cb).manual, 80);
});

test("définir un fond remplace le précédent", () => {
  const depot = creerDepot(stockageMemoire());
  const c = depot.ajouterCaisse(depot.ajouterEvenement("A"), "Bar");
  depot.definirFond(c, { fromId: null, counts: null, manual: 50 });
  depot.definirFond(c, { fromId: null, counts: { 20: 1 }, manual: 0 });
  assert.equal(depot.mouvementsEvenement(depot.caisse(c).evenementId).length, 1);
  assert.deepEqual(depot.fondDe(c).counts, { 20: 1 });
});

test("chaque modification est enregistrée, et les anciennes données v1 sont reprises", () => {
  const stockage = stockageMemoire({ caisses: [{ id: "x", nom: "Bar", compte: null }], mvts: [] });
  const depot = creerDepot(stockage);
  assert.equal(depot.evenements().length, 1);
  depot.noterComptage("x", 120);
  assert.equal(stockage.contenu().version, 2);
  assert.equal(stockage.contenu().caisses[0].compte, 120);
});
