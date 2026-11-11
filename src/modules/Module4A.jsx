import React, { useState, useEffect } from "react";
import BackToPortal from "../lms/BackToPortal.jsx";
import { scopedKey } from "../lms/session.js";
import {
  Layers, Wrench, Zap, Eye, Trophy, ShieldCheck, ShieldAlert,
  CheckCircle2, XCircle, Flame, RotateCcw, ChevronRight, Gauge, AlertTriangle, Info,
  ClipboardList, FileText, Ruler, Award, ArrowRight, Search, Scale, Lock, Unlock, Target,
  Stamp, Flashlight, Boxes, FileWarning, Calculator, Crosshair, Hammer,
} from "lucide-react";

/* ============================================================
   MODULE 4A · Lecture de plans avancée, ajustements ISO,
   tolérancement géométrique (ISO GPS) & chaînes de cotes
   Airbus Helicopters · Préparateur Méthodes Assemblage
   ============================================================ */
/* ============================================================
   UTILITAIRES
   ============================================================ */
const STORAGE_KEY = "prep-methodes-ah-m4a-v1";
const loadProgress = () => {
  try {
    const raw = window.localStorage.getItem(scopedKey(STORAGE_KEY));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};
const saveProgress = (p) => {
  try {
    window.localStorage.setItem(scopedKey(STORAGE_KEY), JSON.stringify(p));
  } catch (e) {
    /* stockage indisponible : la progression reste en mémoire */
  }
};
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const cx = (...c) => c.filter(Boolean).join(" ");
const fmt = (n) => (n > 0 ? "+" : "") + n.toLocaleString("fr-FR");

/* ============================================================
   BRIQUES D'INTERFACE
   ============================================================ */
function Panel({ children, className = "" }) {
  return <div className={cx("rounded-xl border border-line bg-panel", className)}>{children}</div>;
}

function Eyebrow({ children, tone = "blue" }) {
  const tones = { blue: "text-sky", amber: "text-amber", green: "text-ok", red: "text-ko" };
  return <div className={cx("font-mono text-[11px] uppercase tracking-[0.14em]", tones[tone])}>{children}</div>;
}

function SectionHead({ icon: Icon, kicker, title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-sky" />}
        <Eyebrow>{kicker}</Eyebrow>
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

function Chip({ active, onClick, children, tone = "blue", disabled }) {
  const on = {
    blue: "border-sky bg-sky/15 text-ink",
    amber: "border-amber bg-amber/15 text-ink",
    green: "border-ok bg-ok/15 text-ink",
    red: "border-ko bg-ko/15 text-ink",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "rounded-lg border px-3 py-2 text-left text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
        active ? on[tone] : "border-line bg-panel2 text-ink/80 hover:border-sky/60 hover:text-ink",
        disabled && "cursor-default opacity-90"
      )}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ onClick, children, disabled, tone = "blue" }) {
  const t = tone === "green" ? "bg-ok text-bg hover:bg-ok/90" : tone === "amber" ? "bg-amber text-bg hover:bg-amber/90" : "bg-sky text-bg hover:bg-sky/90";
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

function ValidatedBanner({ done, label }) {
  if (!done) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ok/50 bg-ok/10 px-4 py-3 text-sm text-ink">
      <ShieldCheck size={18} className="text-ok" />
      <span><strong className="font-semibold">Onglet validé.</strong> {label}</span>
    </div>
  );
}

/* QCM court réutilisable pour valider un onglet */
function QuickCheck({ title, questions, onComplete }) {
  const [picked, setPicked] = useState({});
  const [perms] = useState(() => questions.map((q) => shuffle(q.options.map((_, k) => k))));
  const allGood = questions.every((q, i) => picked[i] === q.answer);
  useEffect(() => {
    if (allGood) onComplete();
  }, [allGood]);
  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardList size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        <span className="ml-auto font-mono text-xs text-muted">
          {questions.filter((q, i) => picked[i] === q.answer).length}/{questions.length} validées
        </span>
      </div>
      <div className="flex flex-col gap-5">
        {questions.map((q, i) => {
          const p = picked[i];
          const answered = p !== undefined;
          const good = p === q.answer;
          return (
            <div key={i} className="flex flex-col gap-2">
              <div className="text-[15px] font-medium text-ink">{i + 1}. {q.q}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {perms[i].map((k) => [q.options[k], k]).map(([o, k]) => (
                  <Chip
                    key={k}
                    active={p === k}
                    tone={p === k ? (good ? "green" : "red") : "blue"}
                    disabled={good}
                    onClick={() => !good && setPicked({ ...picked, [i]: k })}
                  >
                    {o}
                  </Chip>
                ))}
              </div>
              {answered && (
                <div className={cx("rounded-lg border px-3 py-2 text-[13px] leading-relaxed", good ? "border-ok/40 bg-ok/10 text-ink" : "border-ko/40 bg-ko/10 text-ink")}>
                  {good ? <strong className="text-ok">Exact. </strong> : <strong className="text-ko">Non, recommence. </strong>}
                  {good ? q.why : q.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ============================================================
   BRIQUES COMMUNES (reprises du Module 3)
   ============================================================ */
function RuleCard({ n, title, icon: Icon, tone = "blue", children }) {
  const t = { blue: "text-sky border-sky/40 bg-sky/10", amber: "text-amber border-amber/40 bg-amber/10", red: "text-ko border-ko/40 bg-ko/10", green: "text-ok border-ok/40 bg-ok/10" }[tone];
  return (
    <Panel className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <span className={cx("flex h-7 min-w-[28px] items-center justify-center rounded-md border px-1 font-mono text-[12px] font-semibold", t)}>
          {Icon ? <Icon size={14} /> : n}
        </span>
        <div className="font-display text-lg font-semibold leading-tight text-ink">{title}</div>
      </div>
      <div className="text-[14px] leading-relaxed text-ink/85">{children}</div>
    </Panel>
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

/* Extrait de gamme de fabrication, présenté comme sur le document papier */
function GammeExtract({ title, lines }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg">
      <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-2">
        <FileText size={14} className="text-sky" />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Extrait de gamme</span>
        <span className="ml-auto truncate font-mono text-[11px] text-ink/80">{title}</span>
      </div>
      <div className="divide-y divide-line">
        {lines.map((l, i) => (
          <div key={i} className={cx("grid grid-cols-[56px_1fr] gap-3 px-4 py-2 text-[13px]", l.stop && "bg-amber/10")}>
            <span className={cx("font-mono font-semibold", l.stop ? "text-amber" : "text-sky")}>{l.op}</span>
            <span className="leading-relaxed text-ink/90">
              {l.stop && <span className="mr-2 rounded border border-amber/60 px-1.5 py-0.5 font-mono text-[10px] uppercase text-amber">Point d'arrêt</span>}
              {l.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, unit, display }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] text-muted">{label}</span>
        <span className="font-mono text-[15px] font-semibold text-ink tabular-nums">{display ?? value}{unit && <span className="ml-1 text-muted">{unit}</span>}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#3b9eff]" />
    </label>
  );
}

function Toggle({ on, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={cx("flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
        on ? "border-ok bg-ok/10 text-ink" : "border-line bg-panel2 text-ink/80 hover:border-sky/60")}>
      <span className={cx("flex h-4 w-4 shrink-0 items-center justify-center rounded border", on ? "border-ok bg-ok text-bg" : "border-muted")}>
        {on && <CheckCircle2 size={12} />}
      </span>
      {children}
    </button>
  );
}

const mm = (n, d = 2) => n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
/* ============================================================
   BRIQUES SPÉCIFIQUES MODULE 3
   ============================================================ */
function NoteBox({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-line bg-panel2 px-3 py-2 text-[12px] leading-relaxed text-muted">
      <Info size={14} className="mt-0.5 shrink-0 text-sky" />
      <span>{children}</span>
    </div>
  );
}

function Feedback({ ok, children }) {
  return (
    <div className={cx("rounded-lg border px-3 py-2 text-[13px] leading-relaxed text-ink", ok ? "border-ok/40 bg-ok/10" : "border-ko/40 bg-ko/10")}>
      {ok ? <strong className="text-ok">Exact. </strong> : <strong className="text-ko">Non. </strong>}
      {children}
    </div>
  );
}

/* Choix unique à options mélangées, réutilisé dans les ateliers */
function ChoiceStep({ options, answer, picked, onPick, locked }) {
  const [perm] = useState(() => shuffle(options.map((_, k) => k)));
  return (
    <div className="flex flex-col gap-2">
      {perm.map((k) => {
        const isPicked = picked === k;
        const good = isPicked && k === answer;
        return (
          <button key={k} type="button" disabled={locked} onClick={() => onPick(k)}
            className={cx("flex items-start gap-3 rounded-lg border p-3 text-left text-[14px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
              isPicked ? (good ? "border-ok bg-ok/10 text-ink" : "border-ko bg-ko/10 text-ink") : locked ? "border-line bg-bg text-muted" : "border-line bg-bg text-ink hover:border-sky/70")}>
            <span className="min-w-0 flex-1">{options[k].t}</span>
            {isPicked && (good ? <CheckCircle2 size={18} className="shrink-0 text-ok" /> : <XCircle size={18} className="shrink-0 text-ko" />)}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   BRIQUES SPÉCIFIQUES MODULE 4A
   ============================================================ */
const mm3 = (n) => mm(n, 3);

/* Symboles ISO 1101 dessinés en SVG (les polices ne les ont pas toutes) */
function GdtSym({ kind, size = 18 }) {
  const s = { stroke: "currentColor", strokeWidth: 1.6, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="inline-block shrink-0">
      {kind === "flat" && <path d="M6 6 H18 L14 14 H2 Z" {...s} />}
      {kind === "cyl" && (<><circle cx="10" cy="10" r="4.5" {...s} /><path d="M3 17 L9 3 M11 17 L17 3" {...s} /></>)}
      {kind === "perp" && <path d="M10 3 V16 M3 16 H17" {...s} />}
      {kind === "para" && <path d="M5 16 L10 4 M10 16 L15 4" {...s} />}
      {kind === "pos" && (<><circle cx="10" cy="10" r="5" {...s} /><path d="M10 2 V18 M2 10 H18" {...s} /></>)}
      {kind === "coax" && (<><circle cx="10" cy="10" r="3" {...s} /><circle cx="10" cy="10" r="7" {...s} /></>)}
    </svg>
  );
}

function Mmc() {
  return <span className="mx-0.5 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-current font-mono text-[10px] font-semibold leading-none">M</span>;
}

/* Cadre de tolérance cliquable */
function ToleranceFrame({ cells, active, onPick }) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border-2 border-ink/80 bg-bg font-mono text-[15px] text-ink">
      {cells.map((c, i) => (
        <button key={c.id} type="button" onClick={() => onPick && onPick(c.id)}
          className={cx("flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 px-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
            i > 0 && "border-l-2 border-ink/80", active === c.id ? "bg-sky/25 text-ink" : onPick ? "hover:bg-panel2" : "")}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

/* Champ numérique +/- (pas tactile) */
function Stepper({ value, min, max, onChange, label, suffix }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="h-10 w-10 rounded-lg border border-line bg-panel2 font-mono text-lg text-ink hover:border-sky/60" aria-label="Moins">−</button>
        <span className="min-w-[64px] text-center font-mono text-2xl font-semibold text-ink tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="h-10 w-10 rounded-lg border border-line bg-panel2 font-mono text-lg text-ink hover:border-sky/60" aria-label="Plus">+</button>
        {suffix && <span className="text-[13px] text-muted">{suffix}</span>}
      </div>
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

/* ============================================================
   ONGLET 1 · LECTURE DE PLAN AÉRONAUTIQUE
   ============================================================ */
function ProjectionSVG({ mode }) {
  /* Disposition des vues autour de la vue de face */
  const first = mode === "E";
  const box = (x, y, label, hi) => (
    <g>
      <rect x={x} y={y} width="86" height="56" rx="6" fill={hi ? "rgba(59,158,255,0.16)" : "#0f1729"} stroke={hi ? "#3b9eff" : "#22304d"} strokeWidth="1.5" />
      <text x={x + 43} y={y + 33} textAnchor="middle" fill="#e6edf7" fontSize="11" fontFamily="Barlow, sans-serif">{label}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 300 210" className="h-auto w-full max-w-[320px]" role="img" aria-label={first ? "Disposition des vues en projection européenne" : "Disposition des vues en projection américaine"}>
      {box(107, 77, "Vue de face", true)}
      {box(first ? 207 : 7, 77, "Vue de gauche")}
      {box(first ? 7 : 207, 77, "Vue de droite")}
      {box(107, first ? 147 : 7, "Vue de dessus")}
      {box(107, first ? 7 : 147, "Vue de dessous")}
    </svg>
  );
}

function CountersinkSVG({ far }) {
  /* Coupe de deux tôles : fraisage côté vue (proche) ou côté opposé */
  const topY = 60, midY = 86, botY = 112;
  const cs = far
    ? `M120 ${botY} L136 ${botY - 14} L136 ${topY} L156 ${topY} L156 ${botY - 14} L172 ${botY} Z`
    : `M120 ${topY} L136 ${topY + 14} L136 ${botY} L156 ${botY} L156 ${topY + 14} L172 ${topY} Z`;
  return (
    <svg viewBox="0 0 300 160" className="h-auto w-full max-w-[420px]" role="img" aria-label={far ? "Fraisage côté opposé à la vue" : "Fraisage côté vue"}>
      <text x="150" y="20" textAnchor="middle" fill="#3b9eff" fontSize="11" fontFamily="JetBrains Mono, monospace">▼ SENS DE LA VUE DU PLAN</text>
      <text x="22" y="48" fill="#8fa0bd" fontSize="10" fontFamily="Barlow, sans-serif">Côté vue (proche, near side)</text>
      <text x="22" y="132" fill="#8fa0bd" fontSize="10" fontFamily="Barlow, sans-serif">Côté opposé (far side)</text>
      <rect x="20" y={topY} width="260" height={midY - topY} fill="#1b2a47" stroke="#22304d" />
      <rect x="20" y={midY} width="260" height={botY - midY} fill="#16233d" stroke="#22304d" />
      <path d={cs} fill="#ffb020" fillOpacity="0.85" stroke="#ffb020" />
      <text x="146" y={far ? 150 : 52} textAnchor="middle" fill="#ffb020" fontSize="11" fontFamily="JetBrains Mono, monospace">fraisage 100°</text>
    </svg>
  );
}

function CountersinkTrainer() {
  const [far, setFar] = useState(false);
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Target size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Fraisage proche ou opposé : ce que l'opérateur doit lire</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip active={!far} onClick={() => setFar(false)}>Fraisé côté vue (proche)</Chip>
        <Chip active={far} onClick={() => setFar(true)} tone="amber">Fraisé côté opposé (far side)</Chip>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr] md:items-center">
        <CountersinkSVG far={far} />
        <div className="text-[14px] leading-relaxed text-ink/85">
          {!far ? (
            <>Le fraisage est sur la face que tu regardes sur le plan, en général la <strong>face aérodynamique</strong> (peau extérieure). La tête fraisée de la fixation affleure côté vue. Le perçage et le fraisage se font <strong>depuis cette face</strong>.</>
          ) : (
            <>Le fraisage est sur la face <strong>que tu ne vois pas</strong>. Si la gamme ne le dit pas clairement, l'opérateur fraise la mauvaise face : la tête ne peut plus affleurer côté opposé, la tôle est rebutée ou part en QN. La gamme doit préciser <strong>la face d'accès</strong> et, si besoin, un outillage de fraisage arrière.</>
          )}
          <div className="mt-3"><NoteBox>Le symbole de fixation porté au plan (code NAS 523, symbolisation BNAE ou norme interne ECS appelée au cartouche) indique le type de fixation, le diamètre et le côté du fraisage. Le préparateur recopie cette information en clair dans l'opération de gamme.</NoteBox></div>
        </div>
      </div>
    </Panel>
  );
}

const Q_PLAN = [
  {
    q: "Le plan d'une ferrure est en projection européenne (1er dièdre). Où est dessinée la vue de gauche ?",
    options: ["À droite de la vue de face", "À gauche de la vue de face", "Au-dessus de la vue de face", "Elle n'existe pas en 1er dièdre"],
    answer: 0,
    why: "En 1er dièdre, ce que l'on voit depuis la gauche se dessine à droite de la vue de face. En 3e dièdre (projection américaine), c'est l'inverse : c'est pour cela qu'on lit d'abord le symbole de projection du cartouche.",
    hint: "Pense au principe du 1er dièdre : on projette la pièce sur le plan placé derrière elle.",
  },
  {
    q: "Le plan définit la ferrure repère -1 (dessinée) et la -2 (symétrique, non dessinée). Tu prépares le poste côté droit, qui reçoit la -2. Comment raisonnes-tu ?",
    options: ["Je monte la -2 en lisant la vue dessinée en symétrie", "Je monte la -1 puisque c'est elle qui est dessinée", "Peu importe, -1 et -2 sont interchangeables", "Je retourne la -1 de 180°"],
    answer: 0,
    why: "Les pièces symétriques ne sont pas interchangeables : la -2 est l'image miroir de la -1. Sa géométrie se lit en symétrie sur la vue de la -1. La gamme cite le bon repère pour chaque côté.",
    hint: "Une pièce symétrique n'est jamais une pièce retournée.",
  },
  {
    q: "Le plan exige Ra 0,8 µm dans l'alésage d'une ferrure de BTP. Après alésage manuel, l'opérateur voit une rayure hélicoïdale. Pourquoi est-ce grave ?",
    options: ["La rayure est une amorce de crique de fatigue sous les vibrations du rotor", "C'est seulement esthétique", "Elle gêne la mise en peinture", "Elle augmente la masse de la pièce"],
    answer: 0,
    why: "Sous les efforts alternés du rotor, une rayure concentre les contraintes et amorce une crique de fatigue. L'état de surface fait partie de la conformité, au même titre que le diamètre.",
    hint: "Une ferrure de BTP subit des millions de cycles de vibration.",
  },
];

function TabPlan({ done, onComplete }) {
  const [mode, setMode] = useState("E");
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={Ruler} kicker="Onglet 1 · Lecture de plan" title="Lire un plan Airbus Helicopters sans jamais monter la mauvaise pièce">
        Plan 2D ou maquette 3D annotée (MBD), la question est la même : quelle pièce, dans quel sens, de quel côté. Une erreur de lecture se paie en démontage, en rebut ou en QN.
      </SectionHead>

      <Panel className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Eye size={18} className="text-sky" />
          <h3 className="font-display text-xl font-semibold text-ink">Projection européenne ou américaine</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={mode === "E"} onClick={() => setMode("E")}>Européenne · 1er dièdre</Chip>
          <Chip active={mode === "A"} onClick={() => setMode("A")} tone="amber">Américaine · 3e dièdre</Chip>
        </div>
        <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
          <ProjectionSVG mode={mode} />
          <div className="text-[14px] leading-relaxed text-ink/85">
            {mode === "E" ? (
              <>En <strong>1er dièdre</strong>, chaque vue est dessinée <strong>du côté opposé</strong> à celui d'où on la regarde : la vue de gauche est à droite, la vue de dessus est en dessous.</>
            ) : (
              <>En <strong>3e dièdre</strong>, chaque vue est dessinée <strong>du côté d'où on la regarde</strong> : la vue de gauche est à gauche, la vue de dessus est au-dessus. On la rencontre sur les plans de fournisseurs nord-américains.</>
            )}
            <div className="mt-3"><NoteBox>Le symbole de projection (cône tronqué) figure dans le cartouche. Lis-le avant toute chose : la même disposition de vues donne une pièce miroir selon la convention.</NoteBox></div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <RuleCard n="-1" title="Repère impair = côté gauche">
          Convention courante sur les pièces symétriques : le <strong>-1 (impair)</strong> est la pièce gauche, souvent la seule <strong>dessinée</strong>.
        </RuleCard>
        <RuleCard n="-2" title="Repère pair = côté droit" tone="amber">
          Le <strong>-2 (pair)</strong> est la pièce droite, « symétrique, non dessinée ». Elle se lit en miroir de la -1. Elle n'est <strong>jamais interchangeable</strong> avec la -1.
        </RuleCard>
        <RuleCard icon={AlertTriangle} title="Toujours confirmer au plan" tone="red">
          La convention se vérifie dans la nomenclature du plan. Gauche et droite se lisent toujours <strong>dans le repère avion</strong> (vu de l'arrière vers l'avant), même si le pilote d'un AH est assis à droite.
        </RuleCard>
      </div>

      <CountersinkTrainer />

      <div className="flex flex-col gap-4">
        <SectionHead icon={Search} kicker="États de surface" title="Rugosité Ra : pourquoi le préparateur la surveille">
          Ra est l'écart moyen arithmétique du profil de surface, en micromètres. Plus il est petit, plus la surface est lisse. Dans un alésage critique, il conditionne la tenue en fatigue.
        </SectionHead>
        <div className="grid gap-3 sm:grid-cols-3">
          <RuleCard n="0,8" title="Ra 0,8 µm" tone="red">Alésage de ferrure critique (BTP, attaches de rotor, trains). Exige un <strong>alésage de finition</strong> avec alésoir en bon état, lubrifié, à vitesse maîtrisée.</RuleCard>
          <RuleCard n="1,6" title="Ra 1,6 µm" tone="amber">Alésage de fixation structurale ajustée. Alésoir guidé, pas de reprise à main levée.</RuleCard>
          <RuleCard n="3,2" title="Ra 3,2 µm">Perçage courant de rivetage. Le foret suffit, mais l'ébavurage reste obligatoire.</RuleCard>
        </div>
        <DangerBox title="Une rayure d'outil est une amorce de crique">
          Sous les vibrations du rotor, une rayure ou un arrachement dans un alésage concentre les contraintes et amorce une <strong>crique de fatigue</strong>. La gamme impose l'outil de finition, son état (affûtage, usure), la lubrification et le contrôle visuel de l'alésage avant pose.
        </DangerBox>
      </div>

      <ImpactBox title="Ce que tu écris dans la gamme">
        Le repère exact par côté (-1 / -2), la face d'accès pour le perçage et le fraisage, l'outil de finition qui garantit le Ra du plan, et le contrôle à faire avant de poser la fixation.
      </ImpactBox>

      <QuickCheck title="Contrôle de fin d'onglet" questions={Q_PLAN} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu sais lire la projection, les pièces symétriques, le fraisage et le Ra." />
    </div>
  );
}

/* ============================================================
   ONGLET 2 · AJUSTEMENTS ISO 286
   ============================================================ */
function FamiliesSVG() {
  /* Position des zones d'arbre par rapport au trou H (écart inférieur 0) */
  const y0 = 120;
  return (
    <svg viewBox="0 0 360 200" className="h-auto w-full max-w-[460px]" role="img" aria-label="Position des zones de tolérance pour les trois familles d'ajustements">
      <line x1="10" y1={y0} x2="350" y2={y0} stroke="#e6edf7" strokeDasharray="4 3" />
      <text x="12" y={y0 - 6} fill="#8fa0bd" fontSize="10" fontFamily="JetBrains Mono, monospace">cote nominale</text>
      <rect x="40" y={y0 - 40} width="50" height="40" fill="rgba(59,158,255,0.25)" stroke="#3b9eff" />
      <text x="65" y={y0 - 16} textAnchor="middle" fill="#e6edf7" fontSize="12" fontFamily="JetBrains Mono, monospace">H7</text>
      <text x="65" y={y0 + 18} textAnchor="middle" fill="#3b9eff" fontSize="10" fontFamily="Barlow, sans-serif">trou</text>
      {[
        { x: 120, y: y0 + 12, h: 30, l: "g6", c: "#3ddc97", t: "jeu" },
        { x: 200, y: y0 - 20, h: 30, l: "k6", c: "#ffb020", t: "incertain" },
        { x: 280, y: y0 - 72, h: 30, l: "p6", c: "#ff5d6c", t: "serrage" },
      ].map((z) => (
        <g key={z.l}>
          <rect x={z.x} y={z.y} width="50" height={z.h} fill={z.c} fillOpacity="0.22" stroke={z.c} />
          <text x={z.x + 25} y={z.y + 19} textAnchor="middle" fill="#e6edf7" fontSize="12" fontFamily="JetBrains Mono, monospace">{z.l}</text>
          <text x={z.x + 25} y="190" textAnchor="middle" fill={z.c} fontSize="11" fontFamily="Barlow, sans-serif">arbre · {z.t}</text>
        </g>
      ))}
    </svg>
  );
}

const Q_FITS = [
  {
    q: "Ø10 H7 : quelles sont les cotes limites du trou ?",
    options: ["10,000 à 10,015 mm", "9,985 à 10,000 mm", "9,992 à 10,008 mm", "10,015 à 10,030 mm"],
    answer: 0,
    why: "Majuscule = alésage. Pour H, l'écart inférieur vaut 0 ; IT7 à Ø10 vaut 15 µm. Le trou va donc de 10,000 à 10,015 mm.",
    hint: "Pour la lettre H, l'écart inférieur est toujours nul.",
  },
  {
    q: "Bague épaulée Ø25 H7/p6 dans une ferrure de BTP : quelle famille et quelle action dans la gamme ?",
    options: ["Serrage : contraction à l'azote liquide ou presse étalonnée, puis attente de remise à température", "Jeu : montage glissant à la graisse", "Incertain : pose au maillet doux", "Serrage : frappe au marteau jusqu'à affleurement"],
    answer: 0,
    why: "p est au-delà de n : la bague est plus grande que le trou. On la contracte au LN₂ (ou on la presse avec une presse étalonnée), et on attend le retour à température ambiante avant contrôle.",
    hint: "Les lettres p à z donnent un arbre toujours plus grand que le trou.",
  },
  {
    q: "8 H7/k6 sur une fixation structurale ajustée : pourquoi le Bureau d'Études choisit-il cet ajustement ?",
    options: ["Pour supprimer tout jeu sous vibrations sans imposer un fort serrage", "Pour que l'axe tourne librement", "Pour pouvoir monter sans aucun outillage", "Pour réduire le coût de la fixation"],
    answer: 0,
    why: "Un ajustement incertain donne un jeu ou un serrage de quelques micromètres. La fixation reprend l'effort sans battre sous les vibrations, et reste posable par alésage de finition et maillet doux ou tire-boulon.",
    hint: "Lettres j à n : la zone de l'arbre chevauche celle du trou.",
  },
];

function TabFits({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={Gauge} kicker="Onglet 2 · Ajustements ISO 286" title="Une lettre et un chiffre au plan, une opération et des EPI dans la gamme">
        Un appel d'ajustement comme 25 H7/p6 décide de la façon de monter la pièce. Le préparateur doit le traduire en mode opératoire, en outillage et en contrôle.
      </SectionHead>

      <div className="grid gap-4 md:grid-cols-2">
        <RuleCard n="H" title="MAJUSCULE = alésage (le trou)">
          Pour <strong>H</strong>, l'écart inférieur est <strong>toujours 0</strong>. Le chiffre est la qualité (IT) : plus il est petit, plus la tolérance est serrée.
          <div className="mt-2 rounded-lg border border-line bg-bg px-3 py-2 font-mono text-[13px] text-ink">Ø10 H7 → 10,000 à 10,015 mm</div>
        </RuleCard>
        <RuleCard n="g" title="minuscule = arbre (axe, bague, fût de boulon)" tone="amber">
          La lettre place la zone de l'arbre par rapport à la cote nominale. Avec un trou H, elle suffit à dire si l'assemblage aura du <strong>jeu</strong>, sera <strong>incertain</strong> ou <strong>serré</strong>.
          <div className="mt-2 rounded-lg border border-line bg-bg px-3 py-2 font-mono text-[13px] text-ink">Ø10 g6 → 9,986 à 9,995 mm</div>
        </RuleCard>
      </div>

      <Panel className="flex flex-col items-center gap-2 p-5">
        <FamiliesSVG />
        <p className="text-center text-[13px] text-muted">Le trou H démarre à la cote nominale. La lettre de l'arbre le place dessous (jeu), à cheval (incertain) ou dessus (serrage).</p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="flex flex-col gap-3 border-ok/40 p-5">
          <Eyebrow tone="green">1 · Jeu · lettres a à h</Eyebrow>
          <div className="font-mono text-lg font-semibold text-ink">10 H7/g6</div>
          <p className="text-[14px] text-ink/85"><strong>Usage :</strong> axes mobiles, articulations de la timonerie de commandes de vol (ATA 67), axes de portes.</p>
          <div className="rounded-lg border border-line bg-bg p-3 text-[13px] leading-relaxed text-ink/90">
            <strong className="text-ok">Gamme :</strong> montage manuel glissant, lubrification à la graisse prescrite au plan. Contrôle de l'alésage au tampon lisse Entre / N'entre pas (Go / No-Go).
          </div>
        </Panel>
        <Panel className="flex flex-col gap-3 border-amber/40 p-5">
          <Eyebrow tone="amber">2 · Incertain · lettres j à n</Eyebrow>
          <div className="font-mono text-lg font-semibold text-ink">8 H7/k6</div>
          <p className="text-[14px] text-ink/85"><strong>Usage :</strong> fixations structurales ajustées (Hi-Lok, boulons de structure primaire) pour supprimer tout jeu sous vibrations.</p>
          <div className="rounded-lg border border-line bg-bg p-3 text-[13px] leading-relaxed text-ink/90">
            <strong className="text-amber">Gamme :</strong> alésage de finition à l'alésoir carbure guidé par canon de perçage, puis pose au maillet doux ou au tire-boulon.
          </div>
        </Panel>
        <Panel className="flex flex-col gap-3 border-ko/40 p-5">
          <Eyebrow tone="red">3 · Serrage · lettres p à z</Eyebrow>
          <div className="font-mono text-lg font-semibold text-ink">25 H7/p6</div>
          <p className="text-[14px] text-ink/85"><strong>Usage :</strong> bagues épaulées (bushes) et rotules dans les ferrures de BTP, de trains, de têtes rotor. <strong>La bague est plus grande que le trou.</strong></p>
          <div className="rounded-lg border border-line bg-bg p-3 text-[13px] leading-relaxed text-ink/90">
            <strong className="text-ko">Gamme obligatoire :</strong> contraction thermique de la bague à l'azote liquide (LN₂, −196 °C) ou presse hydraulique étalonnée, puis attente de remise à température ambiante avant contrôle, métallisation et PR.
          </div>
        </Panel>
      </div>

      <DangerBox title="Azote liquide : EPI cryogéniques obligatoires">
        Gants cryogéniques, visière (écran facial), tablier, chaussures fermées, pinces de manutention. Zone ventilée : l'azote qui s'évapore chasse l'oxygène et crée un <strong>risque d'anoxie</strong> en espace confiné. La bague se pose vite, sans forcer : si elle « prend » à mi-course, on arrête et on ouvre une QN, on ne frappe pas.
      </DangerBox>

      <ImpactBox title="Le réflexe à avoir devant un appel d'ajustement">
        Lire la lettre de l'arbre, en déduire la famille, puis écrire l'opération, l'outillage, les EPI et le contrôle qui vont avec. Un serrage traité comme un jeu, c'est une bague matée, une ferrure de BTP rebutée.
      </ImpactBox>

      <QuickCheck title="Contrôle de fin d'onglet" questions={Q_FITS} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu sais lire un ajustement ISO et en déduire l'action de gamme." />
    </div>
  );
}

/* ============================================================
   ONGLET 3 · ISO GPS & ISOSTATISME
   ============================================================ */
const FRAME_CELLS = [
  { id: "sym", label: <GdtSym kind="pos" size={22} />, t: "Symbole de localisation (position)", d: "La caractéristique tolérancée est la position de l'axe du trou par rapport à sa position théorique exacte (cotes encadrées du plan)." },
  { id: "val", label: <><span>Ø0,1</span><Mmc /></>, t: "Valeur Ø0,1 au maximum de matière", d: "Le Ø indique une zone cylindrique : l'axe réel du trou doit rester dans un cylindre de Ø0,1 mm centré sur la position théorique. Le Ⓜ ajoute une tolérance bonus quand le trou s'éloigne de son maximum de matière (son plus petit diamètre)." },
  { id: "A", label: "A", t: "Référence primaire A", d: "Appui plan, 3 points. C'est la première face sur laquelle on plaque la pièce dans le bâti. Elle bloque 1 translation et 2 rotations." },
  { id: "B", label: "B", t: "Référence secondaire B", d: "Appui linéaire, 2 points. On accoste sur B en gardant le contact sur A. Elle bloque 1 translation et 1 rotation." },
  { id: "C", label: "C", t: "Référence tertiaire C", d: "Appui ponctuel, 1 butée. Elle bloque la dernière translation. La pièce est alors en position isostatique (6 degrés de liberté supprimés)." },
];

function FrameReader() {
  const [cell, setCell] = useState("sym");
  const c = FRAME_CELLS.find((x) => x.id === cell);
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Crosshair size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Lire le cadre de tolérance case par case</h3>
      </div>
      <p className="text-[14px] text-muted">Clique sur chaque case du cadre, comme tu le lirais sur le plan, de gauche à droite.</p>
      <div className="overflow-x-auto"><ToleranceFrame cells={FRAME_CELLS} active={cell} onPick={setCell} /></div>
      <div className="rounded-lg border border-sky/40 bg-sky/10 p-4">
        <div className="font-display text-lg font-semibold text-ink">{c.t}</div>
        <p className="mt-1 text-[14px] leading-relaxed text-ink/90">{c.d}</p>
      </div>
    </Panel>
  );
}

const DOF = [
  { id: "Tz", t: "Translation Z", by: "A" }, { id: "Rx", t: "Rotation X", by: "A" }, { id: "Ry", t: "Rotation Y", by: "A" },
  { id: "Ty", t: "Translation Y", by: "B" }, { id: "Rz", t: "Rotation Z", by: "B" },
  { id: "Tx", t: "Translation X", by: "C" },
];

function JigSVG({ seq }) {
  const on = (r) => seq.includes(r);
  const col = (r) => (on(r) ? "#3ddc97" : "#8fa0bd");
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full max-w-[380px]" role="img" aria-label="Vue de dessus de la pièce dans le bâti avec ses appuis A, B et C">
      <rect x="70" y="40" width="210" height="110" rx="4" fill={on("A") ? "rgba(59,158,255,0.18)" : "#111a2e"} stroke="#3b9eff" strokeWidth="1.5" />
      <text x="175" y="99" textAnchor="middle" fill="#e6edf7" fontSize="12" fontFamily="Barlow, sans-serif">Cadre à accoster</text>
      {[[100, 65], [250, 65], [175, 130]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="7" fill="none" stroke={col("A")} strokeWidth="2" /><text x={x} y={y + 4} textAnchor="middle" fill={col("A")} fontSize="9" fontFamily="JetBrains Mono, monospace">A</text></g>
      ))}
      {[110, 240].map((x, i) => (
        <path key={i} d={`M${x - 9} 168 L${x} 152 L${x + 9} 168 Z`} fill={on("B") ? "#3ddc97" : "none"} stroke={col("B")} strokeWidth="2" />
      ))}
      <text x="175" y="186" textAnchor="middle" fill={col("B")} fontSize="10" fontFamily="JetBrains Mono, monospace">B · 2 points (linéaire)</text>
      <path d="M52 86 L68 95 L52 104 Z" fill={on("C") ? "#3ddc97" : "none"} stroke={col("C")} strokeWidth="2" />
      <text x="40" y="124" textAnchor="middle" fill={col("C")} fontSize="10" fontFamily="JetBrains Mono, monospace">C · butée</text>
      <text x="175" y="28" textAnchor="middle" fill={col("A")} fontSize="10" fontFamily="JetBrains Mono, monospace">A · 3 points sous la pièce (plan)</text>
    </svg>
  );
}

function IsostatTrainer() {
  const [seq, setSeq] = useState([]);
  const [err, setErr] = useState(null);
  const expected = ["A", "B", "C"];
  const press = (r) => {
    if (seq.includes(r)) return;
    if (r !== expected[seq.length]) {
      setErr(r === "B" || seq.length === 0
        ? `Tu accostes sur ${r} avant d'avoir plaqué la pièce sur ${expected[seq.length]}. Quand tu la plaqueras ensuite sur ${expected[seq.length]}, elle glissera ou basculera sur ${r} : le positionnement obtenu n'est pas celui que la cotation du plan exige.`
        : `Tu poses la butée C avant d'avoir accosté sur B. La pièce peut encore tourner autour de Z : en l'accostant ensuite sur B, elle quitte la butée C.`);
      return;
    }
    setErr(null);
    setSeq([...seq, r]);
  };
  const blocked = DOF.filter((d) => seq.includes(d.by)).length;
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Boxes size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Rédige l'ordre d'accostage dans le bâti (règle 3-2-1)</h3>
      </div>
      <p className="text-[14px] text-muted">Le plan cote la pièce par rapport à [A | B | C]. Choisis dans quel ordre l'opérateur met la pièce en appui.</p>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr] md:items-center">
        <JigSVG seq={seq} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {["C", "A", "B"].map((r) => (
              <Chip key={r} active={seq.includes(r)} tone="green" onClick={() => press(r)}>Plaquer sur {r}</Chip>
            ))}
            <button type="button" onClick={() => { setSeq([]); setErr(null); }} className="inline-flex items-center gap-1 px-2 text-[12px] text-muted hover:text-ink"><RotateCcw size={12} /> Recommencer</button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {DOF.map((d) => (
              <div key={d.id} className={cx("flex items-center gap-1 rounded-md border px-2 py-1.5 font-mono text-[11px]", seq.includes(d.by) ? "border-ok/50 bg-ok/10 text-ink" : "border-line bg-bg text-muted")}>
                {seq.includes(d.by) ? <Lock size={11} className="text-ok" /> : <Unlock size={11} />} {d.t}
              </div>
            ))}
          </div>
          <div className="font-mono text-[13px] text-ink">Degrés de liberté supprimés : <strong className={blocked === 6 ? "text-ok" : "text-amber"}>{blocked}/6</strong></div>
          {err && <Feedback ok={false}>{err}</Feedback>}
          {seq.length === 3 && <Feedback ok>A (3 points) bloque Tz, Rx, Ry. B (2 points) bloque Ty et Rz. C (1 point) bloque Tx. La pièce est isostatique : chaque appui n'enlève que les degrés de liberté qui restent.</Feedback>}
        </div>
      </div>
    </Panel>
  );
}

function BonusTrainer() {
  const [d, setD] = useState(8.0);
  const lo = 8.0, hi = 8.022, tol = 0.1;
  const inTol = d >= lo - 1e-9 && d <= hi + 1e-9;
  const bonus = Math.max(0, d - lo);
  const total = tol + bonus;
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Calculator size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Tolérance bonus au maximum de matière</h3>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[14px] text-ink/85">
        <span>Trou Ø8 H8 (8,000 à 8,022 mm) avec :</span>
        <ToleranceFrame cells={[{ id: "s", label: <GdtSym kind="pos" size={20} /> }, { id: "v", label: <><span>Ø0,1</span><Mmc /></> }, { id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }]} />
      </div>
      <Slider label="Diamètre réel du trou mesuré" value={d} min={7.995} max={8.027} step={0.001} onChange={setD} unit="mm" display={mm3(d)} />
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat label="Écart au maxi matière" value={inTol ? `${mm3(bonus)} mm` : "–"} sub="Ø réel − 8,000" />
        <Stat label="Tolérance bonus" value={inTol ? `+${mm3(bonus)} mm` : "–"} tone="text-amber" />
        <Stat label="Zone de position autorisée" value={inTol ? `Ø${mm3(total)} mm` : "Pièce non conforme"} tone={inTol ? "text-ok" : "text-ko"} />
      </div>
      {inTol ? (
        <NoteBox>Le maximum de matière d'un trou, c'est son plus petit diamètre (8,000 mm). Plus le trou est grand, plus il reste de place autour du boulon : la position peut dériver d'autant sans gêner le montage. Au plus grand (8,022), la zone atteint Ø0,122 mm.</NoteBox>
      ) : (
        <Feedback ok={false}>Le diamètre sort de la tolérance H8. Aucun bonus ne « rattrape » une cote hors tolérance : l'alésage est non conforme et part en QN.</Feedback>
      )}
    </Panel>
  );
}

const Q_GPS = [
  {
    q: "Dans le cadre [⌖ | Ø0,1 Ⓜ | A | B | C], que signifie le Ø devant 0,1 ?",
    options: ["La zone de tolérance est un cylindre de Ø0,1 mm autour de la position théorique", "Le trou fait 0,1 mm de diamètre", "La position est tolérancée à ±0,1 mm en X et en Y", "Le trou doit être parfaitement cylindrique"],
    answer: 0,
    why: "Le Ø transforme la zone en cylindre. L'axe réel du trou doit tenir dans ce cylindre de Ø0,1, soit au plus 0,05 mm d'écart radial par rapport à la position théorique.",
    hint: "Le Ø décrit la forme de la zone, pas la taille du trou.",
  },
  {
    q: "Le plan d'un cadre est coté par rapport à [A | B | C]. Dans quel ordre l'opérateur met-il le cadre en appui dans le bâti ?",
    options: ["A (3 points), puis B (2 points), puis C (1 butée)", "C, puis B, puis A", "Dans l'ordre le plus commode pour l'opérateur", "B, puis A, puis C"],
    answer: 0,
    why: "L'ordre des références dans le cadre est l'ordre de mise en position : primaire, secondaire, tertiaire. C'est la règle de l'isostatisme 3-2-1.",
    hint: "L'ordre de lecture du cadre est l'ordre d'accostage.",
  },
  {
    q: "Un trou Ø8 H8 mesure 8,012 mm. Sa localisation est ⌖ Ø0,1 Ⓜ. Quelle zone de position est autorisée ?",
    options: ["Ø0,112 mm", "Ø0,1 mm", "Ø0,088 mm", "Ø0,122 mm"],
    answer: 0,
    why: "Bonus = diamètre réel − maximum de matière = 8,012 − 8,000 = 0,012 mm. Zone autorisée : 0,1 + 0,012 = Ø0,112 mm.",
    hint: "Pour un trou, le maximum de matière est son plus petit diamètre.",
  },
];

function TabGps({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={Crosshair} kicker="Onglet 3 · ISO GPS / ISO 1101" title="Tolérancement géométrique et isostatisme d'outillage">
        Le cadre de tolérance dit quelle géométrie est exigée, et par rapport à quoi. Pour le préparateur, il dicte aussi l'ordre de mise en position dans le bâti d'assemblage.
      </SectionHead>

      <FrameReader />

      <div className="grid gap-4 lg:grid-cols-3">
        <RuleCard icon={() => <GdtSym kind="flat" size={14} />} title="Forme (sans référence)">
          <div className="mb-2 flex items-center gap-3 text-sky"><span className="flex items-center gap-1"><GdtSym kind="flat" /> Planéité</span><span className="flex items-center gap-1"><GdtSym kind="cyl" /> Cylindricité</span></div>
          <strong>Impact :</strong> un défaut de planéité à l'interface de deux pièces laisse des jeux. La gamme prévoit le relevé au jeu de cales et le <strong>calage (shimming)</strong>.
        </RuleCard>
        <RuleCard icon={() => <GdtSym kind="perp" size={14} />} title="Orientation (avec référence)" tone="amber">
          <div className="mb-2 flex items-center gap-3 text-amber"><span className="flex items-center gap-1"><GdtSym kind="perp" /> Perpendicularité</span><span className="flex items-center gap-1"><GdtSym kind="para" /> Parallélisme</span></div>
          <strong>Impact :</strong> un alésage qui n'est pas perpendiculaire à la surface (au-delà d'environ 2°, limite courante des normes de pose) met la tête du Hi-Lok en <strong>appui partiel</strong> : rupture en fatigue de la fixation.
        </RuleCard>
        <RuleCard icon={() => <GdtSym kind="pos" size={14} />} title="Position" tone="green">
          <div className="mb-2 flex items-center gap-3 text-ok"><span className="flex items-center gap-1"><GdtSym kind="pos" /> Localisation</span><span className="flex items-center gap-1"><GdtSym kind="coax" /> Coaxialité</span></div>
          <strong>Impact :</strong> la position des trous conditionne l'interchangeabilité et l'alignement des ferrures. La gamme impose le <strong>gabarit de perçage</strong> ou le canon indexé sur les références.
        </RuleCard>
      </div>

      <DangerBox title="Perçage non perpendiculaire : on ne force pas la fixation">
        Un Hi-Lok dont la tête porte d'un seul côté travaille en flexion et casse en fatigue. La gamme impose un <strong>moyen de guidage</strong> (canon, perceuse avec pied de normalité) et le contrôle de la normalité avant pose. Un trou hors limite part en QN.
      </DangerBox>

      <IsostatTrainer />
      <BonusTrainer />

      <ImpactBox title="Ce que tu écris dans la gamme d'accostage">
        L'ordre d'appui calqué sur les références du plan (A puis B puis C), l'effort de plaquage, le contrôle de contact sur chaque appui, et le moyen qui garantit l'orientation des perçages.
      </ImpactBox>

      <QuickCheck title="Contrôle de fin d'onglet" questions={Q_GPS} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu sais lire un cadre ISO GPS, l'isostatisme 3-2-1 et le maximum de matière." />
    </div>
  );
}

/* ============================================================
   ONGLET 4 · CHAÎNES DE COTES & CALAGE
   ============================================================ */
function ChainTrainer() {
  const [b, setB] = useState(23.6);
  /* J = A − B − R ; A = 24,00 +0,10/0 ; B = b ±0,05 ; R = 0,20 ±0,02 */
  const Amin = 24.0, Amax = 24.1, Rmin = 0.18, Rmax = 0.22;
  const Bmin = b - 0.05, Bmax = b + 0.05;
  const jmax = Amax - Bmin - Rmin;
  const jmin = Amin - Bmax - Rmax;
  const req = { lo: 0.05, hi: 0.4 };
  const status = jmin < -1e-9 ? "inter" : jmin < req.lo - 1e-9 ? "low" : jmax > req.hi + 1e-9 ? "high" : "ok";
  const msg = {
    ok: ["Chaîne conforme", "Dans tous les cas de cumul, le jeu reste dans l'exigence fonctionnelle. Montage direct, sans retouche."],
    inter: ["Serrage imprévu possible", "Au pire cumul, la ferrure est plus épaisse que la place disponible : les pièces interfèrent. Montage forcé = pré-contrainte de la chape. À remonter au BE avant de lancer la gamme."],
    low: ["Jeu mini insuffisant", "Le jeu peut descendre sous 0,05 mm : risque de grippage à l'articulation. Il faut un tri, un appairage ou une révision de cotation."],
    high: ["Jeu excessif possible", "Le jeu peut dépasser 0,40 mm : battement sous vibrations. La gamme doit prévoir un calage, ou le BE une reprise de cotation."],
  }[status];
  const scale = (v) => 20 + ((v + 0.2) / 0.8) * 280; /* −0,2 → 0,6 mm */
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Ruler size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Chaîne de cotes : ferrure dans une chape</h3>
      </div>
      <div className="grid gap-2 font-mono text-[13px] text-ink sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-bg px-3 py-2">A · ouverture chape<br /><strong>24,00 +0,10 / 0</strong></div>
        <div className="rounded-lg border border-amber/40 bg-bg px-3 py-2">B · épaisseur ferrure<br /><strong>{mm(b)} ±0,05</strong></div>
        <div className="rounded-lg border border-line bg-bg px-3 py-2">R · rondelle<br /><strong>0,20 ±0,02</strong></div>
      </div>
      <div className="rounded-lg border border-line bg-panel2 px-3 py-2 font-mono text-[13px] text-ink/90">
        J = A − B − R · Jmax = Amax − Bmin − Rmin · Jmin = Amin − Bmax − Rmax · exigence : 0,05 ≤ J ≤ 0,40
      </div>
      <Slider label="Cote nominale de la ferrure B (variante proposée)" value={b} min={23.4} max={23.9} step={0.05} onChange={(v) => setB(Math.round(v * 100) / 100)} unit="mm" display={mm(b)} />
      <svg viewBox="0 0 320 70" className="h-auto w-full" role="img" aria-label="Plage de jeu calculée comparée à l'exigence">
        <rect x={scale(req.lo)} y="18" width={scale(req.hi) - scale(req.lo)} height="22" fill="rgba(61,220,151,0.15)" stroke="#3ddc97" strokeDasharray="3 2" />
        <line x1={scale(0)} y1="10" x2={scale(0)} y2="50" stroke="#ff5d6c" />
        <text x={scale(0)} y="64" textAnchor="middle" fill="#ff5d6c" fontSize="9" fontFamily="JetBrains Mono, monospace">0 (contact)</text>
        <rect x={scale(Math.max(-0.2, jmin))} y="24" width={Math.max(2, scale(Math.min(0.6, jmax)) - scale(Math.max(-0.2, jmin)))} height="10" rx="2" fill={status === "ok" ? "#3ddc97" : "#ffb020"} />
        <text x={scale(req.lo)} y="12" fill="#3ddc97" fontSize="9" fontFamily="JetBrains Mono, monospace">exigence</text>
      </svg>
      <div className="grid gap-2 sm:grid-cols-2">
        <Stat label="Jmin" value={`${mm(jmin)} mm`} tone={jmin < 0 ? "text-ko" : jmin < req.lo ? "text-amber" : "text-ok"} />
        <Stat label="Jmax" value={`${mm(jmax)} mm`} tone={jmax > req.hi ? "text-amber" : "text-ok"} />
      </div>
      <Feedback ok={status === "ok"}><strong>{msg[0]}.</strong> {msg[1]}</Feedback>
    </Panel>
  );
}

function ShimStackSVG({ peel, total = 20 }) {
  const h = 7;
  return (
    <svg viewBox={`0 0 220 ${total * h + 24}`} className="h-auto w-full max-w-[240px]" role="img" aria-label={`Cale pelable : ${peel} feuillets retirés sur ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const removed = i < peel;
        return <rect key={i} x={removed ? 34 : 20} y={8 + i * h} width="150" height={h - 1.5} rx="1" fill={removed ? "rgba(255,93,108,0.18)" : "rgba(59,158,255,0.45)"} stroke={removed ? "#ff5d6c" : "#3b9eff"} strokeDasharray={removed ? "3 2" : undefined} strokeWidth="0.8" />;
      })}
      <text x="190" y={8 + (peel * h) / 2 + 3} fill="#ff5d6c" fontSize="10" fontFamily="JetBrains Mono, monospace">{peel > 0 ? `−${peel}` : ""}</text>
      <text x="190" y={8 + peel * h + ((total - peel) * h) / 2 + 3} fill="#3b9eff" fontSize="10" fontFamily="JetBrains Mono, monospace">{total - peel}</text>
    </svg>
  );
}

const SHIM_STEPS = [
  { q: "1 · Quelle épaisseur de cale faut-il conserver ?", options: [{ t: "0,65 mm, l'espace mesuré" }, { t: "0,35 mm" }, { t: "0,70 mm, un peu plus pour serrer" }, { t: "1,00 mm, la cale entière" }], answer: 0, why: "On remplit l'espace mesuré, sans le dépasser : une cale plus épaisse forcerait la ferrure en serrant les fixations (pré-contrainte)." },
  { q: "2 · Quelle épaisseur faut-il retirer ?", options: [{ t: "1,00 − 0,65 = 0,35 mm" }, { t: "0,65 mm" }, { t: "0,65 − 0,05 = 0,60 mm" }, { t: "0,05 mm" }], answer: 0, why: "Épaisseur nominale de la cale moins épaisseur à conserver : 1,00 − 0,65 = 0,35 mm." },
  { q: "3 · Combien de feuillets de 0,05 mm peler au scalpel ?", options: [{ t: "0,35 / 0,05 = 7 feuillets" }, { t: "13 feuillets" }, { t: "6 feuillets" }, { t: "35 feuillets" }], answer: 0, why: "0,35 / 0,05 = 7. Il reste 13 feuillets, soit 0,65 mm, et le jeu résiduel est nul, sous la limite de 0,05 mm." },
];

function ShimWorkedExample() {
  const [picks, setPicks] = useState({});
  const solved = SHIM_STEPS.filter((s, i) => picks[i] === s.answer).length;
  const peel = solved >= 3 ? 7 : 0;
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Layers size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Exemple terrain : cale pelable sous une ferrure de plancher mécanique</h3>
      </div>
      <p className="text-[14px] leading-relaxed text-ink/85">L'opérateur mesure au jeu de cales un espace résiduel de <strong>0,65 mm</strong>. La gamme autorise un jeu résiduel maxi de <strong>0,05 mm</strong> après calage. La cale pelable fait <strong>1,00 mm</strong>, en feuillets de <strong>0,05 mm</strong> (20 feuillets).</p>
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-4">
          {SHIM_STEPS.map((s, i) => {
            const unlocked = i === 0 || picks[i - 1] === SHIM_STEPS[i - 1].answer;
            if (!unlocked) return null;
            const p = picks[i];
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="text-[15px] font-medium text-ink">{s.q}</div>
                <ChoiceStep options={s.options} answer={s.answer} picked={p} onPick={(k) => setPicks({ ...picks, [i]: k })} locked={p === s.answer} />
                {p !== undefined && <Feedback ok={p === s.answer}>{p === s.answer ? s.why : "Reprends le raisonnement : on part de l'espace mesuré."}</Feedback>}
              </div>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-2">
          <ShimStackSVG peel={peel} />
          <span className="font-mono text-[11px] text-muted">{peel ? "7 pelés · 13 conservés = 0,65 mm" : "Cale neuve · 20 × 0,05 mm"}</span>
        </div>
      </div>
      <NoteBox>Toujours vérifier la fiche de la cale : certaines ont une semelle non pelable. On pèle au scalpel feuillet par feuillet, on mesure l'épaisseur restante au micromètre avant pose, et on ne pèle jamais les deux faces au hasard.</NoteBox>
    </Panel>
  );
}

const Q_CHAIN = [
  {
    q: "A = 24,00 (+0,10 / 0) et B = 23,60 ±0,05. Quel est le Jmin du jeu J = A − B ?",
    options: ["0,35 mm", "0,40 mm", "0,55 mm", "0,30 mm"],
    answer: 0,
    why: "Jmin = Amin − Bmax = 24,00 − 23,65 = 0,35 mm. (Jmax = Amax − Bmin = 24,10 − 23,55 = 0,55 mm.)",
    hint: "Jmin : la plus petite place disponible moins la plus grosse pièce.",
  },
  {
    q: "Espace mesuré 0,45 mm, cale pelable 1,00 mm en feuillets de 0,05 mm. Combien de feuillets peler ?",
    options: ["11 feuillets", "9 feuillets", "10 feuillets", "12 feuillets"],
    answer: 0,
    why: "À retirer : 1,00 − 0,45 = 0,55 mm. 0,55 / 0,05 = 11 feuillets. Il reste 9 feuillets, soit 0,45 mm.",
    hint: "Calcule d'abord l'épaisseur à retirer, puis divise par l'épaisseur d'un feuillet.",
  },
  {
    q: "Ton calcul de chaîne de cotes donne Jmin = −0,07 mm. Que signifie ce résultat ?",
    options: ["Au pire cumul, les pièces interfèrent : serrage imprévu", "Le jeu sera toujours de 0,07 mm", "Rien, la valeur est négligeable", "Il faut une cale de 0,07 mm"],
    answer: 0,
    why: "Un jeu négatif est un serrage. Dans le cas le plus défavorable, les pièces ne rentrent pas sans forcer : il faut remonter l'écart au BE avant de lancer la gamme.",
    hint: "Un jeu négatif, c'est de la matière en trop.",
  },
];

function TabChain({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={Scale} kicker="Onglet 4 · Chaînes de cotes & calage" title="Prévoir le jeu avant l'assemblage, le combler juste après">
        Une chaîne de cotes additionne les tolérances des pièces qui se suivent. Elle dit à l'avance si deux sous-ensembles vont interférer, ou laisser un jeu que seul un calage rattrapera.
      </SectionHead>

      <div className="grid gap-4 md:grid-cols-2">
        <RuleCard n="max" title="Jmax : le cas le plus « lâche »" tone="amber">
          Somme des cotes <strong>maxi</strong> qui agrandissent le jeu, moins la somme des cotes <strong>mini</strong> qui le réduisent.
        </RuleCard>
        <RuleCard n="min" title="Jmin : le cas le plus « serré »" tone="red">
          Somme des cotes <strong>mini</strong> qui agrandissent le jeu, moins la somme des cotes <strong>maxi</strong> qui le réduisent. Négatif = <strong>serrage</strong>.
        </RuleCard>
      </div>

      <ChainTrainer />
      <ShimWorkedExample />

      <ImpactBox title="Ce que tu écris dans la gamme de calage">
        Le point de mesure et le moyen (jeu de cales étalonné), le jeu résiduel maxi admis, la règle de calcul du pelage, le contrôle d'épaisseur avant pose, et l'enregistrement de l'épaisseur posée dans le dossier de suivi.
      </ImpactBox>

      <QuickCheck title="Contrôle de fin d'onglet" questions={Q_CHAIN} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu sais calculer une chaîne de cotes et le pelage d'une cale." />
    </div>
  );
}

/* ============================================================
   SIMULATEUR 1 · TRADUCTEUR D'AJUSTEMENTS ISO → GAMME SAP
   ============================================================ */
const FAMILY_OPTS = [{ t: "Ajustement avec JEU" }, { t: "Ajustement INCERTAIN (transition)" }, { t: "Ajustement avec SERRAGE" }];
const OP_OPTS = [
  { t: "Montage manuel glissant, lubrification à la graisse prescrite au plan, contrôle de l'alésage au tampon lisse Entre / N'entre pas" },
  { t: "Alésage de finition à l'alésoir carbure guidé par canon, puis pose au maillet doux ou au tire-boulon" },
  { t: "Contraction de la bague à l'azote liquide (−196 °C) ou presse hydraulique étalonnée, puis attente de remise à température avant contrôle" },
  { t: "Pose au marteau en frappant directement sur la bague jusqu'à affleurement" },
];
const EQ_OPTS = [
  { t: "Graisse référencée au plan, tampon lisse Go / No-Go de l'alésage, gants nitrile" },
  { t: "Alésoir carbure et canon de perçage, maillet doux ou tire-boulon, tampon lisse" },
  { t: "Bain LN₂, gants cryogéniques, visière, tablier, pinces de manutention, zone ventilée" },
  { t: "Chalumeau pour dilater la ferrure, gants de manutention standard" },
];
const FIT_CASES = [
  { id: "c1", call: "Ø12 H7/g6", nom: 12, where: "Axe de guignol de commande de pas cyclique", ac: "H145 · ATA 67", hole: [0, 18], shaft: [-17, -6], fam: 0, op: 0, eq: 0,
    why: "g est avant h : l'arbre est toujours plus petit que le trou. L'articulation doit tourner librement, montée graissée et contrôlée au tampon." },
  { id: "c2", call: "Ø30 H7/p6", nom: 30, where: "Bague épaulée de ferrure d'attache BTP", ac: "H160 · ATA 63", hole: [0, 21], shaft: [22, 35], fam: 2, op: 2, eq: 2,
    why: "L'arbre p6 démarre à +0,022 mm, au-dessus du trou maxi (+0,021) : serrage dans tous les cas. Contraction LN₂ ou presse étalonnée, puis attente de remise à température." },
  { id: "c3", call: "Ø6,35 H7/k6", nom: 6.35, where: "Boulon ajusté de jonction longeron / cadre", ac: "Poutre de queue H125 · ATA 53", hole: [0, 15], shaft: [1, 10], fam: 1, op: 1, eq: 1,
    why: "Les zones se chevauchent : jeu maxi 0,014 mm, serrage maxi 0,010 mm. Il faut un alésage de finition guidé pour que la fixation ajustée reprenne l'effort sans jeu." },
  { id: "c4", call: "Ø16 H7/h6", nom: 16, where: "Axe de charnière de porte cabine", ac: "H175 · ATA 52", hole: [0, 18], shaft: [-11, 0], fam: 0, op: 0, eq: 0,
    why: "h est la dernière lettre des jeux : l'arbre maxi est à la cote nominale, le jeu mini vaut 0. Montage glissant juste, graissé." },
  { id: "c5", call: "Ø22 H7/s6", nom: 22, where: "Rotule de bielle de train d'atterrissage", ac: "H175 · ATA 32", hole: [0, 21], shaft: [35, 48], fam: 2, op: 2, eq: 2,
    why: "s6 démarre à +0,035 mm : serrage de 0,014 à 0,048 mm. La contraction thermique doit dépasser le serrage maxi : c'est la fiche procédé validée qui le garantit." },
];

function FitDiagram({ c }) {
  const lo = Math.min(0, c.hole[0], c.shaft[0]) - 8;
  const hi = Math.max(c.hole[1], c.shaft[1]) + 8;
  const top = 18, H = 170;
  const y = (v) => top + ((hi - v) / (hi - lo)) * H;
  const lbl = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v);
  const zone = (x, [a, b], col, name) => (
    <g>
      <rect x={x} y={y(b)} width="80" height={Math.max(2, y(a) - y(b))} fill={col} fillOpacity="0.25" stroke={col} strokeWidth="1.5" />
      <text x={x + 40} y={(y(a) + y(b)) / 2 + 4} textAnchor="middle" fill="#e6edf7" fontSize="11" fontFamily="Barlow, sans-serif">{name}</text>
      <text x={x + 86} y={y(b) + 4} fill={col} fontSize="10" fontFamily="JetBrains Mono, monospace">{lbl(b)}</text>
      <text x={x + 86} y={y(a) + 4} fill={col} fontSize="10" fontFamily="JetBrains Mono, monospace">{lbl(a)}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 340 210" className="h-auto w-full max-w-[420px]" role="img" aria-label={`Zones de tolérance ${c.call} en micromètres`}>
      <line x1="10" y1={y(0)} x2="330" y2={y(0)} stroke="#e6edf7" strokeDasharray="4 3" />
      <text x="330" y={y(0) - 5} textAnchor="end" fill="#8fa0bd" fontSize="10" fontFamily="JetBrains Mono, monospace">Ø{mm(c.nom, c.nom % 1 ? 2 : 0)} nominal</text>
      {zone(30, c.hole, "#3b9eff", "Trou")}
      {zone(150, c.shaft, "#ffb020", "Arbre")}
      <text x="170" y="205" textAnchor="middle" fill="#8fa0bd" fontSize="10" fontFamily="JetBrains Mono, monospace">écarts en µm</text>
    </svg>
  );
}

function fitSummary(c) {
  const jmax = c.hole[1] - c.shaft[0];
  const jmin = c.hole[0] - c.shaft[1];
  if (jmin >= 0) return `Jeu de ${mm3(jmin / 1000)} à ${mm3(jmax / 1000)} mm`;
  if (jmax <= 0) return `Serrage de ${mm3(-jmax / 1000)} à ${mm3(-jmin / 1000)} mm`;
  return `Jeu maxi ${mm3(jmax / 1000)} mm · serrage maxi ${mm3(-jmin / 1000)} mm`;
}

function FitCaseWorkbench({ c, onSolved }) {
  const [p, setP] = useState({});
  const steps = [
    { key: "fam", q: "1 · Quel type d'ajustement ?", options: FAMILY_OPTS, answer: c.fam },
    { key: "op", q: "2 · Quelle opération écris-tu dans la gamme SAP ?", options: OP_OPTS, answer: c.op },
    { key: "eq", q: "3 · Quels outillages et EPI appelles-tu sur l'opération ?", options: EQ_OPTS, answer: c.eq },
  ];
  const ok = (s) => p[s.key] === s.answer;
  const all = steps.every(ok);
  useEffect(() => { if (all) onSolved(); }, [all]);
  const lim = (n, d) => mm3(n + d / 1000);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-line bg-bg p-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Appel de plan · {c.ac}</div>
          <div className="font-mono text-2xl font-semibold text-ink">{c.call}</div>
          <div className="text-[14px] text-ink/85">{c.where}</div>
        </div>
        <Panel className="flex justify-center p-3"><FitDiagram c={c} /></Panel>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Trou mini / maxi" value={`${lim(c.nom, c.hole[0])} / ${lim(c.nom, c.hole[1])}`} tone="text-sky" />
          <Stat label="Arbre mini / maxi" value={`${lim(c.nom, c.shaft[0])} / ${lim(c.nom, c.shaft[1])}`} tone="text-amber" />
        </div>
        {p.fam === c.fam && <div className="rounded-lg border border-line bg-panel2 px-3 py-2 font-mono text-[13px] text-ink">{fitSummary(c)}</div>}
      </div>
      <div className="flex flex-col gap-4">
        {steps.map((s, i) => {
          if (i > 0 && !ok(steps[i - 1])) return null;
          const picked = p[s.key];
          return (
            <div key={s.key} className="flex flex-col gap-2">
              <div className="text-[15px] font-medium text-ink">{s.q}</div>
              <ChoiceStep options={s.options} answer={s.answer} picked={picked} onPick={(k) => setP({ ...p, [s.key]: k })} locked={ok(s)} />
              {picked !== undefined && !ok(s) && <Feedback ok={false}>{i === 0 ? "Compare l'arbre maxi au trou mini, puis l'arbre mini au trou maxi." : picked === 3 ? "Interdit : la frappe directe mate la bague et la ferrure, le chalumeau altère le traitement thermique et la protection de la pièce." : "Ce mode opératoire ne correspond pas à la famille d'ajustement que tu viens d'identifier."}</Feedback>}
            </div>
          );
        })}
        {all && <Feedback ok>{c.why}</Feedback>}
      </div>
    </div>
  );
}

function TabTranslator({ done, onComplete }) {
  const [cur, setCur] = useState("c1");
  const [solved, setSolved] = useState({});
  const n = Object.keys(solved).length;
  useEffect(() => { if (n === FIT_CASES.length) onComplete(); }, [n]);
  const c = FIT_CASES.find((x) => x.id === cur);
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Hammer} kicker="Onglet 5 · Simulateur 1" title="Le traducteur d'ajustements ISO → gamme SAP">
        Clique sur un appel de plan. Lis les cotes limites du trou et de l'arbre, déduis la famille d'ajustement, puis choisis l'opération de gamme et les outillages et EPI exacts.
      </SectionHead>
      <div className="flex flex-wrap gap-2">
        {FIT_CASES.map((x) => (
          <Chip key={x.id} active={cur === x.id} tone={solved[x.id] ? "green" : "blue"} onClick={() => setCur(x.id)}>
            <span className="flex items-center gap-2">{solved[x.id] && <CheckCircle2 size={14} className="text-ok" />}<span className="font-mono">{x.call}</span><span className="hidden text-muted sm:inline">· {x.ac}</span></span>
          </Chip>
        ))}
      </div>
      <div className="font-mono text-[12px] text-muted">Appels traduits : <strong className="text-ink">{n}/{FIT_CASES.length}</strong></div>
      <Panel className="p-5"><FitCaseWorkbench key={c.id} c={c} onSolved={() => setSolved((s) => (s[c.id] ? s : { ...s, [c.id]: true }))} /></Panel>
      <ValidatedBanner done={done} label="Les 5 appels de plan sont traduits en opérations de gamme." />
    </div>
  );
}

/* ============================================================
   SIMULATEUR 2 · ATELIER DE CALAGE PELABLE & CONTRÔLE TAMPON
   ============================================================ */
const RELEVES = [
  { id: "r1", name: "Relevé 1 · support avant gauche", pts: [0.66, 0.68, 0.65, 0.69], flat: true },
  { id: "r2", name: "Relevé 2 · support avant droit", pts: [0.42, 0.44, 0.4, 0.43], flat: true },
  { id: "r3", name: "Relevé 3 · support arrière", pts: [0.55, 0.72, 0.58, 0.6], flat: false },
];
const LEAF = 0.05, NOMINAL = 1.0, LEAVES = 20, RESID = 0.05;
const r2 = (v) => Math.round(v * 100) / 100;

function SupportSVG({ pts, kept }) {
  const pos = [[60, 50], [260, 50], [60, 150], [260, 150]];
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full max-w-[380px]" role="img" aria-label="Vue de dessus du support d'équipement avec les 4 points de mesure">
      <rect x="40" y="30" width="240" height="140" rx="8" fill="#111a2e" stroke="#3b9eff" strokeWidth="1.5" />
      <text x="160" y="104" textAnchor="middle" fill="#8fa0bd" fontSize="11" fontFamily="Barlow, sans-serif">Support d'équipement · barque H160</text>
      {pts.map((v, i) => {
        const res = r2(v - kept);
        const col = kept == null ? "#3b9eff" : res < -1e-9 ? "#ff5d6c" : res > RESID + 1e-9 ? "#ffb020" : "#3ddc97";
        const [x, y] = pos[i];
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="18" fill="#0b1220" stroke={col} strokeWidth="2" />
            <text x={x} y={y - 2} textAnchor="middle" fill="#e6edf7" fontSize="10" fontFamily="JetBrains Mono, monospace">P{i + 1}</text>
            <text x={x} y={y + 10} textAnchor="middle" fill={col} fontSize="9" fontFamily="JetBrains Mono, monospace">{mm(v)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ReleveBench({ r, onSolved }) {
  const [peel, setPeel] = useState(0);
  const [verdict, setVerdict] = useState(null);
  const kept = r2(NOMINAL - peel * LEAF);
  const minP = Math.min(...r.pts), maxP = Math.max(...r.pts);
  const spread = r2(maxP - minP);
  const expected = Math.round((NOMINAL - Math.floor(minP / LEAF + 1e-9) * LEAF) / LEAF);
  const res = r.pts.map((v) => r2(v - kept));
  const decide = (choice) => {
    if (choice === "qn") {
      if (!r.flat) { setVerdict({ ok: true, t: `Dispersion ${mm(spread)} mm entre P${r.pts.indexOf(minP) + 1} et P${r.pts.indexOf(maxP) + 1} : aucune cale plane ne peut donner un jeu résiduel ≤ 0,05 mm partout sans serrer un des points. Arrêt, QN, et solution définie par le BE (cale usinée biaise ou calage liquide).` }); onSolved(); }
      else setVerdict({ ok: false, t: `La dispersion n'est que de ${mm(spread)} mm : une cale pelable plane suffit. Bloquer la chaîne ici, c'est une QN inutile.` });
      return;
    }
    if (!r.flat) { setVerdict({ ok: false, t: `Regarde P${r.pts.indexOf(maxP) + 1} : avec une cale plane calée sur le point le plus faible, il reste ${mm(r2(maxP - Math.floor(minP / LEAF + 1e-9) * LEAF))} mm de jeu. Planéité de l'interface hors tolérance : on ne valide pas.` }); return; }
    if (res.some((v) => v < -1e-9)) { setVerdict({ ok: false, t: `Cale trop épaisse : ${mm(kept)} mm pour un point mesuré à ${mm(minP)} mm. Le serrage des fixations plaquerait le support en force (pré-contrainte). Pèle davantage.` }); return; }
    if (res.some((v) => v > RESID + 1e-9)) { setVerdict({ ok: false, t: `Jeu résiduel de ${mm(Math.max(...res))} mm au point le plus ouvert : au-delà de 0,05 mm. Tu as trop pelé.` }); return; }
    setVerdict({ ok: true, t: `${peel} feuillets pelés, ${LEAVES - peel} conservés = ${mm(kept)} mm. Jeu résiduel maxi ${mm(Math.max(...res))} mm, aucun point en serrage. Calage conforme, à enregistrer dans le dossier de suivi.` });
    onSolved();
  };
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col items-center gap-3">
        <SupportSVG pts={r.pts} kept={peel > 0 ? kept : null} />
        <div className="grid w-full grid-cols-4 gap-1.5">
          {r.pts.map((v, i) => (
            <div key={i} className="rounded-md border border-line bg-bg px-2 py-1.5 text-center font-mono text-[11px]">
              <div className="text-muted">P{i + 1}</div>
              <div className="text-ink">{mm(v)}</div>
              {peel > 0 && <div className={res[i] < -1e-9 ? "text-ko" : res[i] > RESID + 1e-9 ? "text-amber" : "text-ok"}>{res[i] < -1e-9 ? `serre ${mm(-res[i])}` : `jeu ${mm(res[i])}`}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4">
          <Stepper label="Feuillets de 0,05 mm à peler" value={peel} min={0} max={LEAVES} onChange={(v) => { setPeel(v); setVerdict(null); }} />
          <ShimStackSVG peel={peel} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Épaisseur conservée" value={`${mm(kept)} mm`} />
          <Stat label="Dispersion des 4 points" value={`${mm(spread)} mm`} tone={spread > RESID ? "text-amber" : "text-ink"} />
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton onClick={() => decide("ok")} tone="green"><CheckCircle2 size={16} /> Valider le calage</PrimaryButton>
          <PrimaryButton onClick={() => decide("qn")} tone="amber"><FileWarning size={16} /> Planéité hors tolérance : QN</PrimaryButton>
        </div>
        {verdict && <Feedback ok={verdict.ok}>{verdict.t}</Feedback>}
        {verdict && verdict.ok && r.flat && <NoteBox>Méthode : épaisseur à conserver = multiple de 0,05 mm juste inférieur ou égal au point le plus serré ({mm(minP)} mm), soit {expected} feuillets à peler.</NoteBox>}
      </div>
    </div>
  );
}

const PLUG_CASES = [
  { id: "t1", label: "Alésage 1", go: true, nogo: false, note: "", answer: 0 },
  { id: "t2", label: "Alésage 2", go: false, nogo: false, note: "", answer: 1 },
  { id: "t3", label: "Alésage 3", go: true, nogo: true, note: "", answer: 2 },
  { id: "t4", label: "Alésage 4", go: true, nogo: false, note: "Rayure hélicoïdale visible à la lampe dans l'alésage", answer: 2 },
];
const PLUG_DECISIONS = ["Conforme : pose de la fixation", "Trop petit : repasser l'alésoir de finition, puis recontrôler", "Non conforme : arrêt, QN"];
const PLUG_WHY = [
  "Le côté Entre (Ø8,000) passe, le côté N'entre pas (Ø8,015) ne passe pas : le diamètre est dans la tolérance H7.",
  "Le côté Entre ne passe pas : le trou est sous la cote mini. C'est une reprise possible, à l'alésoir de finition, avant un nouveau contrôle.",
  "Le côté N'entre pas passe : le trou dépasse 8,015 mm. La matière enlevée ne se remet pas : QN, et fixation de réparation (surcote) définie par le BE.",
  "La dimension est bonne, mais l'état de surface n'est pas conforme au Ra du plan. Une rayure est une amorce de crique : arrêt et QN, même si le tampon est bon.",
];

function PlugSVG({ go, nogo }) {
  return (
    <svg viewBox="-20 0 240 44" className="h-auto w-full max-w-[260px]" role="img" aria-label={`Côté Entre ${go ? "passe" : "ne passe pas"}, côté N'entre pas ${nogo ? "passe" : "ne passe pas"}`}>
      <rect x="10" y="14" width="44" height="16" rx="3" fill="rgba(61,220,151,0.3)" stroke="#3ddc97" />
      <rect x="54" y="10" width="92" height="24" rx="4" fill="#16233d" stroke="#22304d" />
      <rect x="146" y="13" width="44" height="18" rx="3" fill="rgba(255,93,108,0.3)" stroke="#ff5d6c" />
      <text x="32" y="10" textAnchor="middle" fill="#3ddc97" fontSize="9" fontFamily="JetBrains Mono, monospace">ENTRE : {go ? "PASSE" : "BLOQUE"}</text>
      <text x="168" y="10" textAnchor="middle" fill="#ff5d6c" fontSize="9" fontFamily="JetBrains Mono, monospace">N'ENTRE PAS : {nogo ? "PASSE" : "BLOQUE"}</text>
      <text x="100" y="26" textAnchor="middle" fill="#8fa0bd" fontSize="9" fontFamily="JetBrains Mono, monospace">Ø8 H7</text>
    </svg>
  );
}

function PlugBench({ onSolved }) {
  const [picks, setPicks] = useState({});
  const good = PLUG_CASES.filter((c) => picks[c.id] === c.answer).length;
  useEffect(() => { if (good === PLUG_CASES.length) onSolved(); }, [good]);
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Stamp size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Contrôle au tampon lisse Entre / N'entre pas · alésages Ø8 H7</h3>
        <span className="ml-auto font-mono text-xs text-muted">{good}/{PLUG_CASES.length} jugés</span>
      </div>
      <p className="text-[14px] text-muted">Ø8 H7 = 8,000 à 8,015 mm. Côté Entre (Go) Ø8,000, côté N'entre pas (No-Go) Ø8,015. « Passe » signifie que ce côté du tampon entre dans l'alésage.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {PLUG_CASES.map((c) => {
          const p = picks[c.id];
          const ok = p === c.answer;
          return (
            <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-line bg-bg p-4">
              <div className="flex items-center gap-2"><span className="font-display text-lg font-semibold text-ink">{c.label}</span></div>
              <PlugSVG go={c.go} nogo={c.nogo} />
              {c.note && <div className="flex items-center gap-2 text-[13px] text-amber"><Flashlight size={14} /> {c.note}</div>}
              <div className="flex flex-col gap-1.5">
                {PLUG_DECISIONS.map((d, k) => (
                  <Chip key={k} active={p === k} tone={p === k ? (ok ? "green" : "red") : "blue"} disabled={ok} onClick={() => !ok && setPicks({ ...picks, [c.id]: k })}>{d}</Chip>
                ))}
              </div>
              {p !== undefined && <Feedback ok={ok}>{ok ? PLUG_WHY[c.id === "t4" ? 3 : c.answer] : "Relis ce que chaque côté du tampon t'apprend sur le diamètre, et ce que le plan exige en plus de la cote."}</Feedback>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function TabShim({ done, onComplete }) {
  const [cur, setCur] = useState("r1");
  const [solved, setSolved] = useState({});
  const [plugOk, setPlugOk] = useState(false);
  const n = Object.keys(solved).length;
  useEffect(() => { if (n === RELEVES.length && plugOk) onComplete(); }, [n, plugOk]);
  const r = RELEVES.find((x) => x.id === cur);
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Layers} kicker="Onglet 6 · Simulateur 2" title="L'atelier de calage pelable et de contrôle au tampon">
        Relevé d'accostage en 4 points sous un support d'équipement de la barque d'un H160. Cale pelable de 1,00 mm en 20 feuillets de 0,05 mm. Exigence : jeu résiduel ≤ 0,05 mm en tout point, sans aucun point en serrage.
      </SectionHead>
      <div className="flex flex-wrap gap-2">
        {RELEVES.map((x) => (
          <Chip key={x.id} active={cur === x.id} tone={solved[x.id] ? "green" : "blue"} onClick={() => setCur(x.id)}>
            <span className="flex items-center gap-2">{solved[x.id] && <CheckCircle2 size={14} className="text-ok" />}{x.name}</span>
          </Chip>
        ))}
      </div>
      <div className="font-mono text-[12px] text-muted">Relevés traités : <strong className="text-ink">{n}/{RELEVES.length}</strong></div>
      <Panel className="p-5"><ReleveBench key={r.id} r={r} onSolved={() => setSolved((s) => (s[r.id] ? s : { ...s, [r.id]: true }))} /></Panel>
      <PlugBench onSolved={() => setPlugOk(true)} />
      <ValidatedBanner done={done} label="Les 3 relevés de calage et les 4 contrôles au tampon sont traités." />
    </div>
  );
}

/* ============================================================
   SPRINT · 12 QUESTIONS
   ============================================================ */
const QUESTIONS = [
  {
    tag: "Ajustements ISO 286",
    q: "Sur le même plan, tu lis Ø12 H7/g6 sur un guignol et Ø30 H7/p6 sur une bague de ferrure de BTP. Quelle affirmation est juste ?",
    options: ["g6 donne toujours du jeu, p6 toujours du serrage", "Les deux donnent du jeu, seul le diamètre change", "g6 donne du serrage, p6 du jeu", "Les deux sont des ajustements incertains"],
    answer: 0,
    why: "Avec un trou H : lettres a à h = jeu, j à n = incertain, p à z = serrage. g6 est sous la cote nominale, p6 au-dessus du trou maxi.",
    risk: "Une bague p6 traitée comme un montage glissant : l'opérateur force, la bague se coince à mi-course et mate l'alésage de la ferrure de BTP.",
  },
  {
    tag: "Montage azote liquide", scenario: true,
    q: "Tu rédiges l'opération de pose d'une bague Ø25 H7/p6. Quelle séquence est correcte ?",
    options: ["Contracter la bague au LN₂ avec EPI cryogéniques, la poser sans forcer, attendre la remise à température, puis contrôler", "Chauffer la bague au chalumeau, puis la poser au marteau", "Contracter la ferrure au LN₂ et poser la bague à température ambiante", "Poser la bague au LN₂ et contrôler le diamètre immédiatement"],
    answer: 0,
    why: "On refroidit la pièce intérieure (la bague) pour la contracter. Le contrôle se fait après retour à température ambiante, sinon les cotes mesurées sont faussées.",
    risk: "Contrôle fait à froid : cotes faussées, bague déclarée conforme qui bouge ensuite, ou opérateur brûlé par le froid sans gants cryogéniques.",
  },
  {
    tag: "Contrôle tampon lisse", scenario: true,
    q: "Contrôle d'un alésage Ø8 H7 au tampon lisse : le côté Entre passe, le côté N'entre pas passe aussi. Que décides-tu ?",
    options: ["Non conforme : le trou est trop grand, arrêt et QN", "Conforme : les deux côtés passent", "Trop petit : repasser l'alésoir", "Recontrôler avec un autre tampon jusqu'à ce que ça bloque"],
    answer: 0,
    why: "Si le côté N'entre pas (Ø8,015) passe, le trou dépasse la cote maxi. La matière enlevée ne se remet pas : QN et réparation définie par le BE.",
    risk: "Fixation posée dans un trou surdimensionné : jeu sous vibrations, ovalisation, perte de l'ajustement de la fixation structurale.",
  },
  {
    tag: "Cadre ISO GPS",
    q: "Que dit le cadre [⌖ | Ø0,1 Ⓜ | A | B | C] porté sur un trou ?",
    options: ["L'axe du trou doit rester dans un cylindre de Ø0,1 mm positionné par rapport à A, puis B, puis C, avec bonus au maximum de matière", "Le trou doit faire Ø0,1 mm de plus que la cote nominale", "Le trou doit être perpendiculaire à A, B et C à 0,1° près", "La planéité de A, B et C doit être de 0,1 mm"],
    answer: 0,
    why: "⌖ = localisation, Ø = zone cylindrique, Ⓜ = maximum de matière, A | B | C = système de références dans l'ordre primaire, secondaire, tertiaire.",
    risk: "Cadre mal lu : gabarit de perçage indexé sur la mauvaise référence, trous décalés, ferrures non interchangeables.",
  },
  {
    tag: "Isostatisme 3-2-1", scenario: true,
    q: "Dans la gamme d'accostage d'une poutre de queue dans son bâti, références [A | B | C]. Quelle phrase écris-tu ?",
    options: ["Plaquer sur A (3 appuis), puis accoster sur B (2 appuis) en gardant A, puis venir en butée sur C", "Mettre en butée sur C, puis plaquer sur A et B", "Plaquer sur les trois références en même temps", "Accoster sur B, puis plaquer sur A, puis C"],
    answer: 0,
    why: "L'ordre des références est l'ordre de mise en position. A supprime 3 degrés de liberté, B 2, C le dernier.",
    risk: "Pièce mise en butée avant d'être plaquée : elle bascule au serrage, les perçages sont faits hors position.",
  },
  {
    tag: "Isostatisme 3-2-1",
    q: "Combien et quels degrés de liberté supprime la référence secondaire B (appui linéaire, 2 points) ?",
    options: ["2 : une translation et une rotation", "3 : une translation et deux rotations", "1 : une translation", "6 : tous"],
    answer: 0,
    why: "Primaire plan : 3 (1 translation, 2 rotations). Secondaire linéaire : 2 (1 translation, 1 rotation). Tertiaire ponctuel : 1 (la dernière translation). Total 6.",
    risk: "Trop d'appuis sur B : la pièce est hyperstatique, elle se déforme quand on la bride, et se relâche hors cote au débridage.",
  },
  {
    tag: "Maximum de matière Ⓜ",
    q: "Trou Ø10 H8 (10,000 à 10,022 mm) avec ⌖ Ø0,1 Ⓜ. Il mesure 10,018 mm. Quelle zone de position est autorisée ?",
    options: ["Ø0,118 mm", "Ø0,1 mm", "Ø0,082 mm", "Ø0,122 mm"],
    answer: 0,
    why: "Bonus = 10,018 − 10,000 = 0,018 mm. Zone autorisée = 0,1 + 0,018 = Ø0,118 mm.",
    risk: "Bonus ignoré : un trou bon est déclaré hors position, QN et retouche inutiles qui bloquent le poste.",
  },
  {
    tag: "Cale pelable", scenario: true,
    q: "Espace mesuré 0,30 mm sous une ferrure. Cale pelable de 1,00 mm en feuillets de 0,05 mm, jeu résiduel maxi 0,05 mm. Combien de feuillets peler ?",
    options: ["14 feuillets", "6 feuillets", "13 feuillets", "7 feuillets"],
    answer: 0,
    why: "À retirer : 1,00 − 0,30 = 0,70 mm. 0,70 / 0,05 = 14 feuillets. Il en reste 6, soit 0,30 mm.",
    risk: "Cale trop épaisse : la ferrure est plaquée en force au serrage des fixations, avec une pré-contrainte qui fissure la structure en fatigue.",
  },
  {
    tag: "Fraisage proche / opposé",
    q: "Le plan indique un fraisage 100° côté opposé (far side). Qu'est-ce que ta gamme doit préciser ?",
    options: ["La face d'accès pour fraiser : la face cachée de la vue, et l'outillage adapté", "Rien, l'opérateur fraise toujours côté vue", "Qu'il faut fraiser les deux faces", "Qu'il faut remplacer le fraisage par un lamage"],
    answer: 0,
    why: "Far side = le fraisage est sur la face que tu ne vois pas sur la vue. La gamme doit donner la face d'accès en clair pour éviter l'erreur.",
    risk: "Fraisage sur la mauvaise face : tête de fixation en saillie côté aérodynamique, tôle rebutée ou réparée sous QN.",
  },
  {
    tag: "Perpendicularité d'alésage", scenario: true,
    q: "Un trou de Hi-Lok est percé de travers (environ 3° hors normale). L'opérateur propose de serrer plus fort pour plaquer la tête. Ta réponse ?",
    options: ["Non : tête en appui partiel = rupture en fatigue. Arrêt, QN", "Oui, le serrage redressera la fixation", "Oui, avec une rondelle biaise trouvée à l'atelier", "Oui, si le couple reste dans la plage"],
    answer: 0,
    why: "Une tête qui porte d'un seul côté met la fixation en flexion. Le défaut de perpendicularité ne se rattrape pas au serrage : QN et décision du BE.",
    risk: "Hi-Lok en flexion sous vibrations rotor : rupture de fixation en service sur structure primaire.",
  },
  {
    tag: "Lecture ISO 286",
    q: "Dans l'appel Ø16 H7/h6, que désignent H7 et h6 ?",
    options: ["H7 l'alésage (trou), h6 l'arbre (axe)", "H7 l'arbre, h6 l'alésage", "Deux qualités de surface", "La tolérance du trou avant et après traitement"],
    answer: 0,
    why: "Majuscule = alésage, minuscule = arbre. H et h placent tous deux leur zone contre la cote nominale : le jeu mini est nul.",
    risk: "Cotes du trou et de l'axe inversées dans la gamme : mauvais alésoir commandé, alésage hors cote.",
  },
  {
    tag: "Chaîne de cotes", scenario: true,
    q: "Chape A = 20,00 (+0,05 / 0), ferrure B = 19,98 ±0,05. Que donne la chaîne J = A − B au pire cumul ?",
    options: ["Jmin = −0,03 mm (serrage possible), Jmax = 0,12 mm", "Jmin = 0,02 mm, Jmax = 0,07 mm", "Jmin = 0, Jmax = 0,05 mm", "Jmin = 0,07 mm, Jmax = 0,12 mm"],
    answer: 0,
    why: "Jmin = Amin − Bmax = 20,00 − 20,03 = −0,03 mm : serrage possible. Jmax = Amax − Bmin = 20,05 − 19,93 = 0,12 mm. Le jeu nominal (0,02 mm) cache le risque d'interférence.",
    risk: "Interférence non détectée : ferrure montée en force dans la chape, pré-contrainte et blessure des surfaces.",
  },
];

function TabSprint({ done, onComplete, onScore }) {
  const [order, setOrder] = useState(() => shuffle(QUESTIONS.map((_, i) => i)));
  const [perms, setPerms] = useState(() => QUESTIONS.map((q) => shuffle(q.options.map((_, k) => k))));
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState(null);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [started, setStarted] = useState(false);

  const total = order.length;
  const finished = pos >= total;
  const correct = history.filter((h) => h.ok).length;
  const reliability = history.length ? Math.round((correct / history.length) * 100) : 100;
  const q = !finished ? QUESTIONS[order[pos]] : null;

  useEffect(() => {
    if (!finished) return;
    /* Pont LMS : score brut tronqué au dixième (jamais arrondi vers le haut), statut calculé par le portail */
    const raw = (correct / total) * 100;
    if (onScore) onScore(Math.floor(raw * 10) / 10);
    if (raw >= 85) onComplete();
  }, [finished]);

  const answer = (k) => {
    if (picked !== null) return;
    setPicked(k);
    const ok = k === q.answer;
    setHistory([...history, { qi: order[pos], picked: k, ok }]);
    const s = ok ? streak + 1 : 0;
    setStreak(s);
    setBest(Math.max(best, s));
  };
  const next = () => { setPos(pos + 1); setPicked(null); };
  const restart = () => {
    setOrder(shuffle(QUESTIONS.map((_, i) => i)));
    setPerms(QUESTIONS.map((q) => shuffle(q.options.map((_, k) => k))));
    setPos(0); setPicked(null); setHistory([]); setStreak(0); setBest(0); setStarted(true);
  };

  const relTone = reliability >= 85 ? "text-ok" : reliability >= 65 ? "text-amber" : "text-ko";
  const letters = ["A", "B", "C", "D"];

  if (!started) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHead icon={Trophy} kicker="Onglet 7 · Évaluation" title="Sprint Préparateur Méthodes · Module 4A">
          {QUESTIONS.length} questions tirées au hasard, questions et mises en situation sur les ajustements ISO, le montage à l'azote liquide, le cadre ISO GPS, l'isostatisme 3-2-1, le maximum de matière, le calage pelable, le fraisage et la perpendicularité d'alésage (H125, H145, H160, H175). Après chaque réponse, une explication technique te montre pourquoi c'est juste, et ce que l'erreur aurait provoqué sur chaîne ou en audit.
        </SectionHead>
        <div className="grid gap-3 sm:grid-cols-3">
          <Panel className="p-4"><Flame size={18} className="text-amber" /><div className="mt-2 font-display text-lg font-semibold text-ink">Série</div><p className="text-[13px] text-muted">Enchaîne les bonnes réponses pour faire monter ta série.</p></Panel>
          <Panel className="p-4"><Gauge size={18} className="text-ok" /><div className="mt-2 font-display text-lg font-semibold text-ink">Fiabilité industrielle</div><p className="text-[13px] text-muted">Ton taux de bonnes réponses. 85 % minimum pour valider le module.</p></Panel>
          <Panel className="p-4"><AlertTriangle size={18} className="text-ko" /><div className="mt-2 font-display text-lg font-semibold text-ink">Conséquence terrain</div><p className="text-[13px] text-muted">Chaque erreur est reliée à la non-conformité qu'elle aurait causée.</p></Panel>
        </div>
        <div><PrimaryButton onClick={restart} tone="amber"><Zap size={16} /> Lancer le sprint</PrimaryButton></div>
        <ValidatedBanner done={done} label="Sprint réussi avec au moins 85 % de fiabilité." />
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((correct / total) * 100);
    const grade = pct >= 85 ? { t: "Valide", c: "text-ok", d: pct >= 90 ? "Ta gamme partirait en production sans retour du contrôle qualité." : "Bonne maîtrise. Revois les points ci-dessous avant le module suivant." }
      : { t: "À revoir", c: "text-ko", d: "Score inférieur à 85 % : module non validé. Relis les points ci-dessous et les onglets concernés, puis relance le sprint." };
    const errors = history.filter((h) => !h.ok);
    return (
      <div className="flex flex-col gap-6">
        <Panel className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Award size={44} className={grade.c} />
            <div className="min-w-0 flex-1">
              <Eyebrow tone="amber">Débriefing du sprint</Eyebrow>
              <div className={cx("font-display text-3xl font-semibold", grade.c)}>{grade.t}</div>
              <p className="text-[14px] text-ink/85">{grade.d}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-line bg-bg px-3 py-2"><div className="font-mono text-2xl font-semibold text-ink tabular-nums">{correct}/{total}</div><div className="font-mono text-[10px] uppercase text-muted">Bonnes</div></div>
              <div className="rounded-lg border border-line bg-bg px-3 py-2"><div className={cx("font-mono text-2xl font-semibold tabular-nums", grade.c)}>{pct}%</div><div className="font-mono text-[10px] uppercase text-muted">Fiabilité</div></div>
              <div className="rounded-lg border border-line bg-bg px-3 py-2"><div className="font-mono text-2xl font-semibold text-amber tabular-nums">{best}</div><div className="font-mono text-[10px] uppercase text-muted">Meilleure série</div></div>
            </div>
          </div>
        </Panel>
        {errors.length > 0 && (
          <div className="flex flex-col gap-2">
            <Eyebrow tone="red">À revoir · {errors.length} point{errors.length > 1 ? "s" : ""}</Eyebrow>
            {errors.map((h) => {
              const qq = QUESTIONS[h.qi];
              return (
                <Panel key={h.qi} className="p-4">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{qq.tag}</div>
                  <div className="text-[14px] font-semibold text-ink">{qq.q}</div>
                  <div className="mt-1 text-[13px] text-ok">Bonne réponse : {qq.options[qq.answer]}</div>
                  <div className="mt-1 text-[13px] text-ink/80">{qq.why}</div>
                </Panel>
              );
            })}
          </div>
        )}
        <div><PrimaryButton onClick={restart} tone="amber"><RotateCcw size={16} /> Relancer un sprint</PrimaryButton></div>
        <ValidatedBanner done={done} label="Sprint réussi avec au moins 85 % de fiabilité." />
      </div>
    );
  }

  const ok = picked !== null && picked === q.answer;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-2">
        <Panel className="p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Question</div>
          <div className="font-mono text-xl font-semibold text-ink tabular-nums">{pos + 1}<span className="text-muted">/{total}</span></div>
        </Panel>
        <Panel className="p-3">
          <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted"><Flame size={12} className={streak > 0 ? "text-amber" : "text-muted"} /> Série</div>
          <div className={cx("font-mono text-xl font-semibold tabular-nums", streak >= 3 ? "text-amber" : "text-ink")}>{streak}{streak >= 3 && <span className="ml-1 text-sm">en feu</span>}</div>
        </Panel>
        <Panel className="p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Fiabilité industrielle</div>
          <div className={cx("font-mono text-xl font-semibold tabular-nums", relTone)}>{reliability}%</div>
        </Panel>
      </div>
      <div className="flex gap-1" aria-label="Progression du sprint">
        {order.map((qi, i) => {
          const h = history[i];
          return <div key={qi} className={cx("h-1.5 flex-1 rounded-full", h ? (h.ok ? "bg-ok" : "bg-ko") : i === pos ? "bg-sky" : "bg-line")} />;
        })}
      </div>

      <Panel className="p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-sky/50 bg-sky/10 px-2 py-0.5 font-mono text-[11px] text-sky">{q.tag}</span>
          {q.scenario && <span className="rounded-md border border-amber/50 bg-amber/10 px-2 py-0.5 font-mono text-[11px] text-amber">Mise en situation</span>}
        </div>
        <h3 className="font-display text-xl font-semibold leading-snug text-ink sm:text-2xl" style={{ textWrap: "balance" }}>{q.q}</h3>
        <div className="mt-5 flex flex-col gap-2">
          {perms[order[pos]].map((k, slot) => [q.options[k], k, slot]).map(([o, k, slot]) => {
            const isAns = k === q.answer;
            const isPicked = k === picked;
            const state = picked === null ? "idle" : isAns ? "good" : isPicked ? "bad" : "dim";
            return (
              <button key={k} type="button" onClick={() => answer(k)} disabled={picked !== null}
                className={cx("flex items-start gap-3 rounded-lg border p-3 text-left text-[14px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
                  state === "idle" && "border-line bg-bg text-ink hover:border-sky/70",
                  state === "good" && "border-ok bg-ok/10 text-ink",
                  state === "bad" && "border-ko bg-ko/10 text-ink",
                  state === "dim" && "border-line bg-bg text-muted")}>
                <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs font-semibold", state === "good" ? "bg-ok text-bg" : state === "bad" ? "bg-ko text-bg" : "bg-line text-ink")}>{letters[slot]}</span>
                <span className="min-w-0 flex-1">{o}</span>
                {state === "good" && <CheckCircle2 size={18} className="shrink-0 text-ok" />}
                {state === "bad" && <XCircle size={18} className="shrink-0 text-ko" />}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="mt-5 flex flex-col gap-3">
            <div className={cx("rounded-lg border p-4", ok ? "border-ok/50 bg-ok/10" : "border-ko/50 bg-ko/10")}>
              <div className="mb-1 flex items-center gap-2">
                {ok ? <CheckCircle2 size={18} className="text-ok" /> : <XCircle size={18} className="text-ko" />}
                <span className={cx("font-display text-lg font-semibold", ok ? "text-ok" : "text-ko")}>{ok ? "Bonne réponse" : "Réponse incorrecte"}</span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Explication technique</div>
              <p className="mt-1 text-[14px] leading-relaxed text-ink">{q.why}</p>
            </div>
            <div className="rounded-lg border border-amber/40 bg-amber/10 p-4">
              <div className="mb-1 flex items-center gap-2"><AlertTriangle size={16} className="text-amber" /><span className="font-mono text-[11px] uppercase tracking-wider text-amber">{ok ? "Ce que tu viens d'éviter sur chaîne" : "Ce que ton erreur aurait provoqué sur chaîne"}</span></div>
              <p className="text-[14px] leading-relaxed text-ink">{q.risk}</p>
            </div>
            <div><PrimaryButton onClick={next}>{pos + 1 === total ? "Voir le débriefing" : "Question suivante"} <ArrowRight size={16} /></PrimaryButton></div>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ============================================================
   APPLICATION
   ============================================================ */
const TABS = [
  { id: "plan", short: "Lecture de plan", n: "1", icon: Ruler, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "fits", short: "Ajustements ISO", n: "2", icon: Gauge, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "gps", short: "ISO GPS & 3-2-1", n: "3", icon: Crosshair, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "chain", short: "Chaînes de cotes", n: "4", icon: Scale, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "trad", short: "Traducteur ISO → SAP", n: "5", icon: Hammer, rule: "Traduire les 5 appels de plan en opérations de gamme" },
  { id: "shim", short: "Calage & tampon", n: "6", icon: Layers, rule: "Traiter les 3 relevés de calage et les 4 contrôles au tampon" },
  { id: "sprint", short: "Sprint", n: "7", icon: Trophy, rule: "Finir le sprint avec 85 % ou plus" },
];
export default function App({ onSaveScore, onBack, student } = {}) {
  const [tab, setTab] = useState("plan");
  const [progress, setProgress] = useState(() => loadProgress());
  useEffect(() => saveProgress(progress), [progress]);
  const complete = (id) => () => setProgress((p) => (p[id] ? p : { ...p, [id]: true }));
  const doneCount = TABS.filter((t) => progress[t.id]).length;
  const current = TABS.find((t) => t.id === tab);
  const go = (id) => {
    setTab(id);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { /* sans effet */ }
  };
  const idx = TABS.findIndex((t) => t.id === tab);
  const gutter = { paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" };

  return (
    <div className="min-h-full bg-bg text-ink">
      <header className="sticky z-20 border-b border-line bg-bg/95 backdrop-blur" style={{ top: "env(safe-area-inset-top, 0px)" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 py-3" style={gutter}>
          <div className="flex flex-wrap items-center gap-3">
            {onBack && <BackToPortal onBack={onBack} />}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky/50 bg-sky/10"><Wrench size={18} className="text-sky" /></div>
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Bureau des Méthodes · Airbus Helicopters · Module 4A</div>
              <h1 className="font-display text-xl font-semibold leading-none text-ink sm:text-2xl">Lecture de plans, ajustements ISO, ISO GPS & chaînes de cotes</h1>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Onglets validés</div>
                <div className="font-mono text-lg font-semibold text-ok tabular-nums">{doneCount}/{TABS.length}</div>
              </div>
              <div className="flex gap-1">
                {TABS.map((t) => <div key={t.id} className={cx("h-8 w-2 rounded-sm", progress[t.id] ? "bg-ok" : t.id === tab ? "bg-sky" : "bg-line")} title={t.short} />)}
              </div>
            </div>
          </div>
          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5" aria-label="Onglets du module">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = t.id === tab;
              const ok = progress[t.id];
              return (
                <button key={t.id} type="button" onClick={() => go(t.id)} className={cx("flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", active ? "border-sky bg-sky/15 text-ink" : "border-transparent text-muted hover:bg-panel hover:text-ink")}>
                  <span className={cx("flex h-5 w-5 items-center justify-center rounded font-mono text-[11px]", ok ? "bg-ok text-bg" : active ? "bg-sky text-bg" : "bg-line text-ink")}>{ok ? <CheckCircle2 size={12} /> : t.n}</span>
                  <Icon size={14} className="hidden sm:block" />
                  {t.short}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl py-6" style={gutter}>
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-[12px] text-muted">
          <Info size={14} className="text-sky" />
          <span>Pour valider cet onglet : <strong className="text-ink">{current.rule}</strong></span>
          {progress[tab] && <span className="ml-auto inline-flex items-center gap-1 text-ok"><CheckCircle2 size={14} /> Validé</span>}
        </div>

        {tab === "plan" && <TabPlan done={progress.plan} onComplete={complete("plan")} />}
        {tab === "fits" && <TabFits done={progress.fits} onComplete={complete("fits")} />}
        {tab === "gps" && <TabGps done={progress.gps} onComplete={complete("gps")} />}
        {tab === "chain" && <TabChain done={progress.chain} onComplete={complete("chain")} />}
        {tab === "trad" && <TabTranslator done={progress.trad} onComplete={complete("trad")} />}
        {tab === "shim" && <TabShim done={progress.shim} onComplete={complete("shim")} />}
        {tab === "sprint" && <TabSprint done={progress.sprint} onComplete={complete("sprint")} onScore={onSaveScore} />}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <button type="button" onClick={() => idx > 0 && go(TABS[idx - 1].id)} disabled={idx === 0} className={cx("inline-flex items-center gap-1 text-sm font-semibold", idx === 0 ? "text-line" : "text-muted hover:text-ink")}>
            ← {idx > 0 ? TABS[idx - 1].short : "Début"}
          </button>
          <button type="button" onClick={() => setProgress({})} className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ko">
            <RotateCcw size={12} /> Réinitialiser la progression
          </button>
          {idx < TABS.length - 1 ? <PrimaryButton onClick={() => go(TABS[idx + 1].id)}>{TABS[idx + 1].short} <ChevronRight size={16} /></PrimaryButton> : <span />}
        </div>
      </main>
    </div>
  );
}
