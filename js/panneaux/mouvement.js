/* Panneau d'ajout d'un mouvement : apport, transfert, dépense, virement. */
import { TYPES_MOUVEMENT } from "../config.js";
import { echapper } from "../format.js";
import { Compteur } from "../ui/compteur.js";
import { ouvrirPanneau, fermerPanneau } from "../ui/panneau.js";
import { toast } from "../ui/toast.js";
import { creerChoixTransfert, htmlChoixTransfert } from "./transfert.js";

export function ouvrirPanneauMouvement(type, { depot, caisseId, apresEnregistrement }) {
  const caisse = depot.caisse(caisseId);
  const definition = TYPES_MOUVEMENT[type];

  ouvrirPanneau({
    titre: definition.titre,
    contenu: `
      ${champsSpecifiques(type, caisse, depot)}
      <div class="lbl">Commentaire</div>
      <input id="mnote" placeholder="Facultatif">
      <div data-compteur></div>`,
    monter(corps) {
      const transfert = type === "transfert" ? creerChoixTransfert(corps, { depot, caisse }) : null;
      const texte = (selecteur) => corps.querySelector(selecteur)?.value.trim() ?? "";

      new Compteur({
        libelle: definition.verbe,
        onValider(valeur) {
          if (transfert && !transfert.autreCaisseId()) return toast("Choisissez l'autre caisse.");
          depot.ajouterMouvement({
            type,
            ...extremites(type, caisseId, transfert),
            ...valeur,
            tiers: texte("#mtiers"),
            note: texte("#mnote"),
          });
          fermerPanneau();
          apresEnregistrement();
        },
      }).monter(corps.querySelector("[data-compteur]"));
    },
  });
}

/** D'où vient l'argent (fromId) et où il va (toId) ; null = extérieur. */
function extremites(type, caisseId, transfert) {
  if (type === "apport") return { fromId: null, toId: caisseId };
  if (type !== "transfert") return { fromId: caisseId, toId: null };
  const autre = transfert.autreCaisseId();
  return transfert.entrant() ? { fromId: autre, toId: caisseId } : { fromId: caisseId, toId: autre };
}

function champsSpecifiques(type, caisse, depot) {
  const nom = echapper(caisse.nom);
  switch (type) {
    case "transfert":
      return htmlChoixTransfert(caisse, depot);
    case "depense":
      return '<div class="lbl">Payé à</div><input id="mtiers" placeholder="Traiteur">';
    case "virement":
      return `<div class="lbl">Qui prend le liquide ?</div><input id="mtiers" placeholder="Cécile">
        <p class="aide">Le liquide sort de ${nom} et le même montant arrive sur le compte du comité.</p>`;
    case "apport":
      return `<p class="aide">Argent apporté de l'extérieur vers ${nom} : banque, coffre, avance d'un membre du comité.</p>`;
    default:
      return "";
  }
}
