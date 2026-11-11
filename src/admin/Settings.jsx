/* Paramètres administrateur : mot de passe (empreinte hashée) et règle de nouvelle tentative */
import React, { useState } from "react";
import { KeyRound, Loader2, CheckCircle2, AlertTriangle, Copy, RotateCcw } from "lucide-react";
import { Panel, Eyebrow, Btn, Field, inputCls } from "../lms/ui.jsx";
import { cx, nowISO } from "../lms/db.js";
import { loadAdminCred, makeAdminCred, saveAdminCred, resetAdminCred, adminConfigSnippet, verifyAdmin } from "../auth/session.js";

export default function Settings({ db, setDB }) {
  const cred = loadAdminCred();
  const [login, setLogin] = useState(cred.login);
  const [cur, setCur] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [snippet, setSnippet] = useState("");
  const policy = db.settings.retryPolicy;

  const change = async () => {
    setMsg(null);
    if (p1.length < 10) return setMsg({ ok: false, text: "10 caractères minimum." });
    if (p1 !== p2) return setMsg({ ok: false, text: "Les deux saisies du nouveau mot de passe diffèrent." });
    if (!login.trim()) return setMsg({ ok: false, text: "Identifiant requis." });
    setBusy(true);
    const v = await verifyAdmin(cred.login, cur);
    if (!v.ok) { setBusy(false); return setMsg({ ok: false, text: "Mot de passe actuel incorrect. " + v.error }); }
    const c = await makeAdminCred(login, p1);
    saveAdminCred(c);
    setSnippet(adminConfigSnippet(c));
    setCur(""); setP1(""); setP2(""); setBusy(false);
    setMsg({ ok: true, text: "Nouveau mot de passe actif sur CE PC. Pour l'appliquer à tous les PC, remplacez le contenu de src/config/admin.config.js par le bloc ci-dessous puis republiez le site." });
  };
  const setPolicy = (p) => setDB((d) => ({ ...d, settings: { ...d.settings, retryPolicy: p, updatedAt: nowISO() } }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2"><KeyRound size={18} className="text-sky" /><div><Eyebrow>Sécurité</Eyebrow><h3 className="font-display text-xl font-semibold text-ink">Identifiants administrateur</h3></div></div>
        <p className="text-[13px] leading-relaxed text-muted">Seule l'empreinte PBKDF2-SHA-256 (100 000 itérations, sel aléatoire) est enregistrée. {cred.custom ? "Un mot de passe personnalisé est actif sur ce PC." : "Les identifiants par défaut du fichier admin.config.js sont actifs."}</p>
        <Field label="Identifiant" id="se-login"><input id="se-login" value={login} onChange={(e) => setLogin(e.target.value)} className={inputCls} /></Field>
        <Field label="Mot de passe actuel" id="se-cur"><input id="se-cur" type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" className={inputCls} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nouveau mot de passe" id="se-p1"><input id="se-p1" type="password" value={p1} onChange={(e) => setP1(e.target.value)} autoComplete="new-password" className={inputCls} /></Field>
          <Field label="Confirmation" id="se-p2"><input id="se-p2" type="password" value={p2} onChange={(e) => setP2(e.target.value)} autoComplete="new-password" className={inputCls} /></Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn tone="primary" onClick={change} disabled={busy || !cur || !p1}>{busy ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}Changer le mot de passe</Btn>
          {cred.custom && <Btn onClick={() => { resetAdminCred(); setMsg({ ok: true, text: "Retour aux identifiants du fichier admin.config.js sur ce PC." }); setSnippet(""); }}><RotateCcw size={15} />Revenir aux identifiants par défaut</Btn>}
        </div>
        {msg && <p role="status" className={cx("flex items-start gap-2 rounded-lg border px-3 py-2 text-[13px]", msg.ok ? "border-ok/50 bg-ok/10 text-ok" : "border-ko/50 bg-ko/10 text-ko")}>{msg.ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> : <AlertTriangle size={15} className="mt-0.5 shrink-0" />}{msg.text}</p>}
        {snippet && (
          <div className="flex flex-col gap-2">
            <textarea readOnly rows={7} value={snippet} onFocus={(e) => e.target.select()} className={inputCls + " font-mono text-[11px]"} aria-label="Contenu de admin.config.js" />
            <div><Btn onClick={() => navigator.clipboard?.writeText(snippet)}><Copy size={15} />Copier le bloc admin.config.js</Btn></div>
          </div>
        )}
      </Panel>

      <Panel className="flex flex-col gap-4 p-5">
        <div><Eyebrow>Pédagogie</Eyebrow><h3 className="font-display text-xl font-semibold text-ink">Nouvelle tentative après un À REVOIR</h3></div>
        {[["libre", "Libre", "Le stagiaire peut repasser un module < 85 % quand il veut, avec un nouveau tirage. Chaque tentative est enregistrée."],
          ["autorisation", "Sur autorisation du formateur", "Après un À REVOIR, le sprint noté reste verrouillé jusqu'à ce que vous cliquiez « Autoriser une nouvelle tentative » dans la fiche du stagiaire."]].map(([id, t, d]) => (
          <label key={id} className={cx("flex cursor-pointer gap-3 rounded-lg border p-3", policy === id ? "border-sky bg-sky/10" : "border-line bg-panel2")}>
            <input type="radio" name="policy" checked={policy === id} onChange={() => setPolicy(id)} className="mt-1 accent-sky" />
            <span><span className="block text-[14px] font-semibold text-ink">{t}</span><span className="text-[13px] text-muted">{d}</span></span>
          </label>
        ))}
        <p className="text-[12px] text-muted">Cette règle s'applique aux PC qui partagent cette base (même PC ou base synchronisée par le cloud). Un module VALIDE (≥ 85 %) reste toujours verrouillé, sauf réinitialisation par le formateur.</p>
      </Panel>
    </div>
  );
}
