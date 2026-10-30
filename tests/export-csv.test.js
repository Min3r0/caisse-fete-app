import { test } from "node:test";
import assert from "node:assert/strict";
import { construireCSV } from "../js/export-csv.js";

test("le CSV porte le nom de l'événement et échappe les points-virgules", () => {
  const caisses = [{ id: "a", nom: "Bar; buvette", compte: 100 }];
  const csv = construireCSV({
    evenement: { nom: "Fête de Goulier" },
    caisses,
    mouvements: [{ type: "fond", fromId: null, toId: "a", counts: { 10: 2 }, manual: 0 }],
    nomCaisse: () => "Bar; buvette",
  });
  const lignes = csv.replace("﻿", "").split("\r\n");
  assert.equal(lignes[0], "EVENEMENT;Fête de Goulier");
  assert.ok(lignes.includes('"Bar; buvette";20;20;0;-20;100;80'));
});
