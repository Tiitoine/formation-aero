/* ============================================================
   PLAN N°3 · Pièce composite carbone
   Panneau de poutre de queue, caisson CFRP préimprégné
   (référence de formation 365A65-4410-07)
   Rosace, ply book symétrique, drop-off, zone nid d'abeille,
   pli de verre d'isolation galvanique, prescriptions d'assemblage.
   ============================================================ */
import React from "react";
import { Sheet, P, T, Dim, Leader, Axis, Hot, Spot } from "./PlanKit.jsx";

/* ---------- vue en plan du panneau ---------- */
const PX0 = 70, PY0 = 90, PW = 540, PH = 300;
const inset = (d) => ({ x: PX0 + d, y: PY0 + d, w: PW - 2 * d, h: PH - 2 * d });

function Rosace({ x, y }) {
  const r = 62;
  const arm = (deg, lab, dash) => {
    const a = (-deg * Math.PI) / 180;
    const ex = x + r * Math.cos(a), ey = y + r * Math.sin(a);
    return (
      <g key={lab}>
        <line x1={x} y1={y} x2={ex} y2={ey} stroke={P.ink} strokeWidth="1.5" markerEnd="url(#pArr)" strokeDasharray={dash} />
        <T x={x + (r + 18) * Math.cos(a)} y={y + (r + 18) * Math.sin(a) + 4} s={13} a="middle" w={700}>{lab}</T>
      </g>
    );
  };
  return (
    <g>
      <circle cx={x} cy={y} r={r + 34} fill="none" stroke={P.faint} strokeWidth="0.8" />
      {arm(0, "0°")}{arm(45, "+45°")}{arm(-45, "−45°")}{arm(90, "90°")}
      <circle cx={x} cy={y} r="3" fill={P.ink} />
      <T x={x} y={y + r + 56} s={11.5} a="middle" w={700}>ROSACE · VUE CÔTÉ OUTILLAGE</T>
      <T x={x} y={y + r + 72} s={10.5} a="middle" c={P.thin}>0° = axe X longitudinal de la poutre</T>
    </g>
  );
}

const PLIES = [
  ["PP", "Peel ply nylon", "—", "Face extérieure", "Retiré avant peinture"],
  ["8", "UD carbone", "0°", "Toute la pièce", "Peau ext."],
  ["7", "UD carbone", "+45°", "Toute la pièce", "Peau ext."],
  ["6", "UD carbone", "−45°", "Toute la pièce", "Peau ext."],
  ["5", "UD carbone", "90°", "Toute la pièce", "Peau ext."],
  ["NIDA", "Nomex 3,2-48", "L ∥ X", "Zone sandwich", "Chanfrein 20°"],
  ["D1-D4", "UD carbone", "±45/0/90", "Bord monolithique", "Arrêts en escalier"],
  ["4", "UD carbone", "90°", "Toute la pièce", "Peau int."],
  ["3", "UD carbone", "−45°", "Toute la pièce", "Peau int."],
  ["2", "UD carbone", "+45°", "Toute la pièce", "Peau int."],
  ["1", "UD carbone", "0°", "Toute la pièce", "Peau int."],
  ["G", "Tissu verre E", "0/90", "Face d'accostage", "Isolation galvanique"],
];
function PlyBook({ x = 908, y = 60 }) {
  const cols = [52, 108, 70, 120, 120];
  const xs = cols.reduce((a, w) => [...a, a[a.length - 1] + w], [x]);
  const rh = 23;
  const heads = ["PLI", "MATÉRIAU", "ORIENT.", "ZONE", "REMARQUE"];
  return (
    <g>
      <T x={x} y={y - 8} s={13} w={700}>TABLEAU DE DRAPAGE (PLY BOOK)</T>
      {[heads, ...PLIES].map((r, i) => {
        const yy = y + i * rh;
        const hl = r[0] === "G" ? "#dcebf6" : r[0] === "NIDA" ? "#f1e7c6" : r[0] === "PP" ? "#ece6f6" : i === 0 ? "#e4dfd0" : P.paper;
        return (
          <g key={i}>
            <rect x={x} y={yy} width={470} height={rh} fill={hl} stroke={P.ink} strokeWidth={i === 0 ? 1.4 : 0.7} />
            {xs.slice(1, -1).map((xx, k) => <line key={k} x1={xx} y1={yy} x2={xx} y2={yy + rh} stroke={P.ink} strokeWidth="0.7" />)}
            {r.map((c, k) => <T key={k} x={xs[k] + 5} y={yy + 16} s={i === 0 ? 9.5 : 10.5} w={i === 0 || k === 0 ? 700 : 400}>{c}</T>)}
          </g>
        );
      })}
      <T x={x} y={y + (PLIES.length + 1) * rh + 18} s={11.5} w={700}>PEAUX : [0 / +45 / −45 / 90]s · SYMÉTRIQUE ET ÉQUILIBRÉE</T>
      <T x={x} y={y + (PLIES.length + 1) * rh + 34} s={10.5} c={P.thin}>Ordre du tableau : de la face extérieure (haut) à la face d'accostage (bas).</T>
    </g>
  );
}

/* ---------- coupe C-C (épaisseurs exagérées) ---------- */
const prof = [[60, 534], [260, 534], [260, 539], [285, 539], [285, 544], [310, 544], [310, 549], [335, 549], [335, 554], [360, 554], [500, 494], [860, 494]];
function SectionCC() {
  const top = prof.map(([x, y]) => `${x},${y - 20}`).join(" ");
  const bot = prof.slice().reverse().map(([x, y]) => `${x},${y}`).join(" ");
  const fx = 150;
  return (
    <g>
      {/* cadre alu + mastic */}
      <rect x="60" y="584" width="200" height="30" fill={P.alu} stroke={P.ink} strokeWidth="1.4" /><rect x="60" y="584" width="200" height="30" fill="url(#ph45)" />
      <rect x="60" y="580" width="200" height="4" fill={P.mastic} />
      {/* pli de verre + peau intérieure */}
      <rect x="60" y="574" width="800" height="6" fill={P.glass} stroke={P.ink} strokeWidth="0.8" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x="60" y={554 + i * 5} width="800" height="5" fill={["#4d545e", "#5d6570", "#4d545e", "#6b737e"][i]} stroke={P.ink} strokeWidth="0.4" />)}
      {/* renforts D1-D4 en escalier */}
      {[335, 310, 285, 260].map((xe, i) => <rect key={i} x="60" y={549 - i * 5} width={xe - 60} height="5" fill={i % 2 ? "#7b8390" : "#666e7a"} stroke={P.ink} strokeWidth="0.4" />)}
      {/* nid d'abeille */}
      <polygon points="360,554 500,494 860,494 860,554" fill={P.core} stroke={P.ink} strokeWidth="1" />
      <polygon points="360,554 500,494 860,494 860,554" fill="url(#phHex)" />
      {/* peau extérieure */}
      <polygon points={`${top} ${bot}`} fill="#545c67" stroke={P.ink} strokeWidth="1" />
      {[5, 10, 15].map((d) => <polyline key={d} points={prof.map(([x, y]) => `${x},${y - d}`).join(" ")} fill="none" stroke="#7a828e" strokeWidth="0.5" />)}
      {/* peel ply */}
      <polyline points={prof.map(([x, y]) => `${x},${y - 24}`).join(" ")} fill="none" stroke={P.mastic} strokeWidth="1.5" strokeDasharray="6 4" />
      {/* fixation en zone monolithique */}
      <path d={`M${fx - 16},514 L${fx + 16},514 L${fx + 7},522 L${fx - 7},522 Z`} fill="#d6dde6" stroke={P.ink} strokeWidth="1.1" />
      <rect x={fx - 7} y="522" width="14" height="104" fill="#d6dde6" stroke={P.ink} strokeWidth="1.1" />
      <rect x={fx - 22} y="614" width="44" height="5" fill="#b9c4d1" stroke={P.ink} strokeWidth="1" />
      <path d={`M${fx - 12},619 H${fx + 12} V630 H${fx - 12} Z`} fill="#b9c4d1" stroke={P.ink} strokeWidth="1" />
      <Axis x1={fx} y1={500} x2={fx} y2={642} />
      {/* légendes */}
      <Dim x1={60} y1={514} x2={fx} y2={514} off={-30} text="ED ≥ 2,5D" s={11.5} />
      <Leader x1={fx + 22} y1={616} x2={300} y2={640} s={11}>rondelle large + collier (assise élargie)</Leader>
      <Leader x1={250} y1={577} x2={300} y2={604} s={11} c="#1d5f91" w={700}>pli de verre G : barrière galvanique</Leader>
      <Leader x1={298} y1={541} x2={262} y2={462} s={11}>drop-off D1 à D4 (escalier, rampe ≥ 1:20)</Leader>
      <Leader x1={460} y1={512} x2={548} y2={440} s={11}>chanfrein nid d'abeille 20°</Leader>
      <Leader x1={740} y1={470} x2={740} y2={452} s={11} c="#6a4fb3">peel ply (retiré)</Leader>
      <T x={680} y={530} s={11.5} a="middle" w={700}>ZONE SANDWICH · NIDA NOMEX</T>
      <T x={160} y={496} s={11.5} a="middle" w={700}>ZONE MONOLITHIQUE</T>
      <T x={150} y={662} s={10.5} a="middle" c={P.thin}>cadre aluminium</T>
      <T x={560} y={662} s={15} a="middle" w={700}>COUPE C-C</T>
      <T x={560} y={678} s={10.5} a="middle" c={P.thin}>épaisseurs non à l'échelle</T>
    </g>
  );
}

export function Plan3Drawing({ sel, onPick }) {
  const on = (n) => sel === n;
  const band = inset(48), core = inset(92);
  const holes = [];
  for (let x = PX0 + 24; x <= PX0 + PW - 24; x += 48) { holes.push([x, PY0 + 24]); holes.push([x, PY0 + PH - 24]); }
  for (let y = PY0 + 72; y <= PY0 + PH - 72; y += 48) { holes.push([PX0 + 24, y]); holes.push([PX0 + PW - 24, y]); }
  return (
    <Sheet title="Plan 365A65-4410-07 · panneau composite de poutre de queue" onBackground={() => onPick(null)}
      cartouche={{ designation: "PANNEAU DE CAISSON DE POUTRE DE QUEUE", appareil: "H145 · ATA 53 / 65", reference: "365A65-4410-07", indice: "A", matiere: "CFRP préimprégné 180 °C", tolerances: "Selon notes", traitement: "Peel ply retiré · peinture selon EI", echelle: "1:2", masse: "1,9 kg" }}>
      {/* panneau */}
      <rect x={PX0} y={PY0} width={PW} height={PH} fill="url(#phCfrp)" opacity="0.18" stroke={P.ink} strokeWidth="1.8" />
      {[48, 60, 72, 84].map((d) => { const r = inset(d); return <rect key={d} x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke={P.thin} strokeWidth="0.7" strokeDasharray="8 4" />; })}
      <rect x={core.x} y={core.y} width={core.w} height={core.h} fill={P.core} opacity="0.55" />
      <rect x={core.x} y={core.y} width={core.w} height={core.h} fill="url(#phHex)" stroke={P.ink} strokeWidth="1" />
      <T x={PX0 + PW / 2} y={PY0 + PH / 2 - 6} s={13} a="middle" w={700}>ZONE SANDWICH · NIDA NOMEX</T>
      <T x={PX0 + PW / 2} y={PY0 + PH / 2 + 12} s={11} a="middle">aucune fixation · inserts collés si besoin</T>
      {holes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill={P.paper} stroke={P.ink} strokeWidth="1.2" />)}
      <T x={band.x + 6} y={band.y - 6} s={10} c={P.thin}>limite zone monolithique · arrêts de plis (pointillés)</T>
      {/* trait de coupe C-C */}
      <line x1={PX0 - 14} y1={PY0 + 160} x2={PX0 + 140} y2={PY0 + 160} stroke={P.ink} strokeWidth="0.7" strokeDasharray="16 3 2 3" />
      <line x1={PX0 - 14} y1={PY0 + 160} x2={PX0 - 14} y2={PY0 + 186} stroke={P.ink} strokeWidth="1.2" markerEnd="url(#pArr)" />
      <line x1={PX0 + 140} y1={PY0 + 160} x2={PX0 + 140} y2={PY0 + 186} stroke={P.ink} strokeWidth="1.2" markerEnd="url(#pArr)" />
      <T x={PX0 - 28} y={PY0 + 156} s={15} w={700}>C</T><T x={PX0 + 146} y={PY0 + 156} s={15} w={700}>C</T>
      {/* axe X poutre */}
      <line x1={PX0} y1={PY0 + PH + 26} x2={PX0 + 120} y2={PY0 + PH + 26} stroke={P.ink} strokeWidth="1.4" markerEnd="url(#pArr)" />
      <T x={PX0 + 128} y={PY0 + PH + 30} s={11.5} w={700}>X POUTRE (vers le Fenestron)</T>
      <Dim x1={PX0} y1={PY0} x2={PX0 + 24} y2={PY0} off={-22} text="12" s={11} />
      <T x={PX0 + 40} y={PY0 - 10} s={10.5}>Ø4,8 · ED ≥ 2,5D = 12</T>
      <Rosace x={760} y={180} />

      <PlyBook />
      <SectionCC />

      {/* prescriptions méthodes */}
      <g>
        <rect x={908} y={420} width={470} height={282} fill={P.paper} stroke={P.ink} strokeWidth="1.4" />
        <T x={918} y={442} s={12.5} w={700}>PRESCRIPTIONS D'ASSEMBLAGE (EICM COMPOSITE)</T>
        {[
          "• ED ≥ 2,5D sur stratifié (2D sur métal) : Ø4,8 → 12 mm.",
          "• Fixations à forte expansion radiale INTERDITES",
          "   (rivets pleins, rivets aveugles non composites) : délaminage.",
          "• Fixations composites : Hi-Lite / Hi-Lok titane à",
          "   tolérance adaptée, rondelles larges, rivets aveugles",
          "   à bulbe contrôlé type Opti-Blind.",
          "• Perçage foret carbure ou diamant, martyr en sortie.",
          "• Aspiration à la source, EPI FFP3, matériel ATEX",
          "   (poussières de carbone conductrices).",
          "• Contrôle en sortie de trou : ni délaminage ni écaillage.",
          "• Aucune fixation en zone NIDA ni sur les arrêts de plis.",
          "• Carbone / aluminium : pli de verre G + mastic.",
        ].map((l, i) => <T key={i} x={918} y={466 + i * 19} s={11.2}>{l}</T>)}
      </g>
      {/* notes */}
      <g>
        <T x={44} y={712} s={12.5} w={700}>NOTES</T>
        {[
          "1. PRÉIMPRÉGNÉ CARBONE / ÉPOXY 180 °C, CUISSON AUTOCLAVE SELON EI. RÉFÉRENCES MATÉRIAUX : EXEMPLES DE FORMATION.",
          "2. ORIENTATIONS SELON ROSACE, VUE CÔTÉ OUTILLAGE (FACE MOULE). TOLÉRANCE D'ORIENTATION ±3°.",
          "3. ARRÊTS DE PLIS : LONGUEUR DE MARCHE ≥ 20 × ÉPAISSEUR DU PLI ARRÊTÉ (RAMPE ≥ 1:20).",
          "4. CND ULTRASONS 100 % DES ZONES MONOLITHIQUES APRÈS CUISSON ET APRÈS PERÇAGE.",
          "5. PEEL PLY RETIRÉ JUSTE AVANT COLLAGE OU PEINTURE (SURFACE PRÊTE À ADHÉRER).",
        ].map((l, i) => <T key={i} x={44} y={736 + i * 24} s={11.2}>{l}</T>)}
      </g>

      {/* zones d'analyse */}
      <Spot on={on(1)} x={672} y={86} w={176} h={250} />
      <Spot on={on(2)} x={900} y={40} w={486} h={360} />
      <Spot on={on(3)} x={56} y={568} w={330} h={48} />
      <Spot on={on(4)} x={560} y={440} w={300} h={56} />
      <Spot on={on(5)} x={250} y={448} w={300} h={112} />
      <Spot on={on(6)} x={core.x - 6} y={core.y - 6} w={core.w + 12} h={core.h + 12} />
      {on(7) && <><Spot on x={PX0 - 8} y={PY0 - 34} w={210} h={70} /><Spot on x={100} y={494} w={110} h={150} /></>}
      <Spot on={on(8)} x={908} y={420} w={470} h={282} />
      <Hot n={1} x={850} y={104} active={on(1)} onPick={onPick} />
      <Hot n={2} x={1360} y={40} active={on(2)} onPick={onPick} />
      <Hot n={3} x={40} y={592} active={on(3)} onPick={onPick} />
      <Hot n={4} x={878} y={446} active={on(4)} onPick={onPick} />
      <Hot n={5} x={440} y={540} active={on(5)} onPick={onPick} />
      <Hot n={6} x={core.x + core.w - 20} y={core.y + 22} active={on(6)} onPick={onPick} />
      <Hot n={7} x={230} y={60} active={on(7)} onPick={onPick} />
      <Hot n={8} x={1372} y={420} active={on(8)} onPick={onPick} />
    </Sheet>
  );
}

export const PLAN3_ZONES = [
  { n: 1, titre: "Rosace d'orientation", lecture: "0° = axe X longitudinal de la poutre. +45° et −45° se lisent dans le sens trigonométrique, vue côté outillage (face moule). 90° est perpendiculaire à l'axe X.", gamme: "La gamme de drapage rappelle la face de lecture. Le gabarit laser ou la projection de contours indique l'orientation de chaque pli, contrôlée à ±3° (note 2).", piege: "Lire la rosace depuis la face opposée : +45° et −45° s'inversent. Le stratifié n'est plus celui du calcul." },
  { n: 2, titre: "Ply book symétrique et équilibré", lecture: "Peaux [0 / +45 / −45 / 90]s : la séquence est en miroir de part et d'autre du plan moyen (symétrique) et chaque +45° a son −45° (équilibré).", gamme: "Drapage pli par pli dans l'ordre du tableau, chaque pli coché dans le dossier avec son lot de préimprégné et son temps hors congélateur (out-time).", piege: "Inverser deux plis ou en oublier un : le panneau se gauchit à la cuisson et ses rigidités sont fausses. Un pli manquant est une non-conformité." },
  { n: 3, titre: "Pli de verre G (isolation galvanique)", lecture: "Pli de tissu de verre E sur la face d'accostage. Le verre est isolant : il sépare le carbone (cathodique) des cadres en aluminium.", gamme: "Le pli G fait partie du drapage, il n'est jamais retiré. À l'assemblage, le mastic d'interposition complète la barrière ; tout ponçage de la face d'accostage est interdit au-delà de l'EI.", piege: "Le confondre avec le peel ply : le peel ply s'arrache avant peinture, le pli de verre reste. Poncer jusqu'au carbone supprime la barrière." },
  { n: 4, titre: "Peel ply (tissu d'arrachage)", lecture: "Tissu nylon drapé en surface extérieure. Il protège la surface et laisse, une fois arraché, une surface propre et prête à adhérer.", gamme: "Retrait juste avant collage ou peinture (note 5), jamais avant le stockage. Contrôle visuel : aucun reste de tissu.", piege: "Le laisser en place sous la peinture, ou le retirer trop tôt : pollution de surface et défaut d'adhérence." },
  { n: 5, titre: "Drop-off · arrêts de plis", lecture: "Les renforts D1 à D4 du bord monolithique s'arrêtent en escalier. Chaque marche mesure au moins 20 fois l'épaisseur du pli arrêté (rampe ≥ 1:20).", gamme: "Respect des contours de découpe des plis (gabarit ou projection laser). Aucune fixation et aucun perçage sur la zone de drop-off.", piege: "Arrêter tous les plis au même endroit : concentration de contraintes et amorce de délaminage." },
  { n: 6, titre: "Zone sandwich nid d'abeille", lecture: "Âme en nid d'abeille Nomex entre deux peaux, chanfreinée à 20° en bordure. Zone légère et rigide, mais non apte à recevoir une fixation traversante.", gamme: "Aucune fixation en zone NIDA. Si une charge doit y être reprise, insert collé (potting) défini par le BE et posé selon EI.", piege: "Percer et poser une fixation traversante : écrasement de l'âme, infiltration d'humidité, décollement des peaux." },
  { n: 7, titre: "ED ≥ 2,5D et choix des fixations", lecture: "Fixations Ø4,8 uniquement en zone monolithique, ED ≥ 2,5D = 12 mm. Fixations composites à large assise : Hi-Lite / Hi-Lok titane, rondelle large, rivet aveugle à bulbe contrôlé.", gamme: "Grille de perçage avec ED 12, références de fixations reprises de la nomenclature, rondelles larges côté collier, couple ou pose selon EI.", piege: "Rivet plein ou fixation à forte expansion radiale : le stratifié se fend et délamine autour du trou." },
  { n: 8, titre: "Perçage composite et contrôle", lecture: "Foret carbure ou diamant, martyr en sortie, aspiration à la source, EPI FFP3, matériel ATEX. Contrôle de non-délaminage en sortie de trou, CND ultrasons des zones monolithiques.", gamme: "Paramètres de perçage (vitesse, avance) selon EICM, martyr bridé, contrôle visuel 100 % des sorties de trou, relevé dans le MES.", piege: "Percer au foret HSS sans martyr : écaillage en sortie, délaminage invisible en surface, poussières conductrices dans l'atelier." },
];

const ctx = "Plan 365A65-4410-07 (panneau composite de poutre H145)";
export const PLAN3_QUESTIONS = [
  { q: `${ctx}, repère 1. Le ply book indique un pli à +45°. Comment est-il orienté ?`, options: ["À +45° de l'axe X poutre, sens trigonométrique vu côté outillage", "À +45° de l'axe X poutre, sens horaire vu côté face extérieure", "À +45° de l'axe vertical Z, sens trigonométrique vu de dessus", "À +45° du bord le plus long du panneau, quel que soit le côté"], answer: 0, why: "La rosace fixe la référence (0° = X poutre) et la face de lecture (côté outillage). Vu de l'autre face, +45° et −45° s'inversent.", hint: "Une rosace a une référence et une face de lecture." },
  { q: `${ctx}, repère 3. À quoi sert le pli de verre G sur la face d'accostage ?`, options: ["À isoler le carbone des cadres alu (barrière galvanique)", "À protéger la surface jusqu'à la peinture, puis à l'arracher", "À augmenter la rigidité en flexion du panneau de poutre", "À faciliter le démoulage du panneau après la cuisson"], answer: 0, why: "Le carbone est cathodique par rapport à l'aluminium : sans barrière isolante, l'aluminium se corrode. Le verre est isolant et reste en place.", hint: "Carbone et aluminium ne doivent pas se toucher." },
  { q: `${ctx}, repère 4. Quelle est la différence entre le peel ply et le pli de verre G ?`, options: ["Le peel ply s'arrache avant peinture, le pli de verre reste", "Le pli de verre s'arrache avant peinture, le peel ply reste", "Les deux restent en place et protègent de la corrosion", "Les deux s'arrachent avant la pose sur les cadres alu"], answer: 0, why: "Le peel ply est un tissu d'arrachage temporaire (surface prête à adhérer). Le pli de verre est un pli structural permanent d'isolation.", hint: "Lequel des deux est temporaire ?" },
  { q: `${ctx}, repère 7. Fixation Ø6,35 en zone monolithique : quelle ED minimale ?`, options: ["15,9 mm (2,5D)", "12,7 mm (2D)", "9,5 mm (1,5D)", "19,1 mm (3D)"], answer: 0, why: "Sur stratifié carbone, ED ≥ 2,5D = 2,5 × 6,35 = 15,875 mm, arrondi à 15,9 mm. 2D est la règle des pièces métalliques.", hint: "Composite : 2,5 fois le diamètre." },
  { q: `${ctx}, repère 7. Quelle fixation est interdite sur ce panneau ?`, options: ["Rivet plein à forte expansion radiale", "Hi-Lite titane avec rondelle large", "Rivet aveugle à bulbe contrôlé", "Hi-Lok titane à tolérance adaptée"], answer: 0, why: "Le rivet plein gonfle dans le trou au refoulement : il fend et délamine le stratifié. Les fixations composites limitent l'expansion et répartissent l'appui.", hint: "Qu'est-ce qui fend un stratifié ?" },
  { q: `${ctx}, repère 8. Quel moyen de perçage prescris-tu ?`, options: ["Foret carbure ou diamant, martyr en sortie, aspiration FFP3 / ATEX", "Foret HSS standard, sans martyr, soufflette pour évacuer la poussière", "Foret carbure, sans martyr, lubrification abondante à l'huile soluble", "Poinçonnage du stratifié puis alésage au diamètre à l'alésoir HSS"], answer: 0, why: "Le carbone use le HSS, éclate en sortie sans martyr et produit une poussière conductrice et nocive : aspiration à la source, FFP3, matériel ATEX.", hint: "Trois menaces : usure, écaillage, poussière." },
  { q: `${ctx}, repère 2. Pourquoi la séquence des peaux est-elle symétrique et équilibrée ?`, options: ["Pour que le panneau ne se gauchisse pas à la cuisson", "Pour réduire le nombre de plis découpés par panneau", "Pour pouvoir draper les plis dans un ordre quelconque", "Pour que le panneau soit isolant face à l'aluminium"], answer: 0, why: "Symétrie par rapport au plan moyen et paires ±45° évitent les couplages qui tordent ou gauchissent le panneau au refroidissement.", hint: "Que se passe-t-il au refroidissement d'un stratifié dissymétrique ?" },
  { q: `${ctx}, repère 6. Une ferrure doit être fixée au milieu de la zone nid d'abeille. Que fais-tu ?`, options: ["Je demande un insert collé défini par le BE (zone NIDA)", "Je perce et pose un Hi-Lite traversant avec rondelle large", "Je pose un rivet aveugle à bulbe contrôlé dans l'âme NIDA", "Je perce la zone et je remplis le trou de mastic PR 1776"], answer: 0, why: "Aucune fixation traversante en zone NIDA : l'âme s'écrase. La reprise de charge passe par un insert collé défini par le BE.", hint: "Le plan interdit toute fixation dans cette zone." },
];

export const PLAN3 = {
  id: "m4a-plan3-composite", ref: "365A65-4410-07", court: "Panneau CFRP de poutre de queue · composite",
  titre: "Plan n°3 · Panneau de poutre de queue, caisson CFRP préimprégné",
  Drawing: Plan3Drawing, zones: PLAN3_ZONES, questions: PLAN3_QUESTIONS, quizTitle: "Atelier plan n°3 · Lire un plan composite et choisir les moyens",
};
