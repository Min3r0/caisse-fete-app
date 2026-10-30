/* Ce que fait chaque bouton portant data-act="…". Ajouter une action = ajouter une entrée. */
import { construireCSV } from "./export-csv.js";
import { slug } from "./format.js";
import { ouvrirPanneauFond } from "./panneaux/fond.js";
import { ouvrirPanneauMouvement } from "./panneaux/mouvement.js";
import { confirmer, demanderNom } from "./ui/dialogues.js";
import { lireFichierTexte, telecharger } from "./ui/fichiers.js";
import { toast } from "./ui/toast.js";

export function creerActions({ depot, routeur }) {
  const vue = () => routeur.vue;
  const evenementCourant = () => depot.evenement(vue().evenementId);
  const caisseCourante = () => depot.caisse(vue().caisseId);
  const panneauCaisse = () => ({ depot, caisseId: vue().caisseId, apresEnregistrement: routeur.rafraichir });

  const allerEvenements = () => routeur.naviguer({ nom: "evenements" });
  const allerEvenement = (evenementId) => routeur.naviguer({ nom: "evenement", evenementId });
  const allerCaisse = (caisseId) =>
    routeur.naviguer({ nom: "caisse", evenementId: depot.caisse(caisseId).evenementId, caisseId });

  return {
    /* ---------- Navigation ---------- */
    "evenements": allerEvenements,
    "ouvrir-evenement": (el) => allerEvenement(el.dataset.id),
    "retour-evenement": () => allerEvenement(vue().evenementId),
    "ouvrir-caisse": (el) => allerCaisse(el.dataset.id),
    "comptage": () => routeur.naviguer({ nom: "comptage", evenementId: vue().evenementId }),
    "donnees": () => routeur.naviguer({ nom: "donnees" }),

    /* ---------- Événements ---------- */
    "nouvel-evenement": () =>
      demanderNom({
        titre: "Ouvrir un événement",
        libelle: "Créer l'événement",
        placeholder: "Fête de Goulier, Marché de Noël…",
        messageVide: "Donnez un nom à l'événement.",
        onValider: (nom) => allerEvenement(depot.ajouterEvenement(nom)),
      }),
    "renommer-evenement": () =>
      demanderNom({
        titre: "Renommer l'événement",
        valeur: evenementCourant().nom,
        libelle: "Renommer",
        placeholder: "Fête de Goulier",
        messageVide: "Donnez un nom à l'événement.",
        onValider: (nom) => {
          depot.renommerEvenement(vue().evenementId, nom);
          routeur.rafraichir();
        },
      }),
    "supprimer-evenement": () =>
      confirmer({
        titre: `Supprimer ${evenementCourant().nom}`,
        message: "Cet événement, ses caisses et tous leurs mouvements seront effacés. Cette action est définitive.",
        libelle: "Supprimer",
        onConfirmer: () => {
          depot.supprimerEvenement(vue().evenementId);
          allerEvenements();
          toast("Événement supprimé.");
        },
      }),

    /* ---------- Caisses ---------- */
    "nouvelle-caisse": () =>
      demanderNom({
        titre: "Ouvrir une caisse",
        libelle: "Créer la caisse",
        placeholder: "Vendredi, Tombola, Loto…",
        messageVide: "Donnez un nom à la caisse.",
        onValider: (nom) => allerCaisse(depot.ajouterCaisse(vue().evenementId, nom)),
      }),
    "renommer-caisse": () =>
      demanderNom({
        titre: "Renommer la caisse",
        valeur: caisseCourante().nom,
        libelle: "Renommer",
        placeholder: "Vendredi, Tombola, Loto…",
        messageVide: "Donnez un nom à la caisse.",
        onValider: (nom) => {
          depot.renommerCaisse(vue().caisseId, nom);
          routeur.rafraichir();
        },
      }),
    "supprimer-caisse": () =>
      confirmer({
        titre: `Supprimer ${caisseCourante().nom}`,
        message: "Cette caisse et tous ses mouvements seront effacés. Cette action est définitive.",
        libelle: "Supprimer",
        onConfirmer: () => {
          depot.supprimerCaisse(vue().caisseId);
          allerEvenement(vue().evenementId);
          toast("Caisse supprimée.");
        },
      }),

    /* ---------- Mouvements ---------- */
    "fond": () => ouvrirPanneauFond(panneauCaisse()),
    "mouvement": (el) => ouvrirPanneauMouvement(el.dataset.type, panneauCaisse()),
    "supprimer-mouvement": (el) => {
      depot.supprimerMouvement(el.dataset.id);
      routeur.rafraichir();
      toast("Mouvement supprimé.");
    },

    /* ---------- Export et sauvegarde ---------- */
    "exporter-csv": () => {
      const evenement = evenementCourant();
      const caisses = depot.caissesDe(evenement.id);
      if (!caisses.length) return toast("Aucune caisse à exporter.");
      const csv = construireCSV({
        evenement,
        caisses,
        mouvements: depot.mouvementsEvenement(evenement.id),
        nomCaisse: depot.nomCaisse,
      });
      telecharger(`caisse-${slug(evenement.nom)}.csv`, csv, "text/csv;charset=utf-8");
    },
    "sauvegarder": () => {
      const date = new Date().toISOString().slice(0, 10);
      telecharger(`sauvegarde-caisse-${date}.json`, depot.exporterJSON(), "application/json");
    },
    "restaurer": async () => {
      const texte = await lireFichierTexte(".json,application/json");
      try {
        depot.importerJSON(texte);
        allerEvenements();
        toast("Sauvegarde restaurée.");
      } catch {
        toast("Ce fichier n'est pas une sauvegarde valide.");
      }
    },
    "tout-effacer": () =>
      confirmer({
        titre: "Tout effacer",
        message: "Tous les événements, caisses et mouvements seront supprimés. Faites une sauvegarde avant si vous avez un doute.",
        libelle: "Tout effacer",
        onConfirmer: () => {
          depot.toutEffacer();
          allerEvenements();
          toast("Données effacées.");
        },
      }),
  };
}
