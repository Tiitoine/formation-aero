import React, { useState, useEffect, useRef, createContext, useContext, useMemo } from "react";
import BackToPortal from "../lms/BackToPortal.jsx";
import { scopedKey } from "../lms/session.js";
import { shuffle, permutation, OptionButton, optState, LETTERS, useModuleSession, trunc1 } from "../lib/pedago.jsx";
import {
  Wrench, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, RotateCcw, ChevronRight, Gauge, AlertTriangle, Info,
  ClipboardList, FileText, Ruler, Award, ArrowRight, Lock, Target, Stamp, Boxes, FileWarning, Calculator, Crosshair,
  Hammer, Layers, Zap, BookOpen, X, Siren, Snowflake, Drill, ListChecks, Undo2, PackageCheck, Flag, Play, BadgeCheck,
  MapPin, UserCheck, Eye, FolderOpen, Cable, Fingerprint, Navigation,
} from "lucide-react";

/* ============================================================
   MODULE 4B · Mission Industrialisation FAL
   Le Simulateur Métier Préparateur Assemblage Airbus Helicopters
   Étude de cas de A à Z : H160 MSN 1042 · DWG-H160-67-4022 Ind. B
   ============================================================ */

/* ============================================================
   UTILITAIRES
   ============================================================ */
const STORAGE_KEY = "prep-methodes-ah-m4b-v1";
const INITIAL = { stage: "brief", done: {}, errors: {}, name: "", cardShown: false };
const loadState = () => {
  try {
    const raw = window.localStorage.getItem(scopedKey(STORAGE_KEY));
    return raw ? { ...INITIAL, ...JSON.parse(raw) } : INITIAL;
  } catch (e) {
    return INITIAL;
  }
};
const saveState = (s) => {
  try {
    window.localStorage.setItem(scopedKey(STORAGE_KEY), JSON.stringify(s));
  } catch (e) {
    /* stockage indisponible : la progression reste en mémoire */
  }
};
const cx = (...c) => c.filter(Boolean).join(" ");
const mm = (n, d = 2) => n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
const parseNum = (s) => parseFloat(String(s).replace(/\s/g, "").replace(",", "."));

const C = { bg: "#0b1220", panel: "#111a2e", panel2: "#0f1729", line: "#22304d", ink: "#e6edf7", muted: "#8fa0bd", sky: "#3b9eff", amber: "#ffb020", ok: "#3ddc97", ko: "#ff5d6c" };

/* Les 4 axes du bilan de compétences */
const AXES = {
  a1: { short: "Hélico, ATA & normes", long: "Maîtrise Hélicoptère, ATA & Normes BNAE/ECS", icon: BookOpen },
  a2: { short: "Procédés & freinage", long: "Procédés d'Assemblage, PR, Freinage & Métallisation", icon: Wrench },
  a3: { short: "Plan, ISO & calage", long: "Lecture de Plan, Ajustements ISO & Calcul de Calage", icon: Ruler },
  a4: { short: "Part-21G, SAP & QN", long: "Rigueur Réglementaire Part-21G, Gamme SAP & Gestion QN", icon: Stamp },
};

/* Étapes de chaque mission : la mission est accomplie quand toutes sont validées */
const MISSIONS = [
  { id: "m1", n: "1", short: "Dossier BE & M-BOM", title: "Analyse du dossier BE, zonage & construction de la M-BOM", icon: FolderOpen, steps: ["m1.loc", "m1.ata", "m1.crit", "m1.bom"] },
  { id: "m2", n: "2", short: "Pré-assemblage", title: "Gamme de pré-assemblage & procédés spéciaux", icon: Drill, steps: ["m2.fit", "m2.bague", "m2.seq", "m2.ed", "m2.edchk"] },
  { id: "m3", n: "3", short: "Gamme SAP/MES", title: "Rédaction & validation de la gamme SAP/MES", icon: ListChecks, steps: ["m3.couple", "m3.cren", "m3.metal", "m3.mes", "m3.qc"] },
  { id: "m4", n: "4", short: "Alerte FAL", title: "Alerte sur la FAL : gestion de crise & non-conformité", icon: Siren, steps: ["m4.A", "m4.B1", "m4.B2", "m4.B3", "m4.B4"] },
];
const missionDone = (m, done) => m.steps.every((s) => done[s]);

/* ============================================================
   CONTEXTE DU SIMULATEUR
   ============================================================ */
const SimCtx = createContext(null);
const useSim = () => useContext(SimCtx);

/* ============================================================
   BRIQUES D'INTERFACE (reprises des Modules 1 à 4A)
   ============================================================ */
function Panel({ children, className = "" }) {
  return <div className={cx("rounded-xl border border-line bg-panel", className)}>{children}</div>;
}

function Eyebrow({ children, tone = "blue" }) {
  const tones = { blue: "text-sky", amber: "text-amber", green: "text-ok", red: "text-ko" };
  return <div className={cx("font-mono text-[11px] uppercase tracking-[0.14em]", tones[tone])}>{children}</div>;
}

function SectionHead({ icon: Icon, kicker, title, children, tone = "blue" }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className={tone === "red" ? "text-ko" : "text-sky"} />}
        <Eyebrow tone={tone}>{kicker}</Eyebrow>
      </div>
      <h2 className="font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl" style={{ textWrap: "balance" }}>{title}</h2>
      {children && <p className="max-w-3xl text-[15px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

function ImpactBox({ title, children }) {
  return (
    <div className="rounded-xl border border-amber/40 bg-amber/10 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Wrench size={16} className="text-amber" />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber">Impact préparateur assemblage</span>
      </div>
      <div className="font-display text-lg font-semibold text-ink">{title}</div>
      <div className="mt-1 text-[14px] leading-relaxed text-ink/85">{children}</div>
    </div>
  );
}

function DangerBox({ title, children }) {
  return (
    <div className="rounded-xl border border-ko/45 bg-ko/10 p-4">
      <div className="mb-2 flex items-center gap-2">
        <ShieldAlert size={16} className="text-ko" />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ko">Règle de sécurité vol</span>
      </div>
      <div className="font-display text-lg font-semibold text-ink">{title}</div>
      <div className="mt-1 text-[14px] leading-relaxed text-ink/85">{children}</div>
    </div>
  );
}

function PrimaryButton({ onClick, children, disabled, tone = "blue" }) {
  const t = tone === "green" ? "bg-ok text-bg hover:bg-ok/90" : tone === "amber" ? "bg-amber text-bg hover:bg-amber/90" : tone === "red" ? "bg-ko text-bg hover:bg-ko/90" : "bg-sky text-bg hover:bg-sky/90";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink",
        disabled ? "cursor-not-allowed bg-line text-muted" : t
      )}
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3 py-2 text-[13px] font-semibold text-ink/85 transition hover:border-sky/60 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sky">
      {children}
    </button>
  );
}

function NoteBox({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-line bg-panel2 px-3 py-2 text-[12px] leading-relaxed text-muted">
      <Info size={14} className="mt-0.5 shrink-0 text-sky" />
      <span>{children}</span>
    </div>
  );
}

function Feedback({ ok, children, label }) {
  return (
    <div className={cx("rounded-lg border px-3 py-2 text-[13px] leading-relaxed text-ink", ok ? "border-ok/40 bg-ok/10" : "border-ko/40 bg-ko/10")}>
      {ok ? <strong className="text-ok">{label || "Exact."} </strong> : <strong className="text-ko">{label || "Non."} </strong>}
      {children}
    </div>
  );
}

function Stat({ label, value, tone = "text-ink", sub }) {
  return (
    <div className="rounded-lg border border-line bg-bg px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className={cx("font-mono text-lg font-semibold tabular-nums", tone)}>{value}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

function Stepper({ value, min, max, onChange, label, suffix, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={disabled} onClick={() => onChange(Math.max(min, value - 1))} className="h-10 w-10 rounded-lg border border-line bg-panel2 font-mono text-lg text-ink hover:border-sky/60 disabled:opacity-40" aria-label="Moins">−</button>
        <span className="min-w-[56px] text-center font-mono text-2xl font-semibold text-ink tabular-nums">{value}</span>
        <button type="button" disabled={disabled} onClick={() => onChange(Math.min(max, value + 1))} className="h-10 w-10 rounded-lg border border-line bg-panel2 font-mono text-lg text-ink hover:border-sky/60 disabled:opacity-40" aria-label="Plus">+</button>
        {suffix && <span className="text-[13px] text-muted">{suffix}</span>}
      </div>
    </div>
  );
}

function AxisTag({ axis }) {
  const A = AXES[axis];
  const Icon = A.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-line bg-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
      <Icon size={11} /> {A.short}
    </span>
  );
}

/* Carte d'étape : numéro, titre, axe évalué, verrouillage séquentiel */
function StepCard({ n, title, axis, id, locked, children }) {
  const { done } = useSim();
  const ok = done[id] === true;
  const ko = !!done[id] && done[id] !== true; /* étape close sur une erreur verrouillée */
  return (
    <Panel className={cx("p-4 sm:p-5", ok && "border-ok/40", ko && "border-ko/50")}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={cx("flex h-7 min-w-[38px] items-center justify-center rounded-md border px-1.5 font-mono text-[12px] font-semibold", ok ? "border-ok/50 bg-ok/10 text-ok" : locked ? "border-line bg-bg text-muted" : "border-sky/40 bg-sky/10 text-sky")}>{n}</span>
        <h3 className="min-w-0 flex-1 font-display text-xl font-semibold leading-tight text-ink">{title}</h3>
        <AxisTag axis={axis} />
        {ok && <CheckCircle2 size={18} className="text-ok" />}
        {ko && <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ko"><XCircle size={16} />Erreur verrouillée</span>}
      </div>
      {locked ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-line px-3 py-3 text-[13px] text-muted">
          <Lock size={14} /> Étape verrouillée : répondez à l'étape précédente pour la débloquer.
        </div>
      ) : (
        children
      )}
    </Panel>
  );
}

/* ============================================================
   MÉCANIQUES DE QUESTIONS GÉNÉRIQUES
   ============================================================ */

/* Choix unique verrouillé au 1er clic : une mauvaise réponse coûte des points, reste affichée en rouge
   et la bonne réponse est révélée ; l'étape est close et la mission continue. */
function SingleChoice({ id, axis, label, prompt, options, columns = 1 }) {
  const { done, solve, penalize } = useSim();
  const answer = options.findIndex((o) => o.ok);
  const prev = done[id];
  const [picked, setPicked] = useState(prev === true ? answer : prev && typeof prev.k === "number" ? prev.k : null);
  const [perm] = useState(() => permutation(options.length));
  const pick = (k) => {
    if (picked !== null || prev) return;
    setPicked(k);
    const o = options[k];
    if (o.ok) solve(id);
    else { penalize(`${id}:${k}`, axis, o.pts ?? (o.grave ? 12 : 5), label, o.t, o.why, !!o.grave); solve(id, false, k); }
  };
  const cur = picked !== null ? options[picked] : null;
  return (
    <div className="flex flex-col gap-3">
      {prompt && <p className="text-[14px] leading-relaxed text-ink/90">{prompt}</p>}
      <div className={cx("grid gap-2", columns === 2 && "sm:grid-cols-2")}>
        {perm.map((k, i) => (
          <OptionButton key={k} letter={LETTERS[i]} state={optState(k, picked === null ? (prev ? -1 : undefined) : picked, answer)} onClick={() => pick(k)}>{options[k].t}</OptionButton>
        ))}
      </div>
      {cur && <Feedback ok={!!cur.ok} label={cur.ok ? "Exact." : cur.grave ? "Erreur grave (verrouillée)." : "Non (verrouillé)."}>{cur.why}{!cur.ok && <> Bonne réponse : {options[answer].t}.</>}</Feedback>}
    </div>
  );
}

/* Saisie numérique avec diagnostic de l'erreur la plus probable */
function NumericStep({ id, axis, label, prompt, answer, tol = 0.01, unit, digits = 3, diagnose, explain, pts = 5, children }) {
  const { done, solve, penalize } = useSim();
  const isDone = !!done[id];
  const [val, setVal] = useState(done[id] === true ? mm(answer, digits) : done[id]?.v ?? "");
  const [res, setRes] = useState(done[id] === true ? "ok" : isDone ? "ko" : null);
  const [msg, setMsg] = useState(done[id]?.msg || "");
  const check = () => {
    const v = parseNum(val);
    if (!isFinite(v)) { setRes("nan"); return; } /* saisie illisible : pas une réponse, on redemande */
    if (Math.abs(v - answer) <= tol) { setRes("ok"); solve(id); return; }
    const why = (diagnose && diagnose(v)) || "Reprenez le calcul pas à pas avec les données du dossier.";
    setRes("ko");
    setMsg(why);
    penalize(`${id}:${Math.round(v * 1000)}`, axis, pts, label, `Valeur saisie : ${mm(v, digits)} ${unit}`, why);
    solve(id, false, { v: val, msg: why });
  };
  return (
    <div className="flex flex-col gap-3">
      {prompt && <div className="text-[14px] leading-relaxed text-ink/90">{prompt}</div>}
      {children}
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[12px] text-muted">Votre résultat</span>
          <span className="flex items-center gap-2">
            <input type="text" inputMode="decimal" value={val} disabled={isDone}
              onChange={(e) => { setVal(e.target.value); if (res !== "ok") setRes(null); }}
              onKeyDown={(e) => e.key === "Enter" && !isDone && check()}
              placeholder="0,000"
              className="h-11 w-36 rounded-lg border border-line bg-bg px-3 font-mono text-lg text-ink tabular-nums outline-none focus:border-sky" />
            <span className="font-mono text-[14px] text-muted">{unit}</span>
          </span>
        </label>
        {!isDone && <PrimaryButton onClick={check} disabled={!val.trim()}><Calculator size={16} /> Valider</PrimaryButton>}
      </div>
      {res === "nan" && <Feedback ok={false}>Saisissez un nombre (virgule ou point acceptés).</Feedback>}
      {res === "ko" && <Feedback ok={false} label="Faux (verrouillé).">{msg} Valeur attendue : {mm(answer, digits)} {unit}. {explain}</Feedback>}
      {res === "ok" && <Feedback ok>{explain}</Feedback>}
    </div>
  );
}

/* Sélection multiple validée en bloc (catalogue ERP, chapitres ATA…) */
function MultiSelect({ id, axis, label, items, prompt, columns = 2, render }) {
  const { done, solve, penalize } = useSim();
  const isDone = !!done[id];
  const [order] = useState(() => shuffle(items.map((_, i) => i)));
  const [sel, setSel] = useState(() => (done[id] === true ? Object.fromEntries(items.map((it, i) => [i, !!it.ok])) : done[id]?.sel || {}));
  const [checked, setChecked] = useState(isDone);
  const toggle = (i) => {
    if (isDone || checked) return;
    setSel((s) => ({ ...s, [i]: !s[i] }));
  };
  const missing = items.map((it, i) => (it.ok && !sel[i] ? i : -1)).filter((i) => i >= 0);
  const traps = items.map((it, i) => (!it.ok && sel[i] ? i : -1)).filter((i) => i >= 0);
  /* Une seule validation : la sélection est verrouillée, oublis et pièges sont révélés et pénalisés */
  const validate = () => {
    if (checked) return;
    setChecked(true);
    missing.forEach((i) => penalize(`${id}:miss:${i}`, axis, items[i].pts ?? 4, label, `Oubli : ${items[i].t}`, items[i].why));
    traps.forEach((i) => penalize(`${id}:trap:${i}`, axis, items[i].pts ?? 5, label, `Sélection à tort : ${items[i].t}`, items[i].why, !!items[i].grave));
    if (missing.length === 0 && traps.length === 0) solve(id);
    else solve(id, false, { sel });
  };
  const reveal = checked;
  return (
    <div className="flex flex-col gap-3">
      {prompt && <p className="text-[14px] leading-relaxed text-ink/90">{prompt}</p>}
      <div className={cx("grid gap-2", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-2 lg:grid-cols-3")}>
        {order.map((i) => {
          const it = items[i];
          const on = !!sel[i];
          const isTrap = checked && on && !it.ok;
          const isGood = checked && on && it.ok;
          const isMissing = checked && reveal && !on && it.ok;
          return (
            <button key={i} type="button" onClick={() => toggle(i)} aria-pressed={on}
              className={cx("flex items-start gap-3 rounded-lg border p-3 text-left text-[13px] leading-snug transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
                isTrap ? "border-ko bg-ko/10" : isGood ? "border-ok bg-ok/10" : isMissing ? "border-amber bg-amber/10" : on ? "border-sky bg-sky/10" : "border-line bg-bg hover:border-sky/60")}>
              <span className={cx("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border", on ? (isTrap ? "border-ko bg-ko text-bg" : isGood ? "border-ok bg-ok text-bg" : "border-sky bg-sky text-bg") : "border-muted")}>
                {on && <CheckCircle2 size={12} />}
              </span>
              <span className="min-w-0 flex-1">
                {render ? render(it) : <span className="text-ink">{it.t}</span>}
                {isTrap && <span className="mt-1 block text-[12px] text-ko">{it.why}</span>}
                {isMissing && <span className="mt-1 block text-[12px] text-amber">Obligatoire : {it.why}</span>}
                {checked && it.ok && on && <span className="mt-1 block text-[12px] text-muted">{it.why}</span>}
              </span>
            </button>
          );
        })}
      </div>
      {!checked && (
        <div className="flex flex-wrap items-center gap-3">
          <PrimaryButton onClick={validate}><Lock size={16} /> Valider la sélection (définitif)</PrimaryButton>
        </div>
      )}
      {checked && (missing.length > 0 || traps.length > 0) && (
        <Feedback ok={false} label="Sélection verrouillée.">
          {traps.length > 0 && `${traps.length} sélection${traps.length > 1 ? "s" : ""} à tort (en rouge). `}
          {missing.length > 0 && `${missing.length} élément${missing.length > 1 ? "s" : ""} obligatoire${missing.length > 1 ? "s" : ""} oublié${missing.length > 1 ? "s" : ""} (en orange).`}
          {" "}Les erreurs sont décomptées de la jauge ; la mission continue.
        </Feedback>
      )}
      {checked && missing.length === 0 && traps.length === 0 && <Feedback ok>Sélection conforme. Chaque article validé apparaît avec sa justification.</Feedback>}
    </div>
  );
}

/* Séquence à construire dans l'ordre ; les cartes pièges sont rejetées et coûtent des points */
function SequenceStep({ id, axis, label, correct, distractors, pts = 5, prompt }) {
  const { done, solve, penalize } = useSim();
  const isDone = !!done[id];
  const all = useMemo(() => [
    ...correct.map((c, i) => ({ ...c, key: "c" + i, rank: i })),
    ...distractors.map((d, i) => ({ ...d, key: "d" + i, trap: true })),
  ], []);
  const byKey = (k) => all.find((a) => a.key === k);
  const [pool] = useState(() => shuffle(all.map((a) => a.key)));
  const [seq, setSeq] = useState(done[id] === true ? correct.map((_, i) => "c" + i) : done[id]?.seq || []);
  const [rejected, setRejected] = useState({});
  const [lastTrap, setLastTrap] = useState(null);
  const [status, setStatus] = useState(done[id] === true ? "ok" : isDone ? "order" : null);
  const locked = isDone || status === "ok" || status === "order";
  const add = (k) => {
    if (locked || seq.includes(k)) return;
    const it = byKey(k);
    if (it.trap) {
      setRejected((r) => ({ ...r, [k]: true }));
      setLastTrap(it);
      penalize(`${id}:${k}`, axis, it.pts ?? pts + 3, label, `Étape ajoutée à tort : ${it.t}`, it.why, !!it.grave);
      return;
    }
    setLastTrap(null);
    setStatus(null);
    setSeq((s) => [...s, k]);
  };
  const remove = (k) => { if (!locked) { setStatus(null); setSeq((s) => s.filter((x) => x !== k)); } };
  const correctText = correct.map((c, i) => `${i + 1}. ${c.t}`).join(" → ");
  const validate = () => {
    const good = seq.every((k, i) => byKey(k).rank === i);
    if (good) { setStatus("ok"); solve(id); }
    else {
      setStatus("order");
      penalize(`${id}:order:${seq.join("")}`, axis, pts, label, "Séquence construite dans le mauvais ordre", correctText);
      solve(id, false, { seq });
    }
  };
  const remaining = pool.filter((k) => !seq.includes(k));
  return (
    <div className="flex flex-col gap-3">
      {prompt && <p className="text-[14px] leading-relaxed text-ink/90">{prompt}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Eyebrow tone="amber">Cartes disponibles · cliquez pour ajouter</Eyebrow>
          {remaining.length === 0 && <div className="rounded-lg border border-dashed border-line p-3 text-[13px] text-muted">Toutes les cartes ont été utilisées.</div>}
          {remaining.map((k) => {
            const it = byKey(k);
            const rej = rejected[k];
            return (
              <button key={k} type="button" disabled={locked || rej} onClick={() => add(k)}
                className={cx("flex items-start gap-2 rounded-lg border p-2.5 text-left text-[13px] leading-snug transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
                  rej ? "border-ko/40 bg-ko/5 text-muted line-through decoration-ko/60" : locked ? "border-line bg-bg text-muted" : "border-line bg-bg text-ink hover:border-sky/70")}>
                {rej ? <XCircle size={15} className="mt-0.5 shrink-0 text-ko" /> : <ArrowRight size={15} className="mt-0.5 shrink-0 text-sky" />}
                <span>{it.t}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          <Eyebrow>Séquence de la gamme · {seq.length}/{correct.length}</Eyebrow>
          <div className="flex min-h-[120px] flex-col gap-2 rounded-xl border border-line bg-bg p-2">
            {seq.length === 0 && <div className="p-3 text-[13px] text-muted">Ajoutez les opérations dans l'ordre d'exécution.</div>}
            {seq.map((k, i) => {
              const it = byKey(k);
              const wrong = status === "order" && it.rank !== i;
              return (
                <button key={k} type="button" onClick={() => remove(k)} disabled={locked}
                  title={locked ? "" : "Retirer de la séquence"}
                  className={cx("flex items-start gap-2 rounded-lg border p-2.5 text-left text-[13px] leading-snug transition",
                    status === "ok" ? "border-ok/50 bg-ok/10" : wrong ? "border-ko bg-ko/10" : "border-sky/40 bg-sky/10 hover:border-ko/60")}>
                  <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-[11px] font-semibold", status === "ok" ? "bg-ok text-bg" : wrong ? "bg-ko text-bg" : "bg-sky text-bg")}>{i + 1}</span>
                  <span className="min-w-0 flex-1 text-ink">{it.t}</span>
                  {!locked && <X size={14} className="mt-0.5 shrink-0 text-muted" />}
                </button>
              );
            })}
          </div>
          {!locked && (
            <div className="flex flex-wrap gap-2">
              <PrimaryButton onClick={validate} disabled={seq.length !== correct.length}><Lock size={16} /> Valider la séquence (définitif)</PrimaryButton>
              {seq.length > 0 && <GhostButton onClick={() => { setSeq([]); setStatus(null); }}><Undo2 size={14} /> Vider</GhostButton>}
            </div>
          )}
        </div>
      </div>
      {lastTrap && !locked && <Feedback ok={false} label={lastTrap.grave ? "Carte rejetée, erreur grave." : "Carte rejetée."}>{lastTrap.why}</Feedback>}
      {status === "order" && <Feedback ok={false} label="Séquence verrouillée.">L'ordre n'est pas bon : les cartes en rouge ne sont pas à leur place. Séquence attendue : {correctText}.</Feedback>}
      {status === "ok" && <Feedback ok>Séquence conforme. {correct[correct.length - 1].why || ""}</Feedback>}
    </div>
  );
}

/* ============================================================
   JAUGE DE CRÉDIBILITÉ
   ============================================================ */
const gaugeTone = (v) => (v >= 85 ? C.ok : v >= 60 ? C.amber : C.ko);

function GaugeArc({ value, size = 220 }) {
  const r = 80, cxp = 100, cyp = 100;
  const ang = (v) => Math.PI * (1 - v / 100);
  const pt = (v) => [cxp + r * Math.cos(ang(v)), cyp - r * Math.sin(ang(v))];
  const [x1, y1] = pt(0);
  const [x2, y2] = pt(Math.max(0.01, value));
  const [tx, ty] = pt(100);
  return (
    <svg viewBox="0 0 200 120" width={size} height={size * 0.6} role="img" aria-label={`Crédibilité ${value} sur 100`}>
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${tx} ${ty}`} stroke={C.line} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} stroke={gaugeTone(value)} strokeWidth="14" fill="none" strokeLinecap="round" style={{ transition: "all .6s ease" }} />
      {[60, 80].map((v) => { const [a, b] = pt(v); const [c, d] = [cxp + (r + 12) * Math.cos(ang(v)), cyp - (r + 12) * Math.sin(ang(v))]; return <line key={v} x1={a} y1={b} x2={c} y2={d} stroke={C.muted} strokeWidth="1.5" />; })}
      <text x="100" y="96" textAnchor="middle" fill={C.ink} fontFamily="JetBrains Mono, monospace" fontSize="34" fontWeight="700">{value}</text>
      <text x="100" y="114" textAnchor="middle" fill={C.muted} fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="1.5">/ 100</text>
    </svg>
  );
}

function GaugeMini({ value, flash }) {
  return (
    <div className={cx("flex items-center gap-3 rounded-lg border px-3 py-1.5 transition", flash ? "border-ko bg-ko/15" : "border-line bg-panel")}>
      <Gauge size={16} style={{ color: gaugeTone(value) }} />
      <div className="flex flex-col">
        <span className="font-mono text-[9px] uppercase leading-tight tracking-wider text-muted">Crédibilité industrielle<span className="hidden sm:inline"> & navigabilité</span></span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-line sm:w-28">
            <div className="h-full rounded-full" style={{ width: `${value}%`, background: gaugeTone(value), transition: "width .6s ease" }} />
          </div>
          <span className="font-mono text-[15px] font-semibold tabular-nums" style={{ color: gaugeTone(value) }}>{value}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DOSSIER TECHNIQUE · SVG
   ============================================================ */
function PlanSVG() {
  const t = { fontFamily: "JetBrains Mono, monospace", fontSize: 9, fill: C.muted };
  const holes = [[100, 92], [252, 92], [100, 188], [252, 188]];
  return (
    <svg viewBox="0 0 520 330" className="h-auto w-full" role="img" aria-label="Plan DWG-H160-67-4022 indice B : vue de dessus et coupe de la ferrure">
      <rect x="1" y="1" width="518" height="328" rx="8" fill={C.bg} stroke={C.line} />
      <text x="16" y="22" {...t} fill={C.sky} fontSize="10">VUE DE DESSUS · ÉCH. 1:1 (indicatif)</text>
      {/* bord du plancher */}
      <line x1="44" y1="40" x2="44" y2="240" stroke={C.amber} strokeDasharray="5 4" />
      <text x="40" y="254" {...t} fill={C.amber} textAnchor="start">bord plancher CFRP</text>
      {/* semelle de la ferrure */}
      <rect x="70" y="62" width="212" height="156" rx="10" fill={C.panel} stroke={C.ink} strokeWidth="1.4" />
      {/* bossage + alésage */}
      <circle cx="176" cy="140" r="38" fill={C.panel2} stroke={C.ink} strokeWidth="1.4" />
      <circle cx="176" cy="140" r="17" fill={C.bg} stroke={C.sky} strokeWidth="1.6" />
      <line x1="130" y1="140" x2="222" y2="140" stroke={C.muted} strokeDasharray="8 3 2 3" strokeWidth=".8" />
      <line x1="176" y1="94" x2="176" y2="186" stroke={C.muted} strokeDasharray="8 3 2 3" strokeWidth=".8" />
      {holes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="7" fill={C.bg} stroke={C.ink} strokeWidth="1.3" />
          <line x1={x - 11} y1={y} x2={x + 11} y2={y} stroke={C.muted} strokeWidth=".7" />
          <line x1={x} y1={y - 11} x2={x} y2={y + 11} stroke={C.muted} strokeWidth=".7" />
        </g>
      ))}
      {/* cote ED */}
      <line x1="100" y1="196" x2="100" y2="236" stroke={C.sky} strokeWidth=".6" />
      <line x1="44" y1="230" x2="100" y2="230" stroke={C.sky} strokeWidth="1" markerStart="url(#arr)" markerEnd="url(#arr)" />
      <text x="106" y="234" {...t} fill={C.sky}>ED 17,0 (≥ 2,5D)</text>
      {/* repères */}
      <line x1="193" y1="125" x2="300" y2="40" stroke={C.sky} strokeWidth=".8" />
      <text x="302" y="38" {...t} fill={C.ink}>Ø20 H7 · bague 20 H7/p6</text>
      <line x1="252" y1="92" x2="300" y2="62" stroke={C.ink} strokeWidth=".8" />
      <text x="302" y="60" {...t} fill={C.ink}>4× Ø6,35 H7 · Hi-Lok Ti</text>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill={C.sky} />
        </marker>
        <pattern id="cfrp" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#3a4a6b" strokeWidth="2" />
        </pattern>
      </defs>
      {/* coupe A-A */}
      <text x="310" y="88" {...t} fill={C.sky} fontSize="10">COUPE A-A (empilage)</text>
      <rect x="310" y="110" width="160" height="26" fill={C.panel} stroke={C.ink} />
      <text x="390" y="127" {...t} fill={C.ink} textAnchor="middle">Ferrure Al (anodisée)</text>
      <rect x="310" y="136" width="160" height="9" fill={C.amber} opacity=".35" stroke={C.amber} />
      <text x="305" y="143" {...t} fill={C.amber} fontSize="8" textAnchor="end">cale</text>
      <rect x="310" y="145" width="160" height="3" fill={C.ok} opacity=".7" />
      <text x="305" y="153" {...t} fill={C.ok} fontSize="8" textAnchor="end">PR</text>
      <rect x="310" y="148" width="160" height="34" fill="url(#cfrp)" stroke={C.ink} />
      <text x="390" y="170" {...t} fill={C.ink} textAnchor="middle">Plancher méca. CFRP</text>
      {[324, 456].map((x) => (
        <g key={x}>
          <rect x={x - 5} y="102" width="10" height="90" fill={C.muted} opacity=".55" />
          <rect x={x - 10} y="98" width="20" height="6" rx="1" fill={C.muted} />
          <rect x={x - 9} y="190" width="18" height="9" rx="2" fill={C.muted} />
        </g>
      ))}
      <path d="M 470 120 C 500 125, 500 205, 440 215" stroke={C.sky} fill="none" strokeWidth="2" strokeDasharray="2 2" />
      <text x="310" y="230" {...t} fill={C.sky}>tresse de masse &lt; 2,5 mΩ</text>
      <text x="310" y="246" {...t}>Jeu résiduel à l'interface &lt; 0,05</text>
      {/* cartouche */}
      <rect x="12" y="266" width="496" height="52" rx="4" fill={C.panel2} stroke={C.line} />
      <line x1="200" y1="266" x2="200" y2="318" stroke={C.line} />
      <line x1="340" y1="266" x2="340" y2="318" stroke={C.line} />
      <text x="22" y="284" {...t} fill={C.ink} fontSize="11" fontWeight="700">DWG-H160-67-4022</text>
      <text x="22" y="300" {...t}>Ferrure support guignol</text>
      <text x="22" y="311" {...t}>commande de vol</text>
      <text x="210" y="284" {...t} fill={C.amber} fontSize="11" fontWeight="700">INDICE B</text>
      <text x="210" y="300" {...t}>Effectivité MSN 1042</text>
      <text x="210" y="311" {...t}>Cotes en mm</text>
      <text x="350" y="284" {...t} fill={C.ink}>ATA 67 · ATA 53 · ATA 20</text>
      <text x="350" y="300" {...t}>X 3450 · Y −420 · Z 1850</text>
      <text x="350" y="311" {...t}>Zone 200 · plancher méca.</text>
    </svg>
  );
}

function HeliTopSVG({ pick, highlight, solved }) {
  /* Vue en plan H160 (nez en haut) : X vers l'arrière, Y vers la droite, Z vers le haut (trièdre direct) */
  const halo = { stroke: C.bg, strokeWidth: 3, paintOrder: "stroke", strokeLinejoin: "round" };
  const t = { fontFamily: "JetBrains Mono, monospace", fontSize: 10, ...halo };
  const s = { fontFamily: "Barlow, sans-serif", fontSize: 11, ...halo };
  const half = (k, x) => {
    const on = highlight === k;
    const col = k === "L" && solved ? C.ok : C.ko;
    return (
      <rect x={x} y="140" width="40" height="104" fill={on ? col : C.panel2} fillOpacity={on ? 0.35 : 1} stroke={C.ink} strokeWidth="1.3"
        onClick={() => pick && pick(k)} style={{ cursor: pick ? "pointer" : "default" }} role={pick ? "button" : undefined} aria-label={k === "L" ? "Moitié gauche du plancher (−Y)" : "Moitié droite du plancher (+Y)"} />
    );
  };
  return (
    <svg viewBox="0 0 420 470" className="h-auto w-full max-w-[460px]" role="img" aria-label="Vue en plan du H160, nez vers le haut, avec zone 200 du plancher mécanique et trièdre avion">
      <defs>
        <marker id="arrH" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill={C.sky} /></marker>
      </defs>
      <rect x="1" y="1" width="418" height="468" rx="10" fill={C.bg} stroke={C.line} />
      <text x="210" y="20" textAnchor="middle" {...t} fontSize="11" fill={C.sky}>▲ AVANT (nez)</text>
      {/* disque rotor principal */}
      <circle cx="210" cy="192" r="150" fill="none" stroke={C.muted} strokeOpacity="0.6" strokeDasharray="5 6" />
      <text x="340" y="52" textAnchor="middle" {...s} fontSize="10" fill={C.muted}>disque rotor</text>
      {/* plan de symétrie Y = 0 */}
      <line x1="210" y1="28" x2="210" y2="452" stroke={C.amber} strokeWidth="0.9" strokeDasharray="10 3 2 3" />
      {/* fuselage, poutre de queue */}
      <path d="M210,34 C232,36 250,62 254,100 L256,250 C256,280 246,300 222,316 L216,410 L204,410 L198,316 C174,300 164,280 164,250 L166,100 C170,62 188,36 210,34 Z" fill={C.panel} stroke={C.ink} strokeWidth="1.4" />
      {/* verrière + sièges : CdB à droite (+Y), copilote à gauche (−Y) */}
      <path d="M210,44 C228,46 242,66 246,96 L246,126 L174,126 L174,96 C178,66 192,46 210,44 Z" fill={C.sky} fillOpacity="0.14" stroke={C.sky} strokeWidth="1" />
      <rect x="182" y="96" width="22" height="22" rx="5" fill={C.panel2} stroke={C.muted} />
      <rect x="216" y="96" width="22" height="22" rx="5" fill={C.panel2} stroke={C.ink} />
      <polyline points="184,114 160,134 154,134" fill="none" stroke={C.muted} strokeWidth="0.8" />
      <text x="150" y="132" textAnchor="end" {...s} fill={C.ink}>Copilote</text>
      <text x="150" y="145" textAnchor="end" {...t} fill={C.muted}>côté −Y</text>
      <polyline points="236,114 260,134 266,134" fill="none" stroke={C.muted} strokeWidth="0.8" />
      <text x="270" y="132" {...s} fill={C.ink}>CdB</text>
      <text x="270" y="145" {...t} fill={C.muted}>côté +Y</text>
      {/* zone 200 : plancher mécanique, deux moitiés cliquables */}
      {half("L", 170)}{half("R", 210)}
      <circle cx="210" cy="192" r="7" fill={C.bg} stroke={C.muted} pointerEvents="none" />
      <circle cx="210" cy="192" r="2" fill={C.muted} pointerEvents="none" />
      <text x="190" y="160" textAnchor="middle" {...t} fill={C.muted} pointerEvents="none">−Y</text>
      <text x="230" y="160" textAnchor="middle" {...t} fill={C.muted} pointerEvents="none">+Y</text>
      <polyline points="250,212 274,226 280,226" fill="none" stroke={C.ink} strokeWidth="0.8" />
      <text x="284" y="224" {...s} fontSize="13" fontWeight="700" fill={C.ink}>ZONE 200</text>
      <text x="284" y="238" {...s} fontSize="10" fill={C.muted}>plancher mécanique</text>
      <text x="150" y="232" textAnchor="end" {...t} fill={C.amber}>Y = 0</text>
      <text x="150" y="245" textAnchor="end" {...s} fontSize="10" fill={C.amber}>plan de symétrie</text>
      {/* capots des 2 turbomoteurs Arrano */}
      <rect x="180" y="254" width="24" height="46" rx="9" fill={C.panel2} stroke={C.ink} />
      <rect x="216" y="254" width="24" height="46" rx="9" fill={C.panel2} stroke={C.ink} />
      <polyline points="240,282 274,292 280,292" fill="none" stroke={C.muted} strokeWidth="0.8" />
      <text x="284" y="296" {...s} fontSize="10" fill={C.ink}>2 × Arrano (capots)</text>
      <text x="288" y="340" {...s} fontSize="10" fill={C.muted}>poutre de queue</text>
      <polyline points="217,340 280,336 284,336" fill="none" stroke={C.muted} strokeWidth="0.8" />
      {/* stabilisateur biplan (plan inférieur caché en pointillés) */}
      <rect x="156" y="372" width="108" height="10" rx="4" fill={C.panel2} stroke={C.ink} />
      <rect x="164" y="386" width="92" height="8" rx="3" fill="none" stroke={C.ink} strokeDasharray="4 3" />
      <polyline points="264,380 280,380 284,380" fill="none" stroke={C.muted} strokeWidth="0.8" />
      <text x="288" y="384" {...s} fontSize="10" fill={C.ink}>stabilisateur biplan</text>
      {/* Fenestron incliné */}
      <g transform="rotate(-14 210 428)">
        <rect x="205" y="408" width="10" height="40" rx="4" fill={C.panel2} stroke={C.ink} />
      </g>
      <polyline points="218,430 280,424 284,424" fill="none" stroke={C.muted} strokeWidth="0.8" />
      <text x="288" y="428" {...s} fontSize="10" fill={C.ink}>Fenestron incliné</text>
      {solved && (
        <g pointerEvents="none">
          <circle cx="186" cy="204" r="7" fill={C.ok} />
          <circle cx="186" cy="204" r="12" fill="none" stroke={C.ok} />
          <text x="410" y="456" textAnchor="end" {...t} fill={C.ok}>Ferrure Y = −420 → GAUCHE</text>
        </g>
      )}
      {/* trièdre direct */}
      <g transform="translate(40 372)">
        <line x1="0" y1="0" x2="0" y2="42" stroke={C.sky} strokeWidth="2" markerEnd="url(#arrH)" />
        <line x1="0" y1="0" x2="42" y2="0" stroke={C.sky} strokeWidth="2" markerEnd="url(#arrH)" />
        <circle cx="0" cy="0" r="7" fill={C.bg} stroke={C.sky} strokeWidth="1.5" />
        <circle cx="0" cy="0" r="2.2" fill={C.sky} />
        <text x="-6" y="-14" {...t} fontSize="11" fill={C.sky}>+Z haut (vers vous)</text>
        <text x="50" y="4" {...t} fontSize="11" fill={C.sky}>+Y droite</text>
        <text x="10" y="56" {...t} fontSize="11" fill={C.sky}>+X arrière</text>
      </g>
    </svg>
  );
}

/* Empilage de cale pelable : 16 feuillets de 0,05 mm */
function ShimSVG({ peeled, total = 16, gap }) {
  const leafH = 7;
  const kept = total - peeled;
  const y0 = 40;
  const gapPx = (gap / 0.05) * leafH;
  return (
    <svg viewBox="0 0 320 210" className="h-auto w-full max-w-[380px]" role="img" aria-label={`Cale pelable : ${kept} feuillets conservés`}>
      <rect x="1" y="1" width="318" height="208" rx="8" fill={C.bg} stroke={C.line} />
      <rect x="40" y={y0 - 24} width="190" height="24" fill={C.panel} stroke={C.ink} />
      <text x="135" y={y0 - 8} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={C.ink}>Ferrure Al</text>
      {Array.from({ length: total }).map((_, i) => {
        const isKept = i >= peeled;
        const y = y0 + i * leafH;
        return <rect key={i} x={isKept ? 40 : 236} y={isKept ? y : y0 + (i * 2.2)} width={isKept ? 190 : 70} height={isKept ? leafH - 1 : 1.6} fill={C.amber} opacity={isKept ? 0.55 : 0.4} style={{ transition: "all .35s ease" }} />;
      })}
      <rect x="40" y={y0 + total * leafH} width="190" height="30" fill="url(#cfrp2)" stroke={C.ink} />
      <text x="135" y={y0 + total * leafH + 19} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={C.ink}>Plancher CFRP</text>
      {/* jeu mesuré */}
      <line x1="26" y1={y0 + total * leafH - gapPx} x2="26" y2={y0 + total * leafH} stroke={C.sky} strokeWidth="1.5" />
      <text x="22" y={y0 + total * leafH - gapPx / 2 + 3} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="8" fill={C.sky}>jeu</text>
      <text x="271" y={y0 + total * 2.2 + 14} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill={C.muted}>{peeled} pelé{peeled > 1 ? "s" : ""}</text>
      <defs>
        <pattern id="cfrp2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#3a4a6b" strokeWidth="2" />
        </pattern>
      </defs>
    </svg>
  );
}

/* ============================================================
   DOSSIER TECHNIQUE (panneau latéral)
   ============================================================ */
const EXIGENCES = [
  { k: "1", icon: Crosshair, t: "Alésage central Ø20 H7", d: "Reçoit une bague bronze-acier (norme ECS / BNAE NF L) avec un ajustement 20 H7/p6." },
  { k: "2", icon: Target, t: "4 boulons structuraux Hi-Lok Ø6,35 mm titane", d: "Fixation de la ferrure sur le plancher carbone. Distance au bord minimale dans le composite : ED ≥ 2,5D." },
  { k: "3", icon: Layers, t: "Accostage à l'interface", d: "Jeu résiduel maximal < 0,05 mm. Cale pelable 0,80 mm à feuillets de 0,05 mm." },
  { k: "4", icon: Zap, t: "Métallisation (bonding)", d: "Ferrure reliée à la masse par tresse. Résistance exigée < 2,5 mΩ (norme EICM)." },
  { k: "5", icon: Wrench, t: "Axe du guignol de commande de vol", d: "Couple nominal 15 N.m. Écrou auto-freiné à créneaux + goupille fendue. Couple de freinage mesuré : 2,5 N.m." },
];
const EBOM = [
  { pn: "H160-67-4022-001", t: "Ferrure support de guignol, alliage d'aluminium anodisé", q: "1" },
  { pn: "ECS-BG20-P6", t: "Bague bronze-acier Ø20 p6 (ECS / BNAE NF L)", q: "1" },
  { pn: "HL-Ti-6,35-xx", t: "Boulon Hi-Lok titane Ø6,35 + bague de sertissage (collar)", q: "4" },
  { pn: "H160-67-4030-003", t: "Guignol de commande de vol", q: "1" },
  { pn: "NF L-AXE-M8", t: "Boulon d'axe + écrou auto-freiné à créneaux + rondelle", q: "1" },
  { pn: "EICM-TR-150", t: "Tresse de métallisation + 2 cosses", q: "1" },
];
const LEXIQUE = [
  ["E-BOM / M-BOM", "Nomenclature de définition (BE) / nomenclature de fabrication (Méthodes) qui ajoute consommables, outillages et kits de pose."],
  ["Part-21G (POA)", "Agrément d'organisme de production EASA : fabrique conformément aux données approuvées. Ne modifie pas la définition."],
  ["Part-21J (DOA)", "Agrément d'organisme de conception : seul habilité à approuver une réparation ou une concession sur la définition."],
  ["QN", "Quality Notification SAP : enregistre l'écart, bloque le produit, trace la décision (disposition) jusqu'à clôture."],
  ["Point d'arrêt (Hold Point)", "Opération qui ne peut pas démarrer sans libération tracée par la Qualité."],
  ["Double contrôle indépendant", "Duplicate Inspection : 2e contrôleur, indépendant du monteur, sur une liaison critique (commande de vol)."],
  ["FOD", "Foreign Object Debris / Damage : tout corps étranger oublié dans une zone, inspecté avant fermeture."],
  ["Running torque", "Couple de freinage de l'écrou auto-freiné, mesuré avant serrage et ajouté au couple nominal."],
  ["ED (Edge Distance)", "Distance de l'axe d'une fixation au bord de la pièce, exprimée en multiple du diamètre D."],
];

function DossierDrawer({ open, onClose }) {
  const [tab, setTab] = useState("plan");
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);
  const tabs = [
    { id: "plan", t: "Plan BE" },
    { id: "exig", t: "Exigences" },
    { id: "rep", t: "Repère & zone" },
    { id: "ebom", t: "E-BOM" },
    { id: "lex", t: "Lexique" },
  ];
  return (
    <div className={cx("fixed inset-0 z-40", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div className={cx("absolute inset-0 bg-bg/70 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <aside role="dialog" aria-label="Dossier technique"
        className={cx("absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-line bg-panel shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "translate-x-full")}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <FolderOpen size={18} className="text-sky" />
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Dossier technique · H160 MSN 1042</div>
            <div className="font-display text-lg font-semibold leading-tight text-ink">DWG-H160-67-4022 Indice B</div>
          </div>
          <button type="button" onClick={onClose} className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:border-sky/60 hover:text-ink" aria-label="Fermer le dossier">
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cx("shrink-0 rounded-md px-3 py-1.5 text-[13px] font-semibold", tab === t.id ? "bg-sky/15 text-ink" : "text-muted hover:text-ink")}>{t.t}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "plan" && (
            <div className="flex flex-col gap-3">
              <PlanSVG />
              <NoteBox>Plan simplifié à but pédagogique. Les cotes portées sont celles utilisées dans les missions.</NoteBox>
            </div>
          )}
          {tab === "exig" && (
            <div className="flex flex-col gap-2">
              {EXIGENCES.map((e) => {
                const Icon = e.icon;
                return (
                  <div key={e.k} className="flex gap-3 rounded-lg border border-line bg-bg p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-sky/40 bg-sky/10 text-sky"><Icon size={15} /></span>
                    <div>
                      <div className="font-semibold text-ink">{e.k}. {e.t}</div>
                      <div className="text-[13px] leading-relaxed text-ink/80">{e.d}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {tab === "rep" && (
            <div className="flex flex-col gap-3 text-[14px] leading-relaxed text-ink/90">
              <div className="grid grid-cols-3 gap-2">
                <Stat label="X (station)" value="3450" sub="mm" />
                <Stat label="Y (latéral)" value="−420" sub="mm" />
                <Stat label="Z (hauteur)" value="1850" sub="mm" />
              </div>
              <p><strong className="text-ink">Trièdre hélicoptère (direct) :</strong> X horizontal vers l'arrière depuis l'origine située en avant du nez, Z vertical vers le haut. Y complète le trièdre direct.</p>
              <p><strong className="text-ink">Zone :</strong> plancher mécanique (zone 200), structure ATA 53, sous la boîte de transmission principale.</p>
              <p><strong className="text-ink">Cockpit H160 :</strong> le commandant de bord est assis à droite. La géométrie gauche/droite se lit toujours vue de l'arrière vers l'avant, depuis le siège pilote.</p>
            </div>
          )}
          {tab === "ebom" && (
            <div className="overflow-hidden rounded-lg border border-line">
              {EBOM.map((b, i) => (
                <div key={b.pn} className={cx("grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-[13px]", i % 2 ? "bg-panel2" : "bg-bg")}>
                  <div>
                    <div className="font-mono text-[11px] text-sky">{b.pn}</div>
                    <div className="text-ink/90">{b.t}</div>
                  </div>
                  <div className="font-mono text-ink">×{b.q}</div>
                </div>
              ))}
              <div className="border-t border-line bg-panel2 px-3 py-2 text-[11px] text-muted">Références fictives à but pédagogique. L'E-BOM ne contient aucun consommable : c'est le rôle de la M-BOM.</div>
            </div>
          )}
          {tab === "lex" && (
            <dl className="flex flex-col gap-2">
              {LEXIQUE.map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-bg p-3">
                  <dt className="font-semibold text-ink">{k}</dt>
                  <dd className="text-[13px] leading-relaxed text-ink/80">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ============================================================
   EN-TÊTE DE MISSION & BANDEAU DE FIN
   ============================================================ */
function MissionHead({ m, children, tone }) {
  return (
    <SectionHead icon={m.icon} kicker={`Mission ${m.n} / 5`} title={m.title} tone={tone}>{children}</SectionHead>
  );
}

function MissionComplete({ m, next, onNext }) {
  const { done } = useSim();
  if (!missionDone(m, done)) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ok/50 bg-ok/10 px-4 py-3">
      <ShieldCheck size={20} className="text-ok" />
      <div className="min-w-0 flex-1 text-[14px] text-ink">
        <strong className="font-semibold">Mission {m.n} accomplie.</strong> Toutes les étapes sont validées et tracées dans le dossier.
      </div>
      <PrimaryButton tone="green" onClick={onNext}>{next} <ChevronRight size={16} /></PrimaryButton>
    </div>
  );
}

/* ============================================================
   BRIEFING · ORDRE DE MISSION
   ============================================================ */
function Briefing({ onStart, started }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <SectionHead icon={Navigation} kicker="Ordre de mission · Bureau des Méthodes FAL" title="Industrialiser le montage d'une ferrure de commande de vol sur H160 MSN 1042">
            Le Bureau d'Études vient de libérer le plan DWG-H160-67-4022 indice B. Vous êtes le préparateur méthodes assemblage en charge du poste. Votre mission : transformer ce dossier en une gamme SAP/MES sûre, puis tenir le poste quand la FAL déclenche une alerte.
          </SectionHead>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Appareil" value="H160" sub="Rang MSN 1042" />
            <Stat label="Plan BE" value="4022 B" sub="DWG-H160-67" />
            <Stat label="Chapitres" value="67 · 53" sub="+ ATA 20" />
            <Stat label="Coordonnées" value="Y −420" sub="X 3450 · Z 1850" />
          </div>
          <Panel className="p-4">
            <Eyebrow>Le sujet du dossier</Eyebrow>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/90">
              Montage d'une <strong>ferrure support de guignol de commande de vol (ATA 67)</strong> en alliage d'aluminium sur le <strong>plancher mécanique en composite carbone</strong> (CFRP, zone 200, ATA 53). Bague bronze-acier emmanchée 20 H7/p6, 4 Hi-Lok titane Ø6,35, calage pelable, métallisation &lt; 2,5 mΩ et axe de guignol freiné par écrou à créneaux et goupille.
            </p>
          </Panel>
        </div>
        <Panel className="flex flex-col gap-3 p-4">
          <Eyebrow tone="amber">Règles du simulateur</Eyebrow>
          {[
            [Gauge, "La jauge Crédibilité Industrielle & Navigabilité démarre à 100. Chaque erreur la fait baisser ; une erreur grave (sécurité vol, réglementation) coûte 12 à 20 points."],
            [RotateCcw, "Vous pouvez corriger et réessayer. Une même erreur n'est comptée qu'une seule fois."],
            [FolderOpen, "Le dossier technique (plan, exigences, repère, E-BOM, lexique) est consultable à tout moment avec le bouton en haut à droite."],
            [Lock, "Les étapes et les missions se débloquent dans l'ordre. Votre progression est conservée sur cet appareil."],
            [Award, "La mission 5 dresse votre bilan sur 4 axes et délivre votre carte d'habilitation pédagogique."],
          ].map(([Icon, txt], i) => (
            <div key={i} className="flex gap-3 text-[13px] leading-relaxed text-ink/85">
              <Icon size={16} className="mt-0.5 shrink-0 text-sky" />
              <span>{txt}</span>
            </div>
          ))}
        </Panel>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {[...MISSIONS, { n: "5", short: "Débriefing & certificat", title: "Bilan de compétences et carte d'habilitation", icon: Award }].map((m) => {
          const Icon = m.icon;
          return (
            <Panel key={m.n} className="flex flex-col gap-2 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-sky font-mono text-[11px] font-semibold text-bg">{m.n}</span>
                <Icon size={15} className="text-sky" />
              </div>
              <div className="font-display text-[17px] font-semibold leading-tight text-ink">{m.short}</div>
              <div className="text-[12px] leading-snug text-muted">{m.title}</div>
            </Panel>
          );
        })}
      </div>
      <div>
        <PrimaryButton onClick={onStart}><Play size={16} /> {started ? "Reprendre la mission" : "Prendre le poste · Mission 1"}</PrimaryButton>
      </div>
    </div>
  );
}

/* ============================================================
   MISSION 1 · DOSSIER BE, ZONAGE & M-BOM
   ============================================================ */
const LOC_OPTS = [
  { k: "L", t: "À gauche du plancher méca., côté place copilote", ok: true, why: "Trièdre direct avec X vers l'arrière et Z vers le haut : Y positif pointe vers la droite. Y = −420 place donc la ferrure à 420 mm à gauche du plan de symétrie, vu du siège pilote. Sur H160 le commandant de bord est à droite : la ferrure est du côté de la place copilote." },
  { k: "R", t: "À droite du plancher méca., côté commandant de bord", why: "Avec X vers l'arrière et Z vers le haut, le trièdre direct impose Y positif vers la droite. Un Y négatif est donc à gauche. Une ferrure montée du mauvais côté est une erreur d'industrialisation complète (outillage, gamme, accès).", pts: 10 },
  { k: "0", t: "Sur le plan de symétrie, à cheval sur Y = 0", why: "Y = 0 est le plan de symétrie. Ici Y vaut −420 mm : la pièce est décalée latéralement de 420 mm.", pts: 6 },
  { k: "Z", t: "Côté indéterminé : il dépend de la hauteur Z", why: "Z donne la hauteur (1850 mm), pas le côté. Le côté se lit uniquement sur le signe de Y.", pts: 6 },
];

function LocStep() {
  const { done, solve, penalize } = useSim();
  const id = "m1.loc";
  const isDone = !!done[id];
  const [picked, setPicked] = useState(done[id] === true ? "L" : done[id]?.k ?? null);
  const pick = (k) => {
    if (isDone || picked !== null) return;
    setPicked(k);
    const o = LOC_OPTS.find((x) => x.k === k);
    if (o.ok) solve(id);
    else { penalize(`${id}:${k}`, "a3", o.pts, "1.1 Localisation spatiale", o.t, o.why); solve(id, false, { k }); }
  };
  const cur = LOC_OPTS.find((x) => x.k === picked);
  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
      <HeliTopSVG pick={isDone || picked !== null ? null : pick} highlight={picked === "L" || picked === "R" ? picked : null} solved={isDone} />
      <div className="flex flex-col gap-3">
        <p className="text-[14px] leading-relaxed text-ink/90">
          Le plan donne <span className="font-mono text-sky">X = 3450, Y = −420, Z = 1850</span>. Vu du siège pilote, de quel côté du plancher mécanique la ferrure est-elle montée ? Cliquez sur une moitié du plancher ou choisissez une réponse.
        </p>
        <div className="grid gap-2">
          {LOC_OPTS.map((o) => {
            const isP = picked === o.k;
            return (
              <button key={o.k} type="button" disabled={isDone || picked !== null} onClick={() => pick(o.k)}
                className={cx("flex items-start gap-3 rounded-lg border p-3 text-left text-[14px] transition", isP ? (o.ok ? "border-ok bg-ok/10" : "border-ko bg-ko/10") : picked !== null && o.ok ? "border-dashed border-ok/70 bg-ok/5" : isDone || picked !== null ? "border-line bg-bg text-muted" : "border-line bg-bg text-ink hover:border-sky/70")}>
                <MapPin size={16} className={cx("mt-0.5 shrink-0", isP ? (o.ok ? "text-ok" : "text-ko") : "text-muted")} />
                <span className="flex-1">{o.t}</span>
              </button>
            );
          })}
        </div>
        {cur && <Feedback ok={!!cur.ok}>{cur.why}</Feedback>}
        <NoteBox>Astuce : le trièdre est donné dans le dossier technique, onglet « Repère & zone ». Avec la règle de la main droite, X × Y = Z.</NoteBox>
      </div>
    </div>
  );
}

const ATA_ITEMS = [
  { t: "ATA 20 · Pratiques standard (cellule)", ok: true, why: "Couples de serrage, freinage, métallisation, interposition : tout ce qui relève des pratiques standard." },
  { t: "ATA 53 · Fuselage / structure", ok: true, why: "Le plancher mécanique CFRP qui reçoit la ferrure est un élément de structure." },
  { t: "ATA 67 · Commandes de vol rotors", ok: true, why: "La ferrure porte le guignol de la chaîne de commande de vol : c'est le chapitre qui fixe la criticité." },
  { t: "ATA 27 · Commandes de vol", why: "ATA 27 couvre les commandes de vol d'avion (gouvernes). Sur hélicoptère, les commandes rotors sont au chapitre 67." },
  { t: "ATA 62 · Rotor principal", why: "Le guignol transmet la commande vers les servocommandes, mais la pièce montée appartient à la chaîne de commande (67), pas au rotor." },
  { t: "ATA 63 · Transmission rotor principal", why: "Le plancher supporte la BTP, mais la ferrure n'est pas une pièce de transmission." },
  { t: "ATA 92 · Câblage électrique", why: "La tresse de masse est traitée ici en pratique standard (ATA 20), pas comme un harnais électrique." },
  { t: "ATA 52 · Portes", why: "Aucune porte ni capot de porte dans ce dossier." },
];

const CRIT_OPTS = [
  { t: "Critique sécurité vol (commande rotor) : traçabilité MSN, double contrôle indépendant", ok: true, why: "Une rupture ou un desserrage de cette liaison peut entraîner la perte de contrôle de l'appareil. La criticité pilote tout le reste : contrôles, freinage, gestion des écarts." },
  { t: "Structurale standard : autocontrôle du compagnon tracé par son tampon sur la gamme", grave: true, pts: 15, why: "La ferrure porte un guignol de commande de vol. L'autocontrôle seul est interdit sur une liaison de commande de vol." },
  { t: "Secondaire non structurale : contrôle par échantillonnage sur un appareil sur cinq", grave: true, pts: 15, why: "L'échantillonnage n'est jamais admis sur une liaison commande de vol : chaque appareil est contrôlé à 100 %." },
  { t: "Critique pour la seule métallisation : mesure 4 fils tracée, contrôle visuel du reste", pts: 6, why: "La métallisation est une exigence importante, mais la criticité vient d'abord de la fonction commande de vol." },
];

const BOM_ITEMS = [
  { t: "Azote liquide (LN₂)", code: "CONS-LN2-DEWAR", ok: true, why: "Emmanchement thermique de la bague 20 H7/p6 à −196 °C." },
  { t: "Mastic d'interposition PR 1776 B2", code: "CONS-PR1776-B2", ok: true, why: "Isolation galvanique aluminium / carbone : le carbone est cathodique et corroderait l'aluminium. B2 = 2 h de durée d'application, compatible avec la pose complète." },
  { t: "Cale pelable 0,80 mm (feuillets 0,05 mm)", code: "CONS-SHIM-080", ok: true, why: "Rattrapage du jeu d'accostage pour respecter < 0,05 mm." },
  { t: "Goupille fendue NF L (neuve)", code: "CONS-GOUP-NFL", ok: true, why: "Freinage de sécurité de l'écrou à créneaux. Toujours neuve, jamais réutilisée." },
  { t: "Solvant dégraissant homologué", code: "CONS-SOLV-EICM", ok: true, why: "Nettoyage des surfaces avant interposition et avant métallisation." },
  { t: "Vernis de re-protection de métallisation", code: "CONS-VERN-MET", ok: true, why: "Re-protection anticorrosion de la zone décapée après mesure." },
  { t: "Vernis témoin (torque seal)", code: "CONS-TORQ-SEAL", ok: true, why: "Témoin visuel de non-desserrage après serrage au couple." },
  { t: "Rivets aveugles", code: "CONS-RIV-AVG", pts: 5, why: "Non demandés : la ferrure est fixée par Hi-Lok. Un rivet aveugle n'a rien à faire dans ce kit." },
  { t: "Mastic PR B1/2", code: "CONS-PR-B12", pts: 8, why: "B1/2 = 30 min de durée d'application. La pose complète (calage, 4 Hi-Lok, métallisation) dépasse 30 min : le mastic polymériserait avant serrage." },
  { t: "Graisse standard pour frein filet", code: "CONS-GRAISSE-STD", pts: 8, why: "Incompatible : elle fausse le couple de serrage et n'est pas prévue par la définition. Aucune graisse non prescrite sur une liaison commande de vol." },
  { t: "Hi-Lok titane Ø6,35 + collars", code: "HL-Ti-6,35-xx", pts: 4, why: "Déjà dans l'E-BOM : c'est une pièce de définition, pas un consommable. Le doubler dans la M-BOM crée un double besoin dans l'ERP." },
];

function Mission1({ goNext }) {
  const { done } = useSim();
  const m = MISSIONS[0];
  return (
    <div className="flex flex-col gap-5">
      <MissionHead m={m}>
        Le dossier BE arrive au Bureau des Méthodes. Avant d'écrire la moindre opération, il faut savoir où se trouve la pièce, quels référentiels s'appliquent, quel niveau de criticité impose la fonction, et ce que l'ERP doit approvisionner au poste.
      </MissionHead>
      <StepCard n="1.1" id="m1.loc" axis="a3" title="Localisation spatiale : gauche ou droite ?"><LocStep /></StepCard>
      <StepCard n="1.2" id="m1.ata" axis="a1" title="Identification normative : chapitres ATA impliqués" locked={!done["m1.loc"]}>
        <MultiSelect id="m1.ata" axis="a1" label="1.2 Chapitres ATA" items={ATA_ITEMS} prompt="Cochez tous les chapitres ATA concernés par ce dossier, puis validez." />
      </StepCard>
      <StepCard n="1.3" id="m1.crit" axis="a1" title="Criticité de la liaison" locked={!done["m1.ata"]}>
        <SingleChoice id="m1.crit" axis="a1" label="1.3 Criticité" prompt="H160, liaison ferrure support de guignol / plancher mécanique (ATA 67). Quel niveau de criticité retenez-vous pour cette liaison, et qu'implique-t-il ?" options={CRIT_OPTS} />
      </StepCard>
      <StepCard n="1.4" id="m1.bom" axis="a2" title="Transformation E-BOM → M-BOM : catalogue ERP" locked={!done["m1.crit"]}>
        <MultiSelect id="m1.bom" axis="a2" label="1.4 M-BOM consommables" items={BOM_ITEMS} columns={3}
          prompt="L'E-BOM liste les pièces de définition. Cochez dans le catalogue ERP les consommables obligatoires à ajouter à la M-BOM pour ce montage précis. Attention aux pièges."
          render={(it) => (<><span className="block font-mono text-[10px] text-sky">{it.code}</span><span className="text-ink">{it.t}</span></>)} />
      </StepCard>
      <ImpactBox title="La M-BOM est la promesse faite au compagnon">
        Un consommable oublié, c'est un poste arrêté en pleine pose avec du mastic qui polymérise. Un article en trop, c'est un risque d'utilisation à tort. La M-BOM se construit opération par opération, à partir de la gamme que vous allez écrire.
      </ImpactBox>
      <MissionComplete m={m} next="Mission 2 · Pré-assemblage" onNext={goNext} />
    </div>
  );
}

/* ============================================================
   MISSION 2 · PRÉ-ASSEMBLAGE & PROCÉDÉS SPÉCIAUX
   ============================================================ */
const FIT_OPTS = [
  { t: "Ajustement avec SERRAGE", ok: true, why: "H7 sur 20 mm : 0 / +0,021. p6 : +0,022 / +0,035. L'arbre (la bague) est toujours plus gros que l'alésage : serrage de 0,001 à 0,035 mm." },
  { t: "Ajustement avec JEU", pts: 5, why: "Un jeu suppose un arbre toujours plus petit que l'alésage (g6, f7…). Ici p6 commence à +0,022, au-dessus du maxi de H7 (+0,021)." },
  { t: "Ajustement INCERTAIN", pts: 5, why: "Les écarts ne se chevauchent pas : p6 mini (+0,022) > H7 maxi (+0,021). C'est toujours du serrage, même faible." },
];
const BAGUE_OPTS = [
  { t: "Bague refroidie à l'azote liquide (−196 °C), posée sans effort, EPI cryogéniques", ok: true, why: "La bague se contracte (de l'ordre de 0,06 à 0,08 mm sur Ø20) : elle entre sans effort, puis se dilate pour créer le serrage sans arracher de matière ni marquer l'alésage." },
  { t: "Bague graissée, posée au maillet acier par frappes croisées jusqu'à l'épaulement", grave: true, pts: 20, why: "Erreur grave : marquage, matage et arrachement de matière dans l'alésage aluminium, bague déformée, serrage réel inconnu. Interdit sur une pièce de commande de vol." },
  { t: "Bague emmanchée à la presse hydraulique, à froid et à sec, effort enregistré", pts: 8, why: "Sans procédé thermique, le serrage provoque un grippage et un arrachement de l'alésage aluminium. Le dossier prescrit l'emmanchement thermique." },
  { t: "Ferrure chauffée au chalumeau pour dilater l'alésage, bague posée à la main", grave: true, pts: 15, why: "Erreur grave : une chauffe non maîtrisée détruit le traitement thermique de l'alliage d'aluminium et l'anodisation." },
];
const SEQ_CORRECT = [
  { t: "Positionner la ferrure sur le plancher (pions de positionnement) et la brider" },
  { t: "Installer le martyr anti-délaminage en sortie du carbone et l'aspiration des poussières carbone à la source (EPI)" },
  { t: "Percer l'avant-trou au foret carbure / diamant (PCD), avance maîtrisée, à sec" },
  { t: "Aléser au Ø6,35 H7 et contrôler au tampon" },
  { t: "Démonter la ferrure (désassemblage obligatoire)" },
  { t: "Ébavurer l'aluminium, nettoyer copeaux et poussières, dégraisser au solvant" },
  { t: "Appliquer le PR 1776 B2 en interposition et remonter", why: "Le démontage pour ébavurage et nettoyage est la clé : sans lui, copeaux et bavures restent piégés à l'interface et le PR ne peut pas isoler l'aluminium du carbone." },
];
const SEQ_TRAPS = [
  { t: "Lubrifier le perçage à l'huile de coupe soluble", why: "Le carbone se perce à sec avec aspiration. L'huile pollue le composite et compromet l'adhérence du mastic d'interposition." },
  { t: "Souffler les poussières de carbone à l'air comprimé", why: "La poussière de carbone est nocive et conductrice : on l'aspire à la source, on ne la disperse jamais dans la cellule (risque FOD et électrique)." },
  { t: "Remonter directement avec le PR, sans démonter (gain de temps)", grave: true, pts: 15, why: "Erreur grave : copeaux et bavures restent entre la ferrure et le carbone, l'interposition est inefficace et l'accostage faux." },
  { t: "Percer au foret HSS standard, vitesse maximale", why: "L'acier rapide s'use en quelques trous dans le carbone et provoque délaminage et écaillage en sortie." },
];
const EDCHK_OPTS = [
  { t: "Conforme : 17,0 mm ≥ 15,875 mm, marge de 1,125 mm", ok: true, why: "La cote du plan respecte l'exigence 2,5D. Retenez cette marge : elle sera décisive si un alésage doit être repris en cote réparation." },
  { t: "Non conforme : il faudrait 3D, soit 19,05 mm", pts: 5, why: "Le dossier exige 2,5D pour ce composite, pas 3D. Appliquez l'exigence du plan, pas une règle générique." },
  { t: "Non conforme : 17,0 mm < 2 × 6,35 + 6,35", pts: 5, why: "Ce n'est pas la bonne formule. ED se mesure de l'axe de la fixation au bord : 2,5 × D." },
];

function FitTable() {
  const rows = [
    ["Alésage Ø20 H7", "+0,000", "+0,021"],
    ["Bague Ø20 p6", "+0,022", "+0,035"],
  ];
  return (
    <div className="overflow-hidden rounded-lg border border-line text-[13px]">
      <div className="grid grid-cols-3 bg-panel2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted"><span>Élément</span><span>Écart inf.</span><span>Écart sup.</span></div>
      {rows.map((r) => <div key={r[0]} className="grid grid-cols-3 border-t border-line bg-bg px-3 py-1.5 font-mono text-ink"><span className="font-sans">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>)}
      <div className="grid grid-cols-2 gap-2 border-t border-line bg-panel2 px-3 py-2 font-mono text-[12px]"><span className="text-ok">Serrage mini 0,001</span><span className="text-ok">Serrage maxi 0,035</span></div>
    </div>
  );
}

function Mission2({ goNext }) {
  const { done } = useSim();
  const m = MISSIONS[1];
  return (
    <div className="flex flex-col gap-5">
      <MissionHead m={m}>
        Vous configurez maintenant les paramètres d'atelier : montage de la bague dans la ferrure, puis perçage du couple hybride aluminium / carbone et vérification de la distance au bord.
      </MissionHead>
      <StepCard n="2.1" id="m2.fit" axis="a3" title="Lecture de l'ajustement 20 H7/p6">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <SingleChoice id="m2.fit" axis="a3" label="2.1 Ajustement 20 H7/p6" prompt="H160, plan de la ferrure support de guignol, appel Ø20 H7/p6. Quel type d'ajustement le plan impose-t-il entre l'alésage de la ferrure et la bague bronze-acier ?" options={FIT_OPTS} />
          {done["m2.fit"] ? <FitTable /> : <NoteBox>Rappel ISO 286 : la lettre majuscule désigne l'alésage, la minuscule l'arbre. Comparez les écarts de p6 à l'intervalle de H7.</NoteBox>}
        </div>
      </StepCard>
      <StepCard n="2.2" id="m2.bague" axis="a2" title="Procédé de montage de la bague" locked={!done["m2.fit"]}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[13px] text-sky"><Snowflake size={16} /> Procédé spécial : emmanchement d'une bague avec serrage</div>
          <SingleChoice id="m2.bague" axis="a2" label="2.2 Montage de la bague" prompt="H160, gamme de pré-assemblage de la ferrure (poste 10). Quel procédé inscrivez-vous dans la gamme pour monter la bague ?" options={BAGUE_OPTS} />
        </div>
      </StepCard>
      <StepCard n="2.3" id="m2.seq" axis="a2" title="Perçage / alésage du couple hybride aluminium / CFRP" locked={!done["m2.bague"]}>
        <SequenceStep id="m2.seq" axis="a2" label="2.3 Séquence de perçage hybride" correct={SEQ_CORRECT} distractors={SEQ_TRAPS}
          prompt="Construisez la séquence de perçage des 4 trous Hi-Lok, de la mise en position jusqu'au remontage. Quatre cartes sont des pièges." />
      </StepCard>
      <StepCard n="2.4" id="m2.ed" axis="a3" title="Calcul de la distance au bord minimale (ED)" locked={!done["m2.seq"]}>
        <NumericStep id="m2.ed" axis="a3" label="2.4 Calcul ED" unit="mm" digits={3} answer={15.875} tol={0.006}
          prompt={<>Hi-Lok <span className="font-mono text-sky">D = 6,35 mm</span> dans du carbone, exigence <span className="font-mono text-sky">ED ≥ 2,5D</span>. Calculez la distance minimale de l'axe du trou au bord du plancher.</>}
          diagnose={(v) => (Math.abs(v - 12.7) < 0.05 ? "Vous avez appliqué 2D. Le dossier exige 2,5D dans le composite." : Math.abs(v - 19.05) < 0.05 ? "Vous avez appliqué 3D. Le dossier exige 2,5D." : Math.abs(v - 7.9375) < 0.05 ? "Vous avez divisé par 2 : l'ED se mesure depuis l'axe, avec le diamètre D complet." : "Le calcul est ED = 2,5 × D.")}
          explain="ED mini = 2,5 × 6,35 = 15,875 mm, mesurée de l'axe du trou au bord du plancher." />
      </StepCard>
      <StepCard n="2.5" id="m2.edchk" axis="a3" title="Vérification sur le plan" locked={!done["m2.ed"]}>
        <SingleChoice id="m2.edchk" axis="a3" label="2.5 Vérification ED" prompt="H160, plancher mécanique CFRP, Hi-Lok Ø6,35 (extrait de plan). Le plan positionne l'axe des Hi-Lok côté bord à 17,0 mm du bord du plancher. Votre conclusion ?" options={EDCHK_OPTS} />
      </StepCard>
      <DangerBox title="Le carbone ne pardonne ni la chaleur, ni la poussière, ni le raccourci">
        Délaminage en sortie, poussière conductrice, couple galvanique avec l'aluminium : chaque paramètre de la séquence protège la tenue structurale du plancher mécanique qui porte la BTP.
      </DangerBox>
      <MissionComplete m={m} next="Mission 3 · Gamme SAP/MES" onNext={goNext} />
    </div>
  );
}

/* ============================================================
   MISSION 3 · GAMME SAP/MES
   ============================================================ */
const CREN_OPTS = [
  { t: "Serrer jusqu'au créneau suivant dans la plage, sinon changer de rondelle", ok: true, why: "On aligne toujours en serrant, jamais en desserrant, et dans la plage de couple prescrite. Si l'alignement est impossible dans la plage, on change de rondelle ou d'écrou, comme prévu par la gamme." },
  { t: "Desserrer légèrement jusqu'au créneau précédent, puis goupiller", grave: true, pts: 15, why: "Erreur grave : desserrer fait chuter la tension de l'assemblage sous le couple nominal sur une liaison commande de vol." },
  { t: "Percer un second trou de goupille dans le boulon face au créneau", grave: true, pts: 15, why: "Erreur grave : modifier une pièce de définition sans approbation BE est interdit, et affaiblit le boulon." },
  { t: "Poser la goupille en biais dans le créneau partiellement aligné", pts: 8, why: "Une goupille mal engagée ne freine pas : elle peut se cisailler ou sortir sous vibrations." },
];
const METAL_CORRECT = [
  { t: "Décapage calibré de la zone de contact (surface limitée, sans attaquer le métal de base)" },
  { t: "Serrage de la cosse de tresse au couple prescrit" },
  { t: "Mesure au milliohmmètre 4 fils : R < 2,5 mΩ" },
  { t: "Re-protection anticorrosion (vernis) de la zone décapée", why: "On ne re-protège qu'après une mesure conforme : le vernis est isolant." },
];
const METAL_TRAPS = [
  { t: "Peindre la zone avant la mesure", why: "La peinture et le vernis sont isolants : la mesure serait fausse et la métallisation inefficace." },
  { t: "Mesurer à l'ohmmètre 2 fils de l'atelier", why: "Un ohmmètre 2 fils mesure aussi la résistance des cordons : impossible de garantir un résultat au milliohm près." },
  { t: "Poncer largement toute la ferrure pour être sûr", why: "Le décapage est calibré : au-delà de la zone de contact, on détruit l'anodisation et on crée de la corrosion." },
];
const MES_OPTS = [
  { t: "Refaire : démonter, décaper, resserrer, remesurer, QN si l'écart persiste", ok: true, why: "3,1 mΩ dépasse le seuil de 2,5 mΩ : la liaison n'est pas conforme. On reprend le procédé, puis on trace l'écart s'il persiste." },
  { t: "Accepter : 3,1 mΩ reste très faible devant la résistance d'un harnais", grave: true, pts: 12, why: "Erreur grave : le seuil est 2,5 mΩ. Accepter hors tolérance, c'est livrer une protection foudre et CEM non démontrée." },
  { t: "Ajouter une deuxième tresse en parallèle pour diviser la résistance", pts: 8, why: "Ajouter une tresse non prévue au plan est une modification de définition, réservée au BE." },
  { t: "Vernir la zone de contact, puis remesurer après séchage complet", pts: 6, why: "Le vernis est isolant : la résistance ne peut qu'augmenter." },
];
const QC_OPS = [
  { op: "0010", t: "Contrôle du kit au poste (M-BOM, péremption PR 1776 B2)" },
  { op: "0020", t: "Emmanchement thermique de la bague 20 H7/p6 (LN₂)" },
  { op: "0030", t: "Positionnement ferrure, perçage et alésage Ø6,35 H7" },
  { op: "0040", t: "Démontage, ébavurage, nettoyage, dégraissage" },
  { op: "0050", t: "Calage pelable, interposition PR 1776 B2, pose des 4 Hi-Lok" },
  { op: "0060", t: "Métallisation : décapage, cosse, mesure < 2,5 mΩ, re-protection" },
  { op: "0070", t: "Montage guignol, serrage axe 17,5 N.m, goupille fendue, vernis témoin" },
  { op: "0080", t: "Contrôle FOD final de la zone plancher mécanique" },
  { op: "0090", t: "Fermeture du capot d'accès plancher" },
];
const QC_EXPECT = { PA: "0090", DI: "0070", FOD: "0080" };
const QC_KINDS = [
  { k: "PA", t: "PA", long: "Point d'arrêt avant l'opération", icon: Stamp },
  { k: "DI", t: "DI", long: "Double contrôle indépendant", icon: UserCheck },
  { k: "FOD", t: "FOD", long: "Contrôle FOD", icon: Eye },
];

function QcStep() {
  const { done, solve, penalize } = useSim();
  const id = "m3.qc";
  const isDone = !!done[id];
  const [marks, setMarks] = useState(() => (isDone ? { "0090:PA": true, "0070:DI": true, "0080:FOD": true } : {}));
  const [issues, setIssues] = useState(done["m3.qc"]?.issues || []);
  const toggle = (op, k) => { if (!isDone) { setIssues([]); setMarks((m) => ({ ...m, [`${op}:${k}`]: !m[`${op}:${k}`] })); } };
  /* Soumission unique à la Qualité : les écarts sont verrouillés et décomptés */
  const validate = () => {
    const out = [];
    const L = "3.3 Contrôles qualité";
    if (!marks["0070:DI"]) out.push({ key: "noDI", pts: 15, grave: true, w: "Pas de double contrôle indépendant sur l'op. 0070", why: "Erreur grave : la liaison commande de vol ATA 67 (axe du guignol, freinage) exige un double contrôle indépendant." });
    if (!marks["0090:PA"]) out.push({ key: "noPA", pts: 10, grave: true, w: "Pas de point d'arrêt avant la fermeture du capot (op. 0090)", why: "Une fois le capot fermé, plus rien n'est contrôlable : la fermeture doit attendre la libération Qualité." });
    if (!marks["0080:FOD"]) out.push({ key: "noFOD", pts: 8, w: "Pas de contrôle FOD final (op. 0080)", why: "Un outil ou une goupille oubliés sous un plancher mécanique peuvent bloquer une commande de vol." });
    QC_OPS.forEach(({ op }) => {
      ["PA", "DI"].forEach((k) => {
        if (marks[`${op}:${k}`] && QC_EXPECT[k] !== op) out.push({ key: `extra${k}${op}`, pts: 3, w: `${k} placé sur l'op. ${op}`, why: k === "DI" ? "Le double contrôle indépendant est réservé à la liaison commande de vol (op. 0070) : ailleurs, il dilue la vigilance et coûte des heures." : "Le point d'arrêt se place juste avant l'opération qui rend la zone inaccessible : la fermeture (op. 0090)." });
      });
    });
    out.forEach((e) => penalize(`${id}:${e.key}`, "a4", e.pts, L, e.w, e.why, !!e.grave));
    setIssues(out);
    if (out.length === 0) solve(id);
    else solve(id, false, { issues: out });
  };
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[14px] leading-relaxed text-ink/90">Placez les contrôles dans la gamme : un <strong>point d'arrêt (PA)</strong> bloque le démarrage de l'opération jusqu'à libération Qualité, le <strong>double contrôle indépendant (DI)</strong> s'applique à la liaison critique, et un <strong>contrôle FOD</strong> final précède la fermeture.</p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[56px_1fr_repeat(3,64px)] items-center gap-2 bg-panel2 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted">
            <span>Op.</span><span>Désignation</span>{QC_KINDS.map((q) => <span key={q.k} className="text-center" title={q.long}>{q.t}</span>)}
          </div>
          {QC_OPS.map((o) => (
            <div key={o.op} className={cx("grid grid-cols-[56px_1fr_repeat(3,64px)] items-center gap-2 border-t border-line px-3 py-2 text-[13px]", marks[`${o.op}:PA`] ? "bg-amber/10" : "bg-bg")}>
              <span className="font-mono font-semibold text-sky">{o.op}</span>
              <span className="text-ink/90">{o.t}</span>
              {QC_KINDS.map((q) => {
                const on = !!marks[`${o.op}:${q.k}`];
                const Icon = q.icon;
                return (
                  <button key={q.k} type="button" onClick={() => toggle(o.op, q.k)} aria-pressed={on} aria-label={`${q.long} sur ${o.op}`}
                    className={cx("mx-auto flex h-9 w-12 items-center justify-center rounded-md border transition", on ? (q.k === "PA" ? "border-amber bg-amber/20 text-amber" : q.k === "DI" ? "border-sky bg-sky/20 text-sky" : "border-ok bg-ok/20 text-ok") : "border-line text-line hover:border-sky/60 hover:text-muted")}>
                    <Icon size={15} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {!isDone && <div><PrimaryButton onClick={validate}><Stamp size={16} /> Soumettre la gamme à la Qualité (définitif)</PrimaryButton></div>}
      {isDone && done[id] !== true && <Feedback ok={false} label="Soumission verrouillée.">Placement attendu : DI sur l'op. 0070 (liaison commande de vol), FOD final sur l'op. 0080, point d'arrêt sur l'op. 0090 avant fermeture du capot.</Feedback>}
      {issues.length > 0 && (
        <div className="flex flex-col gap-2">
          {issues.map((e) => <Feedback key={e.key} ok={false} label={e.grave ? "Erreur grave." : "Non."}>{e.w}. {e.why}</Feedback>)}
        </div>
      )}
      {done[id] === true && <Feedback ok>Gamme acceptée par la Qualité : DI sur la liaison commande de vol, FOD final, point d'arrêt avant fermeture.</Feedback>}
    </div>
  );
}

function GammeSAP() {
  const lines = [
    ["0010", "Contrôler le kit M-BOM au poste ; vérifier la date de péremption du PR 1776 B2", []],
    ["0020", "Refroidir la bague Ø20 p6 au LN₂ (−196 °C, EPI cryogéniques) ; emmancher dans l'alésage Ø20 H7", []],
    ["0030", "Positionner et brider la ferrure ; martyr + aspiration ; percer carbure/PCD à sec ; aléser 4× Ø6,35 H7 ; contrôle tampon", []],
    ["0040", "Démonter ; ébavurer l'aluminium ; nettoyer ; dégraisser au solvant homologué", []],
    ["0050", "Ajuster la cale pelable (jeu résiduel < 0,05) ; interposer PR 1776 B2 ; poser 4 Hi-Lok Ti ; vérifier ED ≥ 15,875", []],
    ["0060", "Décapage calibré ; serrer la cosse ; mesurer au milliohmmètre 4 fils < 2,5 mΩ ; re-protéger (vernis)", []],
    ["0070", "Monter le guignol ; mesurer le running torque (2,5) ; serrer à 15 + 2,5 = 17,5 N.m ; goupille fendue neuve ; vernis témoin", ["DI"]],
    ["0080", "Contrôle FOD final de la zone plancher mécanique", ["FOD"]],
    ["0090", "Fermer le capot d'accès plancher", ["PA"]],
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-panel2 px-4 py-2">
        <FileText size={14} className="text-sky" />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Gamme SAP/MES générée</span>
        <span className="ml-auto truncate font-mono text-[11px] text-ink/80">OF H160-1042 · DWG-H160-67-4022 B</span>
      </div>
      <div className="divide-y divide-line">
        {lines.map(([op, txt, tags]) => (
          <div key={op} className={cx("grid grid-cols-[52px_1fr] gap-3 px-4 py-2 text-[13px]", tags.includes("PA") && "bg-amber/10")}>
            <span className={cx("font-mono font-semibold", tags.includes("PA") ? "text-amber" : "text-sky")}>{op}</span>
            <span className="leading-relaxed text-ink/90">
              {tags.includes("PA") && <span className="mr-2 rounded border border-amber/60 px-1.5 py-0.5 font-mono text-[10px] uppercase text-amber">Point d'arrêt</span>}
              {tags.includes("DI") && <span className="mr-2 rounded border border-sky/60 px-1.5 py-0.5 font-mono text-[10px] uppercase text-sky">Double contrôle</span>}
              {tags.includes("FOD") && <span className="mr-2 rounded border border-ok/60 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ok">FOD</span>}
              {txt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mission3({ goNext }) {
  const { done } = useSim();
  const m = MISSIONS[2];
  return (
    <div className="flex flex-col gap-5">
      <MissionHead m={m}>
        La gamme est le seul document que le compagnon aura sous les yeux. Chaque valeur que vous y écrivez sera appliquée telle quelle sur MSN 1042 : couple, séquence de métallisation, contrôles.
      </MissionHead>
      <StepCard n="3.1" id="m3.couple" axis="a2" title="Couple total à afficher sur la clé (axe du guignol ATA 67)">
        <NumericStep id="m3.couple" axis="a2" label="3.1 Couple total" unit="N.m" digits={1} answer={17.5} tol={0.05} pts={10}
          prompt={<>Couple nominal du plan : <span className="font-mono text-sky">15 N.m</span>. Écrou auto-freiné à créneaux, couple de freinage (running torque) mesuré : <span className="font-mono text-sky">2,5 N.m</span>. Quelle valeur le compagnon doit-il afficher sur la clé dynamométrique ?</>}
          diagnose={(v) => (Math.abs(v - 15) < 0.05 ? "Vous avez oublié le couple de freinage : l'écrou auto-freiné consomme 2,5 N.m avant de mettre l'assemblage en tension. Serré à 15, l'axe serait sous-serré." : Math.abs(v - 12.5) < 0.05 ? "Le couple de freinage s'ajoute, il ne se soustrait pas." : Math.abs(v - 2.5) < 0.05 ? "2,5 N.m est le couple de freinage seul." : "Couple à afficher = couple nominal + couple de freinage mesuré.")}
          explain="15 + 2,5 = 17,5 N.m. Puis goupille fendue neuve et vernis témoin, inscrits dans la même opération." />
      </StepCard>
      <StepCard n="3.2" id="m3.cren" axis="a2" title="Alignement créneau / trou de goupille" locked={!done["m3.couple"]}>
        <SingleChoice id="m3.cren" axis="a2" label="3.2 Alignement créneau" prompt="H160, axe de guignol ATA 67, écrou à créneaux. À 17,5 N.m, aucun créneau de l'écrou n'est aligné avec le trou de goupille du boulon. Que prescrit la gamme ?" options={CREN_OPTS} />
      </StepCard>
      <StepCard n="3.3" id="m3.metal" axis="a2" title="Séquence de métallisation (bonding)" locked={!done["m3.cren"]}>
        <SequenceStep id="m3.metal" axis="a2" label="3.3 Séquence de métallisation" correct={METAL_CORRECT} distractors={METAL_TRAPS}
          prompt="Construisez la séquence de métallisation de la ferrure. Trois cartes sont des pièges." />
      </StepCard>
      <StepCard n="3.4" id="m3.mes" axis="a2" title="Lecture de la mesure de métallisation" locked={!done["m3.metal"]}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-bg px-3 py-2">
            <Cable size={18} className="text-sky" />
            <span className="font-mono text-[12px] uppercase tracking-wider text-muted">Milliohmmètre 4 fils</span>
            <span className="ml-auto font-mono text-2xl font-semibold text-ko tabular-nums">3,1 mΩ</span>
            <span className="font-mono text-[12px] text-muted">exigence &lt; 2,5 mΩ</span>
          </div>
          <SingleChoice id="m3.mes" axis="a2" label="3.4 Mesure métallisation" prompt="H160, métallisation de la ferrure support de guignol, mesure 4 fils (seuil 2,5 mΩ). Lors de la première pose de validation de la gamme, le compagnon relève 3,1 mΩ. Quelle consigne écrivez-vous ?" options={MES_OPTS} />
        </div>
      </StepCard>
      <StepCard n="3.5" id="m3.qc" axis="a4" title="Placement des contrôles qualité" locked={!done["m3.mes"]}><QcStep /></StepCard>
      {missionDone(m, done) && <GammeSAP />}
      <MissionComplete m={m} next="Mission 4 · Alerte FAL" onNext={goNext} />
    </div>
  );
}

/* ============================================================
   MISSION 4 · ALERTE FAL : CALAGE & QN
   ============================================================ */
const LEAF = 0.05, SHIM = 0.8, GAP = 0.35, LEAVES = 16;

function ShimStep() {
  const { done, solve, penalize } = useSim();
  const id = "m4.A";
  const isDone = !!done[id];
  const [peel, setPeel] = useState(done[id] === true ? 9 : done[id]?.peel ?? 0);
  const [res, setRes] = useState(done[id] === true ? "ok" : done[id]?.why ?? null);
  const thick = +(SHIM - peel * LEAF).toFixed(2);
  const resid = +(GAP - thick).toFixed(2);
  const check = () => {
    if (peel === 9) { setRes("ok"); solve(id); return; }
    let why;
    if (thick > GAP) why = `Cale de ${mm(thick)} mm pour un jeu de 0,35 mm : interférence de ${mm(thick - GAP)} mm. Le serrage des Hi-Lok mettrait la ferrure et le carbone sous contrainte.`;
    else why = `Cale de ${mm(thick)} mm : il reste un jeu de ${mm(resid)} mm, qui n'est pas strictement inférieur à 0,05 mm. Le serrage fléchirait la ferrure pour fermer ce jeu.`;
    setRes(why);
    penalize(`${id}:${peel}`, "a3", 8, "4A Calage pelable", `${peel} feuillet${peel > 1 ? "s" : ""} pelé${peel > 1 ? "s" : ""}`, why);
    solve(id, false, { peel, why });
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
      <ShimSVG peeled={peel} gap={GAP} />
      <div className="flex flex-col gap-3">
        <p className="text-[14px] leading-relaxed text-ink/90">Le compagnon mesure au jeu de cales un écart de <span className="font-mono text-sky">0,35 mm</span> sous la ferrure, avant serrage. Vous disposez d'une cale pelable de <span className="font-mono text-sky">0,80 mm</span> à feuillets de <span className="font-mono text-sky">0,05 mm</span>. Combien de feuillets faut-il peler ?</p>
        <Stepper label="Feuillets à peler" value={peel} min={0} max={LEAVES} onChange={(v) => { setPeel(v); setRes(null); }} suffix={`sur ${LEAVES}`} disabled={isDone} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Épaisseur de cale" value={`${mm(thick)} mm`} />
          <Stat label="Jeu résiduel" value={resid >= 0 ? `${mm(resid)} mm` : `−${mm(-resid)} mm`} tone={resid < 0 ? "text-ko" : resid < 0.05 ? "text-ok" : "text-amber"} sub={resid < 0 ? "interférence" : "exigence < 0,05"} />
        </div>
        {!isDone && <div><PrimaryButton onClick={check}><Lock size={16} /> Valider le calage (définitif)</PrimaryButton></div>}
        {res && res !== "ok" && <Feedback ok={false} label="Faux (verrouillé).">{res} Réponse attendue : (0,80 − 0,35) / 0,05 = 9 feuillets.</Feedback>}
        {res === "ok" && <Feedback ok>(0,80 − 0,35) / 0,05 = 9 feuillets. Cale finale 0,35 mm, jeu résiduel nul. On pèle les feuillets un à un sur toute la surface, puis on remesure avant interposition.</Feedback>}
      </div>
    </div>
  );
}

const B1_OPTS = [
  { t: "Bloquer la pièce (étiquette), ne rien poser, ouvrir une QN dans SAP", ok: true, why: "6,48 mm dépasse le maxi de 6,365 mm : la pièce est non conforme. On bloque, on identifie, on trace. Rien n'est posé tant que l'écart n'a pas de disposition." },
  { t: "Poser le Hi-Lok nominal : le collier serti compensera le jeu", grave: true, pts: 20, why: "Erreur grave : un Hi-Lok dans un trou trop grand travaille en matage et en cisaillement dégradé. C'est une liaison structurale qui porte une commande de vol." },
  { t: "Reprendre directement à la cote réparation sans rien déclarer", grave: true, pts: 20, why: "Erreur grave : toute reprise doit être tracée. Une réparation non déclarée rend l'appareil non conforme à sa définition approuvée." },
  { t: "Combler le jeu au mastic PR puis poser le Hi-Lok nominal", grave: true, pts: 15, why: "Erreur grave : le mastic n'a aucune tenue mécanique et ne rattrape pas un défaut d'alésage." },
];
const B3_OPTS = [
  { t: "Non applicable : 16,4 mm < 2,5 × 6,75 = 16,875 mm", ok: true, why: "Le désaxage a rapproché l'axe du bord. Avec la cote réparation, la distance au bord n'est plus garantie : la solution standard est exclue." },
  { t: "Applicable : 16,4 mm > 2,5 × 6,35 = 15,875 mm", pts: 10, why: "15,875 mm est l'exigence pour le Ø6,35 nominal. Avec un Ø6,75 en cote réparation, l'exigence devient 2,5 × 6,75 = 16,875 mm." },
  { t: "Applicable : l'écart de 0,475 mm reste négligeable", grave: true, pts: 12, why: "Erreur grave : une exigence de plan n'a pas de « négligeable ». 16,4 mm < 16,875 mm, c'est non conforme." },
];
const B4_OPTS = [
  { t: "QN au BE (DOA Part-21J) : réparation ou concession, poste bloqué", ok: true, why: "L'organisme de production (POA Part-21G) fabrique selon des données approuvées : il ne peut pas approuver un écart de définition. Seul le BE agréé Part-21J statue." },
  { t: "Le préparateur rédige une dérogation et l'applique au poste", grave: true, pts: 20, why: "Erreur grave : le préparateur n'a aucune autorité de conception. Une dérogation signée au niveau méthodes n'a aucune valeur de navigabilité." },
  { t: "Le chef d'équipe FAL valide une solution d'atelier tracée", grave: true, pts: 18, why: "Erreur grave : l'atelier (Part-21G) ne dispose pas d'une non-conformité de définition. Il trace et transmet." },
  { t: "Rebuter le plancher et recommencer sans ouvrir de QN", pts: 12, why: "Rebuter sans QN fait disparaître l'information : pas d'analyse de cause, pas de traçabilité MSN, et un plancher CFRP peut souvent être réparé par le BE." },
];

function QnForm() {
  const rows = [
    ["Type", "QN interne · non-conformité de fabrication"],
    ["Article", "Plancher mécanique CFRP / ferrure H160-67-4022-001"],
    ["Effectivité", "H160 MSN 1042 · Zone 200 · ATA 53 / 67"],
    ["Défaut", "Alésage Hi-Lok n°3 Ø6,48 mm (maxi 6,365) · désaxage perceuse"],
    ["Analyse", "Oversize Ø6,75 → ED requise 16,875 mm > ED réelle 16,4 mm"],
    ["Disposition", "Transmise au BE (DOA Part-21J) · repair / concession"],
    ["Statut", "Poste bloqué · produit identifié · en attente BE"],
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-amber/50 bg-bg">
      <div className="flex items-center gap-2 border-b border-amber/40 bg-amber/10 px-4 py-2">
        <FileWarning size={15} className="text-amber" />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber">SAP QM · Quality Notification</span>
        <span className="ml-auto font-mono text-[11px] text-ink">QN 2026-1042-0007</span>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[100px_1fr] gap-3 border-t border-line px-4 py-1.5 text-[13px]">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">{k}</span>
          <span className="text-ink/90">{v}</span>
        </div>
      ))}
    </div>
  );
}

function Mission4({ goNext }) {
  const { done } = useSim();
  const m = MISSIONS[3];
  const openCount = ["m4.A", "m4.B4"].filter((s) => !done[s]).length;
  return (
    <div className="flex flex-col gap-5">
      <div className={cx("flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3", openCount ? "border-ko bg-ko/15" : "border-ok/50 bg-ok/10")}>
        <span className={cx("flex h-10 w-10 items-center justify-center rounded-lg", openCount ? "bg-ko text-bg mes-blink" : "bg-ok text-bg")}>
          {openCount ? <Siren size={20} /> : <ShieldCheck size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className={cx("font-mono text-[11px] uppercase tracking-[0.16em]", openCount ? "text-ko" : "text-ok")}>Terminal MES · FAL H160 · Poste plancher mécanique · MSN 1042</div>
          <div className="font-display text-xl font-semibold text-ink">{openCount ? `Alerte rouge : ${openCount} événement${openCount > 1 ? "s" : ""} ouvert${openCount > 1 ? "s" : ""} sur le poste` : "Événements traités : poste sous contrôle"}</div>
        </div>
      </div>
      <MissionHead m={m} tone="red">
        Le compagnon vous appelle au poste. Deux événements bloquent le montage. Traitez-les dans l'ordre que vous voulez, mais traitez-les selon les règles.
      </MissionHead>
      <StepCard n="A" id="m4.A" axis="a3" title="Problème A · Accostage : calcul du calage pelable"><ShimStep /></StepCard>

      <Panel className="flex flex-col gap-4 border-ko/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-7 min-w-[38px] items-center justify-center rounded-md border border-ko/50 bg-ko/10 px-1.5 font-mono text-[12px] font-semibold text-ko">B</span>
          <h3 className="font-display text-xl font-semibold text-ink">Problème B · Non-conformité d'alésage</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Alésage" value="Ø6,35 H7" sub="Hi-Lok n°3" />
          <Stat label="Tolérance maxi" value="6,365" sub="mm" />
          <Stat label="Mesuré au tampon" value="6,48" tone="text-ko" sub="mm · désaxage perceuse" />
          <Stat label="ED réelle relevée" value="16,4" tone="text-amber" sub="mm (plan : 17,0)" />
        </div>
        <StepCard n="B1" id="m4.B1" axis="a4" title="Action immédiate au poste">
          <SingleChoice id="m4.B1" axis="a4" label="4B1 Action immédiate" prompt="H160, FAL, poste jonction plancher, alésage Ø6,35 H7 (maxi 6,365 mm). Le trou n°3 mesure 6,48 mm. Que faites-vous en premier ?" options={B1_OPTS} />
        </StepCard>
        <StepCard n="B2" id="m4.B2" axis="a3" title="Cote réparation (oversize) : distance au bord exigée" locked={!done["m4.B1"]}>
          <NumericStep id="m4.B2" axis="a3" label="4B2 ED oversize" unit="mm" digits={3} answer={16.875} tol={0.006}
            prompt={<>La première cote réparation standard du Hi-Lok est <span className="font-mono text-sky">Ø6,75 mm</span> (+1/64 in). Quelle distance au bord minimale faut-il alors respecter, toujours à <span className="font-mono text-sky">2,5D</span> ?</>}
            diagnose={(v) => (Math.abs(v - 15.875) < 0.05 ? "15,875 mm est l'exigence pour le diamètre nominal. L'exigence se recalcule avec le diamètre de la fixation réellement posée." : Math.abs(v - 16.2) < 0.05 ? "Vous avez pris le diamètre mesuré (6,48). La fixation posée sera au Ø6,75 de la cote réparation." : "ED = 2,5 × diamètre de la fixation en cote réparation.")}
            explain="2,5 × 6,75 = 16,875 mm. À comparer avec la distance au bord réellement relevée sur le trou désaxé." />
        </StepCard>
        <StepCard n="B3" id="m4.B3" axis="a4" title="Verdict sur la solution standard" locked={!done["m4.B2"]}>
          <SingleChoice id="m4.B3" axis="a4" label="4B3 Verdict oversize" prompt="H160, plancher CFRP, reprise standard en Ø6,75 (ED ≥ 2,5D). L'axe du trou désaxé est relevé à 16,4 mm du bord. La cote réparation standard est-elle applicable ?" options={B3_OPTS} />
        </StepCard>
        <StepCard n="B4" id="m4.B4" axis="a4" title="Disposition réglementaire (EASA Part-21)" locked={!done["m4.B3"]}>
          <SingleChoice id="m4.B4" axis="a4" label="4B4 Disposition Part-21" prompt="H160, QN ouverte sur le plancher CFRP, réparation standard exclue. Qui peut statuer, et comment ?" options={B4_OPTS} />
        </StepCard>
        {done["m4.B4"] && <QnForm />}
      </Panel>

      <DangerBox title="Au poste, le préparateur ne « sauve » pas une pièce : il protège l'appareil">
        Bloquer, identifier, tracer, transmettre. Une QN bien ouverte, c'est une heure perdue. Une non-conformité cachée sur une liaison commande de vol, c'est un appareil non navigable.
      </DangerBox>
      <MissionComplete m={m} next="Mission 5 · Débriefing" onNext={goNext} />
    </div>
  );
}

/* ============================================================
   MISSION 5 · DÉBRIEFING & CERTIFICAT
   ============================================================ */
const levelOf = (g) => (g >= 85 ? { t: "Valide", tone: C.ok } : { t: "À revoir", tone: C.ko });
const hashCode = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h.toString(36).toUpperCase().padStart(6, "0").slice(-6); };

function Certificate({ name, gauge, axes, errors }) {
  const lvl = levelOf(gauge);
  const granted = gauge >= 85;
  const date = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const num = `AH-PMA-4B-${hashCode(name + date)}`;
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 p-5 sm:p-6" style={{ borderColor: granted ? C.sky : C.amber, background: `linear-gradient(135deg, ${C.panel} 0%, ${C.bg} 60%, #0e1b33 100%)` }}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full" style={{ background: `radial-gradient(circle, ${granted ? C.sky : C.amber}33, transparent 70%)` }} />
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border" style={{ borderColor: granted ? C.sky : C.amber, color: granted ? C.sky : C.amber }}>
            <BadgeCheck size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Carte d'habilitation pédagogique</div>
            <div className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">Préparateur Méthodes Assemblage — Standard Airbus Helicopters</div>
          </div>
          <span className="rounded-md border px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider" style={{ borderColor: granted ? C.ok : C.amber, color: granted ? C.ok : C.amber }}>
            {granted ? "Délivrée" : "Ajournée"}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Titulaire</span>
            <span className="font-display text-3xl font-semibold leading-none text-ink">{name}</span>
            <span className="mt-2 text-[13px] text-ink/80">Étude de cas H160 MSN 1042 · DWG-H160-67-4022 Ind. B · Ferrure support de guignol ATA 67 sur plancher CFRP</span>
          </div>
          <div className="flex flex-col items-center">
            <GaugeArc value={gauge} size={150} />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider" style={{ color: lvl.tone }}>{lvl.t}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(AXES).map(([k, a]) => (
            <div key={k} className="rounded-lg border border-line bg-bg/60 px-3 py-2">
              <div className="text-[11px] leading-tight text-muted">{a.short}</div>
              <div className="font-mono text-lg font-semibold tabular-nums" style={{ color: gaugeTone(axes[k]) }}>{axes[k]} %</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-line pt-3 font-mono text-[11px] text-muted">
          <span>N° {num}</span>
          <span>Délivrée le {date}</span>
          <span>{errors} erreur{errors > 1 ? "s" : ""} corrigée{errors > 1 ? "s" : ""}</span>
          <span className="inline-flex items-center gap-1"><Fingerprint size={12} /> Module 4B · Simulateur final</span>
        </div>
        <p className="text-[11px] leading-relaxed text-muted">Document pédagogique de formation. Il ne constitue ni une habilitation réglementaire, ni une autorisation de travail sur aéronef.</p>
      </div>
    </div>
  );
}

function Debrief({ gauge, axes, errorsList, onRestart, blockReason }) {
  const { st, setName, showCard } = useSim();
  const { defaultName } = useSim();
  const [draft, setDraft] = useState(st.name || defaultName || "");
  const [confirmReset, setConfirmReset] = useState(false);
  const lvl = levelOf(gauge);
  const grouped = Object.keys(AXES).map((k) => ({ k, list: errorsList.filter((e) => e.axis === k) }));
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Award} kicker="Mission 5 / 5 · Débriefing général" title="Bilan de compétences et certification">
        Voici la lecture de votre parcours sur MSN 1042 : la crédibilité finale, la maîtrise sur chacun des 4 axes, et toutes les erreurs que vous avez commises puis corrigées.
      </SectionHead>
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <Panel className="flex flex-col items-center gap-2 p-5">
          <Eyebrow>Crédibilité industrielle & navigabilité</Eyebrow>
          <GaugeArc value={gauge} size={240} />
          <span className="font-display text-2xl font-semibold" style={{ color: lvl.tone }}>{lvl.t}</span>
          <span className="text-center text-[13px] text-muted">{errorsList.length} erreur{errorsList.length > 1 ? "s" : ""} · {errorsList.filter((e) => e.grave).length} grave{errorsList.filter((e) => e.grave).length > 1 ? "s" : ""}</span>
        </Panel>
        <Panel className="flex flex-col gap-4 p-5">
          <Eyebrow>Bilan sur 4 axes</Eyebrow>
          {Object.entries(AXES).map(([k, a]) => {
            const Icon = a.icon;
            const v = axes[k];
            return (
              <div key={k} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Icon size={15} className="text-sky" />
                  <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{a.long}</span>
                  <span className="font-mono text-[15px] font-semibold tabular-nums" style={{ color: gaugeTone(v) }}>{v} %</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full" style={{ width: `${v}%`, background: gaugeTone(v), transition: "width .8s ease" }} />
                </div>
              </div>
            );
          })}
        </Panel>
      </div>

      <Panel className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-sky" />
          <h3 className="font-display text-xl font-semibold text-ink">Récapitulatif des erreurs corrigées</h3>
        </div>
        {errorsList.length === 0 && <Feedback ok label="Parcours sans faute.">Aucune erreur enregistrée sur les 4 missions. Rigueur exemplaire.</Feedback>}
        {grouped.filter((g) => g.list.length).map((g) => (
          <div key={g.k} className="flex flex-col gap-2">
            <Eyebrow tone="amber">{AXES[g.k].long}</Eyebrow>
            {g.list.map((e) => (
              <div key={e.key} className={cx("rounded-lg border p-3 text-[13px] leading-relaxed", e.grave ? "border-ko/50 bg-ko/10" : "border-line bg-bg")}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-sky">{e.step}</span>
                  {e.grave && <span className="rounded border border-ko/60 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ko">Grave</span>}
                  <span className="ml-auto font-mono text-[12px] font-semibold text-ko">−{e.pts}</span>
                </div>
                <div className="mt-1 text-ink"><XCircle size={13} className="mr-1 inline text-ko" />{e.wrong}</div>
                <div className="mt-1 text-ink/80"><CheckCircle2 size={13} className="mr-1 inline text-ok" />{e.fix}</div>
              </div>
            ))}
          </div>
        ))}
      </Panel>

      <Panel className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <BadgeCheck size={18} className="text-sky" />
          <h3 className="font-display text-xl font-semibold text-ink">Votre carte d'habilitation pédagogique</h3>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[240px] flex-1 flex-col gap-1">
            <span className="text-[12px] text-muted">Nom et prénom</span>
            <input type="text" value={draft} maxLength={48} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && draft.trim() && (setName(draft.trim()), showCard())}
              placeholder="ex. Camille Martin" className="h-11 rounded-lg border border-line bg-bg px-3 text-[15px] text-ink outline-none focus:border-sky" />
          </label>
          <PrimaryButton onClick={() => { setName(draft.trim()); showCard(); }} disabled={!draft.trim()}><Award size={16} /> Éditer ma carte</PrimaryButton>
        </div>
        {st.cardShown && st.name && <Certificate name={st.name} gauge={gauge} axes={axes} errors={errorsList.length} />}
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        {!onRestart ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber/50 bg-amber/10 px-3 py-2 text-[13px] text-ink"><Lock size={16} className="text-amber" />{blockReason || "Nouvelle tentative non autorisée."}</div>
        ) : !confirmReset ? (
          <PrimaryButton tone="amber" onClick={() => setConfirmReset(true)}><RotateCcw size={16} /> Nouvelle tentative (tout recommencer)</PrimaryButton>
        ) : (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber/50 bg-amber/10 px-3 py-2 text-[13px] text-ink">
            <AlertTriangle size={16} className="text-amber" />
            Toute la progression et la carte seront effacées.
            <PrimaryButton tone="red" onClick={onRestart}>Confirmer</PrimaryButton>
            <GhostButton onClick={() => setConfirmReset(false)}>Annuler</GhostButton>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   APPLICATION
   ============================================================ */
const STAGES = [
  { id: "brief", short: "Briefing", n: "0", icon: Navigation },
  ...MISSIONS.map((m) => ({ id: m.id, short: m.short, n: m.n, icon: m.icon })),
  { id: "debrief", short: "Débriefing", n: "5", icon: Award },
];

export default function App({ onSaveScore, onBack, student } = {}) {
  const [st, setSt] = useState(() => loadState());
  const [dossier, setDossier] = useState(false);
  const [toast, setToast] = useState(null);
  const [flash, setFlash] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const errRef = useRef(st.errors);
  errRef.current = st.errors;
  const timer = useRef(null);
  useEffect(() => saveState(st), [st]);

  /* solve(id) : étape réussie ; solve(id, false, détail) : étape close sur une erreur verrouillée */
  const solve = (id, ok = true, detail = {}) => setSt((s) => (s.done[id] ? s : { ...s, done: { ...s.done, [id]: ok ? true : { ko: true, ...detail } } }));
  const session = useModuleSession();
  const penalize = (key, axis, pts, step, wrong, fix, grave = false) => {
    if (errRef.current[key]) return;
    errRef.current = { ...errRef.current, [key]: true };
    setSt((s) => (s.errors[key] ? s : { ...s, errors: { ...s.errors, [key]: { key, axis, pts, step, wrong, fix, grave, t: Date.now() } } }));
    setToast({ pts, grave, step, id: key });
    setFlash(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setToast(null); setFlash(false); }, 2800);
  };
  const setName = (name) => setSt((s) => ({ ...s, name }));
  const showCard = () => setSt((s) => ({ ...s, cardShown: true }));

  const errorsList = Object.values(st.errors).sort((a, b) => a.t - b.t);
  const total = errorsList.reduce((a, e) => a + e.pts, 0);
  const gauge = Math.max(0, 100 - total);
  const axes = Object.fromEntries(Object.keys(AXES).map((k) => [k, Math.max(0, Math.round(100 - 2 * errorsList.filter((e) => e.axis === k).reduce((a, e) => a + e.pts, 0)))]));

  const unlocked = (id) => {
    if (id === "brief" || id === "m1") return true;
    if (id === "debrief") return MISSIONS.every((m) => missionDone(m, st.done));
    const i = MISSIONS.findIndex((m) => m.id === id);
    return missionDone(MISSIONS[i - 1], st.done);
  };
  const stageDone = (id) => (id === "brief" ? Object.keys(st.done).length > 0 : id === "debrief" ? !!st.cardShown : missionDone(MISSIONS.find((m) => m.id === id), st.done));
  const go = (id) => {
    if (!unlocked(id)) return;
    setSt((s) => ({ ...s, stage: id }));
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { /* sans effet */ }
  };
  const restart = () => {
    setSt(INITIAL);
    errRef.current = {};
    setResetKey((k) => k + 1);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { /* sans effet */ }
  };
  const missionsDone = MISSIONS.filter((m) => missionDone(m, st.done)).length;
  const stage = unlocked(st.stage) ? st.stage : "brief";
  const gutter = { paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" };
  const defaultName = student ? `${student.prenom} ${student.nom}`.trim() : "";
  const ctx = { st, done: st.done, solve, penalize, setName, showCard, defaultName };
  /* Pont LMS : la jauge finale est transmise au portail dès que les 4 missions sont bouclées (une fois par parcours) */
  const allMissionsDone = MISSIONS.every((m) => missionDone(m, st.done));
  useEffect(() => {
    if (!allMissionsDone || st.scoreSent) return;
    const s100 = trunc1(gauge);
    if (onSaveScore) onSaveScore(s100, {
      kind: "sprint", atelierId: "simulateur-final", label: "Simulateur final H160 : jauge de crédibilité", score: s100,
      total: MISSIONS.reduce((n, m) => n + m.steps.length, 0),
      good: MISSIONS.reduce((n, m) => n + m.steps.filter((x) => st.done[x] === true).length, 0),
      statut: s100 >= 85 ? "VALIDE" : "À REVOIR",
      answers: errorsList.map((e) => ({ q: e.step, choix: e.wrong, bonne: e.fix, ok: false, detail: `−${e.pts} pts${e.grave ? " (erreur grave)" : ""}` })),
    });
    setSt((s) => ({ ...s, scoreSent: true }));
  }, [allMissionsDone, st.scoreSent]);

  return (
    <SimCtx.Provider value={ctx}>
      <div className="min-h-full bg-bg text-ink">
        <header className="sticky z-20 border-b border-line bg-bg/95 backdrop-blur" style={{ top: "env(safe-area-inset-top, 0px)" }}>
          <div className="mx-auto flex max-w-6xl flex-col gap-3 py-3" style={gutter}>
            <div className="flex flex-wrap items-center gap-3">
            {onBack && <BackToPortal onBack={onBack} />}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky/50 bg-sky/10"><Target size={18} className="text-sky" /></div>
              <div className="min-w-[220px] flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Bureau des Méthodes · Airbus Helicopters · Module 4B · Simulateur final</div>
                <h1 className="font-display text-xl font-semibold leading-none text-ink sm:text-2xl">Mission Industrialisation FAL · H160 MSN 1042</h1>
              </div>
              <div className="flex items-center gap-2">
                <GaugeMini value={gauge} flash={flash} />
                <button type="button" onClick={() => setDossier(true)} className="inline-flex h-11 items-center gap-2 rounded-lg border border-sky/50 bg-sky/10 px-3 text-[13px] font-semibold text-ink hover:bg-sky/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky">
                  <FolderOpen size={16} className="text-sky" /> <span className="hidden sm:inline">Dossier technique</span><span className="sm:hidden">Dossier</span>
                </button>
              </div>
            </div>
            <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5" aria-label="Missions">
              {STAGES.map((s) => {
                const Icon = s.icon;
                const active = s.id === stage;
                const ok = s.id !== "brief" && stageDone(s.id);
                const open = unlocked(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => go(s.id)} disabled={!open}
                    className={cx("flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
                      active ? (s.id === "m4" ? "border-ko bg-ko/15 text-ink" : "border-sky bg-sky/15 text-ink") : open ? "border-transparent text-muted hover:bg-panel hover:text-ink" : "cursor-not-allowed border-transparent text-line")}>
                    <span className={cx("flex h-5 w-5 items-center justify-center rounded font-mono text-[11px]", ok ? "bg-ok text-bg" : active ? "bg-sky text-bg" : open ? "bg-line text-ink" : "bg-panel text-muted")}>
                      {ok ? <CheckCircle2 size={12} /> : !open ? <Lock size={10} /> : s.n}
                    </span>
                    <Icon size={14} className="hidden sm:block" />
                    {s.short}
                  </button>
                );
              })}
              <span className="ml-auto hidden shrink-0 items-center px-2 font-mono text-[11px] text-muted md:flex">{missionsDone}/4 missions</span>
            </nav>
          </div>
        </header>

        <main key={resetKey} className="mx-auto max-w-6xl py-6" style={gutter}>
          {stage === "brief" && <Briefing started={Object.keys(st.done).length > 0} onStart={() => go(MISSIONS.find((m) => !missionDone(m, st.done))?.id || "debrief")} />}
          {stage === "m1" && <Mission1 goNext={() => go("m2")} />}
          {stage === "m2" && <Mission2 goNext={() => go("m3")} />}
          {stage === "m3" && <Mission3 goNext={() => go("m4")} />}
          {stage === "m4" && <Mission4 goNext={() => go("debrief")} />}
          {stage === "debrief" && <Debrief gauge={gauge} axes={axes} errorsList={errorsList} onRestart={session.canAttempt ? restart : null} blockReason={session.blockReason} />}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <button type="button" onClick={() => setDossier(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
              <FolderOpen size={14} /> Ouvrir le dossier technique
            </button>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Progression enregistrée sur cet appareil</span>
          </div>
        </main>

        <DossierDrawer open={dossier} onClose={() => setDossier(false)} />

        <div className={cx("pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 transition-all duration-300", toast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")} style={{ bottom: "max(20px, env(safe-area-inset-bottom, 0px))" }} role="status" aria-live="polite">
          {toast && (
            <div className={cx("flex max-w-md items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl", toast.grave ? "border-ko bg-[#2a1018]" : "border-amber bg-[#2a1f0b]")}>
              {toast.grave ? <ShieldAlert size={20} className="shrink-0 text-ko" /> : <AlertTriangle size={20} className="shrink-0 text-amber" />}
              <div className="min-w-0">
                <div className={cx("font-mono text-[11px] uppercase tracking-wider", toast.grave ? "text-ko" : "text-amber")}>{toast.grave ? "Erreur grave" : "Erreur"} · {toast.step}</div>
                <div className="text-[13px] text-ink">Crédibilité <span className="font-mono font-semibold text-ko">−{toast.pts}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimCtx.Provider>
  );
}
