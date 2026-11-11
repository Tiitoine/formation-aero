import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { CheckCircle2, XCircle, UserX } from "lucide-react";
import PortailLMS, { DB_KEY, SEUIL, V, MOD, loadDB, saveDB, normaliser, statutDe, today, pct } from "./modules/PortailLMS.jsx";

/* Chaque module est chargé à la demande : le portail s'ouvre plus vite */
const Module1 = lazy(() => import("./modules/Module1.jsx"));
const Module2 = lazy(() => import("./modules/Module2.jsx"));
const Module3 = lazy(() => import("./modules/Module3.jsx"));
const Module4A = lazy(() => import("./modules/Module4A.jsx"));
const Module4B = lazy(() => import("./modules/Module4B.jsx"));
import BackToPortal from "./lms/BackToPortal.jsx";
import { setSessionStudent } from "./lms/session.js";

/* ============================================================
   SPA · Formation Préparateur Méthodes Assemblage — Airbus Helicopters
   Règle unique : score < 85 % = À REVOIR · score ≥ 85 % = VALIDE
   ============================================================ */

/* Identifiants de module = ceux de la BDD du portail (MODULES[].id) */
const MODULE_COMPONENTS = { mod1: Module1, mod2: Module2, mod3: Module3, mod4a: Module4A, mod4b: Module4B };

/* Routage par hash : #module/mod2 → module ; tout le reste → portail.
   Le hash rend la SPA compatible GitHub Pages (pas de 404 au rechargement)
   et fait fonctionner le bouton « Précédent » du navigateur. */
const MODULE_PREFIX = "module/";
const readModuleFromHash = () => {
  const h = (window.location.hash || "").replace(/^#\/?/, "");
  if (!h.startsWith(MODULE_PREFIX)) return null;
  const id = h.slice(MODULE_PREFIX.length);
  return MODULE_COMPONENTS[id] ? id : null;
};

export default function App() {
  /* ---------- State global synchronisé avec localStorage (ah_lms_db_85_v1) ---------- */
  const [db, setDBRaw] = useState(loadDB);
  const [saved, setSaved] = useState(true);
  const [moduleId, setModuleId] = useState(readModuleFromHash);
  const [lastSave, setLastSave] = useState(null);

  useEffect(() => { setSaved(saveDB(db)); }, [db]);

  // Un autre onglet a modifié la BDD : on recharge pour ne pas écraser ses données
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

  useEffect(() => { if (!lastSave) return; const t = setTimeout(() => setLastSave(null), 6000); return () => clearTimeout(t); }, [lastSave]);

  const activeStudent = db.stagiaires.find((s) => s.id === db.activeId) || db.stagiaires[0] || null;
  const activeStudentId = activeStudent?.id || null;

  /* ---------- Pont de synchronisation des scores ---------- */
  const updateStudentScore = useCallback((studentId, modId, score) => {
    if (!studentId || !MOD[modId] || typeof score !== "number" || !Number.isFinite(score)) return;
    const statut = statutDe(score); // VALIDE si ≥ 85, À REVOIR si < 85 (ratio brut, pas d'arrondi)
    setDBRaw((d) => ({
      ...d,
      updatedAt: new Date().toISOString(),
      stagiaires: d.stagiaires.map((s) => {
        if (s.id !== studentId) return s;
        const prev = s.modules?.[modId] || {};
        return normaliser({
          ...s,
          modules: { ...s.modules, [modId]: { score, statut, tentatives: (Number(prev.tentatives) || 0) + 1, datePassage: today() } },
        });
      }),
    }));
    setLastSave({ modId, score, statut, studentId, t: Date.now() });
  }, []);

  const launchModule = (id) => {
    window.location.hash = MODULE_PREFIX + id;
    window.scrollTo({ top: 0 });
  };
  const backToPortal = () => {
    window.location.hash = "portail";
    window.scrollTo({ top: 0 });
  };

  /* ---------- Vue module ---------- */
  if (moduleId) {
    const Comp = MODULE_COMPONENTS[moduleId];
    const m = MOD[moduleId];
    setSessionStudent(activeStudentId); // progression des onglets propre au stagiaire
    return (
      <div className="min-h-full bg-bg text-ink">
        <div className="border-b border-line bg-panel2">
          <div className="gutter mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 py-2 text-[12px]">
            {activeStudent ? (
              <span className="text-muted">
                Stagiaire <strong className="text-ink">{activeStudent.prenom} {activeStudent.nom}</strong>
                <span className="font-mono"> · {activeStudent.matricule}</span>
                {" · "}le score final de {m.code} sera enregistré automatiquement dans le portail (seuil {SEUIL} %).
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber"><UserX size={14} />Aucun stagiaire sélectionné : le score ne sera pas enregistré.</span>
            )}
            <span className="ml-auto font-mono text-muted">
              Fiche actuelle {m.code} : <span className={activeStudent?.modules?.[moduleId]?.statut === V ? "text-ok" : "text-ink"}>{pct(activeStudent?.modules?.[moduleId]?.score)}</span>
            </span>
          </div>
        </div>

        <Suspense fallback={<div className="gutter mx-auto max-w-6xl py-10 font-mono text-[12px] uppercase tracking-wider text-muted">Chargement du module {m.code}…</div>}>
          <Comp
            key={`${moduleId}:${activeStudentId || "anonyme"}`}
            student={activeStudent}
            onBack={backToPortal}
            onSaveScore={activeStudentId ? (score) => updateStudentScore(activeStudentId, moduleId, score) : undefined}
          />
        </Suspense>

        {lastSave && lastSave.modId === moduleId && <SaveToast save={lastSave} student={activeStudent} onBack={backToPortal} />}
      </div>
    );
  }

  /* ---------- Vue portail ---------- */
  setSessionStudent(null);
  return <PortailLMS db={db} setDBRaw={setDBRaw} saved={saved} onLaunchModule={launchModule} />;
}

/* Confirmation affichée dans le module dès que le score est écrit dans la fiche */
function SaveToast({ save, student, onBack }) {
  const ok = save.statut === V;
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 z-[60] flex justify-center px-4" style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
      <div className={`flex max-w-lg flex-wrap items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl ${ok ? "border-ok bg-[#0d2a20]" : "border-ko bg-[#2a1018]"}`}>
        <Icon size={20} className={ok ? "text-ok" : "text-ko"} />
        <div className="min-w-0 flex-1 text-[13px] text-ink">
          <div className={`font-mono text-[11px] uppercase tracking-wider ${ok ? "text-ok" : "text-ko"}`}>Fiche mise à jour · {MOD[save.modId].code} · {save.statut}</div>
          {student ? `${student.prenom} ${student.nom}` : "Stagiaire"} : <strong className="font-mono">{pct(save.score)}</strong> enregistré dans le Portail LMS.
        </div>
        <BackToPortal onBack={onBack} />
      </div>
    </div>
  );
}
