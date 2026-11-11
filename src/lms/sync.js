/* ============================================================
   SYNCHRONISATION CLOUD MULTI-PC (Supabase, API REST PostgREST)

   Principe : chaque action devient un « événement » immuable dans la table
   ah_events (profil, tentative, décision du formateur, fiche formateur,
   suppression). Les PC n'envoient que leurs événements nouveaux et
   reconstruisent les fiches par fusion : aucun écrasement possible entre PC.

   Sécurité (voir supabase/schema.sql et README) :
   - la clé « anon » est publique par nature : elle ne donne QUE le droit
     d'ajouter un profil ou une tentative, et de relire son propre parcours ;
   - lire toute la promotion, autoriser, réinitialiser, supprimer exige une
     vraie session Supabase Auth d'un compte listé dans ah_admins (RLS).
   ============================================================ */
import { CLOUD_CONFIG } from "../config/cloud.config.js";
import { normaliser, mergeIntoDB, nowISO } from "./db.js";
import { sha256Hex } from "../auth/crypto.js";

const CFG_KEY = "ah_cloud_cfg_v1";
const TOKEN_KEY = "ah_cloud_admin_token_v1";
const TABLE = "ah_events";

export function loadCloudConfig() {
  let saved = {};
  try { saved = JSON.parse(window.localStorage.getItem(CFG_KEY) || "{}") || {}; } catch (e) { saved = {}; }
  const url = (saved.url ?? CLOUD_CONFIG.url ?? "").trim().replace(/\/+$/, "");
  const anonKey = (saved.anonKey ?? CLOUD_CONFIG.anonKey ?? "").trim();
  const enabled = saved.enabled ?? !!(CLOUD_CONFIG.url && CLOUD_CONFIG.anonKey);
  return { url, anonKey, enabled: !!enabled && !!url && !!anonKey, adminEmail: saved.adminEmail || "", lastSync: saved.lastSync || "", lastError: saved.lastError || "" };
}
export function saveCloudConfig(cfg) {
  try { window.localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { /* ignore */ }
  return cfg;
}
export const cloudReady = (cfg) => !!(cfg && cfg.enabled && cfg.url && cfg.anonKey);

/* Lien de configuration à ouvrir une fois sur chaque PC stagiaire : …/#cfg=xxxx */
export function configLink(cfg) {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ url: cfg.url, anonKey: cfg.anonKey }))));
  const base = window.location.href.split("#")[0];
  return `${base}#cfg=${payload}`;
}
export function readConfigFromHash() {
  const h = window.location.hash || "";
  if (!h.startsWith("#cfg=")) return null;
  try {
    const obj = JSON.parse(decodeURIComponent(escape(atob(h.slice(5)))));
    if (obj && obj.url && obj.anonKey) return { url: String(obj.url).trim().replace(/\/+$/, ""), anonKey: String(obj.anonKey).trim() };
  } catch (e) { /* lien invalide */ }
  return null;
}

/* ---------- Session administrateur Supabase Auth ---------- */
export function loadAdminToken() {
  try { const t = JSON.parse(window.sessionStorage.getItem(TOKEN_KEY) || "null"); return t && t.access_token ? t : null; } catch (e) { return null; }
}
function storeToken(t) {
  try { if (t) window.sessionStorage.setItem(TOKEN_KEY, JSON.stringify(t)); else window.sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
  return t;
}
export const clearAdminToken = () => storeToken(null);

async function authCall(cfg, grant, body) {
  const r = await fetch(`${cfg.url}/auth/v1/token?grant_type=${grant}`, {
    method: "POST", headers: { apikey: cfg.anonKey, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error_description || j.msg || j.message || `Authentification refusée (HTTP ${r.status})`);
  return storeToken({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in || 3600) * 1000, email: j.user?.email || body.email || "" });
}
export const adminSignIn = (cfg, email, password) => authCall(cfg, "password", { email, password });

async function validToken(cfg) {
  const t = loadAdminToken();
  if (!t) return null;
  if (t.expires_at - Date.now() > 60_000) return t;
  try { return await authCall(cfg, "refresh_token", { refresh_token: t.refresh_token }); } catch (e) { storeToken(null); return null; }
}

/* ---------- Requêtes REST ---------- */
async function rest(cfg, path, { method = "GET", body, token, headers = {} } = {}) {
  const r = await fetch(`${cfg.url}/rest/v1/${path}`, {
    method,
    headers: { apikey: cfg.anonKey, Authorization: `Bearer ${token || cfg.anonKey}`, "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.message || j.hint || `Erreur cloud HTTP ${r.status}`);
  }
  const txt = await r.text();
  return txt ? JSON.parse(txt) : null;
}

export async function testConnection(cfg) {
  await rest(cfg, `${TABLE}?select=id&limit=1`);
  return true;
}

/* ---------- Événements ---------- */
const who = (s) => ({ id: s.id, cle: s.cle, nom: s.nom, prenom: s.prenom, typeFormation: s.typeFormation, matricule: s.matricule, createdAt: s.createdAt });
const ev = (id, type, s, payload) => ({ id, type, cle: s.cle, student_id: s.id, payload: { who: who(s), ...payload } });

/** Événements décrivant une fiche. scope "stagiaire" : seulement profil + tentatives (seuls droits de la clé anon). */
export function studentEvents(s, scope = "admin") {
  const out = [ev(`p_${s.id}`, "profil", s, {})];
  s.historique.forEach((h) => out.push(ev(`t_${h.id}`, "tentative", s, { entry: h })));
  if (scope === "admin") {
    s.decisions.forEach((d) => out.push(ev(`d_${d.id}`, "decision", s, { decision: d })));
    if (s.fiche?.updatedAt) out.push(ev(`f_${s.id}_${s.fiche.updatedAt.replace(/[^0-9]/g, "")}`, "fiche", s, { fiche: s.fiche }));
  }
  return out;
}
function settingsEvent(db) {
  const u = db.settings?.updatedAt;
  return u ? [{ id: `r_${String(u).replace(/[^0-9]/g, "")}`, type: "reglage", cle: "__reglages__", student_id: null, payload: { settings: { retryPolicy: db.settings.retryPolicy, updatedAt: u } } }] : [];
}
/** Adopte les réglages formateur les plus récents reçus du cloud */
function adoptSettings(db, events) {
  let best = null;
  events.forEach((e) => { const st = e.type === "reglage" && e.payload?.settings; if (st && (!best || String(st.updatedAt) > String(best.updatedAt))) best = st; });
  if (!best || String(best.updatedAt) <= String(db.settings?.updatedAt || "")) return db;
  return { ...db, settings: { ...db.settings, retryPolicy: best.retryPolicy, updatedAt: best.updatedAt } };
}
function tombEvents(db) {
  return Object.entries(db.supprimes || {}).map(([cle, date]) => ({
    id: `x_${sha256Hex(cle).slice(0, 12)}_${String(date).replace(/[^0-9]/g, "")}`, type: "suppression", cle, student_id: null, payload: { cle, date },
  }));
}

/** Reconstruit des fiches à partir d'une liste d'événements */
export function eventsToStudents(events) {
  const map = new Map();
  const supprimes = {};
  const get = (w) => {
    if (!map.has(w.id)) map.set(w.id, { ...w, historique: [], decisions: [], fiche: null });
    return map.get(w.id);
  };
  events.forEach((e) => {
    const p = e.payload || {};
    if (e.type === "suppression") { if (!supprimes[p.cle] || p.date > supprimes[p.cle]) supprimes[p.cle] = p.date; return; }
    if (!p.who || !p.who.id) return;
    const s = get(p.who);
    if (e.type === "tentative" && p.entry) s.historique.push(p.entry);
    if (e.type === "decision" && p.decision) s.decisions.push(p.decision);
    if (e.type === "fiche" && p.fiche && (!s.fiche || String(p.fiche.updatedAt) > String(s.fiche.updatedAt))) s.fiche = p.fiche;
  });
  return { stagiaires: [...map.values()].map((s) => normaliser({ ...s, fiche: s.fiche || undefined })), supprimes };
}

async function postEvents(cfg, events, token) {
  for (let i = 0; i < events.length; i += 200) {
    await rest(cfg, `${TABLE}?on_conflict=id`, { method: "POST", body: events.slice(i, i + 200), token, headers: { Prefer: "resolution=ignore-duplicates,return=minimal" } });
  }
}

/**
 * Envoie les événements nouveaux.
 * - student fourni : mode stagiaire (profil + tentatives de ce stagiaire, clé anon)
 * - sinon : mode admin (toute la base, session Supabase obligatoire)
 * Retourne { db, sent }
 */
export async function pushDB(cfg, db, { student } = {}) {
  if (!cloudReady(cfg)) return { db, sent: 0 };
  let events, token = null;
  if (student) events = studentEvents(student, "stagiaire");
  else {
    token = (await validToken(cfg))?.access_token;
    if (!token) throw new Error("Session cloud administrateur absente : connectez-vous dans le panneau Sync Cloud.");
    events = [...db.stagiaires.flatMap((s) => studentEvents(s, "admin")), ...tombEvents(db), ...settingsEvent(db)];
  }
  const pending = events.filter((e) => !db.sync?.pushed?.[e.id]);
  if (!pending.length) return { db, sent: 0 };
  await postEvents(cfg, pending, token);
  const pushed = { ...(db.sync?.pushed || {}) };
  pending.forEach((e) => { pushed[e.id] = 1; });
  return { db: { ...db, sync: { ...(db.sync || {}), pushed } }, sent: pending.length };
}

/** Admin : récupère tous les événements (pagination par 1000) et fusionne */
export async function pullAll(cfg, db) {
  const token = (await validToken(cfg))?.access_token;
  if (!token) throw new Error("Session cloud administrateur absente : connectez-vous dans le panneau Sync Cloud.");
  const all = [];
  for (let from = 0; ; from += 1000) {
    const page = await rest(cfg, `${TABLE}?select=id,type,cle,student_id,payload,created_at&order=created_at.asc,id.asc`, { token, headers: { Range: `${from}-${from + 999}`, "Range-Unit": "items" } });
    all.push(...(page || []));
    if (!page || page.length < 1000) break;
  }
  const { stagiaires, supprimes } = eventsToStudents(all);
  const res = mergeIntoDB(adoptSettings(db, all), stagiaires, supprimes);
  const pushed = { ...(db.sync?.pushed || {}) };
  all.forEach((e) => { pushed[e.id] = 1; });
  return { ...res, db: { ...res.db, sync: { ...(res.db.sync || {}), pushed } }, recus: all.length };
}

/** Stagiaire : relit son propre parcours (tentatives + décisions du formateur) via la fonction RPC sécurisée */
export async function pullStudent(cfg, db, cle) {
  if (!cloudReady(cfg)) return { db, recus: 0 };
  const rows = await rest(cfg, "rpc/ah_events_stagiaire", { method: "POST", body: { p_cle: cle } });
  const { stagiaires, supprimes } = eventsToStudents(rows || []);
  const res = mergeIntoDB(adoptSettings(db, rows || []), stagiaires, supprimes);
  return { ...res, recus: (rows || []).length };
}

/** Admin : efface côté cloud tous les événements d'un stagiaire supprimé */
export async function deleteStudentCloud(cfg, student) {
  const token = (await validToken(cfg))?.access_token;
  if (!token) return false;
  await rest(cfg, `${TABLE}?student_id=eq.${encodeURIComponent(student.id)}`, { method: "DELETE", token, headers: { Prefer: "return=minimal" } });
  return true;
}

export const stampSync = (cfg, err = "") => saveCloudConfig({ ...cfg, lastSync: err ? cfg.lastSync : nowISO(), lastError: err });
