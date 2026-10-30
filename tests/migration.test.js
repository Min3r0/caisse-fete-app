import { test } from "node:test";
import assert from "node:assert/strict";
import { NOM_EVENEMENT_REPRIS, normaliser } from "../js/migration.js";

test("une sauvegarde v1 est rangée dans un événement", () => {
  const v1 = { caisses: [{ id: "a", nom: "Bar", compte: null }], mvts: [{ id: "m", type: "apport", toId: "a" }] };
  const v2 = normaliser(v1);
  assert.equal(v2.version, 2);
  assert.equal(v2.evenements.length, 1);
  assert.equal(v2.evenements[0].nom, NOM_EVENEMENT_REPRIS);
  assert.equal(v2.caisses[0].evenementId, v2.evenements[0].id);
  assert.deepEqual(v2.mvts, v1.mvts);
});

test("une v1 vide ne crée pas d'événement", () => {
  assert.equal(normaliser({ caisses: [], mvts: [] }).evenements.length, 0);
});

test("une v2 est conservée telle quelle", () => {
  const v2 = { version: 2, evenements: [{ id: "e", nom: "Goulier" }], caisses: [], mvts: [] };
  assert.deepEqual(normaliser(v2), v2);
});

test("un fichier quelconque est refusé", () => {
  assert.throws(() => normaliser({ bonjour: 1 }));
  assert.throws(() => normaliser(null));
  assert.throws(() => normaliser({ version: 2, evenements: "x" }));
});
