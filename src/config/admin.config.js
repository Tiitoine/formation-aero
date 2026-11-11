/* ============================================================
   COMPTE ADMINISTRATEUR / FORMATEUR PAR DÉFAUT
   Identifiant : Antoine
   Mot de passe : jamais écrit ici. Seule son empreinte PBKDF2-HMAC-SHA-256
   (100 000 itérations, sel aléatoire de 128 bits) est stockée.

   Pour changer le mot de passe par défaut de TOUS les postes :
   Admin → Paramètres → « Changer le mot de passe » → bouton
   « Copier la configuration pour admin.config.js », puis remplacer
   le bloc ci-dessous et republier le site.
   ============================================================ */
export const DEFAULT_ADMIN = {
  login: "Antoine",
  salt: "099e1d293e5befdb122b66a1d0c32fe4",
  iterations: 100000,
  hash: "67c3453fa1f4b3476b1880d19a8049ab0689233039daf3ec924fc9d9c927f28a",
};
