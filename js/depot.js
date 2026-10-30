/* Seul module qui lit et modifie les données. Chaque modification est enregistrée. */
import { nouvelId } from "./id.js";
import { normaliser, donneesVides } from "./migration.js";
import { fondDe } from "./calculs.js";

export function creerDepot(stockage, surErreurEcriture = () => {}) {
  let donnees = charger();

  function charger() {
    try {
      const brut = stockage.lire();
      return brut ? normaliser(brut) : donneesVides();
    } catch {
      return donneesVides();
    }
  }

  function enregistrer() {
    try {
      stockage.ecrire(donnees);
    } catch {
      surErreurEcriture();
    }
  }

  const trouver = (liste, id) => liste.find((x) => x.id === id) ?? null;
  const caissesDe = (evenementId) => donnees.caisses.filter((c) => c.evenementId === evenementId);
  const concerne = (mouvement, ids) => ids.has(mouvement.fromId) || ids.has(mouvement.toId);

  function retirerCaisses(ids) {
    donnees.caisses = donnees.caisses.filter((c) => !ids.has(c.id));
    donnees.mvts = donnees.mvts.filter((m) => !concerne(m, ids));
  }

  return {
    /* ---------- Lecture ---------- */
    evenements: () => donnees.evenements,
    evenement: (id) => trouver(donnees.evenements, id),
    caisse: (id) => trouver(donnees.caisses, id),
    nomCaisse: (id) => trouver(donnees.caisses, id)?.nom ?? "?",
    caissesDe,
    mouvementsEvenement(evenementId) {
      const ids = new Set(caissesDe(evenementId).map((c) => c.id));
      return donnees.mvts.filter((m) => concerne(m, ids));
    },
    fondDe: (caisseId) => fondDe(donnees.mvts, caisseId),
    mouvementsCaisse: (caisseId) =>
      donnees.mvts.filter((m) => m.type !== "fond" && (m.fromId === caisseId || m.toId === caisseId)),

    /* ---------- Événements ---------- */
    ajouterEvenement(nom) {
      const id = nouvelId();
      donnees.evenements.push({ id, nom });
      enregistrer();
      return id;
    },
    renommerEvenement(id, nom) {
      trouver(donnees.evenements, id).nom = nom;
      enregistrer();
    },
    supprimerEvenement(id) {
      retirerCaisses(new Set(caissesDe(id).map((c) => c.id)));
      donnees.evenements = donnees.evenements.filter((e) => e.id !== id);
      enregistrer();
    },

    /* ---------- Caisses ---------- */
    ajouterCaisse(evenementId, nom) {
      const id = nouvelId();
      donnees.caisses.push({ id, evenementId, nom, compte: null });
      enregistrer();
      return id;
    },
    renommerCaisse(id, nom) {
      trouver(donnees.caisses, id).nom = nom;
      enregistrer();
    },
    supprimerCaisse(id) {
      retirerCaisses(new Set([id]));
      enregistrer();
    },
    noterComptage(caisseId, montantCompte) {
      trouver(donnees.caisses, caisseId).compte = montantCompte;
      enregistrer();
    },

    /* ---------- Mouvements ---------- */
    definirFond(caisseId, { fromId, counts, manual }) {
      donnees.mvts = donnees.mvts.filter((m) => !(m.type === "fond" && m.toId === caisseId));
      donnees.mvts.push({ id: nouvelId(), type: "fond", fromId, toId: caisseId, counts, manual });
      enregistrer();
    },
    ajouterMouvement(mouvement) {
      donnees.mvts.push({ id: nouvelId(), ...mouvement });
      enregistrer();
    },
    supprimerMouvement(id) {
      donnees.mvts = donnees.mvts.filter((m) => m.id !== id);
      enregistrer();
    },

    /* ---------- Sauvegarde ---------- */
    exporterJSON: () => JSON.stringify(donnees),
    importerJSON(texte) {
      donnees = normaliser(JSON.parse(texte));
      enregistrer();
    },
    toutEffacer() {
      donnees = donneesVides();
      enregistrer();
    },
  };
}
