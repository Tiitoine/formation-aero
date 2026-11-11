/* ============================================================
   SYNCHRONISATION CLOUD MULTI-PC (Supabase) — configuration de build
   Laisser vide pour une base purement locale.
   Renseigner l'URL du projet et la clé « anon public » pour que TOUS les
   postes (stagiaires compris) envoient automatiquement leurs résultats.
   La clé anon est conçue pour être publique : la protection des données
   repose sur les règles RLS de supabase/schema.sql, pas sur ce fichier.
   Une configuration saisie dans Admin → Sync Cloud Multi-PC remplace
   celle-ci sur le poste concerné.
   ============================================================ */
export const CLOUD_CONFIG = {
  url: "",      // ex. "https://abcdefghijkl.supabase.co"
  anonKey: "",  // ex. "eyJhbGciOi..." (Project Settings → API → anon public)
};
