/* ============================================================
   SESSIONS & IDENTIFIANTS ADMINISTRATEUR

   ⚠ Transparence sécurité : sur un site statique public (GitHub Pages),
   tout le code est lisible par n'importe qui. Le mot de passe admin n'est
   donc JAMAIS stocké en clair : seule son empreinte PBKDF2-SHA-256
   (100 000 itérations + sel) figure dans le code. Cela empêche de le lire,
   mais pas de contourner l'écran de connexion avec les outils développeur :
   ce verrou protège contre les manipulations « de bonne foi » d'un
   stagiaire, pas contre un attaquant. Les données locales restent celles
   du PC. La vraie protection des résultats multi-PC est la Sync Cloud
   Supabase, où le serveur applique des règles RLS (voir supabase/schema.sql).
   ============================================================ */
import { DEFAULT_ADMIN } from "../config/admin.config.js";
import { hashPassword, randomSaltHex, safeEqual } from "./crypto.js";

const CRED_KEY = "ah_admin_cred_v2";
const AUTH_KEY = "ah_auth_v2";
const LOCK_KEY = "ah_admin_lock_v2";
const ADMIN_TTL = 8 * 3600 * 1000;
const MAX_FAILS = 5;
const LOCK_MS = 5 * 60 * 1000;

export function loadAdminCred() {
  try {
    const c = JSON.parse(window.localStorage.getItem(CRED_KEY) || "null");
    if (c && c.login && c.hash && c.salt && c.iterations) return { ...c, custom: true };
  } catch (e) { /* ignore */ }
  return { ...DEFAULT_ADMIN, custom: false };
}

export function lockState() {
  try {
    const l = JSON.parse(window.localStorage.getItem(LOCK_KEY) || "null") || { fails: 0, until: 0 };
    return { fails: l.fails || 0, until: l.until || 0, locked: (l.until || 0) > Date.now() };
  } catch (e) { return { fails: 0, until: 0, locked: false }; }
}
const setLock = (l) => { try { window.localStorage.setItem(LOCK_KEY, JSON.stringify(l)); } catch (e) { /* ignore */ } };

/** Vérifie login + mot de passe. Retourne { ok, error } */
export async function verifyAdmin(login, password) {
  const lk = lockState();
  if (lk.locked) return { ok: false, error: `Trop d'essais. Réessayez dans ${Math.ceil((lk.until - Date.now()) / 60000)} min.` };
  const cred = loadAdminCred();
  const h = await hashPassword(String(password || ""), cred.salt, cred.iterations);
  const ok = String(login || "").trim().toLowerCase() === cred.login.toLowerCase() && safeEqual(h, cred.hash);
  if (ok) { setLock({ fails: 0, until: 0 }); return { ok: true, login: cred.login }; }
  const fails = lk.fails + 1;
  setLock(fails >= MAX_FAILS ? { fails: 0, until: Date.now() + LOCK_MS } : { fails, until: 0 });
  return { ok: false, error: fails >= MAX_FAILS ? "Trop d'essais : connexion admin bloquée 5 minutes sur ce PC." : `Identifiant ou mot de passe incorrect (${MAX_FAILS - fails} essai${MAX_FAILS - fails > 1 ? "s" : ""} restant${MAX_FAILS - fails > 1 ? "s" : ""}).` };
}

/** Calcule une nouvelle empreinte (changement de mot de passe dans les Paramètres) */
export async function makeAdminCred(login, password) {
  const salt = randomSaltHex(16);
  const iterations = 100000;
  const hash = await hashPassword(password, salt, iterations);
  return { login: String(login).trim(), salt, iterations, hash };
}
export function saveAdminCred(cred) {
  try { window.localStorage.setItem(CRED_KEY, JSON.stringify({ login: cred.login, salt: cred.salt, iterations: cred.iterations, hash: cred.hash })); return true; } catch (e) { return false; }
}
export function resetAdminCred() {
  try { window.localStorage.removeItem(CRED_KEY); } catch (e) { /* ignore */ }
}
/** Texte à coller dans src/config/admin.config.js pour rendre le nouveau mot de passe valable sur tous les PC */
export const adminConfigSnippet = (c) => `export const DEFAULT_ADMIN = {\n  login: ${JSON.stringify(c.login)},\n  salt: ${JSON.stringify(c.salt)},\n  iterations: ${c.iterations},\n  hash: ${JSON.stringify(c.hash)},\n};\n`;

/* ---------- Session de l'onglet (fermée à la fermeture du navigateur) ---------- */
export function loadAuth() {
  try {
    const a = JSON.parse(window.sessionStorage.getItem(AUTH_KEY) || "null");
    if (!a || !a.role) return null;
    if (a.role === "admin" && (!a.exp || a.exp < Date.now())) return null;
    return a;
  } catch (e) { return null; }
}
export function saveAuth(a) {
  try {
    if (a) window.sessionStorage.setItem(AUTH_KEY, JSON.stringify(a.role === "admin" ? { ...a, exp: Date.now() + ADMIN_TTL } : a));
    else window.sessionStorage.removeItem(AUTH_KEY);
  } catch (e) { /* ignore */ }
  return a;
}
