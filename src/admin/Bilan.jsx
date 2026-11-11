/* Fiche bilan individuelle & attestation (aperçu + export HTML imprimable en PDF) */
import React, { useRef } from "react";
import { Download } from "lucide-react";
import { cx, pct, frDate, frDateTime, today, MOD, V, R, N } from "../lms/db.js";
import { Eyebrow, Btn, offerFile } from "../lms/ui.jsx";
import { remediation, remediationTexte } from "./Grille.jsx";
import { diagnostic, fmtDuree, court } from "../lms/diagnostic.js";

const ATT_CSS = `
.att{background:#fff;color:#14213a;font-family:Barlow,system-ui,sans-serif;font-size:13px;line-height:1.45;max-width:860px;margin:0 auto;padding:36px 40px;border-radius:6px}
.att *{box-sizing:border-box}
.att h1,.att h2{font-family:'Barlow Condensed','Arial Narrow',sans-serif;margin:0;color:#0b1220}
.att .mono{font-family:'JetBrains Mono',ui-monospace,Menlo,monospace}
.att-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:3px solid #0b1220;padding-bottom:14px}
.att-brand{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#4a5a78}
.att-ref{text-align:right;font-size:11px;color:#4a5a78}
.att h1{font-size:28px;line-height:1.1;margin-top:4px}
.att h2{font-size:16px;text-transform:uppercase;letter-spacing:.06em;margin:22px 0 8px;border-left:4px solid #1f6fd1;padding-left:8px}
.att-id{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 18px;margin-top:16px}
.att-id div span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#5d6b85}
.att-id div b{font-size:14px}
.att table{width:100%;border-collapse:collapse;font-size:12.5px}
.att th{background:#eef2f8;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#3a4a66;padding:7px 8px;border:1px solid #c9d3e3}
.att td{padding:7px 8px;border:1px solid #c9d3e3;vertical-align:top}
.att td.n{text-align:right;font-variant-numeric:tabular-nums;font-family:'JetBrains Mono',ui-monospace,monospace;white-space:nowrap}
.att .v{display:inline-block;padding:2px 7px;border-radius:4px;font-weight:700;font-size:11px;letter-spacing:.06em;font-family:'JetBrains Mono',ui-monospace,monospace;white-space:nowrap}
.att .v-ok{background:#dff6ec;color:#0b7a4b;border:1px solid #0b7a4b}
.att .v-ko{background:#fde5e7;color:#b3202f;border:1px solid #b3202f}
.att .v-na{background:#f1f3f7;color:#5d6b85;border:1px solid #b9c3d4}
.att-dec{margin-top:22px;border:3px solid;padding:16px 18px;border-radius:4px}
.att-dec.ok{border-color:#0b7a4b;background:#f0fbf6}
.att-dec.ko{border-color:#b3202f;background:#fff5f6}
.att-dec .t{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-size:24px;font-weight:700;letter-spacing:.02em}
.att-dec.ok .t{color:#0b7a4b}.att-dec.ko .t{color:#b3202f}
.att-dec ul{margin:8px 0 0;padding-left:18px}
.att-txt{border:1px solid #c9d3e3;border-radius:4px;padding:10px 12px;min-height:44px;white-space:pre-wrap}
.att-sign{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:22px}
.att-sign div{border:1px solid #9aa8c0;border-radius:4px;padding:10px 12px;height:120px;display:flex;flex-direction:column;justify-content:space-between}
.att-sign span{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#5d6b85}
.att-foot{margin-top:18px;font-size:10px;color:#6b7891;display:flex;justify-content:space-between;gap:12px;border-top:1px solid #c9d3e3;padding-top:8px}
@media (max-width:640px){.att{padding:22px 16px}.att-id{grid-template-columns:1fr 1fr}.att-sign{grid-template-columns:1fr}.att-top{flex-direction:column}.att-ref{text-align:left}}
@media print{@page{size:A4;margin:12mm}.att{padding:0;max-width:none;border-radius:0}.att-dec,.att table,.att-sign{break-inside:avoid}}
`;
const vClass = (st) => (st === V ? "v v-ok" : st === R ? "v v-ko" : "v v-na");

export default function Bilan({ active, calc }) {
  const ref = useRef(null);
  const fiche = active.fiche;
    const ok = calc.statutGlobal === V;
  const rem = remediation(active, calc);
  const dg = diagnostic(active);
  const refDoc = `BIL-${active.matricule}-${today().replace(/-/g, "")}`;
  const download = () => {
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fiche bilan ${active.matricule} — ${active.prenom} ${active.nom}</title>`
      + `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@600;700&family=JetBrains+Mono:wght@400;700&display=swap">`
      + `<style>body{margin:0;background:#e9edf3;padding:24px 0}.pbtn{display:block;margin:0 auto 16px;padding:10px 18px;font:600 14px Barlow,system-ui,sans-serif;background:#1f6fd1;color:#fff;border:0;border-radius:6px;cursor:pointer}@media print{body{background:#fff;padding:0}.pbtn{display:none}}${ATT_CSS}</style></head><body>`
      + `<button class="pbtn" onclick="window.print()">Imprimer / Enregistrer en PDF</button>${ref.current.outerHTML}</body></html>`;
    offerFile(`fiche-bilan_${active.matricule}_${active.nom}.html`, html, "text/html");
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="no-print flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>Espace documentaire · Fiche bilan individuelle</Eyebrow>
          <h2 className="font-display text-3xl font-semibold text-ink">Attestation de fin de cursus</h2>
          <p className="max-w-2xl text-[13px] text-muted">Le fichier téléchargé s'ouvre dans votre navigateur avec un bouton « Imprimer / Enregistrer en PDF » au format A4.</p>
        </div>
        <Btn tone="primary" onClick={download}><Download size={15} />Télécharger la fiche imprimable (.html)</Btn>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-panel2 p-3 sm:p-6">
        <style>{ATT_CSS}</style>
        <div className="att" ref={ref}>
          <div className="att-top">
            <div>
              <div className="att-brand">Airbus Helicopters · Formation métier</div>
              <h1>Fiche bilan individuelle &amp; attestation</h1>
              <div style={{ marginTop: 4, color: "#3a4a66" }}>Cursus « Préparateur Méthodes Assemblage — Standard Airbus Helicopters »</div>
            </div>
            <div className="att-ref mono">Réf. {refDoc}<br />Édité le {new Date().toLocaleDateString("fr-FR")}<br />Seuil de validation : 85 %</div>
          </div>

          <div className="att-id">
            <div><span>Stagiaire</span><b>{active.prenom} {active.nom.toUpperCase()}</b></div>
            <div><span>Matricule</span><b className="mono">{active.matricule}</b></div>
            <div><span>Type de formation</span><b>{active.typeFormation}</b></div>
            <div><span>Tentatives notées</span><b className="mono">{calc.mods.reduce((a, m) => a + m.tentativesTotal, 0)}</b></div>
            <div><span>Inscription</span><b>{frDate(active.createdAt)}</b></div>
            <div><span>Moyenne modules</span><b className="mono">{pct(calc.moyenne)}</b></div>
          </div>

          <h2>1. Résultats des modules</h2>
          <table>
            <thead><tr><th>Module</th><th>Intitulé</th><th>Score</th><th>Seuil requis</th><th>Tent.</th><th>Date</th><th>Verdict</th></tr></thead>
            <tbody>
              {calc.mods.map((m) => (
                <tr key={m.id}><td className="mono"><b>{m.code}</b></td><td>{m.titre}</td><td className="n">{pct(m.score)}</td><td className="n">85 %</td><td className="n">{m.tentatives}</td><td className="n">{frDate(m.datePassage)}</td><td><span className={vClass(m.statut)}>{m.statut === N ? "NON ÉVALUÉ" : m.statut}</span></td></tr>
              ))}
            </tbody>
          </table>

          <h2>2. Grille d'évaluation formateur (20 compétences)</h2>
          <table>
            <thead><tr><th>Domaine</th><th>Intitulé</th><th>Critères évalués</th><th>Score</th><th>Verdict</th></tr></thead>
            <tbody>
              {calc.grille.domaines.map((d) => (
                <tr key={d.id}><td className="mono"><b>{d.id}</b></td><td>{d.titre}<div style={{ fontSize: 11, color: "#5d6b85" }}>{d.detail}</div></td><td className="n">{d.nbEval}/4</td><td className="n">{pct(d.score)}</td><td><span className={vClass(d.statut)}>{d.statut === N ? "NON ÉVALUÉ" : d.statut}</span></td></tr>
              ))}
              <tr><td colSpan={2}><b>Score global de grille</b></td><td className="n">{calc.grille.nbEval}/20</td><td className="n"><b>{pct(calc.grille.global)}</b></td><td><span className={vClass(calc.grille.complete ? calc.grille.statut : calc.grille.nbEval ? R : N)}>{calc.grille.complete ? calc.grille.statut : calc.grille.nbEval ? "À REVOIR" : "NON ÉVALUÉ"}</span></td></tr>
            </tbody>
          </table>

          <h2>3. Diagnostic recruteur (calcul automatique sur {dg.nbReponses} réponses)</h2>
          <table>
            <thead><tr><th>Domaine</th><th>Bonnes réponses</th><th>Taux</th><th>Lecture</th></tr></thead>
            <tbody>
              {dg.domaines.map((d) => (
                <tr key={d.id}><td><b className="mono">{d.id}</b> · {d.titre}</td><td className="n">{d.ok}/{d.n}</td><td className="n">{d.n ? pct(d.taux) : "—"}</td><td><span className={vClass(d.n ? d.statut : N)}>{!d.n ? "NON COUVERT" : d.taux >= 85 ? (d.n >= 5 ? "FORCE" : "VALIDE") : "LACUNE"}</span></td></tr>
              ))}
            </tbody>
          </table>
          <table style={{ marginTop: 8 }}>
            <tbody>
              <tr><td style={{ width: "32%" }}><b>Forces</b></td><td>{dg.forces.length ? dg.forces.map((d) => `${d.id} ${d.titre} (${pct(d.taux)})`).join(" · ") : "—"}</td></tr>
              <tr><td><b>Lacunes précises</b></td><td>{dg.lacunes.length ? dg.lacunes.map((d) => `${d.id} (${pct(d.taux)}) : ${d.erreurs.slice(-2).map((e) => court(e.q)).join(" ; ")}`).join(" · ") : "—"}</td></tr>
              <tr><td><b>Tentatives</b></td><td className="mono">{dg.nbSprints} sprint(s) noté(s), dont {dg.sprintsKO} à revoir · {dg.ateliers} atelier(s), dont {dg.ateliersOK} ≥ 85 %</td></tr>
              <tr><td><b>Temps / historique</b></td><td className="mono">du {frDateTime(dg.premiere)} au {frDateTime(dg.derniere)} · {dg.joursActifs} jour(s) actif(s) · temps en sprint {fmtDuree(dg.dureeSprints)}</td></tr>
              <tr style={dg.themes.length ? { background: "#fff5f6" } : undefined}><td><b style={dg.themes.length ? { color: "#b3202f" } : undefined}>Drapeaux rouges sécurité des vols</b></td><td>{dg.themes.length ? dg.themes.map((t) => `${t.label} : ${t.n} erreur(s), dont ${t.notees} en sprint noté (ex. ${MOD[t.ex[0].module]?.code} « ${court(t.ex[0].q)} »)`).join(" · ") : "Aucune erreur sur les thèmes ATA 67, freinage, FOD, métallisation, péremption, contrôles, litiges."}</td></tr>
            </tbody>
          </table>

          <div className={cx("att-dec", ok ? "ok" : "ko")}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#5d6b85" }}>Décision finale</div>
            <div className="t">{ok ? "FORMATION VALIDÉE (Score ≥ 85 %)" : "FORMATION À REVOIR (Score < 85 % — Modules à repasser)"}</div>
            {ok ? (
              <div style={{ marginTop: 6 }}>Les 5 modules et la grille de compétences atteignent le seuil de 85 %, sans drapeau rouge sécurité. Le stagiaire est déclaré <b>VALIDE (HABILITÉ)</b> pour la fonction de Préparateur Méthodes Assemblage.</div>
            ) : (
              <ul>
                {calc.raisons.map((r, i) => <li key={i}>{r}</li>)}
                {rem.comps.length > 0 && <li>Compétences à retravailler : {rem.comps.map((i) => i.id).join(", ")}</li>}
              </ul>
            )}
          </div>

          <h2>4. Observations du formateur</h2>
          <div className="att-txt">{fiche.commentaireFormateur || "—"}</div>
          {(!ok || fiche.pointsARevoir) && (<><h2>5. Points à revoir</h2><div className="att-txt">{fiche.pointsARevoir || remediationTexte(active, calc) || "—"}</div></>)}

          <div className="att-sign">
            <div><span>Le formateur · nom, date et signature</span><span style={{ textTransform: "none", letterSpacing: 0 }}>Date : ____ / ____ / ________</span></div>
            <div><span>Le stagiaire · « lu et pris connaissance »</span><span style={{ textTransform: "none", letterSpacing: 0 }}>{active.prenom} {active.nom.toUpperCase()} · Date : ____ / ____ / ________</span></div>
          </div>
          <div className="att-foot mono"><span>Règle : score &lt; 85 % = À REVOIR · score ≥ 85 % = VALIDE</span><span>{refDoc}</span></div>
        </div>
      </div>
    </div>
  );
}

