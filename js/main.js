/* Point d'entrée : assemble les modules et démarre l'application. */
import { creerActions } from "./actions.js";
import { creerDepot } from "./depot.js";
import { creerRouteur } from "./routeur.js";
import { creerStockageLocal } from "./stockage.js";
import { toast } from "./ui/toast.js";

const racine = document.getElementById("root");
const depot = creerDepot(creerStockageLocal(), () =>
  toast("Enregistrement impossible. Faites une sauvegarde manuelle."));
const routeur = creerRouteur(racine, depot);
const actions = creerActions({ depot, routeur });

racine.addEventListener("click", (e) => {
  const bouton = e.target.closest("[data-act]");
  if (bouton) actions[bouton.dataset.act]?.(bouton);
});

routeur.naviguer({ nom: "evenements" });

/* L'application reste utilisable sans réseau. */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
