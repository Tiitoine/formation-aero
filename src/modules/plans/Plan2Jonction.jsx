/* ============================================================
   PLAN N°2 · Plan d'ensemble · jonction cadre principal / plancher
   mécanique H160 (référence de formation 365A21-0050-01)
   Empilage CFRP / cornière Ti-6Al-4V / ferrure Al / bague p6,
   nomenclature E-BOM, ED et pas, sens de pose, procédés EI / EICM.
   Deux ateliers : audit géométrique (M4A) et E-BOM → M-BOM (M3).
   ============================================================ */
import React from "react";
import { Sheet, P, T, Dim, Leader, Bubble, Axis, Hot, Spot } from "./PlanKit.jsx";

/* ---------- nomenclature E-BOM (lue de bas en haut, au-dessus du cartouche) ---------- */
export const EBOM = [
  { rep: 1, qte: "1", des: "Panneau de plancher méca.", ref: "365A21-1104-01", mat: "CFRP", obs: "EICM perç." },
  { rep: 2, qte: "1", des: "Cornière de reprise", ref: "365A21-2210-03", mat: "Ti-6Al-4V", obs: "—" },
  { rep: 3, qte: "1", des: "Ferrure de cadre principal", ref: "365A21-3302-05", mat: "Al 7050-T7451", obs: "OAC+prim." },
  { rep: 4, qte: "1", des: "Bague épaulée Ø20 p6", ref: "ASN-A 2048-20", mat: "Bronze / acier", obs: "LN₂ n.4" },
  { rep: 5, qte: "10", des: "Hi-Lok fraisé 100° Ø4,8", ref: "ECS 1170-3T08", mat: "Ti-6Al-4V", obs: "humide n.3" },
  { rep: 6, qte: "10", des: "Collier Hi-Lok", ref: "ECS 1171-3", mat: "Al 7075", obs: "—" },
  { rep: 7, qte: "1", des: "Cale pelable feuillets 0,05", ref: "NF L 23-410-05", mat: "Al", obs: "si jeu > 0,05" },
  { rep: 8, qte: "A/R", des: "Mastic d'interposition", ref: "PR 1776 B2", mat: "Polysulfure", obs: "shelf life n.2" },
];

function Nomenclature({ x = 908, y0 = 710 }) {
  const cols = [30, 32, 146, 104, 80, 78];
  const heads = ["REP", "QTÉ", "DÉSIGNATION", "RÉFÉRENCE / NORME", "MATIÈRE", "OBS."];
  const rowH = 29;
  const xs = cols.reduce((a, w) => [...a, a[a.length - 1] + w], [x]);
  const row = (cells, yy, head) => (
    <g key={yy}>
      <rect x={x} y={yy} width={470} height={rowH} fill={head ? "#e4dfd0" : P.paper} stroke={P.ink} strokeWidth={head ? 1.4 : 0.8} />
      {xs.slice(1, -1).map((xx, i) => <line key={i} x1={xx} y1={yy} x2={xx} y2={yy + rowH} stroke={P.ink} strokeWidth="0.8" />)}
      {cells.map((c, i) => <T key={i} x={i < 2 ? xs[i] + cols[i] / 2 : xs[i] + 4} y={yy + 19} s={head ? 9 : 10} a={i < 2 ? "middle" : "start"} w={head || i === 0 ? 700 : 400}>{c}</T>)}
    </g>
  );
  return (
    <g>
      {row(heads, y0 - rowH, true)}
      {EBOM.map((r, i) => row([r.rep, r.qte, r.des, r.ref, r.mat, r.obs], y0 - rowH * (i + 2)))}
      <T x={x} y={y0 - rowH * (EBOM.length + 1) - 8} s={13} w={700}>NOMENCLATURE (E-BOM) · LECTURE DE BAS EN HAUT</T>
    </g>
  );
}

export function Plan2Drawing({ sel, onPick }) {
  const on = (n) => sel === n;
  const fx = 388; /* axe de la fixation verticale (ED 12 mm × 3 px depuis le bord du plancher x = 352) */
  return (
    <Sheet title="Plan d'ensemble 365A21-0050-01 · jonction cadre / plancher H160" onBackground={() => onPick(null)}
      cartouche={{ designation: "JONCTION CADRE / PLANCHER MÉCA.", appareil: "H160 · ATA 53", reference: "365A21-0050-01", indice: "C", matiere: "VOIR NOMENCLATURE", tolerances: "ISO 2768-mK", traitement: "Selon nomenclature et EI", echelle: "3:1", masse: "—" }}>

      {/* ---------------- COUPE B-B ---------------- */}
      {/* ferrure de cadre Rep 3 (Al) : âme + oreille de bague */}
      <path d="M300,110 H330 V425 H345 V450 H285 V425 H300 Z" fill={P.alu} stroke={P.ink} strokeWidth="1.6" />
      <path d="M300,110 H330 V425 H345 V450 H285 V425 H300 Z" fill="url(#ph45)" />
      <path d="M285,510 H345 V540 H285 Z" fill={P.alu} stroke={P.ink} strokeWidth="1.6" /><path d="M285,510 H345 V540 H285 Z" fill="url(#ph45)" />
      {/* bague épaulée Rep 4 (bronze-acier), Ø20 H7/p6 */}
      <path d="M271,436 H285 V450 H345 V462 H271 Z" fill={P.bronze} stroke={P.ink} strokeWidth="1.4" /><path d="M271,436 H285 V450 H345 V462 H271 Z" fill="url(#ph135)" />
      <path d="M271,498 H345 V510 H285 V524 H271 Z" fill={P.bronze} stroke={P.ink} strokeWidth="1.4" /><path d="M271,498 H345 V510 H285 V524 H271 Z" fill="url(#ph135)" />
      <Axis x1={250} y1={480} x2={372} y2={480} />
      {/* mastic Rep 8 + cale pelable Rep 7 entre ferrure et cornière */}
      <rect x="330" y="206" width="6" height="118" fill={P.alu} stroke={P.ink} strokeWidth="0.8" />
      {[0, 1, 2].map((i) => <line key={i} x1={331.5 + i * 1.5} y1="208" x2={331.5 + i * 1.5} y2="322" stroke={P.thin} strokeWidth="0.4" />)}
      <rect x="329" y="206" width="1.8" height="118" fill={P.mastic} /><rect x="335.4" y="206" width="1.8" height="118" fill={P.mastic} />
      {/* cornière de reprise Rep 2 (Ti-6Al-4V) */}
      <path d="M337,188 H610 V200 H352 A3 3 0 0 0 349,203 V330 H337 Z" fill={P.ti} stroke={P.ink} strokeWidth="1.6" />
      <path d="M337,188 H610 V200 H352 A3 3 0 0 0 349,203 V330 H337 Z" fill="url(#phTi)" />
      {/* panneau plancher Rep 1 (CFRP) */}
      <rect x="352" y="170" width="300" height="18" fill="url(#phCfrp)" stroke={P.ink} strokeWidth="1.6" />
      <line x1="652" y1="170" x2="672" y2="166" stroke={P.ink} strokeWidth="0.8" /><line x1="652" y1="188" x2="672" y2="192" stroke={P.ink} strokeWidth="0.8" />
      {/* Hi-Lok vertical Rep 5 + collier Rep 6 : tête fraisée 100° côté plancher */}
      <path d={`M${fx - 14.4},170 L${fx + 14.4},170 L${fx + 7.2},176 L${fx - 7.2},176 Z`} fill="#d6dde6" stroke={P.ink} strokeWidth="1.2" />
      <rect x={fx - 7.2} y="176" width="14.4" height="40" fill="#d6dde6" stroke={P.ink} strokeWidth="1.2" />
      <rect x={fx - 7.2} y="176" width="14.4" height="5" fill={P.mastic} opacity="0.75" />
      <path d={`M${fx - 13},200 H${fx + 13} V212 L${fx + 9},214 H${fx - 9} L${fx - 13},212 Z`} fill="#b9c4d1" stroke={P.ink} strokeWidth="1.2" />
      <Axis x1={fx} y1={150} x2={fx} y2={232} />
      {/* Hi-Lok horizontal Rep 5 : tête côté cornière, collier côté ferrure */}
      <rect x="290" y="257.8" width="70" height="14.4" fill="#d6dde6" stroke={P.ink} strokeWidth="1.2" />
      <rect x="349" y="251" width="10" height="28" rx="2" fill="#d6dde6" stroke={P.ink} strokeWidth="1.2" />
      <path d="M288,253 H300 V277 H288 L286,273 V257 Z" fill="#b9c4d1" stroke={P.ink} strokeWidth="1.2" />
      <Axis x1={266} y1={265} x2={384} y2={265} />
      <line x1="424" y1="265" x2="368" y2="265" stroke={P.red} strokeWidth="1.8" markerEnd="url(#pArrR)" />
      <T x={430} y={262} s={11} c={P.red} w={700}>SENS DE POSE</T>
      <T x={430} y={276} s={10} c={P.red}>tête côté cornière</T>

      {/* cotes et appels de la coupe */}
      <Dim x1={352} y1={170} x2={fx} y2={170} off={-34} text="ED 12" s={12} />
      <Leader x1={fx + 12} y1={171} x2={470} y2={80} s={12}>6x Ø4,8 ⌵100° (plancher / cornière)</Leader>
      <T x={488} y={97} s={10.5} c={P.thin}>tête côté plancher (dessus)</T>
      <Leader x1={294} y1={256} x2={270} y2={226} a="end" s={11.5}>4x Ø4,8 (cornière / ferrure)</Leader>
      {/* sens d'observation de la vue F */}
      <T x={640} y={126} s={11.5} a="middle" w={700}>VUE F</T>
      <line x1="640" y1="132" x2="640" y2="166" stroke={P.ink} strokeWidth="1.4" markerEnd="url(#pArr)" />
      <Leader x1={345} y1={452} x2={420} y2={420} s={12} w={600}>Ø20 H7/p6 · frettage LN₂ (note 4)</Leader>
      <Leader x1={333} y1={322} x2={420} y2={372} s={11.5}>jeu &gt; 0,05 → cale pelable (note 5)</Leader>
      <T x={330} y={600} s={15} a="middle" w={700}>COUPE B-B</T>
      <T x={330} y={618} s={11} a="middle" c={P.thin}>ÉCHELLE 3:1</T>

      {/* bulles de nomenclature */}
      <Bubble x={640} y={222} n={1} tx={600} ty={182} />
      <Bubble x={560} y={240} n={2} tx={540} ty={196} />
      <Bubble x={236} y={150} n={3} tx={300} ty={170} />
      <Bubble x={224} y={430} n={4} tx={272} ty={444} />
      <Bubble x={430} y={110} n={5} tx={fx + 4} ty={172} />
      <Bubble x={448} y={224} n={6} tx={fx + 13} ty={208} />
      <Bubble x={250} y={320} n={7} tx={332} ty={300} />
      <Bubble x={250} y={366} n={8} tx={329.6} ty={312} />

      {/* ---------------- VUE F (dessus du plancher) ---------------- */}
      <rect x="700" y="96" width="200" height="320" fill="none" stroke={P.ink} strokeWidth="1.6" />
      <line x1="668" y1="96" x2="668" y2="416" stroke={P.ink} strokeWidth="1" strokeDasharray="7 4" />
      <line x1="690" y1="96" x2="690" y2="416" stroke={P.ink} strokeWidth="1" strokeDasharray="7 4" />
      <line x1="890" y1="96" x2="890" y2="416" stroke={P.ink} strokeWidth="1" strokeDasharray="7 4" />
      <T x={664} y={430} s={9.5} c={P.thin} a="middle">cadre</T>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <circle cx="736" cy={120 + i * 72} r="14.4" fill="none" stroke={P.ink} strokeWidth="1" />
          <circle cx="736" cy={120 + i * 72} r="7.2" fill="none" stroke={P.ink} strokeWidth="1.4" />
          <Axis x1={720} y1={120 + i * 72} x2={752} y2={120 + i * 72} />
        </g>
      ))}
      <Axis x1={736} y1={92} x2={736} y2={420} />
      <Dim x1={700} y1={96} x2={736} y2={96} off={-24} text="12" s={12} />
      <Dim x1={736} y1={120} x2={736} y2={192} off={60} text="24" s={12} />
      <Dim x1={736} y1={120} x2={736} y2={408} off={110} text="4 × 24 (= 96)" s={11.5} />
      <Leader x1={744} y1={420} x2={762} y2={442} s={11.5} w={600}>10x Ø4,8 ⌵100°</Leader>
      <T x={780} y={460} s={10.5} c={P.thin}>ED ≥ 2,5D · pas 4D à 6D</T>
      {/* trait de coupe B-B (passe par l'axe d'une fixation) */}
      <line x1="672" y1="264" x2="916" y2="264" stroke={P.ink} strokeWidth="0.7" strokeDasharray="14 3 2 3" />
      <line x1="652" y1="264" x2="674" y2="264" stroke={P.ink} strokeWidth="2.6" />
      <line x1="914" y1="264" x2="936" y2="264" stroke={P.ink} strokeWidth="2.6" />
      <line x1="654" y1="264" x2="654" y2="292" stroke={P.ink} strokeWidth="1.4" markerEnd="url(#pArr)" />
      <line x1="934" y1="264" x2="934" y2="292" stroke={P.ink} strokeWidth="1.4" markerEnd="url(#pArr)" />
      <T x={654} y={312} s={15} a="middle" w={700}>B</T>
      <T x={934} y={312} s={15} a="middle" w={700}>B</T>
      <line x1="700" y1="482" x2="760" y2="482" stroke={P.ink} strokeWidth="1.4" markerEnd="url(#pArr)" /><T x={770} y={486} s={11}>X avion</T>
      <T x={800} y={514} s={15} a="middle" w={700}>VUE F · DESSUS PLANCHER</T>
      <T x={800} y={532} s={11} a="middle" c={P.thin}>(tête des Hi-Lok côté vue)</T>

      {/* ---------------- LÉGENDE MATIÈRES ---------------- */}
      <g>
        <T x={930} y={64} s={13} w={700}>LÉGENDE DES MATIÈRES ET COMPATIBILITÉ GALVANIQUE</T>
        {[["url(#phCfrp)", "CFRP (Rep 1)"], [P.ti, "Titane Ti-6Al-4V (Rep 2)"], [P.alu, "Aluminium (Rep 3, 7)"], [P.bronze, "Bronze / acier (Rep 4)"], [P.mastic, "Mastic PR 1776 B2 (Rep 8)"]].map(([f, l], i) => (
          <g key={i}><rect x={930} y={78 + i * 24} width="26" height="16" fill={f} stroke={P.ink} strokeWidth="0.8" /><T x={964} y={91 + i * 24} s={11.5}>{l}</T></g>
        ))}
        <rect x={1160} y={78} width={210} height={112} fill="none" stroke={P.red} strokeWidth="1.2" />
        <T x={1168} y={96} s={11} c={P.red} w={700}>CONTACT CFRP / ALU INTERDIT</T>
        <T x={1168} y={114} s={10.5}>Le carbone est cathodique :</T>
        <T x={1168} y={130} s={10.5}>l'aluminium en contact se corrode.</T>
        <T x={1168} y={148} s={10.5}>Reprise par cornière titane,</T>
        <T x={1168} y={164} s={10.5}>compatible avec le carbone.</T>
        <T x={1168} y={182} s={10.5}>Mastic sur faces Ti / Al.</T>
      </g>

      <Nomenclature />

      {/* ---------------- NOTES ---------------- */}
      <g>
        <T x={44} y={652} s={13} w={700}>NOTES · PROCÉDÉS SPÉCIAUX (EI / EICM)</T>
        {[
          "1. ASSEMBLAGE SELON EICM. RÉFÉRENCES DE NORMES : EXEMPLES DE FORMATION, LA NOMENCLATURE APPLICABLE FAIT FOI.",
          "2. INTERPOSITION PR 1776 B2 ENTRE REP 3 / REP 7 / REP 2 : RELEVER LOT, DATE LIMITE (SHELF LIFE), DURÉE D'APPLICATION.",
          "3. POSE HUMIDE DES REP 5 (TIGE ENDUITE PR 1776 B2). TÊTES FRAISÉES 100° CÔTÉ PLANCHER, AFFLEUREMENT 0 / −0,1.",
          "4. BAGUE REP 4 Ø20 H7/p6 : FRETTAGE, CONTRACTION À L'AZOTE LIQUIDE −196 °C, EPI CRYO, CONTRÔLE APRÈS RETOUR À L'AMBIANTE.",
          "5. JEU REP 2 / REP 3 MESURÉ AUX CALES D'ÉPAISSEUR : SI JEU > 0,05 mm, CALAGE PELABLE REP 7 AU JEU MESURÉ.",
          "6. SUR REP 1 (CFRP) : ED ≥ 2,5D, PAS 4D À 6D. PERÇAGE FORET CARBURE, MARTYR EN SORTIE, ASPIRATION À LA SOURCE.",
          "7. HI-LOK HORIZONTAUX REP 5 : TÊTE CÔTÉ CORNIÈRE, COLLIER CÔTÉ FERRURE (ACCÈS OUTIL).",
        ].map((l, i) => <T key={i} x={44} y={676 + i * 26} s={11.4}>{l}</T>)}
      </g>

      {/* ---------------- zones d'analyse ---------------- */}
      <Spot on={on(1)} x={322} y={160} w={300} h={180} />
      <Spot on={on(2)} x={256} y={426} w={180} h={124} />
      <Spot on={on(3)} x={fx - 22} y={160} w={300} h={64} />
      {on(4) && <><Spot on x={344} y={124} w={56} h={52} /><Spot on x={690} y={64} w={190} h={360} /></>}
      <Spot on={on(5)} x={322} y={200} w={250} h={186} />
      <Spot on={on(6)} x={234} y={196} w={110} h={186} />
      <Spot on={on(7)} x={902} y={428} w={482} h={290} />
      <Spot on={on(8)} x={276} y={240} w={250} h={46} />
      <Hot n={1} x={500} y={312} active={on(1)} onPick={onPick} />
      <Hot n={2} x={380} y={500} active={on(2)} onPick={onPick} />
      <Hot n={3} x={560} y={140} active={on(3)} onPick={onPick} />
      <Hot n={4} x={990} y={330} active={on(4)} onPick={onPick} />
      <Hot n={5} x={560} y={400} active={on(5)} onPick={onPick} />
      <Hot n={6} x={200} y={260} active={on(6)} onPick={onPick} />
      <Hot n={7} x={1330} y={360} active={on(7)} onPick={onPick} />
      <Hot n={8} x={560} y={290} active={on(8)} onPick={onPick} />
    </Sheet>
  );
}

export const PLAN2_ZONES = [
  { n: 1, titre: "Empilage et compatibilité galvanique", lecture: "De haut en bas : plancher CFRP (Rep 1), cornière de reprise en Ti-6Al-4V (Rep 2), cale pelable (Rep 7) et mastic (Rep 8), ferrure de cadre en aluminium (Rep 3). Le plancher ne touche jamais l'aluminium.", gamme: "Respecter l'ordre d'empilage et l'interposition prévue. Toute retouche de protection sur la ferrure (après perçage) se fait avant accostage, selon EI.", piege: "Remplacer la cornière titane par une cornière alu « équivalente » du stock : couple galvanique carbone / aluminium, corrosion rapide de la cornière." },
  { n: 2, titre: "Bague épaulée Ø20 H7/p6 (Rep 4)", lecture: "Ajustement avec serrage (p6 sur un alésage H7). La note 4 impose un frettage : la bague est contractée à l'azote liquide (−196 °C) puis posée sans effort.", gamme: "EPI cryogénique (gants, visière), temps d'immersion selon EI, pose immédiate épaulement en appui, retour à température ambiante, puis contrôle de l'alésage intérieur et de l'appui de l'épaulement.", piege: "Poser la bague au maillet à température ambiante : arrachement de matière dans l'alésage H7 de la ferrure, bague mal en appui. Contrôler à froid fausse les cotes." },
  { n: 3, titre: "Hi-Lok fraisés, montage humide (Rep 5 / 6)", lecture: "Hi-Lok Ø4,8 tête fraisée 100°, tête côté plancher (dessus), affleurement 0 / −0,1. Pose humide : tige enduite de PR 1776 B2 (note 3).", gamme: "Fraisage 100° à la cage micrométrique réglée sur éprouvette, contrôle de l'affleurement, enduction de la tige, pose, serrage jusqu'à rupture de l'écrou de manœuvre du collier.", piege: "Pose sèche « pour aller plus vite » : pas d'étanchéité, corrosion dans l'alésage. Tête en saillie : fraisage trop peu profond, non conforme." },
  { n: 4, titre: "Distance au bord et pas (vue F)", lecture: "ED = 12 mm entre le bord du plancher et l'axe des fixations, pas de 24 mm (4 × 24). Pour Ø4,8 en composite : ED ≥ 2,5D = 12 mm, pas entre 4D (19,2) et 6D (28,8).", gamme: "La grille de perçage reprend ED et pas. Contrôle de l'ED au premier trou de chaque rangée, avant de percer la suite.", piege: "Appliquer la règle métal (2D = 9,6 mm) sur le CFRP : bord trop proche, délaminage et arrachement du stratifié sous charge." },
  { n: 5, titre: "Calage pelable (Rep 7)", lecture: "Le jeu entre cornière et ferrure est mesuré aux cales d'épaisseur. Au-delà de 0,05 mm, une cale pelable (feuillets de 0,05) est posée au jeu mesuré.", gamme: "Mesure du jeu en plusieurs points, relevé dans le MES, pelage de la cale à l'épaisseur, pose avec interposition de mastic, contrôle d'absence de jeu après serrage.", piege: "Serrer pour « fermer » le jeu : pré-contrainte dans la cornière et la ferrure, fissuration en fatigue. Le jeu se cale, il ne se serre pas." },
  { n: 6, titre: "Mastic d'interposition PR 1776 B2 (Rep 8)", lecture: "Mastic polysulfure entre ferrure, cale et cornière. Quantité A/R (à la demande) : c'est un consommable piloté par lot et date limite d'utilisation.", gamme: "Relevé du lot et de la date limite (shelf life), respect de la durée d'application après mélange, cordon continu, serrage dans le temps d'application, nettoyage de l'excédent.", piege: "Utiliser une cartouche périmée ou hors durée d'application : polymérisation incomplète, perte d'étanchéité et d'isolation." },
  { n: 7, titre: "Nomenclature E-BOM", lecture: "La nomenclature se lit de bas en haut, Rep 1 juste au-dessus du cartouche. Elle donne quantités, références (BNAE NF L, normes AH ECS / ASN) et renvois aux notes de procédés.", gamme: "Le préparateur la convertit en M-BOM : kits par poste (préassemblage ferrure, jonction), consommables en bord de ligne, outillages, et il ajoute ce que l'E-BOM ne donne pas (protections, solvants, chiffons).", piege: "Copier l'E-BOM telle quelle dans le kit : bague et Hi-Lok livrés au même poste, mastic stocké sans suivi de date limite." },
  { n: 8, titre: "Sens de pose des fixations", lecture: "Hi-Lok horizontaux : tête côté cornière, collier côté ferrure (note 7). Hi-Lok verticaux : tête côté plancher. Le sens de pose est une exigence du plan.", gamme: "Le sens est écrit en clair dans l'opération et vérifié au contrôle. Il conditionne l'accès des outils (clé Allen, outil de pose du collier).", piege: "Inverser le sens « parce que c'est plus accessible » : écart à la définition, QN obligatoire." },
];

const ctx = "Plan d'ensemble 365A21-0050-01 (jonction cadre / plancher H160)";
export const PLAN2_AUDIT_Q = [
  { q: `${ctx}. Sur le montage réel, l'ED mesurée sur le plancher CFRP est de 10,5 mm pour un Hi-Lok Ø4,8. Ta conclusion ?`, options: ["Non conforme : mini 12 mm (2,5D sur CFRP), arrêt et QN", "Conforme : 10,5 mm reste au-dessus de 2D (9,6 mm)", "Conforme : une rondelle large compense l'écart d'ED", "Non conforme : percer un trou oversize décalé de 1,5 mm"], answer: 0, why: "Sur composite, ED ≥ 2,5D = 12 mm (note 6). La règle métal ne s'applique pas. Une ED trop faible ne se corrige pas en atelier : QN.", hint: "Quelle règle d'ED pour le composite ?" },
  { q: `${ctx}. Le pas mesuré entre deux Hi-Lok du plancher est de 23,8 mm. Ta conclusion ?`, options: ["Conforme : 24 ±0,3 (ISO 2768-m) et entre 4D et 6D", "Non conforme : le pas doit être exactement de 24,0 mm", "Non conforme : le pas mini est de 6D, soit 28,8 mm", "Conforme seulement après accord écrit du bureau d'études"], answer: 0, why: "Le pas de 24 sans tolérance propre suit ISO 2768-m (±0,3 dans la plage 6 à 30). Il reste entre 4D = 19,2 et 6D = 28,8 mm.", hint: "Tolérance générale du cartouche." },
  { q: `${ctx}. Jeu mesuré entre cornière et ferrure : 0,12 mm, aucune cale posée. Ta conclusion ?`, options: ["Non conforme : jeu > 0,05, cale pelable Rep 7 au jeu mesuré", "Conforme : le serrage des Hi-Lok fermera ce jeu de 0,12 mm", "Conforme : un cordon de mastic plus épais comble le jeu", "Non conforme : remplacer la cornière par une plus épaisse"], answer: 0, why: "Note 5 : au-delà de 0,05 mm, calage pelable. Fermer le jeu au serrage met la structure en pré-contrainte.", hint: "Un jeu se cale, il ne se serre pas." },
  { q: `${ctx}. La bague Rep 4 a été posée au maillet à température ambiante. Ta conclusion ?`, options: ["Non conforme : p6 impose le frettage LN₂ (note 4), QN", "Conforme : la bague est en place et son épaulement en appui", "Conforme si l'alésage intérieur passe au tampon lisse Ø12", "Non conforme : il fallait chauffer la bague à 150 °C au four"], answer: 0, why: "H7/p6 est un serrage : le plan impose la contraction à l'azote liquide. Une pose en force arrache la matière de l'alésage de la ferrure.", hint: "On refroidit la pièce intérieure pour la contracter." },
  { q: `${ctx}. Les Hi-Lok verticaux ont été posés à sec, sans mastic sur la tige. Ta conclusion ?`, options: ["Non conforme : pose humide PR 1776 B2 exigée (note 3)", "Conforme : la pose humide est une simple recommandation", "Conforme si un cordon de mastic est ajouté sous les têtes", "Non conforme : il fallait des rivets pleins à la place"], answer: 0, why: "La note 3 impose la pose humide : l'enduction protège l'alésage de la corrosion et assure l'étanchéité.", hint: "Relis la note 3." },
  { q: `${ctx}. Trois Hi-Lok verticaux ont la tête côté cornière (dessous). Ta conclusion ?`, options: ["Non conforme : tête côté plancher exigée, écart à la définition", "Conforme : le sens de pose est laissé libre au compagnon", "Conforme si l'affleurement côté plancher reste dans 0 / −0,1", "Non conforme mais acceptable si le couple de pose est tenu"], answer: 0, why: "Le sens de pose est une exigence du plan (tête fraisée côté plancher). Un sens inversé est un écart : QN.", hint: "Le sens de pose est-il libre ?" },
  { q: `${ctx}. La cartouche de PR 1776 B2 utilisée a dépassé sa date limite de 3 jours. Ta conclusion ?`, options: ["Non conforme : produit périmé, QN sur les poses déjà faites", "Conforme : 3 jours de dépassement restent sans effet réel", "Conforme si le mastic a été conservé au réfrigérateur", "Non conforme mais acceptable après accord du chef d'équipe"], answer: 0, why: "Un mastic hors shelf life peut ne pas polymériser. Les poses réalisées avec ce lot sont tracées et traitées en QN.", hint: "La date limite est une exigence, pas une indication." },
  { q: `${ctx}. Affleurement mesuré des têtes fraisées côté plancher : −0,04 mm. Ta conclusion ?`, options: ["Conforme : dans la tolérance 0 / −0,1 de la note 3", "Non conforme : la tête doit dépasser de +0,04 mm mini", "Non conforme : l'affleurement doit être exactement de 0", "Conforme seulement après ponçage de la tête au ras"], answer: 0, why: "Affleurement 0 / −0,1 : une tête légèrement en retrait de 0,04 mm est conforme. Poncer une tête de fixation est interdit.", hint: "Lis la tolérance d'affleurement." },
];

export const PLAN2_MBOM_Q = [
  { q: `${ctx}, Rep 4 (bague Ø20 p6). Dans quel kit M-BOM la places-tu ?`, options: ["Kit poste 10 · préassemblage ferrure, frettage LN₂", "Kit poste 20 · jonction cornière / ferrure / cale", "Kit poste 30 · pose du plancher CFRP et Hi-Lok", "Bord de ligne · consommable suivi par date limite"], answer: 0, why: "La bague se frette dans la ferrure seule, avant toute jonction : c'est une opération de préassemblage avec son poste équipé (LN₂, EPI cryo).", hint: "La bague doit être posée avant que la ferrure soit montée." },
  { q: `${ctx}, Rep 8 (PR 1776 B2, quantité A/R). Comment l'intègres-tu dans la M-BOM ?`, options: ["Consommable bord de ligne, géré par lot et date limite", "Article de kit à quantité fixe livré au poste 10", "Outillage de poste prêté sur bon de sortie magasin", "Article non géré : le compagnon le commande au besoin"], answer: 0, why: "A/R = à la demande. Le mastic est un consommable piloté par lot et shelf life, approvisionné en bord de ligne et tracé à l'utilisation.", hint: "A/R signifie à la demande." },
  { q: `${ctx}, Rep 7 (cale pelable). Pourquoi la M-BOM la place-t-elle en conditionnel au poste 20 ?`, options: ["Elle ne se pose que si le jeu mesuré dépasse 0,05 mm", "Elle se pose toujours mais à une épaisseur standard", "Elle se pose en fin de ligne après le contrôle final", "Elle se pose avant le frettage pour protéger la bague"], answer: 0, why: "Note 5 : la cale dépend du jeu mesuré. La M-BOM la prévoit au poste de jonction, avec l'opération de mesure qui la déclenche.", hint: "Relis la note 5." },
  { q: `${ctx}. Qu'ajoute la M-BOM que l'E-BOM ne contient pas ?`, options: ["Protections temporaires, solvant, chiffons non pelucheux", "Les références des Hi-Lok et de leurs colliers Rep 5 / 6", "La matière de la cornière et de la ferrure de cadre", "Les quantités de la bague et du panneau de plancher"], answer: 0, why: "L'E-BOM décrit le produit. La M-BOM ajoute tout ce qu'il faut pour le fabriquer : consommables de mise en œuvre, protections, et le découpage par poste.", hint: "Ce qui ne figure pas dans la maquette 3D." },
  { q: `${ctx}, Rep 5 / Rep 6 (10 Hi-Lok + 10 colliers). Comment les répartis-tu entre les postes ?`, options: ["Selon les opérations : jonction cornière / ferrure et pose plancher", "Tous au poste 10, avec la bague, pour réduire le nombre de kits", "Tous en bord de ligne en vrac, sans affectation aux postes", "Tous au poste 30, la jonction cornière / ferrure étant collée"], answer: 0, why: "La M-BOM suit la séquence réelle : chaque poste reçoit les fixations de ses opérations, comptées, pour garder la maîtrise du kit et des FOD.", hint: "La M-BOM suit la séquence de montage par poste." },
  { q: `${ctx}, Rep 1 (panneau CFRP). Quelle donnée M-BOM / gamme associes-tu au poste 30 ?`, options: ["Perçage composite : foret carbure, martyr, aspiration (EICM)", "Frettage : contraction du panneau à l'azote liquide −196 °C", "Traitement OAC du panneau avant pose sur la cornière titane", "Aucun : le panneau arrive percé et se pose sans outillage"], answer: 0, why: "La note 6 renvoie au procédé de perçage composite. Le poste 30 doit être équipé (forets carbure, martyrs, aspiration, EPI FFP3).", hint: "Relis la note 6." },
];

export const PLAN2_AUDIT = {
  id: "m4a-plan2-audit", ref: "365A21-0050-01", court: "Jonction cadre / plancher H160 · plan d'ensemble",
  titre: "Plan n°2 · Jonction cadre principal / plancher mécanique H160",
  Drawing: Plan2Drawing, zones: PLAN2_ZONES, questions: PLAN2_AUDIT_Q, quizTitle: "Atelier plan n°2 · Auditer un montage réel par rapport au plan",
};
export const PLAN2_MBOM = {
  id: "m3-plan2-mbom", ref: "365A21-0050-01", court: "Jonction cadre / plancher H160",
  titre: "Plan d'ensemble · jonction cadre principal / plancher mécanique H160",
  Drawing: Plan2Drawing, zones: PLAN2_ZONES, questions: PLAN2_MBOM_Q, quizTitle: "Atelier · Convertir l'E-BOM du plan en M-BOM par poste",
};
