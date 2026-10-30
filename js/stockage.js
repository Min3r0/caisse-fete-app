/* Accès au stockage du téléphone. L'ancienne clé v1 est lue mais jamais effacée. */
import { CLE_STOCKAGE, CLE_STOCKAGE_V1 } from "./config.js";

export function creerStockageLocal(storage = window.localStorage) {
  return {
    lire() {
      const brut = storage.getItem(CLE_STOCKAGE) ?? storage.getItem(CLE_STOCKAGE_V1);
      return brut ? JSON.parse(brut) : null;
    },
    ecrire(donnees) {
      storage.setItem(CLE_STOCKAGE, JSON.stringify(donnees));
    },
  };
}
