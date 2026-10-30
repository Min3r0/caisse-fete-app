/* Format des données enregistrées et reprise des anciennes versions. */
import { nouvelId } from "./id.js";

export const VERSION_DONNEES = 2;
export const NOM_EVENEMENT_REPRIS = "Fête importée";

export const donneesVides = () => ({ version: VERSION_DONNEES, evenements: [], caisses: [], mvts: [] });

/** Accepte une sauvegarde v1 (caisses sans événement) ou v2. Lève une erreur sinon. */
export function normaliser(brut) {
  if (brut?.version === VERSION_DONNEES) return validerV2(brut);
  if (Array.isArray(brut?.caisses)) return migrerV1(brut);
  throw new Error("Données invalides");
}

function validerV2({ evenements, caisses, mvts }) {
  if (![evenements, caisses, mvts].every(Array.isArray)) throw new Error("Données invalides");
  return { version: VERSION_DONNEES, evenements, caisses, mvts };
}

/** v1 : toutes les caisses deviennent celles d'un seul événement. */
function migrerV1({ caisses, mvts = [] }) {
  if (!caisses.length) return donneesVides();
  const evenement = { id: nouvelId(), nom: NOM_EVENEMENT_REPRIS };
  return {
    version: VERSION_DONNEES,
    evenements: [evenement],
    caisses: caisses.map((c) => ({ ...c, evenementId: evenement.id })),
    mvts,
  };
}
