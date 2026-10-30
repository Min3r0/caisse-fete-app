/* Panneau « Fond d'ouverture » d'une caisse. */
import { echapper } from "../format.js";
import { Compteur } from "../ui/compteur.js";
import { ouvrirPanneau, fermerPanneau } from "../ui/panneau.js";

const AIDE_ORIGINE = {
  caisse: "La sortie sera enregistrée automatiquement sur la caisse d'origine.",
  comite: "Cet argent vient de l'extérieur et sera déduit du bénéfice final.",
};

export function ouvrirPanneauFond({ depot, caisseId, apresEnregistrement }) {
  const caisse = depot.caisse(caisseId);
  const fond = depot.fondDe(caisseId);
  const autres = depot.caissesDe(caisse.evenementId).filter((c) => c.id !== caisseId);
  const options = autres
    .map((c) => `<option value="${c.id}"${fond?.fromId === c.id ? " selected" : ""}>Repris de ${echapper(c.nom)}</option>`)
    .join("");

  ouvrirPanneau({
    titre: `Fond de ${caisse.nom}`,
    contenu: `
      <div class="lbl">D'où vient cet argent ?</div>
      <select id="forigine"><option value="">Apporté par le comité</option>${options}</select>
      <p class="aide" id="faide"></p>
      <div data-compteur></div>`,
    monter(corps) {
      const origine = corps.querySelector("#forigine");
      const aide = corps.querySelector("#faide");
      const majAide = () => (aide.textContent = origine.value ? AIDE_ORIGINE.caisse : AIDE_ORIGINE.comite);
      origine.addEventListener("change", majAide);
      majAide();

      new Compteur({
        libelle: "Enregistrer le fond",
        counts: fond?.counts,
        manuel: fond?.manual,
        onValider(valeur) {
          depot.definirFond(caisseId, { fromId: origine.value || null, ...valeur });
          fermerPanneau();
          apresEnregistrement();
        },
      }).monter(corps.querySelector("[data-compteur]"));
    },
  });
}
