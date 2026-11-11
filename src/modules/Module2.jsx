import React, { useState, useEffect, useMemo, useRef } from "react";
import BackToPortal from "../lms/BackToPortal.jsx";
import { scopedKey } from "../lms/session.js";
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
  { q: "Après le contre-perçage et l'alésage d'un empilage, l'opérateur veut poser directement les Hi-Lok pour gagner du temps. Que prescrit la gamme ?", options: ["Pose directe si l'alésage est propre", "Démontage, ébavurage, nettoyage, puis pose", "Soufflage à l'air comprimé puis pose", "Pose directe avec mastic en excès"], answer: 1, why: "Le démontage est le seul moyen d'enlever les copeaux et bavures piégés entre les tôles. Un copeau coincé empêche le plaquage, concentre les contraintes et piège l'humidité.", hint: "Pense à ce qui se trouve entre les deux tôles, là où on ne voit rien." },
  { q: "Tu perces un revêtement carbone dont la face de sortie est libre. Quelles prescriptions écris-tu ?", options: ["Foret acier rapide, avance forte", "Foret carbure ou diamant, appui arrière (martyr), aspiration", "Perçage à la main sans aspiration", "Poinçonnage puis alésage"], answer: 1, why: "Sans appui arrière, les derniers plis s'écartent sous la poussée du foret : c'est le délaminage de sortie. L'outil carbure ou diamant coupe la fibre proprement, l'aspiration capte la poussière conductrice.", hint: "Le défaut apparaît en sortie de trou, côté où rien ne retient les plis." },
  { q: "Un support présente un jeu de 0,3 mm avec la structure. Le compagnon propose de « serrer un peu plus fort pour que ça plaque ». Ta réponse ?", options: ["D'accord si le couple reste dans la plage", "Refus : on cale, on ne tire jamais une structure au serrage", "D'accord avec une rondelle plus épaisse", "D'accord si la pièce est en titane"], answer: 1, why: "Tirer une pièce pour fermer un jeu crée des contraintes résiduelles. Avec les vibrations du rotor, elles se transforment en criques de fatigue. Le jeu se traite par une cale pelable ou liquide.", hint: "Pense à ce que deviennent les contraintes internes sous les vibrations du rotor." },
  { q: "Pourquoi l'aspiration des poussières de carbone est-elle obligatoire, en plus de la protection de l'opérateur ?", options: ["Elles rayent la peinture", "Elles sont conductrices et peuvent créer des courts-circuits sur l'avionique", "Elles accélèrent la polymérisation du PR", "Elles faussent les cotes de l'alésage"], answer: 1, why: "La fibre de carbone conduit l'électricité. Dispersée dans la cellule, sa poussière se dépose dans les connecteurs et équipements : risque de courts-circuits et de pannes intermittentes.", hint: "Le carbone a une propriété électrique particulière." },
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
  { q: "Tu dois fermer le caisson d'une dérive de Fenestron : l'intérieur n'est plus accessible. Quelle famille de fixations prescris-tu ?", options: ["Rivets pleins", "Rivets aveugles structuraux (type CherryMax)", "Vis et écrous standard", "Collage seul"], answer: 1, why: "Le rivet plein exige un tas côté queue, donc l'accès aux deux faces. Le rivet aveugle structural se pose et se contrôle d'un seul côté.", hint: "Quelle fixation se pose en n'ayant accès qu'à une seule face ?" },
  { q: "Que vérifie le contrôle qualité prescrit après la pose d'un Hi-Lok ?", options: ["Uniquement la rupture de collerette", "Rupture de collerette, dépassement de tige à la jauge, absence de jeu sous tête", "Le couple au torquemètre après rupture", "La couleur de la bague"], answer: 1, why: "La rupture prouve que le couple a été atteint, la jauge prouve que la longueur de serrage (grip) est la bonne, l'absence de jeu sous tête prouve le plaquage.", hint: "Il y a trois points à contrôler." },
  { q: "Que signifie « PR 1422 B 2 » sur une gamme ?", options: ["2 couches à appliquer", "Durée de vie en pot de 2 heures", "Polymérisation en 2 jours", "Épaisseur 2 mm"], answer: 1, why: "Le code B donne la durée d'utilisation du mélange : B 1/2 = 30 min, B 2 = 2 heures. Le préparateur le choisit selon la quantité de travail à faire sur le poste.", hint: "Le chiffre derrière la lettre B est une durée." },
  { q: "Un revêtement carbone est fixé sur un cadre en aluminium. Quelle configuration prescris-tu à l'interface ?", options: ["Contact direct, c'est plus rigide", "Pli de verre isolant, primaire sur l'alu et PR d'interposition", "Graisse entre les pièces", "Rondelles inox seulement"], answer: 1, why: "Le carbone et l'aluminium ont un fort écart de potentiel. Il faut couper le contact électrique (verre), protéger l'alu (primaire) et empêcher l'eau d'entrer (PR).", hint: "Il faut empêcher la pile galvanique de se former." },
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
  { q: "Un écrou auto-freiné a un couple nominal de 20 à 24 N·m. Le couple de freinage mesuré à l'approche est de 3 N·m et la norme demande l'addition. Que doit afficher l'opérateur ?", options: ["20 à 24 N·m", "23 à 27 N·m", "17 à 21 N·m", "24 N·m fixe"], answer: 1, why: "Le couple de freinage est consommé par le frottement de l'élément freineur, pas par la mise en tension de la vis. On l'ajoute pour obtenir la bonne précharge : 20 + 3 et 24 + 3.", hint: "Le freinage absorbe une partie du couple sans serrer la vis." },
  { q: "Pourquoi une clé de contre-couple est-elle obligatoire sur un raccord B-nut de tuyauterie hydraulique ?", options: ["Pour aller plus vite", "Pour ne pas transmettre de torsion au tube, qui se vrillerait", "Pour mesurer le couple", "Pour remplacer le fil à freiner"], answer: 1, why: "Sans maintien du raccord fixe, l'effort de serrage fait tourner l'ensemble et vrille le tube : contrainte permanente, fissure par fatigue vibratoire et fuite.", hint: "Que subit le tube si le raccord tourne avec l'écrou ?" },
  { q: "Quelle est la règle absolue du fil à freiner ?", options: ["Il doit être très tendu, peu importe le sens", "Il doit toujours tirer la fixation dans le sens du serrage", "Il doit faire au moins 20 torsades par pouce", "On peut réutiliser le fil d'un démontage"], answer: 1, why: "Si la fixation tente de se desserrer sous les vibrations du rotor, le fil se tend et la retient. Posé à l'envers, il l'aide au contraire à se dévisser.", hint: "Le fil doit s'opposer au desserrage." },
  { q: "L'écrou à créneaux d'une bielle ATA 67 arrive au couple mini et le créneau ne tombe pas en face du trou de goupille. Que fait l'opérateur ?", options: ["Il desserre jusqu'au créneau précédent", "Il poursuit le serrage jusqu'au créneau suivant, sans dépasser le couple maxi", "Il goupille de travers", "Il remplace la goupille par du fil"], answer: 1, why: "On ne desserre jamais pour aligner, on ne force jamais au-delà du maxi. Si aucun créneau n'est accessible dans la plage, on change la rondelle ou l'écrou selon la norme.", hint: "Desserrer fait tomber sous le couple mini." },
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

function FodHunt() {
  const [found, setFound] = useState([]);
  const [miss, setMiss] = useState(0);
  const svgRef = useRef(null);
  const click = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const hit = FOD_ITEMS.find((f) => !found.includes(f.id) && Math.hypot(f.x - p.x, f.y - p.y) < 14);
    if (hit) setFound([...found, hit.id]); else setMiss(miss + 1);
  };
  const all = found.length === FOD_ITEMS.length;
  return (
    <Panel className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Search size={18} className="text-amber" />
        <h3 className="font-display text-xl font-semibold text-ink">Chasse au FOD avant fermeture du plancher mécanique</h3>
        <span className="ml-auto font-mono text-[12px] text-ink tabular-nums">{found.length}/{FOD_ITEMS.length} trouvés</span>
      </div>
      <p className="mb-3 text-[13px] text-muted">Zone sous la BTP, au-dessus de la timonerie de commandes de vol. Clique sur chaque corps étranger avant de signer le point d'arrêt.</p>
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
          <g key={f.id} transform={`translate(${f.x} ${f.y})`}>
            {f.draw}
            {found.includes(f.id) && <circle r="11" fill="none" stroke="#3ddc97" strokeWidth="2" />}
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-2">
        {FOD_ITEMS.map((f) => (
          <span key={f.id} className={cx("rounded-md border px-2 py-1 font-mono text-[11px]", found.includes(f.id) ? "border-ok/60 bg-ok/10 text-ok" : "border-line text-muted")}>
            {found.includes(f.id) ? f.n : "?"}
          </span>
        ))}
        {miss > 0 && <span className="ml-auto font-mono text-[11px] text-muted">{miss} clic{miss > 1 ? "s" : ""} dans le vide</span>}
      </div>
      {all && (
        <div className="mt-3 rounded-lg border border-ok/50 bg-ok/10 p-3 text-[13px] text-ink">
          <strong className="text-ok">Zone propre. </strong>Chacun de ces objets aurait pu bloquer une bielle ou un guignol, ou être aspiré par une turbine. Sans point d'arrêt écrit, personne n'aurait été chargé de les chercher.
          <button type="button" onClick={() => { setFound([]); setMiss(0); }} className="ml-2 font-mono text-[11px] uppercase text-muted underline hover:text-ink">Recommencer</button>
        </div>
      )}
    </Panel>
  );
}

const Q_BOND = [
  { q: "Quelle est la séquence correcte d'une métallisation de tresse de masse ?", options: ["Montage, mesure, décapage", "Décapage, montage au couple, mesure, re-protection", "Mesure, décapage, montage", "Montage sur peinture, mesure"], answer: 1, why: "La peinture isole : on décape d'abord, on monte au couple, on mesure au milliohmmètre, et on referme la zone à nu par une re-protection anticorrosion.", hint: "La mesure n'a de sens qu'une fois le contact établi, et la zone à nu doit être refermée." },
  { q: "Pourquoi la métallisation est-elle critique sur un hélicoptère en particulier ?", options: ["Pour l'esthétique", "Les pales qui frottent l'air chargent la cellule en électricité statique, en plus du retour de masse et de la foudre", "Pour réduire la masse", "Pour isoler les harnais"], answer: 1, why: "La rotation des pales génère des charges électrostatiques importantes. Sans continuité électrique de la cellule, elles se déchargent de façon incontrôlée et perturbent l'avionique.", hint: "Pense à ce que provoque le frottement des pales dans l'air." },
  { q: "Un harnais électrique frotte sur une tuyauterie hydraulique sous l'effet des vibrations. Comment s'appelle ce défaut et comment le prévient-on ?", options: ["Fretting ; on graisse le harnais", "Chafing ; respect des jeux minimums et colliers à garniture élastomère", "Crazing ; on peint le tube", "Pitting ; on ajoute du PR"], answer: 1, why: "Le chafing est l'usure par frottement vibratoire. Il perce l'isolant puis le tube : court-circuit et fuite. Ségrégation, jeux minimums et colliers garnis l'évitent.", hint: "C'est un terme EWIS courant, lié au frottement." },
  { q: "Où le préparateur place-t-il le point d'arrêt « Contrôle FOD & aspiration » ?", options: ["À la livraison client", "Avant toute fermeture de zone ou de caisson", "Après le premier vol", "Uniquement en fin de chaîne FAL"], answer: 1, why: "Une fois la zone fermée, un objet oublié est invisible et inaccessible. Le contrôle doit avoir lieu juste avant la fermeture, signé dans la gamme.", hint: "Après, il est trop tard pour voir." },
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
  const [pool, setPool] = useState(() => shuffle(G_ALL.map((s) => s.id)));
  const [seq, setSeq] = useState([]);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState(null);
  const [tries, setTries] = useState(0);
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);

  const reset = () => { setStage(-1); setResult(null); };
  const add = (id) => { if (seq.length >= 8) return; reset(); setSeq([...seq, id]); setPool(pool.filter((p) => p !== id)); };
  const remove = (id) => { reset(); setSeq(seq.filter((s) => s !== id)); setPool([...pool, id]); };
  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= seq.length) return;
    reset(); const s = [...seq]; [s[i], s[j]] = [s[j], s[i]]; setSeq(s);
  };
  const simulate = () => {
    const r = evaluateGamme(seq);
    setResult(r); setTries(tries + 1); setStage(0);
    clearInterval(timer.current);
    let k = 0;
    timer.current = setInterval(() => {
      k += 1; setStage(k);
      if (k >= 8) { clearInterval(timer.current); if (r.ok) onComplete(); }
    }, 380);
  };
  const restart = () => { clearInterval(timer.current); setPool(shuffle(G_ALL.map((s) => s.id))); setSeq([]); reset(); };
  const finished = stage >= 8 && result;
  const simFx = finished ? result.fx : new Set();

  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={ListOrdered} kicker="Atelier 1 · Ordonnanceur de gamme structure" title="Écris la gamme d'une jonction hybride carbone / alu sur la poutre de queue du H160">
        Choisis 8 opérations parmi les 11 proposées et mets-les dans l'ordre. Trois sont des pièges vus sur poste. Lance ensuite la simulation : elle exécute ta gamme telle quelle, comme le ferait l'opérateur.
      </SectionHead>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList size={16} className="text-sky" />
            <Eyebrow>Opérations disponibles</Eyebrow>
            <span className="ml-auto font-mono text-[11px] text-muted">clic = ajouter</span>
          </div>
          <div className="flex flex-col gap-2">
            {pool.map((id) => (
              <button key={id} type="button" onClick={() => add(id)} disabled={seq.length >= 8}
                className={cx("rounded-lg border border-line bg-panel2 px-3 py-2 text-left text-[13px] text-ink/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", seq.length >= 8 ? "cursor-not-allowed opacity-50" : "hover:border-sky/60 hover:text-ink")}>
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
                  {id ? (
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
            <PrimaryButton onClick={simulate} disabled={seq.length < 8 || (stage >= 0 && stage < 8)} tone="amber"><Play size={16} /> Simuler la gamme</PrimaryButton>
            <button type="button" onClick={restart} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-muted hover:text-ink"><RotateCcw size={14} /> Vider</button>
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
      <ValidatedBanner done={done} label="Gamme structure hybride ordonnée sans erreur." />
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
  const [order] = useState(() => AUDITS.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState([]);
  const finished = pos >= order.length;
  const good = score.filter(Boolean).length;
  const c = !finished ? AUDITS[order[pos]] : null;
  useEffect(() => { if (finished && good >= 7) onComplete(); }, [finished]);
  const judge = (accept) => { if (picked !== null) return; setPicked(accept); setScore([...score, accept === c.accept]); };
  const next = () => { setPos(pos + 1); setPicked(null); };
  const restart = () => { setPos(0); setPicked(null); setScore([]); };

  const head = (
    <SectionHead icon={Eye} kicker="Atelier 2 · Inspecteur freinage & couple" title="Audit sur le poste d'assemblage : tu acceptes ou tu refuses ?">
      8 montages relevés en FAL, spécial vibrations hélico : 4 freinages au fil, 2 fiches de couple, un raccord hydraulique et une fixation Hi-Lok. 7 bonnes décisions sur 8 pour valider l'atelier.
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
            <PrimaryButton onClick={restart} tone="amber"><RotateCcw size={16} /> Refaire l'audit</PrimaryButton>
          </div>
        </Panel>
        <ValidatedBanner done={done} label="Audit freinage & couple réussi (7/8 minimum)." />
      </div>
    );
  }

  const right = picked !== null && picked === c.accept;
  return (
    <div className="flex flex-col gap-6">
      {head}
      <div className="flex gap-1" aria-label="Progression de l'audit">
        {AUDITS.map((_, i) => <div key={i} className={cx("h-1.5 flex-1 rounded-full", i < score.length ? (score[i] ? "bg-ok" : "bg-ko") : i === pos ? "bg-sky" : "bg-line")} />)}
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
    q: "Tu prépares la gamme de pose de 150 fixations en montage humide sur un caisson de H175, à environ 40 s par fixation. Quel mastic prescris-tu ?",
    options: ["PR 1422 B 1/2, il polymérise plus vite", "PR 1422 B 2", "PR 1422 B 1/2 en un seul mélange, en demandant à l'opérateur d'accélérer", "Aucun mastic, la pose humide est facultative"],
    answer: 1,
    why: "150 × 40 s = 100 min, soit environ 2 h avec la marge. Un B 1/2 (30 min) serait hors durée de vie bien avant la fin. Le B 2 couvre le travail. Le préparateur choisit toujours la classe d'après la charge réelle du poste.",
    risk: "Avec un B 1/2, le mastic devient pâteux dès la 45e fixation environ : film discontinu, fixations mal plaquées, interface non étanche et rejet de tout le lot.",
  },
  {
    tag: "Hi-Lok · Contrôle", scenario: true,
    q: "Sur la poutre de queue, un opérateur signale qu'une collerette Hi-Lok a cassé alors que la tête n'est pas encore plaquée (jeu visible sous tête). Que prescris-tu ?",
    options: ["Accepter : la collerette a cassé, donc le couple est atteint", "Fixation non conforme : dépose, contrôle de l'alésage et de la longueur de serrage, pose d'une fixation neuve", "Resserrer la bague restante à la clé", "Ajouter du PR sous la tête pour combler le jeu"],
    answer: 1,
    why: "Une rupture anticipée signifie que le couple a été absorbé par autre chose que la mise en tension : grippage de filet, bavure, mauvais grip. La preuve de serrage est fausse. On dépose, on cherche la cause, on repose une fixation neuve.",
    risk: "Une fixation sans précharge travaille en cisaillement alterné sous les vibrations du rotor : ovalisation du trou, puis crique dans le cadre.",
  },
  {
    tag: "ATA 20 · Métallisation", scenario: true,
    q: "Contrôle d'une tresse de masse sur la BTP : mesure 1,8 mΩ pour un seuil de 2,5 mΩ, mais la zone décapée autour de la cosse est restée nue. Ta décision ?",
    options: ["Conforme, la mesure est bonne", "Non conforme tant que la re-protection anticorrosion n'est pas faite", "Refaire la mesure avec un autre appareil", "Peindre par-dessus la cosse sans autre précaution"],
    answer: 1,
    why: "La séquence complète est : décapage, montage au couple, mesure, puis re-protection. La mesure valide le contact aujourd'hui, la re-protection le garantit dans la durée.",
    risk: "Le métal nu s'oxyde sous la cosse, la résistance remonte en service, et la liaison de masse ne remplit plus sa fonction face à la foudre et à l'électricité statique.",
  },
  {
    tag: "Calage · BTP", scenario: true,
    q: "Un support de BTP présente un jeu régulier de 0,4 mm avec le plancher mécanique. Que doit dire la gamme ?",
    options: ["Serrer jusqu'au plaquage, le couple suffira", "Cale pelable pelée à 0,40 mm, contrôle de l'épaisseur puis du plaquage", "Deux rondelles sous chaque vis", "Remplir le jeu au mastic PR"],
    answer: 1,
    why: "Un jeu régulier se traite par une cale pelable, pelée feuillet par feuillet jusqu'à l'épaisseur mesurée. Le PR n'est pas une cale structurale, et on ne tire jamais une structure au serrage.",
    risk: "Tirer le support crée des contraintes résiduelles juste sous la boîte de transmission principale, la zone la plus sollicitée en vibrations : criques de fatigue sur le support ou le plancher.",
  },
  {
    tag: "ATA 67 · Commandes de vol", scenario: true,
    q: "Une bielle de commande de vol vient d'être posée : écrou à créneaux au couple, goupille neuve. Quelle étape la gamme doit-elle imposer avant de continuer ?",
    options: ["Aucune, l'auto-contrôle de l'opérateur suffit", "Un double contrôle indépendant par une seconde personne, en point d'arrêt signé", "Un vernis témoin seulement", "Un essai en vol immédiat"],
    answer: 1,
    why: "Les commandes de vol sont un point vital : une erreur n'a pas de redondance. Le double contrôle est fait par une personne qui n'a pas réalisé le travail, et il bloque la suite de la gamme tant qu'il n'est pas signé.",
    risk: "Une goupille oubliée ou un écrou non serré sur une bielle ATA 67, et c'est la perte de contrôle de l'hélicoptère.",
  },
  {
    tag: "Perçage CFRP", scenario: true,
    q: "Au premier perçage d'un revêtement carbone de H160, les trous présentent des fibres arrachées et des plis écartés en sortie. Quelle correction écris-tu ?",
    options: ["Augmenter l'avance pour finir plus vite", "Foret carbure ou diamant, appui arrière (martyr) et paramètres adaptés", "Percer depuis l'autre face sans changer d'outil", "Ajouter du PR dans le trou"],
    answer: 1,
    why: "C'est du délaminage de sortie. L'appui arrière retient les derniers plis, l'outil carbure ou diamant coupe la fibre au lieu de l'arracher.",
    risk: "Un délaminage réduit la tenue de la jonction autour de la fixation. Selon son étendue, la pièce part en réparation ou au rebut.",
  },
  {
    tag: "Séquence structure", scenario: true,
    q: "Pour tenir le délai, un chef d'équipe propose de supprimer l'opération de démontage après alésage et de « bien souffler les trous ». Ta réponse ?",
    options: ["D'accord si on souffle fort", "Refus : le démontage, l'ébavurage et le nettoyage restent obligatoires", "D'accord pour les zones alu seulement", "D'accord si le contrôle final est renforcé"],
    answer: 1,
    why: "Le soufflage ne sort pas les copeaux d'entre les tôles, il les pousse plus loin. Seul le démontage permet de voir et de traiter l'interface.",
    risk: "Copeaux piégés : défaut de plaquage, concentration de contraintes et corrosion au cœur de l'assemblage. En prime, la poussière de carbone soufflée se dépose dans l'avionique.",
  },
  {
    tag: "Fil à freiner", scenario: true,
    q: "En audit, tu constates qu'un fil à freiner tire une vis de couvercle de BTA dans le sens anti-horaire (filetage à droite). Que fais-tu ?",
    options: ["Accepter si le fil est bien tendu", "Refuser : dépose du fil, contrôle du couple, refreinage avec un fil neuf dans le sens du serrage", "Ajouter une torsade supplémentaire", "Retendre le même fil dans l'autre sens"],
    answer: 1,
    why: "Un fil qui tire dans le sens du desserrage aide la vis à se dévisser. On refait le freinage avec un fil neuf, après avoir vérifié que la vis est toujours au couple.",
    risk: "Sous les vibrations du rotor, la vis se desserre en quelques heures de vol : fuite d'huile de la boîte arrière et perte de l'anticouple à terme.",
  },
  {
    tag: "Hydraulique · B-nut", scenario: true,
    q: "Sur une tuyauterie hydraulique, l'opérateur doit serrer un raccord B-nut. Que doit préciser la gamme en plus du couple ?",
    options: ["Rien de plus", "L'emploi obligatoire d'une clé de contre-couple sur le raccord fixe", "Un serrage à la main uniquement", "Un graissage du tube"],
    answer: 1,
    why: "La clé de contre-couple maintient le raccord fixe et empêche l'effort de serrage de se transmettre au tube.",
    risk: "Tube vrillé : contrainte permanente qui, sous vibrations, mène à la fissure et à la fuite hydraulique en vol.",
  },
  {
    tag: "Couple · Running torque", scenario: false,
    q: "Écrou auto-freiné : couple nominal de 8 à 10 N·m, couple de freinage mesuré de 2 N·m, addition exigée par la norme. Quelle plage l'opérateur affiche-t-il ?",
    options: ["8 à 10 N·m", "10 à 12 N·m", "6 à 8 N·m", "12 N·m"],
    answer: 1,
    why: "On ajoute le couple de freinage aux deux bornes : 8 + 2 = 10 et 10 + 2 = 12 N·m.",
    risk: "En affichant 8 à 10 N·m, une partie du couple est absorbée par le freinage : la vis est sous-serrée et se desserre sous vibrations.",
  },
  {
    tag: "Fenestron · FOD", scenario: true,
    q: "Tu écris la gamme de fermeture du caisson de dérive Fenestron d'un H160. L'intérieur ne sera plus accessible. Que doit-elle contenir ?",
    options: ["Rivets pleins, puis fermeture", "Point d'arrêt « Contrôle FOD & aspiration » avant fermeture, puis rivets aveugles structuraux", "Rivets aveugles, puis inspection FOD par les trous de rivets", "Fermeture puis secouage du caisson"],
    answer: 1,
    why: "Le contrôle FOD se fait tant que l'intérieur est visible et accessible. Ensuite, l'arrière étant inaccessible, seuls des rivets aveugles structuraux permettent de fermer.",
    risk: "Une queue de rivet ou un bout de fil oublié dans le caisson vibre pendant des années, use la structure ou migre vers les commandes du rotor arrière.",
  },
  {
    tag: "Anticorrosion · Hybride", scenario: true,
    q: "Un plan de H160 prévoit un cadre aluminium sous un revêtement carbone. Le compagnon demande s'il peut monter « à sec » pour gagner du temps. Ta réponse ?",
    options: ["Oui, le carbone ne rouille pas", "Non : pli de verre, primaire sur l'alu et PR d'interposition sont obligatoires", "Oui si on peint après assemblage", "Oui si les fixations sont en titane"],
    answer: 1,
    why: "Carbone et aluminium ont un fort écart de potentiel. Il faut l'isolation électrique, la protection de surface et l'étanchéité, sans exception.",
    risk: "Corrosion galvanique rapide de l'aluminium à l'interface, invisible sous le revêtement jusqu'à la perte de tenue de la jonction.",
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
        <SectionHead icon={Trophy} kicker="Onglet 7 · Évaluation" title="Sprint Méthodes Assemblage · Module 2">
          {QUESTIONS.length} questions tirées au hasard, mises en situation terrain sur les chaînes Airbus Helicopters (H160, H175, FAL). Après chaque réponse, une explication technique te montre pourquoi c'est juste, et ce que l'erreur aurait provoqué sur chaîne.
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
