import React, { useState, useEffect, useMemo, useRef } from "react";
import BackToPortal from "../lms/BackToPortal.jsx";
import Quincaillerie from "./m2/Quincaillerie.jsx";
import { scopedKey } from "../lms/session.js";
import { shuffle, shuffleSpread, permutation, useAtelier, AtelierCounter, AtelierResult, LockRule, LockChip, OptionButton, optState, LETTERS, LockedQuickCheck, SprintQCM, useModuleSession } from "../lib/pedago.jsx";
import {
  Layers, Hexagon, Wrench, Zap, ListOrdered, Eye, Trophy, Drill, ShieldCheck, ShieldAlert,
  CheckCircle2, XCircle, Flame, RotateCcw, ChevronRight, ArrowUp, ArrowDown, Play,
  Gauge, AlertTriangle, Info, ClipboardList, FileText, Ruler, Award, ArrowRight, Wind,
  Timer, Droplet, Cable, Search, Scale, Fan, Lock, Hand, Plug, Target,
} from "lucide-react";

/* ============================================================
   MODULE 2 · Procédés d'assemblage, fixations & règles de montage
   Airbus Helicopters · Préparateur Méthodes Assemblage
   ============================================================ */
/* ============================================================
   UTILITAIRES
   ============================================================ */
const STORAGE_KEY = "prep-methodes-ah-m2-v1";
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
   BRIQUES SPÉCIFIQUES MODULE 2
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
   ONGLET 1 · ASSEMBLAGE STRUCTUREL
   ============================================================ */
const SEQ_PHASES = [
  {
    phase: "Géométrie", tone: "blue", steps: [
      { t: "Accostage & épinglage", d: "Les pièces sont positionnées sur l'outillage puis maintenues par des épingles Cleco, posées tous les 4 à 6 trous environ. La couleur de l'épingle donne le diamètre." },
      { t: "Perçage en avant-trou", d: "Un premier trou de petit diamètre, au gabarit ou par reprise des avant-trous de la pièce élémentaire." },
      { t: "Contre-perçage", d: "On agrandit au diamètre de pré-alésage, à travers tout l'empilage, pièces maintenues." },
      { t: "Alésage", d: "L'alésoir donne la cylindricité, l'état de surface et la tolérance d'ajustement (ex. H7 ou H8) exigée par la fixation." },
    ],
  },
  {
    phase: "Reprise", tone: "amber", steps: [
      { t: "Démontage obligatoire", d: "On désépingle et on sépare les pièces. C'est la seule façon de voir et d'enlever ce qui est entre les tôles." },
      { t: "Ébavurage & chanfreinage", d: "Les bavures d'entrée et de sortie sont enlevées, les arêtes de trou cassées : pas d'amorce de crique, plaquage parfait." },
      { t: "Nettoyage solvant", d: "Copeaux, poussières et graisses retirés au solvant prescrit. Sans ça, le mastic n'adhère pas." },
    ],
  },
  {
    phase: "Pose définitive", tone: "green", steps: [
      { t: "Mastic d'interposition PR", d: "Film continu de polysulfure entre les surfaces en contact, dans le temps d'utilisation du mélange." },
      { t: "Ré-accostage & pose", d: "Ré-épinglage, puis pose des fixations définitives (souvent en montage humide), avant la fin de la durée de vie en pot." },
    ],
  },
];

const CLECOS = [
  { c: "#c9ced6", n: "Argent", inch: "3/32\"", mm: "2,4 mm" },
  { c: "#c9773a", n: "Cuivre", inch: "1/8\"", mm: "3,2 mm" },
  { c: "#2b2f36", n: "Noir", inch: "5/32\"", mm: "4,0 mm" },
  { c: "#d4b04a", n: "Laiton (or)", inch: "3/16\"", mm: "4,8 mm" },
];

const MATERIAUX = [
  { n: "Aluminium", t: "Alliages 2024 / 7075 · cadres, lisses, revêtements", pts: ["Copeaux longs qui migrent entre les tôles", "Bavure de sortie systématique à reprendre", "Très sensible à la corrosion galvanique face au carbone"] },
  { n: "Carbone CFRP", t: "Revêtements, caissons, carénages du H160", pts: ["Délaminage en sortie : forets carbure ou diamant, appui arrière (martyr)", "Pas de copeau mais une poussière fine et conductrice", "Aspiration à la source obligatoire"] },
  { n: "Titane", t: "Ferrures, zones chaudes et fortement chargées", pts: ["Vitesse de coupe lente, avance régulière, lubrification", "Échauffement : l'outil s'use vite et peut écrouir le trou", "Paramètres dictés par le matériau le plus exigeant de l'empilage"] },
];

function ShimCalculator() {
  const [gap, setGap] = useState(0.4);
  const [uniform, setUniform] = useState(true);
  const STOCK = 1.0, FOIL = 0.05;
  let r;
  if (gap < 0.1) r = { tone: "ok", t: "Pas de calage", d: "Jeu inférieur au seuil admis par le plan : plaquage direct, serrage normal, sans effort de rapprochement." };
  else if (!uniform && gap <= 0.8) r = { tone: "sky", t: "Cale liquide", d: "Le jeu varie sur la surface (biais, ondulation) : seule une résine structurale injectée ou moulée épouse cette forme. Démoulant sur la pièce amovible, respect du temps de polymérisation avant serrage." };
  else if (uniform && gap <= STOCK) {
    const keep = Math.round(gap / FOIL) * FOIL;
    const peel = Math.round((STOCK - keep) / FOIL);
    r = { tone: "amber", t: "Cale pelable", d: `Jeu régulier : cale pelable de ${mm(STOCK)} mm en feuillets de ${mm(FOIL)} mm. Peler ${peel} feuillets au scalpel pour garder ${mm(keep)} mm, contrôler l'épaisseur au micromètre, puis vérifier le plaquage au jeu de cales.` };
  } else r = { tone: "ko", t: "Avis Bureau d'Études", d: "Jeu hors capacité d'une cale standard : on n'improvise pas. Arrêt, déclaration de non-conformité et solution définie par le BE (cale usinée, reprise de pièce)." };

  const toneC = { ok: "text-ok border-ok/50 bg-ok/10", sky: "text-sky border-sky/50 bg-sky/10", amber: "text-amber border-amber/50 bg-amber/10", ko: "text-ko border-ko/50 bg-ko/10" }[r.tone];
  const g = Math.min(gap, 1.2) * 30; // px
  const tilt = uniform ? 0 : g * 0.9;
  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Ruler size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Calculateur de calage</h3>
        <span className="ml-auto font-mono text-[11px] text-muted">support BTP sur plancher mécanique</span>
      </div>
      <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <Slider label="Jeu mesuré au jeu de cales" value={gap} min={0} max={1.2} step={0.05} onChange={setGap} unit="mm" display={mm(gap)} />
          <div className="grid grid-cols-2 gap-2">
            <Chip active={uniform} onClick={() => setUniform(true)}>Jeu régulier</Chip>
            <Chip active={!uniform} onClick={() => setUniform(false)}>Jeu variable (biais)</Chip>
          </div>
          <div className={cx("rounded-lg border p-3", toneC)}>
            <div className="font-display text-lg font-semibold">{r.t}</div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/90">{r.d}</p>
          </div>
          <p className="text-[12px] leading-relaxed text-muted">Seuils pédagogiques. La valeur qui s'applique est celle du plan ou de la norme de calage citée en gamme.</p>
        </div>
        <svg viewBox="0 0 320 180" className="w-full rounded-lg border border-line bg-bg" role="img" aria-label="Coupe du support et du jeu à caler">
          <rect x="20" y="130" width="280" height="26" fill="#24365a" stroke="#5b7299" />
          <text x="30" y="148" fill="#8fa0bd" fontSize="10" fontFamily="JetBrains Mono">STRUCTURE (plancher méca)</text>
          <g transform={`translate(0 ${-g})`}>
            <polygon points={`80,${130 - tilt} 240,130 240,96 80,${96 - tilt}`} fill="#2b5c99" stroke="#3b9eff" />
            <text x="160" y="118" textAnchor="middle" fill="#e6edf7" fontSize="11" fontFamily="Barlow">Support BTP</text>
          </g>
          {gap >= 0.1 && (
            <polygon points={`80,130 240,130 240,${130 - g} 80,${130 - g - tilt}`}
              fill={r.tone === "sky" ? "#3b9eff55" : r.tone === "amber" ? "#ffb02066" : "#ff5d6c55"}
              stroke={r.tone === "sky" ? "#3b9eff" : r.tone === "amber" ? "#ffb020" : "#ff5d6c"} strokeDasharray={r.tone === "amber" ? "0" : "3 2"} />
          )}
          {r.tone === "amber" && Array.from({ length: Math.max(1, Math.round(gap / 0.05)) }).slice(0, 24).map((_, i, arr) => (
            <line key={i} x1="80" x2="240" y1={130 - (g / arr.length) * (i + 1)} y2={130 - (g / arr.length) * (i + 1)} stroke="#ffb020" strokeWidth="0.4" />
          ))}
          <line x1="256" x2="256" y1="130" y2={130 - g} stroke="#e6edf7" />
          <text x="262" y={128 - g / 2} fill="#e6edf7" fontSize="11" fontFamily="JetBrains Mono">{mm(gap)}</text>
          <text x="160" y="24" textAnchor="middle" fill="#ff5d6c" fontSize="11" fontFamily="Barlow" fontWeight="600">Interdit : rattraper ce jeu au serrage</text>
        </svg>
      </div>
    </Panel>
  );
}

const Q_STRUCT = [
  { q: "H160, poste jonction de cadre (zone 300). Après contre-perçage et alésage d'un empilage tôle / cornière, l'opérateur veut poser les Hi-Lok directement pour gagner du temps. Que prescrit la gamme ?", options: ["Démontage, ébavurage, nettoyage des faces, puis pose définitive", "Soufflage à l'air sec des alésages, puis pose définitive immédiate", "Pose directe avec un cordon de PR en excès pour noyer les copeaux", "Pose directe, puis contrôle de plaquage à la cale d'épaisseur"], answer: 0, why: "Le démontage est le seul moyen d'enlever les copeaux et bavures piégés entre les tôles. Un copeau coincé empêche le plaquage, concentre les contraintes et piège l'humidité.", hint: "Pense à ce qui se trouve entre les deux tôles, là où on ne voit rien." },
  { q: "H175, poste panneau de plancher carbone. Tu perces un revêtement composite dont la face de sortie est libre. Quelles prescriptions écris-tu dans la gamme ?", options: ["Foret carbure ou diamant, appui arrière (martyr), aspiration à la source", "Foret acier rapide affûté à 118°, avance forte, soufflage des poussières", "Foret carbure, perçage sans appui arrière, nettoyage final par chiffon humide", "Poinçonnage de l'avant-trou, puis alésage acier rapide sans aspiration"], answer: 0, why: "Sans appui arrière, les derniers plis s'écartent sous la poussée du foret : délaminage de sortie. L'outil carbure ou diamant coupe la fibre proprement, l'aspiration capte une poussière conductrice.", hint: "Le défaut apparaît en sortie de trou, côté où rien ne retient les plis." },
  { q: "H145, pose d'un support d'équipement sur cadre. Un jeu de 0,3 mm subsiste entre support et structure. Le compagnon propose de « serrer un peu plus pour que ça plaque ». Quelle est ta réponse ?", options: ["Refus : le jeu se traite par calage (pelable ou liquide), jamais au serrage", "Accord si le couple appliqué reste dans la plage du plan", "Accord en ajoutant une rondelle plus épaisse sous l'écrou", "Accord si la fixation est en titane, plus résistante"], answer: 0, why: "Tirer une pièce pour fermer un jeu crée des contraintes résiduelles. Sous les vibrations du rotor, elles deviennent des criques de fatigue. Le jeu se traite par une cale.", hint: "Pense à ce que deviennent les contraintes internes sous les vibrations du rotor." },
  { q: "H160, perçage de panneaux carbone en cabine équipée. En plus de la protection de l'opérateur, pourquoi l'aspiration des poussières est-elle obligatoire ?", options: ["Les poussières de carbone sont conductrices : risque de courts-circuits avionique", "Les poussières de carbone accélèrent la polymérisation des mastics PR voisins", "Les poussières de carbone rayent les vitrages et faussent les cotes d'alésage", "Les poussières de carbone dégradent l'adhérence de la peinture de finition"], answer: 0, why: "La fibre de carbone conduit l'électricité. Dispersée dans la cellule, sa poussière se dépose dans les connecteurs et équipements : courts-circuits et pannes intermittentes.", hint: "Le carbone a une propriété électrique particulière." },
];

function TabStructure({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={Layers} kicker="Onglet 1 · Assemblage structurel" title="Percer, aléser, démonter : la séquence qui ne se négocie pas">
        Barque, cabine, poutre de queue : chaque gamme structure suit le même enchaînement. Le préparateur l'écrit opération par opération, parce que l'opérateur sur poste exécute ce qui est écrit, et seulement ça.
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-3">
        {SEQ_PHASES.map((ph, pi) => (
          <Panel key={ph.phase} className="p-4">
            <Eyebrow tone={ph.tone}>Phase {pi + 1} · {ph.phase}</Eyebrow>
            <ol className="mt-3 flex flex-col gap-3">
              {ph.steps.map((s, si) => (
                <li key={s.t} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-line font-mono text-[11px] font-semibold text-ink">
                    {SEQ_PHASES.slice(0, pi).reduce((a, p) => a + p.steps.length, 0) + si + 1}
                  </span>
                  <div className="min-w-0">
                    <div className={cx("text-[14px] font-semibold", s.t.startsWith("Démontage") ? "text-amber" : "text-ink")}>{s.t}</div>
                    <div className="text-[13px] leading-relaxed text-muted">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <DangerBox title="Pourquoi on ne saute jamais le démontage après perçage">
          Un copeau piégé entre deux tôles ne se voit pas et ne s'aspire pas. Il empêche le plaquage, ce qui crée un point dur où les contraintes se concentrent. Il crée aussi une poche qui retient l'humidité et l'électrolyte : la corrosion démarre au cœur de l'assemblage, sous les fixations, là où aucune inspection visuelle ne la verra avant des années.
        </DangerBox>
        <Panel className="p-4">
          <Eyebrow>Code couleur des épingles Cleco</Eyebrow>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {CLECOS.map((c) => (
              <div key={c.n} className="flex items-center gap-3 rounded-lg border border-line bg-bg px-3 py-2">
                <svg width="22" height="30" viewBox="0 0 22 30" aria-hidden="true"><rect x="3" y="2" width="16" height="16" rx="3" fill={c.c} stroke="#5b7299" /><rect x="9" y="18" width="4" height="10" fill="#8fa0bd" /></svg>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-ink">{c.n}</div>
                  <div className="font-mono text-[11px] text-muted">{c.inch} · {c.mm}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted">Code usuel du marché. La gamme cite toujours le diamètre, la couleur n'est qu'une aide visuelle.</p>
        </Panel>
      </div>

      <GammeExtract title="H160 · Poutre de queue · Jonction cadre / revêtement" lines={[
        { op: "OP 010", text: "Accoster le revêtement CFRP sur cadre alu sur outillage. Épingler Ø 3,2 (Cleco cuivre) tous les 4 trous." },
        { op: "OP 020", text: "Percer avant-trou Ø 2,5 puis contre-percer Ø 4,0. Foret carbure, appui arrière, aspiration à la source." },
        { op: "OP 030", text: "Aléser Ø 4,8 H8. Contrôler au tampon lisse Entre / N'entre pas." },
        { op: "OP 040", text: "Désépingler, démonter. Ébavurer et chanfreiner entrée et sortie de trou. Nettoyer au solvant prescrit.", stop: true },
        { op: "OP 050", text: "Appliquer le mastic d'interposition PR, ré-accoster, poser les fixations définitives en montage humide." },
      ]} />

      <div className="flex flex-col gap-4">
        <SectionHead icon={Drill} kicker="Spécificité Airbus Helicopters" title="Structures hybrides : aluminium, carbone et titane dans le même empilage">
          Un caisson de poutre de queue ou une dérive de Fenestron mélange souvent les trois. Chaque matériau impose ses outils et ses paramètres, et l'empilage se perce au rythme du plus exigeant.
        </SectionHead>
        <div className="grid gap-3 md:grid-cols-3">
          {MATERIAUX.map((m) => (
            <Panel key={m.n} className="p-4">
              <div className="font-display text-lg font-semibold text-ink">{m.n}</div>
              <div className="text-[12px] text-muted">{m.t}</div>
              <ul className="mt-3 flex flex-col gap-1.5">
                {m.pts.map((p) => <li key={p} className="flex gap-2 text-[13px] leading-relaxed text-ink/85"><ChevronRight size={14} className="mt-1 shrink-0 text-sky" />{p}</li>)}
              </ul>
            </Panel>
          ))}
        </div>
        <ImpactBox title="Poussières de carbone : deux dangers, une seule parade">
          Elles sont irritantes pour les voies respiratoires et la peau, et elles conduisent l'électricité : déposées dans un connecteur ou un calculateur, elles créent des courts-circuits. La gamme impose l'aspiration à la source sur chaque perçage CFRP, les EPI et un nettoyage par aspiration, jamais par soufflage.
        </ImpactBox>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHead icon={Ruler} kicker="Le calage (shimming)" title="Un jeu se cale. Il ne se tire jamais au serrage.">
          Fermer un jeu en serrant crée des contraintes résiduelles dans la pièce et dans la structure. Sur un hélicoptère, les vibrations du rotor les font travailler en permanence : c'est ainsi que naissent les criques de fatigue.
        </SectionHead>
        <div className="grid gap-3 md:grid-cols-2">
          <RuleCard n="P" title="Cale pelable" tone="amber">Empilage de feuillets métalliques collés (0,05 ou 0,075 mm). On pèle au scalpel jusqu'à l'épaisseur mesurée. Idéale pour un <strong>jeu régulier</strong>, démontable et réutilisable en maintenance.</RuleCard>
          <RuleCard n="L" title="Cale liquide" tone="blue">Résine structurale chargée, injectée ou moulée en place. Elle épouse un <strong>jeu variable</strong> ou en biais. Demande un démoulant et un temps de polymérisation avant serrage.</RuleCard>
        </div>
        <ShimCalculator />
      </div>

      <QuickCheck title="Contrôle de fin d'onglet · Structure" questions={Q_STRUCT} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Séquence structure, matériaux hybrides et calage maîtrisés." />
    </div>
  );
}

/* ============================================================
   ONGLET 2 · FIXATIONS & ÉTANCHÉITÉ / ANTICORROSION
   ============================================================ */
function HiLokSVG() {
  return (
    <svg viewBox="0 0 340 190" className="w-full" role="img" aria-label="Coupe d'une fixation Hi-Lok posée">
      <rect x="40" y="60" width="260" height="28" fill="#5b7299" opacity="0.55" />
      <rect x="40" y="90" width="260" height="28" fill="#2a3448" />
      {Array.from({ length: 13 }).map((_, i) => <line key={i} x1={44 + i * 20} y1="92" x2={54 + i * 20} y2="116" stroke="#3a4a66" />)}
      <text x="46" y="78" fill="#e6edf7" fontSize="10" fontFamily="JetBrains Mono">ALU</text>
      <text x="46" y="108" fill="#e6edf7" fontSize="10" fontFamily="JetBrains Mono">CFRP</text>
      {/* tige */}
      <rect x="160" y="50" width="20" height="98" fill="#c9ced6" />
      <polygon points="146,60 194,60 184,50 156,50" fill="#c9ced6" />
      {Array.from({ length: 6 }).map((_, i) => <line key={i} x1="160" x2="180" y1={124 + i * 4} y2={126 + i * 4} stroke="#6b7a92" />)}
      {/* bague */}
      <rect x="150" y="118" width="40" height="12" fill="#3b9eff" />
      <rect x="156" y="130" width="28" height="4" fill="#1f5fa3" />
      <rect x="154" y="134" width="32" height="10" fill="#3b9eff" opacity="0.35" stroke="#3b9eff" strokeDasharray="2 2" />
      <polygon points="166,148 174,148 177,152 163,152" fill="#0b1220" stroke="#e6edf7" strokeWidth="0.6" />
      {/* annotations */}
      <g fontFamily="Barlow" fontSize="11" fill="#e6edf7">
        <line x1="194" y1="55" x2="236" y2="34" stroke="#8fa0bd" /><text x="240" y="34">Tête fraisée</text>
        <line x1="190" y1="124" x2="236" y2="118" stroke="#8fa0bd" /><text x="240" y="121">Bague auto-freinée</text>
        <line x1="186" y1="132" x2="236" y2="140" stroke="#ffb020" /><text x="240" y="143" fill="#ffb020">Gorge de rupture</text>
        <line x1="186" y1="140" x2="236" y2="162" stroke="#8fa0bd" /><text x="240" y="165">Collerette (cassée)</text>
        <line x1="166" y1="150" x2="124" y2="172" stroke="#8fa0bd" /><text x="120" y="176" textAnchor="end">Empreinte hexagonale</text>
        <line x1="160" y1="140" x2="124" y2="146" stroke="#8fa0bd" /><text x="120" y="150" textAnchor="end">Dépassement de tige</text>
      </g>
    </svg>
  );
}

const FIX_FAMILIES = [
  { icon: Hexagon, n: "Rivet plein", sub: "Solid rivet", d: "Posé par écrasement : bouterolle côté tête, tas côté queue. Exige l'accès aux deux faces. Le contrôle porte sur le diamètre et la hauteur de la tête formée." },
  { icon: Lock, n: "Rivet aveugle structural", sub: "CherryMax, Opti-Blind", d: "Posé d'un seul côté par traction de la tige. Indispensable pour fermer un caisson de poutre de queue ou de dérive Fenestron dont l'intérieur n'est plus accessible." },
  { icon: Target, n: "Hi-Lok / Hi-Lite & Lockbolt", sub: "Fixations haute résistance", d: "Tige filetée retenue par une clé dans son empreinte hexagonale, bague auto-freinée dont la collerette casse au couple prescrit. Le Lockbolt, lui, se sertit par traction." },
];

function GalvanicStack() {
  const [verre, setVerre] = useState(false);
  const [primaire, setPrimaire] = useState(false);
  const [pr, setPr] = useState(false);
  const n = [verre, primaire, pr].filter(Boolean).length;
  const risk = [
    { t: "Corrosion rapide de l'aluminium", c: "text-ko", d: "Contact direct carbone / alu en présence d'humidité : l'alu devient l'anode et se dissout. Attaque visible en quelques mois." },
    { t: "Risque élevé", c: "text-ko", d: "Une seule barrière : le moindre défaut (rayure, porosité) rétablit le contact électrique." },
    { t: "Risque réduit", c: "text-amber", d: "Deux barrières, mais la configuration n'est pas encore celle prescrite par la définition." },
    { t: "Assemblage protégé", c: "text-ok", d: "Isolation électrique (pli de verre), protection de surface (primaire) et étanchéité (PR d'interposition) : configuration conforme." },
  ][n];
  const spots = [10, 6, 3, 0][n];
  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Zap size={18} className="text-amber" />
        <h3 className="font-display text-xl font-semibold text-ink">Le couple infernal carbone / aluminium</h3>
      </div>
      <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-2">
          <p className="text-[13px] leading-relaxed text-muted">Active les barrières que tu prescris dans la gamme et observe l'interface.</p>
          <Toggle on={verre} onClick={() => setVerre(!verre)}>Pli de tissu de verre (isolant)</Toggle>
          <Toggle on={primaire} onClick={() => setPrimaire(!primaire)}>Peinture primaire sur l'aluminium</Toggle>
          <Toggle on={pr} onClick={() => setPr(!pr)}>Mastic PR d'interposition</Toggle>
          <div className="mt-2 rounded-lg border border-line bg-bg p-3">
            <div className={cx("font-display text-lg font-semibold", risk.c)}>{risk.t}</div>
            <p className="text-[13px] leading-relaxed text-ink/85">{risk.d}</p>
          </div>
        </div>
        <svg viewBox="0 0 320 170" className="w-full rounded-lg border border-line bg-bg" role="img" aria-label="Empilage carbone aluminium">
          <rect x="20" y="30" width="280" height="34" fill="#9fb0c8" />
          <text x="28" y="52" fontSize="11" fill="#0b1220" fontFamily="JetBrains Mono" fontWeight="600">ALUMINIUM</text>
          {primaire && <rect x="20" y="64" width="280" height="4" fill="#9bd35a" />}
          {pr && <rect x="20" y={primaire ? 68 : 64} width="280" height="6" fill="#4a4f57" />}
          {verre && <rect x="20" y={64 + (primaire ? 4 : 0) + (pr ? 6 : 0)} width="280" height="5" fill="#e6edf7" opacity="0.85" />}
          {(() => { const y = 64 + (primaire ? 4 : 0) + (pr ? 6 : 0) + (verre ? 5 : 0); return (
            <g>
              <rect x="20" y={y} width="280" height="40" fill="#1b2230" />
              {Array.from({ length: 14 }).map((_, i) => <line key={i} x1={24 + i * 20} y1={y + 2} x2={36 + i * 20} y2={y + 38} stroke="#33405a" />)}
              <text x="28" y={y + 24} fontSize="11" fill="#e6edf7" fontFamily="JetBrains Mono" fontWeight="600">CARBONE CFRP</text>
            </g>); })()}
          {Array.from({ length: spots }).map((_, i) => (
            <ellipse key={i} cx={40 + ((i * 53) % 260)} cy={62 - (i % 3) * 3} rx={6 + (i % 3) * 2} ry="4" fill="#c46a2b" opacity="0.9" />
          ))}
          <g fontFamily="Barlow" fontSize="11">
            <text x="20" y="20" fill="#8fa0bd">Humidité + contact électrique = pile galvanique</text>
            <text x="20" y="160" fill={n === 3 ? "#3ddc97" : "#ff5d6c"}>{n === 3 ? "Barrières conformes" : `${spots} piqûres de corrosion à l'interface`}</text>
          </g>
        </svg>
      </div>
    </Panel>
  );
}

const PR_VOCAB = [
  { t: "Interposition", d: "Film continu de PR entre deux surfaces en contact, appliqué avant accostage. Le surplus qui flue au serrage prouve la continuité du film.", draw: (
    <g><rect x="10" y="14" width="100" height="12" fill="#9fb0c8" /><rect x="10" y="26" width="100" height="4" fill="#4a4f57" /><rect x="10" y="30" width="100" height="12" fill="#5b7299" /></g>) },
  { t: "Cordon / congé", d: "Joint déposé en périphérie de l'assemblage puis lissé en congé, pour fermer l'interface à l'eau et aux fluides.", draw: (
    <g><rect x="10" y="30" width="100" height="12" fill="#5b7299" /><rect x="30" y="16" width="60" height="14" fill="#9fb0c8" /><path d="M22 30 Q30 30 30 22 L30 30 Z" fill="#4a4f57" /><path d="M98 30 Q90 30 90 22 L90 30 Z" fill="#4a4f57" /></g>) },
  { t: "Capotage", d: "Enrobage des têtes de rivets ou des écrous, par exemple en zone carburant, pour l'étanchéité et contre la corrosion.", draw: (
    <g><rect x="10" y="30" width="100" height="12" fill="#5b7299" /><rect x="52" y="22" width="16" height="8" fill="#c9ced6" /><path d="M46 30 Q46 14 60 14 Q74 14 74 30 Z" fill="#4a4f57" opacity="0.85" /></g>) },
  { t: "Montage humide", d: "Le fût de la fixation est enduit de PR juste avant son insertion dans l'alésage : le trou est étanche et protégé.", draw: (
    <g><rect x="10" y="22" width="100" height="20" fill="#5b7299" /><rect x="52" y="6" width="16" height="16" fill="#c9ced6" /><rect x="54" y="22" width="12" height="22" fill="#c9ced6" /><rect x="52" y="22" width="2" height="20" fill="#4a4f57" /><rect x="66" y="22" width="2" height="20" fill="#4a4f57" /></g>) },
];

function PotLifePlanner() {
  const [n, setN] = useState(150);
  const [sec, setSec] = useState(40);
  const need = Math.round((n * sec) / 60 * 1.2);
  const reco = need <= 30 ? { c: "B 1/2", tone: "text-ok", d: "Le travail tient dans 30 min, marge comprise. Le mélange polymérise plus vite : le poste est libéré plus tôt." }
    : need <= 120 ? { c: "B 2", tone: "text-amber", d: "Il faut plus de 30 min. Avec un B 1/2, le mastic commencerait à prendre avant la dernière fixation : mauvais plaquage et adhérence nulle." }
    : { c: "Fractionner", tone: "text-ko", d: "Même un B 2 ne suffit pas. On découpe l'opération en lots et on prépare un mélange neuf pour chacun, ou on retient une classe plus longue si elle est référencée." };
  const max = Math.max(150, need + 10);
  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Timer size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Planificateur de durée de vie en pot</h3>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Slider label="Fixations à poser en montage humide" value={n} min={10} max={250} step={10} onChange={setN} />
          <Slider label="Temps par fixation (enduction + pose)" value={sec} min={15} max={90} step={5} onChange={setSec} unit="s" />
          <div className="rounded-lg border border-line bg-bg p-3 font-mono text-[13px] text-ink/90">
            {n} × {sec} s × 1,2 (marge) = <strong className="text-ink">{need} min</strong>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {[{ l: "B 1/2", v: 30 }, { l: "B 2", v: 120 }, { l: "Besoin", v: need }].map((b) => (
              <div key={b.l} className="flex items-center gap-2">
                <span className="w-16 shrink-0 font-mono text-[12px] text-muted">{b.l}</span>
                <div className="h-4 flex-1 rounded bg-line">
                  <div className={cx("h-4 rounded", b.l === "Besoin" ? (need <= 30 ? "bg-ok" : need <= 120 ? "bg-amber" : "bg-ko") : "bg-sky/70")} style={{ width: `${Math.min(100, (b.v / max) * 100)}%` }} />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-[12px] text-ink tabular-nums">{b.v} min</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-bg p-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Classe à prescrire</div>
            <div className={cx("font-display text-2xl font-semibold", reco.tone)}>{reco.c}</div>
            <p className="text-[13px] leading-relaxed text-ink/85">{reco.d}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

const Q_FIX = [
  { q: "H135, fermeture du caisson de dérive du Fenestron. L'intérieur n'est plus accessible une fois le revêtement posé. Quelle famille de fixations prescris-tu ?", options: ["Rivets aveugles structuraux type CherryMax", "Rivets pleins posés au pistolet et au tas", "Vis et écrous autofreinés standard", "Lockbolts sertis avec bouterolle"], answer: 0, why: "Le rivet plein et le lockbolt exigent un accès côté queue ou collier. Le rivet aveugle structural se pose et se contrôle d'un seul côté.", hint: "Quelle fixation se pose en n'ayant accès qu'à une seule face ?" },
  { q: "H160, poste jonction poutre. Après pose d'une série de Hi-Lok, que doit vérifier le contrôle qualité prescrit par la gamme ?", options: ["Rupture de collerette, dépassement de tige à la jauge, absence de jeu sous tête", "Rupture de collerette, couple résiduel au torquemètre, couleur de la bague", "Dépassement de tige à la jauge, couple résiduel, marquage de la tête de tige", "Rupture de collerette seule, la jauge n'étant utile qu'en cas de doute"], answer: 0, why: "La rupture prouve que le couple de pose a été atteint, la jauge que la longueur de serrage (grip) est la bonne, l'absence de jeu sous tête que l'assemblage est plaqué.", hint: "Il y a trois points à contrôler." },
  { q: "H175, poste étanchéité de caisson. La gamme appelle le mastic « PR 1422 B 2 ». Que signifie le code « B 2 » ?", options: ["Durée d'utilisation du mélange de 2 heures", "Application en 2 couches croisées", "Polymérisation complète en 2 jours", "Épaisseur de cordon de 2 mm"], answer: 0, why: "Le code B donne la durée d'utilisation (vie en pot) du mélange : B 1/2 = 30 min, B 2 = 2 heures. Le préparateur le choisit selon la quantité de travail du poste.", hint: "Le chiffre derrière la lettre B est une durée." },
  { q: "H160, revêtement carbone fixé sur un cadre en alliage d'aluminium. Quelle configuration prescris-tu à l'interface ?", options: ["Pli de verre isolant, primaire sur l'aluminium, PR d'interposition", "Contact direct alu / carbone, PR en cordon extérieur seulement", "Graisse anticorrosion entre pièces, rondelles inox sous écrous", "Primaire sur le carbone seulement, montage à sec au couple"], answer: 0, why: "Carbone et aluminium ont un fort écart de potentiel. Il faut couper le contact électrique (verre), protéger l'aluminium (primaire) et empêcher l'eau d'entrer (PR).", hint: "Il faut empêcher la pile galvanique de se former." },
];

function TabFixations({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={Hexagon} kicker="Onglet 2 · Fixations & étanchéité" title="Choisir la fixation, prescrire son contrôle, la protéger">
        Le choix d'une famille de fixations dépend d'abord de l'accès. Son efficacité dépend ensuite de ce qui l'entoure : le mastic, l'isolation et le contrôle que tu écris dans la gamme.
      </SectionHead>

      <div className="grid gap-3 md:grid-cols-3">
        {FIX_FAMILIES.map((f) => (
          <RuleCard key={f.n} icon={f.icon} title={f.n}>
            <div className="mb-1 font-mono text-[11px] text-muted">{f.sub}</div>{f.d}
          </RuleCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-4">
          <Eyebrow>Anatomie d'un Hi-Lok posé</Eyebrow>
          <HiLokSVG />
        </Panel>
        <div className="flex flex-col gap-3">
          <RuleCard n="1" title="Rupture de collerette">Elle casse exactement au couple prescrit : c'est la preuve de serrage. Une collerette non cassée, ou cassée trop tôt, rend la fixation non conforme.</RuleCard>
          <RuleCard n="2" title="Dépassement de tige">Contrôlé à la jauge Hi-Lok. Trop court ou trop long : la longueur de serrage (grip length) ne correspond pas à l'épaisseur de l'empilage.</RuleCard>
          <RuleCard n="3" title="Absence de jeu sous tête">La tête doit plaquer. Un jeu révèle une bavure, un copeau ou un défaut de fraisure.</RuleCard>
        </div>
      </div>

      <GalvanicStack />

      <div className="flex flex-col gap-4">
        <SectionHead icon={Droplet} kicker="Mastics polysulfures (PR 1422, PR 1776)" title="Le vocabulaire PR que tu écris dans tes gammes">
          Un hélicoptère n'est pas pressurisé : ici, le mastic sert à l'étanchéité aux intempéries et aux fluides, et surtout à la protection anticorrosion des interfaces.
        </SectionHead>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PR_VOCAB.map((v) => (
            <Panel key={v.t} className="p-4">
              <svg viewBox="0 0 120 50" className="mb-2 h-14 w-full rounded border border-line bg-bg" aria-hidden="true">{v.draw}</svg>
              <div className="font-display text-lg font-semibold text-ink">{v.t}</div>
              <p className="text-[13px] leading-relaxed text-ink/85">{v.d}</p>
            </Panel>
          ))}
        </div>
        <ImpactBox title="Le code « B » se choisit, il ne se recopie pas">
          <span className="font-mono">B 1/2</span> = 30 min d'utilisation, <span className="font-mono">B 2</span> = 2 heures. Plus la durée en pot est longue, plus la polymérisation est longue, et plus le poste reste occupé. Tu choisis la classe la plus courte qui couvre tout le travail à faire, marge comprise.
        </ImpactBox>
        <PotLifePlanner />
      </div>

      <Quincaillerie />

      <QuickCheck title="Contrôle de fin d'onglet · Fixations & PR" questions={Q_FIX} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Familles de fixations, anticorrosion et mastics PR maîtrisés." />
    </div>
  );
}

/* ============================================================
   FIL À FREINER · composant SVG partagé (cours + atelier)
   Repère écran : y vers le bas, un couple positif = sens horaire vu côté têtes.
   ============================================================ */
const hexPts = (cx0, cy0, r) => Array.from({ length: 6 }).map((_, i) => {
  const a = (Math.PI / 3) * i + Math.PI / 6;
  return `${(cx0 + r * Math.cos(a)).toFixed(1)},${(cy0 + r * Math.sin(a)).toFixed(1)}`;
}).join(" ");

function twistedPaths(p, q, periods, amp = 3.2) {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L;
  const N = Math.max(40, Math.round(periods * 16));
  const a = [], b = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const s = Math.sin(2 * Math.PI * periods * t) * amp * Math.min(1, t * 8, (1 - t) * 8);
    const x = p[0] + dx * t, y = p[1] + dy * t;
    a.push(`${(x + nx * s).toFixed(1)},${(y + ny * s).toFixed(1)}`);
    b.push(`${(x - nx * s).toFixed(1)},${(y - ny * s).toFixed(1)}`);
  }
  return ["M" + a.join(" L"), "M" + b.join(" L")];
}

function arcArrow(c, r, cw, color, key) {
  const a1 = cw ? -150 : -30, a2 = cw ? -30 : -150;
  const rad = (d) => (d * Math.PI) / 180;
  const P = (d) => [c[0] + r * Math.cos(rad(d)), c[1] + r * Math.sin(rad(d))];
  const s = P(a1), e = P(a2);
  const sweep = cw ? 1 : 0;
  const t = cw ? [-Math.sin(rad(a2)), Math.cos(rad(a2))] : [Math.sin(rad(a2)), -Math.cos(rad(a2))];
  const n = [-t[1], t[0]];
  const tip = [e[0] + t[0] * 7, e[1] + t[1] * 7];
  const h1 = [e[0] + n[0] * 5, e[1] + n[1] * 5], h2 = [e[0] - n[0] * 5, e[1] - n[1] * 5];
  return (
    <g key={key}>
      <path d={`M${s[0]} ${s[1]} A${r} ${r} 0 0 ${sweep} ${e[0]} ${e[1]}`} fill="none" stroke={color} strokeWidth="2.5" />
      <polygon points={`${tip.join(",")} ${h1.join(",")} ${h2.join(",")}`} fill={color} />
    </g>
  );
}

/* bolts : [[x,y],[x,y]] · loosen : bool par vis · twists : torsades/pouce · pigtail : "ok" | "out" · single : méthode fil simple */
function LockwireSVG({ bolts = [[95, 100], [255, 100]], loosen = [false, false], twists = 7, pigtail = "ok", single = false, showForce = false, caption }) {
  const R = 22, HEX = 30, INCH = 80;
  const [A, B] = bolts;
  const unit = (from, to) => { const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy); return [dx / L, dy / L]; };
  const tangent = (c, other, bad) => {
    const [dx, dy] = unit(c, other);
    return bad ? [c[0] - R * dy, c[1] + R * dx] : [c[0] + R * dy, c[1] - R * dx];
  };
  const pA = tangent(A, B, loosen[0]);
  const pB = tangent(B, A, loosen[1]);
  const opp = (c, p) => [2 * c[0] - p[0], 2 * c[1] - p[1]];
  const pA2 = opp(A, pA), pB2 = opp(B, pB);
  const seg = Math.hypot(pB[0] - pA[0], pB[1] - pA[1]);
  const periods = (twists * seg) / INCH;
  const [s1, s2] = twistedPaths(pA, pB, periods);
  // arc extérieur autour de la tête (côté opposé à l'autre vis)
  const outerArc = (c, from, to, other) => {
    const [dx, dy] = unit(c, other);
    const far = [c[0] - dx * (R + 6), c[1] - dy * (R + 6)];
    return `M${from[0]} ${from[1]} Q${far[0] + (from[0] - c[0]) * 0.9} ${far[1] + (from[1] - c[1]) * 0.9} ${far[0]} ${far[1]} Q${far[0] + (to[0] - c[0]) * 0.9} ${far[1] + (to[1] - c[1]) * 0.9} ${to[0]} ${to[1]}`;
  };
  const [ux, uy] = unit(A, B);
  const pigStart = pB2;
  const wire = "#d9dde4";
  let pig;
  if (pigtail === "ok") {
    const end = [pigStart[0] + ux * 26, pigStart[1] + uy * 26];
    const [t1, t2] = twistedPaths(pigStart, end, 3.5, 2.6);
    const back = `M${end[0]} ${end[1]} Q${end[0] + ux * 8} ${end[1] + uy * 8} ${end[0] + ux * 4 - uy * 9} ${end[1] + uy * 4 + ux * 9} L${end[0] - ux * 4 - uy * 12} ${end[1] - uy * 4 + ux * 12}`;
    pig = <g><path d={t1} stroke={wire} strokeWidth="1.6" fill="none" /><path d={t2} stroke={wire} strokeWidth="1.6" fill="none" /><path d={back} stroke={wire} strokeWidth="2.4" fill="none" /></g>;
  } else {
    const end = [pigStart[0] + ux * 62, pigStart[1] + uy * 62];
    const [t1, t2] = twistedPaths(pigStart, end, 2, 2.6);
    pig = <g><path d={t1} stroke={wire} strokeWidth="1.6" fill="none" /><path d={t2} stroke={wire} strokeWidth="1.6" fill="none" /><polygon points={`${end[0]},${end[1] - 3} ${end[0] + ux * 6},${end[1]} ${end[0]},${end[1] + 3}`} fill="#ff5d6c" /></g>;
  }
  return (
    <svg viewBox="0 0 360 200" className="w-full rounded-lg border border-line bg-bg" role="img" aria-label={caption || "Montage de freinage au fil"}>
      <rect x="10" y="40" width="340" height="120" rx="8" fill="#141f36" stroke="#22304d" />
      {[A, B].map((c, i) => (
        <g key={i}>
          <polygon points={hexPts(c[0], c[1], HEX)} fill="#5b7299" stroke="#8fa0bd" strokeWidth="1.2" />
          <circle cx={c[0]} cy={c[1]} r={R - 4} fill="#6b83a8" opacity="0.6" />
          <line x1={(i ? pB : pA)[0]} y1={(i ? pB : pA)[1]} x2={(i ? pB2 : pA2)[0]} y2={(i ? pB2 : pA2)[1]} stroke="#0b1220" strokeWidth="4" strokeLinecap="round" />
          <text x={c[0]} y={c[1] + HEX + 18} textAnchor="middle" fontSize="11" fill="#8fa0bd" fontFamily="JetBrains Mono">VIS {i + 1}</text>
        </g>
      ))}
      {single ? (
        <g>
          <path d={`M${pA2[0]} ${pA2[1]} L${pA[0]} ${pA[1]} L${pB[0]} ${pB[1]} L${pB2[0]} ${pB2[1]}`} stroke={wire} strokeWidth="2" fill="none" />
          <path d={outerArc(A, pA2, [pA2[0] - ux * 14, pA2[1] + 10], B)} stroke={wire} strokeWidth="2" fill="none" />
          <path d={`M${pB2[0]} ${pB2[1]} q${ux * 12} 0 ${ux * 14} 10`} stroke={wire} strokeWidth="2" fill="none" />
        </g>
      ) : (
        <g>
          <path d={s1} stroke={wire} strokeWidth="1.8" fill="none" />
          <path d={s2} stroke={wire} strokeWidth="1.8" fill="none" />
          <path d={outerArc(A, pA2, pA, B)} stroke={wire} strokeWidth="1.8" fill="none" />
          <path d={outerArc(B, pB, pB2, A)} stroke={wire} strokeWidth="1.8" fill="none" />
          {pig}
        </g>
      )}
      {showForce && [A, B].map((c, i) => arcArrow(c, HEX + 10, !loosen[i], loosen[i] ? "#ff5d6c" : "#3ddc97", "f" + i))}
      <g fontFamily="JetBrains Mono" fontSize="10" fill="#8fa0bd">
        <line x1="20" y1="182" x2={20 + INCH} y2="182" stroke="#8fa0bd" />
        <line x1="20" y1="178" x2="20" y2="186" stroke="#8fa0bd" /><line x1={20 + INCH} y1="178" x2={20 + INCH} y2="186" stroke="#8fa0bd" />
        <text x={24 + INCH} y="186">1 pouce (échelle ×2)</text>
        <text x="20" y="26">Filet à droite · vu côté têtes · serrage ↻</text>
      </g>
    </svg>
  );
}

/* ============================================================
   ONGLET 3 · COUPLE, FREINAGE & COMMANDES DE VOL
   ============================================================ */
function TorqueCalculator() {
  const [min, setMin] = useState(10);
  const [max, setMax] = useState(12);
  const [rt, setRt] = useState(3);
  const lo = Math.min(min, max), hi = Math.max(min, max);
  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Gauge size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Calcul du couple à afficher sur la clé</h3>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Slider label="Couple nominal mini (norme)" value={min} min={2} max={40} step={0.5} onChange={setMin} unit="N·m" display={mm(min, 1)} />
          <Slider label="Couple nominal maxi (norme)" value={max} min={2} max={45} step={0.5} onChange={setMax} unit="N·m" display={mm(max, 1)} />
          <Slider label="Couple de freinage mesuré (approche)" value={rt} min={0} max={8} step={0.5} onChange={setRt} unit="N·m" display={mm(rt, 1)} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-line bg-bg p-4 font-mono text-[13px] leading-loose text-ink/90">
            <div>Mini : {mm(lo, 1)} + {mm(rt, 1)} = <strong className="text-ink">{mm(lo + rt, 1)} N·m</strong></div>
            <div>Maxi : {mm(hi, 1)} + {mm(rt, 1)} = <strong className="text-ink">{mm(hi + rt, 1)} N·m</strong></div>
          </div>
          <div className="rounded-lg border border-ok/50 bg-ok/10 p-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-ok">Plage à afficher</div>
            <div className="font-display text-3xl font-semibold text-ink tabular-nums">{mm(lo + rt, 1)} à {mm(hi + rt, 1)} N·m</div>
          </div>
          <p className="text-[12px] leading-relaxed text-muted">Le couple de freinage mesuré doit lui-même rester dans les valeurs mini / maxi de la norme de l'écrou. En dessous du mini, l'écrou a perdu son pouvoir de freinage : il est rebuté, jamais réutilisé.</p>
        </div>
      </div>
    </Panel>
  );
}

function BNutSVG({ noBackup = false }) {
  return (
    <svg viewBox="0 0 320 140" className="w-full rounded-lg border border-line bg-bg" role="img" aria-label="Serrage d'un raccord B-nut avec clé de contre-couple">
      <rect x="20" y="62" width="110" height="14" fill="#9fb0c8" />
      <rect x="200" y="62" width="100" height="14" fill="#9fb0c8" />
      <rect x="128" y="52" width="40" height="34" fill="#5b7299" stroke="#8fa0bd" />
      <rect x="168" y="56" width="34" height="26" fill="#3b9eff" stroke="#8fd0ff" />
      <text x="148" y="104" textAnchor="middle" fontSize="10" fill="#8fa0bd" fontFamily="JetBrains Mono">RACCORD FIXE</text>
      <text x="185" y="48" textAnchor="middle" fontSize="10" fill="#8fd0ff" fontFamily="JetBrains Mono">B-NUT</text>
      {noBackup ? (
        <g>
          {[40, 60, 80, 100].map((x) => <line key={x} x1={x} y1="60" x2={x + 8} y2="78" stroke="#ff5d6c" strokeWidth="1.5" />)}
          <text x="20" y="100" fontSize="11" fill="#ff5d6c" fontFamily="Barlow" fontWeight="600">Marques de vrillage du tube</text>
          <text x="20" y="124" fontSize="11" fill="#8fa0bd" fontFamily="Barlow">Aucune clé sur le raccord fixe</text>
        </g>
      ) : (
        <g>
          <rect x="140" y="86" width="16" height="44" rx="3" fill="#ffb020" />
          <text x="96" y="124" fontSize="11" fill="#ffb020" fontFamily="Barlow" fontWeight="600">Contre-couple</text>
        </g>
      )}
      <rect x="178" y="10" width="14" height="46" rx="3" fill="#3ddc97" />
      <text x="200" y="22" fontSize="11" fill="#3ddc97" fontFamily="Barlow" fontWeight="600">Clé dynamométrique</text>
      <text x="20" y="40" fontSize="10" fill="#8fa0bd" fontFamily="JetBrains Mono">TUYAUTERIE HYDRAULIQUE</text>
    </svg>
  );
}

const Q_TORQUE = [
  { q: "H145, poste fixation de support. Écrou autofreiné, couple nominal 20 à 24 N·m. Le couple de freinage mesuré à l'approche est de 3 N·m et la norme demande de l'ajouter. Quelle plage l'opérateur doit-il afficher ?", options: ["23 à 27 N·m", "20 à 24 N·m", "17 à 21 N·m", "21,5 à 25,5 N·m"], answer: 0, why: "Le couple de freinage est consommé par le frottement de l'élément freineur, pas par la mise en tension de la vis. On l'ajoute : 20 + 3 et 24 + 3.", hint: "Le freinage absorbe une partie du couple sans serrer la vis." },
  { q: "H160, plancher mécanique, serrage d'un raccord B-nut de tuyauterie hydraulique. Pourquoi la gamme impose-t-elle une clé de contre-couple ?", options: ["Pour ne pas transmettre de torsion au tube, qui se vrillerait", "Pour mesurer le couple appliqué sans torquemètre étalonné", "Pour remplacer le freinage au fil sur ce type de raccord", "Pour répartir l'effort et réduire la fatigue de l'opérateur"], answer: 0, why: "Sans maintien du raccord fixe, l'effort de serrage fait tourner l'ensemble et vrille le tube : contrainte permanente, fissure par fatigue vibratoire, fuite.", hint: "Que subit le tube si le raccord tourne avec l'écrou ?" },
  { q: "H125, compartiment BTP, freinage au fil d'un bouchon de vidange. Quelle est la règle de pose du fil à freiner ?", options: ["Le fil doit tirer la fixation dans le sens du serrage", "Le fil doit être tendu au maximum, quel que soit le sens", "Le fil doit compter au moins 20 torsades par pouce", "Le fil d'un démontage peut être réutilisé s'il est intact"], answer: 0, why: "Si la fixation tente de se desserrer sous les vibrations, le fil se tend et la retient. Posé à l'envers, il l'aide au contraire à se dévisser. Le fil n'est jamais réutilisé.", hint: "Le fil doit s'opposer au desserrage." },
  { q: "H160, bielle de commande ATA 67. L'écrou à créneaux atteint le couple mini et aucun créneau n'est en face du trou de goupille. Que fait l'opérateur ?", options: ["Il poursuit jusqu'au créneau suivant sans dépasser le couple maxi", "Il desserre jusqu'au créneau précédent pour aligner le trou", "Il pose la goupille en biais dans le créneau le plus proche", "Il remplace la goupille par un freinage au fil à freiner"], answer: 0, why: "On ne desserre jamais pour aligner, on ne force jamais au-delà du maxi. Si aucun créneau n'est accessible dans la plage, on change la rondelle ou l'écrou selon la norme.", hint: "Desserrer fait tomber sous le couple mini." },
];

function TabTorque({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={Wrench} kicker="Onglet 3 · Couple & freinage" title="Les vibrations du rotor dévissent tout ce qui n'est pas freiné">
        Sur un hélicoptère, chaque fixation vit dans un champ vibratoire permanent. Le bon couple donne la précharge, le freinage positif la conserve. Les commandes de vol (ATA 67) cumulent les deux exigences.
      </SectionHead>

      <div className="grid gap-3 md:grid-cols-2">
        <RuleCard n="1" title="Couple libre">Couple nécessaire pour faire tourner l'écrou avant tout plaquage, sur un filet sans élément freineur. Sur un écrou standard, il est quasi nul.</RuleCard>
        <RuleCard n="2" title="Couple de freinage (running torque)">Couple résistant d'un écrou auto-freiné (filet déformé ou bague nylon), mesuré pendant l'approche, avant plaquage. Il ne crée aucune tension dans la vis.</RuleCard>
      </div>
      <ImpactBox title="La règle d'addition, quand la norme l'exige (BNAE, ECS, EICM)">
        L'opérateur mesure d'abord le couple de freinage à l'approche, puis il l'ajoute au couple nominal. La gamme doit dire explicitement si l'addition s'applique, sinon chaque opérateur fera sa propre interprétation.
      </ImpactBox>
      <TorqueCalculator />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <SectionHead icon={Droplet} kicker="Tuyauteries hydrauliques & carburant" title="Raccord B-nut : toujours deux clés" />
          <p className="text-[14px] leading-relaxed text-ink/85">Une clé de contre-couple maintient le raccord fixe pendant que la clé dynamométrique serre l'écrou. Sans elle, le tube se vrille : contrainte permanente, criques sous vibrations, fuite.</p>
        </div>
        <BNutSVG />
      </div>

      <div className="flex flex-col gap-4">
        <SectionHead icon={Lock} kicker="Freinage positif" title="Fil à freiner : il tire toujours dans le sens du serrage" />
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-2">
            <LockwireSVG showForce caption="Montage double torsade conforme avec sens d'effort" />
            <p className="text-[12px] text-muted">Les flèches vertes montrent l'effort exercé par le fil : il fait tourner chaque vis dans le sens horaire, celui du serrage.</p>
          </div>
          <div className="flex flex-col gap-2">
            <RuleCard n="1" title="Sens de traction">Si la vis veut se desserrer, le fil se tend et la retient. Vérifie chaque tête, pas seulement la dernière.</RuleCard>
            <RuleCard n="2" title="Torsades régulières">6 à 8 torsades par pouce, serrées et régulières, fil tendu sans être entaillé.</RuleCard>
            <RuleCard n="3" title="Queue de cochon (pigtail)">Extrémité de 3 à 6 torsades, coupée et repliée vers l'intérieur : personne ne s'y blesse et rien ne se détache en FOD.</RuleCard>
            <RuleCard n="4" title="Fil neuf">Un fil à freiner ne se réutilise jamais après dépose.</RuleCard>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <RuleCard icon={Hexagon} title="Goupille fendue & écrou à créneaux">Très utilisés sur les axes de bielles de commandes de vol (ATA 67). Serrer au mini, puis aller au créneau suivant sans dépasser le maxi. Goupille neuve, branches rabattues sans entaille.</RuleCard>
        <RuleCard icon={Eye} title="Vernis témoin (torque seal)">Trait continu posé après contrôle : vis, écrou, rondelle et support. Un trait cassé signale à l'œil qu'il y a eu rotation.</RuleCard>
      </div>
      <DangerBox title="Commandes de vol ATA 67 : double contrôle indépendant">
        Toute intervention sur une chaîne de commandes de vol (pose de bielle, réglage, freinage) se clôt par un contrôle réalisé par une seconde personne qui n'a pas fait le travail. Le préparateur l'inscrit en point d'arrêt dans la gamme, avec les deux signatures.
      </DangerBox>

      <QuickCheck title="Contrôle de fin d'onglet · Couple & freinage" questions={Q_TORQUE} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Couple, freinage positif et exigences ATA 67 maîtrisés." />
    </div>
  );
}

/* ============================================================
   ONGLET 4 · MÉTALLISATION, EWIS & FOD
   ============================================================ */
function BondingMeter() {
  const [decap, setDecap] = useState(false);
  const [couple, setCouple] = useState(false);
  const [measured, setMeasured] = useState(null);
  const [protect, setProtect] = useState(false);
  const [limit, setLimit] = useState(2.5);
  const value = !decap ? 860 : !couple ? 14.6 : 1.4;
  const measure = () => setMeasured(value);
  useEffect(() => { setMeasured(null); setProtect(false); }, [decap, couple]);
  const ok = measured !== null && measured <= limit;
  const status = measured === null ? { t: "Mesure à réaliser", c: "text-muted" }
    : !ok ? { t: "Résistance hors tolérance", c: "text-ko" }
    : !protect ? { t: "Mesure conforme, opération non terminée", c: "text-amber" }
    : { t: "Opération clôturable", c: "text-ok" };
  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Plug size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Banc de métallisation d'une tresse de masse</h3>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Toggle on={decap} onClick={() => setDecap(!decap)}>1. Décapage mécanique maîtrisé de la peinture</Toggle>
          <Toggle on={couple} onClick={() => setCouple(!couple)}>2. Cosse montée au couple prescrit</Toggle>
          <div className="flex flex-wrap items-center gap-2 py-1">
            <span className="text-[13px] text-muted">Seuil de la norme :</span>
            <Chip active={limit === 2.5} onClick={() => setLimit(2.5)}>2,5 mΩ</Chip>
            <Chip active={limit === 10} onClick={() => setLimit(10)}>10 mΩ</Chip>
          </div>
          <PrimaryButton onClick={measure}><Gauge size={16} /> 3. Mesurer au milliohmmètre</PrimaryButton>
          <Toggle on={protect} onClick={() => measured !== null && ok && setProtect(!protect)}>4. Re-protection anticorrosion (vernis / PR) autour de la cosse</Toggle>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-line bg-[#0a0f1a] p-4 text-center">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Milliohmmètre 4 fils</div>
            <div className={cx("font-mono text-4xl font-semibold tabular-nums", measured === null ? "text-line" : ok ? "text-ok" : "text-ko")}>
              {measured === null ? "– – –" : mm(measured, 1)}<span className="ml-1 text-lg text-muted">mΩ</span>
            </div>
            <div className="font-mono text-[11px] text-muted">limite {mm(limit, 1)} mΩ</div>
          </div>
          <div className="rounded-lg border border-line bg-bg p-3">
            <div className={cx("font-display text-lg font-semibold", status.c)}>{status.t}</div>
            <p className="text-[13px] leading-relaxed text-ink/85">
              {measured === null && "Prépare la liaison puis lance la mesure."}
              {measured !== null && !decap && "La peinture est isolante : la cosse ne touche pas le métal. Décaper la zone d'appui, puis remesurer."}
              {measured !== null && decap && !couple && "Contact mal plaqué : la résistance dépasse la limite. Serrer la cosse au couple, puis remesurer."}
              {ok && !protect && "Le métal est à nu autour de la cosse. Sans re-protection, la corrosion s'installe sous la cosse et la résistance remonte en service."}
              {ok && protect && "Liaison conforme et protégée. La valeur mesurée est reportée sur la gamme."}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

const FOD_ITEMS = [
  { id: "rivet", x: 64, y: 150, n: "Queue de rivet", draw: <rect x="-4" y="-1.5" width="8" height="3" rx="1" fill="#c9ced6" /> },
  { id: "fil", x: 212, y: 58, n: "Bout de fil à freiner", draw: <path d="M-7 0 q2 -3 4 0 t4 0 t4 0" stroke="#d9dde4" strokeWidth="1.2" fill="none" /> },
  { id: "rondelle", x: 300, y: 172, n: "Rondelle", draw: <circle r="3.5" fill="none" stroke="#c9ced6" strokeWidth="1.6" /> },
  { id: "cleco", x: 150, y: 120, n: "Épingle Cleco oubliée", draw: <g><rect x="-3" y="-4" width="6" height="5" fill="#c9773a" /><rect x="-1" y="1" width="2" height="4" fill="#8fa0bd" /></g> },
  { id: "foret", x: 268, y: 104, n: "Foret cassé", draw: <path d="M-6 1 L5 -1" stroke="#8fa0bd" strokeWidth="1.8" /> },
  { id: "embout", x: 104, y: 70, n: "Embout de visseuse", draw: <polygon points="-3,-3 3,-3 4,0 3,3 -3,3 -4,0" fill="#9fb0c8" /> },
];

const FOD_MAX_MISS = 2; /* 2 clics dans le vide tolérés, au 3e la zone est déclarée fermée */
function FodHunt() {
  const at = useAtelier({ id: "m2-chasse-fod", label: "Chasse au FOD avant fermeture du plancher mécanique", total: FOD_ITEMS.length });
  /* Nouveau tirage : les 6 objets sont redistribués au hasard sur les 6 emplacements */
  const pos = useMemo(() => { const slots = shuffle(FOD_ITEMS.map((f) => [f.x, f.y])); return Object.fromEntries(FOD_ITEMS.map((f, i) => [f.id, slots[i]])); }, [at.draw]);
  const [miss, setMiss] = useState(0);
  useEffect(() => setMiss(0), [at.draw]);
  const found = FOD_ITEMS.filter((f) => at.get(f.id)?.ok).map((f) => f.id);
  const svgRef = useRef(null);
  const click = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (at.finished) return;
    const hit = FOD_ITEMS.find((f) => !at.isLocked(f.id) && Math.hypot(pos[f.id][0] - p.x, pos[f.id][1] - p.y) < 14);
    if (hit) { at.lock(hit.id, { ok: true, q: hit.n, choix: "Trouvé", bonne: "Trouvé" }); return; }
    const m = miss + 1;
    setMiss(m);
    if (m > FOD_MAX_MISS) FOD_ITEMS.forEach((f) => at.lock(f.id, { ok: false, q: f.n, choix: "Non trouvé (zone fermée)", bonne: "Trouvé" }));
  };
  const all = found.length === FOD_ITEMS.length;
  return (
    <Panel className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Search size={18} className="text-amber" />
        <h3 className="font-display text-xl font-semibold text-ink">Chasse au FOD avant fermeture du plancher mécanique</h3>
        <span className="ml-auto font-mono text-[12px] text-ink tabular-nums">{found.length}/{FOD_ITEMS.length} trouvés · {Math.max(0, FOD_MAX_MISS - miss)} clic(s) dans le vide restant(s)</span>
      </div>
      <p className="mb-3 text-[13px] text-muted">Zone sous la BTP, au-dessus de la timonerie de commandes de vol. Clique sur chaque corps étranger avant de signer le point d'arrêt. Au 3e clic dans le vide, la zone est déclarée fermée et les objets restants sont comptés oubliés. Les objets changent de place à chaque tirage.</p>
      <svg ref={svgRef} viewBox="0 0 360 200" onClick={click} className="w-full cursor-crosshair rounded-lg border border-line bg-[#101827]" role="img" aria-label="Vue de dessus du plancher mécanique, corps étrangers à trouver">
        {[40, 120, 200, 280].map((x) => <rect key={x} x={x} y="10" width="6" height="180" fill="#22304d" />)}
        <rect x="10" y="94" width="340" height="6" fill="#22304d" />
        <line x1="20" y1="40" x2="340" y2="40" stroke="#3b9eff" strokeWidth="3" opacity="0.7" />
        <line x1="20" y1="160" x2="340" y2="160" stroke="#3b9eff" strokeWidth="3" opacity="0.7" />
        {[[90, 40], [250, 40], [170, 160]].map(([x, y], i) => (
          <g key={i}><circle cx={x} cy={y} r="9" fill="#2b5c99" stroke="#3b9eff" /><circle cx={x} cy={y} r="3" fill="#0b1220" /></g>
        ))}
        <path d="M20 130 C 90 120, 150 140, 340 128" stroke="#ffb020" strokeWidth="4" fill="none" opacity="0.55" />
        <text x="24" y="30" fontSize="9" fill="#8fa0bd" fontFamily="JetBrains Mono">BIELLES ATA 67</text>
        <text x="24" y="124" fontSize="9" fill="#8fa0bd" fontFamily="JetBrains Mono">HARNAIS</text>
        {FOD_ITEMS.map((f) => (
          <g key={f.id} transform={`translate(${pos[f.id][0]} ${pos[f.id][1]})`}>
            {f.draw}
            {found.includes(f.id) && <circle r="11" fill="none" stroke="#3ddc97" strokeWidth="2" />}
            {at.finished && !found.includes(f.id) && <circle r="11" fill="none" stroke="#ff5d6c" strokeWidth="2" strokeDasharray="3 2" />}
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-2">
        {FOD_ITEMS.map((f) => (
          <span key={f.id} className={cx("rounded-md border px-2 py-1 font-mono text-[11px]", found.includes(f.id) ? "border-ok/60 bg-ok/10 text-ok" : at.finished ? "border-ko/60 bg-ko/10 text-ko" : "border-line text-muted")}>
            {found.includes(f.id) || at.finished ? f.n : "?"}
          </span>
        ))}
        {miss > 0 && <span className="ml-auto font-mono text-[11px] text-muted">{miss} clic{miss > 1 ? "s" : ""} dans le vide</span>}
      </div>
      {all && (
        <div className="mt-3 rounded-lg border border-ok/50 bg-ok/10 p-3 text-[13px] text-ink">
          <strong className="text-ok">Zone propre. </strong>Chacun de ces objets aurait pu bloquer une bielle ou un guignol, ou être aspiré par une turbine. Sans point d'arrêt écrit, personne n'aurait été chargé de les chercher.
        </div>
      )}
      {at.finished && <div className="mt-3"><AtelierResult at={at} koText="Au moins un corps étranger est resté dans la zone : sur avion réel, la fermeture du plancher serait refusée. Relance la chasse (nouvelles positions)." /></div>}
    </Panel>
  );
}

const Q_BOND = [
  { q: "H160, poste équipements électriques. Quelle est la séquence correcte de métallisation d'une tresse de masse sur structure peinte ?", options: ["Décapage local, montage au couple, mesure, re-protection", "Montage au couple, mesure, décapage local, re-protection", "Mesure, décapage local, montage au couple, re-protection", "Montage sur peinture, mesure, re-protection si hors limite"], answer: 0, why: "La peinture isole : on décape d'abord, on monte au couple, on mesure au milliohmmètre, puis on referme la zone à nu par une re-protection anticorrosion.", hint: "La mesure n'a de sens qu'une fois le contact établi." },
  { q: "H145, cellule en cours d'équipement. Pourquoi la continuité électrique (métallisation) est-elle particulièrement critique sur un hélicoptère ?", options: ["Les pales chargent la cellule en électricité statique, en plus du retour de masse et de la foudre", "La cellule non pressurisée laisse entrer l'humidité qui isole les jonctions entre panneaux", "Les moteurs à turbine produisent un courant parasite qui doit s'écouler par la structure", "La métallisation remplace le harnais de masse et réduit ainsi la masse de l'appareil"], answer: 0, why: "La rotation des pales génère d'importantes charges électrostatiques. Sans continuité électrique de la cellule, elles se déchargent de façon incontrôlée et perturbent l'avionique.", hint: "Pense à ce que provoque le frottement des pales dans l'air." },
  { q: "H160, plancher mécanique. Un harnais électrique frotte sur une tuyauterie hydraulique sous l'effet des vibrations. Comment s'appelle ce défaut et comment le prévient-on ?", options: ["Chafing ; jeux minimums et colliers à garniture élastomère", "Fretting ; graissage du harnais au point de contact", "Crazing ; gaine thermorétractable sur le tube", "Pitting ; cordon de PR entre harnais et tube"], answer: 0, why: "Le chafing est l'usure par frottement vibratoire. Il perce l'isolant puis le tube : court-circuit et fuite. Ségrégation, jeux minimums et colliers garnis l'évitent.", hint: "C'est un terme EWIS courant, lié au frottement." },
  { q: "H175, gamme d'un caisson de plancher. Où le préparateur place-t-il le point d'arrêt « Contrôle FOD & aspiration » ?", options: ["Juste avant toute fermeture de zone ou de caisson", "En fin de poste, une fois tous les caissons fermés", "Au contrôle final, avant la livraison au client", "Après le premier vol, lors de la visite de réception"], answer: 0, why: "Une fois la zone fermée, un objet oublié est invisible et inaccessible. Le contrôle a lieu juste avant la fermeture et il est signé dans la gamme.", hint: "Après la fermeture, il est trop tard pour voir." },
];

function TabBonding({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={Zap} kicker="Onglet 4 · Métallisation, EWIS & FOD" title="Conduire le courant, protéger les harnais, ne rien oublier dans la cellule">
        Trois exigences qui ne se voient plus une fois l'hélicoptère fermé. C'est pour cette raison qu'elles doivent être écrites et signées dans la gamme.
      </SectionHead>

      <div className="grid gap-3 md:grid-cols-3">
        <RuleCard icon={Cable} title="Retour de masse">Les équipements électriques utilisent la structure comme conducteur de retour. Chaque liaison doit avoir une résistance très faible.</RuleCard>
        <RuleCard icon={Zap} title="Foudroiement">Le courant de foudre doit traverser la cellule sans arc, notamment au droit des panneaux carbone, des capots et des articulations.</RuleCard>
        <RuleCard icon={Fan} title="Charges électrostatiques">Le frottement des pales dans l'air charge la cellule. Sans continuité électrique, les décharges perturbent l'avionique et les communications.</RuleCard>
      </div>

      <GammeExtract title="ATA 20 · Métallisation tresse de masse BTP / structure" lines={[
        { op: "OP 210", text: "Décaper la peinture sur la zone d'appui de la cosse, à l'outil à brosser calibré. Ne pas entamer le traitement de surface du métal." },
        { op: "OP 220", text: "Monter la tresse : vis, rondelle, cosse, écrou. Serrer au couple prescrit." },
        { op: "OP 230", text: "Mesurer la résistance au milliohmmètre. Valeur ≤ 2,5 mΩ (selon EICM applicable). Reporter la valeur.", stop: true },
        { op: "OP 240", text: "Re-protéger la zone décapée autour de la cosse (vernis ou PR selon définition)." },
      ]} />
      <BondingMeter />

      <div className="flex flex-col gap-4">
        <SectionHead icon={Cable} kicker="Ségrégation & maintien · ATA 92 / ATA 29" title="Le chafing : l'usure qui perce en silence" />
        <div className="grid gap-3 md:grid-cols-3">
          <RuleCard n="1" title="Jeux minimums">Respecter les distances prescrites par le plan d'installation entre harnais, tuyauteries, structure et pièces mobiles.</RuleCard>
          <RuleCard n="2" title="Colliers garnis">Colliers à garniture élastomère (normes NSA, ECS, EN) : ils tiennent le harnais sans le blesser et amortissent les vibrations.</RuleCard>
          <RuleCard n="3" title="Ségrégation">Un harnais ne s'attache jamais sur une tuyauterie. Les fluides passent sous les harnais, jamais au-dessus.</RuleCard>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHead icon={Search} kicker="Lutte anti-FOD" title="Tout ce qui est oublié finit dans une timonerie ou une turbine">
          Une queue de rivet dans le plancher mécanique peut coincer une bielle de commande de vol (ATA 67). Une rondelle aspirée détruit un étage de compresseur. Le préparateur insère un point d'arrêt « Contrôle FOD & aspiration » avant chaque fermeture de zone ou de caisson.
        </SectionHead>
        <FodHunt />
      </div>

      <QuickCheck title="Contrôle de fin d'onglet · Métallisation, EWIS & FOD" questions={Q_BOND} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Métallisation, ségrégation des harnais et lutte anti-FOD maîtrisées." />
    </div>
  );
}

/* ============================================================
   ATELIER 1 · L'ORDONNANCEUR DE GAMME STRUCTURE (H160)
   ============================================================ */
const G_STEPS = [
  { id: "acc", t: "Accostage du revêtement CFRP sur le cadre alu, épinglage Cleco" },
  { id: "perc", t: "Perçage avant-trou et contre-perçage : foret carbure, appui arrière, aspiration" },
  { id: "ales", t: "Alésage au diamètre final Ø 4,8 H8" },
  { id: "demo", t: "Désépinglage et démontage des pièces" },
  { id: "ebav", t: "Ébavurage et chanfreinage des trous, entrée et sortie" },
  { id: "nett", t: "Nettoyage au solvant prescrit des surfaces de contact" },
  { id: "pr", t: "Application du mastic d'interposition PR sur l'interface" },
  { id: "pose", t: "Ré-accostage et pose des Hi-Lok en montage humide" },
];
const G_TRAPS = [
  { id: "souffl", t: "Soufflage des copeaux à l'air comprimé, pièces en place" },
  { id: "tirer", t: "Serrage renforcé des fixations pour rattraper le jeu entre pièces" },
  { id: "hss", t: "Perçage du stratifié au foret acier rapide, sans appui arrière" },
];
const G_ALL = [...G_STEPS, ...G_TRAPS];
const G_ORDER = G_STEPS.map((s) => s.id);
const gLabel = (id) => G_ALL.find((s) => s.id === id).t;

function evaluateGamme(seq) {
  const fx = new Set();
  const msgs = [];
  const has = (id) => seq.includes(id);
  if (has("tirer")) { fx.add("crack"); msgs.push({ t: "Criques de fatigue", d: "Le jeu a été fermé en tirant la structure. Les contraintes résiduelles, cyclées par les vibrations du rotor, amorcent des criques autour des fixations. Le jeu devait être calé." }); }
  if (has("hss")) { fx.add("delam"); msgs.push({ t: "Délaminage en sortie de perçage", d: "Le foret acier rapide arrache les fibres et, sans appui arrière, les derniers plis s'écartent. Le stratifié est endommagé autour du trou : réparation ou rebut de la pièce." }); }
  if (has("souffl")) { fx.add("chip"); msgs.push({ t: "Copeaux et poussières dispersés", d: "Le soufflage pousse les copeaux entre les tôles au lieu de les sortir, et projette une poussière de carbone conductrice dans la cellule." }); }
  if (!has("demo") || !has("ebav")) { fx.add("chip"); msgs.push({ t: "Copeau piégé entre les tôles", d: `${!has("demo") ? "Sans démontage" : "Sans ébavurage"}, un copeau ou une bavure reste à l'interface : défaut de plaquage, concentration de contraintes et poche à humidité au cœur de l'assemblage.` }); }
  if (!has("pr")) { fx.add("corr"); msgs.push({ t: "Corrosion galvanique carbone / alu", d: "Sans mastic d'interposition, l'humidité referme la pile galvanique entre le carbone et l'aluminium. L'alu se corrode sous les fixations, invisible à l'inspection." }); }
  if (has("pr") && !has("nett")) { fx.add("reject"); msgs.push({ t: "Rejet qualité : PR non adhérent", d: "Le mastic posé sur une surface polluée (copeaux, graisse) n'adhère pas : la continuité du film n'est pas garantie, l'interface est déclarée non conforme." }); }
  ["acc", "perc", "ales", "pose"].forEach((id) => {
    if (!has(id)) { fx.add("reject"); msgs.push({ t: "Rejet qualité : étape manquante", d: `« ${gLabel(id)} » n'apparaît pas dans la gamme.` }); }
  });
  const present = G_ORDER.filter(has);
  const asPlaced = seq.filter((id) => G_ORDER.includes(id));
  for (let i = 0; i < asPlaced.length; i++) {
    if (asPlaced[i] !== present[i]) {
      const wrong = asPlaced[i];
      const should = present[i];
      fx.add("reject");
      msgs.push({ t: "Rejet qualité : séquence inversée", d: `« ${gLabel(should)} » doit être faite avant « ${gLabel(wrong)} ». Une gamme dont l'ordre est faux ne peut pas être exécutée telle quelle par l'opérateur.` });
      break;
    }
  }
  const ok = seq.length === G_ORDER.length && seq.every((id, i) => id === G_ORDER[i]);
  return { ok, fx, msgs };
}

function AssemblySimSVG({ fx, ok, stage }) {
  const chip = fx.has("chip"), corr = fx.has("corr"), delam = fx.has("delam"), crack = fx.has("crack"), reject = fx.has("reject");
  const gap = chip ? 5 : 0;
  const showFast = stage >= 8;
  return (
    <svg viewBox="0 0 360 215" className="w-full rounded-lg border border-line bg-bg" role="img" aria-label="Coupe simulée de l'assemblage">
      <text x="14" y="20" fontSize="10" fill="#8fa0bd" fontFamily="JetBrains Mono">COUPE · JONCTION CADRE ALU / REVÊTEMENT CFRP · H160</text>
      <g transform={crack ? "rotate(-2 180 100)" : undefined}>
        <rect x="30" y="56" width="300" height="26" fill="#9fb0c8" />
        <text x="38" y="73" fontSize="10" fill="#0b1220" fontFamily="JetBrains Mono" fontWeight="600">CADRE ALU</text>
      </g>
      {!corr && showFast && <rect x="30" y={82 + gap} width="300" height="3" fill="#4a4f57" />}
      <g transform={`translate(0 ${gap})`}>
        <rect x="30" y={85} width="300" height="28" fill="#1b2230" />
        {Array.from({ length: 15 }).map((_, i) => <line key={i} x1={34 + i * 20} y1="87" x2={46 + i * 20} y2="111" stroke="#33405a" />)}
        <text x="38" y="103" fontSize="10" fill="#e6edf7" fontFamily="JetBrains Mono" fontWeight="600">REVÊTEMENT CFRP</text>
      </g>
      {[160, 280].map((x) => (
        <g key={x}>
          {stage >= 2 && <rect x={x - 6} y="56" width="12" height={57 + gap} fill="#0b1220" />}
          {showFast && (
            <g>
              <polygon points={`${x - 12},56 ${x + 12},56 ${x + 7},50 ${x - 7},50`} fill="#c9ced6" />
              <rect x={x - 5} y="50" width="10" height={76 + gap} fill="#c9ced6" />
              <rect x={x - 11} y={113 + gap} width="22" height="10" fill="#3b9eff" />
            </g>
          )}
          {stage === 1 && <rect x={x - 4} y="44" width="8" height="12" fill="#c9773a" />}
        </g>
      ))}
      {chip && <polygon points="212,83 228,83 220,89" fill="#ff5d6c" stroke="#ffd0d5" strokeWidth="0.6" />}
      {chip && <text x="180" y="138" textAnchor="middle" fontSize="11" fill="#ff5d6c" fontFamily="Barlow" fontWeight="600">copeau piégé : défaut de plaquage</text>}
      {corr && [60, 95, 150, 205, 270, 300].map((x, i) => <ellipse key={i} cx={x} cy={82 + gap} rx={7 + (i % 2) * 3} ry="3.5" fill="#c46a2b" />)}
      {corr && <text x="300" y="44" textAnchor="end" fontSize="11" fill="#e08a4a" fontFamily="Barlow" fontWeight="600">corrosion galvanique à l'interface</text>}
      {delam && [160, 280].map((x) => (
        <g key={x} stroke="#ffb020" strokeWidth="1.4">
          <line x1={x - 7} y1={110 + gap} x2={x - 18} y2={118 + gap} /><line x1={x + 7} y1={110 + gap} x2={x + 18} y2={118 + gap} />
          <line x1={x - 7} y1={106 + gap} x2={x - 22} y2={110 + gap} /><line x1={x + 7} y1={106 + gap} x2={x + 22} y2={110 + gap} />
        </g>
      ))}
      {delam && <text x="30" y="158" fontSize="11" fill="#ffb020" fontFamily="Barlow" fontWeight="600">délaminage en sortie de trou</text>}
      {crack && <path d="M286 56 l6 6 -4 4 7 6 -3 5" stroke="#ff5d6c" strokeWidth="2" fill="none" />}
      {crack && <text x="330" y="158" textAnchor="end" fontSize="11" fill="#ff5d6c" fontFamily="Barlow" fontWeight="600">crique de fatigue</text>}
      {stage >= 8 && reject && (
        <g transform="rotate(-6 180 192)">
          <rect x="112" y="178" width="136" height="26" rx="4" fill="none" stroke="#ff5d6c" strokeWidth="2.5" />
          <text x="180" y="196" textAnchor="middle" fontSize="14" fill="#ff5d6c" fontFamily="Barlow Condensed" fontWeight="700" letterSpacing="2">REJET QUALITÉ</text>
        </g>
      )}
      {stage >= 8 && ok && (
        <g>
          <rect x="112" y="178" width="136" height="26" rx="4" fill="none" stroke="#3ddc97" strokeWidth="2.5" />
          <text x="180" y="196" textAnchor="middle" fontSize="14" fill="#3ddc97" fontFamily="Barlow Condensed" fontWeight="700" letterSpacing="2">CONFORME</text>
        </g>
      )}
    </svg>
  );
}

function TabGamme({ done, onComplete }) {
  /* Une seule simulation par tirage : la gamme lancée est définitive (8 positions notées) */
  const at = useAtelier({ id: "m2-ordonnanceur-gamme", label: "Ordonnanceur de gamme : jonction hybride carbone / alu (8 opérations)", total: 8, onComplete });
  const [pool, setPool] = useState(() => shuffle(G_ALL.map((s) => s.id)));
  const [seq, setSeq] = useState([]);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState(null);
  const tries = at.draw + 1;
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);
  const frozen = stage >= 0;

  const add = (id) => { if (frozen || seq.length >= 8) return; setSeq([...seq, id]); setPool(pool.filter((p) => p !== id)); };
  const remove = (id) => { if (frozen) return; setSeq(seq.filter((s) => s !== id)); setPool([...pool, id]); };
  const move = (i, d) => {
    if (frozen) return;
    const j = i + d; if (j < 0 || j >= seq.length) return;
    const s = [...seq]; [s[i], s[j]] = [s[j], s[i]]; setSeq(s);
  };
  const simulate = () => {
    if (frozen) return;
    const r = evaluateGamme(seq);
    setResult(r); setStage(0);
    clearInterval(timer.current);
    let k = 0;
    timer.current = setInterval(() => {
      k += 1; setStage(k);
      if (k >= 8) {
        clearInterval(timer.current);
        seq.forEach((id, i) => at.lock(i, { ok: id === G_ORDER[i], q: `OP ${String((i + 1) * 10).padStart(3, "0")}`, choix: gLabel(id), bonne: gLabel(G_ORDER[i]) }));
      }
    }, 380);
  };
  const restart = () => { clearInterval(timer.current); setPool(shuffle(G_ALL.map((s) => s.id))); setSeq([]); setStage(-1); setResult(null); at.relaunch(); };
  const finished = stage >= 8 && result;
  const simFx = finished ? result.fx : new Set();

  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={ListOrdered} kicker="Atelier 1 · Ordonnanceur de gamme structure" title="Écris la gamme d'une jonction hybride carbone / alu sur la poutre de queue du H160">
        Choisis 8 opérations parmi les 11 proposées et mets-les dans l'ordre. Trois sont des pièges vus sur poste. Tu peux réorganiser tant que tu n'as pas lancé la simulation. Le lancement est définitif : l'opérateur exécute ta gamme telle quelle, chaque position est notée, et sous 85 % il faut relancer l'atelier avec un nouveau tirage.
      </SectionHead>
      <LockRule />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList size={16} className="text-sky" />
            <Eyebrow>Opérations disponibles</Eyebrow>
            <span className="ml-auto font-mono text-[11px] text-muted">clic = ajouter</span>
          </div>
          <div className="flex flex-col gap-2">
            {pool.map((id) => (
              <button key={id} type="button" onClick={() => add(id)} disabled={frozen || seq.length >= 8}
                className={cx("rounded-lg border border-line bg-panel2 px-3 py-2 text-left text-[13px] text-ink/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", frozen || seq.length >= 8 ? "cursor-not-allowed opacity-50" : "hover:border-sky/60 hover:text-ink")}>
                {gLabel(id)}
              </button>
            ))}
            {pool.length === 0 && <div className="text-[13px] text-muted">Toutes les opérations sont placées.</div>}
          </div>
        </Panel>

        <Panel className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileText size={16} className="text-amber" />
            <Eyebrow tone="amber">Ta gamme · {seq.length}/8 opérations</Eyebrow>
          </div>
          <ol className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => {
              const id = seq[i];
              const running = stage >= 0 && stage < 8 && stage === i;
              const passed = stage >= 0 && i < stage;
              return (
                <li key={i} className={cx("flex items-center gap-2 rounded-lg border px-2 py-1.5", id ? (running ? "border-sky bg-sky/15" : passed ? "border-line bg-bg" : "border-line bg-panel2") : "border-dashed border-line")}>
                  <span className="w-12 shrink-0 font-mono text-[11px] font-semibold text-sky">OP {String((i + 1) * 10).padStart(3, "0")}</span>
                  {id && frozen ? (
                    <>
                      <span className="min-w-0 flex-1 text-[13px] text-ink/90">{gLabel(id)}{at.get(i) && !at.get(i).ok && <span className="block text-[11px] text-ko">Attendu : {gLabel(G_ORDER[i])}</span>}</span>
                      {at.get(i) && (at.get(i).ok ? <CheckCircle2 size={15} className="text-ok" /> : <XCircle size={15} className="text-ko" />)}
                    </>
                  ) : id ? (
                    <>
                      <span className="min-w-0 flex-1 text-[13px] text-ink/90">{gLabel(id)}</span>
                      <button type="button" aria-label="Monter" onClick={() => move(i, -1)} className="rounded p-1 text-muted hover:bg-line hover:text-ink"><ArrowUp size={14} /></button>
                      <button type="button" aria-label="Descendre" onClick={() => move(i, 1)} className="rounded p-1 text-muted hover:bg-line hover:text-ink"><ArrowDown size={14} /></button>
                      <button type="button" aria-label="Retirer" onClick={() => remove(id)} className="rounded p-1 text-muted hover:bg-line hover:text-ko"><XCircle size={14} /></button>
                    </>
                  ) : <span className="text-[12px] text-muted">vide</span>}
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton onClick={simulate} disabled={seq.length < 8 || frozen} tone="amber"><Play size={16} /> Lancer la gamme (définitif)</PrimaryButton>
            {!frozen && <button type="button" onClick={() => { setPool(shuffle(G_ALL.map((s) => s.id))); setSeq([]); }} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-muted hover:text-ink"><RotateCcw size={14} /> Vider</button>}
          </div>
        </Panel>
      </div>

      <Panel className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Eye size={16} className="text-sky" />
          <Eyebrow>Simulation sur poste</Eyebrow>
          {stage >= 0 && stage < 8 && <span className="ml-auto font-mono text-[11px] text-sky">exécution OP {String((stage + 1) * 10).padStart(3, "0")}…</span>}
          {tries > 0 && finished && <span className="ml-auto font-mono text-[11px] text-muted">essai n° {tries}</span>}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <AssemblySimSVG fx={simFx} ok={finished && result.ok} stage={stage < 0 ? 0 : stage} />
          <div className="flex flex-col gap-2">
            {!finished && <p className="text-[13px] leading-relaxed text-muted">{stage < 0 ? "Complète les 8 opérations puis lance la simulation." : "L'opérateur exécute ta gamme…"}</p>}
            {finished && result.ok && (
              <div className="rounded-lg border border-ok/50 bg-ok/10 p-3">
                <div className="font-display text-lg font-semibold text-ok">Gamme libérable</div>
                <p className="text-[13px] leading-relaxed text-ink/90">Aucun copeau piégé, interface isolée et étanche, trous conformes : la jonction passe le contrôle qualité au premier passage.</p>
              </div>
            )}
            {finished && !result.ok && result.msgs.length === 0 && (
              <div className="rounded-lg border border-amber/50 bg-amber/10 p-3 text-[13px] text-ink">Presque : l'ordre n'est pas encore celui de la séquence type. Revois l'onglet 1.</div>
            )}
            {finished && !result.ok && result.msgs.map((m, i) => (
              <div key={i} className="rounded-lg border border-ko/45 bg-ko/10 p-3">
                <div className="font-display text-base font-semibold text-ko">{m.t}</div>
                <p className="text-[13px] leading-relaxed text-ink/90">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      {at.finished && <AtelierResult at={at} onRelaunch={restart} />}
      <ValidatedBanner done={done} label="Gamme structure hybride ordonnée à 85 % minimum." />
    </div>
  );
}

/* ============================================================
   ATELIER 2 · INSPECTEUR FREINAGE & COUPLE
   ============================================================ */
const AUDITS = [
  { kind: "wire", zone: "BTA · couvercle de boîte de transmission arrière", props: { bolts: [[92, 84], [262, 116]] }, accept: true,
    why: "Les deux vis sont tirées dans le sens horaire, la torsade est régulière (environ 7 par pouce) et la queue de cochon est courte et repliée vers l'intérieur. Montage conforme." },
  { kind: "wire", zone: "BTP · vis de fixation de la pompe hydraulique", props: { loosen: [true, false] }, accept: false,
    why: "Regarde la vis 1 : le fil part du mauvais côté de la tête et la tire dans le sens anti-horaire. Sous vibrations, il l'aide à se dévisser. La vis 2 est correcte, mais une seule tête mal freinée suffit à refuser." },
  { kind: "wire", zone: "Moteur · bouchon de vidange et vis de carter", props: { twists: 3, pigtail: "out" }, accept: false,
    why: "Le sens est bon, mais la torsade est lâche (environ 3 par pouce au lieu de 6 à 8) et l'extrémité est longue, droite et non repliée : risque de blessure et de FOD si elle casse." },
  { kind: "wire", zone: "Rotor de queue · deux vis de fixation de la boîte espacées de 60 mm", props: { single: true }, accept: false,
    why: "Méthode fil simple sur deux vis espacées d'une pièce dynamique. Le fil simple est réservé aux petites vis rapprochées en ensemble fermé, aux circuits électriques ou aux endroits où la double torsade est impossible. Ici, double torsade obligatoire." },
  { kind: "torque", zone: "Fixation de support de servocommande", data: { nom: [10, 12], rt: 3, add: true, shown: 11 }, accept: false,
    why: "La norme exige l'addition du couple de freinage. Plage à afficher : 10 + 3 = 13 à 12 + 3 = 15 N·m. Avec 11 N·m, la vis n'atteint pas sa précharge : refus et reprise du serrage." },
  { kind: "torque", zone: "Ferrure de suspension de la BTP", data: { nom: [23, 27], rt: 4, add: true, shown: 29 }, accept: true,
    why: "Plage à afficher : 23 + 4 = 27 à 27 + 4 = 31 N·m. 29 N·m est dans la plage et le couple de freinage mesuré est noté sur la fiche. Conforme." },
  { kind: "bnut", zone: "Tuyauterie haute pression du circuit hydraulique 1", accept: false,
    why: "Le serrage a été fait sans clé de contre-couple : le tube porte des marques de vrillage. Il est sous contrainte permanente et fissurera sous vibrations. Refus : dépose et remplacement du tube." },
  { kind: "hilok", zone: "Jonction cadre / revêtement de la poutre de queue", accept: true,
    why: "Collerette rompue, dépassement de tige dans la plage de la jauge, tête plaquée sans jeu et vernis témoin continu sur la bague et la structure. Les trois contrôles Hi-Lok sont satisfaits." },
];

function TorqueSheet({ data }) {
  const lo = data.nom[0] + (data.add ? data.rt : 0), hi = data.nom[1] + (data.add ? data.rt : 0);
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <div className="overflow-hidden rounded-lg border border-line bg-bg font-mono text-[13px]">
        {[["Couple nominal (norme)", `${data.nom[0]} à ${data.nom[1]} N·m`], ["Règle d'addition", data.add ? "Exigée par la norme" : "Non applicable"], ["Couple de freinage mesuré", `${mm(data.rt, 1)} N·m`], ["Couple affiché sur la clé", `${data.shown} N·m`]].map(([k, v], i) => (
          <div key={k} className={cx("flex justify-between gap-3 px-3 py-2", i < 3 && "border-b border-line", i === 3 && "bg-panel2")}>
            <span className="text-muted">{k}</span><span className="font-semibold text-ink">{v}</span>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 120 120" className="h-32 w-32" role="img" aria-label={`Affichage de la clé : ${data.shown} N·m`}>
        <rect x="52" y="54" width="16" height="64" rx="4" fill="#5b7299" />
        <rect x="18" y="6" width="84" height="52" rx="8" fill="#111a2e" stroke="#3b9eff" />
        <text x="60" y="38" textAnchor="middle" fontSize="22" fill="#3ddc97" fontFamily="JetBrains Mono" fontWeight="700">{data.shown}</text>
        <text x="60" y="52" textAnchor="middle" fontSize="9" fill="#8fa0bd" fontFamily="JetBrains Mono">N·m</text>
      </svg>
      <span className="sr-only">Plage attendue {lo} à {hi}</span>
    </div>
  );
}

function TabAudit({ done, onComplete }) {
  const at = useAtelier({ id: "m2-audit-freinage", label: "Audit freinage & couple : 8 montages à accepter ou refuser", total: AUDITS.length, onComplete });
  const order = useMemo(() => permutation(AUDITS.length), [at.draw]);
  const [pos, setPos] = useState(0);
  useEffect(() => setPos(0), [at.draw]);
  const finished = at.finished && pos >= order.length;
  const score = order.slice(0, Math.min(pos + 1, order.length)).map((i) => at.get(i)).filter(Boolean).map((a) => a.ok);
  const good = at.good;
  const c = !finished ? AUDITS[order[Math.min(pos, order.length - 1)]] : null;
  const ci = order[Math.min(pos, order.length - 1)];
  const picked = at.get(ci) ? at.get(ci).k : null;
  const judge = (accept) => { if (at.isLocked(ci)) return; at.lock(ci, { k: accept, ok: accept === c.accept, q: c.zone, choix: accept ? "Accepter" : "Refuser", bonne: c.accept ? "Accepter" : "Refuser" }); };
  const next = () => setPos(pos + 1);
  const restart = () => at.relaunch();

  const head = (
    <SectionHead icon={Eye} kicker="Atelier 2 · Inspecteur freinage & couple" title="Audit sur le poste d'assemblage : tu acceptes ou tu refuses ?">
      8 montages relevés en FAL, présentés dans un ordre aléatoire : 4 freinages au fil, 2 fiches de couple, un raccord hydraulique et une fixation Hi-Lok. Ta décision est définitive dès le clic. 7 bonnes décisions sur 8 (87,5 %) pour valider l'atelier.
    </SectionHead>
  );

  if (finished) {
    return (
      <div className="flex flex-col gap-6">
        {head}
        <Panel className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Award size={40} className={good >= 7 ? "text-ok" : "text-amber"} />
            <div className="flex-1">
              <div className={cx("font-display text-3xl font-semibold", good >= 7 ? "text-ok" : "text-amber")}>{good}/{AUDITS.length} décisions justes</div>
              <p className="text-[14px] text-ink/85">{good >= 7 ? "Ton œil d'auditeur est fiable : les montages non conformes ne passent pas." : "Un montage non conforme accepté, c'est un hélicoptère qui vole avec. Relis l'onglet 3 et recommence."}</p>
            </div>
          </div>
        </Panel>
        <AtelierResult at={at} />
        <ValidatedBanner done={done} label="Audit freinage & couple réussi (7/8 minimum)." />
      </div>
    );
  }

  const right = picked !== null && picked === c.accept;
  return (
    <div className="flex flex-col gap-6">
      {head}
      <div className="flex gap-1" aria-label="Progression de l'audit">
        {order.map((oi, i) => { const a = at.get(oi); return <div key={i} className={cx("h-1.5 flex-1 rounded-full", a ? (a.ok ? "bg-ok" : "bg-ko") : i === pos ? "bg-sky" : "bg-line")} />; })}
      </div>
      <Panel className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-sky/50 bg-sky/10 px-2 py-0.5 font-mono text-[11px] text-sky">Montage {pos + 1}/{AUDITS.length}</span>
          <span className="font-mono text-[11px] text-muted">{c.zone}</span>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div>
            {c.kind === "wire" && <LockwireSVG {...c.props} showForce={picked !== null} />}
            {c.kind === "torque" && <TorqueSheet data={c.data} />}
            {c.kind === "bnut" && <BNutSVG noBackup />}
            {c.kind === "hilok" && (
              <div className="flex flex-col gap-2">
                <div className="rounded-lg border border-line bg-bg p-2"><HiLokSVG /></div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="rounded border border-line bg-bg px-2 py-1 text-ink">Collerette : rompue</div>
                  <div className="rounded border border-line bg-bg px-2 py-1 text-ink">Jauge : zone verte</div>
                  <div className="rounded border border-line bg-bg px-2 py-1 text-ink">Vernis : continu</div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-[14px] leading-relaxed text-ink/90">
              {c.kind === "wire" && "Freinage au fil relevé sur poste. Vérifie le sens d'effort sur chaque tête, la régularité de la torsade, l'extrémité et la méthode employée."}
              {c.kind === "torque" && "Fiche d'auto-contrôle de serrage sur écrou auto-freiné. Vérifie que le couple affiché correspond à la règle de la norme."}
              {c.kind === "bnut" && "Raccord B-nut serré au couple nominal par l'opérateur, seul sur le poste. Constat visuel ci-contre."}
              {c.kind === "hilok" && "Fixation Hi-Lok posée en montage humide. Constat de l'auto-contrôle opérateur ci-contre."}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => judge(true)} disabled={picked !== null}
                className={cx("flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition", picked === true ? (right ? "border-ok bg-ok/15 text-ok" : "border-ko bg-ko/15 text-ko") : "border-line bg-panel2 text-ink hover:border-ok")}>
                <ShieldCheck size={16} /> Accepter
              </button>
              <button type="button" onClick={() => judge(false)} disabled={picked !== null}
                className={cx("flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition", picked === false ? (right ? "border-ok bg-ok/15 text-ok" : "border-ko bg-ko/15 text-ko") : "border-line bg-panel2 text-ink hover:border-ko")}>
                <ShieldAlert size={16} /> Refuser
              </button>
            </div>
            {picked !== null && (
              <div className={cx("rounded-lg border p-3", right ? "border-ok/50 bg-ok/10" : "border-ko/50 bg-ko/10")}>
                <div className={cx("mb-1 font-display text-lg font-semibold", right ? "text-ok" : "text-ko")}>
                  {right ? "Bonne décision" : "Mauvaise décision"} · montage {c.accept ? "conforme" : "non conforme"}
                </div>
                <p className="text-[13px] leading-relaxed text-ink/90">{c.why}</p>
                {c.kind === "wire" && <p className="mt-1 text-[12px] text-muted">Les flèches montrent maintenant l'effort du fil : vert = serrage, rouge = desserrage.</p>}
                <div className="mt-3"><PrimaryButton onClick={next}>{pos + 1 === AUDITS.length ? "Voir le bilan" : "Montage suivant"} <ArrowRight size={16} /></PrimaryButton></div>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ============================================================
   SPRINT · 12 MISES EN SITUATION
   ============================================================ */
const QUESTIONS = [
  {
    tag: "Mastic PR · Pot life", scenario: true,
    q: "H175, poste caisson structural. Tu prépares la pose de 150 fixations en montage humide, à environ 40 s par fixation. Quel mastic prescris-tu ?",
    options: ["PR 1422 B 2, dont la vie en pot couvre la durée du poste", "PR 1422 B 1/2, plus rapide à polymériser, en un seul mélange", "PR 1422 B 1/2 en un seul mélange, cadence opérateur accélérée", "PR 1422 B 2 appliqué à sec après pose, en cordon de finition"],
    answer: 0,
    why: "150 × 40 s = 100 min, environ 2 h avec la marge. Un B 1/2 (30 min) serait hors durée de vie bien avant la fin. Le préparateur choisit la classe d'après la charge réelle du poste.",
    risk: "Avec un B 1/2, le mastic devient pâteux vers la 45e fixation : film discontinu, fixations mal plaquées, interface non étanche, rejet du lot.",
  },
  {
    tag: "Hi-Lok · Contrôle", scenario: true,
    q: "H160, poutre de queue. Une collerette Hi-Lok a cassé alors que la tête de tige n'est pas plaquée (jeu visible sous tête). Que prescris-tu ?",
    options: ["Dépose, contrôle de l'alésage et du grip, pose d'une fixation neuve", "Acceptation : la rupture de collerette prouve que le couple est atteint", "Resserrage de la bague restante à la clé jusqu'au plaquage de la tête", "Injection de PR sous la tête pour combler le jeu et étancher"],
    answer: 0,
    why: "Une rupture anticipée signifie que le couple a été absorbé par autre chose que la mise en tension : grippage, bavure, mauvais grip. La preuve de serrage est fausse.",
    risk: "Une fixation sans précharge travaille en cisaillement alterné sous les vibrations : ovalisation du trou, puis crique dans le cadre.",
  },
  {
    tag: "ATA 20 · Métallisation", scenario: true,
    q: "H145, compartiment BTP. Tresse de masse mesurée à 1,8 mΩ pour un seuil de 2,5 mΩ, mais la zone décapée autour de la cosse est restée nue. Quelle est ta décision ?",
    options: ["Non conforme tant que la re-protection anticorrosion n'est pas faite", "Conforme : la mesure est sous le seuil, le dossier peut être signé", "À refaire : nouvelle mesure avec un second milliohmmètre étalonné", "Conforme sous réserve : peinture de finition posée par-dessus la cosse"],
    answer: 0,
    why: "La séquence complète est : décapage, montage au couple, mesure, puis re-protection. La mesure valide le contact aujourd'hui, la re-protection le garantit dans la durée.",
    risk: "Le métal nu s'oxyde sous la cosse, la résistance remonte en service et la liaison ne protège plus contre la foudre et l'électricité statique.",
  },
  {
    tag: "Calage · BTP", scenario: true,
    q: "H160, plancher mécanique. Un support de BTP présente un jeu régulier de 0,4 mm avec le plancher. Que doit prescrire la gamme ?",
    options: ["Cale pelable pelée à 0,40 mm, contrôle de l'épaisseur puis du plaquage", "Serrage au couple maxi du plan pour fermer le jeu par déformation", "Deux rondelles plates sous chaque vis pour rattraper l'épaisseur", "Remplissage du jeu au mastic PR, puis serrage après polymérisation"],
    answer: 0,
    why: "Un jeu régulier se traite par une cale pelable, pelée jusqu'à l'épaisseur mesurée. Le PR n'est pas une cale structurale et on ne tire jamais une structure au serrage.",
    risk: "Tirer le support crée des contraintes résiduelles sous la BTP, zone la plus sollicitée en vibrations : criques de fatigue.",
  },
  {
    tag: "ATA 67 · Commandes de vol", scenario: true,
    q: "H145, poste commandes. Une bielle de commande de vol vient d'être posée : écrou à créneaux au couple, goupille neuve. Quelle étape la gamme doit-elle imposer avant de poursuivre ?",
    options: ["Double contrôle indépendant par une seconde personne, en point d'arrêt signé", "Autocontrôle de l'opérateur, tracé par son tampon sur la gamme", "Vernis témoin sur l'écrou, vérifié au contrôle final de l'appareil", "Contrôle différé lors de l'essai des commandes au point fixe"],
    answer: 0,
    why: "Les commandes de vol n'ont pas de redondance. Le double contrôle est fait par une personne qui n'a pas réalisé le travail, et il bloque la suite de la gamme tant qu'il n'est pas signé.",
    risk: "Une goupille oubliée ou un écrou non serré sur une bielle ATA 67 peut mener à la perte de contrôle de l'appareil.",
  },
  {
    tag: "Perçage CFRP", scenario: true,
    q: "H160, premier perçage d'un revêtement carbone. Les trous présentent des fibres arrachées et des plis écartés en sortie. Quelle correction écris-tu ?",
    options: ["Foret carbure ou diamant, appui arrière (martyr), paramètres adaptés", "Avance augmentée pour réduire le temps de contact foret / fibre", "Perçage depuis l'autre face avec le même foret acier rapide", "Foret neuf identique et injection de PR dans les trous délaminés"],
    answer: 0,
    why: "C'est du délaminage de sortie. L'appui arrière retient les derniers plis, l'outil carbure ou diamant coupe la fibre au lieu de l'arracher.",
    risk: "Le délaminage réduit la tenue de la jonction autour de la fixation : réparation ou rebut selon son étendue.",
  },
  {
    tag: "Séquence structure", scenario: true,
    q: "H175, poste jonction. Pour tenir le délai, un chef d'équipe propose de supprimer le démontage après alésage et de « bien souffler les trous ». Quelle est ta réponse ?",
    options: ["Refus : démontage, ébavurage et nettoyage restent obligatoires", "Accord si le soufflage est fait à l'air sec filtré et sous pression", "Accord limité aux empilages alu, refus sur les empilages carbone", "Accord si le contrôle final ajoute une inspection endoscopique"],
    answer: 0,
    why: "Le soufflage ne sort pas les copeaux d'entre les tôles, il les pousse plus loin. Seul le démontage permet de voir et de traiter l'interface.",
    risk: "Copeaux piégés : défaut de plaquage, concentration de contraintes et corrosion au cœur de l'assemblage.",
  },
  {
    tag: "Fil à freiner", scenario: true,
    q: "H160, audit du compartiment BTA. Un fil à freiner tire une vis de couvercle (filetage à droite) dans le sens anti-horaire. Que fais-tu ?",
    options: ["Dépose du fil, contrôle du couple, refreinage au fil neuf dans le sens du serrage", "Acceptation si le fil est bien tendu et les torsades régulières", "Ajout d'une torsade supplémentaire pour augmenter la tension du fil", "Retente du même fil dans l'autre sens, sans contrôle du couple"],
    answer: 0,
    why: "Un fil qui tire dans le sens du desserrage aide la vis à se dévisser. On refait le freinage avec un fil neuf, après avoir vérifié que la vis est au couple.",
    risk: "Sous vibrations, la vis se desserre : fuite d'huile de la boîte arrière et, à terme, perte de l'anticouple.",
  },
  {
    tag: "Hydraulique · B-nut", scenario: true,
    q: "H145, plancher mécanique, tuyauterie hydraulique. L'opérateur doit serrer un raccord B-nut. Que doit préciser la gamme en plus du couple ?",
    options: ["Une clé de contre-couple sur le raccord fixe pendant le serrage", "Un graissage du filetage et du cône avec la graisse de montage", "Un serrage à la main suivi d'un quart de tour à la clé plate", "Un freinage au fil systématique de l'écrou après serrage"],
    answer: 0,
    why: "La clé de contre-couple maintient le raccord fixe et empêche l'effort de serrage de se transmettre au tube.",
    risk: "Tube vrillé : contrainte permanente qui, sous vibrations, mène à la fissure et à la fuite hydraulique.",
  },
  {
    tag: "Couple · Running torque",
    q: "H125, fixation d'un support. Écrou autofreiné : couple nominal 8 à 10 N·m, couple de freinage mesuré 2 N·m, addition exigée par la norme. Quelle plage l'opérateur affiche-t-il ?",
    options: ["10 à 12 N·m", "8 à 10 N·m", "6 à 8 N·m", "9 à 11 N·m"],
    answer: 0,
    why: "On ajoute le couple de freinage aux deux bornes : 8 + 2 = 10 et 10 + 2 = 12 N·m.",
    risk: "En affichant 8 à 10 N·m, une partie du couple est absorbée par le freinage : vis sous-serrée qui se desserre sous vibrations.",
  },
  {
    tag: "Fenestron · FOD", scenario: true,
    q: "H160, fermeture du caisson de dérive Fenestron. L'intérieur ne sera plus accessible. Quelle séquence la gamme doit-elle contenir ?",
    options: ["Contrôle FOD & aspiration en point d'arrêt, puis rivets aveugles structuraux", "Rivets aveugles structuraux, puis inspection FOD par les trous de visite", "Contrôle FOD & aspiration en point d'arrêt, puis rivets pleins au tas", "Rivets pleins au tas, puis secouage du caisson pour détecter les objets"],
    answer: 0,
    why: "Le contrôle FOD se fait tant que l'intérieur est visible. Ensuite, l'arrière étant inaccessible, seuls des rivets aveugles structuraux permettent de fermer.",
    risk: "Un objet oublié dans le caisson vibre pendant des années, use la structure ou migre vers la commande du rotor arrière.",
  },
  {
    tag: "Anticorrosion · Hybride", scenario: true,
    q: "H160, cadre aluminium sous revêtement carbone. Le compagnon demande s'il peut monter à sec pour gagner du temps. Quelle est ta réponse ?",
    options: ["Non : pli de verre, primaire sur l'alu et PR d'interposition obligatoires", "Oui, à condition de peindre la jonction après assemblage complet", "Oui, à condition que les fixations de la jonction soient en titane", "Oui, le carbone étant inerte, seul un cordon extérieur est requis"],
    answer: 0,
    why: "Carbone et aluminium ont un fort écart de potentiel : isolation électrique, protection de surface et étanchéité sont obligatoires.",
    risk: "Corrosion galvanique rapide de l'aluminium à l'interface, invisible sous le revêtement jusqu'à la perte de tenue de la jonction.",
  },
];
function TabSprint({ done, onComplete, onScore }) {
  return (
    <SprintQCM questions={QUESTIONS} done={done} onComplete={onComplete} onScore={onScore}
      SectionHead={SectionHead} ValidatedBanner={ValidatedBanner}
      kicker="Onglet 7 · Évaluation" title="Sprint Méthodes Assemblage · Module 2"
      intro={`${QUESTIONS.length} questions tirées au hasard, mises en situation terrain sur les chaînes Airbus Helicopters (H160, H175, FAL). Après chaque réponse, une explication technique te montre pourquoi c'est juste, et ce que l'erreur aurait provoqué sur chaîne.`} />
  );
}

/* ============================================================
   APPLICATION
   ============================================================ */
const TABS = [
  { id: "structure", short: "Structure", n: "1", icon: Layers, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "fixations", short: "Fixations & PR", n: "2", icon: Hexagon, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "couple", short: "Couple & freinage", n: "3", icon: Wrench, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "bonding", short: "Métallisation & FOD", n: "4", icon: Zap, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "gamme", short: "Atelier gamme", n: "5", icon: ListOrdered, rule: "Simuler une gamme de 8 opérations sans erreur" },
  { id: "audit", short: "Atelier audit", n: "6", icon: Eye, rule: "Prendre au moins 7 bonnes décisions sur 8" },
  { id: "sprint", short: "Sprint", n: "7", icon: Trophy, rule: "Finir le sprint avec 85 % ou plus" },
];

export default function App({ onSaveScore, onBack, student } = {}) {
  const [tab, setTab] = useState("structure");
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
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Bureau des Méthodes · Airbus Helicopters · Module 2</div>
              <h1 className="font-display text-xl font-semibold leading-none text-ink sm:text-2xl">Procédés d'assemblage, fixations & règles de montage</h1>
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

        {tab === "structure" && <TabStructure done={progress.structure} onComplete={complete("structure")} />}
        {tab === "fixations" && <TabFixations done={progress.fixations} onComplete={complete("fixations")} />}
        {tab === "couple" && <TabTorque done={progress.couple} onComplete={complete("couple")} />}
        {tab === "bonding" && <TabBonding done={progress.bonding} onComplete={complete("bonding")} />}
        {tab === "gamme" && <TabGamme done={progress.gamme} onComplete={complete("gamme")} />}
        {tab === "audit" && <TabAudit done={progress.audit} onComplete={complete("audit")} />}
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
