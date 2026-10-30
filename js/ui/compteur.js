/* Saisie d'une somme : billet par billet, ou montant global. */
import { BILLETS, PIECES, COUPURES, COULEUR_COUPURE, LARGEUR_BILLET } from "../config.js";
import { totalCoupures } from "../calculs.js";
import { echapper, euros, libelleCoupure, lireMontant, montantSaisi } from "../format.js";

export class Compteur {
  #counts;
  #global;
  #manuel;
  #libelle;
  #onValider;
  #racine = null;

  /** @param {{libelle: string, counts?: object, manuel?: number, onValider: (valeur) => void}} options */
  constructor({ libelle, counts = null, manuel = 0, onValider }) {
    this.#counts = { ...(counts || {}) };
    this.#global = Boolean(manuel && !counts);
    this.#manuel = manuel || 0;
    this.#libelle = libelle;
    this.#onValider = onValider;
  }

  monter(racine) {
    this.#racine = racine;
    racine.addEventListener("click", (e) => this.#surClic(e));
    racine.addEventListener("input", (e) => this.#surSaisie(e));
    this.#dessiner();
  }

  /** Format enregistré dans un mouvement. */
  valeur() {
    return this.#global
      ? { counts: null, manual: this.#manuel }
      : { counts: { ...this.#counts }, manual: 0 };
  }

  #total() {
    return this.#global ? this.#manuel : totalCoupures(this.#counts);
  }

  #surClic(e) {
    const pas = e.target.closest("[data-pas]");
    if (pas) {
      const coupure = Number(pas.dataset.coupure);
      this.#fixerQuantite(coupure, (this.#counts[coupure] || 0) + Number(pas.dataset.pas));
      return;
    }
    const mode = e.target.closest("[data-mode]");
    if (mode) return this.#changerMode(mode.dataset.mode === "global");
    if (e.target.closest("[data-valider]")) this.#onValider(this.valeur());
  }

  #surSaisie(e) {
    const { quantite } = e.target.dataset;
    if (quantite !== undefined) {
      this.#fixerQuantite(Number(quantite), parseInt(e.target.value, 10) || 0);
    } else if (e.target.id === "cmanuel") {
      this.#manuel = lireMontant(e.target.value);
      this.#majAffichage();
    }
  }

  #fixerQuantite(coupure, quantite) {
    if (quantite > 0) this.#counts[coupure] = quantite;
    else delete this.#counts[coupure];
    this.#majAffichage();
  }

  #changerMode(global) {
    this.#global = global;
    if (global) this.#counts = {};
    else this.#manuel = 0;
    this.#dessiner();
    this.#racine.querySelector("#cmanuel")?.focus();
  }

  #dessiner() {
    this.#racine.innerHTML = `
      <div class="afficheur"><span class="eyebrow">Total</span><strong data-total></strong></div>
      ${this.#global ? this.#htmlGlobal() : this.#htmlDetail()}
      <button class="fab" data-valider>${echapper(this.#libelle)}</button>`;
    this.#majAffichage();
  }

  #htmlGlobal() {
    return `
      <div class="lbl">Montant</div>
      <input id="cmanuel" inputmode="decimal" value="${this.#manuel ? montantSaisi(this.#manuel) : ""}" placeholder="457">
      <p class="aide alerte">Cette somme sera signalée comme incomplète : vous ne saurez pas,
        l'an prochain, de quelles coupures elle était faite.</p>
      <button class="lien-bas" data-mode="detail">Revenir au détail des coupures</button>`;
  }

  #htmlDetail() {
    return `
      <div class="groupe">Billets</div>
      ${BILLETS.map((d) => ligneCoupure(d, true)).join("")}
      <div class="groupe">Pièces</div>
      ${PIECES.map((d) => ligneCoupure(d, false)).join("")}
      <p class="aide">Pas le temps de détailler ?
        <button class="lien-inline" data-mode="global">Saisir un montant global</button></p>`;
  }

  #majAffichage() {
    const r = this.#racine;
    r.querySelector("[data-total]").textContent = euros(this.#total());
    for (const coupure of COUPURES) {
      const n = this.#counts[coupure] || 0;
      const sousTotal = r.querySelector(`[data-sous="${coupure}"]`);
      if (sousTotal) sousTotal.textContent = n ? euros(coupure * n) : "";
      const champ = r.querySelector(`[data-quantite="${coupure}"]`);
      if (!champ) continue;
      if (document.activeElement !== champ) champ.value = n || "";
      champ.classList.toggle("zero", !n);
    }
    r.querySelector("[data-valider]").disabled = this.#total() <= 0;
  }
}

function ligneCoupure(coupure, estBillet) {
  const style = `background:${COULEUR_COUPURE[coupure]}` + (estBillet ? `;width:${LARGEUR_BILLET[coupure]}px` : "");
  const etiquette = coupure < 1 ? "0,50" : `${coupure}<em>€</em>`;
  return `
    <div class="ligne-c">
      <div class="vignette ${estBillet ? "billet" : "piece"}" style="${style}">${etiquette}</div>
      <button class="pas" data-pas="-1" data-coupure="${coupure}" aria-label="Retirer">−</button>
      <input class="qte" inputmode="numeric" data-quantite="${coupure}" placeholder="0"
        aria-label="Nombre de ${libelleCoupure(coupure)}">
      <button class="pas" data-pas="1" data-coupure="${coupure}" aria-label="Ajouter">+</button>
      <div class="sous" data-sous="${coupure}"></div>
    </div>`;
}
