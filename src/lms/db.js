/* ============================================================
   MODÈLE DE DONNÉES DU LMS — RÈGLE UNIQUE : SEUIL 85 %
   score < 85 % = À REVOIR · score ≥ 85 % = VALIDE (ratio brut, jamais arrondi)

   Le statut d'un module n'est JAMAIS saisi : il est recalculé à partir de
   l'historique des tentatives réelles (QCM passés) et des décisions du
   formateur (autorisation de nouvelle tentative, réinitialisation).
   Ce modèle « historique + décisions » permet de fusionner sans conflit
   les fiches venant de plusieurs PC (import .json, code, cloud).
   ============================================================ */
import { Plane, Wrench, Layers, Ruler, Target } from "lucide-react";
import { sha256Hex, uuid } from "../auth/crypto.js";

export const DB_KEY = "ah_lms_db_v2";
export const SEUIL = 85;
export const V = "VALIDE";
export const R = "À REVOIR";
export const N = "Non évalué";
export const TYPES_FORMATION = ["Entretien", "CQPM", "Formation basique"];

export const MODULES = [
  { id: "mod1", code: "M1", icon: Plane, titre: "Fondamentaux Hélicoptère, Zonage, ATA (62-67) & Normes BNAE / ECS", resume: "Architecture H125 → H175, zonage et stations, chapitres ATA 62 à 67, normes BNAE, ASN / ECS et EI / EICM." },
  { id: "mod2", code: "M2", icon: Wrench, titre: "Procédés d'Assemblage, Fixations (Hi-Lok), PR, Freinage & Métallisation", resume: "Assemblage alu / carbone, catalogue visuel de la quincaillerie, PR, couples, freinage et métallisation." },
  { id: "mod3", code: "M3", icon: Layers, titre: "Du BE à la FAL (E-BOM/M-BOM), Gammes SAP/MES & Litiges (QN / Dérogations Part-21G)", resume: "Dossier de définition, passage E-BOM → M-BOM, gammes SAP/MES, hold points, FOD, QN et dérogations." },
  { id: "mod4a", code: "M4A", icon: Ruler, titre: "Lecture de Plans Avancée, Ajustements ISO (Azote LN2), ISO GPS & Calcul de Calage", resume: "Cotation ISO 286, frettage à l'azote liquide, ISO GPS, isostatisme 3-2-1, chaînes de cotes et cale pelable." },
  { id: "mod4b", code: "M4B", icon: Target, titre: "Grand Simulateur Final — Mission Industrialisation H160 de A à Z", resume: "Étude de cas H160 en 4 missions : définition, M-BOM, gamme, litiges et calage jusqu'à l'habilitation." },
];
export const MOD = Object.fromEntries(MODULES.map((m) => [m.id, m]));

export const DOMAINES = [
  { id: "A", titre: "Culture Hélicoptère, Zonage & Normes", detail: "ATA 62-67, BNAE NF L / RG.Aéro, ASN / ECS / EICM",
    comps: [
      { id: "A1", label: "Situer une zone, une station et un accès sur la cellule hélicoptère", mods: ["mod1"] },
      { id: "A2", label: "Rattacher un ensemble au bon chapitre ATA (62 à 67)", mods: ["mod1"] },
      { id: "A3", label: "Appliquer les normes BNAE (NF L, EN, RG.Aéro) citées au plan", mods: ["mod1", "mod3"] },
      { id: "A4", label: "Exploiter les standards internes ASN / ECS et EI / EICM", mods: ["mod1", "mod2"] },
    ] },
  { id: "B", titre: "Procédés d'Assemblage", detail: "Alu / Carbone, Hi-Lok, PR B1/2 vs B2, Couple, Freinage, Métallisation",
    comps: [
      { id: "B1", label: "Choisir le procédé d'assemblage adapté (alu, carbone, mixte)", mods: ["mod2"] },
      { id: "B2", label: "Spécifier la pose et le contrôle d'une fixation Hi-Lok", mods: ["mod2"] },
      { id: "B3", label: "Prescrire le mastic PR (B1/2 ou B2), l'interposition et l'anticorrosion", mods: ["mod2"] },
      { id: "B4", label: "Garantir couple de serrage, freinage et métallisation", mods: ["mod2", "mod4b"], critique: true },
    ] },
  { id: "C", titre: "Industrialisation & Litiges", detail: "Gammes SAP/MES, Hold Points, FOD, QN / Part-21G",
    comps: [
      { id: "C1", label: "Transformer une E-BOM en M-BOM structurée par poste FAL", mods: ["mod3"] },
      { id: "C2", label: "Rédiger une gamme SAP/MES avec ses hold points", mods: ["mod3", "mod4b"] },
      { id: "C3", label: "Intégrer la prévention FOD dans la séquence d'assemblage", mods: ["mod3", "mod4b"], critique: true },
      { id: "C4", label: "Traiter un litige : QN, dérogation, cadre Part-21 sous-partie G", mods: ["mod3"] },
    ] },
  { id: "D", titre: "Lecture de Plans & Géométrie", detail: "Ajustements ISO (Azote LN2), ISO GPS, Isostatisme 3-2-1, Calage pelable",
    comps: [
      { id: "D1", label: "Lire un plan d'ensemble et une chaîne de cotes", mods: ["mod4a"] },
      { id: "D2", label: "Interpréter un ajustement ISO 286 et prescrire un montage à l'azote LN2", mods: ["mod4a"] },
      { id: "D3", label: "Exploiter les spécifications ISO GPS et l'isostatisme 3-2-1", mods: ["mod4a"] },
      { id: "D4", label: "Calculer et prescrire un calage pelable", mods: ["mod4a", "mod4b"] },
    ] },
  { id: "E", titre: "Sécurité des Vols & Étude de cas H160", detail: "Rigueur, traçabilité, mission d'industrialisation complète",
    comps: [
      { id: "E1", label: "Appliquer les exigences sécurité des vols (pièces critiques, commandes ATA 67)", mods: ["mod4b", "mod2"], critique: true },
      { id: "E2", label: "Assurer traçabilité, autocontrôle et inspection indépendante", mods: ["mod3", "mod4b"], critique: true },
      { id: "E3", label: "Industrialiser un ensemble H160 de la définition à la gamme", mods: ["mod4b"] },
      { id: "E4", label: "Communiquer un écart au BE, à la Qualité et à la FAL", mods: ["mod3", "mod4b"] },
    ] },
];
export const ALL_COMPS = DOMAINES.flatMap((d) => d.comps.map((c) => ({ ...c, domaine: d.id })));

/* ============================================================
   OUTILS
   ============================================================ */
export const cx = (...c) => c.filter(Boolean).join(" ");
export const isNum = (x) => typeof x === "number" && Number.isFinite(x);
export const clamp = (x) => Math.max(0, Math.min(100, x));
export const statutDe = (s) => (!isNum(s) ? N : s >= SEUIL ? V : R);
export const mean = (arr) => { const v = arr.filter(isNum); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
/** Affichage tronqué au dixième : 84,96 s'affiche 84,9 et non 85 */
export const pct = (x) => (isNum(x) ? (Math.floor(x * 10) / 10).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %" : "—");
export const nowISO = () => new Date().toISOString();
export const today = () => new Date().toISOString().slice(0, 10);
export const frDate = (d) => { if (!d) return "—"; const t = new Date(d.length === 10 ? d + "T12:00:00" : d); return isNaN(t) ? d : t.toLocaleDateString("fr-FR"); };
export const frDateTime = (d) => { if (!d) return "—"; const t = new Date(d); return isNaN(t) ? d : t.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }); };

/* Identité stagiaire : Nom + Prénom + Type de formation (insensible à la casse et aux accents) */
const fold = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\s\-']+/g, " ").trim().toLowerCase();
export const cleanNom = (s) => String(s || "").replace(/\s+/g, " ").trim().toUpperCase();
export const cleanPrenom = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase().replace(/(^|[\s-])\p{L}/gu, (m) => m.toUpperCase());
export const cleStagiaire = (nom, prenom, type) => `${fold(nom)}|${fold(prenom)}|${fold(type)}`;
export const idFromCle = (cle) => "stg_" + sha256Hex(cle).slice(0, 12);

/* ============================================================
   FICHE STAGIAIRE
   ============================================================ */
const emptyFiche = () => ({ grilleCompetences: {}, commentaireFormateur: "", pointsARevoir: "", drapeauSecurite: { actif: false, motif: "" }, updatedAt: "" });

export function newStudent({ nom, prenom, typeFormation }) {
  const cle = cleStagiaire(nom, prenom, typeFormation);
  const id = idFromCle(cle);
  const t = nowISO();
  return {
    id, cle, nom: cleanNom(nom), prenom: cleanPrenom(prenom), typeFormation,
    matricule: "AH-" + new Date().getFullYear() + "-" + id.slice(4, 10).toUpperCase(),
    createdAt: t, lastLogin: t, historique: [], decisions: [], fiche: emptyFiche(),
  };
}

/** Remet une fiche au format attendu (import, cloud, ancienne version) */
export function normaliser(s) {
  const nom = cleanNom(s.nom), prenom = cleanPrenom(s.prenom);
  const typeFormation = TYPES_FORMATION.includes(s.typeFormation) ? s.typeFormation : TYPES_FORMATION[2];
  const cle = s.cle || cleStagiaire(nom, prenom, typeFormation);
  const fiche = { ...emptyFiche(), ...(s.fiche || {}) };
  fiche.drapeauSecurite = { actif: !!fiche.drapeauSecurite?.actif, motif: fiche.drapeauSecurite?.motif || "" };
  return {
    id: s.id || idFromCle(cle), cle, nom, prenom, typeFormation,
    matricule: s.matricule || "AH-" + String(s.id || idFromCle(cle)).slice(4, 10).toUpperCase(),
    createdAt: s.createdAt || nowISO(), lastLogin: s.lastLogin || s.createdAt || "",
    historique: Array.isArray(s.historique) ? s.historique.filter((h) => h && h.id && h.moduleId) : [],
    decisions: Array.isArray(s.decisions) ? s.decisions.filter((d) => d && d.id && d.type) : [],
    fiche,
  };
}

/* ============================================================
   CALCULS DÉRIVÉS
   ============================================================ */
const byDate = (a, b) => String(a.date).localeCompare(String(b.date));

/**
 * État d'un module pour un stagiaire.
 * policy : "libre" (une note < 85 % peut être repassée librement)
 *          "autorisation" (après un À REVOIR, il faut l'autorisation du formateur)
 */
export function moduleState(s, modId, policy = "libre") {
  const decisions = s.decisions.filter((d) => d.moduleId === modId).sort(byDate);
  const lastReset = [...decisions].reverse().find((d) => d.type === "reset");
  const sprints = s.historique.filter((h) => h.moduleId === modId && h.kind === "sprint").sort(byDate);
  const cur = lastReset ? sprints.filter((h) => h.date > lastReset.date) : sprints;
  const last = cur[cur.length - 1] || null;
  const score = last ? last.score : null;
  const statut = statutDe(score);
  const lastAuth = [...decisions].reverse().find((d) => d.type === "autoriser");
  const autorise = !!lastAuth && (!last || lastAuth.date > last.date);
  let canAttempt = true, blockReason = "";
  if (statut === V) { canAttempt = false; blockReason = "Module déjà VALIDE (≥ 85 %) : le sprint noté est verrouillé. Seul le formateur peut réinitialiser le module."; }
  else if (statut === R && policy === "autorisation" && !autorise) { canAttempt = false; blockReason = "Dernière tentative À REVOIR (< 85 %) : une nouvelle tentative doit être autorisée par le formateur."; }
  return {
    score, statut, last, tentatives: cur.length, tentativesTotal: sprints.length, datePassage: last ? last.date : "",
    autorise, canAttempt, blockReason, sprints, ateliers: s.historique.filter((h) => h.moduleId === modId && h.kind === "atelier").sort(byDate),
    best: cur.length ? Math.max(...cur.map((h) => h.score)) : null,
  };
}

const binEntry = (v) => ({ mode: "bin", score: v === V ? 100 : 0, statut: v });
const pctEntry = (x, auto = false) => ({ mode: "pct", score: clamp(Math.round(x * 10) / 10), statut: statutDe(x), auto });
export { binEntry, pctEntry };
export const autoScore = (comp, mods) => mean(comp.mods.map((id) => mods?.[id]?.score));

export function calcGrille(grille) {
  const domaines = DOMAINES.map((d) => {
    const items = d.comps.map((c) => ({ ...c, entry: grille?.[c.id] || null, score: isNum(grille?.[c.id]?.score) ? grille[c.id].score : null }));
    const evalues = items.filter((i) => isNum(i.score));
    const score = mean(evalues.map((i) => i.score));
    return { ...d, items, score, statut: statutDe(score), nbEval: evalues.length, aRetravailler: items.filter((i) => isNum(i.score) && i.score < SEUIL), nonEvalues: items.filter((i) => !isNum(i.score)) };
  });
  const scores = ALL_COMPS.map((c) => (isNum(grille?.[c.id]?.score) ? grille[c.id].score : null));
  const nbEval = scores.filter(isNum).length;
  const global = mean(scores);
  const critiquesKO = ALL_COMPS.filter((c) => c.critique && isNum(grille?.[c.id]?.score) && grille[c.id].score < SEUIL);
  return { domaines, global, statut: statutDe(global), nbEval, complete: nbEval === ALL_COMPS.length, critiquesKO };
}

export function calcStagiaire(s, policy = "libre") {
  const mods = MODULES.map((m) => ({ ...m, ...moduleState(s, m.id, policy) }));
  const modsMap = Object.fromEntries(mods.map((m) => [m.id, m]));
  const moyenne = mean(mods.map((m) => m.score));
  const grille = calcGrille(s.fiche?.grilleCompetences);
  const modulesOK = mods.every((m) => m.statut === V);
  const drapeau = !!s.fiche?.drapeauSecurite?.actif || grille.critiquesKO.length > 0;
  const raisons = [];
  mods.forEach((m) => {
    if (m.statut === N) raisons.push(`${m.code} non évalué`);
    else if (m.statut === R) raisons.push(`${m.code} à ${pct(m.score)} (< 85 %)`);
  });
  if (!grille.complete) raisons.push(`Grille incomplète (${grille.nbEval}/20 compétences évaluées)`);
  else if (grille.global < SEUIL) raisons.push(`Grille globale à ${pct(grille.global)} (< 85 %)`);
  if (s.fiche?.drapeauSecurite?.actif) raisons.push(`Drapeau rouge sécurité : ${s.fiche.drapeauSecurite.motif || "motif non renseigné"}`);
  grille.critiquesKO.forEach((c) => raisons.push(`Compétence critique ${c.id} à revoir (drapeau rouge automatique)`));
  const valide = modulesOK && grille.complete && grille.global >= SEUIL && !drapeau;
  /* Statut « modules » utilisé par le filtre Admin : VALIDE si les 5 modules ≥ 85 % */
  const statutModules = mods.every((m) => m.statut === N) ? N : modulesOK ? V : R;
  return { mods, modsMap, moyenne, grille, modulesOK, drapeau, raisons, statutGlobal: valide ? V : R, statutModules };
}

/* ============================================================
   BASE LOCALE
   ============================================================ */
export const freshDB = () => ({
  version: 2, cle: DB_KEY, seuil: SEUIL, updatedAt: nowISO(),
  stagiaires: [], supprimes: {}, settings: { retryPolicy: "libre" }, journal: [], sync: { pushed: {} },
});

export function loadDB() {
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && Array.isArray(p.stagiaires)) {
        const base = freshDB();
        return { ...base, ...p, settings: { ...base.settings, ...(p.settings || {}) }, sync: { pushed: { ...(p.sync?.pushed || {}) } }, supprimes: { ...(p.supprimes || {}) }, stagiaires: p.stagiaires.map(normaliser) };
      }
    }
  } catch (e) { /* stockage indisponible */ }
  return freshDB();
}
export function saveDB(db) {
  try { window.localStorage.setItem(DB_KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
}

const lastActivity = (s) => [s.lastLogin, s.createdAt, ...s.historique.map((h) => h.date), ...s.decisions.map((d) => d.date), s.fiche?.updatedAt].filter(Boolean).sort().pop() || "";

/** Fusion de deux fiches du même stagiaire : union de l'historique et des décisions, fiche formateur la plus récente */
export function mergeStudent(a, b) {
  if (!a) return normaliser(b);
  if (!b) return a;
  const uniq = (arr) => Object.values(Object.fromEntries(arr.map((x) => [x.id, x])));
  const fa = a.fiche || {}, fb = b.fiche || {};
  return normaliser({
    ...a,
    createdAt: [a.createdAt, b.createdAt].filter(Boolean).sort()[0],
    lastLogin: [a.lastLogin, b.lastLogin].filter(Boolean).sort().pop(),
    historique: uniq([...(a.historique || []), ...(b.historique || [])]).sort(byDate),
    decisions: uniq([...(a.decisions || []), ...(b.decisions || [])]).sort(byDate),
    fiche: String(fb.updatedAt || "") > String(fa.updatedAt || "") ? fb : fa,
  });
}

/** Fusionne une liste de fiches (et de suppressions) dans la base */
export function mergeIntoDB(db, list, supprimes = {}) {
  const tomb = { ...db.supprimes };
  Object.entries(supprimes || {}).forEach(([cle, d]) => { if (!tomb[cle] || d > tomb[cle]) tomb[cle] = d; });
  const map = new Map(db.stagiaires.map((s) => [s.id, s]));
  let ajoutes = 0, fusionnes = 0;
  list.forEach((raw) => {
    const s = normaliser(raw);
    if (map.has(s.id)) { map.set(s.id, mergeStudent(map.get(s.id), s)); fusionnes++; }
    else { map.set(s.id, s); ajoutes++; }
  });
  /* Une suppression l'emporte sur toute activité antérieure à sa date */
  const stagiaires = [...map.values()].filter((s) => !tomb[s.cle] || lastActivity(s) > tomb[s.cle]);
  return { db: { ...db, stagiaires, supprimes: tomb, updatedAt: nowISO() }, ajoutes, fusionnes };
}

export function addHistory(db, studentId, entry) {
  return { ...db, updatedAt: nowISO(), stagiaires: db.stagiaires.map((s) => (s.id === studentId ? { ...s, historique: [...s.historique, entry] } : s)) };
}
export function addDecision(db, studentId, decision) {
  return { ...db, updatedAt: nowISO(), stagiaires: db.stagiaires.map((s) => (s.id === studentId ? { ...s, decisions: [...s.decisions, decision] } : s)) };
}
export function makeAttempt(moduleId, data) {
  return { id: uuid(), moduleId, date: nowISO(), ...data };
}
export function makeDecision(type, moduleId, par, motif = "") {
  return { id: uuid(), type, moduleId, date: nowISO(), par, motif };
}

/* ============================================================
   IMPORT / EXPORT : fichier .json ou « code de synchronisation »
   ============================================================ */
const CODE_PREFIX = "AHSYNC1:";
const b64enc = (str) => { const bytes = new TextEncoder().encode(str); let bin = ""; bytes.forEach((b) => { bin += String.fromCharCode(b); }); return btoa(bin); };
const b64dec = (b64) => { const bin = atob(b64.replace(/\s+/g, "")); const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0)); return new TextDecoder().decode(bytes); };

export function exportStudentPayload(s) {
  return { format: "ah-fiche-stagiaire", version: 2, exportedAt: nowISO(), regle: "Score < 85 % = À REVOIR ; Score ≥ 85 % = VALIDE", stagiaires: [s] };
}
export const studentCode = (s) => CODE_PREFIX + b64enc(JSON.stringify(exportStudentPayload(s)));

/** Lit un export JSON (base complète, fiche unique, tableau) ou un code AHSYNC1 */
export function parseImport(text) {
  const t = String(text || "").trim();
  if (!t) throw new Error("Contenu vide.");
  let obj;
  if (t.startsWith(CODE_PREFIX)) {
    try { obj = JSON.parse(b64dec(t.slice(CODE_PREFIX.length))); } catch (e) { throw new Error("Code de synchronisation illisible ou incomplet (copiez-le en entier)."); }
  } else {
    try { obj = JSON.parse(t); } catch (e) { throw new Error("Ce n'est ni un fichier JSON valide, ni un code AHSYNC1."); }
  }
  const list = Array.isArray(obj) ? obj : Array.isArray(obj?.stagiaires) ? obj.stagiaires : obj?.stagiaire ? [obj.stagiaire] : null;
  if (!list) throw new Error("Aucune liste « stagiaires » dans ce contenu.");
  const clean = list.filter((s) => s && s.nom && s.prenom).map(normaliser);
  if (!clean.length) throw new Error("Aucune fiche stagiaire exploitable (nom et prénom requis).");
  return { stagiaires: clean, supprimes: obj?.supprimes || {} };
}
