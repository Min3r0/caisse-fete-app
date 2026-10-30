/* Affiche la vue courante. Une vue = { rendre(ctx) → html, brancher?(conteneur, ctx) }. */
import * as evenements from "./vues/evenements.js";
import * as evenement from "./vues/evenement.js";
import * as caisse from "./vues/caisse.js";
import * as comptage from "./vues/comptage.js";
import * as donnees from "./vues/donnees.js";

const VUES = { evenements, evenement, caisse, comptage, donnees };

export function creerRouteur(racine, depot) {
  let vue = { nom: "evenements" };

  /** Si l'élément affiché a été supprimé, remonte au niveau parent. */
  function vueExistante(v) {
    if (v.evenementId && !depot.evenement(v.evenementId)) return { nom: "evenements" };
    if (v.caisseId && !depot.caisse(v.caisseId)) return { nom: "evenement", evenementId: v.evenementId };
    return v;
  }

  function afficher() {
    vue = vueExistante(vue);
    const module = VUES[vue.nom];
    const conteneur = document.createElement("div");
    conteneur.innerHTML = module.rendre({ depot, vue });
    racine.replaceChildren(conteneur);
    module.brancher?.(conteneur, { depot, vue });
  }

  return {
    get vue() {
      return vue;
    },
    naviguer(nouvelleVue) {
      vue = nouvelleVue;
      afficher();
      window.scrollTo(0, 0);
    },
    rafraichir: afficher,
  };
}
