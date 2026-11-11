/* Import / fusion de résultats (.json ou code AHSYNC1) et exports de la promotion */
import React, { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, ClipboardPaste, CheckCircle2, AlertTriangle } from "lucide-react";
import { parseImport, mergeIntoDB, MODULES, pct, today, nowISO, calcStagiaire, frDateTime, mean } from "../lms/db.js";
import { Panel, Eyebrow, Btn, inputCls, offerFile } from "../lms/ui.jsx";

const csvCell = (v) => { const s = String(v ?? ""); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export function toCSV(list, policy) {
  const head = ["Nom", "Prénom", "Type de formation", "Matricule", ...MODULES.flatMap((m) => [`${m.code} score`, `${m.code} statut`, `${m.code} tentatives`]), "Moyenne modules", "Statut modules", "Grille (sur 20)", "Score grille", "Statut final", "Dernière connexion"];
  const rows = list.map((s) => {
    const c = calcStagiaire(s, policy);
    return [s.nom, s.prenom, s.typeFormation, s.matricule, ...c.mods.flatMap((m) => [m.score ?? "", m.statut, m.tentatives]), c.moyenne === null ? "" : Math.floor(c.moyenne * 10) / 10, c.statutModules, c.grille.nbEval, c.grille.global === null ? "" : Math.floor(c.grille.global * 10) / 10, c.statutGlobal, frDateTime(s.lastLogin)];
  });
  return "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
}

export default function ImportExport({ db, setDB, filtered }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  const doImport = (raw, source) => {
    try {
      const { stagiaires, supprimes } = parseImport(raw);
      const res = mergeIntoDB(db, stagiaires, supprimes);
      setDB(() => ({ ...res.db, journal: [...(db.journal || []), { date: nowISO(), action: "import", detail: `${source} : ${stagiaires.length} fiche(s)` }].slice(-200) }));
      setMsg({ ok: true, text: `${source} fusionné : ${res.ajoutes} nouveau(x) stagiaire(s), ${res.fusionnes} fiche(s) complétée(s). Aucune tentative existante n'est écrasée.` });
      setText("");
    } catch (e) { setMsg({ ok: false, text: e.message }); }
  };
  const onFiles = async (files) => {
    const all = [], tomb = {}, errs = [];
    for (const f of files) {
      try { const r = parseImport(await f.text()); all.push(...r.stagiaires); Object.assign(tomb, r.supprimes); } catch (e) { errs.push(`${f.name} : ${e.message}`); }
    }
    if (fileRef.current) fileRef.current.value = "";
    if (!all.length) { setMsg({ ok: false, text: errs.join(" · ") || "Aucun fichier lu." }); return; }
    const res = mergeIntoDB(db, all, tomb);
    setDB(() => ({ ...res.db, journal: [...(db.journal || []), { date: nowISO(), action: "import", detail: `${files.length} fichier(s) : ${all.length} fiche(s)` }].slice(-200) }));
    setMsg({ ok: !errs.length, text: `${files.length - errs.length} fichier(s) fusionné(s) : ${res.ajoutes} nouveau(x) stagiaire(s), ${res.fusionnes} fiche(s) complétée(s).${errs.length ? " Erreurs : " + errs.join(" · ") : ""}` });
  };
  const exportJSON = () => offerFile(`ah_lms_bdd_${today()}.json`, JSON.stringify({ format: "ah-lms-bdd", version: 2, exportedAt: nowISO(), regle: "Score < 85 % = À REVOIR ; Score ≥ 85 % = VALIDE", stagiaires: db.stagiaires, supprimes: db.supprimes }, null, 2));
  const exportCSV = () => offerFile(`ah_lms_suivi_${today()}.csv`, toCSV(filtered || db.stagiaires, db.settings.retryPolicy), "text/csv");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel className="flex flex-col gap-4 p-5">
        <div><Eyebrow>Import rapide</Eyebrow><h3 className="font-display text-xl font-semibold text-ink">Fusionner des résultats de stagiaires</h3></div>
        <p className="text-[13px] leading-relaxed text-muted">Accepte les fichiers .json exportés par un stagiaire ou par un autre PC formateur, ainsi que les codes « AHSYNC1:… ». La fusion additionne l'historique : une tentative déjà connue n'est jamais dupliquée ni écrasée.</p>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".json,application/json,.txt" multiple className="hidden" onChange={(e) => onFiles([...e.target.files])} />
          <Btn tone="primary" onClick={() => fileRef.current?.click()}><Upload size={15} />Choisir un ou plusieurs fichiers .json</Btn>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="…ou collez ici un code AHSYNC1:… ou le contenu JSON" className={inputCls + " font-mono text-[12px]"} aria-label="Code ou JSON à importer" />
        <div><Btn onClick={() => doImport(text, "Code collé")} disabled={!text.trim()}><ClipboardPaste size={15} />Importer le code collé</Btn></div>
        {msg && <p role="status" className={"flex items-start gap-2 rounded-lg border px-3 py-2 text-[13px] " + (msg.ok ? "border-ok/50 bg-ok/10 text-ok" : "border-ko/50 bg-ko/10 text-ko")}>{msg.ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> : <AlertTriangle size={15} className="mt-0.5 shrink-0" />}{msg.text}</p>}
      </Panel>
      <Panel className="flex flex-col gap-4 p-5">
        <div><Eyebrow>Exports</Eyebrow><h3 className="font-display text-xl font-semibold text-ink">Sauvegarder la promotion</h3></div>
        <p className="text-[13px] leading-relaxed text-muted">La base JSON complète sert de sauvegarde et peut être réimportée sur un autre PC. Le CSV (séparateur « ; ») s'ouvre directement dans Excel et reprend les filtres actifs de la liste.</p>
        <div className="flex flex-wrap gap-2">
          <Btn tone="primary" onClick={exportJSON}><Download size={15} />Base complète (.json)</Btn>
          <Btn onClick={exportCSV}><FileSpreadsheet size={15} />Tableau de suivi (.csv)</Btn>
        </div>
        <div className="mt-2 border-t border-line pt-3 text-[12px] text-muted">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-wider">Journal des imports</div>
          {(db.journal || []).filter((j) => j.action === "import").slice(-6).reverse().map((j, i) => <div key={i}>{frDateTime(j.date)} · {j.detail}</div>)}
          {!(db.journal || []).some((j) => j.action === "import") && <div>Aucun import pour l'instant.</div>}
        </div>
        <p className="text-[12px] text-muted">Moyenne générale de la promotion : {pct(mean(db.stagiaires.map((s) => calcStagiaire(s).moyenne)))}</p>
      </Panel>
    </div>
  );
}
