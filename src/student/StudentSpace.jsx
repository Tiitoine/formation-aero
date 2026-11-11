/* ============================================================
   ESPACE STAGIAIRE (mode strict)
   Le stagiaire ne voit que SON parcours : 5 modules, ses tentatives,
   l'export de ses résultats. Aucune saisie de score, aucun accès aux
   autres stagiaires ni à la grille formateur.
   ============================================================ */
import React, { useState } from "react";
import LexiqueButton from "../lib/Lexique.jsx";
import { LogOut, Play, Lock, History, Download, Copy, CheckCircle2, Cloud, CloudOff, RotateCcw, Unlock } from "lucide-react";
import { SEUIL, V, R, N, MOD, pct, frDateTime, cx, studentCode, exportStudentPayload, today } from "../lms/db.js";
import { Panel, Eyebrow, StatusBadge, ThresholdBar, Btn, Modal, offerFile } from "../lms/ui.jsx";

export default function StudentSpace({ student, calc, onLaunch, onLogout, cloud, policy }) {
  const [exportOpen, setExportOpen] = useState(false);
  const done = calc.mods.filter((m) => m.statut === V).length;
  const tentatives = [...student.historique].filter((h) => h.kind !== "debut").sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return (
    <div className="min-h-full bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="gutter mx-auto flex max-w-6xl flex-wrap items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <Eyebrow>Airbus Helicopters · Préparateur Méthodes Assemblage</Eyebrow>
            <div className="font-display text-xl font-semibold leading-tight text-ink">{student.prenom} {student.nom}</div>
            <div className="font-mono text-[11px] text-muted">{student.matricule} · {student.typeFormation}</div>
          </div>
          <span className={cx("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px]", cloud?.on ? "border-ok/40 text-ok" : "border-line text-muted")} title={cloud?.error || ""}>
            {cloud?.on ? <Cloud size={13} /> : <CloudOff size={13} />}{cloud?.on ? (cloud.error ? "Cloud : erreur" : "Synchronisé") : "Local"}
          </span>
          <Btn onClick={() => setExportOpen(true)}><Download size={15} />Exporter mes résultats</Btn>
          <LexiqueButton />
          <Btn onClick={onLogout}><LogOut size={15} />Déconnexion</Btn>
        </div>
      </header>

      <main className="gutter mx-auto flex max-w-6xl flex-col gap-8 py-8">
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow>Mon parcours</Eyebrow>
              <h1 className="font-display text-3xl font-semibold text-ink">{done}/5 modules validés</h1>
              <p className="mt-1 max-w-2xl text-[13px] text-muted">
                Chaque module se termine par un sprint noté. Sous {SEUIL} % il est À REVOIR et {policy === "autorisation" ? "une nouvelle tentative doit être autorisée par votre formateur" : "vous pouvez le repasser avec un nouveau tirage de questions"}. À partir de {SEUIL} % il est VALIDE et verrouillé.
              </p>
            </div>
            <div className="w-full max-w-xs"><ThresholdBar score={calc.moyenne} /></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {calc.mods.map((m) => {
              const Icon = m.icon;
              return (
                <Panel key={m.id} className={cx("flex flex-col gap-3 p-5", m.statut === V ? "border-ok/50" : m.statut === R ? "border-ko/50" : "")}>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-sky/40 bg-sky/10"><Icon size={18} className="text-sky" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[12px] font-semibold text-sky">{m.code}</div>
                      <h3 className="font-display text-lg font-semibold leading-tight text-ink">{m.titre}</h3>
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted">{m.resume}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <StatusBadge statut={m.statut} />
                    <span className="font-mono text-[12px] text-ink">{pct(m.score)}</span>
                    <span className="font-mono text-[11px] text-muted">· {m.tentatives} tentative{m.tentatives > 1 ? "s" : ""}</span>
                    {m.autorise && <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ok"><Unlock size={12} />nouvelle tentative autorisée</span>}
                  </div>
                  {!m.canAttempt && <p className="flex items-start gap-1.5 text-[12px] text-amber"><Lock size={13} className="mt-0.5 shrink-0" />{m.blockReason}</p>}
                  <Btn tone={m.statut === V ? "ghost" : "primary"} onClick={() => onLaunch(m.id)}>
                    {m.statut === V ? <><CheckCircle2 size={15} />Revoir le cours</> : m.statut === R ? <><RotateCcw size={15} />Reprendre le module</> : <><Play size={15} />Commencer</>}
                  </Btn>
                </Panel>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2"><History size={18} className="text-sky" /><h2 className="font-display text-2xl font-semibold text-ink">Historique de mes tentatives</h2></div>
          {tentatives.length === 0 ? (
            <Panel className="p-5 text-[13px] text-muted">Aucune tentative enregistrée pour le moment.</Panel>
          ) : (
            <Panel className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[13px]">
                <thead className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
                  <tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Module</th><th className="px-4 py-2">Exercice</th><th className="px-4 py-2 text-right">Score</th><th className="px-4 py-2">Statut</th></tr>
                </thead>
                <tbody>
                  {tentatives.slice(0, 60).map((h) => (
                    <tr key={h.id} className="border-b border-line/60 last:border-b-0">
                      <td className="px-4 py-2 font-mono text-[12px] text-muted">{frDateTime(h.date)}</td>
                      <td className="px-4 py-2 font-mono text-sky">{MOD[h.moduleId]?.code}</td>
                      <td className="px-4 py-2 text-ink">{h.label}{h.kind === "sprint" && <span className="ml-1.5 font-mono text-[10px] uppercase text-amber">noté</span>}</td>
                      <td className="px-4 py-2 text-right font-mono text-ink">{pct(h.score)}</td>
                      <td className="px-4 py-2"><StatusBadge statut={h.score >= SEUIL ? V : R} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
        </section>
      </main>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} student={student} />
    </div>
  );
}

function ExportModal({ open, onClose, student }) {
  const [copied, setCopied] = useState(false);
  const code = open ? studentCode(student) : "";
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch (e) { setCopied(false); }
  };
  const download = () => offerFile(`resultats_${student.nom}_${student.prenom}_${today()}.json`, JSON.stringify(exportStudentPayload(student), null, 2));
  return (
    <Modal open={open} onClose={onClose} kicker="Transfert vers le formateur" title="Exporter mes résultats" wide>
      <p className="text-[14px] leading-relaxed text-muted">Utile si ce PC n'est pas relié au cloud. Envoyez au formateur soit le fichier .json, soit le code ci-dessous (à coller dans son tableau de bord, rubrique « Importer »).</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn tone="primary" onClick={download}><Download size={15} />Télécharger le fichier .json</Btn>
        <Btn onClick={copy}>{copied ? <CheckCircle2 size={15} className="text-ok" /> : <Copy size={15} />}{copied ? "Code copié" : "Copier le code de synchronisation"}</Btn>
      </div>
      <textarea readOnly value={code} rows={5} aria-label="Code de synchronisation" className="mt-4 w-full rounded-lg border border-line bg-panel2 p-3 font-mono text-[11px] text-muted" onFocus={(e) => e.target.select()} />
    </Modal>
  );
}
