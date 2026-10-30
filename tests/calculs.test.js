import { test } from "node:test";
import assert from "node:assert/strict";
import { calculerBilan, montant, resultatComptage, totalCoupures } from "../js/calculs.js";

const caisses = [
  { id: "ven", nom: "Vendredi", compte: null },
  { id: "bar", nom: "Bar", compte: null },
];

test("totalCoupures additionne billets et pièces", () => {
  assert.equal(totalCoupures({ 50: 1, 20: 2, 0.5: 3 }), 91.5);
  assert.equal(totalCoupures(null), 0);
});

test("montant prend le détail, sinon le montant global", () => {
  assert.equal(montant({ counts: { 10: 3 }, manual: 999 }), 30);
  assert.equal(montant({ counts: null, manual: 45 }), 45);
  assert.equal(montant(null), 0);
});

test("un fond apporté par le comité est un apport et se retranche de la caisse", () => {
  const bilan = calculerBilan(caisses, [{ type: "fond", fromId: null, toId: "ven", counts: { 50: 2 } }]);
  assert.equal(bilan.correction.ven, -100);
  assert.equal(bilan.apports, 100);
});

test("un transfert se compense entre les deux caisses", () => {
  const bilan = calculerBilan(caisses, [{ type: "transfert", fromId: "ven", toId: "bar", counts: null, manual: 40 }]);
  assert.equal(bilan.correction.ven, 40);
  assert.equal(bilan.correction.bar, -40);
  assert.equal(bilan.somme, 0);
});

test("dépenses et virements sortent de la caisse", () => {
  const bilan = calculerBilan(caisses, [
    { type: "depense", fromId: "bar", toId: null, manual: 25 },
    { type: "virement", fromId: "bar", toId: null, manual: 60 },
  ]);
  assert.equal(bilan.correction.bar, 85);
  assert.equal(bilan.depenses, 25);
  assert.equal(bilan.virements, 60);
});

test("les mouvements d'une caisse inconnue n'affectent pas les corrections", () => {
  const bilan = calculerBilan(caisses, [{ type: "transfert", fromId: "autre", toId: "ven", manual: 10 }]);
  assert.equal(bilan.correction.ven, -10);
  assert.equal(bilan.somme, -10);
});

test("bénéfice = recettes − apports", () => {
  const comptees = [
    { id: "ven", compte: 300 },
    { id: "bar", compte: null },
  ];
  const bilan = calculerBilan(comptees, [{ type: "fond", fromId: null, toId: "ven", manual: 100 }]);
  const r = resultatComptage(comptees, bilan);
  assert.equal(r.totalRecettes, 200);
  assert.equal(r.benefice, 100);
  assert.equal(r.nbComptees, 1);
  assert.equal(r.complet, false);
});
