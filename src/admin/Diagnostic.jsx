/* Diagnostic recruteur : synthèse automatique affichée en tête du parcours stagiaire */
import React from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { cx, pct, frDateTime, MOD, SEUIL } from "../lms/db.js";
import { Panel, Eyebrow, ThresholdBar } from "../lms/ui.jsx";
import { fmtDuree, court } from "../lms/diagnostic.js";

export default function Diagnostic({ dg }) {
  if (!dg.nbReponses) return (
    <Panel className="p-4 text-[13px] text-muted"><Eyebrow>Diagnostic recruteur</Eyebrow><p className="mt-1">Aucune réponse enregistrée pour l'instant : le diagnostic se remplit dès le premier atelier ou sprint.</p></Panel>
  );
  return (
    <Panel className={cx("flex flex-col gap-4 p-4", dg.themes.length && "border-ko/50")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div><Eyebrow>Diagnostic recruteur · calcul automatique</Eyebrow><div className="font-display text-xl font-semibold text-ink">Forces, lacunes et alertes sécurité</div></div>
        <div className="font-mono text-[11px] text-muted">{dg.nbReponses} réponses analysées · {dg.ateliers} atelier(s) ({dg.ateliersOK} ≥ {SEUIL} %) · {dg.nbSprints} sprint(s) noté(s)</div>
      </div>

      <div className="grid gap-2 sm:grid-cols-5">
        {dg.domaines.map((d) => (
          <div key={d.id} className={cx("rounded-lg border p-2.5", d.n === 0 ? "border-line" : d.taux >= SEUIL ? "border-ok/50 bg-ok/5" : "border-ko/50 bg-ko/5")}>
            <div className="flex items-baseline justify-between"><span className="font-mono text-[13px] font-semibold text-sky">{d.id}</span><span className="font-mono text-[13px] text-ink">{d.n ? pct(d.taux) : "—"}</span></div>
            <div className="mt-0.5 text-[11px] leading-snug text-muted">{d.titre}</div>
            <div className="mt-2"><ThresholdBar score={d.taux} height="h-1.5" showLabel={false} /></div>
            <div className="mt-1 font-mono text-[10px] text-muted">{d.ok}/{d.n} bonnes réponses</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-panel2 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[13px] font-semibold text-ok"><TrendingUp size={15} />Forces (≥ {SEUIL} %, 5 réponses mini)</div>
          {dg.forces.length ? <ul className="list-disc pl-5 text-[13px] text-ink">{dg.forces.map((d) => <li key={d.id}>{d.id} · {d.titre} ({pct(d.taux)})</li>)}</ul> : <p className="text-[13px] text-muted">Pas encore de domaine solidement acquis.</p>}
        </div>
        <div className="rounded-lg border border-line bg-panel2 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[13px] font-semibold text-ko"><TrendingDown size={15} />Lacunes précises (&lt; {SEUIL} %)</div>
          {dg.lacunes.length ? (
            <ul className="flex flex-col gap-1.5 text-[13px] text-ink">{dg.lacunes.map((d) => (
              <li key={d.id}><b>{d.id} · {d.titre}</b> ({pct(d.taux)})<div className="text-[12px] text-muted">{d.erreurs.slice(-2).map((e) => court(e.q)).join(" · ")}</div></li>
            ))}</ul>
          ) : <p className="text-[13px] text-muted">Aucune lacune mesurée sur les domaines couverts.</p>}
          {dg.nonCouverts.length > 0 && <p className="mt-1.5 text-[12px] text-muted">Non couverts : {dg.nonCouverts.map((d) => d.id).join(", ")}</p>}
        </div>
      </div>

      <div className={cx("rounded-lg border p-3", dg.themes.length ? "border-ko/60 bg-ko/10" : "border-ok/40 bg-ok/5")}>
        <div className={cx("mb-1 flex items-center gap-1.5 text-[13px] font-semibold", dg.themes.length ? "text-ko" : "text-ok")}><AlertTriangle size={15} />Drapeaux rouges sécurité des vols ({dg.alertes.length} erreur(s))</div>
        {dg.themes.length ? (
          <ul className="flex flex-col gap-2 text-[13px]">{dg.themes.map((t) => (
            <li key={t.label}><b className="text-ink">{t.label}</b> <span className="font-mono text-[11px] text-muted">· {t.n} erreur(s) dont {t.notees} en sprint noté</span>
              <ul className="mt-0.5 list-disc pl-5 text-[12px] text-muted">{t.ex.map((a, i) => <li key={i}>{MOD[a.module]?.code} · {court(a.q)} → répondu « {String(a.choix ?? "—")} »</li>)}</ul>
            </li>
          ))}</ul>
        ) : <p className="text-[13px] text-muted">Aucune erreur sur les thèmes sécurité (ATA 67, freinage, FOD, métallisation, péremption, contrôles, litiges).</p>}
        <p className="mt-2 text-[11px] text-muted">Détection par mots-clés sur l'intitulé des questions : à confirmer par le formateur, qui peut lever le drapeau officiel dans la grille.</p>
      </div>

      <div className="rounded-lg border border-line bg-panel2 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[13px] font-semibold text-ink"><Clock size={15} />Temps et historique</div>
        <div className="font-mono text-[12px] text-muted">Première activité {frDateTime(dg.premiere)} · dernière {frDateTime(dg.derniere)} · {dg.joursActifs} jour(s) actif(s) · temps total en sprint {fmtDuree(dg.dureeSprints)}</div>
        {dg.abandons > 0 && <div className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-amber"><AlertTriangle size={13} />{dg.abandons} sprint(s) noté(s) lancé(s) puis abandonné(s) avant la fin (fermeture ou rechargement de la page)</div>}
        {dg.sprints.length > 0 && (
          <table className="mt-2 w-full text-left text-[12px]"><thead className="font-mono text-[10px] uppercase text-muted"><tr><th className="py-1">Module</th><th>Date</th><th>Durée</th><th className="text-right">Score</th></tr></thead>
            <tbody>{dg.sprints.map((x, i) => (<tr key={i} className="border-t border-line/60"><td className="py-1 font-mono">{x.module}</td><td className="font-mono text-muted">{frDateTime(x.date)}</td><td className="font-mono text-muted">{fmtDuree(x.duree)}</td><td className={cx("text-right font-mono", x.statut === "VALIDE" ? "text-ok" : "text-ko")}>{pct(x.score)}</td></tr>))}</tbody>
          </table>
        )}
      </div>
    </Panel>
  );
}
