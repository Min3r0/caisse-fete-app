/* Mise en forme des textes et des nombres. Fonctions pures. */

const arrondi = (n) => Math.round((n || 0) * 100) / 100;

export const euros = (n) =>
  arrondi(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

export const signe = (n) => (n >= 0 ? "+ " : "− ") + euros(Math.abs(n));

export const classeSigne = (n) => (n >= 0 ? "pos" : "neg");

export const libelleCoupure = (coupure) => (coupure < 1 ? "0,50 €" : `${coupure} €`);

export const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? "s" : ""}`;

/** Nombre au format tableur français : 12,5 */
export const nombreCSV = (n) => String(arrondi(n)).replace(".", ",");

/** Montant tapé par l'utilisateur (« 12,50 » ou « 12.50 ») */
export const lireMontant = (texte) => parseFloat(String(texte).replace(",", ".")) || 0;

export const montantSaisi = (n) => String(n).replace(".", ",");

export const echapper = (texte) =>
  String(texte ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** « Fête de Goulier » → « fete-de-goulier » (noms de fichiers) */
export const slug = (texte) =>
  String(texte)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "evenement";
