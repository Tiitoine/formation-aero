/* ============================================================
   M2 · CATALOGUE VISUEL DE LA QUINCAILLERIE & DES PROCÉDÉS AÉRO
   8 fiches techniques : coupe AVANT / PENDANT / APRÈS la pose,
   emploi exact, critères de contrôle qualité et défauts de rebut.
   Dessins de principe (non à l'échelle) : la norme et l'EI font foi.
   ============================================================ */
import React, { useState } from "react";
import { CheckCircle2, XCircle, Wrench, Info } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");
const K = { plate: "#1b2a47", edge: "#5b7299", hatch: "#2e4168", metal: "#9fb3d1", metal2: "#c8d6ea", dark: "#0b1220", sky: "#3b9eff", amber: "#ffb020", ok: "#3ddc97", ko: "#ff5d6c", txt: "#8fa0bd", pr: "#7c5cff" };
const MONO = "JetBrains Mono, monospace";

/* ---------- briques de dessin ---------- */
function Defs() {
  return (
    <defs>
      <pattern id="qh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke={K.hatch} strokeWidth="1.2" /></pattern>
      <marker id="qa" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill={K.amber} /></marker>
    </defs>
  );
}
/* Empilage de deux tôles percées : trou centré en x=120, largeur w */
function Stack({ y = 80, t1 = 22, t2 = 22, w = 20, gap = 0 }) {
  const L = 30, R = 210, a = 120 - w / 2, b = 120 + w / 2;
  const plate = (yy, t) => (
    <g>
      <rect x={L} y={yy} width={a - L} height={t} fill={K.plate} stroke={K.edge} /><rect x={L} y={yy} width={a - L} height={t} fill="url(#qh)" />
      <rect x={b} y={yy} width={R - b} height={t} fill={K.plate} stroke={K.edge} /><rect x={b} y={yy} width={R - b} height={t} fill="url(#qh)" />
    </g>
  );
  return <g>{plate(y, t1)}{plate(y + t1 + gap, t2)}</g>;
}
const Label = ({ x, y, children, c = K.txt, a = "start" }) => <text x={x} y={y} fontSize="8.6" fontFamily={MONO} fill={c} textAnchor={a}>{children}</text>;
const Arrow = ({ x1, y1, x2, y2 }) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={K.amber} strokeWidth="1.6" markerEnd="url(#qa)" />;
const Thread = ({ x, y, w, h, step = 4 }) => <g>{Array.from({ length: Math.floor(h / step) }, (_, i) => <line key={i} x1={x} y1={y + i * step} x2={x + w} y2={y + i * step + 2} stroke={K.dark} strokeWidth="0.9" />)}</g>;
function Frame({ children, title }) {
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label={title}>
      <Defs />
      <rect x="0.5" y="0.5" width="319" height="199" rx="6" fill="#0d1526" stroke="#22304d" />
      {children}
    </svg>
  );
}

/* ---------- 1. Hi-Lok / Hi-Lite ---------- */
const hlPin = (y0 = 40, wet = false) => (
  <g>
    <path d={`M100,${y0 + 30} L140,${y0 + 30} L131,${y0 + 40} L109,${y0 + 40} Z`} fill={K.metal} stroke={K.edge} />
    <rect x="110" y={y0 + 40} width="20" height="62" fill={K.metal} stroke={K.edge} />
    <rect x="111" y={y0 + 102} width="18" height="30" fill={K.metal2} stroke={K.edge} /><Thread x={111} y={y0 + 103} w={18} h={28} />
    <polygon points={`116,${y0 + 127} 124,${y0 + 127} 126,${y0 + 131} 114,${y0 + 131}`} fill={K.dark} />
    {wet && <rect x="107" y={y0 + 40} width="26" height="10" fill={K.pr} opacity="0.55" />}
  </g>
);
const HL = {
  avant: () => (<Frame title="Hi-Lok avant pose"><Stack y={80} /><g transform="translate(0,-20)">{hlPin(30, true)}</g><Arrow x1={60} y1={20} x2={60} y2={60} /><Label x={14} y={16}>tige enduite PR (pose humide)</Label><Label x={150} y={196}>jauge de grip : choix de longueur</Label><line x1="214" y1="80" x2="214" y2="124" stroke={K.amber} /><Label x={190} y={76} c={K.amber}>E</Label></Frame>),
  pendant: () => (<Frame title="Hi-Lok pendant le serrage">
    <Stack y={70} />
    <path d="M100,60 L140,60 L131,70 L109,70 Z" fill={K.metal} stroke={K.edge} /><rect x="110" y="70" width="20" height="44" fill={K.metal} stroke={K.edge} /><rect x="111" y="114" width="18" height="40" fill={K.metal2} stroke={K.edge} /><Thread x={111} y={115} w={18} h={38} />
    <rect x="102" y="114" width="36" height="16" fill={K.sky} opacity="0.85" stroke={K.edge} /><rect x="104" y="132" width="32" height="16" fill={K.sky} opacity="0.55" stroke={K.edge} /><line x1="102" y1="131" x2="138" y2="131" stroke={K.ko} strokeDasharray="2 2" />
    <rect x="117" y="148" width="6" height="40" fill={K.amber} /><Label x={128} y={186} c={K.amber}>clé Allen : tient la tige</Label>
    <path d="M150,138 a26,10 0 1,1 -60,0" fill="none" stroke={K.amber} strokeWidth="1.6" markerEnd="url(#qa)" /><Label x={142} y={124} c={K.sky}>collier + écrou de manœuvre</Label><Label x={142} y={160} c={K.ko}>gorge calibrée</Label>
  </Frame>),
  apres: () => (<Frame title="Hi-Lok après pose">
    <Stack y={70} />
    <path d="M100,60 L140,60 L131,70 L109,70 Z" fill={K.metal} stroke={K.edge} /><rect x="110" y="70" width="20" height="44" fill={K.metal} stroke={K.edge} /><rect x="111" y="114" width="18" height="22" fill={K.metal2} stroke={K.edge} />
    <rect x="102" y="114" width="36" height="16" fill={K.sky} opacity="0.85" stroke={K.edge} />
    <g transform="translate(170,150) rotate(18)"><rect x="-16" y="-8" width="32" height="16" fill={K.sky} opacity="0.45" stroke={K.edge} /></g><Label x={150} y={180}>écrou cassé (évacué)</Label>
    <line x1="146" y1="130" x2="146" y2="136" stroke={K.ok} strokeWidth="2" /><Label x={150} y={136} c={K.ok}>dépassement OK</Label><Label x={20} y={56} c={K.ok}>0 jeu sous tête</Label>
  </Frame>),
};

/* ---------- 2. Lockbolt ---------- */
const lbPin = (y = 60, pintail = true) => (
  <g>
    <path d={`M100,${y} L140,${y} L131,${y + 10} L109,${y + 10} Z`} fill={K.metal} stroke={K.edge} />
    <rect x="110" y={y + 10} width="20" height="44" fill={K.metal} stroke={K.edge} />
    <rect x="111" y={y + 54} width="18" height="26" fill={K.metal2} stroke={K.edge} />{[0, 6, 12, 18].map((d) => <line key={d} x1="111" y1={y + 58 + d} x2="129" y2={y + 58 + d} stroke={K.dark} strokeWidth="2" />)}
    {pintail && <><rect x="114" y={y + 80} width="12" height="4" fill={K.ko} /><rect x="113" y={y + 84} width="14" height="34" fill={K.metal2} stroke={K.edge} />{[0, 5, 10, 15, 20, 25].map((d) => <line key={d} x1="113" y1={y + 88 + d} x2="127" y2={y + 88 + d} stroke={K.dark} />)}</>}
  </g>
);
const LB = {
  avant: () => (<Frame title="Lockbolt avant pose"><Stack y={70} />{lbPin(60)}<rect x="230" y="120" width="30" height="20" fill={K.sky} opacity="0.7" stroke={K.edge} /><Label x={226} y={154} c={K.sky}>collier lisse</Label><Label x={136} y={128}>gorges de blocage</Label><Label x={136} y={144} c={K.ko}>gorge de rupture</Label><Label x={136} y={168}>pintail (traction)</Label></Frame>),
  pendant: () => (<Frame title="Lockbolt pendant le sertissage">{<Stack y={70} />}{lbPin(60)}<rect x="104" y="114" width="32" height="22" fill={K.sky} opacity="0.75" stroke={K.edge} /><path d="M92,112 h12 v40 h-12 z M136,112 h12 v40 h-12 z" fill="#3a4c70" stroke={K.edge} /><Label x={152} y={128}>enclume de l'outil</Label><Arrow x1={120} y1={160} x2={120} y2={192} /><Label x={126} y={190} c={K.amber}>traction du pintail</Label><Arrow x1={96} y1={150} x2={96} y2={124} /></Frame>),
  apres: () => (<Frame title="Lockbolt après pose"><Stack y={70} />{lbPin(60, false)}<path d="M106,114 h28 l-2,22 h-24 z" fill={K.sky} opacity="0.85" stroke={K.edge} />{[0, 6, 12].map((d) => <line key={d} x1="108" y1={120 + d} x2="132" y2={120 + d} stroke={K.dark} strokeWidth="1.5" />)}<Label x={140} y={128} c={K.ok}>collier serti dans les gorges</Label><Label x={140} y={142} c={K.ok}>rupture du pintail affleurante</Label><Label x={20} y={56} c={K.ok}>0 jeu sous tête</Label></Frame>),
};

/* ---------- 3. Rivet plein ---------- */
const RV = {
  avant: () => (<Frame title="Rivet plein avant pose"><Stack y={70} w={14} /><path d="M100,70 a20,10 0 0,1 40,0 z" fill={K.metal} stroke={K.edge} /><rect x="113" y="70" width="14" height="78" fill={K.metal} stroke={K.edge} /><line x1="200" y1="70" x2="200" y2="114" stroke={K.amber} /><Label x={204} y={96} c={K.amber}>E</Label><line x1="150" y1="114" x2="150" y2="148" stroke={K.amber} /><Label x={154} y={136} c={K.amber}>1,5 D</Label><Label x={14} y={184}>L = E + 1,5 D (dépassement avant écrasement)</Label><Label x={18} y={60}>tête universelle MS20470</Label></Frame>),
  pendant: () => (<Frame title="Rivet plein pendant le rivetage"><Stack y={70} w={14} /><path d="M100,70 a20,10 0 0,1 40,0 z" fill={K.metal} stroke={K.edge} /><rect x="113" y="70" width="14" height="44" fill={K.metal} stroke={K.edge} /><path d="M108,114 h24 l4,18 h-32 z" fill={K.metal} stroke={K.edge} /><rect x="96" y="40" width="48" height="20" rx="4" fill="#3a4c70" stroke={K.edge} /><Label x={150} y={52}>bouterolle (pistolet)</Label><rect x="80" y="134" width="80" height="22" fill="#3a4c70" stroke={K.edge} /><Label x={164} y={150}>tas</Label><Arrow x1={120} y1={18} x2={120} y2={38} /></Frame>),
  apres: () => (<Frame title="Rivet plein après pose : contrôle de la tête formée"><Stack y={70} w={14} /><path d="M100,70 a20,10 0 0,1 40,0 z" fill={K.metal} stroke={K.edge} /><rect x="113" y="70" width="14" height="44" fill={K.metal} stroke={K.edge} /><path d="M109,114 h22 a3,3 0 0,1 3,3 v5 h-28 v-5 a3,3 0 0,1 3,-3 z" fill={K.metal} stroke={K.edge} /><line x1="106" y1="132" x2="134" y2="132" stroke={K.ok} /><Label x={86} y={146} c={K.ok}>Ø ≈ 1,5 D</Label><line x1="142" y1="114" x2="142" y2="122" stroke={K.ok} strokeWidth="2" /><Label x={146} y={122} c={K.ok}>h ≈ 0,5 D</Label>
    <g transform="translate(0,6)"><Label x={14} y={170} c={K.txt}>Fraisé 100° (NF L) : tête affleurante,</Label><Label x={14} y={182} c={K.txt}>logement fraisé à la bonne profondeur</Label></g></Frame>),
};

/* ---------- 4. Rivet aveugle CherryMax / Opti-Blind ---------- */
const BL = {
  avant: () => (<Frame title="Rivet aveugle avant pose"><Stack y={70} w={16} /><path d="M100,70 l8,-10 h24 l8,10 z" fill={K.metal} stroke={K.edge} /><rect x="112" y="70" width="16" height="64" fill={K.metal} stroke={K.edge} /><rect x="117" y="30" width="6" height="112" fill={K.metal2} stroke={K.edge} /><rect x="114" y="134" width="12" height="10" fill={K.metal2} stroke={K.edge} /><Label x={130} y={40}>tige (mandrin)</Label><Label x={132} y={140}>douille</Label><Label x={14} y={186}>accès d'un seul côté : face arrière fermée</Label></Frame>),
  pendant: () => (<Frame title="Rivet aveugle pendant la pose"><Stack y={70} w={16} /><path d="M100,70 l8,-10 h24 l8,10 z" fill={K.metal} stroke={K.edge} /><rect x="112" y="70" width="16" height="44" fill={K.metal} stroke={K.edge} /><ellipse cx="120" cy="122" rx="15" ry="9" fill={K.metal} stroke={K.edge} /><rect x="117" y="20" width="6" height="104" fill={K.metal2} stroke={K.edge} /><rect x="96" y="30" width="48" height="26" rx="4" fill="#3a4c70" stroke={K.edge} /><Label x={148} y={44}>riveteuse (nez)</Label><Arrow x1={120} y1={24} x2={120} y2={4} /><Label x={140} y={126} c={K.amber}>bulbe formé côté aveugle</Label></Frame>),
  apres: () => (<Frame title="Rivet aveugle après pose"><Stack y={70} w={16} /><path d="M100,70 l8,-10 h24 l8,10 z" fill={K.metal} stroke={K.edge} /><path d="M112,62 l3,-3 h10 l3,3" fill="none" stroke={K.ok} strokeWidth="2" /><rect x="112" y="70" width="16" height="44" fill={K.metal} stroke={K.edge} /><ellipse cx="120" cy="120" rx="15" ry="8" fill={K.metal} stroke={K.edge} /><rect x="117" y="58" width="6" height="66" fill={K.metal2} stroke={K.edge} /><Label x={140} y={58} c={K.ok}>bague de verrouillage en place</Label><Label x={140} y={70} c={K.ok}>tige cassée affleurante</Label><Label x={140} y={130} c={K.txt}>bulbe plaqué (non visible)</Label></Frame>),
};

/* ---------- 5. Boulon ATA 67 + écrou à créneaux + goupille ---------- */
const castle = (y = 116, pin = 0) => (
  <g>
    <rect x="98" y={y} width="44" height="18" fill={K.sky} opacity="0.85" stroke={K.edge} />
    <rect x="98" y={y + 18} width="44" height="12" fill={K.sky} opacity="0.85" stroke={K.edge} />
    {[104, 118, 132].map((x) => <rect key={x} x={x} y={y + 18} width="6" height="12" fill="#0d1526" />)}
    {pin === 1 && <rect x="96" y={y + 22} width="48" height="4" rx="2" fill={K.amber} />}
    {pin === 2 && <><circle cx="94" cy={y + 24} r="4" fill="none" stroke={K.amber} strokeWidth="3" /><rect x="97" y={y + 22} width="32" height="4" rx="2" fill={K.amber} /><path d={`M129,${y + 24} H146 V${y + 2}`} fill="none" stroke={K.amber} strokeWidth="3.5" /><path d={`M126,${y + 26} V${y + 42} Q126,${y + 50} 116,${y + 50}`} fill="none" stroke={K.amber} strokeWidth="3.5" /></>}
  </g>
);
const BO = {
  avant: () => (<Frame title="Boulon de commande avant serrage"><Stack y={60} w={22} t1={20} t2={20} /><rect x="98" y="40" width="44" height="14" fill={K.metal} stroke={K.edge} /><rect x="100" y="54" width="40" height="5" fill={K.metal2} stroke={K.edge} /><rect x="109" y="59" width="22" height="80" fill={K.metal} stroke={K.edge} /><rect x="100" y="101" width="40" height="5" fill={K.metal2} stroke={K.edge} /><Label x={146} y={50}>tête (sens défini au plan)</Label><Label x={146} y={106}>rondelle sous écrou</Label><g transform="translate(0,26)">{castle(110, 0)}</g><Label x={14} y={190}>écrou à créneaux neuf + goupille neuve</Label></Frame>),
  pendant: () => (<Frame title="Serrage au couple et alignement du créneau"><Stack y={40} w={22} t1={20} t2={20} /><rect x="98" y="20" width="44" height="14" fill={K.metal} stroke={K.edge} /><rect x="109" y="34" width="22" height="104" fill={K.metal} stroke={K.edge} /><rect x="100" y="81" width="40" height="5" fill={K.metal2} stroke={K.edge} /><rect x="117" y="104" width="6" height="6" rx="3" fill={K.dark} />{castle(86, 0)}<path d="M160,96 a30,12 0 1,1 -80,0" fill="none" stroke={K.amber} strokeWidth="1.6" markerEnd="url(#qa)" /><Label x={14} y={150}>couple mini atteint → poursuivre jusqu'au</Label><Label x={14} y={162}>créneau suivant, SANS dépasser le maxi</Label><Label x={14} y={180} c={K.ko}>jamais desserrer pour aligner</Label></Frame>),
  apres: () => (<Frame title="Goupille posée et rabattue"><Stack y={40} w={22} t1={20} t2={20} /><rect x="98" y="20" width="44" height="14" fill={K.metal} stroke={K.edge} /><rect x="109" y="34" width="22" height="98" fill={K.metal} stroke={K.edge} /><rect x="100" y="81" width="40" height="5" fill={K.metal2} stroke={K.edge} />{castle(86, 2)}<Label x={152} y={96} c={K.ok}>jambe rabattue sur le pan</Label><Label x={136} y={150} c={K.ok}>jambe rabattue sur le bout</Label><Label x={14} y={176}>double contrôle croisé ATA 67 signé</Label></Frame>),
};

/* ---------- 6. Écrous autofreinés ---------- */
const nut = (x, y, nylon) => (
  <g>
    <rect x={x} y={y} width="44" height="26" fill={K.sky} opacity="0.85" stroke={K.edge} />
    {nylon ? <rect x={x + 2} y={y + 18} width="40" height="8" fill="#e6edf7" opacity="0.9" stroke={K.edge} /> : <path d={`M${x},${y + 26} q22,-6 44,0`} fill="none" stroke={K.ko} strokeWidth="2" />}
  </g>
);
const NU = {
  avant: () => (<Frame title="Deux technologies d'écrou autofreiné">{nut(30, 60, true)}<Label x={20} y={104}>insert nylon</Label><Label x={20} y={116} c={K.ko}>≤ 120 °C</Label>{nut(150, 60, false)}<Label x={140} y={104}>tout métal</Label><Label x={140} y={116} c={K.ok}>zone chaude</Label><Label x={14} y={160}>tout métal : filet ovalisé / fendu</Label><Label x={14} y={172}>qui frotte sur la vis</Label></Frame>),
  pendant: () => (<Frame title="Mesure du couple de freinage"><Stack y={50} w={20} /><rect x="110" y="30" width="20" height="120" fill={K.metal2} stroke={K.edge} /><Thread x={110} y={100} w={20} h={50} />{nut(98, 96, true)}<path d="M156,110 a36,12 0 1,1 -72,0" fill="none" stroke={K.amber} strokeWidth="1.6" markerEnd="url(#qa)" /><Label x={14} y={170}>couple de freinage mesuré AVANT</Label><Label x={14} y={182}>contact : doit être dans [mini ; maxi]</Label></Frame>),
  apres: () => (<Frame title="Dépassement de filets après serrage"><Stack y={50} w={20} /><rect x="110" y="30" width="20" height="100" fill={K.metal2} stroke={K.edge} /><Thread x={110} y={96} w={20} h={34} />{nut(98, 94, true)}<line x1="140" y1="120" x2="140" y2="130" stroke={K.ok} strokeWidth="2" /><Label x={146} y={128} c={K.ok}>≥ 2 filets complets</Label><Label x={14} y={160}>chanfrein de la vis non compté</Label><Label x={14} y={172} c={K.ko}>couple de freinage &lt; mini : écrou rebuté</Label></Frame>),
};

/* ---------- 7. Clecos ---------- */
const CLECO = [["argent", "#c8d6ea", "2,4 mm (3/32 po)"], ["cuivre", "#c8743a", "3,2 mm (1/8 po)"], ["noir", "#2b2f36", "4,0 mm (5/32 po)"], ["or", "#d9b44a", "4,8 mm (3/16 po)"]];
const cleco = (x, y, color, open) => (
  <g>
    <rect x={x - 12} y={y} width="24" height="34" rx="4" fill={color} stroke={K.edge} />
    <rect x={x - 4} y={y - 14} width="8" height="14" fill={K.metal2} stroke={K.edge} />
    <path d={open ? `M${x - 3},${y + 34} l-5,40 h4 l4,-34 M${x + 3},${y + 34} l5,40 h-4 l-4,-34` : `M${x - 3},${y + 34} v40 h3 v-40 M${x + 3},${y + 34} v40 h-3 v-40`} fill={K.metal} stroke={K.edge} />
    {!open && <path d={`M${x - 6},${y + 74} l3,-4 M${x + 6},${y + 74} l-3,-4`} stroke={K.metal} strokeWidth="3" />}
  </g>
);
const CL = {
  avant: () => (<Frame title="Code couleur des clecos">{CLECO.map(([n, c, d], i) => <g key={n}>{cleco(40 + i * 54, 30, c, false)}<Label x={40 + i * 54} y={160} a="middle">{n}</Label><Label x={40 + i * 54} y={174} a="middle" c={K.amber}>{d.split(" ")[0]}</Label></g>)}<Label x={14} y={194}>diamètre de perçage correspondant</Label></Frame>),
  pendant: () => (<Frame title="Pose du cleco à la pince"><Stack y={110} w={14} t1={16} t2={16} />{cleco(120, 30, "#c8743a", true)}<Arrow x1={160} y1={20} x2={136} y2={34} /><Label x={150} y={16} c={K.amber}>pince : poussoir enfoncé</Label><Label x={146} y={96}>doigts écartés, insérés</Label></Frame>),
  apres: () => (<Frame title="Cleco relâché : tôles plaquées"><Stack y={80} w={14} t1={16} t2={16} /><rect x="108" y="46" width="24" height="34" rx="4" fill="#c8743a" stroke={K.edge} /><path d="M117,80 v34 l-6,6 h4 l5,-5 M123,80 v34 l6,6 h-4 l-5,-5" fill={K.metal} stroke={K.edge} /><Label x={140} y={130} c={K.ok}>doigts en butée sous la tôle</Label><Label x={140} y={60} c={K.ok}>ressort : plaquage</Label><Label x={14} y={176}>1 cleco tous les 4 à 6 trous,</Label><Label x={14} y={188}>dépose avant pose définitive</Label></Frame>),
};

/* ---------- 8. B-nut, colliers et métallisation ---------- */
const BN = {
  avant: () => (<Frame title="Raccord B-nut serré à deux clés"><rect x="20" y="90" width="80" height="14" fill={K.metal2} stroke={K.edge} /><rect x="100" y="80" width="40" height="34" fill={K.sky} opacity="0.85" stroke={K.edge} /><rect x="140" y="84" width="34" height="26" fill={K.metal} stroke={K.edge} /><rect x="174" y="90" width="50" height="14" fill={K.metal2} stroke={K.edge} /><rect x="108" y="40" width="10" height="40" fill="#3a4c70" stroke={K.edge} /><Label x={74} y={36}>clé dynamométrique</Label><rect x="150" y="114" width="10" height="44" fill={K.amber} /><Label x={150} y={174} c={K.amber}>clé de maintien</Label><Label x={14} y={194}>le tube ne doit JAMAIS tourner</Label></Frame>),
  pendant: () => (<Frame title="Collier à garniture élastomère"><circle cx="120" cy="96" r="22" fill="none" stroke={K.edge} strokeWidth="3" /><circle cx="120" cy="96" r="16" fill={K.metal2} stroke={K.edge} /><path d="M120,70 a26,26 0 1,1 -1,0" fill="none" stroke={K.ok} strokeWidth="5" /><path d="M120,70 a26,26 0 1,1 -1,0" fill="none" stroke={K.metal} strokeWidth="2" /><rect x="114" y="54" width="40" height="10" fill={K.metal} stroke={K.edge} /><rect x="20" y="40" width="200" height="14" fill={K.plate} stroke={K.edge} /><rect x="20" y="40" width="200" height="14" fill="url(#qh)" /><Label x={160} y={110} c={K.ok}>garniture</Label><Label x={14} y={150}>colliers NSA / ECS : bon Ø, garniture intacte</Label><Label x={14} y={162}>jeu mini harnais / tube respecté (anti-chafing)</Label></Frame>),
  apres: () => (<Frame title="Métallisation : décaper, serrer, mesurer, protéger"><rect x="20" y="110" width="200" height="16" fill={K.plate} stroke={K.edge} /><rect x="20" y="110" width="200" height="16" fill="url(#qh)" /><rect x="96" y="104" width="48" height="6" fill={K.metal2} /><Label x={86} y={140} c={K.amber}>zone décapée</Label><rect x="104" y="88" width="32" height="16" fill={K.amber} opacity="0.8" stroke={K.edge} /><path d="M136,96 q30,-30 70,-40" fill="none" stroke={K.metal} strokeWidth="4" strokeDasharray="3 2" /><Label x={160} y={52}>tresse</Label><circle cx="60" cy="60" r="16" fill="#0d1526" stroke={K.sky} /><Label x={60} y={64} a="middle" c={K.sky}>mΩ</Label><path d="M70,72 L104,92 M50,74 L40,110" stroke={K.sky} strokeWidth="1.4" /><Label x={14} y={164} c={K.ok}>4 fils : R &lt; 2,5 mΩ</Label><Label x={14} y={176}>puis re-protection (vernis / PR)</Label></Frame>),
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
          <button key={x.id} type="button" role="tab" aria-selected={sel === x.id} onClick={() => setSel(x.id)}
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
        <div className="grid gap-3 md:grid-cols-3">
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
