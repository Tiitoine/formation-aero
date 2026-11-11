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
  salt: "a3f1c2d94b7e60185d2c9f0e7b4a1c36",
  iterations: 100000,
  hash: "61393008b309ade3eaeed5e2eb494880f9e4f975f521451bc162f2ec36bb8f98",
};
