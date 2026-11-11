/* ============================================================
   M2 · CATALOGUE VISUEL DE LA QUINCAILLERIE & DES PROCÉDÉS AÉRO
   8 fiches techniques : coupe AVANT / PENDANT / APRÈS la pose,
   emploi exact, critères de contrôle qualité et défauts de rebut.
   Dessins de principe (non à l'échelle) : la norme et l'EI font foi.
   ============================================================ */
import React, { useState } from "react";
import { CheckCircle2, XCircle, Wrench, Info } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");
const K = { plate: "#1b2a47", plate2: "#24304a", edge: "#5b7299", hatch: "#2e4168", metal: "#9fb3d1", metal2: "#c8d6ea", steel: "#7f95b8", dark: "#0b1220", sky: "#3b9eff", amber: "#ffb020", ok: "#3ddc97", ko: "#ff5d6c", txt: "#8fa0bd", pr: "#c4a7ff", lead: "#3a4c70", tool: "#3a4c70" };
const MONO = "JetBrains Mono, monospace";
const TAN50 = 0.839; /* demi-angle de fraisure 100° : profondeur = (Øtête - Øfût) / 2 / tan 50° */

/* ---------- briques de dessin ---------- */
function Defs() {
  return (
    <defs>
      <pattern id="qh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke={K.hatch} strokeWidth="1.2" /></pattern>
      <pattern id="qh2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="6" stroke={K.hatch} strokeWidth="1.2" /></pattern>
      <pattern id="qs" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#00000055" strokeWidth="1" /></pattern>
      <marker id="qa" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill={K.amber} /></marker>
    </defs>
  );
}
/* Empilage de deux tôles percées (trou centré en cx, largeur w), fraisure 100° optionnelle (csk = Ø en surface) */
function Stack({ y = 80, t1 = 20, t2 = 20, w = 20, cx: c = 120, gap = 0, csk = 0, pr = false, L = 30, R = 210 }) {
  const a = c - w / 2, b = c + w / 2;
  const d = csk > w ? ((csk - w) / 2) * TAN50 : 0;
  const ca = csk > w ? c - csk / 2 : a, cb = csk > w ? c + csk / 2 : b;
  const top = `M${L},${y} H${ca} L${a},${y + d} V${y + t1} H${L} Z M${R},${y} H${cb} L${b},${y + d} V${y + t1} H${R} Z`;
  const y2 = y + t1 + gap;
  const bot = `M${L},${y2} H${a} V${y2 + t2} H${L} Z M${R},${y2} H${b} V${y2 + t2} H${R} Z`;
  return (
    <g>
      <path d={top} fill={K.plate} stroke={K.edge} /><path d={top} fill="url(#qh)" />
      <path d={bot} fill={K.plate2} stroke={K.edge} /><path d={bot} fill="url(#qh2)" />
      {pr && <path d={`M${L},${y + t1 - 1} H${a} V${y + t1 + 2} H${L} Z M${R},${y + t1 - 1} H${b} V${y + t1 + 2} H${R} Z`} fill={K.pr} />}
    </g>
  );
}
const Label = ({ x, y, children, c = K.txt, a = "start", w }) => <text x={x} y={y} fontSize="8.6" fontFamily={MONO} fill={c} textAnchor={a} fontWeight={w}>{children}</text>;
const Lead = ({ x1, y1, x2, y2 }) => <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={K.lead} strokeWidth="0.9" /><circle cx={x2} cy={y2} r="1.4" fill={K.txt} /></g>;
const Arrow = ({ x1, y1, x2, y2, c = K.amber }) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="1.6" markerEnd="url(#qa)" />;
const Dim = ({ x, y1, y2, c = K.amber }) => <g stroke={c} strokeWidth="0.9"><line x1={x} y1={y1} x2={x} y2={y2} /><line x1={x - 4} y1={y1} x2={x + 4} y2={y1} /><line x1={x - 4} y1={y2} x2={x + 4} y2={y2} /></g>;
const HDim = ({ y, x1, x2, c = K.amber }) => <g stroke={c} strokeWidth="0.9"><line x1={x1} y1={y} x2={x2} y2={y} /><line x1={x1} y1={y - 4} x2={x1} y2={y + 4} /><line x1={x2} y1={y - 4} x2={x2} y2={y + 4} /></g>;
/* Filetage net : profil en dents de scie sur les deux génératrices + crêtes inclinées */
function ThreadZ({ x, y, w, h, p = 3.2, fill = K.metal2 }) {
  const n = Math.floor(h / (p / 2));
  const R = [], Lp = [];
  for (let i = 0; i <= n; i++) {
    const yy = y + i * (p / 2), off = i % 2 ? 1.6 : 0;
    R.push(`${(x + w - off).toFixed(1)},${yy.toFixed(1)}`);
    Lp.unshift(`${(x + off).toFixed(1)},${(yy + p / 4).toFixed(1)}`);
  }
  const yEnd = y + n * (p / 2);
  return (
    <g>
      <path d={`M${x},${y} L${R.join(" L")} L${x + w},${yEnd} L${x},${yEnd} L${Lp.join(" L")} Z`} fill={fill} stroke={K.edge} strokeWidth="0.8" />
      {Array.from({ length: Math.floor(h / p) }, (_, i) => <line key={i} x1={x + 1.6} y1={y + i * p + 0.8} x2={x + w - 1.6} y2={y + i * p + 2.4} stroke={K.edge} strokeWidth="0.6" />)}
    </g>
  );
}
/* Tête fraisée 100° */
const CskHead = ({ c = 120, y, top = 36, w = 20, fill = K.metal }) => {
  const d = ((top - w) / 2) * TAN50;
  return <polygon points={`${c - top / 2},${y} ${c + top / 2},${y} ${c + w / 2},${y + d} ${c - w / 2},${y + d}`} fill={fill} stroke={K.edge} />;
};
const cskDepth = (top, w) => ((top - w) / 2) * TAN50;
function Frame({ children, title }) {
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label={title} data-quinc="1">
      <Defs />
      <rect x="0.5" y="0.5" width="319" height="199" rx="6" fill="#0d1526" stroke="#22304d" />
      {children}
    </svg>
  );
}

/* ---------- 1. Hi-Lok / Hi-Lite ---------- */
/* tige : tête fraisée 100°, fût lisse, filetage, empreinte six pans en bout */
function HlPin({ y0, shank = 40, thread = 30, wet = false }) {
  const d = cskDepth(36, 20);
  return (
    <g>
      <CskHead y={y0} />
      <rect x="110" y={y0 + d} width="20" height={shank - d} fill={K.metal} stroke={K.edge} />
      <rect x="110" y={y0 + d} width="20" height={shank - d} fill="url(#qs)" opacity="0.4" />
      {wet && <><rect x="107.5" y={y0 + d + 2} width="3" height={shank - d - 6} fill={K.pr} /><rect x="129.5" y={y0 + d + 2} width="3" height={shank - d - 6} fill={K.pr} /></>}
      <ThreadZ x={111} y={y0 + shank} w={18} h={thread} />
      <path d={`M116,${y0 + shank + thread} V${y0 + shank + thread - 9} H124 V${y0 + shank + thread}`} fill={K.dark} stroke={K.edge} strokeDasharray="2 1.5" strokeWidth="0.8" />
    </g>
  );
}
/* collier Hi-Lok : base à collerette (reste en place) + gorge de rupture + six pans de manœuvre */
function HlCollar({ c = 120, y, broken = false, ghost = false }) {
  return (
    <g opacity={ghost ? 0.9 : 1}>
      <path d={`M${c - 18},${y} H${c + 18} V${y + 4} H${c + 15} V${y + 12} H${c - 15} V${y + 4} H${c - 18} Z`} fill={K.sky} stroke="#8fd0ff" strokeWidth="0.8" />
      {!broken && <>
        <rect x={c - 9} y={y + 12} width="18" height="2.5" fill={K.ko} />
        <rect x={c - 14} y={y + 14.5} width="28" height="14" fill={K.sky} opacity="0.8" stroke="#8fd0ff" strokeWidth="0.8" />
        <line x1={c - 5} x2={c - 5} y1={y + 14.5} y2={y + 28.5} stroke="#8fd0ff" strokeWidth="0.6" /><line x1={c + 5} x2={c + 5} y1={y + 14.5} y2={y + 28.5} stroke="#8fd0ff" strokeWidth="0.6" />
      </>}
      {broken && <path d={`M${c - 9},${y + 12} l3,1.5 l3,-1.5 l3,1.5 l3,-1.5 l3,1.5`} fill="none" stroke={K.ok} strokeWidth="1" />}
    </g>
  );
}
const HL = {
  avant: () => (<Frame title="Hi-Lok avant pose">
    <Stack y={86} csk={36} />
    <HlPin y0={52} wet />
    <HlCollar c={262} y={40} />
    <Dim x={224} y1={86} y2={126} /><Label x={230} y={110} c={K.amber}>E</Label>
    <Lead x1={95} y1={28} x2={108} y2={70} /><Label x={16} y={26} c={K.pr}>fût enduit de PR</Label>
    <Label x={226} y={84} c={K.sky}>collier</Label>
    <Lead x1={78} y1={150} x2={104} y2={90} /><Label x={16} y={160}>fraisure 100°</Label>
    <Label x={16} y={178} c={K.amber}>grip lu à la jauge selon E</Label>
  </Frame>),
  pendant: () => (<Frame title="Hi-Lok pendant le serrage">
    <Stack y={70} csk={36} />
    <HlPin y0={70} shank={40} thread={34} />
    <HlCollar y={110} />
    <rect x="117" y="143" width="6" height="36" fill={K.amber} stroke={K.dark} strokeWidth="0.6" />
    <path d="M152,140 a32,9 0 1,1 -64,0" fill="none" stroke={K.amber} strokeWidth="1.6" markerEnd="url(#qa)" />
    <Lead x1={160} y1={104} x2={136} y2={112} /><Label x={164} y={107} c={K.sky}>collier (reste)</Label>
    <Lead x1={160} y1={121} x2={128} y2={123} /><Label x={164} y={124} c={K.ko}>gorge de rupture</Label>
    <Lead x1={160} y1={137} x2={142} y2={132} /><Label x={164} y={140}>six pans de manœuvre</Label>
    <Label x={130} y={176} c={K.amber}>clé six pans : tient la tige</Label>
    <Label x={16} y={40}>clé de pose : entraîne le six pans</Label>
  </Frame>),
  apres: () => (<Frame title="Hi-Lok après pose">
    <Stack y={70} csk={36} />
    <HlPin y0={70} shank={40} thread={24} />
    <HlCollar y={110} broken />
    <Dim x={140} y1={122} y2={134} c={K.ok} /><Label x={148} y={132} c={K.ok}>dépassement P dans la jauge</Label>
    <g transform="translate(226,150) rotate(22)"><rect x="-14" y="-7" width="28" height="14" fill={K.sky} opacity="0.5" stroke="#8fd0ff" strokeWidth="0.8" /><path d="M-9,-7 l3,-1.5 l3,1.5 l3,-1.5 l3,1.5 l3,-1.5" fill="none" stroke={K.ko} /></g>
    <Label x={186} y={178}>six pans cassé, évacué</Label>
    <Label x={16} y={52} c={K.ok}>tête affleurante, 0 jeu sous tête</Label>
    <Lead x1={84} y1={160} x2={110} y2={126} /><Label x={16} y={170} c={K.ok}>cassure nette à la gorge</Label>
  </Frame>),
};

/* ---------- 2. Lockbolt ---------- */
/* fût à gorges annulaires arrondies, gorge de rupture en V, pintail à dents de traction */
const grooves = (x, y, w, n, pitch = 6) => {
  let L = `M${x},${y}`, R = `M${x + w},${y}`;
  for (let i = 0; i < n; i++) { const yy = y + i * pitch; L += ` V${yy + 1} q2.6,${pitch / 2 - 1} 0,${pitch - 2}`; R += ` V${yy + 1} q-2.6,${pitch / 2 - 1} 0,${pitch - 2}`; }
  return { L, R, end: y + n * pitch };
};
function LbPin({ y = 70, pintail = true, csk = true }) {
  const d = cskDepth(36, 20);
  const g = grooves(110, y + 40, 20, 4);
  return (
    <g>
      {csk ? <CskHead y={y} /> : <path d={`M100,${y} q20,-14 40,0 Z`} fill={K.metal} stroke={K.edge} />}
      <rect x="110" y={y + (csk ? d : 0)} width="20" height={40 - (csk ? d : 0)} fill={K.metal} stroke={K.edge} />
      <path d={`${g.L} V${g.end} H${130} V${y + 40} H110 Z`} fill={K.metal} />
      <path d={g.L} fill="none" stroke={K.edge} /><path d={g.R} fill="none" stroke={K.edge} />
      <path d={`M110,${g.end} L116,${g.end + 4} H124 L130,${g.end} Z`} fill={K.metal} stroke={K.edge} />
      {pintail && <>
        <rect x="116" y={g.end + 4} width="8" height="2" fill={K.ko} />
        <path d={`M116,${g.end + 6} L111,${g.end + 10} V${g.end + 44} H129 V${g.end + 10} L124,${g.end + 6} Z`} fill={K.metal2} stroke={K.edge} />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M111,${g.end + 14 + i * 5} l3,3 M129,${g.end + 14 + i * 5} l-3,3`} stroke={K.edge} />)}
      </>}
    </g>
  );
}
const LB = {
  avant: () => (<Frame title="Lockbolt avant pose">
    <Stack y={70} csk={36} />
    <LbPin y={70} />
    <path d="M244,128 H272 V132 H276 V156 H240 V132 H244 Z" fill={K.sky} opacity="0.8" stroke="#8fd0ff" strokeWidth="0.8" />
    <Label x={234} y={172} c={K.sky}>collier lisse</Label>
    <Lead x1={150} y1={118} x2={130} y2={120} /><Label x={152} y={121}>gorges de blocage</Label>
    <Lead x1={150} y1={136} x2={126} y2={136} /><Label x={152} y={139} c={K.ko}>gorge de rupture</Label>
    <Lead x1={150} y1={160} x2={129} y2={160} /><Label x={152} y={163}>pintail (traction)</Label>
    <Label x={16} y={40}>fraisure 100° · fût lisse calibré</Label>
  </Frame>),
  pendant: () => (<Frame title="Lockbolt pendant le sertissage">
    <Stack y={70} csk={36} />
    <LbPin y={70} />
    <path d="M104,110 H136 V118 L134,134 H106 L104,118 Z" fill={K.sky} opacity="0.85" stroke="#8fd0ff" strokeWidth="0.8" />
    <path d="M88,124 H103 L106,134 V150 H88 Z M152,124 H137 L134,134 V150 H152 Z" fill={K.tool} stroke={K.edge} />
    <Arrow x1={120} y1={160} x2={120} y2={182} /><Arrow x1={80} y1={160} x2={80} y2={136} />
    <Lead x1={158} y1={118} x2={136} y2={116} /><Label x={160} y={121} c={K.sky}>collier en cours de filage</Label>
    <Lead x1={158} y1={140} x2={150} y2={140} /><Label x={160} y={143}>enclume de l'outil</Label>
    <Label x={128} y={180} c={K.amber}>traction du pintail</Label>
    <Label x={16} y={40}>l'enclume file le collier dans les gorges</Label>
  </Frame>),
  apres: () => (<Frame title="Lockbolt après pose">
    <Stack y={70} csk={36} />
    <LbPin y={70} pintail={false} />
    <path d="M104,110 H136 V114 L133,134 H107 L104,114 Z" fill={K.sky} opacity="0.85" stroke="#8fd0ff" strokeWidth="0.8" />
    {[0, 1, 2].map((i) => <path key={i} d={`M110,${117 + i * 6} q2,2 0,4 M130,${117 + i * 6} q-2,2 0,4`} stroke={K.dark} />)}
    <path d="M116,134 l2,2 l2,-2 l2,2 l2,-2" fill="none" stroke={K.ok} />
    <Lead x1={150} y1={120} x2={133} y2={122} /><Label x={152} y={123} c={K.ok}>collier serti intégralement</Label>
    <Lead x1={150} y1={146} x2={124} y2={136} /><Label x={152} y={149} c={K.ok}>pintail rompu affleurant</Label>
    <Label x={16} y={52} c={K.ok}>0 jeu sous tête</Label>
    <Label x={16} y={178}>jauge : Ø et longueur du collier serti</Label>
  </Frame>),
};

/* ---------- 3. Rivet plein ---------- */
const RV = {
  avant: () => (<Frame title="Rivet plein avant pose : fraisage à la cage micrométrique">
    <Stack y={104} cx={90} w={12} csk={26} L={24} R={170} t1={16} t2={16} />
    {/* cage micrométrique en coupe */}
    <rect x="86" y="18" width="8" height="24" fill={K.metal2} stroke={K.edge} />
    <rect x="54" y="42" width="72" height="10" rx="2" fill={K.steel} stroke={K.edge} />
    {Array.from({ length: 13 }, (_, i) => <line key={i} x1={57 + i * 5.5} y1="42" x2={57 + i * 5.5} y2={i % 5 === 0 ? 47 : 45} stroke={K.dark} strokeWidth="0.8" />)}
    <path d="M58,52 H122 V62 H114 V104 H106 V62 H74 V104 H66 V62 H58 Z" fill={K.tool} stroke={K.edge} />
    <path d="M58,52 H122 V62 H114 V104 H106 V62 H74 V104 H66 V62 H58 Z" fill="url(#qh)" opacity="0.6" />
    <rect x="77" y="62" width="26" height="42" fill={K.metal} stroke={K.edge} />
    <polygon points={`77,104 103,104 96,${104 + cskDepth(26, 12) * 0.98} 84,${104 + cskDepth(26, 12) * 0.98}`} fill={K.metal} stroke={K.edge} />
    <rect x="86" y="110" width="8" height="18" fill={K.metal2} stroke={K.edge} />
    {/* rivet NF L 100° prêt */}
    <CskHead c={250} y={92} top={26} w={12} />
    <rect x="244" y={92 + cskDepth(26, 12)} width="12" height="58" fill={K.metal} stroke={K.edge} />
    <Dim x={270} y1={98} y2={150} /><Label x={276} y={128} c={K.amber}>L</Label>
    <Lead x1={136} y1={30} x2={124} y2={45} /><Label x={138} y={33}>bague micrométrique (1/100)</Label>
    <Lead x1={136} y1={64} x2={122} y2={60} /><Label x={138} y={67}>cage à jupe en appui</Label>
    <Lead x1={136} y1={84} x2={103} y2={100} /><Label x={138} y={87}>fraise 100° + pilote</Label>
    <Label x={216} y={170}>rivet NF L 100°</Label>
    <Label x={16} y={182} c={K.amber}>L = E + 1,5 D</Label>
  </Frame>),
  pendant: () => (<Frame title="Rivet plein pendant le rivetage">
    <Stack y={70} w={12} csk={26} />
    <CskHead top={26} w={12} y={70} />
    <rect x="114" y={70 + cskDepth(26, 12)} width="12" height={40 - cskDepth(26, 12)} fill={K.metal} stroke={K.edge} />
    <path d="M114,110 H126 L130,126 H110 Z" fill={K.metal} stroke={K.edge} />
    <rect x="98" y="46" width="44" height="24" rx="3" fill={K.tool} stroke={K.edge} /><rect x="110" y="26" width="20" height="20" fill={K.tool} stroke={K.edge} />
    <rect x="76" y="126" width="88" height="24" fill={K.tool} stroke={K.edge} /><rect x="76" y="126" width="88" height="24" fill="url(#qh)" opacity="0.6" />
    <Arrow x1={152} y1={30} x2={152} y2={54} />
    <Lead x1={176} y1={58} x2={142} y2={58} /><Label x={178} y={61}>bouterolle plate</Label><Label x={178} y={73}>côté tête fraisée</Label>
    <Lead x1={176} y1={140} x2={164} y2={140} /><Label x={178} y={143}>tas (forme la tête)</Label>
    <Label x={16} y={178}>la queue s'écrase et gonfle dans l'alésage</Label>
  </Frame>),
  apres: () => (<Frame title="Rivet plein après pose : contrôle de la tête formée">
    <Stack y={70} w={12} csk={26} />
    <CskHead top={26} w={12} y={70} />
    <rect x="114" y={70 + cskDepth(26, 12)} width="12" height={40 - cskDepth(26, 12)} fill={K.metal} stroke={K.edge} />
    <path d="M111,110 H129 Q132,110 132,113 V118 H108 V113 Q108,110 111,110 Z" fill={K.metal} stroke={K.edge} />
    <HDim y={130} x1={108} x2={132} c={K.ok} /><Label x={86} y={146} c={K.ok}>Ø ≈ 1,5 D</Label>
    <Dim x={142} y1={110} y2={118} c={K.ok} /><Label x={150} y={118} c={K.ok}>h ≈ 0,5 D</Label>
    <Lead x1={160} y1={52} x2={133} y2={70} /><Label x={162} y={55} c={K.ok}>tête affleurante (± tol.)</Label>
    <Label x={16} y={170}>fût gonflé : il remplit l'alésage</Label>
    <Label x={16} y={182}>MS20470 en structure interne</Label>
  </Frame>),
};

/* ---------- 4. Rivet aveugle CherryMax ---------- */
/* douille à tête fraisée, tige à cannelures + gorge de rupture, bague de verrouillage, rondelle d'entraînement */
function BlRivet({ stage }) {
  const d = cskDepth(28, 14);
  const lift = stage === 0 ? 0 : stage === 1 ? 10 : 0;
  return (
    <g>
      <CskHead y={70} top={28} w={14} />
      <path d={`M120,${70 + d} m-4,0 h8 v-4 h-8 Z`} fill={K.dark} />
      {stage === 0 && <rect x="113" y={70 + d} width="14" height={58 - d} fill={K.metal} stroke={K.edge} />}
      {stage >= 1 && <>
        <rect x="113" y={70 + d} width="14" height={40 - d} fill={K.metal} stroke={K.edge} />
        <path d={stage === 1 ? "M113,110 C104,112 104,124 113,126 H127 C136,124 136,112 127,110 Z" : "M113,110 C100,110 100,122 110,122 H130 C140,122 140,110 127,110 Z"} fill={K.metal} stroke={K.edge} />
        {stage === 2 && <path d="M106,116 H134" stroke={K.edge} strokeDasharray="2 2" />}
      </>}
      {/* tige */}
      <rect x="117" y={stage === 2 ? 70 : 28 - lift} width="6" height={stage === 2 ? 48 : 104} fill={K.metal2} stroke={K.edge} />
      {stage !== 2 && [0, 1, 2, 3, 4].map((i) => <line key={i} x1="117" x2="123" y1={36 - lift + i * 4} y2={38 - lift + i * 4} stroke={K.edge} />)}
      {stage !== 2 && <path d={`M117,${70 - lift} l3,2 l3,-2`} fill="none" stroke={K.ko} />}
      {stage === 0 && <path d="M113,128 L111,136 H129 L127,128 Z" fill={K.metal2} stroke={K.edge} />}
      {/* bague de verrouillage et rondelle d'entraînement */}
      {stage < 2 && <rect x="112" y={64 - lift * 0.4} width="16" height="6" fill={K.amber} stroke={K.dark} strokeWidth="0.6" />}
      {stage < 2 && <rect x="106" y={58 - lift * 0.4} width="28" height="6" fill={K.steel} stroke={K.edge} />}
      {stage === 2 && <path d={`M114,70 L116,${70 + d - 1} H124 L126,70 Z`} fill={K.ok} stroke={K.dark} strokeWidth="0.6" />}
    </g>
  );
}
const BL = {
  avant: () => (<Frame title="Rivet aveugle CherryMax avant pose">
    <Stack y={70} w={14} csk={28} />
    <BlRivet stage={0} />
    <Lead x1={150} y1={36} x2={123} y2={40} /><Label x={152} y={39}>tige à cannelures</Label>
    <Lead x1={150} y1={56} x2={134} y2={61} /><Label x={152} y={59}>rondelle d'entraînement</Label>
    <Lead x1={150} y1={72} x2={128} y2={67} /><Label x={152} y={75} c={K.amber}>bague de verrouillage</Label>
    <Lead x1={150} y1={132} x2={129} y2={132} /><Label x={152} y={135}>tête de tige</Label>
    <Label x={16} y={178}>un seul côté accessible : face arrière fermée</Label>
  </Frame>),
  pendant: () => (<Frame title="Rivet aveugle CherryMax pendant la pose">
    <Stack y={70} w={14} csk={28} />
    <BlRivet stage={1} />
    <path d="M96,26 H113 V52 H96 Z M144,26 H127 V52 H144 Z" fill={K.tool} stroke={K.edge} />
    <Arrow x1={120} y1={22} x2={120} y2={4} />
    <Lead x1={156} y1={40} x2={144} y2={40} /><Label x={158} y={43}>nez de riveteuse</Label>
    <Lead x1={156} y1={118} x2={134} y2={118} /><Label x={158} y={121} c={K.amber}>bulbe formé côté aveugle</Label>
    <Label x={16} y={170}>la tige tire, la douille se plisse</Label>
    <Label x={16} y={182}>et plaque les tôles l'une contre l'autre</Label>
  </Frame>),
  apres: () => (<Frame title="Rivet aveugle CherryMax après pose">
    <Stack y={70} w={14} csk={28} />
    <BlRivet stage={2} />
    <Lead x1={150} y1={52} x2={126} y2={72} /><Label x={152} y={55} c={K.ok}>bague logée dans la tête</Label>
    <Label x={152} y={67} c={K.ok}>tige cassée affleurante</Label>
    <Lead x1={150} y1={128} x2={136} y2={118} /><Label x={152} y={131} c={K.ok}>bulbe plaqué, non visible</Label>
    <Label x={16} y={178}>contrôle visuel côté tête uniquement</Label>
  </Frame>),
};

/* ---------- 5. Boulon ATA 67 + écrou à créneaux + goupille ---------- */
/* écrou à créneaux en coupe : filetage intérieur, créneaux, trou de goupille du boulon visible dans le créneau */
function Castle({ y, pin = 0 }) {
  return (
    <g>
      <rect x="99" y={y} width="42" height="5" fill={K.metal2} stroke={K.edge} />
      <path d={`M98,${y + 5} H142 V${y + 20} H98 Z`} fill={K.sky} opacity="0.9" stroke="#8fd0ff" strokeWidth="0.8" />
      <path d={`M98,${y + 5} H142 V${y + 20} H98 Z`} fill="url(#qs)" />
      <path d={`M100,${y + 20} H140 V${y + 32} H134 V${y + 22} H126 V${y + 32} H114 V${y + 22} H106 V${y + 32} H100 Z`} fill={K.sky} opacity="0.9" stroke="#8fd0ff" strokeWidth="0.8" />
      {pin === 1 && <circle cx="120" cy={y + 27} r="2.6" fill={K.dark} stroke={K.amber} strokeWidth="0.8" />}
      {pin === 2 && <>
        <circle cx="93" cy={y + 27} r="4.2" fill="none" stroke={K.amber} strokeWidth="2.6" />
        <rect x="97" y={y + 25} width="40" height="4" rx="1.5" fill={K.amber} stroke={K.dark} strokeWidth="0.5" />
        <path d={`M137,${y + 27} Q146,${y + 27} 146,${y + 18} V${y + 8}`} fill="none" stroke={K.amber} strokeWidth="3" />
        <path d={`M135,${y + 29} Q140,${y + 40} 128,${y + 44} H118`} fill="none" stroke={K.amber} strokeWidth="3" />
      </>}
    </g>
  );
}
function Bolt({ top, len, drilled = true }) {
  return (
    <g>
      <rect x="96" y={top} width="48" height="12" rx="1.5" fill={K.metal} stroke={K.edge} /><line x1="108" x2="108" y1={top} y2={top + 12} stroke={K.edge} /><line x1="132" x2="132" y1={top} y2={top + 12} stroke={K.edge} />
      <rect x="110" y={top + 12} width="20" height={len - 34} fill={K.metal} stroke={K.edge} />
      <ThreadZ x={110} y={top + len - 22} w={20} h={22} />
      {drilled && <><line x1="110" x2="130" y1={top + len - 9} y2={top + len - 9} stroke={K.dark} strokeDasharray="2 1.5" /><line x1="110" x2="130" y1={top + len - 5} y2={top + len - 5} stroke={K.dark} strokeDasharray="2 1.5" /></>}
    </g>
  );
}
const BO = {
  avant: () => (<Frame title="Boulon de commande avant serrage">
    <Stack y={50} w={22} t1={20} t2={20} />
    <rect x="98" y="44" width="44" height="6" fill={K.metal2} stroke={K.edge} />
    <Bolt top={32} len={100} />
    <g transform="translate(0,32)"><Castle y={110} /></g>
    <path d="M244,92 a5,5 0 1,1 0,10 M244,92 H292 M244,102 H284" fill="none" stroke={K.amber} strokeWidth="2.4" />
    <Label x={226} y={118} c={K.amber}>goupille neuve</Label>
    <Lead x1={162} y1={30} x2={142} y2={36} /><Label x={164} y={33}>tête (sens défini au plan)</Label>
    <Lead x1={156} y1={124} x2={130} y2={124} /><Label x={158} y={127}>bout fileté percé</Label>
    <Label x={158} y={164}>écrou à créneaux</Label><Label x={158} y={176}>et rondelle neufs</Label>
  </Frame>),
  pendant: () => (<Frame title="Serrage au couple et alignement du créneau">
    <Stack y={40} w={22} t1={20} t2={20} />
    <Bolt top={22} len={104} />
    <Castle y={94} pin={1} />
    <path d="M160,112 a40,11 0 1,1 -80,0" fill="none" stroke={K.amber} strokeWidth="1.6" markerEnd="url(#qa)" />
    <Lead x1={170} y1={130} x2={123} y2={121} /><Label x={172} y={133} c={K.amber}>trou aligné au créneau</Label>
    <Label x={16} y={158}>couple mini atteint → créneau suivant,</Label>
    <Label x={16} y={170}>SANS dépasser le couple maxi</Label>
    <Label x={16} y={182} c={K.ko}>jamais desserrer pour aligner</Label>
  </Frame>),
  apres: () => (<Frame title="Goupille posée et rabattue">
    <Stack y={40} w={22} t1={20} t2={20} />
    <Bolt top={22} len={104} />
    <Castle y={94} pin={2} />
    <Lead x1={168} y1={104} x2={147} y2={110} /><Label x={170} y={107} c={K.ok}>jambe rabattue sur le pan</Label>
    <Lead x1={168} y1={146} x2={128} y2={138} /><Label x={170} y={149} c={K.ok}>jambe sur bout du boulon</Label>
    <Label x={16} y={170}>tête de goupille dans le créneau</Label>
    <Label x={16} y={182}>double contrôle croisé ATA 67 signé</Label>
  </Frame>),
};

/* ---------- 6. Écrous autofreinés ---------- */
function NutSection({ x, y, nylon }) {
  return (
    <g>
      <path d={`M${x},${y} H${x + 14} V${y + 30} H${x} Z M${x + 50},${y} H${x + 36} V${y + 30} H${x + 50} Z`} fill={K.sky} opacity="0.9" stroke="#8fd0ff" strokeWidth="0.8" />
      <path d={`M${x},${y} H${x + 14} V${y + 30} H${x} Z M${x + 50},${y} H${x + 36} V${y + 30} H${x + 50} Z`} fill="url(#qs)" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${x + 14},${y + 2 + i * 3.6} l-2,1.8 l2,1.8 M${x + 36},${y + 2 + i * 3.6} l2,1.8 l-2,1.8`} stroke="#8fd0ff" strokeWidth="0.7" fill="none" />)}
      {nylon
        ? <><rect x={x + 3} y={y + 30} width="44" height="9" fill={K.sky} opacity="0.9" stroke="#8fd0ff" strokeWidth="0.8" /><rect x={x + 11} y={y + 31} width="7" height="7" fill="#f2f5fa" stroke={K.edge} strokeWidth="0.6" /><rect x={x + 32} y={y + 31} width="7" height="7" fill="#f2f5fa" stroke={K.edge} strokeWidth="0.6" /></>
        : <><path d={`M${x + 3},${y + 30} H${x + 47} L${x + 44},${y + 39} H${x + 6} Z`} fill={K.sky} opacity="0.9" stroke="#8fd0ff" strokeWidth="0.8" /><path d={`M${x + 14},${y + 30} L${x + 17},${y + 39} M${x + 36},${y + 30} L${x + 33},${y + 39}`} stroke={K.amber} strokeWidth="1.6" /></>}
    </g>
  );
}
const NU = {
  avant: () => (<Frame title="Deux technologies d'écrou autofreiné">
    <NutSection x={40} y={50} nylon />
    <NutSection x={190} y={50} />
    <Lead x1={70} y1={110} x2={70} y2={88} /><Label x={20} y={120}>bague nylon</Label><Label x={20} y={132} c={K.ko}>≤ 120 °C</Label>
    <Lead x1={222} y1={110} x2={222} y2={88} /><Label x={170} y={120}>filet déformé</Label><Label x={170} y={132} c={K.ok}>zone chaude</Label>
    <Label x={16} y={30}>coupes : la vis frotte sur l'élément freineur</Label>
    <Label x={16} y={170}>tout métal : sommet ovalisé ou fendu,</Label>
    <Label x={16} y={182}>serré sur la vis</Label>
  </Frame>),
  pendant: () => (<Frame title="Mesure du couple de freinage">
    <Stack y={50} w={20} />
    <rect x="108" y="40" width="24" height="10" fill={K.metal} stroke={K.edge} />
    <ThreadZ x={111} y={50} w={18} h={110} />
    <NutSection x={95} y={104} nylon />
    <path d="M168,126 a48,12 0 1,1 -96,0" fill="none" stroke={K.amber} strokeWidth="1.6" markerEnd="url(#qa)" />
    <circle cx="252" cy="70" r="20" fill="#0d1526" stroke={K.amber} /><line x1="252" y1="70" x2="263" y2="60" stroke={K.amber} strokeWidth="1.6" /><Label x={252} y={84} a="middle" c={K.amber}>N·m</Label>
    <Label x={16} y={170}>couple mesuré AVANT contact de l'écrou :</Label>
    <Label x={16} y={182}>il doit tomber entre mini et maxi</Label>
  </Frame>),
  apres: () => (<Frame title="Dépassement de filets après serrage">
    <Stack y={50} w={20} />
    <rect x="108" y="40" width="24" height="10" fill={K.metal} stroke={K.edge} />
    <ThreadZ x={111} y={50} w={18} h={102} />
    <path d="M111,151 L114,155 H126 L129,151 Z" fill={K.metal2} stroke={K.edge} />
    <NutSection x={95} y={90} nylon />
    <Dim x={140} y1={130} y2={151} c={K.ok} /><Label x={148} y={142} c={K.ok}>≥ 2 filets complets</Label>
    <Lead x1={164} y1={158} x2={128} y2={154} /><Label x={166} y={161}>chanfrein non compté</Label>
    <Label x={16} y={182} c={K.ko}>freinage &lt; mini : écrou rebuté</Label>
  </Frame>),
};

/* ---------- 7. Clecos ---------- */
const CLECO = [["argent", "#c8d6ea", "2,4 mm (3/32 po)"], ["cuivre", "#c8743a", "3,2 mm (1/8 po)"], ["noir", "#2b2f36", "4,0 mm (5/32 po)"], ["or", "#d9b44a", "4,8 mm (3/16 po)"]];
/* corps à code couleur, collerette d'appui, fût, mors fendus à épaulement ; open = poussoir enfoncé */
function Cleco({ x, y, color, open = false, s = 1, jaw }) {
  const jl = jaw || (open ? 34 : 28);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y={open ? -8 : -18} width="10" height={open ? 8 : 18} fill={K.metal2} stroke={K.edge} />
      <rect x="-12" y="0" width="24" height="30" rx="4" fill={color} stroke={K.edge} />
      <line x1="-7" y1="3" x2="-7" y2="27" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
      <rect x="-15" y="30" width="30" height="5" rx="1" fill={K.metal} stroke={K.edge} />
      <rect x="-7" y="35" width="14" height="12" fill={K.metal2} stroke={K.edge} />
      {open
        ? <path d={`M-4,47 V${47 + jl} L-5.5,${49 + jl} L-3,${53 + jl} H-0.6 V47 Z M4,47 V${47 + jl} L5.5,${49 + jl} L3,${53 + jl} H0.6 V47 Z`} fill={K.metal} stroke={K.edge} strokeWidth="0.8" />
        : <path d={`M-4,47 V${47 + jl} L-7,${50 + jl} L-4,${54 + jl} H-0.6 V47 Z M4,47 V${47 + jl} L7,${50 + jl} L4,${54 + jl} H0.6 V47 Z`} fill={K.metal} stroke={K.edge} strokeWidth="0.8" />}
      <line x1="0" y1="47" x2="0" y2={47 + jl + (open ? 8 : 2)} stroke={K.dark} strokeWidth="1.2" />
    </g>
  );
}
const CL = {
  avant: () => (<Frame title="Code couleur des clecos">
    {CLECO.map(([n, c, d], i) => <g key={n}><Cleco x={58 + i * 68} y={40} color={c} /><Label x={58 + i * 68} y={150} a="middle">{n}</Label><Label x={58 + i * 68} y={164} a="middle" c={K.amber}>{d.split(" ")[0]} mm</Label></g>)}
    <Label x={16} y={182}>couleur = diamètre de perçage</Label>
  </Frame>),
  pendant: () => (<Frame title="Pose du cleco à la pince">
    <Stack y={108} w={10} t1={14} t2={14} />
    <Cleco x={120} y={36} color="#c8743a" open />
    <path d="M100,30 H140 V24 H100 Z M104,64 H136 V70 H104 Z" fill={K.tool} stroke={K.edge} />
    <path d="M140,27 L196,14 M136,67 L196,80" stroke={K.tool} strokeWidth="5" strokeLinecap="round" />
    <Arrow x1={120} y1={16} x2={120} y2={26} />
    <Lead x1={204} y1={44} x2={142} y2={28} /><Label x={206} y={47}>pince : poussoir</Label>
    <Label x={206} y={59}>enfoncé</Label>
    <Lead x1={166} y1={150} x2={124} y2={120} /><Label x={168} y={153}>mors allongés, serrés</Label>
    <Label x={16} y={182}>les mors entrent dans le trou</Label>
  </Frame>),
  apres: () => (<Frame title="Cleco relâché : tôles plaquées">
    <Stack y={100} w={10} t1={14} t2={14} />
    <Cleco x={120} y={65} color="#c8743a" jaw={18} />
    <Lead x1={160} y1={84} x2={135} y2={97} /><Label x={162} y={87} c={K.ok}>collerette en appui</Label>
    <Lead x1={160} y1={146} x2={126} y2={132} /><Label x={162} y={149} c={K.ok}>épaulement des mors</Label>
    <Label x={162} y={161} c={K.ok}>accroché sous la tôle</Label>
    <Lead x1={160} y1={48} x2={133} y2={60} /><Label x={162} y={51}>ressort : tire les mors</Label>
    <Label x={16} y={170}>1 cleco tous les 4 à 6 trous,</Label>
    <Label x={16} y={182}>tous déposés et comptés (FOD)</Label>
  </Frame>),
};

/* ---------- 8. B-nut, colliers et métallisation ---------- */
const BN = {
  avant: () => (<Frame title="Raccord B-nut serré à deux clés">
    <rect x="16" y="88" width="100" height="12" fill={K.metal2} stroke={K.edge} />
    <path d="M116,88 L124,82 V106 L116,100 Z" fill={K.metal2} stroke={K.edge} />
    <rect x="100" y="76" width="34" height="36" fill={K.sky} opacity="0.9" stroke="#8fd0ff" strokeWidth="0.8" />
    <line x1="100" x2="134" y1="85" y2="85" stroke="#8fd0ff" strokeWidth="0.6" /><line x1="100" x2="134" y1="103" y2="103" stroke="#8fd0ff" strokeWidth="0.6" />
    <ThreadZ x={134} y={84} w={14} h={20} />
    <rect x="148" y="74" width="34" height="40" fill={K.steel} stroke={K.edge} />
    <line x1="148" x2="182" y1="84" y2="84" stroke={K.edge} /><line x1="148" x2="182" y1="104" y2="104" stroke={K.edge} />
    <rect x="182" y="86" width="50" height="16" fill={K.metal} stroke={K.edge} />
    <path d="M103,76 V36 a6,6 0 0 1 12,0 V76" fill={K.ok} opacity="0.85" stroke={K.dark} strokeWidth="0.6" />
    <path d="M159,114 V160 a6,6 0 0 0 12,0 V114" fill={K.amber} opacity="0.9" stroke={K.dark} strokeWidth="0.6" />
    <Lead x1={130} y1={42} x2={115} y2={50} /><Label x={132} y={45} c={K.ok}>clé dynamométrique sur B-nut</Label>
    <Lead x1={190} y1={146} x2={171} y2={146} /><Label x={192} y={149} c={K.amber}>clé de maintien</Label>
    <Label x={192} y={161} c={K.amber}>sur raccord fixe</Label>
    <Label x={16} y={182}>le tube ne doit JAMAIS tourner</Label>
  </Frame>),
  pendant: () => (<Frame title="Collier à garniture élastomère">
    <rect x="20" y="30" width="200" height="14" fill={K.plate} stroke={K.edge} /><rect x="20" y="30" width="200" height="14" fill="url(#qh)" />
    <circle cx="120" cy="96" r="18" fill={K.metal2} stroke={K.edge} /><circle cx="120" cy="96" r="13" fill="#0d1526" stroke={K.edge} />
    <circle cx="120" cy="96" r="22" fill="none" stroke={K.ok} strokeWidth="6" />
    {Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return <line key={i} x1={120 + 19.5 * Math.cos(a)} y1={96 + 19.5 * Math.sin(a)} x2={120 + 24.5 * Math.cos(a)} y2={96 + 24.5 * Math.sin(a)} stroke="#1f7a55" strokeWidth="0.8" />; })}
    <path d="M96,96 A24,24 0 1 0 144,96 V58 H130 V70 M96,96 V58 H110 V70" fill="none" stroke={K.metal} strokeWidth="2.4" />
    <rect x="94" y="44" width="52" height="8" fill={K.steel} stroke={K.edge} />
    <rect x="114" y="34" width="12" height="34" fill={K.metal2} stroke={K.edge} />
    <Lead x1={166} y1={104} x2={143} y2={100} /><Label x={168} y={107} c={K.ok}>garniture élastomère</Label>
    <Lead x1={166} y1={80} x2={144} y2={76} /><Label x={168} y={83}>bande inox</Label>
    <Label x={16} y={170}>collier NSA / ECS : bon Ø, garniture intacte</Label>
    <Label x={16} y={182}>jeu mini harnais / tube respecté</Label>
  </Frame>),
  apres: () => (<Frame title="Métallisation : décaper, serrer, mesurer, protéger">
    <rect x="20" y="108" width="200" height="18" fill={K.plate} stroke={K.edge} /><rect x="20" y="108" width="200" height="18" fill="url(#qh)" />
    <rect x="20" y="104" width="200" height="4" fill="#2f7a4f" />
    <rect x="86" y="104" width="68" height="4" fill="#e6edf7" />
    <rect x="96" y="96" width="48" height="8" fill={K.amber} opacity="0.85" stroke={K.dark} strokeWidth="0.6" />
    <rect x="94" y="90" width="52" height="6" fill={K.metal2} stroke={K.edge} />
    <rect x="104" y="76" width="32" height="14" fill={K.steel} stroke={K.edge} />
    <path d="M144,98 q30,-24 70,-30" fill="none" stroke={K.metal} strokeWidth="4" strokeDasharray="3 2" />
    <path d="M80,104 q-6,-8 6,-8 M160,104 q6,-8 -6,-8" fill="none" stroke={K.pr} strokeWidth="3" />
    <circle cx="52" cy="54" r="16" fill="#0d1526" stroke={K.sky} /><Label x={52} y={58} a="middle" c={K.sky}>mΩ</Label>
    <path d="M62,66 L100,90 M66,62 L106,84 M44,68 L60,104 M40,66 L52,104" stroke={K.sky} strokeWidth="1" />
    <Lead x1={176} y1={146} x2={150} y2={106} /><Label x={178} y={149} c="#e6edf7">métal nu décapé</Label>
    <Label x={178} y={44}>tresse</Label>
    <Label x={16} y={158} c={K.ok}>Kelvin 4 fils : R &lt; 2,5 mΩ</Label>
    <Label x={16} y={170} c={K.pr}>puis cordon de re-protection</Label>
    <Label x={16} y={182}>(vernis ou PR) sur le métal nu</Label>
  </Frame>),
};

export const HARDWARE = [
  {
    id: "hilok", titre: "Hi-Lok / Hi-Lite", fam: "Fixation filetée à collier frangible", draw: HL,
    emploi: "Assemblages structuraux en cisaillement (cadres, jonctions de poutre, ferrures) avec accès aux deux faces. Hi-Lite : version allégée (transition et collier plus courts) pour gagner de la masse.",
    etapes: ["AVANT : alésage au diamètre du plan, longueur de serrage (grip) choisie à la jauge selon l'épaisseur E de l'empilage, tige enduite de PR si la pose humide est prescrite.", "PENDANT : collier vissé, la clé Allen maintient la tige par son six-pans central pendant que l'écrou de manœuvre du collier est entraîné.", "APRÈS : l'écrou de manœuvre casse à la gorge calibrée quand le couple de pose est atteint ; il ne reste que le collier."],
    qc: ["Rupture de l'écrou de manœuvre à la gorge", "Dépassement de tige contrôlé à la jauge (mini / maxi)", "Aucun jeu sous tête ni sous collier", "Excès de PR nettoyé, cordon continu si exigé"],
    rebut: ["Rupture anticipée avec jeu sous tête (grippage, mauvais grip)", "Dépassement hors jauge : grip faux", "Collier fissuré ou posé de travers"],
  },
  {
    id: "lockbolt", titre: "Lockbolt (boulon à sertir)", fam: "Fixation à collier serti", draw: LB,
    emploi: "Jonctions structurales à forte cadence où l'on veut une précharge régulière sans contrôle de couple : la précharge est donnée par le sertissage.",
    etapes: ["AVANT : tige à gorges annulaires de blocage + pintail (queue de traction) ; collier lisse.", "PENDANT : l'outil tire le pintail et pousse son enclume sur le collier, qui est serti (filé) dans les gorges.", "APRÈS : le pintail casse à la gorge de rupture quand la charge de pose est atteinte."],
    qc: ["Collier serti sur toute sa longueur, diamètre et longueur contrôlés à la jauge", "Rupture du pintail dans la tolérance d'affleurement", "Aucun jeu sous tête"],
    rebut: ["Collier partiellement serti", "Pintail cassé hors tolérance (trop long ou en retrait)", "Tête non plaquée"],
  },
  {
    id: "rivet", titre: "Rivet plein (MS20470, NF L fraisé 100°)", fam: "Rivet déformé à froid", draw: RV,
    emploi: "Tôlerie et revêtements avec accès aux deux faces. Tête universelle MS20470 en structure interne, tête fraisée 100° (NF L) sur les surfaces aérodynamiques.",
    etapes: ["AVANT : longueur L = E + 1,5 D (E = épaisseur serrée, D = diamètre du rivet). Pour une tête fraisée, logement fraisé à la profondeur prescrite.", "PENDANT : bouterolle côté tête manufacturée, tas côté queue : la queue s'écrase et forme la tête rivée.", "APRÈS : tête formée d'environ 1,5 D de diamètre et 0,5 D de hauteur, centrée."],
    qc: ["Tête formée ≈ 1,5 D × 0,5 D (jauge de tête)", "Tête formée centrée sur l'axe", "Tête manufacturée sans marque de bouterolle", "Fraisé : tête affleurante dans la tolérance"],
    rebut: ["Tête trop mince ou trop petite (rivet trop court)", "Tête excentrée ou en « tonneau »", "Marque de bouterolle (« sourire ») sur la tôle", "Jeu entre tôles, tête fraisée en saillie ou en creux"],
  },
  {
    id: "aveugle", titre: "Rivet aveugle structural (CherryMax, Opti-Blind)", fam: "Rivet posé d'un seul côté", draw: BL,
    emploi: "Fermeture de caissons dont l'intérieur n'est plus accessible (dérive de Fenestron, bord de fuite, carénages structuraux).",
    etapes: ["AVANT : choix de la plage de grip selon l'épaisseur, douille + tige (mandrin) insérées.", "PENDANT : la riveteuse tire la tige ; la douille se déforme et forme un bulbe côté aveugle qui plaque les tôles.", "APRÈS : la bague de verrouillage mécanique se loge dans la tête et bloque la tige, qui casse affleurante."],
    qc: ["Bague de verrouillage visible et en place", "Tige cassée affleurante dans la tolérance", "Plage de grip conforme à l'épaisseur", "Tête plaquée"],
    rebut: ["Bague absente ou mal logée : tige non retenue", "Tige en retrait ou en saillie hors tolérance", "Grip hors plage : bulbe mal formé"],
  },
  {
    id: "goupille", titre: "Boulon ATA 67 + rondelles + écrou à créneaux + goupille", fam: "Liaison de commande de vol", draw: BO,
    emploi: "Articulations de commandes de vol (bielles, guignols, plateau cyclique) : liaison démontable et freinée positivement.",
    etapes: ["AVANT : boulon orienté selon le plan, rondelles prévues, écrou à créneaux et goupille neufs du bon diamètre.", "PENDANT : serrage au couple ; au couple mini, poursuivre jusqu'au créneau suivant sans dépasser le maxi. Jamais desserrer pour aligner.", "APRÈS : goupille engagée tête dans le créneau ; une jambe rabattue sur l'extrémité du boulon, l'autre rabattue sur le pan de l'écrou, sans excès de longueur."],
    qc: ["Couple dans la plage et tracé", "Goupille neuve, bon diamètre, jambes rabattues sans fissure", "Rondelles présentes et dans le bon ordre", "Double contrôle croisé signé (ATA 67)"],
    rebut: ["Goupille réutilisée, trop fine ou mal rabattue", "Créneau aligné en desserrant", "Rondelle manquante, boulon monté à l'envers"],
  },
  {
    id: "autofreine", titre: "Écrous autofreinés (tout métal / insert nylon)", fam: "Freinage par frottement", draw: NU,
    emploi: "Freinage des fixations sans goupille ni fil. Insert nylon interdit au-dessus d'environ 120 °C (compartiments moteurs, proximité des échappements) : on prend alors un écrou tout métal.",
    etapes: ["AVANT : vérifier la technologie autorisée par le plan selon la température de la zone.", "PENDANT : mesurer le couple de freinage (running torque) à l'approche, avant contact : il doit être compris entre mini et maxi ; l'ajouter au couple nominal si la norme le demande.", "APRÈS : au moins 2 filets complets dépassent de l'écrou (le chanfrein ne compte pas)."],
    qc: ["Technologie conforme à la zone (nylon ≤ 120 °C)", "Couple de freinage dans la plage", "≥ 2 filets complets dépassants", "Couple final tracé"],
    rebut: ["Couple de freinage sous le mini : écrou rebuté", "Écrou nylon en zone chaude", "Moins de 2 filets dépassants : vis trop courte"],
  },
  {
    id: "cleco", titre: "Clecos (fixations provisoires)", fam: "Maintien provisoire", draw: CL,
    emploi: "Maintien provisoire des tôles pendant le perçage, l'alésage et avant la pose définitive. Code couleur selon le diamètre : argent 2,4 mm, cuivre 3,2 mm, noir 4,0 mm, or 4,8 mm.",
    etapes: ["AVANT : choisir la couleur correspondant au diamètre de perçage.", "PENDANT : la pince enfonce le poussoir ; les deux doigts s'écartent de l'écarteur central et s'insèrent dans le trou.", "APRÈS : relâché, le ressort tire les doigts qui viennent en butée sous la tôle et plaquent l'empilage."],
    qc: ["Bonne couleur pour le diamètre", "Répartition régulière (souvent un trou sur quatre à six)", "Tous les clecos déposés et comptés avant pose définitive (FOD)"],
    rebut: ["Cleco trop gros forcé : trou ovalisé", "Cleco oublié dans une zone fermée", "Ressort fatigué : plaquage insuffisant"],
  },
  {
    id: "bnut", titre: "B-nuts, colliers NSA / ECS et métallisation", fam: "Tuyauteries, harnais et liaisons de masse", draw: BN, labels: ["B-nut", "Colliers", "Métallisation"],
    emploi: "Raccords de tuyauteries hydrauliques et carburant, fixation des harnais et tuyauteries par colliers, liaisons de masse (tresses).",
    etapes: ["B-NUT : serrage au couple avec une clé de maintien sur le raccord fixe : le tube ne doit jamais tourner.", "COLLIERS : diamètre adapté, garniture élastomère intacte, jeux minimums harnais / tube respectés (anti-chafing).", "MÉTALLISATION : décapage calibré, serrage au couple, mesure au milliohmmètre 4 fils (R < 2,5 mΩ), puis re-protection (vernis ou PR)."],
    qc: ["B-nut au couple, tube non vrillé", "Colliers du bon diamètre, garniture en place", "Mesure 4 fils conforme et tracée", "Zone décapée re-protégée après la mesure"],
    rebut: ["Tube vrillé au serrage", "Collier sans garniture, harnais au contact d'un tube", "Mesure à l'ohmmètre 2 fils, ou vernis posé avant la mesure"],
  },
];

export default function Quincaillerie() {
  const [sel, setSel] = useState("hilok");
  const h = HARDWARE.find((x) => x.id === sel);
  const lb = h.labels || ["Avant", "Pendant", "Après"];
  const frames = [[lb[0], h.draw.avant], [lb[1], h.draw.pendant], [lb[2], h.draw.apres]];
  return (
    <section className="flex flex-col gap-4">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-sky">Catalogue visuel</div>
        <h3 className="font-display text-2xl font-semibold text-ink">Quincaillerie & procédés aéro : 8 fiches techniques</h3>
        <p className="mt-1 max-w-3xl text-[13px] text-muted">Pour chaque élément : coupe avant, pendant et après la pose, emploi exact, critères de contrôle et défauts de rebut. Dessins de principe, non à l'échelle : la norme de la pièce et l'instruction EI font foi.</p>
      </div>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Fiches de quincaillerie">
        {HARDWARE.map((x, i) => (
          <button key={x.id} type="button" role="tab" data-quinc-tab="1" aria-selected={sel === x.id} onClick={() => setSel(x.id)}
            className={cx("rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition", sel === x.id ? "border-sky bg-sky/15 text-ink" : "border-line bg-panel2 text-muted hover:text-ink")}>
            <span className="font-mono text-sky">{i + 1}</span> {x.titre.split(" (")[0]}
          </button>
        ))}
      </div>
      <article className="flex flex-col gap-4 rounded-xl border border-line bg-panel p-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <h4 className="font-display text-2xl font-semibold text-ink">{h.titre}</h4>
          <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted">{h.fam}</span>
        </div>
        <div className="flex gap-2 rounded-lg border border-sky/40 bg-sky/10 p-3 text-[14px] leading-relaxed text-ink"><Info size={16} className="mt-0.5 shrink-0 text-sky" /><span><strong className="text-sky">Emploi : </strong>{h.emploi}</span></div>
        <div className="grid gap-3 md:grid-cols-3" data-quinc-frames="1">
          {frames.map(([t, F], i) => (
            <figure key={t} className="flex flex-col gap-2">
              <div className="overflow-hidden rounded-lg border border-line"><F /></div>
              <figcaption className="text-[13px] leading-relaxed text-ink/90"><span className="mr-1 rounded bg-sky px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-bg">{t}</span>{h.etapes[i].replace(/^[A-ZÀ-Ý -]+ : /, "")}</figcaption>
            </figure>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-ok/40 bg-ok/5 p-4">
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ok"><CheckCircle2 size={13} />Critères de contrôle qualité</div>
            <ul className="flex flex-col gap-1.5 text-[13px] text-ink/90">{h.qc.map((t) => <li key={t} className="flex gap-2"><span className="text-ok">✓</span>{t}</li>)}</ul>
          </div>
          <div className="rounded-lg border border-ko/40 bg-ko/5 p-4">
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ko"><XCircle size={13} />Défauts entraînant le rebut ou la reprise</div>
            <ul className="flex flex-col gap-1.5 text-[13px] text-ink/90">{h.rebut.map((t) => <li key={t} className="flex gap-2"><span className="text-ko">✗</span>{t}</li>)}</ul>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-[12px] text-muted"><Wrench size={13} />Chaque pose s'écrit dans la gamme avec la référence exacte de la pièce, l'outillage, le couple ou la jauge, et le contrôle associé.</p>
      </article>
    </section>
  );
}
