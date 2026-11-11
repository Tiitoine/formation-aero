import React, { useState, useEffect } from "react";
import BackToPortal from "../lms/BackToPortal.jsx";
import { scopedKey } from "../lms/session.js";
import {
  Layers, Wrench, Zap, ListOrdered, Eye, Trophy, ShieldCheck, ShieldAlert,
  CheckCircle2, XCircle, Flame, RotateCcw, ChevronRight, Gauge, AlertTriangle, Info,
  ClipboardList, FileText, Ruler, Award, ArrowRight, Search, Scale, Lock, Unlock, Target,
  Stamp, Flashlight, Boxes, Package, PackagePlus, ListChecks, UserCheck, Users, HardHat,
  Puzzle, Ban, GitBranch, Hash, FileWarning, Calculator, Plane, ClipboardCheck,
} from "lucide-react";

/* ============================================================
   MODULE 3 · Dossier de définition, gammes SAP/MES & non-conformités
   Airbus Helicopters · Préparateur Méthodes Assemblage
   ============================================================ */
/* ============================================================
   UTILITAIRES
   ============================================================ */
const STORAGE_KEY = "prep-methodes-ah-m3-v1";
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
   BRIQUES COMMUNES (reprises du Module 2)
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
   ONGLET 1 · DU BUREAU D'ÉTUDES AUX MÉTHODES
   ============================================================ */
const BOM_ITEMS = [
  { id: "cadre", t: "Cadre usiné X4500 (alliage 7050)", src: "ebom" },
  { id: "lisse", t: "Lisse de plancher mécanique", src: "ebom" },
  { id: "hilok", t: "Fixations Hi-Lok ASN, Ø 4,8 mm", src: "ebom" },
  { id: "ferrure", t: "Ferrure de servocommande", src: "ebom" },
  { id: "pr", t: "Mastic d'interposition PR 1776 B2", src: "mbom" },
  { id: "cale", t: "Cale pelable (feuilletée) d'ajustage", src: "mbom" },
  { id: "frein", t: "Fil à freiner EN3628", src: "mbom" },
  { id: "mek", t: "Solvant de nettoyage (MEK)", src: "mbom" },
  { id: "chiffon", t: "Chiffons non pelucheux", src: "mbom" },
];

function BomSorter() {
  const [assign, setAssign] = useState({});
  const [checked, setChecked] = useState(false);
  const all = BOM_ITEMS.every((it) => assign[it.id]);
  const score = BOM_ITEMS.filter((it) => assign[it.id] === it.src).length;
  const set = (id, v) => { setAssign({ ...assign, [id]: v }); setChecked(false); };
  return (
    <Panel className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <Boxes size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Exercice · Construis le kit du poste 30</h3>
      </div>
      <p className="mb-4 text-[14px] text-muted">Pour chaque article du kit de montage de la ferrure de servocommande, indique s'il provient de l'E-BOM du Bureau d'Études (il est dans la maquette 3D) ou s'il est ajouté par toi dans la M-BOM.</p>
      <div className="flex flex-col divide-y divide-line rounded-lg border border-line bg-bg">
        {BOM_ITEMS.map((it) => {
          const v = assign[it.id];
          const bad = checked && v !== it.src;
          return (
            <div key={it.id} className={cx("flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center", bad && "bg-ko/10")}>
              <span className="min-w-0 flex-1 text-[14px] text-ink">{it.t}</span>
              <div className="flex gap-2">
                <Chip active={v === "ebom"} onClick={() => set(it.id, "ebom")} tone={checked && v === "ebom" ? (it.src === "ebom" ? "green" : "red") : "blue"}>E-BOM (BE)</Chip>
                <Chip active={v === "mbom"} onClick={() => set(it.id, "mbom")} tone={checked && v === "mbom" ? (it.src === "mbom" ? "green" : "red") : "amber"}>Ajout M-BOM</Chip>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PrimaryButton onClick={() => setChecked(true)} disabled={!all}><ListChecks size={16} /> Vérifier le kit</PrimaryButton>
        {checked && (
          <span className={cx("font-mono text-sm", score === BOM_ITEMS.length ? "text-ok" : "text-amber")}>
            {score}/{BOM_ITEMS.length} correct{score > 1 ? "s" : ""}
          </span>
        )}
      </div>
      {checked && (
        <div className="mt-3">
          <Feedback ok={score === BOM_ITEMS.length}>
            {score === BOM_ITEMS.length
              ? "Les pièces structurales et les fixations sont définies par le BE dans l'E-BOM. Les consommables (mastic, cales pelables, fil à freiner, solvant, chiffons) sont ajoutés par le préparateur dans la M-BOM : sans eux, le kit arrive incomplet au poste et le compagnon s'arrête."
              : "Les lignes en rouge sont mal classées. Rappel : ce qui est dessiné dans la 3D vient de l'E-BOM. Ce qui se consomme pendant le montage, et que la 3D ne montre pas, est ajouté par les Méthodes."}
          </Feedback>
        </div>
      )}
    </Panel>
  );
}

const EFFECTIVITY = [
  { issue: "C", range: "S/N 2001 à 2104", from: 2001, to: 2104, note: "Définition d'origine" },
  { issue: "D", range: "S/N 2105 à 2150", from: 2105, to: 2150, note: "MOD 07-4410 : renfort de cornière, appliqué en chaîne" },
  { issue: "E", range: "S/N 2151 et suivants", from: 2151, to: 99999, note: "MOD 07-4532 : nouvelle ferrure titane" },
];
const EFF_CASES = [
  { sn: 2131, state: "Sur la chaîne d'assemblage (FAL)", answer: "D", why: "2131 est compris entre 2105 et 2150 : c'est l'indice D, avec le MOD 07-4410 appliqué en production." },
  { sn: 2098, state: "Livré au client depuis 2 ans", answer: "SB", why: "2098 est hors de la tranche du MOD. L'appareil est déjà livré : la modification ne peut l'atteindre que par un Service Bulletin appliqué en exploitation, pas par la gamme de production." },
  { sn: 2151, state: "Sur la chaîne d'assemblage (FAL)", answer: "E", why: "2151 est la première borne de l'indice E. Une borne de tranche est incluse : on applique la nouvelle ferrure titane." },
];

function EffectivityTrainer() {
  const [picked, setPicked] = useState({});
  return (
    <Panel className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <Hash size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Exercice · Lire l'effectivité MSN d'un H145</h3>
      </div>
      <p className="mb-3 text-[14px] text-muted">Le cartouche du plan de la cornière de poutre de queue indique trois tranches d'effectivité. Pour chaque appareil, quelle définition s'applique ?</p>
      <div className="mb-4 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[460px] text-left text-[13px]">
          <thead className="bg-panel2 font-mono text-[11px] uppercase tracking-wider text-muted">
            <tr><th className="px-3 py-2">Indice</th><th className="px-3 py-2">Effectivité</th><th className="px-3 py-2">Origine</th></tr>
          </thead>
          <tbody className="divide-y divide-line bg-bg">
            {EFFECTIVITY.map((e) => (
              <tr key={e.issue}><td className="px-3 py-2 font-mono font-semibold text-sky">{e.issue}</td><td className="px-3 py-2 font-mono text-ink">{e.range}</td><td className="px-3 py-2 text-ink/85">{e.note}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-4">
        {EFF_CASES.map((c) => {
          const p = picked[c.sn];
          const ok = p === c.answer;
          return (
            <div key={c.sn} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 text-[14px] text-ink">
                <Plane size={14} className="text-sky" />
                <span className="font-mono font-semibold">H145 S/N {c.sn}</span>
                <span className="text-muted">· {c.state}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["C", "D", "E", "SB"].map((o) => (
                  <Chip key={o} active={p === o} tone={p === o ? (ok ? "green" : "red") : "blue"} disabled={ok} onClick={() => !ok && setPicked({ ...picked, [c.sn]: o })}>
                    {o === "SB" ? "Hors chaîne : Service Bulletin" : "Indice " + o}
                  </Chip>
                ))}
              </div>
              {p && <Feedback ok={ok}>{ok ? c.why : "Relis les bornes de la tranche et l'état de l'appareil (en production ou livré)."}</Feedback>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

const Q_BE = [
  {
    q: "Qui construit la M-BOM ?",
    options: ["Le Bureau d'Études, en même temps que la 3D", "Le préparateur méthodes, à partir de l'E-BOM", "Le magasin logistique", "Le client à la commande"],
    answer: 1,
    why: "Le BE livre l'E-BOM fonctionnelle. Le préparateur la restructure par poste de la FAL, prépare le kitting et ajoute les consommables.",
    hint: "Pense à qui connaît la séquence réelle de montage par poste.",
  },
  {
    q: "Un trou de fixation Ø 6 mm dans une tôle aluminium : quelle distance au bord minimale vise-t-on typiquement ?",
    options: ["6 mm (1D)", "9 mm (1,5D)", "12 mm (2D)", "36 mm (6D)"],
    answer: 2,
    why: "ED ≥ 2D en métallique, soit 12 mm. En composite carbone, on vise souvent 2,5D, soit 15 mm. Le plan et les normes BNAE/ECS font toujours foi.",
    hint: "La règle de base en métal est ED ≥ 2 fois le diamètre.",
  },
  {
    q: "Quelle est la différence entre un MOD et un SB ?",
    options: ["Aucune, ce sont deux noms du même document", "Le MOD s'applique en production (Part-21G), le SB sur les appareils déjà livrés", "Le SB s'applique en production, le MOD en exploitation", "Le MOD concerne la peinture, le SB la structure"],
    answer: 1,
    why: "Le MOD change la définition à partir d'un rang d'effectivité sur la chaîne. Le Service Bulletin permet de porter une modification sur la flotte en service.",
    hint: "Un appareil sur la chaîne et un appareil chez le client ne sont pas modifiés par le même document.",
  },
];

function TabBE({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={Layers} kicker="Onglet 1 · Dossier de définition" title="Du Bureau d'Études aux Méthodes : E-BOM, M-BOM et lecture technique">
        Le Bureau d'Études (DOA Part-21J) décrit ce que doit être l'hélicoptère. Toi, au bureau des méthodes de la FAL, tu décris comment on le construit, dans quel ordre, avec quoi, et sur quel poste.
      </SectionHead>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <RuleCard title="E-BOM · Engineering BOM" icon={FileText}>
          Nomenclature <strong>fonctionnelle</strong> issue de la conception. Elle est rangée par ensembles et sous-ensembles du produit (structure, transmission, commandes de vol), sans notion de poste de travail ni d'ordre de montage.
        </RuleCard>
        <div className="flex items-center justify-center"><ArrowRight size={28} className="rotate-90 text-sky lg:rotate-0" /></div>
        <RuleCard title="M-BOM · Manufacturing BOM" icon={Boxes} tone="amber">
          Nomenclature <strong>industrielle</strong> construite par le préparateur. Elle découpe le produit selon la <strong>séquence réelle de montage par poste de la FAL</strong>, organise le kitting logistique et <strong>ajoute les consommables</strong> absents de la 3D : mastic PR, cales pelables, fil à freiner, solvants, chiffons non pelucheux.
        </RuleCard>
      </div>

      <BomSorter />

      <div className="flex flex-col gap-4">
        <SectionHead icon={Ruler} kicker="Lecture du dossier de définition" title="Plan 2D, maquette 3D DMU / MBD et cartouche">
          En définition MBD (Model Based Definition), les cotes et tolérances sont portées directement dans la maquette 3D. Le cartouche reste ta première lecture : il t'évite de préparer une gamme sur une définition périmée.
        </SectionHead>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <RuleCard n="1" title="Indice de révision (Issue)">Vérifie que l'indice du plan correspond à celui qui est applicable au rang d'effectivité de l'appareil.</RuleCard>
          <RuleCard n="2" title="Matière">Alliage, état métallurgique, composite : elle conditionne le perçage, les fixations et la distance au bord.</RuleCard>
          <RuleCard n="3" title="Traitement de surface">Anodisation, primaire, peinture : à reprendre en gamme après toute retouche, et à protéger pendant le montage.</RuleCard>
          <RuleCard n="4" title="Tolérances générales">Elles s'appliquent à toute cote non tolérancée individuellement. Une cote sans tolérance n'existe pas.</RuleCard>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <RuleCard title="Distance au bord · Edge Distance (ED)" icon={Ruler} tone="red">
            Distance du <strong>centre du trou</strong> au bord de la pièce. Typiquement <strong className="font-mono">ED ≥ 2D</strong> en métallique, souvent <strong className="font-mono">2,5D</strong> en composite carbone. En dessous, le bord de tôle risque le cisaillement ou l'arrachement sous charge.
          </RuleCard>
          <RuleCard title="Pas entre fixations · Pitch" icon={Ruler} tone="blue">
            Distance entre les centres de deux fixations voisines. Typiquement <strong className="font-mono">4D ≤ pas ≤ 6D</strong>. Trop serré, la tôle est affaiblie façon « timbre-poste » ; trop lâche, le plaquage entre fixations n'est plus garanti.
          </RuleCard>
        </div>
        <NoteBox>Les valeurs 2D, 2,5D et 4D à 6D sont des règles de conception courantes (normes BNAE, standards AH ECS / EICM). La valeur exigée sur ta pièce est toujours celle du plan ou de la norme qu'il cite.</NoteBox>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHead icon={GitBranch} kicker="BNAE RG.Aéro 000 23" title="Gestion de configuration et effectivité">
          Chaque définition s'applique à une tranche d'appareils repérée par le MSN (Manufacturer Serial Number). Préparer une gamme, c'est d'abord savoir pour quels numéros de série elle vaut.
        </SectionHead>
        <div className="grid gap-3 md:grid-cols-2">
          <RuleCard title="MOD · Modification de production" icon={Wrench}>Change la définition approuvée à partir d'un rang d'effectivité. Elle est appliquée <strong>en chaîne</strong> par l'organisme de production Part-21G, et ta gamme doit être indicée en conséquence.</RuleCard>
          <RuleCard title="SB · Service Bulletin" icon={Plane} tone="amber">Porte une modification sur des appareils <strong>déjà livrés</strong>. Il est appliqué en exploitation ou en maintenance, et non par la gamme de production neuve.</RuleCard>
        </div>
        <EffectivityTrainer />
      </div>

      <ImpactBox title="Ton réflexe avant de rédiger la moindre opération">
        Lis le cartouche, vérifie l'indice applicable au MSN, puis contrôle sur la 3D que les distances au bord et les pas des perçages que tu prescris sont tenables avec les outillages du poste.
      </ImpactBox>

      <QuickCheck title="Contrôle de fin d'onglet" questions={Q_BE} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu sais passer de l'E-BOM à la M-BOM et lire une effectivité." />
    </div>
  );
}

/* ============================================================
   ONGLET 2 · CONSTRUIRE UNE GAMME SAP / MES
   ============================================================ */
const BLOCKS = [
  { n: "1", icon: Hash, title: "En-tête & postes", text: "Numéro d'opération (0010, 0020…), poste de charge, temps alloué. Les numéros vont de 10 en 10 pour pouvoir insérer une opération sans tout renuméroter." },
  { n: "2", icon: HardHat, title: "HSE & prérequis", text: "EPI obligatoires : masque FFP3 contre la poussière de carbone, gants nitrile pour le PR et la MEK. Ventilation du poste, consignations." },
  { n: "3", icon: Gauge, title: "Outillages & moyens étalonnés", text: "Bâti d'assemblage (jig), gabarit de perçage, clé dynamométrique, milliohmmètre. Le compagnon vérifie l'étiquette de validité métrologique avant usage." },
  { n: "4", icon: Package, title: "Composants & consommables", text: "Pièces de la M-BOM et normes consommables (PR 1776 B2, fil frein EN3628), avec contrôle de la date de péremption (Shelf Life) du mastic avant application." },
  { n: "5", icon: FileText, title: "Instructions & visuels", text: "Verbes d'action, valeurs chiffrées avec tolérance, vues 3D ou photos. Jamais « serrer fort » : « Serrer au couple de 12 à 14 N.m selon norme EICM »." },
  { n: "6", icon: ClipboardCheck, title: "Traçabilité & contrôle qualité", text: "Relevé des lots (batch) et des S/N des pièces critiques (BTP, servocommandes, pales). Points d'arrêt qualité et double contrôle indépendant sur l'ATA 67." },
];

const REWRITES = [
  {
    bad: "Mettre un peu de PR sous la ferrure.",
    options: [
      { t: "Appliquer un cordon de PR 1776 B2 en interposition sur toute la surface de contact de la ferrure, après contrôle de la date de péremption de la cartouche ; relever le n° de lot dans le MES.", ok: true },
      { t: "Mettre suffisamment de PR sous la ferrure pour que ça déborde.", ok: false },
      { t: "Mettre du PR sous la ferrure si nécessaire.", ok: false },
    ],
  },
  {
    bad: "Bien serrer les 4 boulons de la ferrure.",
    options: [
      { t: "Serrer les 4 boulons à fond à la clé à cliquet.", ok: false },
      { t: "Serrer les 4 boulons en croix au couple de 12 à 14 N.m selon norme EICM, avec une clé dynamométrique en cours de validité ; enregistrer la valeur.", ok: true },
      { t: "Serrer les 4 boulons comme sur l'avion précédent.", ok: false },
    ],
  },
  {
    bad: "Vérifier la métallisation.",
    options: [
      { t: "Contrôler visuellement la tresse de métallisation.", ok: false },
      { t: "Mesurer la résistance de métallisation au milliohmmètre étalonné entre la ferrure et la structure : valeur ≤ à la limite du plan ; saisir la valeur mesurée.", ok: true },
      { t: "Vérifier la métallisation si le temps le permet.", ok: false },
    ],
  },
];

function RewriteTrainer() {
  const [picked, setPicked] = useState({});
  const [perms] = useState(() => REWRITES.map((r) => shuffle(r.options.map((_, k) => k))));
  return (
    <Panel className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <FileWarning size={18} className="text-amber" />
        <h3 className="font-display text-xl font-semibold text-ink">Exercice · Réécris l'instruction</h3>
      </div>
      <p className="mb-4 text-[14px] text-muted">Ces phrases ont été trouvées dans une gamme en relecture. Choisis la formulation qui passe un audit.</p>
      <div className="flex flex-col gap-5">
        {REWRITES.map((r, i) => {
          const p = picked[i];
          const ok = p !== undefined && r.options[p].ok;
          return (
            <div key={i} className="flex flex-col gap-2">
              <div className="rounded-lg border border-ko/40 bg-ko/10 px-3 py-2 font-mono text-[13px] text-ink"><span className="mr-2 text-ko">✗</span>« {r.bad} »</div>
              {perms[i].map((k) => (
                <Chip key={k} active={p === k} tone={p === k ? (r.options[k].ok ? "green" : "red") : "blue"} disabled={ok} onClick={() => !ok && setPicked({ ...picked, [i]: k })}>
                  {r.options[k].t}
                </Chip>
              ))}
              {p !== undefined && (
                <Feedback ok={ok}>{ok ? "Verbe d'action, valeur chiffrée, moyen défini et enregistrement : l'opération est exécutable et vérifiable." : "Cette formulation laisse le compagnon interpréter. Ce qui n'est pas chiffré n'est pas contrôlable."}</Feedback>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

const MES_OPS = [
  { op: "0030", t: "Poser les fixations du caisson de servocommande", kind: "op" },
  { op: "0040", t: "Contrôle qualité de la zone avant fermeture : fixations, propreté, FOD", kind: "hold" },
  { op: "0050", t: "Fermer le caisson (pose du panneau d'accès, zone inaccessible ensuite)", kind: "op" },
];

function MesHoldPoint() {
  const [signed, setSigned] = useState({});
  const [msg, setMsg] = useState(null);
  const sign = (o, who) => {
    const i = MES_OPS.findIndex((x) => x.op === o.op);
    const prevOk = MES_OPS.slice(0, i).every((x) => signed[x.op] === "done");
    if (!prevOk) { setMsg("MES : l'opération " + o.op + " est bloquée tant que l'opération précédente n'est pas soldée."); return; }
    if (o.kind === "hold" && who === "comp") { setMsg("MES : signature refusée. Le point d'arrêt " + o.op + " ne peut être levé que par un inspecteur Qualité habilité."); return; }
    setSigned({ ...signed, [o.op]: "done" });
    setMsg(o.kind === "hold" ? "Point d'arrêt levé par l'inspecteur Qualité. L'opération 0050 est débloquée." : null);
  };
  const allDone = MES_OPS.every((o) => signed[o.op] === "done");
  return (
    <Panel className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <Lock size={18} className="text-amber" />
        <h3 className="font-display text-xl font-semibold text-ink">Démo · Le point d'arrêt qualité dans le MES</h3>
      </div>
      <p className="mb-4 text-[14px] text-muted">Essaie de solder les opérations dans le désordre, ou de lever le point d'arrêt avec le badge compagnon.</p>
      <div className="flex flex-col gap-2">
        {MES_OPS.map((o) => {
          const d = signed[o.op] === "done";
          return (
            <div key={o.op} className={cx("flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center", d ? "border-ok/50 bg-ok/5" : o.kind === "hold" ? "border-amber/50 bg-amber/10" : "border-line bg-bg")}>
              <span className={cx("font-mono font-semibold", o.kind === "hold" ? "text-amber" : "text-sky")}>{o.op}</span>
              <span className="min-w-0 flex-1 text-[14px] text-ink">
                {o.kind === "hold" && <span className="mr-2 rounded border border-amber/60 px-1.5 py-0.5 font-mono text-[10px] uppercase text-amber">Hold point</span>}
                {o.t}
              </span>
              {d ? (
                <span className="inline-flex items-center gap-1 font-mono text-[12px] text-ok"><CheckCircle2 size={14} /> Soldée</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => sign(o, "comp")} className="inline-flex items-center gap-1 rounded-md border border-line bg-panel2 px-2 py-1 text-[12px] text-ink hover:border-sky"><UserCheck size={13} /> Badge compagnon</button>
                  {o.kind === "hold" && <button type="button" onClick={() => sign(o, "qa")} className="inline-flex items-center gap-1 rounded-md border border-amber/60 bg-amber/10 px-2 py-1 text-[12px] text-ink hover:bg-amber/20"><Stamp size={13} /> Tampon Qualité</button>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {msg && <div className="mt-3 rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 font-mono text-[12px] text-ink">{msg}</div>}
      {allDone && <div className="mt-3 flex items-center gap-2 text-[13px] text-ok"><Unlock size={14} /> Caisson fermé avec une preuve de contrôle tracée avant la perte d'accès.</div>}
      <button type="button" onClick={() => { setSigned({}); setMsg(null); }} className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink"><RotateCcw size={12} /> Rejouer</button>
    </Panel>
  );
}

const Q_GAMME = [
  {
    q: "Pourquoi la gamme a-t-elle une valeur légale en Part-21G ?",
    options: ["Parce qu'elle fixe le temps alloué aux compagnons", "Parce qu'elle prouve que l'appareil a été construit conformément à sa définition approuvée", "Parce qu'elle remplace le plan du BE", "Elle n'a pas de valeur légale, c'est un document interne"],
    answer: 1,
    why: "Tout ce qui est écrit doit être fait, tout ce qui est fait doit être écrit et tracé. Le dossier de fabrication soldé est la preuve de conformité au certificat de type.",
    hint: "Pense à ce que l'autorité vérifie lors d'un audit de l'organisme de production (POA).",
  },
  {
    q: "Avant d'appliquer un mastic PR, la gamme doit faire vérifier…",
    options: ["La couleur du mastic", "La date de péremption (Shelf Life) et le n° de lot", "Le nom du fournisseur seulement", "Rien, le magasin l'a déjà vérifié"],
    answer: 1,
    why: "Un mastic périmé peut ne pas polymériser ou perdre son adhérence. Le contrôle au poste et le relevé du lot sont la seule barrière avant application.",
    hint: "Les produits chimiques vieillissent même dans leur emballage.",
  },
  {
    q: "Sur quelles opérations le double contrôle indépendant est-il obligatoire ?",
    options: ["Sur la peinture de finition", "Sur les commandes de vol (ATA 67)", "Sur la pose des tapis de protection", "Uniquement sur demande du client"],
    answer: 1,
    why: "Une erreur de montage sur les commandes de vol rotor est catastrophique. Un second contrôleur habilité, indépendant de celui qui a monté, vérifie et signe séparément.",
    hint: "Quelle chaîne d'organes ne tolère aucune erreur de montage ?",
  },
];

function TabGamme({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={ListOrdered} kicker="Onglet 2 · SAP / MES" title="Construire une gamme d'assemblage irréprochable">
        La gamme est l'instruction de travail du compagnon, mais aussi le document que l'autorité et le client peuvent auditer des années après la livraison.
      </SectionHead>

      <DangerBox title="Valeur légale de la gamme · EASA Part-21G (POA)">
        La gamme de fabrication est la preuve que l'hélicoptère a été construit conformément à son certificat de type. <strong>Tout ce qui est écrit doit être fait ; tout ce qui est fait doit être écrit et tracé.</strong> Une opération réalisée mais non tracée n'existe pas pour l'autorité.
      </DangerBox>

      <div className="flex flex-col gap-3">
        <Eyebrow>Les 6 blocs obligatoires d'une opération de gamme</Eyebrow>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCKS.map((b) => (
            <RuleCard key={b.n} n={b.n} title={b.n + ". " + b.title} tone={b.n === "6" ? "amber" : "blue"}>{b.text}</RuleCard>
          ))}
        </div>
      </div>

      <GammeExtract
        title="H160 · Pose ferrure de servocommande · Poste 30"
        lines={[
          { op: "0010", text: "EPI : gants nitrile, lunettes. Vérifier l'étiquette de validité de la clé dynamométrique 5-25 N.m." },
          { op: "0020", text: "Contrôler la date de péremption de la cartouche PR 1776 B2. Relever le n° de lot dans le MES." },
          { op: "0030", text: "Poser la ferrure en montage humide. Serrer en croix au couple de 12 à 14 N.m selon norme EICM." },
          { op: "0040", stop: true, text: "Contrôle Qualité de la zone avant fermeture du caisson." },
        ]}
      />

      <RewriteTrainer />

      <div className="grid gap-3 md:grid-cols-2">
        <RuleCard title="Point d'arrêt qualité · Hold Point" icon={Lock} tone="amber">
          Bloque informatiquement la gamme dans le MES tant que l'inspecteur Qualité n'a pas validé. <strong>Obligatoire avant la fermeture d'un caisson ou d'une zone qui deviendra inaccessible.</strong>
        </RuleCard>
        <RuleCard title="Double contrôle indépendant · Duplicate Inspection" icon={Users} tone="red">
          Obligatoire sur les commandes de vol <strong>ATA 67</strong> : un second contrôleur habilité, qui n'a pas réalisé le montage, vérifie le freinage, le sens de débattement et le goupillage, puis signe séparément.
        </RuleCard>
      </div>

      <MesHoldPoint />

      <ImpactBox title="Le test du compagnon remplaçant">
        Relis chaque opération en te demandant : un compagnon qui arrive de l'intérim et qui n'a jamais vu ce poste peut-il l'exécuter et la tracer sans poser une seule question ? Si non, la gamme n'est pas finie.
      </ImpactBox>

      <QuickCheck title="Contrôle de fin d'onglet" questions={Q_GAMME} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu connais la structure et la valeur légale d'une gamme." />
    </div>
  );
}

/* ============================================================
   ONGLET 3 · NON-CONFORMITÉS & DÉROGATIONS
   ============================================================ */
const QN_STEPS = [
  { n: "1", icon: Ban, title: "Stop & sécurisation", text: "Arrêt de l'opération en défaut. Marquage physique (étiquette) et informatique (blocage MES) pour qu'aucune opération suivante ne vienne recouvrir le défaut." },
  { n: "2", icon: FileWarning, title: "Ouverture de la QN SAP", text: "Description factuelle et cotée : « Alésage mesuré à Ø 6,42 mm pour Ø 6,35 H7 (+0,015/-0) demandé au plan sur le cadre X4500 ». Pas de « trou un peu grand »." },
  { n: "3", icon: GitBranch, title: "Voie standard ou dérogation BE", text: "Cas A : une réparation standard pré-approuvée couvre le cas. Cas B : hors tolérance standard, la QN part au BE (DOA Part-21J) / Stress Office pour dérogation." },
];

const DECISIONS = [
  { id: "rework", label: "REWORK", fr: "Retouche", tone: "blue", text: "Remise en conformité stricte avec le plan initial. Après retouche, la pièce est exactement celle du plan." },
  { id: "repair", label: "REPAIR", fr: "Réparation", tone: "amber", text: "Travaux correctifs approuvés par le BE qui ne ramènent pas exactement au plan, mais restaurent l'aptitude au vol. Le préparateur rédige l'opération de retouche dans la gamme QN." },
  { id: "uai", label: "USE AS IS", fr: "Utiliser en l'état", tone: "green", text: "Accepté sans retouche physique, après démonstration par le calcul du BE que l'écart n'affecte pas la tenue." },
  { id: "scrap", label: "SCRAP", fr: "Rebut", tone: "red", text: "Pièce irrécupérable : isolée, identifiée rebut, puis détruite physiquement pour qu'elle ne revienne jamais en production." },
];

const DEC_CASES = [
  { t: "Une rangée de rivets a été posée avec la mauvaise longueur. On les dépose et on repose des rivets à la longueur du plan, dans les mêmes trous conformes.", answer: "rework" },
  { t: "Un alésage est hors tolérance. Le BE prescrit un doubleur et une fixation de diamètre supérieur non prévus au plan, puis approuve le dossier.", answer: "repair" },
  { t: "L'épaisseur d'une semelle mesure 0,05 mm sous le mini du plan. Le Stress Office démontre une marge suffisante et accepte sans retouche.", answer: "uai" },
  { t: "Une ferrure usinée en titane présente une crique traversante détectée au ressuage.", answer: "scrap" },
];

function DecisionSorter() {
  const [picked, setPicked] = useState({});
  const [order] = useState(() => shuffle(DEC_CASES.map((_, i) => i)));
  return (
    <Panel className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <Scale size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Exercice · Quelle décision de traitement ?</h3>
      </div>
      <p className="mb-4 text-[14px] text-muted">Pour chaque QN soldée, retrouve la décision officielle qui a été prise.</p>
      <div className="flex flex-col gap-4">
        {order.map((ci) => {
          const c = DEC_CASES[ci];
          const p = picked[ci];
          const ok = p === c.answer;
          return (
            <div key={ci} className="flex flex-col gap-2">
              <div className="text-[14px] text-ink">{c.t}</div>
              <div className="flex flex-wrap gap-2">
                {DECISIONS.map((d) => (
                  <Chip key={d.id} active={p === d.id} tone={p === d.id ? (ok ? "green" : "red") : "blue"} disabled={ok} onClick={() => !ok && setPicked({ ...picked, [ci]: d.id })}>
                    <span className="font-mono">{d.label}</span>
                  </Chip>
                ))}
              </div>
              {p && <Feedback ok={ok}>{ok ? DECISIONS.find((d) => d.id === c.answer).text : "Demande-toi : la pièce revient-elle exactement au plan ? Y a-t-il un travail physique ? Est-elle récupérable ?"}</Feedback>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

const Q_QN = [
  {
    q: "Le compagnon te montre un écart au plan. Le chef d'équipe te demande de « valider vite pour ne pas bloquer la chaîne ». Tu…",
    options: ["Valides, tu es responsable méthodes", "Ouvres une QN : tu n'as pas le droit d'autoriser un écart à la définition du BE", "Demandes au compagnon de continuer et de noter l'écart plus tard", "Valides oralement sans trace écrite"],
    answer: 1,
    why: "L'organisme de production (Part-21G) n'a pas le pouvoir de modifier une définition approuvée par l'organisme de conception (Part-21J). Seul le BE peut décider d'une dérogation.",
    hint: "Qui détient l'approbation de conception ?",
  },
  {
    q: "Quelle description de QN est recevable ?",
    options: ["Trou mal percé sur le cadre", "Alésage mesuré à Ø 6,42 mm pour Ø 6,35 H7 (+0,015/-0) demandé au plan, cadre X4500, position 12", "Défaut d'alésage, voir avec l'atelier", "Alésage trop grand, probablement à cause du foret"],
    answer: 1,
    why: "Une QN est factuelle et cotée : valeur mesurée, valeur demandée avec sa tolérance, référence de la pièce et localisation. Le BE doit pouvoir calculer sans venir sur le poste.",
    hint: "Le Stress Office a besoin de chiffres, pas d'impressions.",
  },
  {
    q: "Quelle décision ramène la pièce exactement à la définition du plan ?",
    options: ["REPAIR", "USE AS IS", "REWORK", "SCRAP"],
    answer: 2,
    why: "Le REWORK est la seule décision qui rend la pièce strictement conforme au plan initial. Le REPAIR restaure l'aptitude au vol par une définition différente, approuvée par le BE.",
    hint: "Retouche ou réparation : laquelle revient au plan d'origine ?",
  },
];

function TabQN({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={FileWarning} kicker="Onglet 3 · Aléas de production" title="Non-conformités (QN) et dérogations">
        Sur une FAL, les écarts arrivent tous les jours. Ce qui distingue un bon préparateur, c'est qu'aucun écart ne disparaît sans être décrit, décidé et tracé par la bonne personne.
      </SectionHead>

      <DangerBox title="La règle d'or juridique et sécurité">
        <strong>INTERDICTION ABSOLUE</strong> pour le préparateur méthodes d'autoriser de son propre chef un écart par rapport au plan BE. L'organisme de production Part-21G ne peut pas modifier la définition approuvée par l'organisme de conception Part-21J.
      </DangerBox>

      <div className="flex flex-col gap-3">
        <Eyebrow>Workflow de traitement d'une anomalie sur poste · QN SAP</Eyebrow>
        <div className="grid gap-3 lg:grid-cols-3">
          {QN_STEPS.map((s) => (
            <RuleCard key={s.n} title={"Étape " + s.n + " · " + s.title} icon={s.icon} tone={s.n === "1" ? "red" : s.n === "2" ? "amber" : "blue"}>{s.text}</RuleCard>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Panel className="border-ok/40 p-4">
            <Eyebrow tone="green">Cas A · Réparation standard existante</Eyebrow>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/85">Une instruction générique pré-approuvée par le BE autorise directement le passage en fixation « oversize » (cote réparation), <strong>et</strong> la distance au bord reste respectée (ED ≥ 2D avec le nouveau diamètre). Le préparateur applique la solution standard et la trace dans la QN.</p>
          </Panel>
          <Panel className="border-amber/40 p-4">
            <Eyebrow tone="amber">Cas B · Hors tolérance standard</Eyebrow>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/85">Aucune réparation standard ne couvre le cas, ou ses conditions ne sont pas remplies. La QN est envoyée au <strong>Bureau d'Études (DOA Part-21J) / Stress Office</strong> pour une demande de <strong>dérogation (concession)</strong>. La zone reste bloquée jusqu'à la réponse.</p>
          </Panel>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Eyebrow>Les 4 décisions officielles de traitement</Eyebrow>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DECISIONS.map((d) => (
            <RuleCard key={d.id} title={d.label} icon={d.id === "rework" ? Wrench : d.id === "repair" ? PackagePlus : d.id === "uai" ? CheckCircle2 : Ban} tone={d.tone}>
              <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-muted">{d.fr}</div>
              {d.text}
            </RuleCard>
          ))}
        </div>
      </div>

      <DecisionSorter />

      <ImpactBox title="Après la décision, c'est encore ton travail">
        Pour un REPAIR, tu rédiges l'opération de retouche dans la gamme QN à partir de l'instruction BE : outillage, consommables, valeurs, traçabilité et point d'arrêt qualité. La QN n'est soldée que quand cette opération est exécutée et contrôlée.
      </ImpactBox>

      <QuickCheck title="Contrôle de fin d'onglet" questions={Q_QN} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu sais traiter un écart sans sortir de ton périmètre." />
    </div>
  );
}

/* ============================================================
   ONGLET 4 · LEAN & ERGONOMIE
   ============================================================ */
const PROTECTIONS = [
  { id: "t1", zone: "plancher", t: "Tapis mousse plancher AV" },
  { id: "t2", zone: "plancher", t: "Tapis mousse plancher AR" },
  { id: "h1", zone: "hydro", t: "Bouchon ligne HP n°1" },
  { id: "h2", zone: "hydro", t: "Bouchon ligne retour n°1" },
  { id: "h3", zone: "hydro", t: "Bouchon ligne HP n°2" },
  { id: "h4", zone: "hydro", t: "Bouchon ligne retour n°2" },
  { id: "h5", zone: "hydro", t: "Capuchon raccord réservoir" },
  { id: "h6", zone: "hydro", t: "Capuchon raccord filtre" },
  { id: "e1", zone: "elec", t: "Capuchon connecteur P101" },
  { id: "e2", zone: "elec", t: "Capuchon connecteur P102" },
  { id: "e3", zone: "elec", t: "Capuchon connecteur J210" },
  { id: "e4", zone: "elec", t: "Capuchon connecteur J211" },
  { id: "x1", zone: "cache", t: "Bouchon raccord derrière la servocommande" },
];
const ZONES = [
  { id: "plancher", t: "Plancher mécanique" },
  { id: "hydro", t: "Lignes hydrauliques" },
  { id: "elec", t: "Connecteurs électriques" },
  { id: "cache", t: "Zone masquée derrière la servocommande" },
];

function FodCounter() {
  const [removed, setRemoved] = useState({});
  const [lamp, setLamp] = useState(false);
  const [tried, setTried] = useState(false);
  const count = Object.keys(removed).length;
  const total = PROTECTIONS.length;
  const ok = count === total;
  return (
    <Panel className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <Search size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Exercice · Retrait comptabilisé des protections (anti-FOD)</h3>
      </div>
      <p className="mb-4 text-[14px] text-muted">L'opération 0010 a fait poser {total} protections temporaires sur la zone de la boîte de transmission. Tu es à l'opération 0990 : retire-les toutes avant de déclarer la zone fermable.</p>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="rounded-lg border border-line bg-bg px-3 py-2">
          <div className="font-mono text-[10px] uppercase text-muted">Posées (op 0010)</div>
          <div className="font-mono text-xl font-semibold text-ink tabular-nums">{total}</div>
        </div>
        <div className="rounded-lg border border-line bg-bg px-3 py-2">
          <div className="font-mono text-[10px] uppercase text-muted">Retirées (op 0990)</div>
          <div className={cx("font-mono text-xl font-semibold tabular-nums", ok ? "text-ok" : "text-amber")}>{count}</div>
        </div>
        <Toggle on={lamp} onClick={() => setLamp(!lamp)}><Flashlight size={14} /> Lampe et miroir d'inspection</Toggle>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {ZONES.map((z) => {
          const items = PROTECTIONS.filter((p) => p.zone === z.id);
          const hidden = z.id === "cache" && !lamp;
          return (
            <div key={z.id} className={cx("rounded-lg border p-3", z.id === "cache" ? "border-dashed border-muted/60 bg-panel2" : "border-line bg-bg")}>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">{z.t}</div>
              {hidden ? (
                <div className="text-[13px] italic text-muted">Zone sombre, rien de visible à l'œil nu.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {items.map((p) => {
                    const r = removed[p.id];
                    return (
                      <button key={p.id} type="button" disabled={r} onClick={() => setRemoved({ ...removed, [p.id]: true })}
                        className={cx("rounded-md border px-2 py-1 text-[12px] transition", r ? "border-ok/40 bg-ok/10 text-muted line-through" : "border-amber/60 bg-amber/15 text-ink hover:bg-amber/25")}>
                        {p.t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PrimaryButton onClick={() => setTried(true)} tone={ok ? "green" : "blue"}><ShieldCheck size={16} /> Déclarer la zone fermable</PrimaryButton>
        <button type="button" onClick={() => { setRemoved({}); setLamp(false); setTried(false); }} className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink"><RotateCcw size={12} /> Rejouer</button>
      </div>
      {tried && (
        <div className="mt-3">
          <Feedback ok={ok}>
            {ok
              ? "Bilan posées = retirées : 13/13. Tu peux solder l'opération et présenter la zone au point d'arrêt qualité."
              : "Refusé : " + count + " retirées pour " + total + " posées. Une protection manque à l'appel. Tant que le compte n'est pas juste, la zone ne se ferme pas, on cherche (pense aux zones masquées)."}
          </Feedback>
        </div>
      )}
    </Panel>
  );
}

function PokaYokeSVG() {
  return (
    <svg viewBox="0 0 360 150" className="h-auto w-full" role="img" aria-label="Deux lignes hydrauliques voisines avec des raccords de diamètres différents">
      <rect x="0" y="0" width="360" height="150" rx="10" fill="#0f1729" />
      <rect x="20" y="40" width="190" height="16" rx="8" fill="#3b9eff" opacity="0.85" />
      <rect x="20" y="96" width="190" height="10" rx="5" fill="#ffb020" opacity="0.9" />
      <rect x="210" y="34" width="34" height="28" rx="4" fill="#3b9eff" />
      <rect x="210" y="91" width="34" height="20" rx="4" fill="#ffb020" />
      <rect x="276" y="34" width="44" height="28" rx="4" fill="none" stroke="#3b9eff" strokeWidth="2" />
      <rect x="276" y="91" width="44" height="20" rx="4" fill="none" stroke="#ffb020" strokeWidth="2" />
      <text x="24" y="30" fill="#e6edf7" fontFamily="JetBrains Mono" fontSize="11">Ligne HP · raccord -8</text>
      <text x="24" y="126" fill="#e6edf7" fontFamily="JetBrains Mono" fontSize="11">Ligne retour · raccord -6</text>
      <text x="270" y="80" fill="#8fa0bd" fontFamily="JetBrains Mono" fontSize="10">servocommande</text>
      <path d="M250 48 L270 48" stroke="#3ddc97" strokeWidth="2" markerEnd="url(#pk)" />
      <path d="M250 101 L270 101" stroke="#3ddc97" strokeWidth="2" markerEnd="url(#pk)" />
      <defs><marker id="pk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#3ddc97" /></marker></defs>
    </svg>
  );
}

const Q_LEAN = [
  {
    q: "Deux lignes hydrauliques voisines arrivent sur la même servocommande. Quelle disposition de gamme ou de définition rend l'inversion impossible ?",
    options: ["Une note « attention à ne pas inverser » dans la gamme", "Des raccords de diamètres différents (détrompage Poka-Yoke)", "Un compagnon plus expérimenté", "Un contrôle visuel en fin de gamme"],
    answer: 1,
    why: "Le Poka-Yoke rend l'erreur physiquement impossible : le raccord -8 n'entre pas sur le port -6. Une note ou un contrôle détecte l'erreur, le détrompeur l'empêche.",
    hint: "Cherche la solution qui ne dépend pas de l'attention humaine.",
  },
  {
    q: "À quel moment la gamme prescrit-elle la pose des protections temporaires ?",
    options: ["Dès la première opération du poste", "Juste avant la livraison", "Quand un compagnon le demande", "Après la peinture"],
    answer: 0,
    why: "Les tapis mousse, bouchons et capuchons protègent la structure et les circuits dès l'ouverture du poste. Leur retrait est comptabilisé en fin de gamme.",
    hint: "Un dommage ou une pollution arrive dès que le premier compagnon monte dans la cellule.",
  },
  {
    q: "Fin de gamme : 13 protections posées, 12 retirées. Que fais-tu ?",
    options: ["Tu clôtures, une protection a dû être jetée", "Tu bloques la fermeture de zone et lances une recherche FOD jusqu'à retrouver la 13e", "Tu notes l'écart et tu fermes", "Tu demandes au compagnon de signer quand même"],
    answer: 1,
    why: "Une protection non retrouvée est un FOD potentiel dans une zone qui va devenir inaccessible, voire un bouchon resté sur un circuit hydraulique. Le compte doit être juste avant fermeture.",
    hint: "Où peut être la protection manquante, et que se passe-t-il si on ferme ?",
  },
];

function TabLean({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead icon={Puzzle} kicker="Onglet 4 · Lean & ergonomie" title="Sécuriser le compagnon et le produit dès la gamme">
        Une bonne gamme ne se contente pas d'être juste : elle rend les erreurs difficiles, voire impossibles, et protège la cellule pendant les centaines d'heures de montage.
      </SectionHead>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <RuleCard title="Poka-Yoke · Détrompage" icon={Target}>
          Prévoir des détrompeurs sur les outillages ou dans le séquencement pour rendre l'erreur impossible. Exemple : des <strong>diamètres de raccords différents</strong> sur deux lignes hydrauliques voisines, un pion de détrompage asymétrique sur un gabarit de perçage, des connecteurs à clés différentes.
        </RuleCard>
        <Panel className="p-3"><PokaYokeSVG /></Panel>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <RuleCard title="Protections temporaires dès l'opération 0010" icon={ShieldCheck} tone="green">
          Tapis mousse sur le plancher mécanique, bouchons <em>caps / plugs</em> sur les tuyauteries hydrauliques ouvertes, capuchons sur les prises électriques. Chaque protection est listée et comptée à la pose.
        </RuleCard>
        <RuleCard title="Retrait comptabilisé en fin de gamme" icon={ListChecks} tone="amber">
          L'opération de retrait reprend la liste de pose : posées = retirées, sinon la zone ne se ferme pas. C'est la barrière anti-FOD (Foreign Object Damage) avant la perte d'accès.
        </RuleCard>
      </div>

      <FodCounter />

      <ImpactBox title="Ergonomie : la gamme décide aussi de la posture">
        Séquence les opérations pour travailler à hauteur d'homme quand c'est possible (sous-ensembles montés sur bâti avant intégration), prévois les plates-formes et l'éclairage. Une opération pénible est une opération où l'on fait des erreurs.
      </ImpactBox>

      <QuickCheck title="Contrôle de fin d'onglet" questions={Q_LEAN} onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu intègres détrompage et anti-FOD dans tes gammes." />
    </div>
  );
}

/* ============================================================
   SIMULATEUR 1 · ÉDITEUR & AUDITEUR DE GAMME SAP/MES
   ============================================================ */
const AUDIT_LINES = [
  { op: "0010", poste: "P40", t: "EPI : gants nitrile, lunettes. Vérifier l'étiquette de validité métrologique de la clé dynamométrique 5-25 N.m.", ok: true, why: "Prérequis HSE et moyen étalonné : cette ligne est conforme." },
  { op: "0020", poste: "P40", t: "Poser les tapis mousse sur le plancher mécanique et les bouchons sur les ports hydrauliques ouverts. Lister les 8 protections posées.", ok: true, why: "Protections temporaires posées et comptées dès le début : conforme." },
  {
    op: "0030", poste: "P40", t: "Sortir la servocommande hydraulique rotor principal du kit. Relever son P/N dans le MES.",
    err: "Traçabilité incomplète",
    options: [
      { t: "Relever et saisir dans le MES le P/N et le S/N de la servocommande (pièce critique ATA 67), avec le n° de son certificat de conformité.", ok: true },
      { t: "Photographier la servocommande et classer la photo dans le dossier du poste.", ok: false, why: "Une photo n'est pas un enregistrement traçable rattaché à l'appareil dans le MES." },
      { t: "Relever le P/N seulement, le S/N est déjà connu du magasin.", ok: false, why: "Le P/N identifie un modèle, pas la pièce. Sans S/N, impossible de retrouver l'appareil en cas de campagne sur un lot de servocommandes." },
    ],
    fixed: "Relever et saisir dans le MES le P/N et le S/N de la servocommande (pièce critique ATA 67), avec le n° de son certificat de conformité.",
  },
  {
    op: "0040", poste: "P40", t: "Mélanger la cartouche de mastic PR 1776 B2 et l'appliquer en interposition sur les plans de joint des ferrures.",
    err: "Péremption du mastic non contrôlée",
    options: [
      { t: "Appliquer le mastic s'il est encore souple au toucher.", ok: false, why: "Le toucher ne garantit rien sur la polymérisation finale. Le critère est la date de péremption du fabricant." },
      { t: "Vérifier la date de péremption (Shelf Life) inscrite sur la cartouche PR 1776 B2 avant mélange, refuser une cartouche périmée et relever le n° de lot dans le MES.", ok: true },
      { t: "Demander au magasinier si le mastic est récent.", ok: false, why: "La vérification doit être tracée au poste, au moment de l'emploi, sur la cartouche utilisée." },
    ],
    fixed: "Vérifier la date de péremption (Shelf Life) de la cartouche PR 1776 B2 avant mélange, refuser une cartouche périmée, relever le n° de lot dans le MES. Appliquer en interposition.",
  },
  { op: "0050", poste: "P40", t: "Présenter la servocommande sur ses ferrures avec l'outillage de manutention OT-6720. Engager les 4 boulons de fixation.", ok: true, why: "Outillage défini, action claire : conforme." },
  {
    op: "0060", poste: "P40", t: "Serrer fort les écrous des boulons de fixation, puis freiner.",
    err: "Couple non chiffré",
    options: [
      { t: "Serrer les écrous au couple de 12 à 14 N.m selon norme EICM avec la clé dynamométrique contrôlée en 0010, enregistrer la valeur, puis freiner au fil EN3628 selon norme.", ok: true },
      { t: "Serrer les écrous à la main puis donner un quart de tour supplémentaire.", ok: false, why: "Le quart de tour n'est pas une valeur contrôlable. Le couple doit être chiffré, toléré et mesuré avec un moyen étalonné." },
      { t: "Serrer fort les écrous, le freinage garantira la tenue.", ok: false, why: "Le freinage empêche le desserrage, il ne remplace pas la précharge obtenue par le couple." },
    ],
    fixed: "Serrer au couple de 12 à 14 N.m selon norme EICM (clé contrôlée en 0010), enregistrer la valeur, freiner au fil EN3628 selon norme.",
  },
  {
    op: "0070", poste: "P40", t: "Raccorder les lignes hydrauliques HP et retour sur la servocommande.",
    err: "Bouchons et FOD oubliés",
    options: [
      { t: "Raccorder les lignes et retirer les bouchons à la fin du poste.", ok: false, why: "Un bouchon ne peut pas être retiré après raccordement : soit il est resté dans le circuit, soit le raccord a été fait sur un port bouché." },
      { t: "Souffler les lignes à l'air comprimé avant raccordement.", ok: false, why: "Souffler peut projeter des particules dans le circuit. Ce n'est pas la réponse au retrait comptabilisé des bouchons." },
      { t: "Retirer les bouchons des ports et des lignes au moment du raccordement, les comptabiliser par rapport à la liste de l'op 0020, contrôler l'absence de FOD, puis raccorder.", ok: true },
    ],
    fixed: "Retirer les bouchons au raccordement, les comptabiliser par rapport à l'op 0020, contrôler l'absence de FOD, puis raccorder les lignes HP et retour.",
  },
  {
    op: "0080", poste: "P40", t: "Accoupler la bielle de commande au plateau cyclique, goupiller. Autocontrôle par le compagnon.",
    err: "Pas de double contrôle ATA 67",
    options: [
      { t: "Autocontrôle renforcé : le compagnon vérifie deux fois son montage.", ok: false, why: "Celui qui a monté ne peut pas être le contrôleur indépendant. Deux contrôles par la même personne reproduisent la même erreur." },
      { t: "Double contrôle indépendant (Duplicate Inspection) par un second contrôleur habilité n'ayant pas réalisé le montage : goupillage, freinage, sens de débattement. Signature séparée dans le MES.", ok: true },
      { t: "Contrôle par le chef d'équipe en fin de semaine.", ok: false, why: "Le contrôle doit être fait immédiatement après l'opération, avant toute suite, et tracé à cette opération." },
    ],
    fixed: "Double contrôle indépendant (Duplicate Inspection ATA 67) par un second contrôleur habilité : goupillage, freinage, sens de débattement. Signature séparée MES.",
  },
  { op: "0090", poste: "P40", t: "Point d'arrêt qualité : inspection de la zone avant pose du capotage de la boîte de transmission.", stop: true, ok: true, why: "Hold point avant fermeture d'une zone : conforme." },
  { op: "0100", poste: "P50", t: "Essais fonctionnels hydrauliques selon procédure d'essai : pression, étanchéité, temps de réponse.", ok: true, why: "Essai défini par une procédure : conforme." },
];
const AUDIT_ERRORS = AUDIT_LINES.filter((l) => !l.ok).length;

function TabAuditeur({ done, onComplete }) {
  const [sel, setSel] = useState(null);
  const [fixed, setFixed] = useState({});
  const [tries, setTries] = useState({});
  const [falseAlarms, setFalseAlarms] = useState({});
  const nFixed = Object.keys(fixed).length;
  const valid = nFixed === AUDIT_ERRORS;
  useEffect(() => { if (valid) onComplete(); }, [valid]);
  const line = sel !== null ? AUDIT_LINES[sel] : null;
  const pick = (i) => {
    setSel(i);
    const l = AUDIT_LINES[i];
    if (l.ok) setFalseAlarms({ ...falseAlarms, [l.op]: true });
  };
  const choose = (k) => {
    const l = line;
    if (l.options[k].ok) setFixed({ ...fixed, [l.op]: true });
    setTries({ ...tries, [l.op]: k });
  };
  const reset = () => { setSel(null); setFixed({}); setTries({}); setFalseAlarms({}); };

  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={ClipboardCheck} kicker="Onglet 5 · Simulateur 1" title="Éditeur & auditeur de gamme SAP/MES">
        Un collègue te soumet son brouillon de gamme : installation d'une servocommande hydraulique de rotor principal (ATA 67) sur H175. Il contient {AUDIT_ERRORS} erreurs graves de préparation. Clique sur les lignes fautives et choisis le correctif normatif.
      </SectionHead>

      <div className={cx("flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center", valid ? "border-ok/60 bg-ok/10" : "border-ko/60 bg-ko/10")}>
        {valid ? <ShieldCheck size={28} className="text-ok" /> : <ShieldAlert size={28} className="text-ko" />}
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Statut de la gamme · GA-H175-67-0412</div>
          <div className={cx("font-display text-2xl font-semibold", valid ? "text-ok" : "text-ko")}>{valid ? "VALIDÉ PRODUCTION" : "REJETÉ AUDIT EASA"}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg border border-line bg-bg px-3 py-1.5"><div className="font-mono text-lg font-semibold text-ink tabular-nums">{nFixed}/{AUDIT_ERRORS}</div><div className="font-mono text-[10px] uppercase text-muted">Écarts corrigés</div></div>
          <div className="rounded-lg border border-line bg-bg px-3 py-1.5"><div className="font-mono text-lg font-semibold text-amber tabular-nums">{Object.keys(falseAlarms).length}</div><div className="font-mono text-[10px] uppercase text-muted">Fausses alertes</div></div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-line bg-bg">
          <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-2">
            <FileText size={14} className="text-sky" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Brouillon · SAP PP / MES</span>
            <span className="ml-auto truncate font-mono text-[11px] text-ink/80">H175 · Servocommande RP · ATA 67</span>
          </div>
          <div className="divide-y divide-line">
            {AUDIT_LINES.map((l, i) => {
              const isFixed = fixed[l.op];
              const isFalse = falseAlarms[l.op];
              return (
                <button key={l.op} type="button" onClick={() => pick(i)}
                  className={cx("grid w-full grid-cols-[48px_1fr] gap-3 px-4 py-2.5 text-left text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky",
                    sel === i ? "bg-sky/15" : "hover:bg-panel", isFixed && "bg-ok/5", l.stop && !isFixed && "bg-amber/5")}>
                  <span className={cx("font-mono font-semibold", isFixed ? "text-ok" : l.stop ? "text-amber" : "text-sky")}>{l.op}</span>
                  <span className="leading-relaxed text-ink/90">
                    {l.stop && <span className="mr-2 rounded border border-amber/60 px-1.5 py-0.5 font-mono text-[10px] uppercase text-amber">Point d'arrêt</span>}
                    {isFixed ? <span className="text-ok">{l.fixed}</span> : l.t}
                    {isFixed && <span className="ml-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase text-ok"><CheckCircle2 size={11} /> corrigé</span>}
                    {isFalse && !l.err && <span className="ml-2 font-mono text-[10px] uppercase text-muted">conforme</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Panel className="p-5 lg:sticky lg:top-40 lg:self-start">
          {!line && (
            <div className="flex flex-col gap-2 text-[14px] text-muted">
              <Eye size={20} className="text-sky" />
              <p>Sélectionne une ligne du brouillon pour l'auditer. Cherche ce qui manque au regard des 6 blocs : traçabilité, consommables, valeurs chiffrées, FOD, double contrôle.</p>
            </div>
          )}
          {line && line.ok && (
            <div className="flex flex-col gap-2">
              <Eyebrow tone="green">Ligne {line.op} · conforme</Eyebrow>
              <p className="text-[14px] text-ink">{line.why}</p>
              <p className="text-[13px] text-muted">Fausse alerte comptée : un auditeur qui rejette des lignes saines fait perdre du temps à la chaîne. Cherche ailleurs.</p>
            </div>
          )}
          {line && !line.ok && (
            <div className="flex flex-col gap-3">
              <Eyebrow tone={fixed[line.op] ? "green" : "red"}>Ligne {line.op} · {line.err}</Eyebrow>
              {fixed[line.op] ? (
                <Feedback ok>Correctif appliqué : la ligne est maintenant conforme.</Feedback>
              ) : (
                <>
                  <p className="text-[14px] text-ink">Écart détecté. Choisis le correctif normatif à écrire dans la gamme :</p>
                  <ChoiceStep key={line.op} options={line.options} answer={line.options.findIndex((o) => o.ok)} picked={tries[line.op]} onPick={choose} locked={false} />
                  {tries[line.op] !== undefined && !line.options[tries[line.op]].ok && <Feedback ok={false}>{line.options[tries[line.op]].why}</Feedback>}
                </>
              )}
            </div>
          )}
        </Panel>
      </div>

      {valid && (
        <ImpactBox title="Gamme libérée pour la production">
          Les 5 écarts que tu as corrigés sont ceux que relève un audit EASA ou un audit client sur une POA : traçabilité S/N, péremption, couple chiffré, retrait des bouchons et double contrôle indépendant ATA 67. {Object.keys(falseAlarms).length === 0 ? "Et sans aucune fausse alerte." : "Travaille encore ton tri : " + Object.keys(falseAlarms).length + " ligne(s) saine(s) ont été suspectées."}
        </ImpactBox>
      )}
      <div><button type="button" onClick={reset} className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink"><RotateCcw size={12} /> Recharger le brouillon</button></div>
      <ValidatedBanner done={done} label="Gamme servocommande H175 passée en VALIDÉ PRODUCTION." />
    </div>
  );
}

/* ============================================================
   SIMULATEUR 2 · VÉRIFICATEUR GÉOMÉTRIQUE + ARBRE QN
   ============================================================ */
function EdgeSVG({ d, ed, pitch, k }) {
  const S = 7; /* px par mm */
  const W = 420, H = 262;
  const edgeY = 30;
  const y = edgeY + ed * S;
  const x1 = 170, x2 = Math.min(x1 + pitch * S, W - 20);
  const r = (d / 2) * S;
  const minY = edgeY + k * d * S;
  const edOk = ed >= k * d - 1e-9;
  const pitchOk = pitch >= 4 * d - 1e-9 && pitch <= 6 * d + 1e-9;
  return (
    <svg viewBox={"0 0 " + W + " " + H} className="h-auto w-full" role="img" aria-label="Vue de la cornière avec le trou, la distance au bord et le pas">
      <rect x="0" y="0" width={W} height={H} rx="10" fill="#0f1729" />
      <rect x="10" y={edgeY} width={W - 20} height={H - edgeY - 26} fill="#22304d" />
      <rect x="10" y={edgeY} width={W - 20} height={Math.max(0, minY - edgeY)} fill="#ff5d6c" opacity="0.14" />
      <line x1="10" y1={minY} x2={W - 10} y2={minY} stroke="#ff5d6c" strokeDasharray="5 4" strokeWidth="1.2" />
      <rect x="14" y={H - 17} width="10" height="10" fill="#ff5d6c" opacity="0.5" />
      <text x="30" y={H - 8} fill="#ff5d6c" fontFamily="JetBrains Mono" fontSize="10">Zone interdite : ED &lt; {k === 2 ? "2D" : "2,5D"} = {mm(k * d, 1)} mm (tirets)</text>
      <line x1="10" y1={edgeY} x2={W - 10} y2={edgeY} stroke="#e6edf7" strokeWidth="2" />
      <text x="14" y={edgeY - 8} fill="#8fa0bd" fontFamily="JetBrains Mono" fontSize="10">BORD DE LA CORNIÈRE</text>
      <circle cx={x1} cy={y} r={r} fill="#0b1220" stroke={edOk ? "#3ddc97" : "#ff5d6c"} strokeWidth="2" />
      <circle cx={x2} cy={y} r={r} fill="#0b1220" stroke={edOk ? "#3ddc97" : "#ff5d6c"} strokeWidth="2" />
      <line x1={x1 - r - 18} y1={edgeY} x2={x1 - r - 18} y2={y} stroke="#ffb020" strokeWidth="1.5" />
      <line x1={x1 - r - 24} y1={y} x2={x1 - r - 12} y2={y} stroke="#ffb020" strokeWidth="1.5" />
      <text x={x1 - r - 24} y={(edgeY + y) / 2 + 4} textAnchor="end" fill="#ffb020" fontFamily="JetBrains Mono" fontSize="11">ED {mm(ed, 1)}</text>
      <line x1={x1} y1={y + r + 16} x2={x2} y2={y + r + 16} stroke={pitchOk ? "#3b9eff" : "#ff5d6c"} strokeWidth="1.5" />
      <line x1={x1} y1={y + r + 10} x2={x1} y2={y + r + 22} stroke={pitchOk ? "#3b9eff" : "#ff5d6c"} strokeWidth="1.5" />
      <line x1={x2} y1={y + r + 10} x2={x2} y2={y + r + 22} stroke={pitchOk ? "#3b9eff" : "#ff5d6c"} strokeWidth="1.5" />
      <text x={(x1 + x2) / 2} y={y + r + 32} textAnchor="middle" fill={pitchOk ? "#3b9eff" : "#ff5d6c"} fontFamily="JetBrains Mono" fontSize="11">pas {mm(pitch, 1)} mm</text>
      <line x1={x1} y1={y} x2={x1} y2={y} stroke="#e6edf7" />
      <text x={x1} y={y + 4} textAnchor="middle" fill="#e6edf7" fontFamily="JetBrains Mono" fontSize="9">Ø{mm(d, 1)}</text>
    </svg>
  );
}

const QN_TREE = [
  {
    id: "react",
    title: "Le compagnon attend ta réponse au téléphone. Que fais-tu ?",
    options: [
      { t: "Dire au compagnon de mettre une rondelle large en cachette pour reprendre la charge.", ok: false, why: "Faute lourde : c'est un écart non déclaré à la définition approuvée, dissimulé dans une zone qui sera fermée. C'est exactement ce que Part-21G interdit." },
      { t: "Lui dire de reboucher le trou au mastic et de repercer 3,5 mm plus loin du bord.", ok: false, why: "Tu modifies la définition de ton propre chef. Un nouveau trou à côté d'un trou raté crée un pas non conforme et un ligament affaibli : seul le BE peut le décider." },
      { t: "Ouvrir une QN SAP, faire marquer et bloquer l'opération et la fermeture de zone, puis soumettre au BE Calcul pour dérogation ou réparation.", ok: true, why: "Stop, sécurisation, QN, et décision par l'organisme de conception : c'est le workflow réglementaire." },
      { t: "Laisser poser la fixation : 7,5 mm, c'est presque 2D.", ok: false, why: "« Presque » n'existe pas en aéronautique. 7,5 mm pour 10 mm requis, c'est 25 % de matière en moins au bord." },
    ],
  },
  {
    id: "desc",
    title: "Tu rédiges la description de la QN. Laquelle choisis-tu ?",
    options: [
      { t: "Trou mal placé sur la cornière, à voir.", ok: false, why: "Pas de valeur, pas de référence, pas de localisation : le BE ne peut rien calculer." },
      { t: "Alésage Ø 5 mm, cornière de poutre de queue réf. plan, position F7 : centre du trou mesuré à 7,5 mm du bord pour 11 mm demandé au plan (ED mini 2D = 10 mm). Fixation non posée.", ok: true, why: "Factuelle et cotée : valeur mesurée, valeur demandée, règle, pièce, position, état actuel." },
      { t: "Erreur du compagnon au perçage, distance au bord insuffisante.", ok: false, why: "Une QN décrit un écart produit, pas un coupable. Et il manque toutes les valeurs." },
    ],
  },
  {
    id: "path",
    title: "La réparation standard pré-approuvée autorise le passage en fixation oversize Ø 5,5 mm. Est-elle applicable ici ?",
    options: [
      { t: "Oui : Cas A, on passe en oversize et on trace dans la QN.", ok: false, why: "Avec Ø 5,5 mm, l'ED mini devient 2 × 5,5 = 11 mm. Le trou ne s'éloigne pas du bord, il s'élargit : l'écart s'aggrave." },
      { t: "Non : avec Ø 5,5 mm, ED mini = 11 mm > 7,5 mm. Les conditions du standard ne sont pas remplies, c'est un Cas B : dérogation BE.", ok: true, why: "Le standard exige ED ≥ 2D avec le nouveau diamètre. Ce n'est pas le cas, la QN part au BE (DOA Part-21J) / Stress Office." },
      { t: "Oui, à condition de poser une rondelle large sous la tête.", ok: false, why: "La rondelle ne change rien à la matière disponible entre le trou et le bord, et elle n'est pas prévue par le standard." },
    ],
  },
  {
    id: "after",
    title: "Le Stress Office répond : décision REPAIR, pose d'un doubleur aluminium avec 3 fixations supplémentaires. Ta prochaine action ?",
    options: [
      { t: "Transmettre le mail du BE au compagnon pour qu'il réalise le doubleur.", ok: false, why: "Un mail n'est pas une instruction de travail. Sans opération rédigée, rien n'est tracé ni contrôlable." },
      { t: "Clôturer la QN : la décision est prise.", ok: false, why: "La QN n'est soldée que quand la réparation est réalisée, contrôlée et tracée." },
      { t: "Rédiger l'opération de réparation dans la gamme QN (outillage, consommables, couples, traçabilité, point d'arrêt qualité), puis solder la QN après exécution et contrôle.", ok: true, why: "Pour un REPAIR, le préparateur transforme l'instruction BE en opération de gamme exécutable et traçable." },
    ],
  },
];

function TabEdge({ done, onComplete }) {
  const [d, setD] = useState(5);
  const [ed, setEd] = useState(7.5);
  const [pitch, setPitch] = useState(25);
  const [mat, setMat] = useState("alu");
  const k = mat === "alu" ? 2 : 2.5;
  const edMin = k * d;
  const edOk = ed >= edMin - 1e-9;
  const pitchOk = pitch >= 4 * d - 1e-9 && pitch <= 6 * d + 1e-9;

  const [calc, setCalc] = useState("");
  const [calcOk, setCalcOk] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [answers, setAnswers] = useState({});
  const [tries, setTries] = useState({});

  const calcStepOk = calcOk === true && verdict === "nc";
  const solvedCount = QN_TREE.filter((s) => answers[s.id]).length;
  const allSolved = calcStepOk && solvedCount === QN_TREE.length;
  useEffect(() => { if (allSolved) onComplete(); }, [allSolved]);

  const loadCase = () => { setD(5); setEd(7.5); setPitch(25); setMat("alu"); };
  const checkCalc = () => {
    const v = parseFloat(String(calc).replace(",", "."));
    setCalcOk(Math.abs(v - 10) < 0.01);
  };
  const choose = (s, k2) => {
    setTries({ ...tries, [s.id]: k2 });
    if (s.options[k2].ok) setAnswers({ ...answers, [s.id]: true });
  };
  const reset = () => { setCalc(""); setCalcOk(null); setVerdict(null); setAnswers({}); setTries({}); loadCase(); };
  const visibleSteps = [];
  if (calcStepOk) {
    for (const s of QN_TREE) {
      visibleSteps.push(s);
      if (!answers[s.id]) break;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Ruler} kicker="Onglet 6 · Simulateur 2" title="Vérificateur géométrique (Edge Distance & Pitch) et arbre de décision QN">
        Le téléphone sonne. Poste d'assemblage de la poutre de queue : « Le foret a dévié sur la cornière alu. Le trou Ø 5 mm est à 7,5 mm du bord au lieu de 11. Je pose quand même ? »
      </SectionHead>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Panel className="p-4">
          <EdgeSVG d={d} ed={ed} pitch={pitch} k={k} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className={cx("rounded-lg border px-3 py-2", edOk ? "border-ok/50 bg-ok/10" : "border-ko/50 bg-ko/10")}>
              <div className="font-mono text-[10px] uppercase text-muted">Distance au bord</div>
              <div className={cx("font-mono text-[15px] font-semibold", edOk ? "text-ok" : "text-ko")}>{mm(ed, 1)} {edOk ? "≥" : "<"} {mm(edMin, 1)} mm</div>
              <div className={cx("font-mono text-[11px]", edOk ? "text-ok" : "text-ko")}>{edOk ? "Conforme" : "Non conforme"}</div>
            </div>
            <div className={cx("rounded-lg border px-3 py-2", pitchOk ? "border-ok/50 bg-ok/10" : "border-ko/50 bg-ko/10")}>
              <div className="font-mono text-[10px] uppercase text-muted">Pas (4D à 6D)</div>
              <div className={cx("font-mono text-[15px] font-semibold", pitchOk ? "text-ok" : "text-ko")}>{mm(4 * d, 1)} ≤ {mm(pitch, 1)} ≤ {mm(6 * d, 1)}</div>
              <div className={cx("font-mono text-[11px]", pitchOk ? "text-ok" : "text-ko")}>{pitchOk ? "Conforme" : pitch < 4 * d ? "Trop serré : effet timbre-poste" : "Trop lâche : plaquage non garanti"}</div>
            </div>
          </div>
        </Panel>
        <Panel className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2"><Calculator size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Mini-calculateur</h3></div>
          <div className="flex flex-wrap gap-2">
            <Chip active={mat === "alu"} onClick={() => setMat("alu")}>Métallique · 2D</Chip>
            <Chip active={mat === "cfrp"} onClick={() => setMat("cfrp")}>Composite carbone · 2,5D</Chip>
          </div>
          <Slider label="Diamètre de fixation D" value={d} min={3.2} max={8} step={0.1} onChange={setD} unit="mm" display={mm(d, 1)} />
          <Slider label="Distance au bord mesurée ED" value={ed} min={4} max={20} step={0.5} onChange={setEd} unit="mm" display={mm(ed, 1)} />
          <Slider label="Pas entre fixations" value={pitch} min={10} max={50} step={0.5} onChange={setPitch} unit="mm" display={mm(pitch, 1)} />
          <div><button type="button" onClick={loadCase} className="inline-flex items-center gap-1 rounded-md border border-amber/60 bg-amber/10 px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-amber/20"><Target size={14} /> Recharger le cas du compagnon</button></div>
          <NoteBox>Joue avec les curseurs : passe en composite pour voir la zone interdite s'agrandir, ou augmente le diamètre pour comprendre pourquoi un oversize rapproche le trou de la limite.</NoteBox>
        </Panel>
      </div>

      <Panel className="p-5">
        <Eyebrow tone="amber">Étape 1 · Vérification de la règle ED ≥ 2D</Eyebrow>
        <p className="mt-2 text-[14px] text-ink">Fixation Ø 5 mm dans une cornière en aluminium. Quelle est la distance au bord minimale requise, en mm ?</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input type="text" inputMode="decimal" value={calc} onChange={(e) => { setCalc(e.target.value); setCalcOk(null); }} disabled={calcOk === true}
            className="w-28 rounded-lg border border-line bg-bg px-3 py-2 font-mono text-ink focus:border-sky focus:outline-none" placeholder="mm" aria-label="Distance au bord minimale en mm" />
          <PrimaryButton onClick={checkCalc} disabled={!calc || calcOk === true}>Vérifier</PrimaryButton>
        </div>
        {calcOk !== null && <div className="mt-2"><Feedback ok={calcOk}>{calcOk ? "2 × 5 = 10 mm." : "Applique ED ≥ 2 × D en métallique."}</Feedback></div>}
        {calcOk && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-[14px] text-ink">Le centre du trou est mesuré à 7,5 mm du bord. Ton verdict ?</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={verdict === "c"} tone={verdict === "c" ? "red" : "blue"} disabled={verdict === "nc"} onClick={() => verdict !== "nc" && setVerdict("c")}>Conforme</Chip>
              <Chip active={verdict === "nc"} tone={verdict === "nc" ? "green" : "blue"} disabled={verdict === "nc"} onClick={() => setVerdict("nc")}>Non conforme</Chip>
            </div>
            {verdict && <Feedback ok={verdict === "nc"}>{verdict === "nc" ? "10 mm requis > 7,5 mm mesuré : non conforme. Il manque 2,5 mm de matière au bord, le risque est le cisaillement ou l'arrachement du bord sous charge." : "7,5 mm est inférieur aux 10 mm requis."}</Feedback>}
          </div>
        )}
      </Panel>

      {visibleSteps.map((s, i) => {
        const t = tries[s.id];
        const solved = answers[s.id];
        return (
          <Panel key={s.id} className="p-5">
            <Eyebrow tone="amber">Étape {i + 2} · Arbre de décision QN</Eyebrow>
            <p className="mb-3 mt-2 font-display text-lg font-semibold text-ink">{s.title}</p>
            <ChoiceStep options={s.options} answer={s.options.findIndex((o) => o.ok)} picked={t} onPick={(k2) => choose(s, k2)} locked={!!solved} />
            {t !== undefined && <div className="mt-3"><Feedback ok={s.options[t].ok}>{s.options[t].why}</Feedback></div>}
          </Panel>
        );
      })}

      {allSolved && (
        <ImpactBox title="QN traitée dans les règles">
          Mesure, verdict, sécurisation, description cotée, vérification des conditions du standard, dérogation BE puis opération de réparation tracée : le préparateur n'a jamais décidé seul d'un écart à la définition.
        </ImpactBox>
      )}
      <div><button type="button" onClick={reset} className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink"><RotateCcw size={12} /> Rejouer le scénario</button></div>
      <ValidatedBanner done={done} label="Écart d'Edge Distance traité de la mesure à la réparation." />
    </div>
  );
}

/* ============================================================
   SPRINT · 12 QUESTIONS
   ============================================================ */
const QUESTIONS = [
  {
    tag: "E-BOM / M-BOM",
    q: "Le kit du poste 30 arrive sans mastic ni fil à freiner, alors que toutes les pièces de la 3D sont là. Quelle nomenclature est incomplète ?",
    options: ["L'E-BOM du Bureau d'Études", "La M-BOM construite par les Méthodes", "La liste de colisage du fournisseur", "Le certificat de type"],
    answer: 1,
    why: "Les consommables ne figurent pas toujours dans la 3D. C'est au préparateur de les ajouter dans la M-BOM, rattachés au bon poste, pour que le kitting soit complet.",
    risk: "Compagnon bloqué au poste, ou pire : utilisation d'un mastic « trouvé » sur un autre poste, sans traçabilité de lot ni de péremption.",
  },
  {
    tag: "Part-21G / Part-21J",
    q: "Quelle organisation peut approuver une dérogation (concession) à la définition de type ?",
    options: ["L'organisme de production Part-21G (POA)", "L'organisme de conception Part-21J (DOA), via le BE / Stress Office", "Le chef d'équipe de la FAL", "Le préparateur méthodes s'il a plus de 5 ans d'expérience"],
    answer: 1,
    why: "Part-21G produit conformément à la définition approuvée. Seul le titulaire de l'approbation de conception (Part-21J) peut juger qu'un écart reste acceptable.",
    risk: "Un écart accepté par la production seule rend l'appareil non conforme à son certificat de type : il ne peut pas recevoir de certificat de navigabilité.",
  },
  {
    tag: "Configuration · RG.Aéro 000 23", scenario: true,
    q: "Le plan indique : indice D effectif S/N 2105 à 2150, indice E à partir de 2151. Tu prépares la gamme de l'appareil S/N 2150. Quel indice ?",
    options: ["Indice D", "Indice E", "Le plus récent par défaut", "Celui du dernier appareil sorti de la chaîne"],
    answer: 0,
    why: "Les bornes de tranche sont incluses : 2150 est le dernier appareil de l'indice D. L'indice ne se choisit pas « au plus récent », il se lit dans l'effectivité.",
    risk: "Montage d'une définition non applicable à ce MSN : non-conformité de configuration découverte à la livraison, avec démontage.",
  },
  {
    tag: "MOD / SB",
    q: "Une modification est introduite à partir du S/N 2151. Un client veut l'appliquer sur son H145 S/N 2090, déjà livré. Par quel document ?",
    options: ["Un MOD de production", "Un Service Bulletin (SB)", "Une QN", "Une nouvelle gamme de FAL"],
    answer: 1,
    why: "Le MOD agit en chaîne sur une tranche de production. Pour un appareil en service, la modification passe par un Service Bulletin appliqué en exploitation ou maintenance.",
    risk: "Confusion entre documents de production et d'exploitation : modification appliquée sans le cadre approuvé pour la flotte en service.",
  },
  {
    tag: "Shelf Life", scenario: true,
    q: "Au poste, le compagnon constate que la cartouche de PR 1776 B2 est périmée depuis 3 jours. Il n'y en a pas d'autre. Que prescrit la gamme ?",
    options: ["L'utiliser, 3 jours ne changent rien", "Refuser la cartouche, l'isoler et en demander une conforme ; l'opération attend", "L'utiliser en doublant la quantité", "La réchauffer pour la rendre plus fluide"],
    answer: 1,
    why: "La date de péremption est un critère d'acceptation. Au-delà, la polymérisation et l'adhérence ne sont plus garanties par le fabricant. La gamme impose le contrôle avant mélange.",
    risk: "Joint qui ne polymérise pas ou décolle : infiltration, corrosion à l'interface et étanchéité perdue, découvertes en service.",
  },
  {
    tag: "Rework / Repair / Use As Is / Scrap",
    q: "Le BE accepte un alésage légèrement hors tolérance sans aucune intervention physique, après calcul de marge. Quelle décision ?",
    options: ["REWORK", "REPAIR", "USE AS IS", "SCRAP"],
    answer: 2,
    why: "USE AS IS : la pièce reste en l'état, l'acceptation repose sur la démonstration par le calcul du BE. Elle est tracée dans la QN.",
    risk: "Mauvaise décision tracée : un REPAIR noté sans travaux, ou un USE AS IS sans justification calculée, invalide le dossier de l'appareil.",
  },
  {
    tag: "Repair",
    q: "Après une décision REPAIR du BE (pose d'un doubleur), qui rédige l'opération de réparation dans la gamme QN ?",
    options: ["Le compagnon, à sa façon", "Le préparateur méthodes, à partir de l'instruction BE", "L'inspecteur Qualité", "Le client"],
    answer: 1,
    why: "Le BE décide et définit la réparation. Le préparateur la transforme en opération exécutable : outillage, consommables, couples, traçabilité, point d'arrêt.",
    risk: "Réparation réalisée sans instruction écrite : impossible à contrôler et à prouver, la QN ne peut pas être soldée.",
  },
  {
    tag: "Hold Point",
    q: "Pourquoi un point d'arrêt qualité est-il placé juste avant la fermeture d'un caisson ?",
    options: ["Pour laisser le temps au mastic de sécher", "Parce qu'après fermeture, la zone devient inaccessible au contrôle", "Pour compter les heures du compagnon", "Par habitude, il n'est pas obligatoire"],
    answer: 1,
    why: "Le Hold Point bloque la gamme dans le MES jusqu'à la validation de l'inspecteur. C'est la dernière occasion de vérifier fixations, propreté et FOD avant la perte d'accès.",
    risk: "Défaut ou FOD enfermé dans un caisson : impossible à détecter ensuite sans dépose lourde, voire découvert en vol.",
  },
  {
    tag: "Edge Distance · Métal", scenario: true,
    q: "Fixation Ø 4,8 mm dans une tôle aluminium. Le centre du trou est à 9 mm du bord. Verdict ?",
    options: ["Conforme : 9 mm ≥ 9,6 mm", "Non conforme : 2D = 9,6 mm > 9 mm", "Conforme : seule la règle du pas compte", "Conforme si on pose une rondelle"],
    answer: 1,
    why: "2 × 4,8 = 9,6 mm. 9 mm est en dessous : non conforme, QN obligatoire. Une rondelle n'ajoute aucune matière entre le trou et le bord.",
    risk: "Arrachement du bord sous charge, fissuration en fatigue à partir du trou.",
  },
  {
    tag: "Edge Distance · Composite", scenario: true,
    q: "Fixation Ø 6 mm dans un panneau carbone, règle 2,5D. Quelle distance au bord minimale ?",
    options: ["12 mm", "13 mm", "15 mm", "24 mm"],
    answer: 2,
    why: "2,5 × 6 = 15 mm. Le composite supporte mal le matage et le délaminage en bord de trou, d'où une marge supérieure au métal.",
    risk: "Délaminage et arrachement du bord du stratifié, endommagement souvent invisible en surface.",
  },
  {
    tag: "Double contrôle ATA 67",
    q: "Le compagnon qui a accouplé une bielle de commande de vol rotor propose de faire lui-même le double contrôle pour gagner du temps. Ta réponse ?",
    options: ["Accepté s'il signe deux fois", "Refusé : le double contrôle est fait par un second contrôleur habilité, indépendant du montage", "Accepté si le chef d'équipe est présent", "Accepté, l'ATA 67 n'en exige pas"],
    answer: 1,
    why: "Le Duplicate Inspection est indépendant par définition : un autre regard, une autre signature. Celui qui a monté reproduirait sa propre erreur.",
    risk: "Commande de vol mal goupillée ou inversée non détectée : perte de contrôle de l'appareil.",
  },
  {
    tag: "Oversize · Cas A ou B", scenario: true,
    q: "Une QN montre qu'un trou dévié peut passer en oversize Ø 5,5 mm selon un standard pré-approuvé. Le trou est à 10,5 mm du bord, en aluminium. Applicable ?",
    options: ["Oui : 2 × 5,5 = 11 mm, et 10,5 mm suffit", "Non : avec Ø 5,5 mm, ED mini = 11 mm > 10,5 mm, Cas B vers le BE", "Oui, l'oversize est toujours autorisé", "Oui, avec une rondelle large"],
    answer: 1,
    why: "Le standard n'est applicable que si l'ED reste ≥ 2D avec le nouveau diamètre. 10,5 < 11 : on sort du standard, la QN part au BE pour dérogation.",
    risk: "Réparation standard appliquée hors de ses conditions : l'écart n'est couvert par aucune approbation de conception.",
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
        <SectionHead icon={Trophy} kicker="Onglet 7 · Évaluation" title="Sprint Préparateur Méthodes · Module 3">
          {QUESTIONS.length} questions tirées au hasard, questions et mises en situation sur le bureau des méthodes et la FAL Airbus Helicopters (H145, H160, H175). Après chaque réponse, une explication technique te montre pourquoi c'est juste, et ce que l'erreur aurait provoqué sur chaîne ou en audit.
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
  { id: "be", short: "BE → Méthodes", n: "1", icon: Layers, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "gamme", short: "Gamme SAP/MES", n: "2", icon: ListOrdered, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "qn", short: "QN & dérogations", n: "3", icon: FileWarning, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "lean", short: "Lean & ergonomie", n: "4", icon: Puzzle, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "auditeur", short: "Auditeur de gamme", n: "5", icon: ClipboardCheck, rule: "Corriger les 5 écarts pour passer la gamme en VALIDÉ PRODUCTION" },
  { id: "edge", short: "Edge Distance & QN", n: "6", icon: Ruler, rule: "Traiter l'écart de la mesure jusqu'à la réparation" },
  { id: "sprint", short: "Sprint", n: "7", icon: Trophy, rule: "Finir le sprint avec 85 % ou plus" },
];
export default function App({ onSaveScore, onBack, student } = {}) {
  const [tab, setTab] = useState("be");
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
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Bureau des Méthodes · Airbus Helicopters · Module 3</div>
              <h1 className="font-display text-xl font-semibold leading-none text-ink sm:text-2xl">Dossier de définition, gammes SAP/MES & non-conformités</h1>
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

        {tab === "be" && <TabBE done={progress.be} onComplete={complete("be")} />}
        {tab === "gamme" && <TabGamme done={progress.gamme} onComplete={complete("gamme")} />}
        {tab === "qn" && <TabQN done={progress.qn} onComplete={complete("qn")} />}
        {tab === "lean" && <TabLean done={progress.lean} onComplete={complete("lean")} />}
        {tab === "auditeur" && <TabAuditeur done={progress.auditeur} onComplete={complete("auditeur")} />}
        {tab === "edge" && <TabEdge done={progress.edge} onComplete={complete("edge")} />}
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
