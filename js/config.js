/* Données de référence : rien ici ne dépend de l'état de l'application. */

export const CLE_STOCKAGE = "caisse-fete-v2";
export const CLE_STOCKAGE_V1 = "caisse-fete-v1";

export const BILLETS = [50, 20, 10, 5];
export const PIECES = [2, 1, 0.5];
export const COUPURES = [...BILLETS, ...PIECES];

export const COULEUR_COUPURE = {
  50: "#E8830C", 20: "#2E5FB5", 10: "#C41230", 5: "#8A9196",
  2: "#A98A4E", 1: "#9BA0A3", 0.5: "#C39A4A",
};
export const LARGEUR_BILLET = { 50: 66, 20: 60, 10: 54, 5: 48 };

export const TYPES_MOUVEMENT = {
  apport: { titre: "Argent reçu", verbe: "Enregistrer l'apport", classe: "b-in" },
  transfert: { titre: "Transfert", verbe: "Enregistrer le transfert", classe: "b-move" },
  depense: { titre: "Dépense", verbe: "Enregistrer la dépense", classe: "b-out" },
  virement: { titre: "Virement contre liquide", verbe: "Enregistrer le virement", classe: "b-swap" },
};

export const LIBELLE_TYPE = {
  fond: "Fond d'ouverture",
  apport: "Apport",
  transfert: "Transfert",
  depense: "Dépense",
  virement: "Virement",
};
