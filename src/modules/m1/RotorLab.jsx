/* ============================================================
   M1 · MINI-SIMULATEUR ROTOR : silhouette de profil (nez à gauche)
   + coupe technique mât / plateau cyclique animée (ATA 62 / 63 / 67).
   Convention : cyclique vers l'AVANT = disque et poussée inclinés vers le NEZ.
   Schéma de principe : cinématique simplifiée, valeurs non contractuelles.
   ============================================================ */
import React, { useState } from "react";
import { Fan } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");
const K = { line: "#5b7299", thin: "#3a4c70", fill: "#16223a", fill2: "#1b2a47", hl: "#3b9eff", ok: "#3ddc97", amber: "#ffb020", ko: "#ff5d6c", txt: "#8fa0bd", ink: "#e6edf7", metal: "#9fb3d1", metal2: "#c8d6ea", violet: "#a78bfa" };
const MONO = "JetBrains Mono, monospace";
const deg = (a) => (a * Math.PI) / 180;
const fr = (n, d = 1) => n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------- silhouette de profil, style plan ---------- */
function HeliProfile({ collectif, cyclique, anticouple }) {
  const tilt = cyclique * 1.8; /* degrés, positif = disque incliné vers le nez (gauche) */
  const pitchBody = -cyclique * 0.9; /* l'appareil pique légèrement du nez en translation avant */
  const hx = 190, hy = 80, half = 142;
  const a = deg(tilt);
  const x1 = hx - half * Math.cos(a), y1 = hy + half * Math.sin(a); /* extrémité avant (nez) plus basse */
  const x2 = hx + half * Math.cos(a), y2 = hy - half * Math.sin(a);
  const thrust = 26 + collectif * 3;
  const tx = hx - thrust * Math.sin(a), ty = hy - thrust * Math.cos(a); /* poussée perpendiculaire au disque */
  return (
    <svg viewBox="0 0 420 240" className="h-auto w-full" role="img" aria-label="Hélicoptère de profil, nez à gauche, disque rotor et vecteur poussée">
      <defs>
        <marker id="rl-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={K.ok} /></marker>
        <marker id="rl-arrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={K.amber} /></marker>
        <pattern id="rl-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20,0 H0 V20" fill="none" stroke="#141f35" strokeWidth="1" /></pattern>
      </defs>
      <rect width="420" height="240" fill="url(#rl-grid)" />
      <line x1="0" y1="214" x2="420" y2="214" stroke={K.thin} strokeWidth="1.5" />
      <g transform={`rotate(${pitchBody} ${hx} 150)`}>
        {/* fuselage */}
        <path d="M58,152 C58,122 88,104 136,100 L248,98 C268,98 284,110 290,124 L384,130 L394,106 L406,106 L400,152 L292,152 C286,172 262,180 232,180 L110,180 C80,180 58,170 58,152 Z" fill={K.fill} stroke={K.line} strokeWidth="1.3" />
        <path d="M70,142 C74,120 96,107 130,105 L132,142 Z" fill="#132a46" stroke={K.line} strokeWidth="1" />
        <line x1="150" y1="104" x2="150" y2="178" stroke={K.thin} strokeDasharray="3 3" />
        <line x1="240" y1="100" x2="240" y2="178" stroke={K.thin} strokeDasharray="3 3" />
        {/* capotage moteurs + BTP */}
        <path d="M160,100 C165,88 220,86 236,98" fill={K.fill2} stroke={K.line} strokeWidth="1" />
        <rect x={hx - 4} y={hy} width="8" height="16" fill={K.metal} stroke={K.line} />
        {/* Fenestron */}
        <circle cx="392" cy="128" r="11" fill="none" stroke={K.line} />
        <circle cx="392" cy="128" r={5 + anticouple * 0.45} fill="none" stroke={K.amber} strokeWidth="1.2" strokeDasharray="3 2" />
        {/* patins */}
        <line x1="96" y1="196" x2="262" y2="196" stroke={K.line} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M84,190 Q88,196 96,196" fill="none" stroke={K.line} strokeWidth="2.5" />
        <line x1="128" y1="180" x2="122" y2="196" stroke={K.line} strokeWidth="2" /><line x1="230" y1="180" x2="236" y2="196" stroke={K.line} strokeWidth="2" />
      </g>
      {/* disque rotor et poussée */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={K.hl} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx={hx} cy={hy} rx="5" ry="5" fill={K.ink} />
      <line x1={hx} y1={hy} x2={tx} y2={ty} stroke={K.ok} strokeWidth="3" markerEnd="url(#rl-arr)" />
      {Math.abs(cyclique) > 0 && <line x1={hx} y1={hy + 2} x2={hx - Math.sign(cyclique) * (12 + Math.abs(cyclique) * 6)} y2={hy + 2} stroke={K.amber} strokeWidth="1.6" strokeDasharray="4 3" markerEnd="url(#rl-arrA)" />}
      <text x="10" y="20" fill={K.txt} fontSize="11" fontFamily={MONO}>← AVANT (nez)</text>
      <text x="10" y="36" fill={K.ok} fontSize="11" fontFamily={MONO}>poussée ⟂ disque</text>
      {Math.abs(cyclique) > 0 && <text x="10" y="52" fill={K.amber} fontSize="11" fontFamily={MONO}>composante horizontale</text>}
      <text x="300" y="232" fill={K.txt} fontSize="10" fontFamily={MONO}>disque : {tilt > 0 ? "+" : ""}{fr(tilt)}°</text>
    </svg>
  );
}

/* ---------- coupe technique mât + plateau cyclique ---------- */
function SwashSection({ collectif, cyclique }) {
  const C = 240;                      /* axe du mât */
  const sy = 162 - collectif * 2.5;   /* centre de la rotule : le collectif fait coulisser le plateau */
  const a = -cyclique * 2;            /* inclinaison du plateau (°), avant = côté gauche plus bas */
  const ar = deg(a);
  const P = (dx, dy) => [C + dx * Math.cos(ar) - dy * Math.sin(ar), sy + dx * Math.sin(ar) + dy * Math.cos(ar)];
  const L = 51;                       /* longueur des biellettes de pas */
  const topL = P(-55, -10), topR = P(55, -10);
  const levL = topL[1] - L, levR = topR[1] - L;
  const pitch = (ly) => 8 + (80 - ly) * 0.35;
  const pL = pitch(levL), pR = pitch(levR);
  const atL = P(-65, 10), atR = P(65, 10), atC = P(0, 10);
  const scis = P(22, -10);
  const blade = (x, p, flip) => (
    <g transform={`translate(${x} 53) rotate(${flip ? p : -p})`}>
      <path d="M-22,0 C-14,-6 8,-5 22,0 C8,3 -14,3 -22,0 Z" fill={K.fill2} stroke={K.hl} strokeWidth="1.2" />
    </g>
  );
  const lab = (x, y, tx, ty, t, anchor = "start", c = K.txt) => (
    <g>
      <line x1={x} y1={y} x2={anchor === "start" ? tx + t.length * 5.45 + 8 : tx - t.length * 5.45 - 8} y2={ty} stroke={K.thin} strokeWidth="0.8" />
      <circle cx={x} cy={y} r="1.8" fill={c} />
      <text x={tx + (anchor === "start" ? 3 : -3)} y={ty + 3.5} fontSize="9" fontFamily={MONO} fill={c} textAnchor={anchor}>{t}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 480 320" className="svg-halo h-auto w-full" role="img" aria-label="Coupe du mât rotor et du plateau cyclique animée">
      <defs>
        <pattern id="rl-h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#2e4168" strokeWidth="1" /></pattern>
      </defs>
      <rect width="480" height="320" fill="#0d1526" />
      {/* carter BTP */}
      <path d={`M${C - 80},266 H${C + 80} L${C + 100},312 H${C - 100} Z`} fill={K.fill2} stroke={K.line} strokeWidth="1.3" />
      <path d={`M${C - 80},266 H${C + 80} L${C + 100},312 H${C - 100} Z`} fill="url(#rl-h)" />
      {/* mât */}
      <rect x={C - 8} y="46" width="16" height="222" fill={K.fill} stroke={K.metal} strokeWidth="1.2" />
      <line x1={C} y1="40" x2={C} y2="300" stroke={K.thin} strokeDasharray="10 3 2 3" />
      {/* guide de la rotule coulissante */}
      <rect x={C - 12} y="104" width="24" height="76" fill="none" stroke={K.thin} strokeDasharray="3 3" />
      {/* moyeu + pales */}
      <rect x={C - 70} y="46" width="140" height="14" rx="3" fill={K.fill2} stroke={K.metal} strokeWidth="1.3" />
      <line x1={C - 70} y1="53" x2="40" y2="53" stroke={K.line} strokeWidth="3" /><line x1={C + 70} y1="53" x2="440" y2="53" stroke={K.line} strokeWidth="3" />
      {blade(60, pL, false)}{blade(420, pR, true)}
      <text x="60" y="80" fontSize="10" fontFamily={MONO} fill={K.hl} textAnchor="middle">pas {fr(pL)}°</text>
      <text x="420" y="80" fontSize="10" fontFamily={MONO} fill={K.hl} textAnchor="middle">pas {fr(pR)}°</text>
      {/* leviers de pas */}
      <line x1={C - 75} y1="58" x2={C - 55} y2={levL} stroke={K.metal2} strokeWidth="3" strokeLinecap="round" />
      <line x1={C + 75} y1="58" x2={C + 55} y2={levR} stroke={K.metal2} strokeWidth="3" strokeLinecap="round" />
      {/* biellettes de pas */}
      <line x1={C - 55} y1={levL} x2={topL[0]} y2={topL[1]} stroke={K.amber} strokeWidth="3" />
      <line x1={C + 55} y1={levR} x2={topR[0]} y2={topR[1]} stroke={K.amber} strokeWidth="3" />
      {[[C - 55, levL], [C + 55, levR], topL, topR].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={K.fill} stroke={K.amber} strokeWidth="1.3" />)}
      {/* compas d'entraînement */}
      <polyline points={`${C + 8},98 ${C + 34},${(98 + scis[1]) / 2} ${scis[0]},${scis[1]}`} fill="none" stroke={K.violet} strokeWidth="2.2" />
      {/* plateau cyclique (repère incliné) */}
      <g transform={`translate(${C} ${sy}) rotate(${a})`}>
        <rect x="-58" y="-10" width="116" height="9" rx="2" fill="#1e3a5f" stroke={K.hl} strokeWidth="1.3" />
        {[-34, -12, 12, 34].map((x) => <circle key={x} cx={x} cy="0.5" r="2.4" fill={K.metal2} stroke={K.line} strokeWidth="0.6" />)}
        <rect x="-65" y="1.5" width="130" height="10" rx="2" fill={K.fill2} stroke={K.metal} strokeWidth="1.3" />
        <circle cx="0" cy="1" r="11" fill={K.fill} stroke={K.metal2} strokeWidth="1.4" />
      </g>
      {/* servocommandes (2 visibles, 1 masquée à l'arrière) */}
      {[[C - 72, atL], [C + 72, atR]].map(([bx, at], i) => (
        <g key={i}>
          <rect x={bx - 8} y="216" width="16" height="50" rx="3" fill={K.fill2} stroke={K.line} strokeWidth="1.3" />
          <line x1={bx} y1="216" x2={at[0]} y2={at[1]} stroke={K.metal2} strokeWidth="3.5" />
          <circle cx={at[0]} cy={at[1]} r="3" fill={K.fill} stroke={K.metal2} />
        </g>
      ))}
      <rect x={C + 16} y="222" width="14" height="44" rx="3" fill="none" stroke={K.line} strokeDasharray="3 2" />
      <line x1={C + 23} y1="222" x2={atC[0] + 18} y2={atC[1]} stroke={K.line} strokeDasharray="3 2" strokeWidth="1.6" />
      {/* nomenclature du schéma */}
      {lab(C - 40, 50, 12, 20, "Moyeu Starflex / Spheriflex (ATA 62)")}
      {lab(C - 63, (58 + levL) / 2, 12, 104, "Levier de pas")}
      {lab((C - 55 + topL[0]) / 2, (levL + topL[1]) / 2, 12, 124, "Biellette de pas (ATA 67)", "start", K.amber)}
      {lab(P(-40, -6)[0], P(-40, -6)[1], 12, 150, "Étoile tournante", "start", K.hl)}
      {lab(P(-34, 0.5)[0], P(-34, 0.5)[1], 12, 170, "Roulement inter-étoiles")}
      {lab(P(-50, 8)[0], P(-50, 8)[1], 12, 192, "Étoile fixe (non tournante)")}
      {lab(C - 72, 240, 12, 236, "Servocommande ×3 (ATA 67)")}
      {lab(C - 60, 290, 12, 300, "Carter BTP (ATA 63)")}
      {lab(C + 8, 70, 468, 30, "Mât rotor (ATA 63)", "end")}
      {lab(C + 30, (98 + scis[1]) / 2, 468, 112, "Compas d'entraînement", "end", K.violet)}
      {lab(C + 9, sy + 1, 468, 160, "Rotule coulissante", "end")}
      {lab(C + 23, 250, 468, 252, "3e servo (masquée)", "end")}
    </svg>
  );
}

export default function RotorSim() {
  const [collectif, setCollectif] = useState(8);
  const [cyclique, setCyclique] = useState(0);
  const [anticouple, setAnticouple] = useState(8);
  const vertical = collectif > 10 ? "Montée" : collectif < 6 ? "Descente" : "Stationnaire";
  const horizontal = cyclique > 0 ? "Translation vers l'avant" : cyclique < 0 ? "Translation vers l'arrière" : "Pas de translation";
  const torqueDelta = collectif - anticouple;
  const yaw = Math.abs(torqueDelta) <= 1
    ? { txt: "Cap stable : le couple du rotor principal est compensé.", tone: "text-ok" }
    : torqueDelta > 1
      ? { txt: "Le fuselage part en lacet dans le sens inverse du rotor : anticouple insuffisant.", tone: "text-ko" }
      : { txt: "Le fuselage tourne dans le sens du rotor : excès d'anticouple.", tone: "text-amber" };
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
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="mb-3 flex items-center gap-2">
        <Fan size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Mini-simulateur : plateau cyclique et disque rotor</h3>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-lg border border-line"><HeliProfile collectif={collectif} cyclique={cyclique} anticouple={anticouple} /></div>
        <div className="min-w-0 overflow-hidden rounded-lg border border-line"><SwashSection collectif={collectif} cyclique={cyclique} /></div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
        {Slider({ id: "collectif", label: "Pas général (collectif)", value: collectif, min: 0, max: 16, unit: "°", onChange: setCollectif, left: "Descendre", right: "Monter" })}
        {Slider({ id: "cyclique", label: "Pas cyclique (longitudinal)", value: cyclique, min: -6, max: 6, unit: "", onChange: setCyclique, left: "Arrière", right: "Avant" })}
        {Slider({ id: "anticouple", label: "Fenestron (palonnier)", value: anticouple, min: 0, max: 16, unit: "", onChange: setAnticouple, left: "Faible", right: "Fort" })}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-bg p-3"><div className="font-mono text-[10px] uppercase tracking-wider text-muted">Vertical</div><div className="font-display text-lg font-semibold text-ink">{vertical}</div></div>
        <div className="rounded-lg border border-line bg-bg p-3"><div className="font-mono text-[10px] uppercase tracking-wider text-muted">Horizontal</div><div className="font-display text-lg font-semibold text-ink">{horizontal}</div></div>
        <div className={cx("rounded-lg border border-line bg-bg p-3 text-[13px] font-medium", yaw.tone)}>{yaw.txt}</div>
      </div>
      <div className="mt-4 grid gap-3 text-[13px] leading-relaxed text-ink/85 md:grid-cols-3">
        <p><strong className="text-ink">Collectif :</strong> les 3 servocommandes poussent ensemble, tout le plateau coulisse le long du mât sur sa rotule. Les biellettes montent du même coup : le pas de toutes les pales augmente de la même valeur.</p>
        <p><strong className="text-ink">Cyclique :</strong> les servocommandes poussent différemment, le plateau s'incline. Le pas de chaque pale varie au cours du tour, le disque s'incline <strong>vers le nez</strong> pour aller vers l'avant, et la poussée gagne une composante horizontale.</p>
        <p><strong className="text-ink">Couple :</strong> plus de collectif, c'est plus de puissance absorbée et plus de couple de réaction sur le fuselage. L'anticouple (Fenestron) doit suivre chaque variation de puissance.</p>
      </div>
      <p className="mt-3 font-mono text-[11px] text-muted">Schéma de principe : en réalité le disque s'incline avec un déphasage d'environ 90° sur l'ordre de pas (précession), compensé par le calage des biellettes. Valeurs non contractuelles.</p>
    </div>
  );
}
