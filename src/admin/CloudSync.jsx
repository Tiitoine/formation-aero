/* Panneau « Sync Cloud Multi-PC » (Supabase) */
import React, { useState } from "react";
import { Cloud, CloudOff, RefreshCw, Link2, CheckCircle2, AlertTriangle, LogIn, LogOut, Loader2, ShieldCheck, Copy } from "lucide-react";
import { frDateTime } from "../lms/db.js";
import { Panel, Eyebrow, Btn, Field, inputCls } from "../lms/ui.jsx";
import { saveCloudConfig, testConnection, adminSignIn, loadAdminToken, clearAdminToken, configLink, cloudReady } from "../lms/sync.js";

export default function CloudSync({ cfg, setCfg, onSyncNow, syncing }) {
  const [url, setUrl] = useState(cfg.url);
  const [key, setKey] = useState(cfg.anonKey);
  const [email, setEmail] = useState(cfg.adminEmail || "");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const [token, setToken] = useState(loadAdminToken);
  const [copied, setCopied] = useState(false);

  const draft = { ...cfg, url: url.trim().replace(/\/+$/, ""), anonKey: key.trim() };
  const save = (enabled) => {
    const next = saveCloudConfig({ ...draft, enabled: enabled && !!draft.url && !!draft.anonKey, adminEmail: email.trim() });
    setCfg(next);
    setMsg({ ok: true, text: next.enabled ? "Synchronisation activée sur ce PC : elle se fera automatiquement à chaque tentative et toutes les minutes ici." : "Configuration enregistrée, synchronisation désactivée." });
  };
  const test = async () => {
    setBusy("test"); setMsg(null);
    try { await testConnection(draft); setMsg({ ok: true, text: "Connexion au projet Supabase réussie (la table ah_events répond)." }); }
    catch (e) { setMsg({ ok: false, text: `Échec : ${e.message}. Vérifiez l'URL, la clé anon et que supabase/schema.sql a bien été exécuté.` }); }
    setBusy("");
  };
  const signIn = async () => {
    setBusy("auth"); setMsg(null);
    try { const t = await adminSignIn(draft, email.trim(), pwd); setToken(t); setPwd(""); saveCloudConfig({ ...cfg, adminEmail: email.trim() }); setMsg({ ok: true, text: `Session cloud ouverte pour ${t.email}. La lecture de toute la promotion est autorisée si ce compte figure dans ah_admins.` }); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
    setBusy("");
  };
  const signOut = () => { clearAdminToken(); setToken(null); };
  const link = cloudReady(cfg) ? configLink(cfg) : "";
  const copyLink = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch (e) { /* ignore */ } };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-6">
        <Panel className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1"><Eyebrow>Sync Cloud Multi-PC</Eyebrow><h3 className="font-display text-xl font-semibold text-ink">Projet Supabase</h3></div>
            <span className={"inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] " + (cfg.enabled ? "border-ok/50 text-ok" : "border-line text-muted")}>{cfg.enabled ? <Cloud size={13} /> : <CloudOff size={13} />}{cfg.enabled ? "Activée" : "Désactivée"}</span>
          </div>
          <Field label="URL du projet (Project URL)" id="cl-url"><input id="cl-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxxxxxx.supabase.co" className={inputCls} /></Field>
          <Field label="Clé publique anon (anon public key)" id="cl-key" hint="Clé publique par conception : elle ne permet que d'ajouter des tentatives et de relire son propre parcours (règles RLS)."><input id="cl-key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="eyJhbGciOi…" className={inputCls + " font-mono text-[12px]"} /></Field>
          <div className="flex flex-wrap gap-2">
            <Btn onClick={test} disabled={!draft.url || !draft.anonKey || !!busy}>{busy === "test" ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}Tester la connexion</Btn>
            <Btn tone="primary" onClick={() => save(true)} disabled={!draft.url || !draft.anonKey}><Cloud size={15} />Enregistrer et activer</Btn>
            {cfg.enabled && <Btn tone="dangerGhost" onClick={() => save(false)}><CloudOff size={15} />Désactiver</Btn>}
          </div>
          <div className="text-[12px] text-muted">Dernière synchronisation : {frDateTime(cfg.lastSync)}{cfg.lastError && <span className="text-ko"> · dernière erreur : {cfg.lastError}</span>}</div>
        </Panel>

        <Panel className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Session administrateur cloud</h3></div>
          <p className="text-[13px] leading-relaxed text-muted">C'est cette connexion, vérifiée par le serveur Supabase, qui protège réellement les données : sans elle, personne ne peut lire la promotion, autoriser ou supprimer, même en modifiant le site.</p>
          {token ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] text-ok">Connecté : {token.email}</span>
              <Btn onClick={onSyncNow} tone="primary" disabled={!cfg.enabled || syncing}>{syncing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}Synchroniser maintenant</Btn>
              <Btn onClick={signOut}><LogOut size={15} />Fermer la session cloud</Btn>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field label="E-mail du compte formateur" id="cl-mail"><input id="cl-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className={inputCls} /></Field>
              <Field label="Mot de passe Supabase" id="cl-pwd"><input id="cl-pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="current-password" className={inputCls} /></Field>
              <Btn tone="primary" onClick={signIn} disabled={!draft.url || !draft.anonKey || !email || !pwd || !!busy}>{busy === "auth" ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}Connexion</Btn>
            </div>
          )}
        </Panel>

        {msg && <p role="status" className={"flex items-start gap-2 rounded-lg border px-3 py-2 text-[13px] " + (msg.ok ? "border-ok/50 bg-ok/10 text-ok" : "border-ko/50 bg-ko/10 text-ko")}>{msg.ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> : <AlertTriangle size={15} className="mt-0.5 shrink-0" />}{msg.text}</p>}

        {link && (
          <Panel className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2"><Link2 size={18} className="text-sky" /><h3 className="font-display text-lg font-semibold text-ink">Configurer les PC stagiaires en un clic</h3></div>
            <p className="text-[13px] text-muted">Ouvrez ce lien une fois sur chaque PC de la salle : la synchronisation y est activée automatiquement (seule la clé publique est transmise, jamais votre mot de passe).</p>
            <div className="flex flex-wrap gap-2"><Btn onClick={copyLink}>{copied ? <CheckCircle2 size={15} className="text-ok" /> : <Copy size={15} />}{copied ? "Lien copié" : "Copier le lien de configuration"}</Btn></div>
            <input readOnly value={link} onFocus={(e) => e.target.select()} className={inputCls + " font-mono text-[11px]"} aria-label="Lien de configuration" />
          </Panel>
        )}
      </div>

      <Panel className="flex flex-col gap-3 p-5 text-[13px] leading-relaxed text-muted">
        <Eyebrow>Mise en place (15 minutes, gratuit)</Eyebrow>
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          <li>Créez un projet sur <span className="text-ink">supabase.com</span> (offre gratuite).</li>
          <li>Ouvrez <span className="text-ink">SQL Editor</span>, collez le fichier <span className="font-mono text-ink">supabase/schema.sql</span> du dépôt et cliquez Run.</li>
          <li>Dans <span className="text-ink">Authentication › Users</span>, créez votre compte formateur (Add user, Auto Confirm).</li>
          <li>Exécutez la ligne <span className="font-mono text-ink">insert into ah_admins…</span> en bas du script avec votre e-mail.</li>
          <li>Dans <span className="text-ink">Project Settings › API</span>, copiez Project URL et la clé <span className="font-mono">anon public</span> ici, puis « Enregistrer et activer ».</li>
          <li>Connectez la session administrateur cloud, puis diffusez le lien de configuration aux PC stagiaires.</li>
        </ol>
        <p>Option : renseignez l'URL et la clé dans <span className="font-mono text-ink">src/config/cloud.config.js</span> avant le build pour que tous les PC soient synchronisés sans lien.</p>
      </Panel>
    </div>
  );
}
