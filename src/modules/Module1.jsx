import React, { useState, useEffect, useMemo } from "react";
import BackToPortal from "../lms/BackToPortal.jsx";
import { scopedKey } from "../lms/session.js";
import {
  Plane, Wind, Gauge, Compass, Layers, Map as MapIcon, Wrench, ShieldCheck, ShieldAlert,
  CheckCircle2, XCircle, Flame, Trophy, RotateCcw, ChevronRight, ChevronDown, Crosshair,
  Target, BookOpen, Zap, Lock, Cable, Fuel, Droplets, Cog, AlertTriangle, Info,
  ClipboardList, FileText, Ruler, Award, ArrowRight, Eye, Fan, Box,
} from "lucide-react";

/* ============================================================
   UTILITAIRES
   ============================================================ */
const STORAGE_KEY = "prep-methodes-ah-m1-v2";
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
      <span><strong className="font-semibold">Module validé.</strong> {label}</span>
    </div>
  );
}

/* QCM court réutilisable pour valider un onglet */
function QuickCheck({ title, questions, onComplete }) {
  const [picked, setPicked] = useState({});
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
                {q.options.map((o, k) => (
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

function RotorSim() {
  const [collectif, setCollectif] = useState(8);
  const [cyclique, setCyclique] = useState(0);
  const [anticouple, setAnticouple] = useState(8);
  const tilt = cyclique * 1.6;
  const thrust = 30 + collectif * 5;
  const vertical = collectif > 10 ? "Montée" : collectif < 6 ? "Descente" : "Stationnaire";
  const horizontal = cyclique > 1 ? "Translation vers l'avant" : cyclique < -1 ? "Translation vers l'arrière" : "Pas de translation";
  const torqueDelta = collectif - anticouple;
  const yaw =
    Math.abs(torqueDelta) <= 1
      ? { txt: "Cap stable : le couple du rotor principal est compensé.", tone: "text-ok" }
      : torqueDelta > 1
      ? { txt: "Le fuselage part en lacet dans le sens inverse du rotor : anticouple insuffisant.", tone: "text-ko" }
      : { txt: "Le fuselage tourne dans le sens du rotor : excès d'anticouple.", tone: "text-amber" };
  const rad = (tilt * Math.PI) / 180;
  const mx = 200, my = 92;
  const half = 150;
  const x1 = mx - half * Math.cos(rad), y1 = my - half * Math.sin(rad);
  const x2 = mx + half * Math.cos(rad), y2 = my + half * Math.sin(rad);
  const tx = mx + thrust * Math.sin(rad), ty = my - thrust * Math.cos(rad);

  const Slider = ({ id, label, value, min, max, onChange, left, right, unit }) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink">{label}</label>
        <span className="font-mono text-xs text-sky">{value > 0 && min < 0 ? "+" : ""}{value}{unit}</span>
      </div>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-sky" />
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted"><span>{left}</span><span>{right}</span></div>
    </div>
  );

  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Fan size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Mini-simulateur : plateau cyclique</h3>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="min-w-0 rounded-lg border border-line bg-bg p-2">
          <svg viewBox="0 0 400 230" className="h-auto w-full" role="img" aria-label="Hélicoptère vu de profil avec inclinaison du disque rotor">
            <defs>
              <marker id="ah-thrust" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#3ddc97" />
              </marker>
            </defs>
            <line x1="0" y1="212" x2="400" y2="212" stroke="#1f2b45" strokeWidth="2" />
            <path d="M120,150 C120,118 160,108 205,108 L250,110 C270,112 280,128 280,150 C280,170 260,178 220,178 L150,178 C130,178 120,168 120,150 Z" fill="#1d2a45" stroke="#5b7299" strokeWidth="1.5" />
            <path d="M138,140 C140,124 160,116 185,116 L185,148 L140,148 Z" fill="#17304f" stroke="#5b7299" />
            <path d="M275,135 L370,128 L372,138 L278,155 Z" fill="#1d2a45" stroke="#5b7299" strokeWidth="1.2" />
            <path d="M360,128 L378,100 L386,100 L376,134 Z" fill="#24365a" stroke="#5b7299" />
            <circle cx="378" cy="122" r={6 + anticouple * 0.6} fill="none" stroke="#ffb020" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="150" y1="188" x2="250" y2="188" stroke="#5b7299" strokeWidth="3" />
            <line x1="165" y1="178" x2="160" y2="188" stroke="#5b7299" strokeWidth="2" />
            <line x1="235" y1="178" x2="240" y2="188" stroke="#5b7299" strokeWidth="2" />
            <rect x="196" y="92" width="8" height="18" fill="#8fa0bd" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b9eff" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx={mx} cy={my} rx="6" ry="6" fill="#e6edf7" />
            <line x1={mx} y1={my} x2={tx} y2={ty} stroke="#3ddc97" strokeWidth="3.5" markerEnd="url(#ah-thrust)" />
            <text x="12" y="22" fill="#8fa0bd" fontSize="11" fontFamily="JetBrains Mono, monospace">← AVANT</text>
            <text x="12" y="40" fill="#3ddc97" fontSize="11" fontFamily="JetBrains Mono, monospace">Poussée rotor</text>
            <text x="300" y="80" fill="#ffb020" fontSize="11" fontFamily="JetBrains Mono, monospace">Rotor arrière</text>
          </svg>
        </div>
        <div className="flex flex-col gap-4">
          {Slider({id: "collectif", label: "Pas général (collectif)", value: collectif, min: 0, max: 16, unit: "°", onChange: setCollectif, left: "Descendre", right: "Monter",})}
          {Slider({id: "cyclique", label: "Pas cyclique (inclinaison du disque)", value: cyclique, min: -6, max: 6, unit: "", onChange: setCyclique, left: "Arrière", right: "Avant",})}
          {Slider({id: "anticouple", label: "Rotor anticouple / Fenestron (palonnier)", value: anticouple, min: 0, max: 16, unit: "", onChange: setAnticouple, left: "Faible", right: "Fort",})}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-bg p-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Vertical</div>
              <div className="font-display text-lg font-semibold text-ink">{vertical}</div>
            </div>
            <div className="rounded-lg border border-line bg-bg p-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Horizontal</div>
              <div className="font-display text-lg font-semibold text-ink">{horizontal}</div>
            </div>
          </div>
          <div className={cx("rounded-lg border border-line bg-bg p-3 text-[13px] font-medium", yaw.tone)}>{yaw.txt}</div>
        </div>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted">
        Augmente le collectif sans toucher au palonnier : plus de pas = plus de couple moteur absorbé, donc plus de couple de réaction sur le fuselage.
        C'est pour cela que l'anticouple doit suivre chaque variation de puissance.
      </p>
    </Panel>
  );
}

const FREINAGES = [
  { name: "Fil à freiner", desc: "Torsadé entre deux éléments et tendu dans le sens du serrage : si la vis tend à se desserrer, le fil la retient." },
  { name: "Écrou auto-freiné", desc: "Insert polymère ou filet déformé qui crée un couple de freinage. Couple de freinage à vérifier, réutilisation limitée." },
  { name: "Goupille fendue", desc: "Traverse l'écrou crénelé et la tige. Toujours neuve, branches rabattues selon la pratique standard." },
  { name: "Frein filet", desc: "Produit anaérobie appliqué sur filetage propre et dégraissé, de la référence exacte demandée par la gamme." },
  { name: "Rondelle frein", desc: "Rondelle à languette ou à ergot rabattue sur un plat de l'écrou ou de la pièce." },
];


/* ============================================================
   SILHOUETTE HÉLICOPTÈRE PARTAGÉE (type H145 / H160, cotes en mm)
   X0 en avant du nez · X vers le Fenestron · Z de la barque vers la tête rotor
   ============================================================ */
const HX = 14000, HY = 2000, HZ = 4000;
const C = { base: "#1d2a45", body: "#24365a", stroke: "#5b7299", hl: "#2b5c99", hlStroke: "#3b9eff" };

function HeliSide({ sx, sz, hl = [], overlay = [] }) {
  const f = (k, d = C.base) => (hl.includes(k) ? C.hl : d);
  const s = (k) => (hl.includes(k) ? C.hlStroke : C.stroke);
  return (
    <g>
      {/* pales rotor principal */}
      <line x1={sx(-2000)} y1={sz(3350)} x2={sx(9000)} y2={sz(3350)} stroke={hl.includes("rotor") ? C.hlStroke : "#3b9eff"} strokeOpacity={hl.includes("rotor") ? 1 : 0.6} strokeWidth="3" />
      {/* mât et tête */}
      <rect x={sx(3350)} y={sz(3300)} width={sx(3650) - sx(3350)} height={sz(3000) - sz(3300)} fill={f("rotor")} stroke={s("rotor")} />
      <ellipse cx={sx(3500)} cy={sz(3330)} rx={sx(4100) - sx(3500)} ry="5" fill={f("rotor", "#2f4570")} stroke={s("rotor")} />
      {/* BTP sur plancher mécanique */}
      <rect x={sx(2800)} y={sz(3000)} width={sx(4600) - sx(2800)} height={sz(2300) - sz(3000)} rx="4" fill={f("pm")} stroke={s("pm")} />
      {/* turbomoteurs */}
      <rect x={sx(4600)} y={sz(2900)} width={sx(6600) - sx(4600)} height={sz(2300) - sz(2900)} rx="6" fill={f("eng")} stroke={s("eng")} />
      {/* dérive + Fenestron */}
      <polygon points={`${sx(11800)},${sz(1500)} ${sx(13200)},${sz(1600)} ${sx(13300)},${sz(3800)} ${sx(12700)},${sz(3800)} ${sx(11800)},${sz(2450)}`} fill={f("fen")} stroke={s("fen")} />
      <circle cx={sx(12450)} cy={sz(2200)} r={(sx(12950) - sx(12450))} fill="#0b1220" stroke={hl.includes("fen") ? C.hlStroke : "#ffb020"} strokeWidth="1.5" />
      {/* poutre de queue */}
      <polygon points={`${sx(6200)},${sz(1500)} ${sx(11800)},${sz(1900)} ${sx(11800)},${sz(2350)} ${sx(6200)},${sz(2450)}`} fill={f("boom", C.body)} stroke={s("boom")} />
      <rect x={sx(10200)} y={sz(2100)} width={sx(10800) - sx(10200)} height={sz(1950) - sz(2100)} fill={f("boom")} stroke={s("boom")} />
      {/* cabine + barque */}
      <path d={`M${sx(500)},${sz(1400)} C${sx(500)},${sz(2100)} ${sx(1400)},${sz(2300)} ${sx(2600)},${sz(2300)} L${sx(6200)},${sz(2300)} L${sx(6200)},${sz(1000)} L${sx(900)},${sz(1000)} C${sx(650)},${sz(1050)} ${sx(500)},${sz(1200)} ${sx(500)},${sz(1400)} Z`} fill={f("cabine", C.body)} stroke={s("cabine")} />
      <path d={`M${sx(900)},${sz(1000)} L${sx(6200)},${sz(1000)} L${sx(6200)},${sz(600)} L${sx(1600)},${sz(600)} C${sx(1200)},${sz(650)} ${sx(950)},${sz(800)} ${sx(900)},${sz(1000)} Z`} fill={f("barque")} stroke={s("barque")} />
      {/* verrière */}
      <path d={`M${sx(650)},${sz(1450)} C${sx(700)},${sz(2000)} ${sx(1400)},${sz(2200)} ${sx(2400)},${sz(2200)} L${sx(2400)},${sz(1450)} Z`} fill="#17304f" stroke={C.stroke} strokeOpacity="0.7" />
      {/* plancher mécanique */}
      <line x1={sx(2600)} y1={sz(2300)} x2={sx(6600)} y2={sz(2300)} stroke={hl.includes("pm") ? C.hlStroke : "#8fa0bd"} strokeWidth={hl.includes("pm") ? 4 : 2} />
      {/* patins */}
      <line x1={sx(1200)} y1={sz(150)} x2={sx(5800)} y2={sz(150)} stroke={hl.includes("skid") ? C.hlStroke : C.stroke} strokeWidth="3" />
      <line x1={sx(2200)} y1={sz(150)} x2={sx(2400)} y2={sz(600)} stroke={C.stroke} strokeWidth="2" />
      <line x1={sx(4800)} y1={sz(150)} x2={sx(4600)} y2={sz(600)} stroke={C.stroke} strokeWidth="2" />
      {/* surcouches structurales */}
      {overlay.includes("couples") && [1500, 2600, 3500, 5200, 6200, 7400, 8600, 9800, 11000].map((x) => (
        <line key={"c" + x} x1={sx(x)} y1={sz(x < 6200 ? 650 : 1550 + (x - 6200) * 0.07)} x2={sx(x)} y2={sz(x < 6200 ? 2300 : 2440 - (x - 6200) * 0.016)} stroke="#3ddc97" strokeWidth="1.5" strokeDasharray="4 3" />
      ))}
      {overlay.includes("lisses") && [1300, 1700, 2100].map((z) => (
        <line key={"l" + z} x1={sx(z === 2100 ? 2400 : 1000)} y1={sz(z)} x2={sx(6200)} y2={sz(z)} stroke="#ffb020" strokeWidth="1.2" strokeDasharray="6 3" />
      ))}
      {overlay.includes("lisses") && [1750, 2150].map((z) => (
        <line key={"lb" + z} x1={sx(6200)} y1={sz(z)} x2={sx(11800)} y2={sz(z + (z === 1750 ? 250 : 120))} stroke="#ffb020" strokeWidth="1.2" strokeDasharray="6 3" />
      ))}
      {overlay.includes("anneaux") && [2900, 4500].map((x) => (
        <g key={"a" + x}>
          <line x1={sx(x)} y1={sz(650)} x2={sx(x)} y2={sz(2300)} stroke="#ff5d6c" strokeWidth="4" />
          <line x1={sx(x)} y1={sz(2300)} x2={sx(3500)} y2={sz(2950)} stroke="#ff5d6c" strokeWidth="2" />
        </g>
      ))}
    </g>
  );
}

function HeliTop({ sx, sy, hl = [] }) {
  const f = (k, d = C.base) => (hl.includes(k) ? C.hl : d);
  const s = (k) => (hl.includes(k) ? C.hlStroke : C.stroke);
  return (
    <g>
      <circle cx={sx(3500)} cy={sy(0)} r={Math.abs(sx(5500) - sx(0))} fill="none" stroke="#3b9eff" strokeOpacity={hl.includes("rotor") ? 0.9 : 0.3} strokeDasharray="5 5" />
      {/* patins */}
      <rect x={sx(1200)} y={sy(1400)} width={sx(5800) - sx(1200)} height={sy(1000) - sy(1400)} fill={f("700")} stroke={s("700")} />
      <rect x={sx(1200)} y={sy(-1000)} width={sx(5800) - sx(1200)} height={sy(-1400) - sy(-1000)} fill={f("700")} stroke={s("700")} />
      {/* stabilisateur + poutre + dérive */}
      <rect x={sx(10200)} y={sy(1600)} width={sx(10800) - sx(10200)} height={sy(-1600) - sy(1600)} fill={f("300")} stroke={s("300")} />
      <polygon points={`${sx(6200)},${sy(400)} ${sx(11800)},${sy(250)} ${sx(11800)},${sy(-250)} ${sx(6200)},${sy(-400)}`} fill={f("300", C.body)} stroke={s("300")} />
      <rect x={sx(11800)} y={sy(250)} width={sx(13200) - sx(11800)} height={sy(-250) - sy(250)} fill={f("fen")} stroke={s("fen")} />
      {/* cabine */}
      <path d={`M${sx(500)},${sy(0)} C${sx(500)},${sy(900)} ${sx(1400)},${sy(1100)} ${sx(2400)},${sy(1100)} L${sx(6200)},${sy(1100)} L${sx(6200)},${sy(-1100)} L${sx(2400)},${sy(-1100)} C${sx(1400)},${sy(-1100)} ${sx(500)},${sy(-900)} ${sx(500)},${sy(0)} Z`} fill={f("cab", C.body)} stroke={s("cab")} />
      {/* portes latérales */}
      <rect x={sx(2700)} y={sy(1150)} width={sx(4700) - sx(2700)} height="5" fill={f("800", "#5b7299")} />
      <rect x={sx(2700)} y={sy(-1150) - 5} width={sx(4700) - sx(2700)} height="5" fill={f("800", "#5b7299")} />
      {/* BTP et moteurs */}
      <rect x={sx(2800)} y={sy(700)} width={sx(4600) - sx(2800)} height={sy(-700) - sy(700)} rx="4" fill={f("pm", "#2f4570")} stroke={s("pm")} />
      <rect x={sx(4600)} y={sy(900)} width={sx(6600) - sx(4600)} height={sy(100) - sy(900)} rx="5" fill={f("400")} stroke={s("400")} />
      <rect x={sx(4600)} y={sy(-100)} width={sx(6600) - sx(4600)} height={sy(-900) - sy(-100)} rx="5" fill={f("400")} stroke={s("400")} />
      <circle cx={sx(3500)} cy={sy(0)} r="5" fill={hl.includes("rotor") ? "#3b9eff" : "#8fa0bd"} />
    </g>
  );
}

/* ============================================================
   ONGLET 1 : MÉCANIQUE DU VOL HÉLICOPTÈRE
   ============================================================ */
const COMMANDES = [
  { name: "Manche cyclique", effet: "Incline le plateau cyclique, donc le disque rotor : l'hélico translate dans la direction voulue.", chaine: "Manche → timonerie (bielles, guignols) → servocommandes hydrauliques → plateau cyclique" },
  { name: "Levier de pas collectif", effet: "Change en même temps le pas de toutes les pales : l'hélico monte ou descend.", chaine: "Levier → timonerie → servocommandes → plateau cyclique (translation verticale)" },
  { name: "Palonniers", effet: "Font varier le pas des pales du rotor arrière ou du Fenestron : contrôle du lacet et compensation du couple.", chaine: "Palonniers → timonerie ou câbles → servocommande arrière → pas des pales anticouple" },
];

const PR_ROLES = [
  { name: "Intempéries & aérodynamique", icon: Droplets, desc: "Empêcher l'eau de pluie et de lavage d'entrer dans la cellule, en particulier dans les baies avionique et sous la verrière." },
  { name: "Carburant & fluides", icon: Fuel, desc: "Étanchéité des zones réservoirs sous plancher et des drains du plancher mécanique, qui recueillent les fuites d'huile de la BTP et des moteurs." },
  { name: "Cloisons pare-feu", icon: Flame, desc: "Les firewalls en titane ou inox isolent les turbomoteurs et la BTP. Leur étanchéité doit tenir face au feu : produits et méthode imposés." },
  { name: "Anticorrosion galvanique", icon: ShieldCheck, desc: "Interposition entre matériaux de potentiels différents : aluminium, carbone, titane. Ces couples sont très présents sur H160, H175 et NH90." },
];

function TabFlight({ done, onComplete }) {
  const [cmd, setCmd] = useState(0);
  const [frein, setFrein] = useState(null);
  const [pr, setPr] = useState(null);
  const [avion, setAvion] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Fan} kicker="Onglet 1 · Mécanique du vol hélicoptère" title="Ce qui rend l'hélicoptère si exigeant à assembler">
        Voilure tournante, vibrations permanentes et aucune pressurisation : ces trois faits pilotent chaque ligne de ta gamme. Commence par manipuler le rotor.
      </SectionHead>

      <RotorSim />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Panel className="p-5">
          <div className="mb-3 flex items-center gap-2"><Gauge size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Les 3 commandes du pilote</h3></div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {COMMANDES.map((c, i) => (
              <Chip key={c.name} active={cmd === i} onClick={() => setCmd(i)}>
                <span className="font-display text-[15px] font-semibold leading-tight">{c.name}</span>
              </Chip>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-bg p-4">
            <p className="text-[14px] leading-relaxed text-ink/90">{COMMANDES[cmd].effet}</p>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted">Chaîne de commande</div>
            <div className="mt-1 font-mono text-[12px] leading-relaxed text-sky">{COMMANDES[cmd].chaine}</div>
          </div>
          <div className="mt-3 rounded-lg border border-ko/40 bg-ko/10 p-3 text-[13px] leading-relaxed text-ink">
            <strong className="text-ko">Piège : </strong>sur hélicoptère, toute cette timonerie relève de l'<strong>ATA 67</strong> (commandes de vol rotors), pas de l'ATA 27 comme sur avion. Double contrôle croisé obligatoire.
          </div>
        </Panel>
        <div className="flex flex-col gap-3">
          <Panel className="p-5">
            <div className="mb-2 flex items-center gap-2"><Wind size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Fenestron ou rotor arrière classique</h3></div>
            <p className="text-[14px] leading-relaxed text-ink/90">
              Le Fenestron est un rotor anticouple caréné dans la dérive. Ses pales sont à <strong>espacement irrégulier</strong> : le bruit se répartit sur plusieurs fréquences au lieu de se concentrer sur une seule.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
              <div className="rounded-lg border border-line bg-bg p-2"><div className="font-mono text-[10px] uppercase text-amber">Fenestron</div>H135 · H145 · H160</div>
              <div className="rounded-lg border border-line bg-bg p-2"><div className="font-mono text-[10px] uppercase text-amber">Rotor arrière</div>H125 · H175 · Super Puma</div>
            </div>
          </Panel>
          <Panel className="p-4">
            <div className="flex items-start gap-3">
              <Info size={18} className="mt-0.5 shrink-0 text-amber" />
              <p className="text-[13px] leading-relaxed text-ink/90">
                <strong className="text-amber">Rappel bonus.</strong> Sur hélicoptère Airbus, le commandant de bord est assis à <strong>droite</strong>. La gauche et la droite géométriques de l'appareil ne changent pas : elles se lisent toujours assis dans un siège pilote, regard vers l'avant (−Y à gauche, +Y à droite).
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <ImpactBox title="Environnement vibratoire extrême = freinage mécanique partout">
        Le rotor génère des vibrations permanentes qui desserrent toute fixation non freinée et accélèrent la fatigue de la structure. Chaque fixation de la gamme doit avoir son moyen de freinage défini, selon les instructions EI et l'ATA 20. Clique sur chacun :
      </ImpactBox>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {FREINAGES.map((x, i) => (
          <button key={x.name} type="button" onClick={() => setFrein(i)} className={cx("flex flex-col gap-1 rounded-lg border p-3 text-left transition", frein === i ? "border-amber bg-amber/10" : "border-line bg-panel hover:border-amber/60")}>
            <Lock size={16} className="text-amber" />
            <span className="font-display text-base font-semibold text-ink">{x.name}</span>
            {frein === i && <span className="text-[12px] leading-snug text-ink/85">{x.desc}</span>}
          </button>
        ))}
      </div>

      <ImpactBox title="Pas de pressurisation : alors à quoi sert le mastic PR ?">
        Un hélicoptère n'est <strong>pas pressurisé</strong>. Le PR reste partout dans tes gammes, mais pour quatre autres raisons. Clique pour les découvrir :
      </ImpactBox>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PR_ROLES.map((r, i) => {
          const Icon = r.icon;
          return (
            <button key={r.name} type="button" onClick={() => setPr(i)} className={cx("flex flex-col gap-1 rounded-lg border p-3 text-left transition", pr === i ? "border-sky bg-sky/10" : "border-line bg-panel hover:border-sky/60")}>
              <Icon size={16} className="text-sky" />
              <span className="font-display text-base font-semibold text-ink">{r.name}</span>
              {pr === i && <span className="text-[12px] leading-snug text-ink/85">{r.desc}</span>}
            </button>
          );
        })}
      </div>

      <Panel className="p-4">
        <button type="button" onClick={() => setAvion(!avion)} className="flex w-full items-center gap-2 text-left">
          <Plane size={16} className="text-muted" />
          <span className="font-display text-base font-semibold text-muted">Repère avion, pour comparaison</span>
          {avion ? <ChevronDown size={14} className="ml-auto text-muted" /> : <ChevronRight size={14} className="ml-auto text-muted" />}
        </button>
        {avion && (
          <div className="mt-3 grid gap-2 text-[13px] leading-relaxed text-ink/85 md:grid-cols-3">
            <div className="rounded-lg border border-line bg-bg p-3">Voilure fixe : portance, poids, traction, traînée. Gouvernes : ailerons (roulis), profondeur (tangage), direction (lacet).</div>
            <div className="rounded-lg border border-line bg-bg p-3">Cabine pressurisée : le PR y sert d'abord à l'étanchéité de pressurisation, avec un affleurement strict des rivets fraisés.</div>
            <div className="rounded-lg border border-line bg-bg p-3">Commandes de vol avion : ATA 27. Sur hélicoptère : ATA 67.</div>
          </div>
        )}
      </Panel>

      <ValidatedBanner done={done} label="Mécanique du vol hélicoptère et contraintes d'assemblage acquises." />
      <QuickCheck
        title="Contrôle de fin d'onglet"
        onComplete={onComplete}
        questions={[
          {
            q: "Sur un H145, quelle commande incline le disque rotor pour translater ?",
            options: ["Le levier de pas collectif", "Le manche cyclique", "Les palonniers", "La manette de puissance"],
            answer: 1,
            why: "Le manche cyclique agit sur le plateau cyclique, qui fait varier le pas de chaque pale selon sa position : le disque s'incline.",
            hint: "Le collectif agit sur toutes les pales en même temps : il ne fait que monter ou descendre.",
          },
          {
            q: "Une cellule de H160 n'est pas pressurisée. Pourquoi la gamme impose-t-elle quand même de l'interposition PR entre un cadre alu et un panneau carbone ?",
            options: ["Pour tenir la pressurisation", "Pour la protection anticorrosion galvanique entre alu et carbone", "Pour réduire la masse", "Pour remplacer les fixations"],
            answer: 1,
            why: "L'aluminium au contact du carbone se corrode par effet galvanique. Le PR interposé isole les deux matériaux.",
            hint: "Il n'y a pas de pressurisation sur hélicoptère. Pense aux matériaux en contact.",
          },
          {
            q: "Pourquoi les pales du Fenestron sont-elles à espacement irrégulier ?",
            options: ["Pour faciliter le montage", "Pour réduire le bruit en répartissant ses fréquences", "Pour économiser une pale", "Pour l'équilibrage statique"],
            answer: 1,
            why: "Des pales régulièrement espacées concentrent le bruit sur une fréquence. L'espacement irrégulier l'étale et le rend moins gênant.",
            hint: "C'est une question d'acoustique.",
          },
        ]}
      />
    </div>
  );
}

/* ============================================================
   ONGLET 2 : SE REPÉRER DANS LA CELLULE
   ============================================================ */
const SECTIONS = [
  { id: "barque", hl: ["barque", "cabine"], name: "Barque / pointe avant", sub: "Cockpit & canopy", desc: "Structure vitrée (verrière), palonniers, manche cyclique, levier de pas collectif. En bas, la barque : structure inférieure qui reçoit souvent les réservoirs." },
  { id: "cabine", hl: ["cabine", "pm"], name: "Cabine / fuselage central", sub: "Entre barque et plancher mécanique", desc: "Délimitée par la barque en bas et le plancher mécanique en haut. Le plancher mécanique est la zone vitale de l'hélicoptère : il supporte la BTP et les moteurs." },
  { id: "boom", hl: ["boom", "fen"], name: "Poutre de queue", sub: "Tail boom", desc: "Structure travaillante, composite ou métallique à couples et lisses. Elle reprend les efforts de l'anticouple et se prolonge par la dérive et le Fenestron (ou le rotor arrière)." },
];
const STRUCT_ELEMS = [
  { id: "couples", name: "Couples / cadres", color: "text-ok", desc: "Positionnés en X (stations). Ils donnent la forme et reprennent les efforts transverses." },
  { id: "lisses", name: "Lisses", color: "text-amber", desc: "Raidisseurs longitudinaux positionnés en Y et Z. Ils stabilisent les panneaux de peau." },
  { id: "anneaux", name: "Anneaux principaux", color: "text-ko", desc: "Cadres renforcés qui reprennent les efforts des barres de suspension BTP, donc la portance du rotor." },
  { id: "pm", name: "Plancher mécanique", color: "text-sky", desc: "Toit de la cabine qui porte la BTP et les turbomoteurs. Il intègre des drains et des cloisons pare-feu." },
];

function CelluleExplorer() {
  const [sec, setSec] = useState("cabine");
  const [ov, setOv] = useState(["anneaux"]);
  const sx = (x) => 20 + (x / HX) * 480;
  const sz = (z) => 210 - (z / HZ) * 190;
  const S = SECTIONS.find((s) => s.id === sec);
  const toggle = (id) => setOv(ov.includes(id) ? ov.filter((o) => o !== id) : [...ov, id]);
  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-center gap-2"><Layers size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Découpage de la cellule (airframe)</h3></div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="rounded-lg border border-line bg-bg p-2">
            <svg viewBox="0 0 520 225" className="h-auto w-full" role="img" aria-label="Hélicoptère de profil avec découpage de la cellule">
              <text x="8" y="16" fill="#8fa0bd" fontSize="10" fontFamily="JetBrains Mono, monospace">Vue de côté gauche · nez à gauche</text>
              <HeliSide sx={sx} sz={sz} hl={[...S.hl, ...(ov.includes("pm") ? ["pm"] : [])]} overlay={ov} />
            </svg>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STRUCT_ELEMS.map((e) => (
              <Chip key={e.id} active={ov.includes(e.id)} onClick={() => toggle(e.id)}><span className={e.color}>■</span> {e.name}</Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {SECTIONS.map((s, i) => (
            <button key={s.id} type="button" onClick={() => setSec(s.id)} className={cx("flex flex-col gap-0.5 rounded-lg border p-3 text-left transition", sec === s.id ? "border-sky bg-sky/10" : "border-line bg-bg hover:border-sky/60")}>
              <div className="flex items-baseline gap-2"><span className="font-mono text-xs text-sky">{i + 1}</span><span className="font-display text-lg font-semibold text-ink">{s.name}</span></div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{s.sub}</span>
              {sec === s.id && <span className="mt-1 text-[13px] leading-relaxed text-ink/90">{s.desc}</span>}
            </button>
          ))}
          <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-bg p-3">
            {STRUCT_ELEMS.filter((e) => ov.includes(e.id)).map((e) => (
              <div key={e.id} className="text-[12px] leading-snug text-ink/85"><strong className={e.color}>{e.name} : </strong>{e.desc}</div>
            ))}
            {ov.length === 0 && <span className="text-[12px] text-muted">Active un élément structural pour le voir sur le profil.</span>}
          </div>
        </div>
      </div>
    </Panel>
  );
}

const STRUCT_ITEMS = [
  { name: "Plancher mécanique", cat: "primaire", why: "Il reçoit la BTP et les turbomoteurs : effort majeur, structure primaire." },
  { name: "Anneau principal (reprise des barres BTP)", cat: "primaire", why: "Il transmet la portance du rotor à la cellule : structure primaire." },
  { name: "Poutre de queue", cat: "primaire", why: "Structure travaillante qui reprend la poussée de l'anticouple." },
  { name: "Couple de barque", cat: "primaire", why: "Il fait partie de la structure inférieure qui reprend les efforts d'atterrissage et des réservoirs." },
  { name: "Capot de turbomoteur", cat: "secondaire", why: "Pièce d'accès et de profil aérodynamique, sans effort structural majeur." },
  { name: "Carénage de BTP", cat: "secondaire", why: "Il protège et profile, sans reprendre d'effort global." },
  { name: "Cloison d'habillage cabine", cat: "secondaire", why: "Aménagement intérieur, sans rôle dans la tenue globale." },
  { name: "Boîte de Transmission Principale (BTP)", cat: "critique", why: "Sa défaillance unique est catastrophique sans redondance possible : pièce critique, traçabilité totale." },
  { name: "Barre de suspension BTP", cat: "critique", why: "Elle porte l'hélicoptère suspendu à son rotor : pièce critique suivie unitairement." },
  { name: "Mât rotor", cat: "critique", why: "Il transmet couple et portance. Aucune redondance : pièce critique." },
  { name: "Moyeu rotor (Starflex / Spheriflex)", cat: "critique", why: "Rupture du moyeu = perte des pales. Pièce critique, traçabilité totale." },
];
const STRUCT_CATS = [
  { id: "primaire", label: "Primaire (PSE)" },
  { id: "secondaire", label: "Secondaire" },
  { id: "critique", label: "Pièce critique" },
];

function StructureSort({ onAllCorrect }) {
  const [ans, setAns] = useState({});
  const correct = STRUCT_ITEMS.filter((it, i) => ans[i] === it.cat).length;
  useEffect(() => {
    if (correct === STRUCT_ITEMS.length) onAllCorrect();
  }, [correct]);
  return (
    <Panel className="p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <ShieldAlert size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Atelier de tri : classe chaque pièce</h3>
        <span className="ml-auto font-mono text-xs text-muted">{correct}/{STRUCT_ITEMS.length} correctes</span>
      </div>
      <p className="mb-4 text-[13px] text-muted">Une mauvaise réponse s'affiche en rouge : change-la jusqu'à tout valider.</p>
      <div className="flex flex-col gap-2">
        {STRUCT_ITEMS.map((it, i) => {
          const a = ans[i];
          const ok = a === it.cat;
          return (
            <div key={it.name} className={cx("flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center", a === undefined ? "border-line bg-bg" : ok ? "border-ok/50 bg-ok/5" : "border-ko/50 bg-ko/5")}>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-ink">{it.name}</div>
                {a !== undefined && <div className={cx("text-[12px]", ok ? "text-ok" : "text-ko")}>{ok ? it.why : "Pas tout à fait : sa défaillance seule serait-elle catastrophique ? Reprend-elle des efforts majeurs ?"}</div>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STRUCT_CATS.map((c) => (
                  <Chip key={c.id} active={a === c.id} tone={a === c.id ? (ok ? "green" : "red") : "blue"} onClick={() => setAns({ ...ans, [i]: c.id })}>{c.label}</Chip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

const ZONES = [
  { code: "100", hl: ["cab"], name: "Fuselage inférieur", detail: "Sur hélicoptère : la barque, sous le plancher cabine. Réservoirs carburant, structure inférieure." },
  { code: "200", hl: ["cab"], name: "Fuselage supérieur", detail: "Pointe avant (cockpit, verrière) et cabine, jusqu'au plancher mécanique." },
  { code: "300", hl: ["300", "fen"], name: "Arrière / poutre de queue", detail: "Poutre de queue, stabilisateur horizontal, dérive, Fenestron ou rotor arrière." },
  { code: "400", hl: ["400"], name: "Groupes motopropulseurs", detail: "Turbomoteurs (Arriel, Arrano, Makila…), capots, cloisons pare-feu." },
  { code: "500", hl: [], name: "Voilure gauche (avion)", detail: "Sans voilure fixe sur hélicoptère : vérifie l'affectation de ces numéros dans le zonage du manuel du type." },
  { code: "600", hl: [], name: "Voilure droite (avion)", detail: "Même remarque que 500. La logique impair = gauche, pair = droite reste valable partout." },
  { code: "700", hl: ["700"], name: "Atterrisseurs", detail: "Patins (H125, H145) ou train à roues (H160, H175, Super Puma)." },
  { code: "800", hl: ["800"], name: "Portes et trappes", detail: "Portes cabine coulissantes, portes pilote, trappes d'accès et capots ouvrants." },
];

function ZoneMap() {
  const [zone, setZone] = useState("200");
  const z = ZONES.find((x) => x.code === zone);
  const sx = (x) => 30 + (x / HX) * 460;
  const sy = (y) => 125 - (y / HY) * 100;
  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-center gap-2"><MapIcon size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Le zonage ATA 100 appliqué à l'hélicoptère</h3></div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 rounded-lg border border-line bg-bg p-2">
          <svg viewBox="0 0 520 250" className="h-auto w-full" role="img" aria-label="Hélicoptère vu de dessus avec zones">
            <text x="8" y="14" fill="#8fa0bd" fontSize="10" fontFamily="JetBrains Mono, monospace">Vu de dessus · nez à gauche</text>
            <text x="370" y="14" fill="#ffb020" fontSize="10" fontFamily="JetBrains Mono, monospace">+Y DROITE ↑</text>
            <text x="8" y="244" fill="#ffb020" fontSize="10" fontFamily="JetBrains Mono, monospace">↓ −Y GAUCHE</text>
            <HeliTop sx={sx} sy={sy} hl={z.hl} />
            {(zone === "100" || zone === "200") && <text x={sx(1650)} y={sy(0) + 4} fill="#e6edf7" fontSize="11" fontWeight="700" fontFamily="JetBrains Mono, monospace" textAnchor="middle">{zone === "100" ? "BARQUE" : "CABINE"}</text>}
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-1.5">
            {ZONES.map((x) => (
              <button key={x.code} type="button" onClick={() => setZone(x.code)} className={cx("rounded-lg border py-2 font-mono text-sm font-semibold transition", zone === x.code ? "border-sky bg-sky text-bg" : x.hl.length ? "border-line bg-bg text-ink hover:border-sky/60" : "border-line bg-bg text-muted hover:border-sky/60")}>{x.code}</button>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-bg p-4">
            <div className="font-mono text-3xl font-semibold text-sky">{z.code}</div>
            <div className="font-display text-xl font-semibold text-ink">{z.name}</div>
            <p className="mt-1 text-[14px] text-ink/85">{z.detail}</p>
          </div>
          <div className="rounded-lg border border-amber/40 bg-amber/10 p-3 text-[13px] leading-relaxed text-ink">
            <strong className="text-amber">Astuce préparateur.</strong> Dans une sous-zone, le dernier chiffre <strong>impair</strong> désigne la <strong>gauche</strong>, le <strong>pair</strong> la <strong>droite</strong> : 211 = gauche, 212 = droite (côté du commandant de bord sur hélico Airbus).
          </div>
        </div>
      </div>
    </Panel>
  );
}

function decodeZone(raw) {
  const s = (raw || "").trim();
  if (!/^\d{3}$/.test(s)) return null;
  const major = ZONES.find((z) => z.code === s[0] + "00");
  if (!major) return { error: "Zone majeure inconnue : le premier chiffre doit aller de 1 à 8." };
  let side;
  if (s[0] === "5") side = "Gauche (zone majeure impaire)";
  else if (s[0] === "6") side = "Droite (zone majeure paire)";
  else if (s[2] === "0") side = "Zone entière ou dans l'axe (dernier chiffre 0)";
  else side = Number(s[2]) % 2 === 1 ? "Gauche (dernier chiffre impair)" : "Droite (dernier chiffre pair)";
  return { major, side };
}

function SubzoneDecoder() {
  const [val, setVal] = useState("212");
  const r = decodeZone(val);
  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-center gap-2"><Crosshair size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Décodeur express de zone</h3></div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-1">
          <label htmlFor="zone-input" className="font-mono text-[11px] uppercase tracking-wider text-muted">Zone de l'OF</label>
          <input id="zone-input" value={val} maxLength={3} inputMode="numeric" onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))} className="w-32 rounded-lg border border-line bg-bg px-3 py-2 font-mono text-2xl text-ink focus:border-sky focus:outline-none" />
          <div className="mt-1 flex flex-wrap gap-1">
            {["211", "212", "131", "412", "322"].map((z) => (
              <button key={z} type="button" onClick={() => setVal(z)} className="rounded border border-line px-2 py-0.5 font-mono text-xs text-muted hover:text-ink">{z}</button>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1 rounded-lg border border-line bg-bg p-4">
          {!r && <span className="text-sm text-muted">Saisis un code à 3 chiffres.</span>}
          {r && r.error && <span className="text-sm text-ko">{r.error}</span>}
          {r && !r.error && (
            <div className="flex flex-col gap-1">
              <div className="text-[14px] text-ink"><span className="font-mono text-muted">Partie : </span><strong>{r.major.code} · {r.major.name}</strong></div>
              <div className="text-[14px] text-ink"><span className="font-mono text-muted">Côté : </span><strong className="text-amber">{r.side}</strong></div>
              <div className="text-[12px] text-muted">Le côté se lit toujours assis dans un siège pilote, regard vers l'avant, quelle que soit la place du commandant de bord.</div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function TabLocate({ done, onComplete }) {
  const [axisOpen, setAxisOpen] = useState("X");
  const axes = [
    { id: "X", name: "Station · STA", dir: "Longitudinal : du nez vers le Fenestron", pos: "Couples / cadres (Frames, FR), anneaux principaux", note: "Le point zéro X0 est placé en avant du nez : toutes les stations restent positives jusqu'au Fenestron.", color: "text-sky" },
    { id: "Y", name: "Buttock Line · BL", dir: "Transversal : gauche / droite", pos: "Lisses (Stringers), longerons de plancher", note: "Règle d'or : gauche et droite se lisent assis dans un siège pilote, regard vers l'avant. −Y à gauche (impair), +Y à droite (pair). Le commandant de bord est à droite sur hélico Airbus, mais la géométrie ne change pas.", color: "text-amber" },
    { id: "Z", name: "Water Line · WL", dir: "Vertical : barque → cabine → plancher mécanique → tête rotor", pos: "Plancher cabine, plancher mécanique, BTP", note: "La WL te dit si tu travailles dans la barque (réservoirs), en cabine, sur le plancher mécanique ou au niveau de la tête rotor.", color: "text-ok" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Compass} kicker="Onglet 2 · Se repérer dans la cellule" title="Trièdre, structure et zonage d'un hélicoptère">
        Un OF ne te dit jamais « derrière la porte coulissante » : il donne des coordonnées, une zone et une classe de pièce. Apprends à les lire sur une cellule d'hélicoptère.
      </SectionHead>

      <div className="grid gap-3 md:grid-cols-3">
        {axes.map((a) => (
          <button key={a.id} type="button" onClick={() => setAxisOpen(a.id)} className={cx("flex flex-col gap-1 rounded-xl border p-4 text-left transition", axisOpen === a.id ? "border-sky bg-sky/10" : "border-line bg-panel hover:border-sky/60")}>
            <div className="flex items-baseline gap-2"><span className={cx("font-mono text-3xl font-bold", a.color)}>{a.id}</span><span className="font-display text-lg font-semibold text-ink">{a.name}</span></div>
            <div className="text-[13px] text-muted">{a.dir}</div>
            <div className="text-[13px] text-ink"><span className="text-muted">Positionne : </span>{a.pos}</div>
            {axisOpen === a.id && <div className={cx("mt-2 rounded-lg border border-line bg-bg p-2 text-[13px] leading-relaxed", a.id === "Y" ? "text-amber" : "text-ink/90")}>{a.note}</div>}
          </button>
        ))}
      </div>

      <CelluleExplorer />

      <div className="grid gap-3 md:grid-cols-3">
        <Panel className="p-4">
          <div className="mb-1 flex items-center gap-2"><ShieldCheck size={16} className="text-sky" /><Eyebrow>Structure primaire (PSE)</Eyebrow></div>
          <p className="text-[14px] leading-relaxed text-ink/90">Reprend les efforts majeurs : plancher mécanique, anneaux principaux, poutre de queue, couples de barque. Souvent conçue <strong>fail-safe</strong> (chemins d'effort redondants).</p>
        </Panel>
        <Panel className="p-4">
          <div className="mb-1 flex items-center gap-2"><Box size={16} className="text-ok" /><Eyebrow tone="green">Structure secondaire</Eyebrow></div>
          <p className="text-[14px] leading-relaxed text-ink/90">Ne reprend pas les efforts majeurs : capots moteur, carénages de BTP, cloisons d'habillage.</p>
        </Panel>
        <Panel className="p-4">
          <div className="mb-1 flex items-center gap-2"><ShieldAlert size={16} className="text-ko" /><Eyebrow tone="red">Pièce critique</Eyebrow></div>
          <p className="text-[14px] leading-relaxed text-ink/90">Défaillance <strong>unique</strong> = issue catastrophique, sans redondance : BTP, barres de suspension, mât, moyeu, pales. <strong>Traçabilité totale</strong> dans la gamme.</p>
        </Panel>
      </div>
      <p className="-mt-3 text-[12px] text-muted">Classification de référence : exigences de conception et de production EASA Part-21.</p>

      <StructureSort onAllCorrect={onComplete} />
      <ValidatedBanner done={done} label="Tu sais classer une pièce et te repérer dans la cellule." />
      <ZoneMap />
      <SubzoneDecoder />
    </div>
  );
}

/* ============================================================
   ONGLET 3 : SYSTÈMES ATA, BNAE & STANDARDS AIRBUS HELICOPTERS
   ============================================================ */
const HELI_CHAPTERS = [
  { code: "62", name: "Rotor principal", icon: Fan, ops: ["Pales", "Moyeu rotor (Starflex, Spheriflex)", "Amortisseurs de traînée"], note: "Pièces critiques : traçabilité totale, serrages tracés." },
  { code: "63", name: "Entraînement rotor principal", icon: Cog, ops: ["BTP (MGB)", "Barres de suspension BTP, béquilles", "Plateau cyclique", "Mât rotor"], note: "Le cœur mécanique : chaque fixation est freinée et tracée." },
  { code: "64", name: "Rotor arrière / Fenestron", icon: Wind, ops: ["Rotor anticouple ou Fenestron", "Pales à espacement irrégulier (Fenestron)", "Moyeu arrière"], note: "Fenestron sur H135, H145, H160 ; rotor classique sur H125, H175, Super Puma." },
  { code: "65", name: "Entraînement rotor arrière", icon: Cable, ops: ["Arbres de transmission arrière", "Paliers intermédiaires", "Boîte intermédiaire (IGB) et BTA (TGB)"], note: "Alignement des arbres et freinage des paliers : sources classiques de vibrations." },
  { code: "67", name: "Commandes de vol rotors", icon: Gauge, ops: ["Timonerie, bielles, guignols", "Servocommandes hydrauliques", "Double contrôle croisé obligatoire"], note: "Piège : sur avion c'est l'ATA 27, sur hélicoptère c'est l'ATA 67." },
  { code: "71 à 79", name: "Groupe turbomoteur", icon: Flame, ops: ["Intégration moteur (Arriel, Arrano, Makila…)", "Cloisons pare-feu titane / inox", "Entrées d'air"], note: "L'étanchéité des pare-feu se monte avec les produits et méthodes imposés." },
];
const GEN_CHAPTERS = [
  { code: "20", name: "Pratiques standard cellule", txt: "Couples de serrage, métallisation, application PR, freinage." },
  { code: "24 / 92", name: "Électricité & EWIS", txt: "Ségrégation puissance / signal, rayons de courbure, métallisation." },
  { code: "28", name: "Carburant", txt: "Réservoirs sous plancher : FOD, PR carburant, continuité électrique." },
  { code: "29", name: "Hydraulique", txt: "Alimentation des servocommandes : propreté, B-nuts au couple." },
  { code: "52 / 53", name: "Portes / Fuselage", txt: "Perçage, ébavurage, interposition, calage, rivetage." },
];

const OF_CARDS = [
  {
    id: "OF-H160-0412", title: "Montage bielle de pas cyclique entre manche et servocommande", aircraft: "H160", x: 2200, y: 300, z: 1200, zone: "212", ref: "EI · double contrôle des commandes de vol",
    answers: { side: "droite", part: "200", ata: "67", type: "ah" }, ataOptions: ["27", "67", "63", "22"],
    explain: "Zone 212 : pointe avant, dernier chiffre pair donc droite (BL positive), côté du commandant de bord. La timonerie de commande rotor relève de l'ATA 67, pas de l'ATA 27. La référence EI est une instruction interne Airbus Helicopters.",
  },
  {
    id: "OF-H175-0587", title: "Pose barre de suspension BTP sur anneau principal", aircraft: "H175", x: 4200, y: -600, z: 2500, zone: "Plancher mécanique", ref: "ATA 63 · Entraînement rotor principal",
    answers: { side: "gauche", part: "pm", ata: "63", type: "ata" }, ataOptions: ["53", "62", "63", "67"],
    explain: "BL négative : côté gauche. WL au-dessus du plancher mécanique, sur l'ensemble BTP. Les barres de suspension relèvent de l'ATA 63. Pièce critique : traçabilité totale. La référence citée est un chapitre ATA, donc fonctionnelle.",
  },
  {
    id: "OF-H125-0733", title: "Fixation capot du turbomoteur Arriel", aircraft: "H125", x: 5000, y: 500, z: 2600, zone: "412", ref: "Vis ASN xxxx",
    answers: { side: "droite", part: "400", ata: "71", type: "ah" }, ataOptions: ["71", "54", "63", "28"],
    explain: "Zone 412 : groupe motopropulseur, dernier chiffre pair donc droite. Capots et intégration moteur : ATA 71 à 79. ASN est une norme Aerospatiale reprise par Airbus Helicopters pour les pièces standard et fixations.",
  },
  {
    id: "OF-H145-0901", title: "Montage arbre de transmission arrière et palier intermédiaire", aircraft: "H145", x: 8000, y: 0, z: 2350, zone: "310", ref: "ATA 65 · Entraînement rotor arrière",
    answers: { side: "axe", part: "boom", ata: "65", type: "ata" }, ataOptions: ["64", "65", "63", "67"],
    explain: "BL = 0 : dans le plan de symétrie, sur le dessus de la poutre de queue. Arbres et paliers vers l'arrière : ATA 65. Le Fenestron lui-même serait l'ATA 64. Référence fonctionnelle ATA.",
  },
  {
    id: "OF-H160-1044", title: "Pose réservoir sous plancher et étanchéité PR carburant", aircraft: "H160", x: 3500, y: -500, z: 800, zone: "131", ref: "Écrou auto-freiné NF L 22-xxx",
    answers: { side: "gauche", part: "100", ata: "28", type: "bnae" }, ataOptions: ["28", "29", "53", "71"],
    explain: "Zone 131 : fuselage inférieur (barque), dernier chiffre impair donc gauche, BL négative. Réservoir : ATA 28, avec FOD, PR carburant et continuité électrique. La NF L est une norme produite sous l'égide du BNAE.",
  },
  {
    id: "OF-H135-1178", title: "Fixation carénage du Fenestron", aircraft: "H135", x: 12600, y: 200, z: 2400, zone: "322", ref: "Vis ECS xxxx",
    answers: { side: "droite", part: "boom", ata: "64", type: "ah" }, ataOptions: ["64", "65", "55", "62"],
    explain: "Zone 322 : arrière / poutre, dernier chiffre pair donc droite. L'ensemble Fenestron relève de l'ATA 64. ECS (Eurocopter Standard) est le référentiel interne de pièces standard d'Airbus Helicopters.",
  },
  {
    id: "OF-H125-1290", title: "Montage du moyeu Starflex sur le mât rotor", aircraft: "H125", x: 3500, y: 0, z: 3300, zone: "Tête rotor", ref: "RG.Aéro 000 23 · gestion de configuration",
    answers: { side: "axe", part: "rotor", ata: "62", type: "bnae" }, ataOptions: ["62", "63", "64", "20"],
    explain: "BL = 0 : dans l'axe, au sommet du mât. Le moyeu relève de l'ATA 62 (le mât, de l'ATA 63). Pièce critique : traçabilité totale. Les RG.Aéro sont éditées par le BNAE.",
  },
];

const PART_OPTS = [
  { id: "100", label: "Barque / sous plancher (100)" },
  { id: "200", label: "Pointe avant & cabine (200)" },
  { id: "pm", label: "Plancher mécanique / BTP" },
  { id: "rotor", label: "Rotor principal" },
  { id: "400", label: "Turbomoteur (400)" },
  { id: "boom", label: "Poutre / Fenestron (300)" },
  { id: "700", label: "Atterrisseurs (700)" },
];
const SIDE_OPTS = [
  { id: "gauche", label: "Gauche" },
  { id: "droite", label: "Droite" },
  { id: "axe", label: "Dans l'axe" },
];
const TYPE_OPTS = [
  { id: "ata", label: "ATA · fonctionnel" },
  { id: "bnae", label: "BNAE · NF L, EN, RG.Aéro" },
  { id: "ah", label: "Airbus Helicopters · ECS, ASN, EI" },
];

function OFDecoder({ onComplete }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState({});
  const card = OF_CARDS[idx];
  const fields = ["side", "part", "ata", "type"];
  const complete = fields.every((f) => sel[f] !== undefined);
  const score = Object.values(results).reduce((s, r) => s + r, 0);
  const finished = Object.keys(results).length === OF_CARDS.length;

  useEffect(() => {
    if (finished) onComplete();
  }, [finished]);

  const check = () => {
    const good = fields.filter((f) => sel[f] === card.answers[f]).length;
    setResults({ ...results, [card.id]: good });
    setChecked(true);
  };
  const go = (i) => { setIdx(i); setSel({}); setChecked(false); };
  const Row = ({ field, label, opts }) => (
    <div className="flex flex-col gap-1.5">
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {opts.map((o) => {
          const active = sel[field] === o.id;
          const isAnswer = card.answers[field] === o.id;
          return (
            <Chip key={o.id} active={active || (checked && isAnswer)} tone={checked ? (isAnswer ? "green" : active ? "red" : "blue") : "blue"} disabled={checked} onClick={() => setSel({ ...sel, [field]: o.id })}>
              {o.label}
            </Chip>
          );
        })}
      </div>
    </div>
  );

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-panel2 px-5 py-3">
        <FileText size={18} className="text-amber" />
        <h3 className="font-display text-xl font-semibold text-ink">Simulateur 1 : le décodeur d'Ordre de Fabrication</h3>
        <span className="ml-auto font-mono text-xs text-muted">{Object.keys(results).length}/{OF_CARDS.length} OF traités · {score}/{OF_CARDS.length * 4} champs justes</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto px-5 pt-4">
        {OF_CARDS.map((c, i) => (
          <button key={c.id} type="button" onClick={() => go(i)} className={cx("shrink-0 rounded-md border px-2.5 py-1 font-mono text-[11px] transition", i === idx ? "border-amber bg-amber/15 text-ink" : results[c.id] === 4 ? "border-ok/60 text-ok" : results[c.id] !== undefined ? "border-ko/60 text-ko" : "border-line text-muted hover:text-ink")}>
            {c.id}
          </button>
        ))}
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-lg border border-dashed border-amber/50 bg-bg p-4 font-mono text-[13px] text-ink">
          <div className="mb-3 flex items-center justify-between border-b border-line pb-2"><span className="text-amber">ORDRE DE FABRICATION</span><span className="text-muted">{card.id}</span></div>
          <div className="mb-3 font-display text-lg font-semibold leading-snug">{card.title}</div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="text-muted">Appareil</dt><dd>{card.aircraft}</dd>
            <dt className="text-muted">X · STA</dt><dd>{card.x.toLocaleString("fr-FR")} mm</dd>
            <dt className="text-muted">Y · BL</dt><dd>{card.y === 0 ? "0" : fmt(card.y)} mm</dd>
            <dt className="text-muted">Z · WL</dt><dd>{card.z.toLocaleString("fr-FR")} mm</dd>
            <dt className="text-muted">Zone</dt><dd className="text-sky">{card.zone}</dd>
            <dt className="text-muted">Référence</dt><dd className="text-amber">{card.ref}</dd>
          </dl>
          <div className="mt-4 text-[11px] text-muted">Références génériques (xxxx) : la gamme réelle donne le numéro complet. Cotes pédagogiques, non issues d'un plan constructeur.</div>
        </div>
        <div className="flex flex-col gap-4">
          {Row({ field: "side", label: "1 · Côté", opts: SIDE_OPTS })}
          {Row({ field: "part", label: "2 · Partie de l'hélicoptère", opts: PART_OPTS })}
          {Row({ field: "ata", label: "3 · Chapitre ATA de l'opération", opts: card.ataOptions.map((c) => ({ id: c, label: "ATA " + c })) })}
          {Row({ field: "type", label: "4 · La référence citée relève de…", opts: TYPE_OPTS })}
          {!checked ? (
            <div><PrimaryButton onClick={check} disabled={!complete} tone="amber"><CheckCircle2 size={16} /> Valider l'OF</PrimaryButton></div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className={cx("rounded-lg border p-3 text-[13px] leading-relaxed text-ink", results[card.id] === 4 ? "border-ok/50 bg-ok/10" : "border-ko/50 bg-ko/10")}>
                <strong className={results[card.id] === 4 ? "text-ok" : "text-ko"}>{results[card.id]}/4 champs justes. </strong>{card.explain}
              </div>
              <div><PrimaryButton onClick={() => go((idx + 1) % OF_CARDS.length)}>OF suivant <ArrowRight size={16} /></PrimaryButton></div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function TabSystems({ done, onComplete }) {
  const [open, setOpen] = useState("67");
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={BookOpen} kicker="Onglet 3 · Systèmes & normes" title="Trois référentiels sur chaque plan Airbus Helicopters">
        ATA classe les systèmes, le BNAE normalise les composants au niveau national et européen, et Airbus Helicopters fixe ses propres standards et règles métier. Chaque gamme croise les trois.
      </SectionHead>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2"><MapIcon size={18} className="text-sky" /><span className="font-display text-xl font-semibold text-ink">ATA 100 · iSpec 2200 · S1000D</span></div>
          <p className="text-[14px] leading-relaxed text-ink/90">Standard international de <strong>classification fonctionnelle</strong> par systèmes (chapitres) et par zones.</p>
          <div className="mt-auto rounded-lg border border-sky/40 bg-sky/10 p-3 font-display text-[16px] italic text-ink">« Sur quel système et dans quelle zone je travaille ? »</div>
        </Panel>
        <Panel className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2"><Ruler size={18} className="text-ok" /><span className="font-display text-xl font-semibold text-ink">BNAE</span></div>
          <p className="text-[14px] leading-relaxed text-ink/90">Par délégation de l'AFNOR : normes françaises <strong>NF L</strong>, participation aux normes européennes <strong>EN</strong> (ASD-STAN), et <strong>RG.Aéro</strong> (ex. RG.Aéro 000 23, gestion de configuration).</p>
          <div className="mt-auto rounded-lg border border-ok/40 bg-ok/10 p-3 font-display text-[16px] italic text-ink">« Quels composants, matériaux et procédés normalisés j'applique ? »</div>
        </Panel>
        <Panel className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2"><Wrench size={18} className="text-amber" /><span className="font-display text-xl font-semibold text-ink">Airbus Helicopters</span></div>
          <ul className="flex flex-col gap-1.5 text-[14px] leading-relaxed text-ink/90">
            <li><strong className="text-amber">ECS</strong> (Eurocopter Standard) et <strong className="text-amber">ASN</strong> (Aerospatiale Norme) : pièces standard et fixations.</li>
            <li><strong className="text-amber">EI / EICM</strong> (instructions Eurocopter / Airbus Helicopters) : procédés spéciaux et règles métier (couples, freinage, métallisation, application PR).</li>
          </ul>
          <div className="mt-auto rounded-lg border border-amber/40 bg-amber/10 p-3 font-display text-[16px] italic text-ink">« Quelle pièce standard et quelle règle maison sont imposées sur ce plan ? »</div>
        </Panel>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-ko/50 bg-ko/10 p-4 sm:flex-row sm:items-center">
        <AlertTriangle size={22} className="shrink-0 text-ko" />
        <div className="text-[14px] leading-relaxed text-ink">
          <strong className="text-ko">Piège n°1 des QCM.</strong> Commandes de vol : <span className="font-mono">ATA 27</span> sur avion, mais <span className="font-mono text-ko">ATA 67</span> sur hélicoptère (timonerie, bielles, guignols, servocommandes hydrauliques des rotors). Le double contrôle croisé reste obligatoire.
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2"><Fan size={16} className="text-sky" /><Eyebrow>Chapitres vitaux de l'hélicoptère · clique pour ouvrir</Eyebrow></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {HELI_CHAPTERS.map((c) => {
            const Icon = c.icon;
            const isOpen = open === c.code;
            return (
              <button key={c.code} type="button" onClick={() => setOpen(isOpen ? null : c.code)} className={cx("flex flex-col gap-2 rounded-xl border p-4 text-left transition", isOpen ? "border-sky bg-sky/10" : "border-line bg-panel hover:border-sky/60", c.code === "67" && !isOpen && "border-ko/50")}>
                <div className="flex items-center gap-2">
                  <Icon size={18} className={c.code === "67" ? "text-ko" : "text-sky"} />
                  <span className={cx("font-mono text-lg font-semibold", c.code === "67" ? "text-ko" : "text-sky")}>ATA {c.code}</span>
                  {isOpen ? <ChevronDown size={14} className="ml-auto text-muted" /> : <ChevronRight size={14} className="ml-auto text-muted" />}
                </div>
                <div className="font-display text-base font-semibold leading-tight text-ink">{c.name}</div>
                {isOpen && (
                  <div className="flex flex-col gap-2">
                    <ul className="flex flex-col gap-1">
                      {c.ops.map((o) => <li key={o} className="flex items-start gap-1.5 text-[13px] text-ink/90"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-ok" />{o}</li>)}
                    </ul>
                    <div className="text-[12px] leading-snug text-amber">{c.note}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-2"><BookOpen size={16} className="text-muted" /><Eyebrow>Chapitres généraux toujours présents</Eyebrow></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {GEN_CHAPTERS.map((c) => (
            <div key={c.code} className="rounded-lg border border-line bg-panel p-3">
              <div className="font-mono text-sm font-semibold text-sky">ATA {c.code}</div>
              <div className="text-[13px] font-semibold text-ink">{c.name}</div>
              <div className="mt-1 text-[12px] leading-snug text-muted">{c.txt}</div>
            </div>
          ))}
        </div>
      </div>

      <OFDecoder onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu as décodé tous les OF de la série." />
    </div>
  );
}

/* ============================================================
   ONGLET 4 : ATELIER TRIÈDRE & DIAGNOSTIC GAMME (HÉLICOPTÈRE)
   ============================================================ */
function locate(X, Y, Z) {
  const ay = Math.abs(Y);
  if (X >= 3200 && X <= 3800 && ay <= 400 && Z > 3000 && Z <= 3500) return "rotor";
  if (X >= 2800 && X < 4600 && ay <= 700 && Z > 2300 && Z <= 3000) return "pm";
  if (X >= 4600 && X <= 6600 && ay >= 100 && ay <= 900 && Z > 2300 && Z <= 2900) return "400";
  if (Z <= 600 && X >= 1200 && X <= 5800 && ay >= 900 && ay <= 1400) return "700";
  if (X >= 500 && X <= 6200 && ay <= 1100 && Z > 600 && Z <= 2300) return Z < 1000 ? "100" : "200";
  if (X >= 11800 && X <= 13300 && ay <= 250 && Z >= 1500 && Z <= 3800) return "fen";
  if (X >= 10200 && X <= 10800 && ay <= 1600 && Z >= 1950 && Z <= 2100) return "300";
  if (X > 6200 && X < 11800 && ay <= 400 && Z >= 1500 && Z <= 2450) return "300";
  return null;
}

const ZONE_INFO = {
  "100": { tag: "Zone 100", name: "Barque / sous plancher", ata: ["ATA 28 réservoirs", "ATA 53 structure inférieure", "ATA 24/92 harnais"], ops: ["Inventaire outillage entrée / sortie (FOD)", "PR carburant et continuité électrique", "Interposition anticorrosion alu / carbone"] },
  "200": { tag: "Zone 200", name: "Pointe avant & cabine", ata: ["ATA 67 timonerie (manche, collectif, palonniers)", "ATA 24/92 harnais", "ATA 52/53 portes et fuselage"], ops: ["Double contrôle croisé des commandes ATA 67", "Ségrégation et métallisation EWIS", "Étanchéité intempéries de la verrière (PR)"] },
  pm: { tag: "Plancher mécanique", name: "BTP et barres de suspension", ata: ["ATA 63 BTP, barres, plateau cyclique", "ATA 53 plancher mécanique", "ATA 67 servocommandes"], ops: ["Traçabilité totale des pièces critiques", "Serrages au couple tracés + freinage (EI)", "PR des drains : étanchéité fluides"] },
  rotor: { tag: "Tête rotor", name: "Mât et moyeu rotor", ata: ["ATA 62 moyeu, pales, amortisseurs", "ATA 63 mât rotor"], ops: ["Traçabilité totale (n° de série, appairage)", "Freinage systématique (fil, goupille, écrou crénelé)", "Serrages contre-vérifiés par un second opérateur"] },
  "400": { tag: "Zone 400", name: "Turbomoteur", ata: ["ATA 71 à 79 groupe turbomoteur", "ATA 26 protection incendie", "ATA 28 alimentation carburant"], ops: ["Étanchéité des cloisons pare-feu titane / inox", "Freinage des fixations moteur", "Métallisation des capots"] },
  "300": { tag: "Zone 300", name: "Poutre de queue / stabilisateur", ata: ["ATA 53 poutre de queue", "ATA 65 arbres et paliers", "ATA 55 stabilisateur"], ops: ["Alignement des arbres et freinage des paliers", "Interposition anticorrosion composite / métal", "Freinage systématique (vibrations)"] },
  fen: { tag: "Zone 300", name: "Dérive / Fenestron", ata: ["ATA 64 Fenestron", "ATA 65 BTA (TGB)", "ATA 67 commande de pas arrière"], ops: ["Traçabilité des pièces tournantes", "Freinage de la BTA et du moyeu arrière", "Double contrôle de la commande de pas"] },
  "700": { tag: "Zone 700", name: "Atterrisseurs / patins", ata: ["ATA 32 atterrisseurs"], ops: ["Serrage au couple des fixations de traverses", "Interposition anticorrosion", "Freinage des fixations"] },
};

const MISSIONS = [
  { text: "Place le point dans le cockpit, côté DROIT : la place du commandant de bord (type sous-zone 212).", test: (z, X, Y) => z === "200" && X < 2600 && Y > 0 },
  { text: "Place le point dans le réservoir sous plancher, côté GAUCHE (type sous-zone 131).", test: (z, X, Y) => z === "100" && Y < 0 },
  { text: "Place le point sur le plancher mécanique, au niveau d'une barre de suspension BTP côté DROIT.", test: (z, X, Y) => z === "pm" && Y > 0 },
  { text: "Place le point sur le turbomoteur GAUCHE d'un bimoteur type H145 / H160.", test: (z, X, Y) => z === "400" && Y < 0 },
  { text: "Place le point sur le Fenestron, dans le plan de symétrie.", test: (z, X, Y) => z === "fen" && Math.abs(Y) <= 250 },
  { text: "Place le point sur la tête rotor (moyeu Starflex / Spheriflex).", test: (z) => z === "rotor" },
];

function TriedreSim({ onComplete }) {
  const [pos, setPos] = useState({ X: 2000, Y: 400, Z: 1500 });
  const [mission, setMission] = useState(0);
  const [solved, setSolved] = useState({});
  const [feedback, setFeedback] = useState(null);
  const { X, Y, Z } = pos;
  const zone = locate(X, Y, Z);
  const info = zone ? ZONE_INFO[zone] : null;
  const solvedCount = Object.keys(solved).length;

  useEffect(() => {
    if (solvedCount >= 3) onComplete();
  }, [solvedCount]);

  const fb = X < 2600 ? "Pointe avant" : X <= 6200 ? "Cabine" : X < 11800 ? "Poutre" : "Fenestron";
  const lr = Y === 0 ? "Dans l'axe" : Y < 0 ? "Gauche" : "Droite";
  const ud = Z < 1000 ? "Barque" : Z <= 2300 ? "Cabine" : Z <= 3000 ? "Plancher méca" : "Tête rotor";
  const sub = zone && ["100", "200", "300", "400", "700", "fen"].includes(zone) ? `${zone === "fen" ? "3" : zone[0]}1${Y === 0 ? "0" : Y < 0 ? "1" : "2"}` : null;

  const W = 520, PADX = 30;
  const sx = (x) => PADX + (x / HX) * (W - 2 * PADX);
  const syTop = (y) => 110 - (y / HY) * 95;
  const szSide = (z) => 205 - (z / HZ) * 180;

  const m = MISSIONS[mission];
  const checkMission = () => {
    if (m.test(zone, X, Y, Z)) {
      setSolved({ ...solved, [mission]: true });
      setFeedback({ ok: true, txt: "Point d'intervention correct. Mission validée." });
    } else {
      setFeedback({ ok: false, txt: zone ? `Ton point est en ${info.name.toLowerCase()}${Y !== 0 ? ", côté " + lr.toLowerCase() : ", dans l'axe"}. Ajuste les curseurs.` : "Ton point est hors de la cellule. Ajuste les curseurs." });
    }
  };
  const nextMission = () => { setMission((mission + 1) % MISSIONS.length); setFeedback(null); };

  const Slider = ({ axis, label, value, min, max, step, color }) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label htmlFor={`sl-${axis}`} className="text-[13px] font-semibold text-ink"><span className={cx("font-mono", color)}>{axis}</span> · {label}</label>
        <span className="font-mono text-sm text-ink tabular-nums">{axis === "Y" ? (value === 0 ? "0" : fmt(value)) : value.toLocaleString("fr-FR")} mm</span>
      </div>
      <input id={`sl-${axis}`} type="range" min={min} max={max} step={step} value={value} onChange={(e) => setPos({ ...pos, [axis]: Number(e.target.value) })} className="w-full accent-sky" />
    </div>
  );

  const hlTop = zone === "100" || zone === "200" ? ["cab"] : zone === "pm" ? ["pm"] : zone === "rotor" ? ["rotor"] : zone ? [zone] : [];
  const hlSide = zone === "100" ? ["barque"] : zone === "200" ? ["cabine"] : zone === "pm" ? ["pm"] : zone === "rotor" ? ["rotor"] : zone === "400" ? ["eng"] : zone === "300" ? ["boom"] : zone === "fen" ? ["fen"] : zone === "700" ? ["skid"] : [];
  const px = sx(X), pyT = syTop(Y), pzS = szSide(Z);

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-panel2 px-5 py-3">
        <Crosshair size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Simulateur 2 : le trièdre & diagnostic gamme</h3>
        <span className="ml-auto font-mono text-[11px] text-muted">Hélicoptère bimoteur type H145 / H160 · cotes en mm</span>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="rounded-lg border border-line bg-bg p-2">
            <div className="flex justify-between px-1 font-mono text-[10px] uppercase tracking-wider text-muted"><span>Vue de dessus (plan X-Y)</span><span>X0 en avant du nez →</span></div>
            <svg viewBox={`0 0 ${W} 220`} className="h-auto w-full" role="img" aria-label="Vue de dessus avec point d'intervention">
              <text x="8" y="16" fill="#ffb020" fontSize="10" fontFamily="JetBrains Mono, monospace">+Y DROITE (pair) · place CdB</text>
              <text x="8" y="214" fill="#ffb020" fontSize="10" fontFamily="JetBrains Mono, monospace">−Y GAUCHE (impair)</text>
              <line x1={sx(0)} y1={syTop(0)} x2={sx(HX)} y2={syTop(0)} stroke="#2a3a5c" strokeDasharray="4 4" />
              <line x1={sx(0)} y1="24" x2={sx(0)} y2="200" stroke="#3b9eff" strokeOpacity="0.5" />
              <text x={sx(0) + 3} y="34" fill="#3b9eff" fontSize="9" fontFamily="JetBrains Mono, monospace">X0</text>
              <HeliTop sx={sx} sy={syTop} hl={hlTop} />
              <line x1={px} y1="6" x2={px} y2="214" stroke="#3ddc97" strokeOpacity="0.35" />
              <line x1={PADX} y1={pyT} x2={W - PADX} y2={pyT} stroke="#3ddc97" strokeOpacity="0.35" />
              <circle cx={px} cy={pyT} r="7" fill="none" stroke="#3ddc97" strokeWidth="2" />
              <circle cx={px} cy={pyT} r="2.5" fill="#3ddc97" />
            </svg>
          </div>
          <div className="rounded-lg border border-line bg-bg p-2">
            <div className="flex justify-between px-1 font-mono text-[10px] uppercase tracking-wider text-muted"><span>Vue de côté gauche (plan X-Z)</span><span>← nez · Fenestron →</span></div>
            <svg viewBox={`0 0 ${W} 215`} className="h-auto w-full" role="img" aria-label="Vue de profil avec point d'intervention">
              <line x1={PADX} y1={szSide(0)} x2={W - PADX} y2={szSide(0)} stroke="#2a3a5c" />
              <HeliSide sx={sx} sz={szSide} hl={hlSide} />
              {[[1000, "plancher cabine"], [2300, "plancher mécanique"]].map(([z, l]) => (
                <g key={l}>
                  <line x1={sx(6700)} y1={szSide(z)} x2={sx(7300)} y2={szSide(z)} stroke="#ffb020" strokeOpacity="0.5" strokeDasharray="3 3" />
                  <text x={sx(7400)} y={szSide(z) + 3} fill="#ffb020" fontSize="9" fontFamily="JetBrains Mono, monospace">{l} WL {z.toLocaleString("fr-FR")}</text>
                </g>
              ))}
              <line x1={px} y1="6" x2={px} y2="210" stroke="#3ddc97" strokeOpacity="0.35" />
              <line x1={PADX} y1={pzS} x2={W - PADX} y2={pzS} stroke="#3ddc97" strokeOpacity="0.35" />
              <circle cx={px} cy={pzS} r="7" fill="none" stroke="#3ddc97" strokeWidth="2" />
              <circle cx={px} cy={pzS} r="2.5" fill="#3ddc97" />
            </svg>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3">
            {Slider({ axis: "X", label: "Station (nez → Fenestron)", value: X, min: 0, max: HX, step: 50, color: "text-sky" })}
            {Slider({ axis: "Y", label: "Buttock Line (−gauche / +droite)", value: Y, min: -HY, max: HY, step: 50, color: "text-amber" })}
            {Slider({ axis: "Z", label: "Water Line (barque → tête rotor)", value: Z, min: 0, max: HZ, step: 50, color: "text-ok" })}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[["Long.", fb], ["Latéral", lr], ["Vertical", ud]].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-line bg-bg p-2 text-center">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{k}</div>
                <div className={cx("font-display text-base font-semibold leading-tight", k === "Latéral" ? "text-amber" : "text-ink")}>{v}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-bg p-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Zone estimée</span>
              {sub && <span className="ml-auto font-mono text-xs text-sky">sous-zone type {sub}</span>}
            </div>
            {info ? (
              <>
                <div className="font-display text-xl font-semibold text-sky">{info.tag} · {info.name}</div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted">Chapitres probables</div>
                <div className="mt-1 flex flex-wrap gap-1">{info.ata.map((a) => <span key={a} className="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink/90">{a}</span>)}</div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-amber">Diagnostic gamme · opérations à prévoir</div>
                <ul className="mt-1 flex flex-col gap-1">
                  {info.ops.map((o) => <li key={o} className="flex items-start gap-1.5 text-[13px] text-ink"><Wrench size={12} className="mt-1 shrink-0 text-amber" />{o}</li>)}
                </ul>
              </>
            ) : (
              <div className="mt-1 text-[14px] text-ko">Hors cellule : aucun point d'intervention à ces coordonnées.</div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-panel2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Target size={18} className="text-amber" />
          <span className="font-display text-lg font-semibold text-ink">Mission {mission + 1}/{MISSIONS.length}</span>
          {solved[mission] && <CheckCircle2 size={16} className="text-ok" />}
          <span className="ml-auto font-mono text-xs text-muted">{solvedCount} réussie{solvedCount > 1 ? "s" : ""} · 3 requises pour valider</span>
        </div>
        <p className="mt-2 text-[15px] text-ink">{m.text}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PrimaryButton onClick={checkMission} tone="amber"><Crosshair size={16} /> Vérifier mon point</PrimaryButton>
          <PrimaryButton onClick={nextMission}>Mission suivante <ArrowRight size={16} /></PrimaryButton>
        </div>
        {feedback && <div className={cx("mt-3 rounded-lg border px-3 py-2 text-[13px]", feedback.ok ? "border-ok/50 bg-ok/10 text-ok" : "border-ko/50 bg-ko/10 text-ko")}>{feedback.txt}</div>}
      </div>
    </Panel>
  );
}

function TabAtelier({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Ruler} kicker="Onglet 4 · Atelier pratique" title="Place le point d'intervention, la gamme suit">
        Déplace les curseurs X, Y, Z : le point apparaît sur les deux vues de l'hélicoptère, la zone est estimée et les opérations obligatoires de la gamme s'affichent. Cotes et zonage simplifiés à but pédagogique : la référence reste la documentation du type.
      </SectionHead>
      <TriedreSim onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu sais situer un point d'intervention à partir de ses coordonnées." />
    </div>
  );
}

/* ============================================================
   ONGLET 5 : SPRINT PRÉPARATEUR MÉTHODES (AIRBUS HELICOPTERS)
   ============================================================ */
const QUESTIONS = [
  {
    tag: "ATA 67 · piège", scenario: true,
    q: "Tu rédiges la gamme de montage d'une bielle de pas cyclique sur H145. Quel chapitre ATA et quelle opération de fin de montage ?",
    options: ["ATA 27, auto-contrôle de l'opérateur", "ATA 67, double contrôle croisé par un second opérateur indépendant", "ATA 63, simple vérification visuelle", "ATA 62, essai en vol uniquement"],
    answer: 1,
    why: "Sur hélicoptère, les commandes de vol rotors (timonerie, bielles, guignols, servocommandes) relèvent de l'ATA 67. L'ATA 27 est celui des avions. Un second opérateur qualifié vérifie montage, freinage et sens de débattement.",
    risk: "Une commande inversée ou mal freinée n'est pas toujours visible au sol. Une gamme classée en ATA 27 renvoie de plus vers une documentation qui ne correspond pas à l'appareil.",
  },
  {
    tag: "PR sans pressurisation",
    q: "Un H160 n'est pas pressurisé. Laquelle de ces raisons ne justifie PAS l'application de PR dans une gamme hélicoptère ?",
    options: ["L'étanchéité aux intempéries", "L'étanchéité carburant et fluides", "L'étanchéité de pressurisation cabine", "La protection anticorrosion par interposition"],
    answer: 2,
    why: "Le PR sur hélicoptère sert à l'étanchéité intempéries, carburant et fluides, aux cloisons pare-feu et à l'anticorrosion. Pas à la pressurisation, qui n'existe pas.",
    risk: "Justifier une opération par la pressurisation, c'est copier une gamme avion : contrôles inutiles, et oubli des vraies exigences (drains, pare-feu, galvanique).",
  },
  {
    tag: "Anticorrosion", scenario: true,
    q: "Sur un H175, la gamme assemble un cadre en aluminium contre une peau carbone. Que doit imposer la gamme ?",
    options: ["Un montage à sec pour gagner du temps", "Une interposition (PR ou film isolant) selon l'instruction applicable, contre la corrosion galvanique", "Un simple dégraissage", "Une peinture après montage seulement"],
    answer: 1,
    why: "Aluminium et carbone forment un couple galvanique : sans isolation, l'aluminium se corrode. L'interposition est définie par les instructions EI et le plan.",
    risk: "Corrosion cachée sous la peau carbone, découverte en visite : dépose et réparation structurale lourde.",
  },
  {
    tag: "Pare-feu · ATA 71", scenario: true,
    q: "Tu prépares la pose d'une cloison pare-feu autour d'un turbomoteur Arrano. Quelle exigence est déterminante ?",
    options: ["Utiliser n'importe quel mastic disponible", "Matériau titane ou inox et étanchéité réalisée avec les produits et la méthode imposés", "Supprimer les fixations pour gagner du poids", "Laisser un jeu pour la ventilation"],
    answer: 1,
    why: "Le pare-feu doit contenir un feu moteur. Son matériau et son étanchéité sont qualifiés : le préparateur reprend exactement le produit et la méthode définis.",
    risk: "Un produit d'étanchéité non qualifié ne tient pas au feu : en cas d'incendie moteur, les flammes atteignent la BTP ou la cabine.",
  },
  {
    tag: "Standards AH",
    q: "Le plan Airbus Helicopters indique « Vis ASN xxxx ». De quel référentiel s'agit-il ?",
    options: ["Un chapitre ATA", "Une norme interne historique (Aerospatiale Norme) pour les pièces standard", "Une RG.Aéro du BNAE", "Une spécification S1000D"],
    answer: 1,
    why: "ASN (Aerospatiale Norme) et ECS (Eurocopter Standard) sont les référentiels internes de pièces standard et fixations. Ils coexistent avec les NF L et EN du BNAE.",
    risk: "Remplacer une ASN par une vis du commerce « équivalente » rend la pièce non conforme à la définition : rebut ou dérogation.",
  },
  {
    tag: "Standards AH",
    q: "Où trouves-tu la règle maison Airbus Helicopters qui définit un procédé spécial (méthode de freinage, application PR, métallisation) ?",
    options: ["Dans une instruction EI / EICM", "Dans le zonage ATA 100", "Dans la norme ECS d'une vis", "Dans le certificat de type"],
    answer: 0,
    why: "Les EI / EICM sont les instructions Airbus Helicopters pour les procédés et les règles métier. L'ECS et l'ASN définissent les pièces, pas les procédés.",
    risk: "Un procédé appliqué « de mémoire » sans renvoi à l'EI applicable donne un montage non traçable et souvent hors tolérance.",
  },
  {
    tag: "BNAE",
    q: "La RG.Aéro 000 23, éditée par le BNAE, concerne :",
    options: ["Les couples de serrage", "La gestion de configuration", "Le zonage hélicoptère", "Le Fenestron"],
    answer: 1,
    why: "Les RG.Aéro sont des recommandations générales du BNAE. La RG.Aéro 000 23 porte sur la gestion de configuration : quelle définition exacte est montée sur quel appareil.",
    risk: "Sans gestion de configuration, une pièce d'ancien indice part sur un appareil d'un nouveau standard : appareil non conforme à sa définition certifiée.",
  },
  {
    tag: "Côté · place CdB", scenario: true,
    q: "Sur un H145, le commandant de bord est assis à droite. Un OF indique la sous-zone 211. Où travailles-tu ?",
    options: ["Côté droit, puisque le CdB est à droite", "Côté gauche géométrique de l'appareil (−Y), quelle que soit la place du CdB", "Dans l'axe", "Ça dépend de l'équipage du jour"],
    answer: 1,
    why: "211 se termine par un chiffre impair : gauche. Gauche et droite se lisent assis dans un siège pilote, regard vers l'avant. La place du commandant de bord ne change rien à la géométrie.",
    risk: "Perçage ou pose sur le mauvais côté : trous en trop dans une structure, réparation à faire approuver par le bureau d'études.",
  },
  {
    tag: "Trièdre",
    q: "Sur une cellule d'hélicoptère, l'axe X (stations) va :",
    options: ["Du plancher vers la tête rotor", "De la gauche vers la droite", "Du point zéro en avant du nez vers le Fenestron", "Du Fenestron vers le nez"],
    answer: 2,
    why: "X0 est placé en avant du nez pour que toutes les stations soient positives jusqu'à l'arrière. Z va de la barque vers la tête rotor, Y de gauche à droite.",
    risk: "Une erreur d'axe déplace un couple ou un support sur le papier : incohérence plan / gamme, montage bloqué.",
  },
  {
    tag: "Structure",
    q: "Qu'est-ce qui distingue le plancher mécanique (structure primaire) de la BTP (pièce critique) ?",
    options: ["Rien, ce sont deux pièces critiques", "Le plancher est conçu avec des chemins d'effort redondants ; la BTP n'a aucune redondance et sa défaillance unique est catastrophique", "La BTP est une structure secondaire", "Le plancher mécanique n'a pas besoin de contrôle"],
    answer: 1,
    why: "Une structure fail-safe garde un chemin d'effort si un élément casse. Une pièce critique n'en a pas : d'où la traçabilité totale (série, appairage, serrages enregistrés).",
    risk: "Sans traçabilité, un défaut matière sur un lot de BTP rend impossible l'identification des hélicoptères à immobiliser.",
  },
  {
    tag: "ATA 63",
    q: "À quoi servent les barres de suspension BTP ?",
    options: ["À fixer les capots moteur", "À transmettre la portance du rotor, via la BTP, aux anneaux principaux de la cellule", "À supporter les patins", "À guider la timonerie de commande"],
    answer: 1,
    why: "L'hélicoptère est suspendu à son rotor : la portance passe par le mât, la BTP et les barres de suspension jusqu'aux anneaux principaux. Elles relèvent de l'ATA 63 et sont des pièces critiques.",
    risk: "Une barre mal montée ou mal freinée peut rompre en vol : séparation de l'ensemble rotor-BTP de la cellule.",
  },
  {
    tag: "Vibrations", scenario: true,
    q: "Sur la gamme du plateau cyclique, le freinage d'un écrou de biellette n'est pas précisé. Que fais-tu ?",
    options: ["Serrer au couple maximal, ça suffit", "Mettre le frein filet disponible à l'atelier", "Bloquer l'opération et faire définir le freinage conforme (plan, EI, ATA 20) avant montage", "Laisser tel quel : le contrôle final le verra"],
    answer: 2,
    why: "Sur hélicoptère, chaque fixation a un moyen de freinage défini. Le préparateur ne l'improvise pas : il le fait définir et l'écrit dans la gamme.",
    risk: "Sous vibration rotor, un écrou non freiné se desserre : jeu dans la chaîne de commande et perte de contrôle du pas des pales.",
  },
  {
    tag: "ATA 64",
    q: "Pourquoi le Fenestron d'un H160 a-t-il des pales à espacement irrégulier ?",
    options: ["Pour simplifier l'équilibrage", "Pour réduire le bruit en répartissant ses fréquences", "Pour économiser une pale", "Pour faciliter le démontage"],
    answer: 1,
    why: "Avec un espacement régulier, le bruit se concentre sur une fréquence. L'espacement irrégulier l'étale et le rend moins gênant. Le Fenestron relève de l'ATA 64.",
    risk: "Monter une pale à une position différente de la définition détruit l'équilibrage et le gain acoustique : vibrations et non-conformité.",
  },
  {
    tag: "ATA 65",
    q: "Les arbres de transmission arrière, les paliers intermédiaires et la BTA relèvent de :",
    options: ["ATA 63", "ATA 64", "ATA 65", "ATA 67"],
    answer: 2,
    why: "ATA 65 : entraînement du rotor arrière. ATA 64 : le rotor arrière ou le Fenestron lui-même. ATA 63 : entraînement du rotor principal.",
    risk: "Un mauvais chapitre renvoie le compagnon vers la mauvaise documentation : couples ou jeux d'alignement faux sur les paliers.",
  },
  {
    tag: "ATA 62",
    q: "Le moyeu Starflex d'un H125 relève de quel chapitre ?",
    options: ["ATA 62 · Rotor principal", "ATA 63 · Entraînement rotor principal", "ATA 67 · Commandes de vol", "ATA 53 · Fuselage"],
    answer: 0,
    why: "Pales, moyeu (Starflex, Spheriflex) et amortisseurs de traînée relèvent de l'ATA 62. Le mât et la BTP relèvent de l'ATA 63.",
    risk: "Le moyeu est une pièce critique : un classement erroné peut faire perdre les exigences de traçabilité associées.",
  },
  {
    tag: "ATA 28", scenario: true,
    q: "Intervention dans le réservoir sous plancher d'un H160. Quelle séquence est indispensable ?",
    options: ["Aucune précaution particulière", "Inventaire outillage entrée / sortie (FOD), étanchéité PR carburant, contrôle de continuité électrique", "Uniquement un nettoyage final", "Une peinture de protection"],
    answer: 1,
    why: "En zone carburant, le risque FOD est maximal, l'étanchéité utilise un PR spécifique carburant et la continuité électrique évite l'accumulation de charges statiques.",
    risk: "Un outil oublié peut obstruer une pompe ; une fixation sans continuité électrique peut provoquer un arc dans les vapeurs de carburant.",
  },
  {
    tag: "Mécanique du vol",
    q: "Le pilote tire le levier de pas collectif. Que se passe-t-il, et que doit-il compenser ?",
    options: ["L'hélico translate ; rien à compenser", "L'hélico monte ; il compense l'augmentation du couple aux palonniers (anticouple)", "L'hélico tourne sur lui-même ; il compense au cyclique", "Le rotor ralentit ; il compense à la manette"],
    answer: 1,
    why: "Plus de pas collectif = plus de portance, mais aussi plus de couple absorbé : le fuselage tend à tourner en sens inverse du rotor, d'où l'action aux palonniers.",
    risk: "Confondre collectif et cyclique dans une gamme de réglage du plateau cyclique fausse les débattements : réglage non conforme au point fixe.",
  },
];

function TabSprint({ done, onComplete, onScore }) {
  const [order, setOrder] = useState(() => shuffle(QUESTIONS.map((_, i) => i)));
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
    setPos(0); setPicked(null); setHistory([]); setStreak(0); setBest(0); setStarted(true);
  };

  const relTone = reliability >= 85 ? "text-ok" : reliability >= 65 ? "text-amber" : "text-ko";
  const letters = ["A", "B", "C", "D"];

  if (!started) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHead icon={Trophy} kicker="Onglet 5 · Évaluation" title="Sprint Préparateur Méthodes Hélicoptère">
          {QUESTIONS.length} questions tirées au hasard, théorie et mises en situation en atelier Airbus Helicopters. Après chaque réponse, une explication technique te montre pourquoi c'est juste, et ce que l'erreur aurait provoqué sur chaîne.
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
          {q.options.map((o, k) => {
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
                <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs font-semibold", state === "good" ? "bg-ok text-bg" : state === "bad" ? "bg-ko text-bg" : "bg-line text-ink")}>{letters[k]}</span>
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
  { id: "vol", short: "Mécanique du vol", n: "1", icon: Fan, rule: "Réussir le contrôle de fin d'onglet" },
  { id: "reperer", short: "Se repérer", n: "2", icon: Compass, rule: "Classer correctement les 11 pièces" },
  { id: "systemes", short: "Systèmes & normes", n: "3", icon: BookOpen, rule: "Traiter les 7 OF du décodeur" },
  { id: "atelier", short: "Atelier trièdre", n: "4", icon: Crosshair, rule: "Réussir 3 missions de placement" },
  { id: "sprint", short: "Sprint évaluation", n: "5", icon: Trophy, rule: "Finir le sprint avec 85 % ou plus" },
];

export default function App({ onSaveScore, onBack, student } = {}) {
  const [tab, setTab] = useState("vol");
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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky/50 bg-sky/10"><Fan size={18} className="text-sky" /></div>
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Bureau des Méthodes · Airbus Helicopters · Module 1</div>
              <h1 className="font-display text-xl font-semibold leading-none text-ink sm:text-2xl">Préparateur Méthodes Assemblage Hélicoptère</h1>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Modules validés</div>
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

        {tab === "vol" && <TabFlight done={progress.vol} onComplete={complete("vol")} />}
        {tab === "reperer" && <TabLocate done={progress.reperer} onComplete={complete("reperer")} />}
        {tab === "systemes" && <TabSystems done={progress.systemes} onComplete={complete("systemes")} />}
        {tab === "atelier" && <TabAtelier done={progress.atelier} onComplete={complete("atelier")} />}
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
