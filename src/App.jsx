import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import { CheckCircle2, XCircle, Eye, Lock, Cloud } from "lucide-react";
import {
  DB_KEY, SEUIL, V, MOD, loadDB, saveDB, newStudent, cleStagiaire, idFromCle, mergeIntoDB, addHistory, makeAttempt,
  moduleState, calcStagiaire, nowISO, pct, statutDe,
} from "./lms/db.js";
import { loadAuth, saveAuth } from "./auth/session.js";
import {
  loadCloudConfig, saveCloudConfig, readConfigFromHash, cloudReady, pushDB, pullAll, pullStudent, deleteStudentCloud, loadAdminToken, stampSync,
} from "./lms/sync.js";
import { ModuleSessionContext } from "./lib/pedago.jsx";
import AuthPortal from "./auth/AuthPortal.jsx";
import StudentSpace from "./student/StudentSpace.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import BackToPortal from "./lms/BackToPortal.jsx";
import LexiqueButton from "./lib/Lexique.jsx";
import { setSessionStudent } from "./lms/session.js";

/* Chaque module est chargé à la demande */
const Module1 = lazy(() => import("./modules/Module1.jsx"));
const Module2 = lazy(() => import("./modules/Module2.jsx"));
const Module3 = lazy(() => import("./modules/Module3.jsx"));
const Module4A = lazy(() => import("./modules/Module4A.jsx"));
const Module4B = lazy(() => import("./modules/Module4B.jsx"));

/* ============================================================
   SPA · Formation Préparateur Méthodes Assemblage — Airbus Helicopters
   Règle unique : score < 85 % = À REVOIR · score ≥ 85 % = VALIDE
   Routage : connexion → espace stagiaire ou tableau de bord admin → #module/<id>
   ============================================================ */
const MODULE_COMPONENTS = { mod1: Module1, mod2: Module2, mod3: Module3, mod4a: Module4A, mod4b: Module4B };
const MODULE_PREFIX = "module/";
const readModuleFromHash = () => {
  const h = (window.location.hash || "").replace(/^#\/?/, "");
  if (!h.startsWith(MODULE_PREFIX)) return null;
  const id = h.slice(MODULE_PREFIX.length);
  return MODULE_COMPONENTS[id] ? id : null;
};

/* Lien « #cfg=… » envoyé par le formateur : configure la Sync Cloud de ce PC */
function initCloud() {
  const fromLink = readConfigFromHash();
  if (fromLink) {
    const cfg = saveCloudConfig({ ...loadCloudConfig(), ...fromLink, enabled: true });
    try { window.history.replaceState(null, "", window.location.pathname + window.location.search); } catch (e) { window.location.hash = ""; }
    return { cfg: loadCloudConfig() || cfg, configured: true };
  }
  return { cfg: loadCloudConfig(), configured: false };
}

export default function App() {
  const [db, setDBRaw] = useState(loadDB);
  const dbRef = useRef(db);
  dbRef.current = db;
  const setDB = useCallback((fn) => setDBRaw((d) => (typeof fn === "function" ? fn(d) : fn)), []);
  const [auth, setAuthRaw] = useState(loadAuth);
  const setAuth = (a) => setAuthRaw(saveAuth(a));
  const [moduleId, setModuleId] = useState(readModuleFromHash);
  const [toast, setToast] = useState(null);
  const init = useMemo(initCloud, []);
  const [cfg, setCfg] = useState(init.cfg);
  const [cloudErr, setCloudErr] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [banner, setBanner] = useState(init.configured ? "Synchronisation cloud activée sur ce PC." : "");

  useEffect(() => { saveDB(db); }, [db]);
  useEffect(() => {
    const onStorage = (e) => { if (e.key === DB_KEY) setDBRaw(loadDB()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    const onHash = () => setModuleId(readModuleFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 6500); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { if (!banner) return; const t = setTimeout(() => setBanner(""), 6000); return () => clearTimeout(t); }, [banner]);

  const policy = db.settings.retryPolicy;
  const student = auth?.role === "stagiaire" ? db.stagiaires.find((s) => s.id === auth.studentId) || null : null;
  const isAdmin = auth?.role === "admin";
  /* Un stagiaire supprimé par le formateur est déconnecté */
  useEffect(() => { if (auth?.role === "stagiaire" && !student) setAuth(null); }, [auth, student]);

  /* ---------------- Synchronisation cloud ---------------- */
  const mergePushed = (res) => setDB((d) => ({ ...d, sync: { ...(d.sync || {}), pushed: { ...(d.sync?.pushed || {}), ...(res.db.sync?.pushed || {}) } } }));
  const fail = (e) => { const m = e?.message || String(e); setCloudErr(m); setCfg(stampSync(cfg, m)); };
  const ok = () => { setCloudErr(""); setCfg(stampSync(cfg)); };

  const syncNow = useCallback(async () => {
    if (!cloudReady(cfg)) return;
    setSyncing(true);
    try {
      if (isAdmin) {
        if (!loadAdminToken()) throw new Error("Connectez la session administrateur cloud (rubrique Sync Cloud).");
        const res = await pullAll(cfg, dbRef.current);
        setDB((d) => mergeIntoDB({ ...d, settings: res.db.settings, sync: res.db.sync }, res.db.stagiaires, res.db.supprimes).db);
        const p = await pushDB(cfg, { ...dbRef.current, sync: res.db.sync });
        mergePushed(p);
      } else if (student) {
        const res = await pullStudent(cfg, dbRef.current, student.cle);
        setDB((d) => mergeIntoDB({ ...d, settings: res.db.settings }, res.db.stagiaires.filter((s) => s.id === student.id), res.db.supprimes).db);
        const me = dbRef.current.stagiaires.find((s) => s.id === student.id);
        if (me) mergePushed(await pushDB(cfg, dbRef.current, { student: me }));
      }
      ok();
    } catch (e) { fail(e); }
    setSyncing(false);
  }, [cfg, isAdmin, student?.id]);

  /* Envoi automatique 2 s après chaque modification */
  useEffect(() => {
    if (!cloudReady(cfg) || !auth) return;
    if (isAdmin && !loadAdminToken()) return;
    const t = setTimeout(async () => {
      try {
        const me = student && dbRef.current.stagiaires.find((s) => s.id === student.id);
        if (!isAdmin && !me) return;
        const res = await pushDB(cfg, dbRef.current, isAdmin ? {} : { student: me });
        if (res.sent) { mergePushed(res); ok(); }
      } catch (e) { fail(e); }
    }, 2000);
    return () => clearTimeout(t);
  }, [db.updatedAt, cfg.enabled, auth?.role]);

  /* Réception périodique (formateur : toute la promotion · stagiaire : ses autorisations) */
  useEffect(() => {
    if (!cloudReady(cfg) || !auth || moduleId) return;
    syncNow();
    const t = setInterval(syncNow, 60000);
    return () => clearInterval(t);
  }, [cfg.enabled, cfg.url, auth?.role, auth?.studentId, moduleId]);

  /* ---------------- Connexions ---------------- */
  const studentLogin = async ({ nom, prenom, typeFormation }) => {
    const cle = cleStagiaire(nom, prenom, typeFormation);
    const id = idFromCle(cle);
    let base = dbRef.current;
    if (cloudReady(cfg)) {
      try { base = (await pullStudent(cfg, base, cle)).db; setCloudErr(""); } catch (e) { setCloudErr(e.message); }
    }
    const existing = base.stagiaires.find((s) => s.id === id);
    const t = nowISO();
    const next = existing
      ? { ...base, updatedAt: t, stagiaires: base.stagiaires.map((s) => (s.id === id ? { ...s, lastLogin: t } : s)) }
      : { ...base, updatedAt: t, stagiaires: [...base.stagiaires, newStudent({ nom, prenom, typeFormation })] };
    setDB(() => next);
    setAuth({ role: "stagiaire", studentId: id });
    setBanner(existing ? "Profil retrouvé : votre parcours a été rechargé." : "Profil créé : bienvenue dans la formation.");
    window.location.hash = "";
  };
  const adminLogin = (login) => { setAuth({ role: "admin", login }); window.location.hash = ""; };
  const logout = () => { setAuth(null); window.location.hash = ""; window.scrollTo({ top: 0 }); };

  const launchModule = (id) => { window.location.hash = MODULE_PREFIX + id; window.scrollTo({ top: 0 }); };
  const backToPortal = () => { window.location.hash = "portail"; window.scrollTo({ top: 0 }); };

  /* ---------------- Contexte des modules ---------------- */
  const mState = student && moduleId ? moduleState(student, moduleId, policy) : null;
  const logAttempt = useCallback((entry) => {
    if (!student || !moduleId) return;
    const att = makeAttempt(moduleId, entry);
    if (entry?.kind === "debut") {
      /* Anti-triche : le démarrage du sprint est écrit dans localStorage IMMÉDIATEMENT (avant l'affichage
         de la question 1) et poussé vers le cloud sans attendre : un F5 en plein test laisse une trace. */
      const next = addHistory(dbRef.current, student.id, att);
      saveDB(next);
      dbRef.current = next;
      if (cloudReady(cfg)) {
        const me = next.stagiaires.find((s) => s.id === student.id);
        if (me) pushDB(cfg, next, { student: me }).then((res) => { if (res.sent) mergePushed(res); }).catch(() => { /* renvoyé au prochain envoi automatique */ });
      }
    }
    setDB((d) => (d.stagiaires.some((s) => s.id === student.id && s.historique.some((h) => h.id === att.id)) ? d : addHistory(d, student.id, att)));
  }, [student?.id, moduleId, cfg]);
  const sessionValue = useMemo(() => {
    if (isAdmin) return { mode: "apercu", moduleId, canAttempt: true, blockReason: "", logAttempt: () => {} };
    if (student) return { mode: "stagiaire", moduleId, canAttempt: mState?.canAttempt ?? true, blockReason: mState?.blockReason || "", logAttempt };
    return { mode: "libre", moduleId, canAttempt: true, blockReason: "", logAttempt: () => {} };
  }, [isAdmin, student?.id, moduleId, mState?.canAttempt, mState?.blockReason, logAttempt]);

  const saveScore = (score, entry) => {
    if (!student || typeof score !== "number" || !Number.isFinite(score)) return;
    const cur = moduleState(dbRef.current.stagiaires.find((s) => s.id === student.id) || student, moduleId, dbRef.current.settings.retryPolicy);
    if (!cur.canAttempt) { setToast({ modId: moduleId, score, statut: statutDe(score), refused: cur.blockReason }); return; }
    setDB((d) => addHistory(d, student.id, makeAttempt(moduleId, { ...(entry || {}), kind: "sprint", score, statut: statutDe(score) })));
    setToast({ modId: moduleId, score, statut: statutDe(score) });
  };

  /* ---------------- Rendu ---------------- */
  if (!auth || (auth.role === "stagiaire" && !student)) {
    setSessionStudent(null);
    return <AuthPortal onStudentLogin={studentLogin} onAdminLogin={adminLogin} cloudOn={cloudReady(cfg)} />;
  }

  if (moduleId) {
    const Comp = MODULE_COMPONENTS[moduleId];
    const m = MOD[moduleId];
    setSessionStudent(isAdmin ? "apercu-formateur" : student.id);
    return (
      <ModuleSessionContext.Provider value={sessionValue}>
        <div className="min-h-full bg-bg text-ink">
          <div className={isAdmin ? "border-b border-amber/40 bg-amber/10" : "border-b border-line bg-panel2"}>
            <div className="gutter mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 py-2 text-[12px]">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 text-amber"><Eye size={14} />Aperçu formateur : rien n'est enregistré.</span>
              ) : (
                <span className="text-muted">
                  <strong className="text-ink">{student.prenom} {student.nom}</strong><span className="font-mono"> · {student.matricule} · {student.typeFormation}</span>
                  {mState?.canAttempt ? <> · le sprint noté de {m.code} est enregistré automatiquement (seuil {SEUIL} %).</> : null}
                </span>
              )}
              {!isAdmin && !mState?.canAttempt && <span className="inline-flex items-center gap-1.5 text-amber"><Lock size={13} />Mode révision : {mState?.blockReason}</span>}
              <span className={isAdmin ? "ml-auto" : ""}><LexiqueButton /></span>
              {!isAdmin && <span className="ml-auto font-mono text-muted">{m.code} : <span className={mState?.statut === V ? "text-ok" : "text-ink"}>{pct(mState?.score)}</span> · {mState?.tentatives || 0} tentative(s)</span>}
            </div>
          </div>
          <Suspense fallback={<div className="gutter mx-auto max-w-6xl py-10 font-mono text-[12px] uppercase tracking-wider text-muted">Chargement du module {m.code}…</div>}>
            <Comp key={`${moduleId}:${isAdmin ? "apercu" : student.id}`} student={isAdmin ? null : student} onBack={backToPortal} onSaveScore={isAdmin ? undefined : saveScore} />
          </Suspense>
          {toast && toast.modId === moduleId && <SaveToast save={toast} student={student} onBack={backToPortal} />}
        </div>
      </ModuleSessionContext.Provider>
    );
  }

  setSessionStudent(null);
  const cloud = { cfg, setCfg, syncNow, syncing, error: cloudErr, on: cloudReady(cfg), deleteStudent: (s) => cloudReady(cfg) && deleteStudentCloud(cfg, s).catch((e) => setCloudErr(e.message)) };
  return (
    <>
      {banner && <div role="status" className="fixed inset-x-0 top-3 z-[70] flex justify-center px-4"><div className="flex items-center gap-2 rounded-xl border border-sky/60 bg-panel px-4 py-2.5 text-[13px] text-ink shadow-2xl">{banner.includes("cloud") ? <Cloud size={16} className="text-sky" /> : <CheckCircle2 size={16} className="text-ok" />}{banner}</div></div>}
      {isAdmin
        ? <AdminDashboard db={db} setDB={setDB} adminLogin={auth.login} onLogout={logout} onPreview={launchModule} cloud={cloud} />
        : <StudentSpace student={student} calc={calcStagiaire(student, policy)} onLaunch={launchModule} onLogout={logout} cloud={cloud} policy={policy} />}
    </>
  );
}

/* Confirmation affichée dans le module dès que le score est écrit (ou refusé) */
function SaveToast({ save, student, onBack }) {
  const good = save.statut === V && !save.refused;
  const Icon = good ? CheckCircle2 : XCircle;
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 z-[60] flex justify-center px-4" style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
      <div className={`flex max-w-lg flex-wrap items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl ${good ? "border-ok bg-[#0d2a20]" : save.refused ? "border-amber bg-[#2a2210]" : "border-ko bg-[#2a1018]"}`}>
        <Icon size={20} className={good ? "text-ok" : save.refused ? "text-amber" : "text-ko"} />
        <div className="min-w-0 flex-1 text-[13px] text-ink">
          <div className={`font-mono text-[11px] uppercase tracking-wider ${good ? "text-ok" : save.refused ? "text-amber" : "text-ko"}`}>{save.refused ? "Score non enregistré" : `Tentative enregistrée · ${MOD[save.modId].code} · ${save.statut}`}</div>
          {save.refused ? save.refused : <>{student ? `${student.prenom} ${student.nom}` : "Stagiaire"} : <strong className="font-mono">{pct(save.score)}</strong>{save.statut === V ? " : module VALIDE." : " : module À REVOIR, relancez une tentative avec un nouveau tirage."}</>}
        </div>
        <BackToPortal onBack={onBack} />
      </div>
    </div>
  );
}
