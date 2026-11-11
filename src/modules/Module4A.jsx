import React, { useState, useEffect, useMemo } from "react";
import BackToPortal from "../lms/BackToPortal.jsx";
import { scopedKey } from "../lms/session.js";
import LaboPlans from "./plans/LaboPlans.jsx";
import { shuffle, shuffleSpread, permutation, useAtelier, AtelierCounter, AtelierResult, LockRule, LockChip, OptionButton, optState, LETTERS, LockedQuickCheck, SprintQCM, useModuleSession } from "../lib/pedago.jsx";
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
/* Contrôle de fin d'onglet : 1er clic verrouillé, questions et propositions mélangées, validation ≥ 85 % */
function QuickCheck(props) {
  return <LockedQuickCheck {...props} />;
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
/* Choix unique verrouillé au 1er clic : propositions mélangées (Fisher-Yates), bonne réponse révélée après un faux */
function ChoiceStep({ options, answer, picked, onPick }) {
  const [perm] = useState(() => permutation(options.length));
  const locked = picked !== undefined && picked !== null;
  return (
    <div className="flex flex-col gap-2">
      {perm.map((k, i) => (
        <OptionButton key={k} letter={LETTERS[i]} state={optState(k, locked ? picked : undefined, answer)} onClick={() => !locked && onPick(k)}>
          {options[k].t}
        </OptionButton>
      ))}
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
  /* Coupe de deux tôles + symbole porté au plan (vue de dessus) */
  const X = 205, top = 72, mid = 94, bot = 116; // axe de la fixation et faces des tôles
  const rH = 17, rS = 7, dep = (rH - rS) / Math.tan((50 * Math.PI) / 180); // fraisure 100° : demi-angle 50°
  const faceY = far ? bot : top, sgn = far ? -1 : 1; // face fraisée et sens de pénétration
  const cone = `M${X - rH},${faceY} L${X - rS},${faceY + sgn * dep} L${X + rS},${faceY + sgn * dep} L${X + rH},${faceY} Z`;
  const shank = far ? { y: top - 14, h: bot - dep - (top - 14) } : { y: top + dep, h: bot + 14 - (top + dep) };
  const collarY = far ? top - 14 : bot + 4;
  const mono = "JetBrains Mono, monospace", sans = "Barlow, sans-serif";
  const lead = far ? { x1: X - 12, y1: bot - 4, x2: 168, y2: 150 } : { x1: X - 12, y1: top + 4, x2: 168, y2: 44 };
  return (
    <svg viewBox="0 0 460 190" className="h-auto w-full max-w-[560px]" role="img" aria-label={far ? "Fraisage côté opposé à la vue : coupe et symbole au plan" : "Fraisage côté vue : coupe et symbole au plan"}>
      <defs>
        <pattern id="csH1" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#5b7299" strokeWidth="1" /></pattern>
        <pattern id="csH2" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#5b7299" strokeWidth="1" /></pattern>
      </defs>
      <text x={X} y="18" textAnchor="middle" fill="#3b9eff" fontSize="11" fontFamily={mono}>▼ SENS DE LA VUE DU PLAN</text>
      {/* tôles en coupe, hachures croisées d'une tôle à l'autre */}
      <rect x="120" y={top} width="170" height={mid - top} fill="#16233d" /><rect x="120" y={top} width="170" height={mid - top} fill="url(#csH1)" stroke="#8fa0bd" strokeWidth="1.2" />
      <rect x="120" y={mid} width="170" height={bot - mid} fill="#16233d" /><rect x="120" y={mid} width="170" height={bot - mid} fill="url(#csH2)" stroke="#8fa0bd" strokeWidth="1.2" />
      {/* fixation fraisée posée (tête affleurante) */}
      <rect x={X - rS} y={shank.y} width={rS * 2} height={shank.h} fill="#c9d3e3" stroke="#e6edf7" strokeWidth="1" />
      <path d={cone} fill="#ffb020" stroke="#ffd27a" strokeWidth="1.2" />
      <rect x={X - 12} y={collarY} width="24" height="10" rx="2" fill="#9fb0c8" stroke="#e6edf7" strokeWidth="1" />
      <line x1={X} y1={top - 24} x2={X} y2={bot + 24} stroke="#8fa0bd" strokeWidth="0.7" strokeDasharray="10 3 2 3" />
      {/* étiquettes des faces, à gauche, hors du dessin */}
      <text x="12" y="80" fill="#e6edf7" fontSize="11" fontFamily={sans}>Côté vue</text>
      <text x="12" y="92" fill="#8fa0bd" fontSize="10" fontFamily={sans}>near side (NS)</text>
      <text x="12" y="112" fill="#e6edf7" fontSize="11" fontFamily={sans}>Côté opposé</text>
      <text x="12" y="124" fill="#8fa0bd" fontSize="10" fontFamily={sans}>far side (FS)</text>
      {/* rappel de la fraisure */}
      <polyline points={`${lead.x1},${lead.y1} ${lead.x2},${lead.y2} ${lead.x2 - 10},${lead.y2}`} fill="none" stroke="#ffb020" strokeWidth="0.9" />
      <circle cx={lead.x1} cy={lead.y1} r="1.8" fill="#ffb020" />
      <text x={lead.x2 - 14} y={lead.y2 + 4} textAnchor="end" fill="#ffb020" fontSize="11" fontFamily={mono}>fraisure 100°</text>
      <text x={lead.x2 - 14} y={lead.y2 + (far ? 18 : -10)} textAnchor="end" fill="#8fa0bd" fontSize="10" fontFamily={sans}>cage micrométrique</text>
      <text x={X} y="182" textAnchor="middle" fill="#8fa0bd" fontSize="10" fontFamily={sans}>COUPE · 2 tôles · fixation fraisée posée</text>
      {/* symbole porté au plan */}
      <line x1="306" y1="30" x2="306" y2="176" stroke="#22304d" strokeWidth="1" strokeDasharray="4 3" />
      <text x="384" y="34" textAnchor="middle" fill="#e6edf7" fontSize="11" fontFamily={mono}>SYMBOLE AU PLAN</text>
      <circle cx="340" cy="104" r="14" fill="none" stroke="#ffb020" strokeWidth="1.4" strokeDasharray={far ? "4 3" : undefined} />
      <circle cx="340" cy="104" r="6" fill="none" stroke="#e6edf7" strokeWidth="1.4" />
      <line x1="322" y1="104" x2="358" y2="104" stroke="#e6edf7" strokeWidth="1" /><line x1="340" y1="86" x2="340" y2="122" stroke="#e6edf7" strokeWidth="1" />
      <polyline points="350,94 370,70 376,70" fill="none" stroke="#e6edf7" strokeWidth="0.9" />
      <rect x="376" y="52" width="76" height="36" fill="#0f1729" stroke="#e6edf7" strokeWidth="1" /><line x1="376" y1="70" x2="452" y2="70" stroke="#e6edf7" strokeWidth="0.7" />
      <text x="414" y="65" textAnchor="middle" fill="#e6edf7" fontSize="10" fontFamily={mono}>Ø4,8 ⌵100°</text>
      <text x="414" y="83" textAnchor="middle" fill="#ffb020" fontSize="10" fontFamily={mono} fontWeight="700">{far ? "FAR SIDE" : "NEAR SIDE"}</text>
      <text x="384" y="146" textAnchor="middle" fill="#ffb020" fontSize="10" fontFamily={sans}>{far ? "fraisure cachée : pointillés" : "fraisure visible : trait plein"}</text>
      <text x="384" y="160" textAnchor="middle" fill="#8fa0bd" fontSize="10" fontFamily={sans}>drapeau : Ø, angle, côté</text>
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
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr] lg:items-center">
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
    q: "H160, plan de ferrure de BTP en projection européenne (1er dièdre). Où est dessinée la vue de gauche par rapport à la vue de face ?",
    options: ["À droite de la vue de face", "À gauche de la vue de face", "Au-dessus de la vue de face", "En dessous de la vue de face"],
    answer: 0,
    why: "En 1er dièdre, ce que l'on voit depuis la gauche se dessine à droite de la vue de face. En 3e dièdre (projection américaine), c'est l'inverse : on lit d'abord le symbole de projection du cartouche.",
    hint: "En 1er dièdre, on projette la pièce sur le plan placé derrière elle.",
  },
  {
    q: "H145, plan de ferrure : repère -1 dessiné, repère -2 symétrique non dessiné. Tu prépares le poste côté droit, qui reçoit la -2. Comment raisonnes-tu ?",
    options: ["Je monte la -2, géométrie lue en symétrie sur la vue de la -1", "Je monte la -1, seule pièce dont la géométrie est dessinée", "Je monte indifféremment la -1 ou la -2, elles sont interchangeables", "Je monte la -1 retournée de 180° autour de son axe vertical"],
    answer: 0,
    why: "Les pièces symétriques ne sont pas interchangeables : la -2 est l'image miroir de la -1. Sa géométrie se lit en symétrie sur la vue de la -1, et la gamme cite le bon repère pour chaque côté.",
    hint: "Une pièce symétrique n'est jamais une pièce retournée.",
  },
  {
    q: "H175, ferrure de BTP. Le plan exige Ra 0,8 µm dans l'alésage. Après alésage manuel, l'opérateur voit une rayure hélicoïdale. Pourquoi est-ce grave ?",
    options: ["La rayure est une amorce de crique de fatigue sous les vibrations du rotor", "La rayure modifie le diamètre mesuré au-delà de la tolérance IT7", "La rayure empêche l'adhérence du primaire anticorrosion dans l'alésage", "La rayure fausse le contrôle au tampon lisse côté N'entre pas"],
    answer: 0,
    why: "Sous les efforts alternés du rotor, une rayure concentre les contraintes et amorce une crique de fatigue. L'état de surface fait partie de la conformité, au même titre que le diamètre.",
    hint: "Une ferrure de BTP subit des millions de cycles de vibration.",
  },
  {
    q: "H160, plan de revêtement. Le drapeau d'une fixation porte « Ø4,8 ⌵100° FAR SIDE ». Que doit préciser l'opération de gamme ?",
    options: ["La face d'accès réelle pour fraiser, opposée à la vue du plan", "Le diamètre seulement, le côté se déduit au poste de travail", "Un fraisage des deux faces pour couvrir les deux cas possibles", "Un fraisage côté vue, plus simple à réaliser pour l'opérateur"],
    answer: 0,
    why: "FAR SIDE : la fraisure est sur la face que l'on ne voit pas sur la vue. La gamme écrit en clair la face d'accès, et l'outillage de fraisage arrière si besoin.",
    hint: "FAR SIDE = côté opposé à la vue.",
  },
  {
    q: "H145, vue de dessus d'un panneau. Autour d'un trou, le cercle de fraisure est dessiné en pointillés. Que t'indique ce trait ?",
    options: ["La fraisure est sur la face cachée, côté opposé à la vue", "La fraisure est facultative et laissée au choix de l'atelier", "La fraisure est à reprendre en retouche après la peinture", "La fraisure est côté vue mais avec un angle de 82° seulement"],
    answer: 0,
    why: "Une arête cachée se dessine en traits interrompus. Une fraisure vue en pointillés est donc côté opposé (far side).",
    hint: "Trait plein = visible, pointillés = caché.",
  },
  {
    q: "H175, fixation fraisée 100° posée côté vue sur une peau extérieure. Quel contrôle la gamme impose-t-elle après pose ?",
    options: ["L'affleurement de la tête, dans la tolérance du plan (0 / −0,1)", "Le couple de la tête au tournevis dynamométrique étalonné", "La longueur de tige dépassant côté vue, au réglet de 150 mm", "L'absence de mastic visible sous la tête, au miroir d'inspection"],
    answer: 0,
    why: "Côté vue, la tête fraisée doit affleurer la peau aérodynamique : on contrôle l'affleurement au comparateur ou à la jauge, dans la tolérance du plan.",
    hint: "Une tête fraisée côté vue doit être à fleur.",
  },
  {
    q: "H160, cartouche d'un plan fournisseur nord-américain : symbole de projection du 3e dièdre. Où est la vue de dessus ?",
    options: ["Au-dessus de la vue de face, du côté d'où on la regarde", "En dessous de la vue de face, à l'opposé du regard", "À droite de la vue de face, comme la vue de gauche", "Sur une feuille séparée, la projection étant isométrique"],
    answer: 0,
    why: "En 3e dièdre, chaque vue est placée du côté d'où on la regarde : la vue de dessus est au-dessus de la vue de face.",
    hint: "3e dièdre : la vue est du côté du regard.",
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
  /* Zones de tolérance à Ø10 (µm) par rapport à la ligne zéro (cote nominale) */
  const y0 = 140, k = 2.4, Y = (um) => y0 - um * k;
  const mono = "JetBrains Mono, monospace", sans = "Barlow, sans-serif";
  const zones = [
    { x: 90, hi: 15, lo: 0, l: "H7 (+15 / 0 µm)", c: "#3b9eff", t: "trou", ly: "above" },
    { x: 170, hi: -5, lo: -14, l: "g6 (−5 / −14 µm)", c: "#3ddc97", t: "arbre · jeu", ly: "below" },
    { x: 260, hi: 10, lo: 1, l: "k6 (+10 / +1 µm)", c: "#ffb020", t: "arbre · incertain", ly: "above" },
    { x: 350, hi: 24, lo: 15, l: "p6 (+24 / +15 µm)", c: "#ff5d6c", t: "arbre · serrage", ly: "above" },
  ];
  return (
    <svg viewBox="0 0 460 232" className="h-auto w-full max-w-[560px]" role="img" aria-label="Position des zones de tolérance H7, g6, k6 et p6 autour de la ligne zéro, en micromètres">
      {/* axe gradué en µm */}
      <text x="56" y="12" fill="#8fa0bd" fontSize="10" fontFamily={mono}>µm</text>
      <line x1="52" y1={Y(50)} x2="52" y2={Y(-25)} stroke="#8fa0bd" strokeWidth="1" />
      {[50, 25, 0, -25].map((v) => (
        <g key={v}>
          <line x1="47" y1={Y(v)} x2="52" y2={Y(v)} stroke="#8fa0bd" strokeWidth="1" />
          <text x="44" y={Y(v) + 4} textAnchor="end" fill="#8fa0bd" fontSize="10" fontFamily={mono}>{v > 0 ? `+${v}` : v === 0 ? "0" : `−${-v}`}</text>
          {v !== 0 && <line x1="52" y1={Y(v)} x2="440" y2={Y(v)} stroke="#22304d" strokeWidth="0.6" />}
        </g>
      ))}
      {/* ligne zéro */}
      <line x1="52" y1={y0} x2="440" y2={y0} stroke="#e6edf7" strokeWidth="1.2" strokeDasharray="5 3" />
      <text x="440" y={y0 + 16} textAnchor="end" fill="#e6edf7" fontSize="10" fontFamily={sans}>Ligne zéro (cote nominale Ø10,000)</text>
      {zones.map((z) => (
        <g key={z.l}>
          <rect x={z.x} y={Y(z.hi)} width="50" height={(z.hi - z.lo) * k} fill={z.c} fillOpacity="0.25" stroke={z.c} strokeWidth="1.4" />
          <text x={z.x + 25} y={z.ly === "above" ? Y(z.hi) - 6 : Y(z.lo) + 14} textAnchor="middle" fill={z.c} fontSize="10" fontFamily={mono}>{z.l}</text>
          <text x={z.x + 25} y="224" textAnchor="middle" fill="#8fa0bd" fontSize="10" fontFamily={sans}>{z.t}</text>
        </g>
      ))}
    </svg>
  );
}

const Q_FITS = [
  {
    q: "H160, alésage de ferrure coté Ø10 H7 (IT7 = 15 µm à ce diamètre). Quelles sont les cotes limites du trou ?",
    options: ["10,000 à 10,015 mm", "9,985 à 10,000 mm", "9,992 à 10,008 mm", "10,015 à 10,030 mm"],
    answer: 0,
    why: "Majuscule = alésage. Pour H, l'écart inférieur vaut 0 ; IT7 à Ø10 vaut 15 µm. Le trou va donc de 10,000 à 10,015 mm.",
    hint: "Pour la lettre H, l'écart inférieur est toujours nul.",
  },
  {
    q: "H175, bague épaulée Ø25 H7/p6 dans une ferrure de BTP. Quelle famille d'ajustement et quelle prescription de gamme ?",
    options: ["Serrage : bague contractée au LN₂ (ou presse étalonnée), contrôle après retour à température", "Jeu : montage glissant à la main avec graisse de montage, contrôle immédiat", "Incertain : pose au maillet doux après alésage de finition, contrôle immédiat", "Serrage : bague frappée au marteau jusqu'à affleurement, contrôle après pose"],
    answer: 0,
    why: "p est au-delà de n : la bague est plus grande que le trou. On la contracte au LN₂ ou on la presse avec une presse étalonnée, puis on attend le retour à température ambiante avant contrôle.",
    hint: "Les lettres p à z donnent un arbre toujours plus grand que le trou.",
  },
  {
    q: "H145, fixation structurale ajustée Ø8 H7/k6. Pourquoi le bureau d'études choisit-il cet ajustement ?",
    options: ["Pour supprimer le jeu sous vibrations sans imposer un fort serrage", "Pour que l'axe tourne librement dans son alésage en service", "Pour permettre un montage à la main sans aucun outillage", "Pour garantir un serrage fort qui interdit tout démontage"],
    answer: 0,
    why: "Un ajustement incertain donne un jeu ou un serrage de quelques micromètres. La fixation reprend l'effort sans battre sous les vibrations, et reste posable par alésage de finition et maillet doux ou tire-boulon.",
    hint: "Lettres j à n : la zone de l'arbre chevauche celle du trou.",
  },
  {
    q: "H160, arbre Ø10 g6 (−5 / −14 µm). Quelles sont ses cotes limites ?",
    options: ["9,986 à 9,995 mm", "9,995 à 10,005 mm", "10,005 à 10,014 mm", "9,976 à 9,986 mm"],
    answer: 0,
    why: "Écart supérieur −5 µm et inférieur −14 µm : l'arbre va de 10 − 0,014 = 9,986 à 10 − 0,005 = 9,995 mm.",
    hint: "Minuscule = arbre ; retire les écarts à la cote nominale.",
  },
  {
    q: "H145, ajustement Ø10 H7/g6. Quel est le jeu maxi entre l'alésage et l'arbre ?",
    options: ["29 µm, soit 0,029 mm", "5 µm, soit 0,005 mm", "15 µm, soit 0,015 mm", "20 µm, soit 0,020 mm"],
    answer: 0,
    why: "Jeu maxi = alésage maxi − arbre mini = (+15) − (−14) = 29 µm. Le jeu mini vaut 0 − (−5) = 5 µm.",
    hint: "Jeu maxi : le plus grand trou avec le plus petit arbre.",
  },
  {
    q: "H175, ajustement Ø10 H7/p6. Quel est le serrage maxi à prévoir pour le frettage ?",
    options: ["24 µm, soit 0,024 mm", "15 µm, soit 0,015 mm", "9 µm, soit 0,009 mm", "39 µm, soit 0,039 mm"],
    answer: 0,
    why: "Serrage maxi = arbre maxi − alésage mini = 24 − 0 = 24 µm. Le serrage mini vaut 15 − 15 = 0 µm.",
    hint: "Serrage maxi : le plus gros arbre dans le plus petit trou.",
  },
  {
    q: "H160, l'opérateur contrôle un alésage Ø10 H7 au tampon. Le côté « N'entre pas » entre. Ta conclusion ?",
    options: ["Alésage trop grand, hors tolérance : arrêt et déclaration QN", "Alésage conforme, le côté « N'entre pas » est seulement indicatif", "Alésage trop petit : reprendre à l'alésoir de finition Ø10 H7", "Alésage conforme si le côté « Entre » entre aussi sans forcer"],
    answer: 0,
    why: "Le côté N'entre pas est calibré au maxi du trou (10,015). S'il entre, le trou dépasse la tolérance : on ne peut pas reprendre en retirant de la matière, c'est une QN.",
    hint: "Le côté N'entre pas matérialise le diamètre maxi.",
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
  /* 3 appuis à ordonner : chaque choix est verrouillé ; en cas d'erreur, l'appui correct est posé pour continuer */
  const at = useAtelier({ id: "m4a-isostatisme-321", label: "Ordre d'accostage 3-2-1 dans le bâti", total: 3 });
  const btns = useMemo(() => shuffle(["A", "B", "C"]), [at.draw]);
  const [err, setErr] = useState(null);
  useEffect(() => setErr(null), [at.draw]);
  const expected = ["A", "B", "C"];
  const seq = expected.slice(0, at.nb);
  const press = (r) => {
    if (seq.includes(r) || at.finished) return;
    const step = at.nb;
    const ok = r === expected[step];
    at.lock(step, { k: r, ok, q: `Appui n° ${step + 1}`, choix: `Plaquer sur ${r}`, bonne: `Plaquer sur ${expected[step]}` });
    if (!ok) {
      setErr((r === "B" || step === 0
        ? `Tu accostes sur ${r} avant d'avoir plaqué la pièce sur ${expected[step]}. Quand tu la plaqueras ensuite sur ${expected[step]}, elle glissera ou basculera sur ${r} : le positionnement obtenu n'est pas celui que la cotation du plan exige.`
        : `Tu poses la butée C avant d'avoir accosté sur B. La pièce peut encore tourner autour de Z : en l'accostant ensuite sur B, elle quitte la butée C.`) + ` Erreur verrouillée : l'appui correct (${expected[step]}) est posé pour la suite.`);
      return;
    }
    setErr(null);
  };
  const blocked = DOF.filter((d) => seq.includes(d.by)).length;
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Boxes size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Rédige l'ordre d'accostage dans le bâti (règle 3-2-1)</h3>
        <AtelierCounter at={at} />
      </div>
      <LockRule />
      <p className="text-[14px] text-muted">Le plan cote la pièce par rapport à [A | B | C]. Choisis dans quel ordre l'opérateur met la pièce en appui.</p>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr] md:items-center">
        <JigSVG seq={seq} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {btns.map((r) => (
              <Chip key={r} active={seq.includes(r)} tone={seq.includes(r) ? (at.get(expected.indexOf(r))?.ok ? "green" : "red") : "blue"} disabled={seq.includes(r) || at.finished} onClick={() => press(r)}>Plaquer sur {r}</Chip>
            ))}
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
          {seq.length === 3 && <Feedback ok={at.passed}>A (3 points) bloque Tz, Rx, Ry. B (2 points) bloque Ty et Rz. C (1 point) bloque Tx. La pièce est isostatique : chaque appui n'enlève que les degrés de liberté qui restent.</Feedback>}
          <AtelierResult at={at} />
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
    q: "H160, plan de cadre. Dans le cadre de tolérance [⌖ | Ø0,1 Ⓜ | A | B | C] porté sur un trou, que signifie le Ø devant 0,1 ?",
    options: ["La zone de tolérance est un cylindre de Ø0,1 mm autour de la position théorique", "La position est tolérancée à ±0,1 mm séparément en X et en Y", "Le diamètre du trou peut dépasser la cote nominale de 0,1 mm", "La cylindricité de l'alésage doit être meilleure que 0,1 mm"],
    answer: 0,
    why: "Le Ø transforme la zone en cylindre. L'axe réel du trou doit tenir dans ce cylindre de Ø0,1, soit au plus 0,05 mm d'écart radial par rapport à la position théorique.",
    hint: "Le Ø décrit la forme de la zone, pas la taille du trou.",
  },
  {
    q: "H145, mise en bâti d'un cadre coté par rapport à [A | B | C]. Dans quel ordre l'opérateur met-il le cadre en appui ?",
    options: ["A (3 points), puis B (2 points), puis C (1 butée)", "C (1 butée), puis B (2 points), puis A (3 points)", "B (2 points), puis A (3 points), puis C (1 butée)", "A, B et C ensemble, avec bridage simultané"],
    answer: 0,
    why: "L'ordre des références dans le cadre est l'ordre de mise en position : primaire, secondaire, tertiaire. C'est la règle de l'isostatisme 3-2-1.",
    hint: "L'ordre de lecture du cadre est l'ordre d'accostage.",
  },
  {
    q: "H175, contrôle d'un trou Ø8 H8 mesuré à 8,012 mm. Sa localisation est ⌖ Ø0,1 Ⓜ. Quelle zone de position est autorisée ?",
    options: ["Ø0,112 mm", "Ø0,100 mm", "Ø0,088 mm", "Ø0,122 mm"],
    answer: 0,
    why: "Bonus = diamètre réel − maximum de matière = 8,012 − 8,000 = 0,012 mm. Zone autorisée : 0,1 + 0,012 = Ø0,112 mm.",
    hint: "Pour un trou, le maximum de matière est son plus petit diamètre.",
  },
  {
    q: "H160, cadre de tolérance [⊥ | Ø0,05 | A] sur un alésage. Que contrôle-t-on ?",
    options: ["L'axe de l'alésage reste dans un cylindre Ø0,05 perpendiculaire à A", "Le diamètre de l'alésage varie de 0,05 mm au plus sur sa longueur", "La planéité de la face A reste meilleure que 0,05 mm sur la pièce", "La position de l'alésage par rapport à A est à ±0,05 mm en X et Y"],
    answer: 0,
    why: "⊥ = perpendicularité. Avec Ø, la zone est un cylindre de Ø0,05 perpendiculaire à la référence A, dans lequel l'axe réel doit tenir.",
    hint: "⊥ est une tolérance d'orientation.",
  },
  {
    q: "H145, sur le plan, la cote « 50 » est encadrée. Comment la lis-tu ?",
    options: ["Cote théorique exacte, tolérancée par le cadre de localisation", "Cote d'inspection obligatoire à reporter sur le PV de contrôle", "Cote auxiliaire donnée pour information, sans exigence", "Cote à respecter à ±0,1 mm selon la tolérance générale"],
    answer: 0,
    why: "Une cote encadrée est une cote théoriquement exacte (CTE). Elle n'a pas de tolérance propre : c'est le cadre de localisation qui fixe l'écart admis.",
    hint: "Encadrée = théoriquement exacte.",
  },
  {
    q: "H175, trou Ø8 H8 (8,000 à 8,022) avec ⌖ Ø0,1 Ⓜ. Le trou mesure 8,022 mm. Quelle zone de position est autorisée ?",
    options: ["Ø0,122 mm", "Ø0,100 mm", "Ø0,078 mm", "Ø0,144 mm"],
    answer: 0,
    why: "Bonus = 8,022 − 8,000 = 0,022 mm. Zone autorisée : 0,1 + 0,022 = Ø0,122 mm, le maximum possible pour ce trou.",
    hint: "Plus le trou s'éloigne du maximum de matière, plus le bonus grandit.",
  },
  {
    q: "H160, bâti de perçage : la référence primaire A est une grande face plane. Combien de points d'appui reçoit-elle ?",
    options: ["3 points, pour bloquer 1 translation et 2 rotations", "2 points, pour bloquer 2 translations seulement", "1 point, la face étant déjà plane et usinée", "6 points, pour bloquer tous les degrés de liberté"],
    answer: 0,
    why: "Isostatisme 3-2-1 : la primaire reçoit 3 appuis (1 translation + 2 rotations), la secondaire 2, la tertiaire 1, soit 6 degrés de liberté.",
    hint: "3-2-1 : la primaire prend le plus d'appuis.",
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
  const at = useAtelier({ id: "m4a-cale-exemple", label: "Exemple terrain : cale pelable sous ferrure de plancher mécanique", total: SHIM_STEPS.length });
  const peel = at.finished ? 7 : 0;
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Layers size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Exemple terrain : cale pelable sous une ferrure de plancher mécanique</h3>
      </div>
      <p className="text-[14px] leading-relaxed text-ink/85">L'opérateur mesure au jeu de cales un espace résiduel de <strong>0,65 mm</strong>. La gamme autorise un jeu résiduel maxi de <strong>0,05 mm</strong> après calage. La cale pelable fait <strong>1,00 mm</strong>, en feuillets de <strong>0,05 mm</strong> (20 feuillets).</p>
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-4">
          <LockRule />
          {SHIM_STEPS.map((s, i) => {
            const unlocked = i === 0 || at.isLocked(i - 1);
            if (!unlocked) return null;
            const p = at.get(i)?.k;
            return (
              <div key={`${at.draw}-${i}`} className="flex flex-col gap-2">
                <div className="text-[15px] font-medium text-ink">{s.q}</div>
                <ChoiceStep options={s.options} answer={s.answer} picked={p} onPick={(k) => at.lock(i, { k, ok: k === s.answer, q: s.q, choix: s.options[k].t, bonne: s.options[s.answer].t })} />
                {p !== undefined && <Feedback ok={p === s.answer}>{p === s.answer ? s.why : `Faux (verrouillé). Bonne réponse : ${s.options[s.answer].t}. ${s.why}`}</Feedback>}
              </div>
            );
          })}
          <AtelierResult at={at} />
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
    q: "H160, chaîne de cotes d'une chape : A = 24,00 (+0,10 / 0) et B = 23,60 ±0,05. Quel est le jeu mini Jmin de J = A − B ?",
    options: ["0,35 mm", "0,40 mm", "0,55 mm", "0,30 mm"],
    answer: 0,
    why: "Jmin = Amin − Bmax = 24,00 − 23,65 = 0,35 mm. (Jmax = Amax − Bmin = 24,10 − 23,55 = 0,55 mm.)",
    hint: "Jmin : la plus petite place disponible moins la plus grosse pièce.",
  },
  {
    q: "H145, calage d'une ferrure. Espace mesuré 0,45 mm, cale pelable de 1,00 mm en feuillets de 0,05 mm. Combien de feuillets faut-il peler ?",
    options: ["11 feuillets", "9 feuillets", "10 feuillets", "12 feuillets"],
    answer: 0,
    why: "À retirer : 1,00 − 0,45 = 0,55 mm. 0,55 / 0,05 = 11 feuillets. Il reste 9 feuillets, soit 0,45 mm.",
    hint: "Calcule d'abord l'épaisseur à retirer, puis divise par l'épaisseur d'un feuillet.",
  },
  {
    q: "H175, étude d'assemblage. Ton calcul de chaîne de cotes donne Jmin = −0,07 mm. Que signifie ce résultat ?",
    options: ["Au pire cumul, les pièces interfèrent : serrage imprévu à remonter au BE", "Le jeu réel sera toujours de 0,07 mm, quelle que soit la pièce", "Le résultat est négligeable devant la dispersion de mesure", "Il suffit de prévoir une cale de 0,07 mm au montage"],
    answer: 0,
    why: "Un jeu négatif est un serrage. Dans le cas le plus défavorable, les pièces ne rentrent pas sans forcer : il faut remonter l'écart au BE avant de lancer la gamme.",
    hint: "Un jeu négatif, c'est de la matière en trop.",
  },
  {
    q: "H160, chape : A = 24,00 (+0,10 / 0) et B = 23,60 ±0,05. Quel est le jeu maxi Jmax de J = A − B ?",
    options: ["0,55 mm", "0,45 mm", "0,50 mm", "0,35 mm"],
    answer: 0,
    why: "Jmax = Amax − Bmin = 24,10 − 23,55 = 0,55 mm.",
    hint: "Jmax : la plus grande place avec la plus petite pièce.",
  },
  {
    q: "H145, chaîne de 3 cotes tolérancées à ±0,05, ±0,10 et ±0,05. Quel est l'intervalle de tolérance du jeu au pire cumul ?",
    options: ["0,40 mm, somme des intervalles", "0,20 mm, somme des demi-intervalles", "0,10 mm, la plus grande tolérance", "0,25 mm, moyenne des intervalles"],
    answer: 0,
    why: "Au pire cumul, l'IT du jeu est la somme des IT des maillons : 0,10 + 0,20 + 0,10 = 0,40 mm.",
    hint: "Les intervalles de tolérance s'additionnent.",
  },
  {
    q: "H175, calage. Espace mesuré 0,62 mm, cale pelable en feuillets de 0,05 mm, jeu résiduel admis 0 à 0,05 mm. Quelle épaisseur de cale ?",
    options: ["0,60 mm, soit 12 feuillets", "0,65 mm, soit 13 feuillets", "0,55 mm, soit 11 feuillets", "0,62 mm, soit un feuillet coupé"],
    answer: 0,
    why: "On prend le multiple de 0,05 juste en dessous de l'espace : 0,60 mm. Jeu résiduel 0,02 mm, dans la plage admise ; 0,65 mm forcerait l'assemblage.",
    hint: "La cale ne doit jamais dépasser l'espace mesuré.",
  },
  {
    q: "H160, ton calcul donne Jmin = 0,02 mm et Jmax = 0,60 mm pour un jeu exigé de 0,10 à 0,50 mm. Que fais-tu ?",
    options: ["Je prévois un calage ou un appairage, et je remonte l'écart au BE", "Je lance la gamme : le jeu moyen tombe dans l'exigence", "Je resserre la tolérance de la pièce au poste de montage", "J'accepte : l'écart de 0,08 mm reste sous la tolérance générale"],
    answer: 0,
    why: "Les deux bornes sortent de l'exigence au pire cumul. Il faut une solution de montage (cale, appairage) validée par le BE avant de lancer la gamme.",
    hint: "Comparer Jmin et Jmax aux bornes exigées.",
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

function FitCaseWorkbench({ c, at }) {
  const p = Object.fromEntries(["fam", "op", "eq"].filter((k) => at.isLocked(`${c.id}:${k}`)).map((k) => [k, at.get(`${c.id}:${k}`).k]));
  const steps = [
    { key: "fam", q: "1 · Quel type d'ajustement ?", options: FAMILY_OPTS, answer: c.fam },
    { key: "op", q: "2 · Quelle opération écris-tu dans la gamme SAP ?", options: OP_OPTS, answer: c.op },
    { key: "eq", q: "3 · Quels outillages et EPI appelles-tu sur l'opération ?", options: EQ_OPTS, answer: c.eq },
  ];
  const ok = (s) => p[s.key] === s.answer;
  const all = steps.every((s) => p[s.key] !== undefined);
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
        {p.fam !== undefined && <div className="rounded-lg border border-line bg-panel2 px-3 py-2 font-mono text-[13px] text-ink">{fitSummary(c)}</div>}
      </div>
      <div className="flex flex-col gap-4">
        {steps.map((s, i) => {
          if (i > 0 && p[steps[i - 1].key] === undefined) return null;
          const picked = p[s.key];
          return (
            <div key={s.key} className="flex flex-col gap-2">
              <div className="text-[15px] font-medium text-ink">{s.q}</div>
              <ChoiceStep key={`${at.draw}-${c.id}-${s.key}`} options={s.options} answer={s.answer} picked={picked} onPick={(k) => at.lock(`${c.id}:${s.key}`, { k, ok: k === s.answer, q: `${c.call} (${c.ac}) · ${s.q}`, choix: s.options[k].t, bonne: s.options[s.answer].t })} />
              {picked !== undefined && !ok(s) && <Feedback ok={false}>Faux (verrouillé). Attendu : {s.options[s.answer].t}. {i === 0 ? "Compare l'arbre maxi au trou mini, puis l'arbre mini au trou maxi." : picked === 3 ? "Interdit : la frappe directe mate la bague et la ferrure, le chalumeau altère le traitement thermique et la protection de la pièce." : "Ce mode opératoire ne correspond pas à la famille d'ajustement de l'appel de plan."}</Feedback>}
            </div>
          );
        })}
        {all && <Feedback ok={steps.every(ok)}>{c.why}</Feedback>}
      </div>
    </div>
  );
}

function TabTranslator({ done, onComplete }) {
  const at = useAtelier({ id: "m4a-traducteur-iso", label: "Traducteur d'ajustements ISO → gamme SAP (5 appels × 3 décisions)", total: FIT_CASES.length * 3, onComplete });
  const cases = useMemo(() => shuffle(FIT_CASES), [at.draw]);
  const [cur, setCur] = useState(null);
  useEffect(() => setCur(cases[0].id), [at.draw]);
  const isDone = (x) => ["fam", "op", "eq"].every((k) => at.isLocked(`${x.id}:${k}`));
  const isPerfect = (x) => ["fam", "op", "eq"].every((k) => at.get(`${x.id}:${k}`)?.ok);
  const n = FIT_CASES.filter(isDone).length;
  const c = FIT_CASES.find((x) => x.id === (cur || cases[0].id));
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Hammer} kicker="Onglet 5 · Simulateur 1" title="Le traducteur d'ajustements ISO → gamme SAP">
        Clique sur un appel de plan. Lis les cotes limites du trou et de l'arbre, déduis la famille d'ajustement, puis choisis l'opération de gamme et les outillages et EPI exacts. Chaque décision est définitive : validation à 85 % des 15 décisions (13 minimum).
      </SectionHead>
      <LockRule />
      <div className="flex flex-wrap gap-2">
        {cases.map((x) => (
          <Chip key={x.id} active={c.id === x.id} tone={isDone(x) ? (isPerfect(x) ? "green" : "red") : "blue"} onClick={() => setCur(x.id)}>
            <span className="flex items-center gap-2">{isDone(x) && (isPerfect(x) ? <CheckCircle2 size={14} className="text-ok" /> : <XCircle size={14} className="text-ko" />)}<span className="font-mono">{x.call}</span><span className="hidden text-muted sm:inline">· {x.ac}</span></span>
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-[12px] text-muted">Appels traduits : <strong className="text-ink">{n}/{FIT_CASES.length}</strong><AtelierCounter at={at} /></div>
      <Panel className="p-5"><FitCaseWorkbench key={`${at.draw}-${c.id}`} c={c} at={at} /></Panel>
      <AtelierResult at={at} />
      <ValidatedBanner done={done} label="Les 5 appels de plan sont traduits en opérations de gamme (≥ 85 %)." />
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

function ReleveBench({ r, at }) {
  const locked = at.get(r.id);
  const [peel, setPeelRaw] = useState(locked ? locked.peel : 0);
  const verdict = locked ? { ok: locked.ok, t: locked.t } : null;
  const setPeel = (v) => { if (!locked) setPeelRaw(v); };
  const setVerdict = (v) => at.lock(r.id, { ok: v.ok, t: v.t, peel, q: `${r.name} : relevé ${r.pts.map(mm).join(" / ")} mm`, choix: v.choix, bonne: r.flat ? "Calage conforme (cale plane pelée au bon nombre de feuillets)" : "Planéité hors tolérance : QN" });
  const onSolved = () => {};
  const kept = r2(NOMINAL - peel * LEAF);
  const minP = Math.min(...r.pts), maxP = Math.max(...r.pts);
  const spread = r2(maxP - minP);
  const expected = Math.round((NOMINAL - Math.floor(minP / LEAF + 1e-9) * LEAF) / LEAF);
  const res = r.pts.map((v) => r2(v - kept));
  const decide = (choice) => {
    if (choice === "qn") {
      if (!r.flat) { setVerdict({ ok: true, choix: "QN planéité", t: `Dispersion ${mm(spread)} mm entre P${r.pts.indexOf(minP) + 1} et P${r.pts.indexOf(maxP) + 1} : aucune cale plane ne peut donner un jeu résiduel ≤ 0,05 mm partout sans serrer un des points. Arrêt, QN, et solution définie par le BE (cale usinée biaise ou calage liquide).` }); onSolved(); }
      else setVerdict({ ok: false, choix: "QN planéité", t: `La dispersion n'est que de ${mm(spread)} mm : une cale pelable plane suffit. Bloquer la chaîne ici, c'est une QN inutile.` });
      return;
    }
    const ch = `Calage validé à ${peel} feuillets pelés`;
    if (!r.flat) { setVerdict({ ok: false, choix: ch, t: `Regarde P${r.pts.indexOf(maxP) + 1} : avec une cale plane calée sur le point le plus faible, il reste ${mm(r2(maxP - Math.floor(minP / LEAF + 1e-9) * LEAF))} mm de jeu. Planéité de l'interface hors tolérance : on ne valide pas.` }); return; }
    if (res.some((v) => v < -1e-9)) { setVerdict({ ok: false, choix: ch, t: `Cale trop épaisse : ${mm(kept)} mm pour un point mesuré à ${mm(minP)} mm. Le serrage des fixations plaquerait le support en force (pré-contrainte). Pèle davantage.` }); return; }
    if (res.some((v) => v > RESID + 1e-9)) { setVerdict({ ok: false, choix: ch, t: `Jeu résiduel de ${mm(Math.max(...res))} mm au point le plus ouvert : au-delà de 0,05 mm. Tu as trop pelé.` }); return; }
    setVerdict({ ok: true, choix: ch, t: `${peel} feuillets pelés, ${LEAVES - peel} conservés = ${mm(kept)} mm. Jeu résiduel maxi ${mm(Math.max(...res))} mm, aucun point en serrage. Calage conforme, à enregistrer dans le dossier de suivi.` });
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
          <Stepper label="Feuillets de 0,05 mm à peler" value={peel} min={0} max={LEAVES} onChange={(v) => setPeel(v)} />
          <ShimStackSVG peel={peel} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Épaisseur conservée" value={`${mm(kept)} mm`} />
          <Stat label="Dispersion des 4 points" value={`${mm(spread)} mm`} tone={spread > RESID ? "text-amber" : "text-ink"} />
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton onClick={() => decide("ok")} disabled={!!locked} tone="green"><CheckCircle2 size={16} /> Valider le calage (définitif)</PrimaryButton>
          <PrimaryButton onClick={() => decide("qn")} disabled={!!locked} tone="amber"><FileWarning size={16} /> Planéité hors tolérance : QN</PrimaryButton>
        </div>
        {verdict && <Feedback ok={verdict.ok}>{verdict.t}</Feedback>}
        {verdict && r.flat && <NoteBox>Méthode : épaisseur à conserver = multiple de 0,05 mm juste inférieur ou égal au point le plus serré ({mm(minP)} mm), soit {expected} feuillets à peler.</NoteBox>}
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

function PlugBench({ at }) {
  const cases = useMemo(() => shuffle(PLUG_CASES), [at.draw]);
  const decs = useMemo(() => permutation(PLUG_DECISIONS.length), [at.draw]);
  const good = PLUG_CASES.filter((c) => at.get(c.id)?.ok).length;
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Stamp size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Contrôle au tampon lisse Entre / N'entre pas · alésages Ø8 H7</h3>
        <span className="ml-auto font-mono text-xs text-muted">{PLUG_CASES.filter((c) => at.isLocked(c.id)).length}/{PLUG_CASES.length} jugés · {good} justes</span>
      </div>
      <p className="text-[14px] text-muted">Ø8 H7 = 8,000 à 8,015 mm. Côté Entre (Go) Ø8,000, côté N'entre pas (No-Go) Ø8,015. « Passe » signifie que ce côté du tampon entre dans l'alésage.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {cases.map((c) => {
          const p = at.get(c.id)?.k;
          const ok = p === c.answer;
          return (
            <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-line bg-bg p-4">
              <div className="flex items-center gap-2"><span className="font-display text-lg font-semibold text-ink">{c.label}</span></div>
              <PlugSVG go={c.go} nogo={c.nogo} />
              {c.note && <div className="flex items-center gap-2 text-[13px] text-amber"><Flashlight size={14} /> {c.note}</div>}
              <div className="flex flex-col gap-1.5">
                {decs.map((k) => (
                  <LockChip key={k} state={optState(k, p, c.answer)} onClick={() => at.lock(c.id, { k, ok: k === c.answer, q: `${c.label} : Entre ${c.go ? "passe" : "bloque"}, N'entre pas ${c.nogo ? "passe" : "bloque"}${c.note ? " · " + c.note : ""}`, choix: PLUG_DECISIONS[k], bonne: PLUG_DECISIONS[c.answer] })}>{PLUG_DECISIONS[k]}</LockChip>
                ))}
              </div>
              {p !== undefined && <Feedback ok={ok}>{ok ? "" : `Faux (verrouillé). Décision attendue : ${PLUG_DECISIONS[c.answer]}. `}{PLUG_WHY[c.id === "t4" ? 3 : c.answer]}</Feedback>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function TabShim({ done, onComplete }) {
  /* 3 relevés (1 décision chacun) + 4 alésages au tampon = 7 décisions verrouillées ; 85 % = 6/7 */
  const at = useAtelier({ id: "m4a-calage-tampon", label: "Atelier calage pelable (3 relevés) et tampon Go / No-Go (4 alésages)", total: RELEVES.length + PLUG_CASES.length, onComplete });
  const releves = useMemo(() => shuffle(RELEVES), [at.draw]);
  const [cur, setCur] = useState(null);
  useEffect(() => setCur(releves[0].id), [at.draw]);
  const n = RELEVES.filter((x) => at.isLocked(x.id)).length;
  const r = RELEVES.find((x) => x.id === (cur || releves[0].id));
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Layers} kicker="Onglet 6 · Simulateur 2" title="L'atelier de calage pelable et de contrôle au tampon">
        Relevé d'accostage en 4 points sous un support d'équipement de la barque d'un H160. Cale pelable de 1,00 mm en 20 feuillets de 0,05 mm. Exigence : jeu résiduel ≤ 0,05 mm en tout point, sans aucun point en serrage. Une seule décision par relevé et par alésage : ajuste les feuillets avant de valider.
      </SectionHead>
      <LockRule />
      <div className="flex flex-wrap gap-2">
        {releves.map((x) => (
          <Chip key={x.id} active={r.id === x.id} tone={at.isLocked(x.id) ? (at.get(x.id).ok ? "green" : "red") : "blue"} onClick={() => setCur(x.id)}>
            <span className="flex items-center gap-2">{at.isLocked(x.id) && (at.get(x.id).ok ? <CheckCircle2 size={14} className="text-ok" /> : <XCircle size={14} className="text-ko" />)}{x.name}</span>
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-[12px] text-muted">Relevés traités : <strong className="text-ink">{n}/{RELEVES.length}</strong><AtelierCounter at={at} /></div>
      <Panel className="p-5"><ReleveBench key={`${at.draw}-${r.id}`} r={r} at={at} /></Panel>
      <PlugBench at={at} />
      <AtelierResult at={at} />
      <ValidatedBanner done={done} label="Calage pelable et contrôle au tampon validés (≥ 85 %)." />
    </div>
  );
}

/* ============================================================
   SPRINT · 12 QUESTIONS
   ============================================================ */
const QUESTIONS = [
  {
    tag: "Ajustements ISO 286",
    q: "H160, même plan : Ø12 H7/g6 sur un guignol et Ø30 H7/p6 sur une bague de ferrure de BTP. Quelle affirmation est juste ?",
    options: ["g6 donne toujours du jeu, p6 toujours du serrage", "g6 donne toujours du serrage, p6 toujours du jeu", "g6 et p6 donnent du jeu, seul le diamètre change", "g6 et p6 sont deux ajustements incertains"],
    answer: 0,
    why: "Avec un trou H : lettres a à h = jeu, j à n = incertain, p à z = serrage. g6 est sous la cote nominale, p6 au-dessus du trou maxi.",
    risk: "Une bague p6 traitée comme un montage glissant : l'opérateur force, la bague se coince et mate l'alésage de la ferrure.",
  },
  {
    tag: "Montage azote liquide", scenario: true,
    q: "H175, poste ferrures de BTP. Tu rédiges la pose d'une bague Ø25 H7/p6. Quelle séquence est correcte ?",
    options: ["Bague contractée au LN₂ (EPI cryo), posée sans forcer, contrôle après remise à température", "Bague chauffée au four à 150 °C, posée au maillet, contrôle immédiat au tampon", "Ferrure contractée au LN₂, bague posée à l'ambiante, contrôle immédiat au tampon", "Bague contractée au LN₂ (EPI cryo), posée sans forcer, contrôle immédiat à froid"],
    answer: 0,
    why: "On refroidit la pièce intérieure (la bague) pour la contracter. Le contrôle se fait après retour à température ambiante, sinon les cotes mesurées sont faussées.",
    risk: "Contrôle à froid : cotes faussées, bague déclarée conforme qui bouge ensuite.",
  },
  {
    tag: "Contrôle tampon lisse", scenario: true,
    q: "H145, contrôle d'un alésage Ø8 H7 au tampon lisse. Le côté Entre passe, le côté N'entre pas passe aussi. Quelle est ta décision ?",
    options: ["Non conforme : trou trop grand, arrêt et QN", "Conforme : les deux côtés du tampon passent", "Trop petit : nouvelle passe d'alésoir prévue", "À recontrôler avec un second tampon lisse"],
    answer: 0,
    why: "Si le côté N'entre pas (Ø8,015) passe, le trou dépasse la cote maxi. La matière enlevée ne se remet pas : QN et réparation définie par le BE.",
    risk: "Fixation posée dans un trou surdimensionné : jeu sous vibrations, ovalisation, perte de l'ajustement.",
  },
  {
    tag: "Cadre ISO GPS",
    q: "H160, plan de cadre. Que signifie le cadre [⌖ | Ø0,1 Ⓜ | A | B | C] porté sur un trou ?",
    options: ["Axe dans un cylindre Ø0,1 positionné par A, puis B, puis C, bonus au maximum de matière", "Diamètre du trou égal à la cote nominale + 0,1 mm, mesuré depuis A, B et C", "Perpendicularité du trou à 0,1° près par rapport aux trois faces A, B et C", "Planéité de 0,1 mm exigée sur chacune des trois faces de référence A, B et C"],
    answer: 0,
    why: "⌖ = localisation, Ø = zone cylindrique, Ⓜ = maximum de matière, A | B | C = système de références dans l'ordre primaire, secondaire, tertiaire.",
    risk: "Cadre mal lu : gabarit indexé sur la mauvaise référence, trous décalés, ferrures non interchangeables.",
  },
  {
    tag: "Isostatisme 3-2-1", scenario: true,
    q: "H145, accostage d'une poutre de queue dans son bâti, références [A | B | C]. Quelle phrase écris-tu dans la gamme ?",
    options: ["Plaquer sur A (3 appuis), accoster sur B (2 appuis) en gardant A, butée sur C", "Butée sur C, puis plaquer sur A (3 appuis), puis accoster sur B (2 appuis)", "Plaquer simultanément sur A, B et C, puis brider en une seule opération", "Accoster sur B (2 appuis), plaquer sur A (3 appuis), puis butée sur C"],
    answer: 0,
    why: "L'ordre des références est l'ordre de mise en position. A supprime 3 degrés de liberté, B 2, C le dernier.",
    risk: "Pièce mise en butée avant d'être plaquée : elle bascule au serrage, perçages hors position.",
  },
  {
    tag: "Isostatisme 3-2-1",
    q: "H160, montage d'usinage. Combien et quels degrés de liberté supprime la référence secondaire B (appui linéaire, 2 points) ?",
    options: ["2 : une translation et une rotation", "3 : une translation et deux rotations", "1 : une seule translation", "3 : deux translations et une rotation"],
    answer: 0,
    why: "Primaire plan : 3 (1 translation, 2 rotations). Secondaire linéaire : 2 (1 translation, 1 rotation). Tertiaire ponctuel : 1. Total 6.",
    risk: "Trop d'appuis sur B : pièce hyperstatique, déformée au bridage, hors cote au débridage.",
  },
  {
    tag: "Maximum de matière Ⓜ",
    q: "H175, trou Ø10 H8 (10,000 à 10,022 mm) avec ⌖ Ø0,1 Ⓜ. Il mesure 10,018 mm. Quelle zone de position est autorisée ?",
    options: ["Ø0,118 mm", "Ø0,100 mm", "Ø0,082 mm", "Ø0,122 mm"],
    answer: 0,
    why: "Bonus = 10,018 − 10,000 = 0,018 mm. Zone autorisée = 0,1 + 0,018 = Ø0,118 mm.",
    risk: "Bonus ignoré : un trou bon est déclaré hors position, QN et retouche inutiles.",
  },
  {
    tag: "Cale pelable", scenario: true,
    q: "H160, calage sous ferrure. Espace mesuré 0,30 mm, cale pelable de 1,00 mm en feuillets de 0,05 mm. Combien de feuillets peler ?",
    options: ["14 feuillets", "6 feuillets", "13 feuillets", "7 feuillets"],
    answer: 0,
    why: "À retirer : 1,00 − 0,30 = 0,70 mm. 0,70 / 0,05 = 14 feuillets. Il en reste 6, soit 0,30 mm.",
    risk: "Cale trop épaisse : ferrure plaquée en force, pré-contrainte qui fissure la structure en fatigue.",
  },
  {
    tag: "Fraisage côté opposé",
    q: "H145, revêtement de poutre. Le plan indique un fraisage 100° côté opposé (far side). Que doit préciser ta gamme ?",
    options: ["La face d'accès au fraisage (face cachée de la vue) et l'outillage", "Un fraisage côté vue, la mention far side étant indicative", "Un fraisage des deux faces pour garantir l'affleurement", "Un lamage plat à la place du fraisage 100° demandé"],
    answer: 0,
    why: "Far side : le fraisage est sur la face que tu ne vois pas sur la vue. La gamme doit donner la face d'accès en clair pour éviter l'erreur.",
    risk: "Fraisage sur la mauvaise face : tête de fixation en saillie côté aérodynamique, tôle rebutée ou réparée.",
  },
  {
    tag: "Perpendicularité d'alésage", scenario: true,
    q: "H160, jonction de cadre. Un trou de Hi-Lok est percé à environ 3° hors normale. L'opérateur propose de serrer plus fort pour plaquer la tête. Ta réponse ?",
    options: ["Non : tête en appui partiel, fixation en flexion. Arrêt et QN", "Oui : le serrage redresse la fixation dans son logement", "Oui : avec une rondelle biaise prise dans le stock atelier", "Oui : si le couple de pose reste dans la plage du plan"],
    answer: 0,
    why: "Une tête qui porte d'un seul côté met la fixation en flexion. Le défaut de perpendicularité ne se rattrape pas au serrage : QN et décision du BE.",
    risk: "Fixation en flexion sous vibrations : rupture en service sur structure primaire.",
  },
  {
    tag: "Lecture ISO 286",
    q: "H175, appel d'ajustement Ø16 H7/h6 sur un plan de guignol. Que désignent H7 et h6 ?",
    options: ["H7 : l'alésage (trou), h6 : l'arbre (axe)", "H7 : l'arbre (axe), h6 : l'alésage (trou)", "H7 et h6 : deux états de surface exigés", "H7 et h6 : tolérances avant / après traitement"],
    answer: 0,
    why: "Majuscule = alésage, minuscule = arbre. H et h placent tous deux leur zone contre la cote nominale : le jeu mini est nul.",
    risk: "Cotes du trou et de l'axe inversées dans la gamme : mauvais alésoir commandé, alésage hors cote.",
  },
  {
    tag: "Chaîne de cotes", scenario: true,
    q: "H145, chape A = 20,00 (+0,05 / 0) et ferrure B = 19,98 ±0,05. Que donne la chaîne J = A − B au pire cumul ?",
    options: ["Jmin = −0,03 mm (serrage possible), Jmax = 0,12 mm", "Jmin = 0,02 mm, Jmax = 0,07 mm (jeu toujours positif)", "Jmin = 0,00 mm, Jmax = 0,05 mm (jeu toujours positif)", "Jmin = 0,07 mm, Jmax = 0,12 mm (jeu toujours positif)"],
    answer: 0,
    why: "Jmin = Amin − Bmax = 20,00 − 20,03 = −0,03 mm : serrage possible. Jmax = Amax − Bmin = 20,05 − 19,93 = 0,12 mm. Le jeu nominal (0,02 mm) cache le risque d'interférence.",
    risk: "Interférence non détectée : ferrure montée en force dans la chape, pré-contrainte et blessure des surfaces.",
  },
];

function TabLabo({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={FileText} kicker="Onglet 7 · Laboratoire d'étude de plans" title="Trois plans de liasse BE à analyser comme sur poste">
        Un plan de pièce métallique usinée, un plan d'ensemble avec sa nomenclature et un plan de pièce composite. Ouvre chaque plan en grand format, clique sur les repères bleus pour lire chaque exigence, puis extrais toi-même les paramètres de ta gamme dans l'atelier verrouillé du plan.
      </SectionHead>
      <NoteBox>Plans de formation : les références et les valeurs sont réalistes mais fictives. Sur la chaîne, seul le plan applicable au MSN fait foi.</NoteBox>
      <LaboPlans onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu sais extraire d'un plan BE tout ce que ta gamme doit contenir." />
    </div>
  );
}
function TabSprint({ done, onComplete, onScore }) {
  return (
    <SprintQCM questions={QUESTIONS} done={done} onComplete={onComplete} onScore={onScore}
      SectionHead={SectionHead} ValidatedBanner={ValidatedBanner}
      kicker="Onglet 8 · Évaluation" title="Sprint Préparateur Méthodes · Module 4A"
      intro={`${QUESTIONS.length} questions tirées au hasard, questions et mises en situation sur les ajustements ISO, le montage à l'azote liquide, le cadre ISO GPS, l'isostatisme 3-2-1, le maximum de matière, le calage pelable, le fraisage et la perpendicularité d'alésage (H125, H145, H160, H175). Après chaque réponse, une explication technique te montre pourquoi c'est juste, et ce que l'erreur aurait provoqué sur chaîne ou en audit.`} />
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
  { id: "labo", short: "Labo plans", n: "7", icon: FileText, rule: "Valider les 3 ateliers de plans (85 % ou plus chacun)" },
  { id: "sprint", short: "Sprint", n: "8", icon: Trophy, rule: "Finir le sprint avec 85 % ou plus" },
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
        {tab === "labo" && <TabLabo done={progress.labo} onComplete={complete("labo")} />}
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
