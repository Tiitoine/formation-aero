/* ============================================================
   TABLEAU DE BORD ADMINISTRATEUR (formateur)
   Promotion filtrable · détail des réponses · grille 20 compétences ·
   bilan PDF/HTML · autoriser / réinitialiser un module · suppression ·
   import / export · Sync Cloud Multi-PC · paramètres
   ============================================================ */
import React, { useMemo, useState } from "react";
import {
  Users, Upload, Cloud, Settings as SettingsIcon, LogOut, Search, ChevronLeft, Eye, Unlock, RotateCcw, Trash2,
  ChevronDown, ChevronRight, CheckCircle2, XCircle, Flag, History, LayoutGrid, FileText, RefreshCw, Loader2, CloudOff, AlertTriangle,
} from "lucide-react";
import {
  SEUIL, V, R, N, MODULES, MOD, TYPES_FORMATION, pct, frDateTime, cx, calcStagiaire, addDecision, makeDecision, nowISO,
} from "../lms/db.js";
import { Panel, Eyebrow, StatusBadge, ThresholdBar, Btn, Modal, Kpi, inputCls } from "../lms/ui.jsx";
import Grille from "./Grille.jsx";
import Bilan from "./Bilan.jsx";
import Diagnostic from "./Diagnostic.jsx";
import { diagnostic } from "../lms/diagnostic.js";
import ImportExport from "./ImportExport.jsx";
import CloudSync from "./CloudSync.jsx";
import Settings from "./Settings.jsx";

const TABS = [
  { id: "stagiaires", label: "Stagiaires", icon: Users },
  { id: "import", label: "Import / Export", icon: Upload },
  { id: "cloud", label: "Sync Cloud Multi-PC", icon: Cloud },
  { id: "parametres", label: "Paramètres", icon: SettingsIcon },
];
const lastActivity = (s) => [s.lastLogin, ...s.historique.map((h) => h.date)].filter(Boolean).sort().pop() || "";

export default function AdminDashboard({ db, setDB, adminLogin, onLogout, onPreview, cloud }) {
  const [tab, setTab] = useState("stagiaires");
  const [selId, setSelId] = useState(null);
  const [fType, setFType] = useState("Tous");
  const [fStatut, setFStatut] = useState("Tous");
  const [q, setQ] = useState("");
  const policy = db.settings.retryPolicy;

  const rows = useMemo(() => db.stagiaires.map((s) => ({ s, c: calcStagiaire(s, policy), act: lastActivity(s), al: diagnostic(s).alertes.filter((a) => a.note).length })).sort((a, b) => b.act.localeCompare(a.act)), [db.stagiaires, policy]);
  const filtered = rows.filter(({ s, c }) =>
    (fType === "Tous" || s.typeFormation === fType) &&
    (fStatut === "Tous" || c.statutModules === fStatut) &&
    (!q.trim() || `${s.nom} ${s.prenom} ${s.matricule}`.toLowerCase().includes(q.trim().toLowerCase())));
  const sel = selId ? rows.find((r) => r.s.id === selId) : null;

  const kpi = {
    total: rows.length,
    valides: rows.filter((r) => r.c.statutModules === V).length,
    revoir: rows.filter((r) => r.c.statutModules === R).length,
    nonEval: rows.filter((r) => r.c.statutModules === N).length,
    drapeaux: rows.filter((r) => r.c.drapeau).length,
  };

  return (
    <div className="min-h-full bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="gutter mx-auto flex max-w-7xl flex-col gap-3 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <Eyebrow>Airbus Helicopters · Espace formateur</Eyebrow>
              <div className="font-display text-xl font-semibold leading-tight text-ink">Tableau de bord administrateur</div>
            </div>
            <CloudBadge cloud={cloud} />
            <span className="font-mono text-[12px] text-muted">Connecté : <span className="text-ink">{adminLogin}</span></span>
            <Btn onClick={onLogout}><LogOut size={15} />Déconnexion</Btn>
          </div>
          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1" aria-label="Rubriques admin">
            {TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => { setTab(t.id); setSelId(null); }}
                className={cx("flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", tab === t.id ? "border-sky bg-sky/15 text-ink" : "border-transparent text-muted hover:bg-panel hover:text-ink")}>
                <t.icon size={15} />{t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="gutter mx-auto flex max-w-7xl flex-col gap-6 py-6">
        {tab === "stagiaires" && !sel && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Kpi label="Stagiaires" value={kpi.total} />
              <Kpi label="5 modules VALIDE" value={kpi.valides} tone="ok" sub="≥ 85 % partout" />
              <Kpi label="À REVOIR" value={kpi.revoir} tone="ko" sub="au moins un module < 85 %" />
              <Kpi label="Non évalués" value={kpi.nonEval} />
              <Kpi label="Drapeaux sécurité" value={kpi.drapeaux} tone={kpi.drapeaux ? "ko" : undefined} />
            </div>

            <Panel className="flex flex-wrap items-end gap-3 p-4">
              <label className="flex min-w-[200px] flex-1 flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Recherche</span>
                <span className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, prénom, matricule" className={inputCls + " pl-9"} /></span>
              </label>
              <FilterGroup label="Type de formation" value={fType} onChange={setFType} options={["Tous", ...TYPES_FORMATION]} />
              <FilterGroup label="Statut" value={fStatut} onChange={setFStatut} options={["Tous", V, R, N]} />
            </Panel>

            {rows.length === 0 ? (
              <Panel className="flex flex-col items-start gap-2 p-6 text-[14px] text-muted">
                <span className="font-display text-xl font-semibold text-ink">Base vierge</span>
                Aucun stagiaire pour l'instant. Les profils apparaissent dès la première connexion d'un stagiaire sur ce PC, via la Sync Cloud ou par import de fichiers de résultats.
              </Panel>
            ) : (
              <Panel className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-[13px]">
                  <thead className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-3">Stagiaire</th><th className="px-3 py-3">Type</th>
                      {MODULES.map((m) => <th key={m.id} className="px-2 py-3 text-center">{m.code}</th>)}
                      <th className="px-3 py-3 text-right">Moyenne</th><th className="px-3 py-3">Statut</th><th className="px-3 py-3">Activité</th><th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(({ s, c, act, al }) => (
                      <tr key={s.id} className="cursor-pointer border-b border-line/60 last:border-b-0 hover:bg-panel2" onClick={() => setSelId(s.id)}>
                        <td className="px-4 py-3"><div className="font-semibold text-ink">{s.nom} {s.prenom}</div><div className="font-mono text-[11px] text-muted">{s.matricule}</div></td>
                        <td className="px-3 py-3 text-muted">{s.typeFormation}</td>
                        {c.mods.map((m) => (
                          <td key={m.id} className="px-2 py-3 text-center">
                            <span className={cx("inline-block min-w-[52px] rounded border px-1.5 py-0.5 font-mono text-[11px]", m.statut === V ? "border-ok/50 bg-ok/10 text-ok" : m.statut === R ? "border-ko/50 bg-ko/10 text-ko" : "border-line text-muted")}>{m.score === null ? "—" : Math.floor(m.score) + "%"}</span>
                            {m.tentatives > 1 && <div className="font-mono text-[10px] text-muted">×{m.tentatives}</div>}
                          </td>
                        ))}
                        <td className="px-3 py-3 text-right font-mono text-ink">{pct(c.moyenne)}</td>
                        <td className="px-3 py-3"><div className="flex items-center gap-1"><StatusBadge statut={c.statutModules} size="sm" />{c.drapeau && <Flag size={13} className="text-ko" aria-label="Drapeau sécurité" />}{al > 0 && <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-ko" title="Erreurs sur thèmes sécurité en sprint noté"><AlertTriangle size={12} />{al}</span>}</div></td>
                        <td className="px-3 py-3 font-mono text-[11px] text-muted">{frDateTime(act)}</td>
                        <td className="px-3 py-3 text-right"><ChevronRight size={16} className="text-muted" /></td>
                      </tr>
                    ))}
                    {!filtered.length && <tr><td colSpan={10} className="px-4 py-6 text-center text-muted">Aucun stagiaire ne correspond aux filtres.</td></tr>}
                  </tbody>
                </table>
              </Panel>
            )}
          </>
        )}

        {tab === "stagiaires" && sel && (
          <StudentDetail key={sel.s.id} s={sel.s} c={sel.c} setDB={setDB} adminLogin={adminLogin} onBack={() => setSelId(null)} onPreview={onPreview} onDeleted={() => setSelId(null)} cloud={cloud} />
        )}
        {tab === "import" && <ImportExport db={db} setDB={setDB} filtered={filtered.map((r) => r.s)} />}
        {tab === "cloud" && <CloudSync cfg={cloud.cfg} setCfg={cloud.setCfg} onSyncNow={cloud.syncNow} syncing={cloud.syncing} />}
        {tab === "parametres" && <Settings db={db} setDB={setDB} />}
      </main>
    </div>
  );
}

function CloudBadge({ cloud }) {
  if (!cloud.cfg.enabled) return <span className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-[11px] text-muted"><CloudOff size={13} />Local uniquement</span>;
  return (
    <button type="button" onClick={cloud.syncNow} disabled={cloud.syncing} title={cloud.error || `Dernière synchro : ${frDateTime(cloud.cfg.lastSync)}`}
      className={cx("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px]", cloud.error ? "border-ko/50 text-ko" : "border-ok/50 text-ok")}>
      {cloud.syncing ? <Loader2 size={13} className="animate-spin" /> : cloud.error ? <AlertTriangle size={13} /> : <RefreshCw size={13} />}
      {cloud.error ? "Cloud : erreur" : "Cloud synchronisé"}
    </button>
  );
}

function FilterGroup({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</span>
      <div className="flex flex-wrap overflow-hidden rounded-lg border border-line" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)} aria-pressed={value === o}
            className={cx("border-r border-line px-3 py-2 text-[12px] font-semibold last:border-r-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", value === o ? "bg-sky text-bg" : "bg-panel2 text-muted hover:text-ink")}>
            {o === V ? "VALIDE ≥ 85 %" : o === R ? "À REVOIR < 85 %" : o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Fiche détaillée d'un stagiaire ---------------- */
function StudentDetail({ s, c, setDB, adminLogin, onBack, onPreview, onDeleted, cloud }) {
  const [sub, setSub] = useState("parcours");
  const [confirm, setConfirm] = useState(null); // { type: "reset"|"delete", moduleId }
  const [delText, setDelText] = useState("");

  const decide = (type, moduleId) => setDB((d) => addDecision(d, s.id, makeDecision(type, moduleId, adminLogin)));
  const updateFiche = (fn) => setDB((d) => ({ ...d, updatedAt: nowISO(), stagiaires: d.stagiaires.map((x) => (x.id === s.id ? { ...x, fiche: { ...fn(x.fiche), updatedAt: nowISO() } } : x)) }));
  const remove = () => {
    setDB((d) => ({ ...d, updatedAt: nowISO(), stagiaires: d.stagiaires.filter((x) => x.id !== s.id), supprimes: { ...d.supprimes, [s.cle]: nowISO() } }));
    cloud.deleteStudent?.(s);
    onDeleted();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onBack} className="mb-2 inline-flex items-center gap-1 text-[13px] font-semibold text-muted hover:text-ink"><ChevronLeft size={15} />Tous les stagiaires</button>
          <h2 className="font-display text-3xl font-semibold text-ink">{s.prenom} {s.nom}</h2>
          <div className="font-mono text-[12px] text-muted">{s.matricule} · {s.typeFormation} · inscrit le {frDateTime(s.createdAt)} · dernière connexion {frDateTime(s.lastLogin)}</div>
        </div>
        <div className="flex items-center gap-2"><StatusBadge statut={c.statutModules} size="lg" /><Btn tone="dangerGhost" onClick={() => { setDelText(""); setConfirm({ type: "delete" }); }}><Trash2 size={15} />Supprimer l'élève</Btn></div>
      </div>

      <nav className="flex flex-wrap gap-1" aria-label="Vues de la fiche">
        {[["parcours", "Parcours & réponses", History], ["grille", "Grille 20 compétences", LayoutGrid], ["bilan", "Bilan PDF / HTML", FileText]].map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setSub(id)} className={cx("flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold", sub === id ? "border-sky bg-sky/15 text-ink" : "border-line bg-panel2 text-muted hover:text-ink")}><Icon size={15} />{label}</button>
        ))}
      </nav>

      {sub === "parcours" && (
        <div className="flex flex-col gap-4">
          <Diagnostic dg={diagnostic(s)} />
          {c.mods.map((m) => (
            <ModuleCard key={m.id} m={m} s={s} onAuthorize={() => decide("autoriser", m.id)} onReset={() => setConfirm({ type: "reset", moduleId: m.id })} onPreview={() => onPreview(m.id)} />
          ))}
        </div>
      )}
      {sub === "grille" && <Grille active={s} calc={c} updateFiche={updateFiche} onLaunchModule={onPreview} />}
      {sub === "bilan" && <Bilan active={s} calc={c} />}

      <Modal open={confirm?.type === "reset"} onClose={() => setConfirm(null)} kicker="Réinitialisation" title={`Réinitialiser ${MOD[confirm?.moduleId]?.code || ""} pour ${s.prenom} ${s.nom} ?`}>
        <p className="text-[14px] leading-relaxed text-muted">Le statut du module repasse à « Non évalué » et le sprint noté est de nouveau ouvert. Les tentatives passées restent visibles dans l'historique (traçabilité), elles ne comptent simplement plus pour le statut.</p>
        <div className="mt-5 flex justify-end gap-2"><Btn onClick={() => setConfirm(null)}>Annuler</Btn><Btn tone="danger" onClick={() => { decide("reset", confirm.moduleId); setConfirm(null); }}><RotateCcw size={15} />Réinitialiser le module</Btn></div>
      </Modal>
      <Modal open={confirm?.type === "delete"} onClose={() => setConfirm(null)} kicker="Suppression définitive" title={`Supprimer ${s.prenom} ${s.nom} ?`}>
        <p className="text-[14px] leading-relaxed text-muted">La fiche, l'historique et la grille sont supprimés de ce PC{cloud.cfg.enabled ? " et du cloud" : ""}. Pensez à exporter la base avant si vous devez conserver une trace. Tapez <strong className="font-mono text-ink">{s.nom}</strong> pour confirmer.</p>
        <input value={delText} onChange={(e) => setDelText(e.target.value)} className={inputCls + " mt-3"} aria-label="Confirmation du nom" />
        <div className="mt-5 flex justify-end gap-2"><Btn onClick={() => setConfirm(null)}>Annuler</Btn><Btn tone="danger" disabled={delText.trim().toUpperCase() !== s.nom} onClick={remove}><Trash2 size={15} />Supprimer définitivement</Btn></div>
      </Modal>
    </div>
  );
}

function ModuleCard({ m, s, onAuthorize, onReset, onPreview }) {
  const [open, setOpen] = useState(false);
  const entries = s.historique.filter((h) => h.moduleId === m.id).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const decisions = s.decisions.filter((d) => d.moduleId === m.id);
  const timeline = [...entries.map((e) => ({ t: "h", d: e.date, e })), ...decisions.map((d) => ({ t: "d", d: d.date, e: d }))].sort((a, b) => String(b.d).localeCompare(String(a.d)));
  return (
    <Panel className={cx("overflow-hidden", m.statut === V ? "border-ok/40" : m.statut === R ? "border-ko/40" : "")}>
      <div className="flex flex-wrap items-center gap-4 p-4">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-w-[260px] flex-1 items-start gap-3 text-left" aria-expanded={open}>
          {open ? <ChevronDown size={18} className="mt-1 text-muted" /> : <ChevronRight size={18} className="mt-1 text-muted" />}
          <div className="min-w-0">
            <div className="font-mono text-[12px] font-semibold text-sky">{m.code}</div>
            <div className="font-display text-lg font-semibold leading-tight text-ink">{m.titre}</div>
            <div className="mt-1 font-mono text-[11px] text-muted">{m.tentatives} tentative(s) notée(s) en cours · {m.tentativesTotal} au total · {m.ateliers.length} atelier(s) · meilleur {pct(m.best)}</div>
          </div>
        </button>
        <div className="w-40"><ThresholdBar score={m.score} height="h-2" showLabel={false} /></div>
        <div className="flex items-center gap-2"><span className="font-mono text-[14px] text-ink">{pct(m.score)}</span><StatusBadge statut={m.statut} /></div>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={onAuthorize} disabled={m.statut !== R || m.autorise} title={m.statut !== R ? "Possible uniquement après un À REVOIR" : ""}><Unlock size={15} />{m.autorise ? "Tentative autorisée" : "Autoriser une nouvelle tentative"}</Btn>
          <Btn tone="dangerGhost" onClick={onReset} disabled={m.statut === N}><RotateCcw size={15} />Réinitialiser</Btn>
          <Btn onClick={onPreview} title="Ouvrir le module en aperçu formateur (rien n'est enregistré)"><Eye size={15} />Aperçu</Btn>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-panel2/60 px-4 py-3">
          {!timeline.length && <p className="py-2 text-[13px] text-muted">Aucune activité enregistrée sur ce module.</p>}
          <ol className="flex flex-col gap-2">
            {timeline.map((it) => it.t === "d" ? (
              <li key={it.e.id} className="flex items-center gap-2 rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-[12px] text-ink">
                {it.e.type === "reset" ? <RotateCcw size={14} className="text-amber" /> : <Unlock size={14} className="text-amber" />}
                <span className="font-mono text-muted">{frDateTime(it.e.date)}</span>
                <span>{it.e.type === "reset" ? "Module réinitialisé" : "Nouvelle tentative autorisée"} par {it.e.par}</span>
              </li>
            ) : <AttemptRow key={it.e.id} h={it.e} />)}
          </ol>
        </div>
      )}
    </Panel>
  );
}

function AttemptRow({ h }) {
  const [open, setOpen] = useState(false);
  if (h.kind === "debut") return (
    <li className="flex items-center gap-2 px-3 py-1 text-[12px] text-muted"><span className="font-mono">{frDateTime(h.date)}</span><span>{h.label}</span></li>
  );
  const answers = Array.isArray(h.answers) ? h.answers : [];
  const st = h.score >= SEUIL ? V : R;
  return (
    <li className={cx("rounded-lg border bg-panel", h.kind === "sprint" ? (st === V ? "border-ok/40" : "border-ko/40") : "border-line")}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full flex-wrap items-center gap-2 px-3 py-2 text-left text-[13px]" aria-expanded={open} disabled={!answers.length}>
        {answers.length ? (open ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />) : <span className="w-[14px]" />}
        <span className="font-mono text-[12px] text-muted">{frDateTime(h.date)}</span>
        <span className="min-w-0 flex-1 text-ink">{h.label}{h.kind === "sprint" && <span className="ml-1.5 font-mono text-[10px] uppercase text-amber">noté</span>}</span>
        <span className="font-mono text-[12px] text-muted">{h.good ?? "?"}/{h.total ?? "?"}</span>
        <span className="font-mono text-ink">{pct(h.score)}</span>
        <StatusBadge statut={st} size="sm" />
      </button>
      {open && (
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[640px] text-left text-[12px]">
            <thead className="font-mono text-[10px] uppercase tracking-wider text-muted"><tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Question / élément</th><th className="px-3 py-2">Réponse du stagiaire</th><th className="px-3 py-2">Bonne réponse</th><th className="px-3 py-2" /></tr></thead>
            <tbody>
              {answers.map((a, i) => (
                <tr key={i} className={cx("border-t border-line/60", !a.ok && "bg-ko/5")}>
                  <td className="px-3 py-2 font-mono text-muted">{i + 1}</td>
                  <td className="px-3 py-2 text-ink">{a.q}{a.tag && <span className="ml-1 font-mono text-[10px] text-muted">[{a.tag}]</span>}{a.detail && <div className="text-[11px] text-muted">{a.detail}</div>}</td>
                  <td className={cx("px-3 py-2", a.ok ? "text-ok" : "text-ko")}>{String(a.choix ?? "—")}</td>
                  <td className="px-3 py-2 text-muted">{String(a.bonne ?? "—")}</td>
                  <td className="px-3 py-2">{a.ok ? <CheckCircle2 size={14} className="text-ok" /> : <XCircle size={14} className="text-ko" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </li>
  );
}
