/* Stagiaire actif côté modules : chaque module garde sa progression
   (onglets validés, missions 4B) dans une clé localStorage propre au stagiaire.
   Ex. "prep-methodes-ah-m1-v2" devient "prep-methodes-ah-m1-v2::stg_ab12". */
let currentStudentId = null;

export const setSessionStudent = (id) => { currentStudentId = id || null; };
export const scopedKey = (base) => (currentStudentId ? `${base}::${currentStudentId}` : base);
