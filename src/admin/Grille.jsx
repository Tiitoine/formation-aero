/* Grille d'évaluation formateur : 20 compétences métier (seuil 85 %) */
import React, { useState, useEffect } from "react";
import { ShieldAlert, Wand2, X, AlertTriangle, Target, CheckCircle2, ExternalLink, Flag, Copy } from "lucide-react";
import { cx, isNum, clamp, statutDe, pct, V, R, N, MOD, ALL_COMPS, binEntry, pctEntry, autoScore } from "../lms/db.js";
import { Panel, Eyebrow, StatusBadge, ThresholdBar, Btn, Modal, Field, inputCls } from "../lms/ui.jsx";

export function remediation(s, c) {
  const modules = c.mods.filter((m) => m.statut !== V).map((m) => ({ ...m, action: m.statut === N ? "À passer" : `À repasser (${pct(m.score)}, ${m.tentatives} tentative${m.tentatives > 1 ? "s" : ""})` }));
  const comps = c.grille.domaines.flatMap((d) => d.aRetravailler.map((i) => ({ ...i, domaine: d.id, domTitre: d.titre })));
  const nonEval = c.grille.domaines.flatMap((d) => d.nonEvalues.map((i) => ({ ...i, domaine: d.id })));
  return { modules, comps, nonEval };
}
export function remediationTexte(s, c) {
  const r = remediation(s, c);
  const l = [];
  r.modules.forEach((m) => l.push(`• ${m.code} — ${m.action}`));
  r.comps.forEach((i) => l.push(`• ${i.id} ${i.label} (${i.entry?.mode === "bin" ? "À REVOIR" : pct(i.score)}) → revoir ${i.mods.map((x) => MOD[x].code).join(" / ")}${i.critique ? " [CRITIQUE SÉCURITÉ]" : ""}`));
  const flag = s.fiche?.drapeauSecurite || s.drapeauSecurite;
  if (flag?.actif) l.push(`• Drapeau rouge sécurité : ${flag.motif || "à préciser"}`);
  return l.join("\n");
}

function CompRow({ item, modules, onSet }) {
  const e = item.entry;
  const [draft, setDraft] = useState(e?.mode === "pct" ? String(e.score) : "");
  useEffect(() => { setDraft(e?.mode === "pct" ? String(e.score) : ""); }, [e?.mode, e?.score]);
  const auto = autoScore(item, modules);
  const commitPct = () => {
    if (draft.trim() === "") return;
    const n = Number(draft.replace(",", "."));
    if (Number.isFinite(n)) onSet(pctEntry(clamp(n)));
  };
  const st = isNum(item.score) ? statutDe(item.score) : N;
  return (
    <div className={cx("grid gap-3 border-b border-line/70 px-4 py-3 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center", st === R && "bg-ko/5")}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 w-7 shrink-0 font-mono text-[12px] font-semibold text-sky">{item.id}</span>
        <div className="min-w-0">
          <div className="text-[14px] text-ink">{item.label}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {item.mods.map((x) => <span key={x} className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">{MOD[x].code} {isNum(modules?.[x]?.score) ? Math.floor(modules[x].score) + "%" : "—"}</span>)}
            {item.critique && <span className="inline-flex items-center gap-1 rounded border border-ko/50 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ko"><ShieldAlert size={11} />Critique sécurité</span>}
            {e?.auto && <span className="font-mono text-[10px] text-muted">auto-calculé</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-10 lg:pl-0">
        <div className="flex overflow-hidden rounded-lg border border-line" role="group" aria-label={`Évaluation ${item.id}`}>
          <button type="button" onClick={() => onSet(binEntry(V))} aria-pressed={e?.mode === "bin" && e.statut === V}
            className={cx("px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", e?.mode === "bin" && e.statut === V ? "bg-ok text-bg" : "bg-panel2 text-ok hover:bg-ok/10")}>Valide</button>
          <button type="button" onClick={() => onSet(binEntry(R))} aria-pressed={e?.mode === "bin" && e.statut === R}
            className={cx("border-l border-line px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", e?.mode === "bin" && e.statut === R ? "bg-ko text-bg" : "bg-panel2 text-ko hover:bg-ko/10")}>À revoir</button>
        </div>
        <div className="flex items-center gap-1">
          <input id={`pct-${item.id}`} aria-label={`Score en % pour ${item.id}`} inputMode="decimal" value={draft} placeholder="%"
            onChange={(ev) => setDraft(ev.target.value)} onBlur={commitPct} onKeyDown={(ev) => ev.key === "Enter" && commitPct()}
            className={cx("w-16 rounded-lg border bg-panel2 px-2 py-1.5 text-right font-mono text-[13px] text-ink focus:border-sky focus:outline-none", e?.mode === "pct" ? (st === V ? "border-ok" : "border-ko") : "border-line")} />
          <button type="button" title={isNum(auto) ? `Auto-calcul depuis les modules : ${pct(auto)}` : "Aucun module lié n'est encore évalué"} aria-label={`Auto-calcul ${item.id}`}
            disabled={!isNum(auto)} onClick={() => onSet(pctEntry(auto, true))}
            className={cx("grid h-8 w-8 place-items-center rounded-md border border-line bg-panel2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", isNum(auto) ? "text-sky hover:border-sky/60" : "cursor-not-allowed text-muted opacity-50")}><Wand2 size={15} /></button>
          <button type="button" title="Effacer (Non évalué)" aria-label={`Effacer ${item.id}`} disabled={!e} onClick={() => onSet(null)}
            className={cx("grid h-8 w-8 place-items-center rounded-md border border-line bg-panel2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", e ? "text-muted hover:text-ink" : "cursor-not-allowed text-muted opacity-40")}><X size={15} /></button>
        </div>
        <div className="w-[104px]"><StatusBadge statut={st} size="sm" /></div>
      </div>
    </div>
  );
}

export default function Grille({ active, calc, updateFiche, onLaunchModule }) {
  const fiche = active.fiche;
  const [autoAsk, setAutoAsk] = useState(false);
    const setComp = (id, entry) => updateFiche((s) => ({ ...s, grilleCompetences: { ...s.grilleCompetences, [id]: entry } }));
  const autoAll = (onlyEmpty) => {
    updateFiche((s) => {
      const gc = { ...s.grilleCompetences };
      ALL_COMPS.forEach((c) => {
        if (onlyEmpty && gc[c.id]) return;
        const a = autoScore(c, calc.modsMap);
        if (isNum(a)) gc[c.id] = pctEntry(a, true);
      });
      return { ...s, grilleCompetences: gc };
    });
    setAutoAsk(false);
  };
  const rem = remediation(active, calc);
  const G = calc.grille;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>Espace formateur · Grille des 20 compétences métier</Eyebrow>
          <h2 className="font-display text-3xl font-semibold text-ink">{active.prenom} {active.nom.toUpperCase()}</h2>
          <span className="font-mono text-[12px] text-muted">{active.matricule} · {active.typeFormation}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn tone="primary" onClick={() => setAutoAsk(true)}><Wand2 size={15} />Auto-calcul depuis les 5 modules</Btn>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_repeat(5,1fr)]">
        <Panel className={cx("flex flex-col gap-2 p-4", G.statut === V ? "border-ok/50" : G.statut === R ? "border-ko/50" : "")}>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Score global de grille</span>
          <div className="flex items-baseline gap-2"><span className={cx("font-mono text-3xl font-semibold tabular-nums", G.statut === V ? "text-ok" : G.statut === R ? "text-ko" : "text-muted")}>{pct(G.global)}</span><span className="font-mono text-[12px] text-muted">{G.nbEval}/20</span></div>
          <StatusBadge statut={G.complete ? G.statut : G.nbEval ? R : N} />
          {!G.complete && G.nbEval > 0 && <span className="text-[11px] text-amber">Grille incomplète : statut À REVOIR tant que les 20 critères ne sont pas évalués.</span>}
        </Panel>
        {G.domaines.map((d) => (
          <a key={d.id} href={`#dom-${d.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`dom-${d.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
            className={cx("flex flex-col gap-2 rounded-xl border bg-panel p-4 transition hover:border-sky/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", d.statut === V ? "border-ok/40" : d.statut === R ? "border-ko/40" : "border-line")}>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Domaine {d.id}</span>
            <span className={cx("font-mono text-xl font-semibold tabular-nums", d.statut === V ? "text-ok" : d.statut === R ? "text-ko" : "text-muted")}>{pct(d.score)}</span>
            <ThresholdBar score={d.score} height="h-1.5" showLabel={false} />
          </a>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          {G.domaines.map((d) => (
            <section key={d.id} id={`dom-${d.id}`} className={cx("scroll-mt-40 overflow-hidden rounded-xl border bg-panel", d.statut === R ? "border-ko/50" : d.statut === V ? "border-ok/40" : "border-line")}>
              <div className="flex flex-wrap items-center gap-4 border-b border-line bg-panel2 px-4 py-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-sky/40 font-display text-xl font-semibold text-sky">{d.id}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold leading-tight text-ink">Domaine {d.id} — {d.titre}</h3>
                  <div className="text-[12px] text-muted">{d.detail}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right"><div className={cx("font-mono text-xl font-semibold tabular-nums", d.statut === V ? "text-ok" : d.statut === R ? "text-ko" : "text-muted")}>{pct(d.score)}</div><div className="font-mono text-[10px] text-muted">{d.nbEval}/4 évaluées</div></div>
                  <StatusBadge statut={d.statut} />
                </div>
              </div>
              {d.items.map((it) => <CompRow key={it.id} item={it} modules={calc.modsMap} onSet={(en) => setComp(it.id, en)} />)}
              {d.statut === R && (
                <div className="border-t border-ko/40 bg-ko/10 px-4 py-3">
                  <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ko"><AlertTriangle size={14} />Domaine à revoir · points à retravailler</div>
                  <ul className="flex flex-col gap-1 text-[13px] text-ink">
                    {d.aRetravailler.map((i) => <li key={i.id}><span className="font-mono text-ko">{i.id}</span> {i.label} <span className="text-muted">→ revoir {i.mods.map((x) => MOD[x].code).join(" / ")}</span></li>)}
                    {!d.aRetravailler.length && <li className="text-muted">La moyenne du domaine est sous 85 % : renforcer les critères les plus faibles.</li>}
                  </ul>
                </div>
              )}
              {d.nonEvalues.length > 0 && d.nbEval > 0 && (
                <div className="border-t border-line px-4 py-2 text-[12px] text-amber">Reste à évaluer : {d.nonEvalues.map((i) => i.id).join(", ")}</div>
              )}
            </section>
          ))}
        </div>

        <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-40 xl:self-start">
          <Panel className={cx("p-5", rem.modules.length || rem.comps.length ? "border-amber/50" : "border-ok/50")}>
            <div className="mb-3 flex items-center gap-2"><Target size={18} className="text-amber" /><h3 className="font-display text-xl font-semibold text-ink">Plan de remédiation</h3></div>
            {!rem.modules.length && !rem.comps.length && !rem.nonEval.length ? (
              <p className="flex items-center gap-2 text-[14px] text-ok"><CheckCircle2 size={16} />Aucun module ni compétence sous 85 %.</p>
            ) : (
              <div className="flex flex-col gap-4 text-[13px]">
                {rem.modules.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Modules à faire repasser</span>
                    {rem.modules.map((m) => (
                      <button type="button" key={m.id} onClick={() => onLaunchModule && onLaunchModule(m.id)} className="flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-2 text-left text-ink hover:border-sky/60">
                        <span className={cx("font-mono font-semibold", m.statut === R ? "text-ko" : "text-muted")}>{m.code}</span><span className="min-w-0 flex-1 truncate">{m.action}</span><ExternalLink size={13} className="text-muted" />
                      </button>
                    ))}
                  </div>
                )}
                {rem.comps.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Compétences sous 85 %</span>
                    {rem.comps.map((i) => (
                      <div key={i.id} className="flex gap-2"><span className={cx("w-7 shrink-0 font-mono font-semibold", i.critique ? "text-ko" : "text-amber")}>{i.id}</span><span className="text-ink">{i.label}{i.critique && <span className="ml-1 font-mono text-[10px] uppercase text-ko">· critique</span>}<span className="text-muted"> → {i.mods.map((x) => MOD[x].code).join(" / ")}</span></span></div>
                    ))}
                  </div>
                )}
                {rem.nonEval.length > 0 && <div className="text-[12px] text-muted">Non évaluées ({rem.nonEval.length}) : {rem.nonEval.map((i) => i.id).join(", ")}</div>}
              </div>
            )}
          </Panel>

          <Panel className={cx("p-5", calc.drapeau ? "border-ko" : "")}>
            <div className="mb-3 flex items-center gap-2"><Flag size={18} className="text-ko" /><h3 className="font-display text-lg font-semibold text-ink">Drapeau rouge sécurité des vols</h3></div>
            <label htmlFor="flag-on" className="flex items-center gap-2 text-[14px] text-ink">
              <input id="flag-on" type="checkbox" className="h-4 w-4 accent-ko" checked={!!fiche.drapeauSecurite?.actif}
                onChange={(e) => updateFiche((s) => ({ ...s, drapeauSecurite: { ...s.drapeauSecurite, actif: e.target.checked } }))} />
              Lever un drapeau rouge manuel (bloque l'habilitation)
            </label>
            {fiche.drapeauSecurite?.actif && (
              <textarea id="flag-motif" rows={2} placeholder="Motif : ex. freinage absent sur biellette de commande rotor" value={fiche.drapeauSecurite.motif}
                onChange={(e) => updateFiche((s) => ({ ...s, drapeauSecurite: { ...s.drapeauSecurite, motif: e.target.value } }))} className={cx(inputCls, "mt-3")} />
            )}
            {G.critiquesKO.length > 0 && <p className="mt-3 text-[12px] text-ko">Drapeau automatique : compétence(s) critique(s) {G.critiquesKO.map((c) => c.id).join(", ")} sous 85 %.</p>}
          </Panel>

          <Panel className="flex flex-col gap-4 p-5">
            <Field label="Commentaire formateur" id="g-com"><textarea id="g-com" rows={4} value={fiche.commentaireFormateur} onChange={(e) => updateFiche((s) => ({ ...s, commentaireFormateur: e.target.value }))} className={inputCls} /></Field>
            <Field label="Points à revoir" id="g-par"><textarea id="g-par" rows={4} value={fiche.pointsARevoir} onChange={(e) => updateFiche((s) => ({ ...s, pointsARevoir: e.target.value }))} className={inputCls} /></Field>
            <Btn onClick={() => updateFiche((s) => ({ ...s, pointsARevoir: remediationTexte(active, calc) || "Aucun point sous 85 %." }))}><Copy size={15} />Insérer le plan de remédiation</Btn>
          </Panel>
        </aside>
      </div>

      <Modal open={autoAsk} onClose={() => setAutoAsk(false)} kicker="Auto-calcul" title="Calculer la grille depuis les scores des modules">
        <p className="text-[14px] leading-relaxed text-muted">Chaque compétence reçoit la moyenne des modules qui lui sont liés (ex. B2 ← M2). Les compétences dont aucun module lié n'est évalué restent « Non évalué ».</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Btn onClick={() => autoAll(true)}>Compléter les non évaluées</Btn>
          <Btn tone="primary" onClick={() => autoAll(false)}><Wand2 size={15} />Tout recalculer</Btn>
        </div>
      </Modal>
    </div>
  );
}

