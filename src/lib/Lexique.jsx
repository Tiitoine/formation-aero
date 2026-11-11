/* ============================================================
   LEXIQUE ATELIER · pour l'apprenant en reconversion
   Chaque notion : 1) le pourquoi physique, 2) à quoi ça ressemble
   (schéma coté et légendé), 3) comment l'écrire dans la gamme.
   ============================================================ */
import React, { useMemo, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";

const C = { ink: "#e6edf7", txt: "#8fa0bd", line: "#9fb3d1", fill: "#1b2a47", fill2: "#26385c", sky: "#3b9eff", amber: "#ffb020", ok: "#3ddc97", ko: "#ff5d6c", vio: "#b48cff", glass: "#7fc4ff", bg: "#0b1220" };
const MONO = "JetBrains Mono, monospace";
const SANS = "Barlow, sans-serif";

const Fig = ({ label, children, h = 130 }) => (
  <svg viewBox={`0 0 300 ${h}`} className="svg-halo h-auto w-full" role="img" aria-label={label}>
    <defs>
      <marker id="lxA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill={C.line} /></marker>
      <pattern id="lxH" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#4d6690" strokeWidth="1" /></pattern>
      <pattern id="lxH2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#4d6690" strokeWidth="1" /></pattern>
    </defs>
    {children}
  </svg>
);
const Tx = ({ x, y, c = C.txt, a = "start", s = 10, w = 400, m = false, children }) => <text x={x} y={y} fill={c} fontSize={s} fontWeight={w} textAnchor={a} fontFamily={m ? MONO : SANS}>{children}</text>;
const Dim = ({ x1, y1, x2, y2, t, tx, ty, a = "middle", c = C.line }) => (
  <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="0.9" markerStart="url(#lxA)" markerEnd="url(#lxA)" /><Tx x={tx} y={ty} a={a} c={C.ink} m>{t}</Tx></g>
);
const Lead = ({ x1, y1, x2, y2, t, a = "start", c = C.txt }) => (
  <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.txt} strokeWidth="0.7" /><circle cx={x1} cy={y1} r="1.6" fill={C.txt} /><Tx x={+x2 + (a === "start" ? 3 : -3)} y={+y2 + 3.5} a={a} c={c}>{t}</Tx></g>
);

/* ---------- schémas ---------- */
const S = {
  running: () => (
    <Fig label="Courbe couple-angle d'un écrou autofreiné : couple de freinage puis serrage">
      <line x1="40" y1="108" x2="280" y2="108" stroke={C.line} markerEnd="url(#lxA)" /><line x1="40" y1="108" x2="40" y2="12" stroke={C.line} markerEnd="url(#lxA)" />
      <Tx x="276" y="122" a="end">angle de rotation de l'écrou</Tx><Tx x="46" y="14">couple lu sur la clé</Tx>
      <polyline points="40,108 60,84 170,84 182,84 260,30" fill="none" stroke={C.amber} strokeWidth="2" />
      <line x1="40" y1="84" x2="170" y2="84" stroke={C.amber} strokeDasharray="3 3" strokeWidth="0.8" />
      <Tx x="70" y="78" c={C.amber}>running torque (frein de l'écrou)</Tx>
      <Lead x1="214" y1="61" x2="196" y2="44" t="serrage réel" a="end" />
      <line x1="260" y1="30" x2="260" y2="108" stroke={C.txt} strokeDasharray="2 3" strokeWidth="0.7" />
      <Tx x="254" y="26" a="end" c={C.ink} m>couple final = nominal + running</Tx>
    </Fig>
  ),
  grip: () => (
    <Fig label="Longueur de serrage : épaisseur totale serrée entre la tête et l'écrou">
      <g transform="translate(40 0)">
      <rect x="90" y="40" width="120" height="22" fill="url(#lxH)" stroke={C.line} /><rect x="90" y="62" width="120" height="18" fill="url(#lxH2)" stroke={C.line} />
      <path d="M134,30 H166 V40 H134 Z" fill={C.fill2} stroke={C.ink} />
      <rect x="143" y="40" width="14" height="40" fill="#c9d3e3" stroke={C.ink} />
      <rect x="143" y="80" width="14" height="22" fill="#c9d3e3" stroke={C.ink} />{[84, 89, 94, 99].map((y) => <line key={y} x1="143" y1={y} x2="157" y2={y + 3} stroke="#5b7299" />)}
      <rect x="132" y="80" width="36" height="12" fill={C.fill2} stroke={C.ink} />
      <Dim x1={226} y1={40} x2={226} y2={80} t="grip" tx={232} ty={63} a="start" />
      <line x1="210" y1="40" x2="232" y2="40" stroke={C.txt} strokeWidth="0.6" /><line x1="210" y1="80" x2="232" y2="80" stroke={C.txt} strokeWidth="0.6" />
      </g>
      <Lead x1="190" y1="56" x2="112" y2="22" t="partie lisse" a="end" />
      <Lead x1="190" y1="96" x2="112" y2="112" t="filets hors tôles" a="end" />
    </Fig>
  ),
  martyr: () => (
    <Fig label="Perçage d'un stratifié carbone avec plaque martyre en sortie de foret">
      <rect x="60" y="40" width="180" height="26" fill="#3a4250" stroke={C.line} />{[46, 52, 58].map((y) => <line key={y} x1="60" x2="240" y1={y} y2={y} stroke="#5d6570" strokeWidth="0.6" />)}
      <rect x="60" y="66" width="180" height="16" fill="url(#lxH)" stroke={C.amber} />
      <path d="M144,8 H156 V40 L150,50 L144,40 Z" fill="#c9d3e3" stroke={C.ink} />
      <line x1="150" y1="4" x2="150" y2="96" stroke={C.txt} strokeDasharray="8 3 2 3" strokeWidth="0.6" />
      <Lead x1="70" y1="76" x2="40" y2="100" t="plaque martyre serrée" c={C.amber} />
      <Lead x1="230" y1="50" x2="246" y2="22" t="stratifié CFRP" a="end" />
      <Tx x="150" y="120" a="middle" c={C.ko}>sans martyr : les derniers plis éclatent en sortie</Tx>
    </Fig>
  ),
  chafing: () => (
    <Fig label="Harnais électrique tenu par un collier à garniture élastomère fixé sur la structure, à distance du tube hydraulique">
      <rect x="20" y="6" width="260" height="10" fill="url(#lxH)" stroke={C.line} /><Tx x="24" y="28">structure</Tx>
      <rect x="146" y="16" width="8" height="14" fill="#9fb3d1" stroke={C.ink} />
      <line x1="20" y1="44" x2="280" y2="44" stroke={C.amber} strokeWidth="10" strokeLinecap="round" /><Tx x="30" y="64" c={C.amber}>harnais électrique</Tx>
      <circle cx="150" cy="44" r="10" fill="none" stroke={C.ok} strokeWidth="4" /><circle cx="150" cy="44" r="13" fill="none" stroke="#9fb3d1" strokeWidth="1.4" />
      <Lead x1="162" y1="38" x2="190" y2="24" t="collier à garniture" c={C.ok} /><Tx x="193" y="38" c={C.ok}>élastomère</Tx>
      <rect x="20" y="84" width="260" height="14" rx="7" fill="#7f8ba0" stroke={C.ink} /><Tx x="30" y="116">tube hydraulique</Tx>
      <Dim x1={238} y1={50} x2={238} y2={84} t="jeu mini" tx={244} ty={72} a="start" />
      <Tx x="290" y="116" a="end" c={C.ko}>contact = usure de la gaine</Tx>
    </Fig>
  ),
  peelply: () => (
    <Fig label="Coupe d'un stratifié : peel ply sur la face extérieure, pli de verre sur la face d'accostage aluminium">
      <rect x="20" y="30" width="180" height="4" fill="none" stroke={C.vio} strokeDasharray="5 3" /><Lead x1="198" y1="32" x2="210" y2="18" t="peel ply (retiré)" c={C.vio} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x="20" y={34 + i * 7} width="180" height="7" fill={i % 2 ? "#4d545e" : "#5d6570"} stroke="#2a313b" strokeWidth="0.4" />)}
      <rect x="20" y="76" width="180" height="5" fill={C.glass} /><Lead x1="196" y1="78" x2="210" y2="66" t="pli de verre" c={C.glass} />
      <rect x="20" y="81" width="180" height="3" fill={C.amber} opacity="0.8" />
      <rect x="20" y="84" width="180" height="22" fill="url(#lxH)" stroke={C.line} /><Tx x="26" y="99" c={C.ink}>cadre aluminium</Tx>
      <Lead x1="196" y1="83" x2="210" y2="96" t="mastic PR" c={C.amber} />
      <Tx x="20" y="124">peel ply = surface propre · verre = barrière galvanique</Tx>
    </Fig>
  ),
  iso: () => (
    <Fig label="Isostatisme 3-2-1 : trois appuis sur A, deux sur B, un sur C">
      <path d="M70,60 L170,60 L220,30 L120,30 Z" fill={C.fill2} stroke={C.line} /><path d="M70,60 L70,100 L170,100 L170,60 Z" fill={C.fill} stroke={C.line} /><path d="M170,60 L220,30 L220,70 L170,100 Z" fill="#203152" stroke={C.line} />
      {[[90, 108], [150, 108], [196, 92]].map(([x, y], i) => <path key={i} d={`M${x - 5},${y + 6} L${x},${y - 2} L${x + 5},${y + 6} Z`} fill={C.sky} />)}
      <Tx x="96" y="124" c={C.sky}>A : 3 appuis (plan)</Tx>
      {[[60, 72], [60, 92]].map(([x, y], i) => <path key={i} d={`M${x - 8},${y - 5} L${x},${y} L${x - 8},${y + 5} Z`} fill={C.amber} />)}
      <Tx x="12" y="62" c={C.amber}>B : 2</Tx>
      <path d="M234,46 L226,50 L234,54 Z" fill={C.ok} /><Tx x="238" y="54" c={C.ok}>C : 1</Tx>
      <Tx x="150" y="16" a="middle" c={C.ink}>3 + 2 + 1 = 6 degrés de liberté bloqués</Tx>
    </Fig>
  ),
  mmc: () => (
    <Fig label="Maximum de matière sur un trou : le bonus s'ajoute à la tolérance de position">
      <circle cx="80" cy="64" r="36" fill="none" stroke={C.line} strokeWidth="1.4" /><circle cx="80" cy="64" r="30" fill="none" stroke={C.ok} strokeDasharray="4 3" />
      <Tx x="80" y="118" a="middle" c={C.ok}>Ø mini = maximum de matière</Tx>
      <circle cx="220" cy="64" r="6" fill="none" stroke={C.sky} strokeWidth="1.4" /><circle cx="220" cy="64" r="11" fill="none" stroke={C.amber} strokeDasharray="3 2" />
      <Tx x="220" y="40" a="middle" c={C.sky}>Ø0,1 au maxi matière</Tx><Tx x="220" y="96" a="middle" c={C.amber}>Ø0,1 + bonus</Tx>
      <Tx x="220" y="110" a="middle" m c={C.ink}>bonus = Ø réel − Ø mini</Tx>
      <line x1="120" y1="64" x2="196" y2="64" stroke={C.txt} markerEnd="url(#lxA)" strokeWidth="0.8" />
    </Fig>
  ),
  dropoff: () => (
    <Fig label="Arrêt de plis en escalier (drop-off) avec rampe d'au moins 1 pour 20">
      {[0, 1, 2, 3].map((i) => <rect key={i} x="30" y={70 - i * 8} width={200 - i * 40} height="8" fill={i % 2 ? "#5d6570" : "#4d545e"} stroke="#2a313b" strokeWidth="0.5" />)}
      <rect x="30" y="78" width="250" height="10" fill="#3a4250" stroke="#2a313b" />
      <path d="M30,46 H110 L270,70" fill="none" stroke={C.sky} strokeDasharray="5 3" /><Tx x="190" y="50" c={C.sky}>peau extérieure</Tx>
      <Dim x1={110} y1={100} x2={150} y2={100} t="≥ 20 × e" tx={130} ty={114} />
      <line x1="110" y1="62" x2="110" y2="104" stroke={C.txt} strokeWidth="0.5" /><line x1="150" y1="70" x2="150" y2="104" stroke={C.txt} strokeWidth="0.5" />
      <Lead x1="108" y1="56" x2="150" y2="24" t="marche = épaisseur e d'un pli" />
    </Fig>
  ),
  cte: () => (
    <Fig label="Cote encadrée théoriquement exacte et cadre de localisation">
      <rect x="40" y="30" width="160" height="70" fill={C.fill} stroke={C.line} /><circle cx="150" cy="58" r="8" fill={C.bg} stroke={C.ink} />
      <line x1="40" y1="108" x2="150" y2="108" stroke={C.line} markerStart="url(#lxA)" markerEnd="url(#lxA)" /><line x1="150" y1="66" x2="150" y2="112" stroke={C.txt} strokeWidth="0.5" />
      <rect x="82" y="111" width="26" height="14" fill="none" stroke={C.ink} /><Tx x="95" y="122" a="middle" m c={C.ink}>50</Tx>
      <line x1="158" y1="54" x2="214" y2="30" stroke={C.txt} strokeWidth="0.7" />
      <g transform="translate(214 18)"><rect width="80" height="18" fill="none" stroke={C.ink} />{[18, 44, 56, 68].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="18" stroke={C.ink} />)}<Tx x="9" y="13" a="middle" m c={C.ink}>⌖</Tx><Tx x="31" y="13" a="middle" m c={C.ink} s={9}>Ø0,1</Tx><Tx x="50" y="13" a="middle" m c={C.ink} s={9}>A</Tx><Tx x="62" y="13" a="middle" m c={C.ink} s={9}>B</Tx><Tx x="74" y="13" a="middle" m c={C.ink} s={9}>C</Tx></g>
      <Tx x="214" y="56">cote encadrée :</Tx><Tx x="214" y="69">pas de tolérance</Tx><Tx x="214" y="82">propre, c'est le</Tx><Tx x="214" y="95">cadre qui tolère</Tx>
    </Fig>
  ),
  ln2: () => (
    <Fig label="Frettage à l'azote liquide : la bague contractée entre sans effort puis serre en revenant à l'ambiante">
      <rect x="30" y="24" width="70" height="80" fill="url(#lxH)" stroke={C.line} /><rect x="54" y="24" width="22" height="80" fill={C.bg} stroke={C.ink} />
      <Tx x="65" y="118" a="middle" m c={C.ink}>alésage Ø20,000</Tx>
      <rect x="130" y="30" width="18" height="68" fill={C.glass} opacity="0.6" stroke={C.glass} /><Tx x="139" y="20" a="middle" c={C.glass}>−196 °C</Tx><Tx x="139" y="114" a="middle" m c={C.glass}>Ø19,952</Tx>
      <rect x="196" y="30" width="22" height="68" fill="#b08a4a" stroke={C.amber} /><Tx x="207" y="20" a="middle" c={C.amber}>+20 °C</Tx><Tx x="207" y="114" a="middle" m c={C.amber}>Ø20,030</Tx>
      <Tx x="234" y="56" c={C.ink}>Δ = 0,078 mm</Tx><Tx x="234" y="70">jeu de pose</Tx><Tx x="234" y="84">à froid</Tx>
    </Fig>
  ),
  bnut: () => (
    <Fig label="Raccord B-nut : écrou, manchon, tube évasé sur le cône du raccord fixe, clé de contre-couple">
      <rect x="20" y="54" width="120" height="16" fill="#c9d3e3" stroke={C.ink} /><Tx x="24" y="88">tube</Tx>
      <path d="M140,54 L160,46 V78 L140,70 Z" fill="#c9d3e3" stroke={C.ink} />
      <rect x="112" y="44" width="30" height="36" fill={C.fill2} stroke={C.line} /><Tx x="108" y="40" a="end">manchon</Tx>
      <rect x="140" y="36" width="54" height="52" fill="url(#lxH)" stroke={C.line} /><Tx x="167" y="30" a="middle" c={C.ink}>B-nut</Tx>
      <path d="M160,46 L176,54 V70 L160,78 Z" fill="#7f8ba0" stroke={C.ink} />
      <rect x="194" y="40" width="70" height="44" fill={C.fill} stroke={C.line} /><Tx x="229" y="100" a="middle">raccord fixe</Tx>
      <path d="M244,26 v-12 h20 v12" stroke={C.ok} strokeWidth="2.4" fill="none" /><line x1="254" y1="26" x2="254" y2="40" stroke={C.ok} strokeWidth="2.4" />
      <Tx x="238" y="18" a="end" c={C.ok}>contre-</Tx><Tx x="238" y="30" a="end" c={C.ok}>couple</Tx>
      <Tx x="168" y="122" a="middle" c={C.amber}>cône 37° métal sur métal : pas de joint</Tx>
    </Fig>
  ),
  oac: () => (
    <Fig label="Couche de conversion anodique sur aluminium sous primaire : épaisseurs exagérées">
      <rect x="40" y="70" width="180" height="40" fill="url(#lxH)" stroke={C.line} /><Tx x="46" y="104" c={C.ink}>aluminium 7075 ou 2024</Tx>
      <rect x="40" y="58" width="180" height="12" fill="#6b5e8f" stroke={C.vio} />{Array.from({ length: 30 }).map((_, i) => <line key={i} x1={44 + i * 6} y1="59" x2={44 + i * 6} y2="69" stroke={C.vio} strokeWidth="0.6" />)}
      <rect x="40" y="46" width="180" height="12" fill="#4f7a3a" stroke={C.ok} />
      <Lead x1="214" y1="64" x2="228" y2="80" t="anodisation" c={C.vio} />
      <Lead x1="214" y1="52" x2="228" y2="42" t="primaire" c={C.ok} />
      <Tx x="40" y="14" c={C.ink}>OAC = oxydation anodique chromique</Tx><Tx x="40" y="28">TSA = anodisation sulfo-tartrique (sans chrome VI)</Tx>
    </Fig>
  ),
  hp: () => (
    <Fig label="Point d'arrêt dans une gamme MES : l'opération suivante est bloquée jusqu'au visa Qualité" h={110}>
      {[["0050", 20, C.line], ["0060", 110, C.ko], ["0070", 200, C.line]].map(([op, x, c]) => <g key={op}><rect x={x} y="36" width="80" height="34" rx="4" fill={C.fill} stroke={c} strokeWidth={c === C.ko ? 2 : 1} /><Tx x={x + 40} y="57" a="middle" m c={C.ink}>op. {op}</Tx></g>)}
      <line x1="100" y1="53" x2="110" y2="53" stroke={C.line} markerEnd="url(#lxA)" /><line x1="190" y1="53" x2="200" y2="53" stroke={C.ko} strokeDasharray="3 2" markerEnd="url(#lxA)" />
      <Tx x="150" y="26" a="middle" c={C.ko} w={700}>HOLD POINT</Tx>
      <Tx x="150" y="90" a="middle">visa du contrôleur habilité, puis le MES libère 0070</Tx>
    </Fig>
  ),
  life: () => (
    <Fig label="Durée de stockage puis durée d'application d'un mastic bicomposant" h={110}>
      <line x1="20" y1="60" x2="285" y2="60" stroke={C.line} markerEnd="url(#lxA)" />
      <rect x="20" y="46" width="150" height="14" fill={C.sky} opacity="0.35" /><Tx x="24" y="40" c={C.sky}>shelf life : stock, jusqu'à la date limite du lot</Tx>
      <line x1="170" y1="44" x2="170" y2="80" stroke={C.ink} /><Tx x="170" y="94" a="middle" m c={C.ink}>mélange t0</Tx>
      <rect x="170" y="60" width="70" height="14" fill={C.amber} opacity="0.5" /><Tx x="205" y="108" a="middle" c={C.amber}>pot life (ex. 2 h)</Tx>
      <Tx x="282" y="78" a="end" c={C.ko}>jeté</Tx>
    </Fig>
  ),
  dci: () => (
    <Fig label="Double contrôle indépendant d'une commande de vol : deux visas de deux personnes différentes" h={110}>
      <rect x="30" y="50" width="160" height="12" rx="6" fill="#c9d3e3" stroke={C.ink} /><circle cx="36" cy="56" r="10" fill={C.fill2} stroke={C.ink} /><circle cx="184" cy="56" r="10" fill={C.fill2} stroke={C.ink} />
      <Tx x="110" y="40" a="middle" c={C.ink}>bielle de commande ATA 67</Tx>
      <rect x="204" y="28" width="92" height="22" rx="3" fill="none" stroke={C.sky} /><Tx x="250" y="43" a="middle" m c={C.sky}>1 : monteur</Tx>
      <rect x="204" y="62" width="92" height="22" rx="3" fill="none" stroke={C.ok} /><Tx x="250" y="77" a="middle" m c={C.ok}>2 : contrôleur</Tx>
      <Tx x="150" y="104" a="middle">le 2e n'a pas participé au montage</Tx>
    </Fig>
  ),
  ed: () => (
    <Fig label="Distance au bord et pas des fixations mesurés depuis l'axe des trous">
      <rect x="30" y="30" width="240" height="70" fill={C.fill} stroke={C.line} />
      {[90, 160, 230].map((x) => <g key={x}><circle cx={x} cy="56" r="7" fill={C.bg} stroke={C.ink} /><line x1={x} y1="44" x2={x} y2="68" stroke={C.txt} strokeWidth="0.5" strokeDasharray="4 2" /></g>)}
      <line x1="30" y1="56" x2="270" y2="56" stroke={C.txt} strokeWidth="0.5" strokeDasharray="6 2 2 2" />
      <Dim x1={30} y1={88} x2={90} y2={88} t="ED ≥ 2D" tx={60} ty={84} />
      <Dim x1={90} y1={20} x2={160} y2={20} t="pas 4D à 6D" tx={125} ty={15} />
      <Tx x="150" y="118" a="middle">toujours mesuré à l'axe du trou, jamais au bord du trou</Tx>
    </Fig>
  ),
  qn: () => (
    <Fig label="Circuit d'une QN : production, réparation standard ou décision du bureau d'études" h={120}>
      <rect x="10" y="44" width="70" height="30" rx="4" fill={C.fill} stroke={C.ko} /><Tx x="45" y="63" a="middle" m c={C.ink}>écart</Tx>
      <rect x="110" y="44" width="70" height="30" rx="4" fill={C.fill} stroke={C.amber} /><Tx x="145" y="63" a="middle" m c={C.ink}>QN SAP</Tx>
      <line x1="80" y1="59" x2="110" y2="59" stroke={C.line} markerEnd="url(#lxA)" />
      <rect x="208" y="14" width="86" height="30" rx="4" fill={C.fill} stroke={C.ok} /><Tx x="251" y="33" a="middle" s={9} c={C.ink}>réparation std</Tx>
      <rect x="208" y="74" width="86" height="30" rx="4" fill={C.fill} stroke={C.sky} /><Tx x="251" y="93" a="middle" s={9} c={C.ink}>BE (DOA 21J)</Tx>
      <line x1="180" y1="52" x2="208" y2="30" stroke={C.line} markerEnd="url(#lxA)" /><line x1="180" y1="66" x2="208" y2="88" stroke={C.line} markerEnd="url(#lxA)" />
      <Tx x="150" y="118" a="middle">la Qualité production ne peut pas accepter un écart</Tx>
    </Fig>
  ),
};

export const LEXIQUE = [
  { id: "running", terme: "Couple de freinage", en: "running torque", famille: "Fixations",
    pourquoi: "Un écrou autofreiné (bague nylon ou filets ovalisés) frotte sur la vis avant même de serrer les pièces. Ce frottement consomme du couple : la clé l'affiche, mais il ne serre rien.",
    aspect: "Sur la courbe couple / angle, le palier du début est le running torque ; le serrage réel commence après.",
    gamme: "« Relever le couple de freinage à la clé, vérifier qu'il est dans la plage de l'écrou, puis appliquer couple nominal + couple de freinage relevé. »" },
  { id: "grip", terme: "Longueur de serrage", en: "grip length", famille: "Fixations",
    pourquoi: "La partie lisse de la tige doit traverser toute l'épaisseur serrée. Si des filets se trouvent dans les tôles, ils mordent dans l'alésage et la fixation travaille mal en cisaillement.",
    aspect: "Le grip est l'épaisseur totale entre la tête et l'écrou, mesurée à la jauge de grip avant de choisir la longueur de fixation.",
    gamme: "« Mesurer l'épaisseur à la jauge de grip à chaque trou, choisir le code de longueur correspondant (dash number), aucune rondelle de compensation sans plan. »" },
  { id: "martyr", terme: "Plaque martyre", en: "backing plate", famille: "Composites",
    pourquoi: "À la sortie du foret, les derniers plis de carbone ne sont plus soutenus : ils se soulèvent et éclatent (délaminage de sortie). Une plaque serrée derrière les soutient.",
    aspect: "Une plaque sacrifiée (bois, composite ou alu selon EI) serrée contre la face de sortie, percée en même temps que la pièce.",
    gamme: "« Plaquer la plaque martyre en sortie, percer au foret carbure à la vitesse EICM, contrôler visuellement la sortie de chaque trou. »" },
  { id: "chafing", terme: "Frottement d'usure", en: "chafing", famille: "Installations",
    pourquoi: "Les vibrations du rotor font frotter en continu un harnais contre un tube ou une structure. La gaine s'use, le fil est mis à nu : court-circuit ou fuite.",
    aspect: "Un harnais maintenu à distance du tube par un collier à garniture élastomère, avec un jeu minimal prescrit.",
    gamme: "« Poser les colliers à garniture aux positions plan, vérifier le jeu mini harnais / tube et harnais / structure sur toute la longueur. »" },
  { id: "peelply", terme: "Peel ply et pli de verre", en: "peel ply / glass ply", famille: "Composites",
    pourquoi: "Le peel ply est un tissu arraché juste avant collage ou peinture : il laisse une surface propre et rugueuse. Le pli de verre, lui, reste dans la pièce : il isole le carbone de l'aluminium et empêche la corrosion galvanique.",
    aspect: "Peel ply sur la face extérieure (retiré), pli de verre sur la face d'accostage, contre le cadre aluminium, avec le mastic.",
    gamme: "« Retirer le peel ply juste avant application (heure tracée). Vérifier la présence du pli de verre sur la face d'accostage avant interposition PR. »" },
  { id: "iso", terme: "Isostatisme 3-2-1", en: "3-2-1 locating", famille: "Géométrie",
    pourquoi: "Une pièce libre a 6 mouvements possibles (3 glissements, 3 rotations). 3 appuis sur une face, 2 sur une autre et 1 butée les bloquent tous, sans contrainte.",
    aspect: "Appuis sur A (référence primaire), puis B, puis C, dans l'ordre du cadre de tolérance.",
    gamme: "« Mettre en appui sur A (3 points), puis B (2 points), puis C (1 butée), brider dans cet ordre, contrôler les appuis à la cale. »" },
  { id: "mmc", terme: "Maximum de matière Ⓜ", en: "MMC", famille: "Géométrie",
    pourquoi: "Un trou au plus petit diamètre laisse le moins de place à la fixation. S'il est plus grand, l'axe peut être un peu plus décalé sans gêner le montage : c'est le bonus.",
    aspect: "Le Ⓜ dans le cadre ⌖ Ø0,1 Ⓜ : zone de position agrandie du bonus = Ø réel − Ø mini.",
    gamme: "« Relever le Ø réel, calculer la zone autorisée (tolérance + bonus), contrôler la position avec le calibre fonctionnel ou la MMT. »" },
  { id: "dropoff", terme: "Arrêt de plis", en: "drop-off", famille: "Composites",
    pourquoi: "Un pli qui s'arrête crée une marche d'épaisseur. Si la marche est brutale, les efforts se concentrent et le stratifié délamine. Les plis s'arrêtent donc en escalier, sur une rampe douce.",
    aspect: "Marches successives d'un pli, longueur d'au moins 20 fois l'épaisseur du pli arrêté (rampe ≥ 1:20).",
    gamme: "« Aucune fixation ni perçage sur les arrêts de plis. Positionner la grille de perçage à partir de la limite de zone monolithique du plan. »" },
  { id: "cte", terme: "Cote encadrée (CTE)", en: "basic dimension", famille: "Géométrie",
    pourquoi: "Une cote encadrée donne la position théorique parfaite. Elle n'a pas de ± : c'est le cadre de tolérance géométrique qui dit de combien on peut s'en écarter.",
    aspect: "Un chiffre dans un rectangle, associé à un cadre ⌖ Ø0,1 | A | B | C.",
    gamme: "« Ne jamais appliquer la tolérance générale à une cote encadrée. Contrôler la localisation selon le cadre (MMT ou calibre). »" },
  { id: "ln2", terme: "Frettage à l'azote liquide", en: "LN₂ shrink fit", famille: "Ajustements",
    pourquoi: "Une bague plus grosse que son alésage (ajustement serré) ne peut pas entrer à froid sans arracher la matière. À −196 °C, elle rétrécit, entre sans effort, puis serre en se réchauffant.",
    aspect: "Bague bronze Ø20,030 à 20 °C, Ø19,952 à −196 °C : 0,078 mm de jeu de pose pendant quelques secondes.",
    gamme: "« EPI cryogéniques, immersion jusqu'à fin d'ébullition, pose immédiate sans forcer, contrôle après retour à l'ambiante. »" },
  { id: "bnut", terme: "Raccord B-nut", en: "B-nut fitting", famille: "Installations",
    pourquoi: "L'étanchéité vient du contact métal sur métal entre le tube évasé et le cône à 37°. Si le raccord fixe tourne pendant le serrage, le tube se vrille et l'étanchéité est perdue.",
    aspect: "Écrou (B-nut), manchon, tube évasé sur le cône du raccord fixe, clé de contre-couple sur le raccord fixe.",
    gamme: "« Clé de contre-couple sur le raccord fixe, couple selon diamètre (dash), trait de vernis témoin, freinage au fil si le plan l'exige. »" },
  { id: "oac", terme: "OAC / TSA", en: "chromic / tartaric-sulphuric anodising", famille: "Traitements",
    pourquoi: "L'anodisation transforme la surface de l'aluminium en une couche d'oxyde dure et isolante qui protège de la corrosion et fait accrocher le primaire. Le TSA remplace l'OAC pour supprimer le chrome VI (REACH).",
    aspect: "Couche de quelques micromètres sous le primaire. Une retouche après perçage ou ébavurage doit la reconstituer.",
    gamme: "« Retouche de protection selon EI sur toute zone mise à nu (perçage, ébavurage), avant pose humide. »" },
  { id: "hp", terme: "Point d'arrêt", en: "Hold Point", famille: "Qualité",
    pourquoi: "Certaines opérations ne peuvent plus être contrôlées une fois la suite montée (zone fermée, pièce cachée). Le point d'arrêt oblige un contrôleur à voir le travail avant de continuer.",
    aspect: "Dans le MES, l'opération suivante est bloquée tant que le contrôleur habilité n'a pas apposé son visa.",
    gamme: "« HP Qualité : contrôle de [quoi], critère [valeur plan], moyen [outil étalonné], visa du contrôleur avant op. suivante. »" },
  { id: "life", terme: "Shelf life et pot life", en: "shelf life / pot life", famille: "Produits",
    pourquoi: "Un mastic vieillit en stock (shelf life) et commence à durcir dès le mélange (pot life). Au-delà, il ne mouille plus les surfaces et l'étanchéité n'est plus garantie.",
    aspect: "Date limite sur l'étiquette du lot, heure de mélange notée, fenêtre d'application de quelques heures.",
    gamme: "« Saisir lot, date limite et heure de mélange dans le MES. Mélange périmé ou hors pot life : jeté, jamais utilisé. »" },
  { id: "dci", terme: "Double contrôle indépendant", en: "duplicate inspection", famille: "Qualité",
    pourquoi: "Sur une commande de vol, une seule erreur (goupille oubliée, freinage absent) peut faire perdre l'appareil. Une seconde personne qui n'a pas monté la pièce vérifie avec un regard neuf.",
    aspect: "Deux visas de deux personnes différentes, dont un contrôleur habilité indépendant du montage.",
    gamme: "« Double contrôle indépendant (ATA 67) : vérifier [freinage, sens, débattement], visa 1 monteur, visa 2 contrôleur habilité non intervenant. »" },
  { id: "ed", terme: "Distance au bord et pas", en: "edge distance / pitch", famille: "Fixations",
    pourquoi: "Trop près du bord, la fixation arrache la matière qui la retient. Trop près l'une de l'autre, les trous affaiblissent la tôle entre eux.",
    aspect: "Cotes mesurées depuis l'axe du trou : ED ≥ 2D sur métal, ≥ 2,5D sur composite ; pas de 4D à 6D.",
    gamme: "« Contrôler l'ED du premier trou de chaque rangée avant de percer la suite. Écart : arrêt et QN, aucun décalage de trou sans BE. »" },
  { id: "qn", terme: "QN (avis de non-conformité)", en: "quality notification", famille: "Qualité",
    pourquoi: "Tout écart à la définition approuvée doit être déclaré, tracé et décidé. La production (Part-21G) fabrique conforme ; seule la conception (DOA Part-21J) peut accepter ou réparer un écart hors standard.",
    aspect: "Avis SAP factuel : pièce, position, valeur mesurée, valeur plan, état. Puis réparation standard ou décision BE.",
    gamme: "« Bloquer l'opération, ouvrir la QN, attendre la décision. Une fois décidée : rédiger l'opération de réparation et la tracer jusqu'au visa. »" },
];

export default function LexiqueButton() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cur, setCur] = useState(LEXIQUE[0].id);
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return k ? LEXIQUE.filter((e) => `${e.terme} ${e.en} ${e.famille}`.toLowerCase().includes(k)) : LEXIQUE;
  }, [q]);
  const e = LEXIQUE.find((x) => x.id === cur) || LEXIQUE[0];
  const Svg = S[e.id];
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-sky/50 bg-sky/10 px-3 text-[12px] font-semibold text-ink hover:bg-sky/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky">
        <BookOpen size={14} />Lexique atelier
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/50" onClick={() => setOpen(false)}>
          <aside role="dialog" aria-label="Lexique atelier" className="flex h-full w-full max-w-3xl flex-col border-l border-line bg-panel shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <BookOpen size={18} className="text-sky" />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Lexique atelier · {LEXIQUE.length} notions</div>
                <div className="font-display text-lg font-semibold text-ink">Pourquoi · à quoi ça ressemble · comment l'écrire</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="rounded-lg border border-line p-2 text-muted hover:text-ink"><X size={16} /></button>
            </div>
            <div className="grid min-h-0 flex-1 md:grid-cols-[220px_1fr]">
              <div className="flex min-h-0 flex-col border-b border-line md:border-b-0 md:border-r">
                <label className="m-3 flex items-center gap-2 rounded-lg border border-line bg-bg px-2">
                  <Search size={14} className="text-muted" />
                  <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Chercher un terme" className="h-9 w-full bg-transparent text-[13px] text-ink outline-none" />
                </label>
                <div className="flex max-h-40 flex-col overflow-y-auto px-2 pb-2 md:max-h-none">
                  {list.map((x) => (
                    <button key={x.id} type="button" onClick={() => setCur(x.id)} className={`rounded-md px-2 py-1.5 text-left text-[13px] ${x.id === e.id ? "bg-sky/15 text-ink" : "text-muted hover:text-ink"}`}>
                      {x.terme}<span className="block font-mono text-[10px] text-muted">{x.en}</span>
                    </button>
                  ))}
                  {!list.length && <div className="px-2 py-3 text-[12px] text-muted">Aucun terme trouvé.</div>}
                </div>
              </div>
              <div className="min-h-0 overflow-y-auto p-4">
                <div className="font-mono text-[11px] uppercase tracking-wider text-sky">{e.famille} · {e.en}</div>
                <h3 className="font-display text-2xl font-semibold text-ink">{e.terme}</h3>
                <div className="mt-3 rounded-xl border border-line bg-bg p-3"><div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-sky">2 · À quoi ça ressemble</div>{Svg && <Svg />}<p className="mt-2 text-[12.5px] text-muted">{e.aspect}</p></div>
                <div className="mt-3 grid gap-3">
                  <div className="rounded-lg border border-line bg-panel2 p-3"><div className="font-mono text-[11px] uppercase tracking-wider text-amber">1 · Le pourquoi physique</div><p className="mt-1 text-[14px] leading-relaxed text-ink/90">{e.pourquoi}</p></div>
                  <div className="rounded-lg border border-line bg-panel2 p-3"><div className="font-mono text-[11px] uppercase tracking-wider text-ok">3 · Comment je l'écris dans ma gamme</div><p className="mt-1 font-mono text-[13px] leading-relaxed text-ink/90">{e.gamme}</p></div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
