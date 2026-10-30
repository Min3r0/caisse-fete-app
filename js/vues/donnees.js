/* Sauvegarde et restauration de toutes les données du téléphone. */
import { enTeteRetour } from "./composants.js";

export const rendre = () => `
  ${enTeteRetour({ retour: "Événements", action: "evenements", titre: "Sauvegarde" })}
  <p class="note">Les données vivent dans ce téléphone. Faites une sauvegarde après chaque journée :
    si vous effacez les données de navigation de Chrome, tout disparaît.</p>
  <button class="fab" data-act="sauvegarder">Sauvegarder les données</button>
  <button class="fab clair" data-act="restaurer">Restaurer une sauvegarde</button>
  <p class="aide">Le tableur (CSV) s'exporte depuis l'écran Comptage de chaque événement.</p>
  <button class="lien-bas" data-act="tout-effacer">Tout effacer</button>`;
