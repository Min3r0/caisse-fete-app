/* Choix du sens et de l'autre caisse pour un transfert (même événement uniquement). */
import { echapper } from "../format.js";

const autresCaisses = (caisse, depot) => depot.caissesDe(caisse.evenementId).filter((c) => c.id !== caisse.id);

export function htmlChoixTransfert(caisse, depot) {
  const nom = echapper(caisse.nom);
  const avertissement = autresCaisses(caisse, depot).length
    ? ""
    : '<p class="aide alerte">Créez d\'abord une autre caisse dans cet événement pour pouvoir transférer.</p>';
  return `
    <div class="lbl">Sens du transfert</div>
    <div class="seg">
      <button class="on" data-sens="entrant">${nom} reçoit</button>
      <button data-sens="sortant">${nom} donne</button>
    </div>
    <div class="lbl" id="tlbl"></div>
    <div class="ligne-fleche" id="tligne"></div>
    <p class="aide" id="taide"></p>
    ${avertissement}`;
}

/** Propose par défaut la caisse du dernier transfert, sinon la première autre caisse. */
function caisseParDefaut(caisse, depot, autres) {
  const transferts = depot.mouvementsCaisse(caisse.id).filter((m) => m.type === "transfert");
  const dernier = transferts.at(-1);
  if (dernier) return dernier.fromId === caisse.id ? dernier.toId : dernier.fromId;
  return autres[0]?.id ?? "";
}

export function creerChoixTransfert(corps, { depot, caisse }) {
  const autres = autresCaisses(caisse, depot);
  const etat = { entrant: true, autreId: caisseParDefaut(caisse, depot, autres) };
  const ligne = corps.querySelector("#tligne");
  const libelle = corps.querySelector("#tlbl");
  const aide = corps.querySelector("#taide");

  function majAide() {
    const autre = etat.autreId ? depot.nomCaisse(etat.autreId) : null;
    if (!autre) return (aide.textContent = "Choisissez l'autre caisse.");
    const [source, cible] = etat.entrant ? [autre, caisse.nom] : [caisse.nom, autre];
    aide.textContent = `La sortie sera notée sur ${source} et l'entrée sur ${cible}.`;
  }

  function dessiner() {
    const options = autres
      .map((c) => `<option value="${c.id}"${c.id === etat.autreId ? " selected" : ""}>${echapper(c.nom)}</option>`)
      .join("");
    const choix = `<select id="tautre" style="flex:1;min-width:0"><option value="">Choisir…</option>${options}</select>`;
    const fixe = `<div class="fige">${echapper(caisse.nom)}</div>`;
    ligne.innerHTML = etat.entrant ? `${choix}<span>→</span>${fixe}` : `${fixe}<span>→</span>${choix}`;
    libelle.textContent = etat.entrant ? "Argent pris dans" : "Argent versé dans";
    ligne.querySelector("#tautre").addEventListener("change", (e) => {
      etat.autreId = e.target.value;
      majAide();
    });
    majAide();
  }

  corps.querySelectorAll("[data-sens]").forEach((bouton) =>
    bouton.addEventListener("click", () => {
      etat.entrant = bouton.dataset.sens === "entrant";
      corps.querySelectorAll("[data-sens]").forEach((b) => b.classList.toggle("on", b === bouton));
      dessiner();
    }));
  dessiner();

  return { entrant: () => etat.entrant, autreCaisseId: () => etat.autreId };
}
