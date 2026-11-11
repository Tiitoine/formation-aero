/* ============================================================
   ÉCRAN DE CONNEXION — 2 onglets : Stagiaire / Administrateur
   ============================================================ */
import React, { useState } from "react";
import { GraduationCap, ShieldCheck, LogIn, Loader2, Info, Lock, Cloud } from "lucide-react";
import { TYPES_FORMATION, SEUIL, cx } from "../lms/db.js";
import { Panel, Eyebrow, Btn, Field, inputCls } from "../lms/ui.jsx";
import { verifyAdmin } from "./session.js";

export default function AuthPortal({ onStudentLogin, onAdminLogin, cloudOn }) {
  const [tab, setTab] = useState("stagiaire");
  return (
    <div className="min-h-full bg-bg text-ink">
      <div className="gutter mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 py-10">
        <header className="flex flex-col gap-3">
          <Eyebrow>Airbus Helicopters · Bureau des Méthodes · Formation métier</Eyebrow>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl" style={{ textWrap: "balance" }}>Préparateur Méthodes Assemblage</h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted">
            Cursus de 5 modules (M1 à M4B). Chaque atelier verrouille votre premier choix et chaque module est validé à partir de <strong className="text-ink">{SEUIL} %</strong> de bonnes réponses.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Panel className="overflow-hidden">
            <div className="grid grid-cols-2 border-b border-line" role="tablist" aria-label="Type de connexion">
              {[["stagiaire", "Stagiaire", GraduationCap], ["admin", "Administrateur", ShieldCheck]].map(([id, label, Icon]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                  className={cx("flex items-center justify-center gap-2 px-4 py-4 text-[14px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky",
                    tab === id ? "bg-panel text-ink shadow-[inset_0_-2px_0_#3b9eff]" : "bg-panel2 text-muted hover:text-ink")}>
                  <Icon size={17} className={tab === id ? "text-sky" : ""} />{label}
                </button>
              ))}
            </div>
            <div className="p-5 sm:p-7">
              {tab === "stagiaire" ? <StudentForm onLogin={onStudentLogin} /> : <AdminForm onLogin={onAdminLogin} />}
            </div>
          </Panel>

          <aside className="flex flex-col gap-4 text-[13px] leading-relaxed text-muted">
            <Panel className="p-5">
              <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-sky"><Info size={14} />Règle de validation</div>
              <p><span className="font-mono text-ko">&lt; 85 %</span> : À REVOIR, le module peut être repassé avec un nouveau tirage.</p>
              <p className="mt-1"><span className="font-mono text-ok">≥ 85 %</span> : VALIDE, le module est verrouillé.</p>
              <p className="mt-2">Toutes vos tentatives sont enregistrées et consultables par le formateur.</p>
            </Panel>
            <Panel className="p-5">
              <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-sky"><Cloud size={14} />Synchronisation</div>
              {cloudOn
                ? <p>Ce PC est relié à la base cloud de la formation : vous retrouvez votre parcours sur n'importe quel poste configuré.</p>
                : <p>Ce PC enregistre votre parcours localement. Pour changer de poste, utilisez « Exporter mes résultats » dans votre espace et transmettez le fichier ou le code au formateur.</p>}
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StudentForm({ onLogin }) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [type, setType] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) return setErr("Renseignez votre nom et votre prénom.");
    if (!TYPES_FORMATION.includes(type)) return setErr("Choisissez votre type de formation.");
    setErr(""); setBusy(true);
    try { await onLogin({ nom, prenom, typeFormation: type }); } catch (e2) { setErr(e2.message || "Connexion impossible."); }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Accès stagiaire</h2>
        <p className="mt-1 text-[13px] text-muted">Votre profil est créé à la première connexion, puis retrouvé à l'identique (même nom, prénom et type de formation).</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" id="st-nom"><input id="st-nom" autoComplete="family-name" value={nom} onChange={(e) => setNom(e.target.value)} className={inputCls} placeholder="DUPONT" /></Field>
        <Field label="Prénom" id="st-prenom"><input id="st-prenom" autoComplete="given-name" value={prenom} onChange={(e) => setPrenom(e.target.value)} className={inputCls} placeholder="Marie" /></Field>
      </div>
      <Field label="Type de formation" id="st-type">
        <select id="st-type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
          <option value="">— Sélectionnez votre type de formation —</option>
          {TYPES_FORMATION.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      {err && <p role="alert" className="rounded-lg border border-ko/50 bg-ko/10 px-3 py-2 text-[13px] text-ko">{err}</p>}
      <Btn type="submit" tone="primary" disabled={busy} className="h-11 text-[14px]">{busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}Accéder à mon parcours</Btn>
    </form>
  );
}

function AdminForm({ onLogin }) {
  const [login, setLogin] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    const r = await verifyAdmin(login, pwd);
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    setPwd("");
    onLogin(r.login);
  };
  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Accès formateur / administrateur</h2>
        <p className="mt-1 text-[13px] text-muted">Suivi de tous les stagiaires, grille des 20 compétences, bilans, autorisations et synchronisation.</p>
      </div>
      <Field label="Identifiant" id="ad-login"><input id="ad-login" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} className={inputCls} /></Field>
      <Field label="Mot de passe" id="ad-pwd"><input id="ad-pwd" type="password" autoComplete="current-password" value={pwd} onChange={(e) => setPwd(e.target.value)} className={inputCls} /></Field>
      {err && <p role="alert" className="rounded-lg border border-ko/50 bg-ko/10 px-3 py-2 text-[13px] text-ko">{err}</p>}
      <Btn type="submit" tone="primary" disabled={busy || !login || !pwd} className="h-11 text-[14px]">{busy ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}{busy ? "Vérification…" : "Se connecter"}</Btn>
      <p className="text-[12px] leading-relaxed text-muted">Le mot de passe n'est pas stocké en clair : seule son empreinte PBKDF2-SHA-256 est enregistrée.</p>
    </form>
  );
}
