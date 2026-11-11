/* ============================================================
   PLAN N°1 · Pièce élémentaire métallique
   Support de servocommande · ferrure usinée Al 7075-T7351
   P/N 332A27-2045-20 (référence de formation)
   ============================================================ */
import React from "react";
import { Sheet, P, T, Dim, Leader, Gdt, Datum, Rough, Ground, Axis, Hot, Spot } from "./PlanKit.jsx";

const S = 3.2; /* px par mm */
const OX = 120, OY = 470; /* vue de dessus : origine au coin C / B */
const X = (mm) => OX + mm * S, Y = (mm) => OY - mm * S;
const SX = (mm) => 820 + mm * S, SZ = (mm) => 470 - mm * S; /* coupe A-A : Y horizontal, Z vertical */
const HOLES = [[14, 13], [106, 13], [14, 50], [106, 50]];

export function Plan1Drawing({ sel, onPick }) {
  const on = (n) => sel === n;
  const r6 = (6.35 / 2) * S;
  return (
    <Sheet title="Plan 332A27-2045-20 · support de servocommande" onBackground={() => onPick(null)}
      cartouche={{ designation: "SUPPORT DE SERVOCOMMANDE · FERRURE", appareil: "H160 · ATA 67 / 53", reference: "332A27-2045-20", indice: "B", matiere: "AL 7075-T7351", tolerances: "ISO 2768-mK", traitement: "OAC (anod. chromique) + primaire époxy", echelle: "2:1", masse: "0,21 kg" }}>

      {/* ---------------- VUE DE DESSUS ---------------- */}
      <rect x={X(0)} y={Y(70)} width={120 * S} height={70 * S} fill="none" stroke={P.ink} strokeWidth="1.8" />
      <line x1={X(0)} y1={Y(62)} x2={X(120)} y2={Y(62)} stroke={P.ink} strokeWidth="1.4" />
      <line x1={X(0)} y1={Y(59)} x2={X(120)} y2={Y(59)} stroke={P.thin} strokeWidth="0.6" />
      <T x={X(122)} y={Y(64)} s={10} c={P.thin}>bord relevé</T>
      {/* bossage et alésage */}
      <circle cx={X(60)} cy={Y(35)} r={18 * S} fill="none" stroke={P.ink} strokeWidth="1.6" />
      <circle cx={X(60)} cy={Y(35)} r={21 * S} fill="none" stroke={P.thin} strokeWidth="0.6" />
      <circle cx={X(60)} cy={Y(35)} r={10 * S} fill="none" stroke={P.ink} strokeWidth="1.8" />
      <Axis x1={X(60) - 70} y1={Y(35)} x2={X(60) + 70} y2={Y(35)} /><Axis x1={X(60)} y1={Y(35) - 70} x2={X(60)} y2={Y(35) + 70} />
      {/* 4 trous */}
      {HOLES.map(([a, b], i) => (
        <g key={i}>
          <circle cx={X(a)} cy={Y(b)} r={r6} fill="none" stroke={P.ink} strokeWidth="1.6" />
          <Axis x1={X(a) - 18} y1={Y(b)} x2={X(a) + 18} y2={Y(b)} /><Axis x1={X(a)} y1={Y(b) - 18} x2={X(a)} y2={Y(b) + 18} />
        </g>
      ))}
      {/* zone de métallisation : épargne Ø16 */}
      <circle cx={X(28)} cy={Y(28)} r={8 * S} fill="none" stroke={P.ink} strokeWidth="1" strokeDasharray="5 3" />
      <Ground x={X(28)} y={Y(28) + 2} />
      <T x={150} y={352} s={10.5}>Ø16 · NOTE 6</T>
      {/* trait de coupe A-A */}
      <line x1={X(60)} y1={Y(74)} x2={X(60)} y2={Y(-6)} stroke={P.ink} strokeWidth="0.7" strokeDasharray="16 3 2 3" />
      <line x1={X(60)} y1={Y(74)} x2={X(60)} y2={Y(71)} stroke={P.ink} strokeWidth="3" /><line x1={X(60)} y1={Y(-6)} x2={X(60)} y2={Y(-3)} stroke={P.ink} strokeWidth="3" />
      <line x1={X(60)} y1={Y(74)} x2={X(60) + 26} y2={Y(74)} stroke={P.ink} strokeWidth="1.2" markerEnd="url(#pArr)" />
      <line x1={X(60)} y1={Y(-6)} x2={X(60) + 26} y2={Y(-6)} stroke={P.ink} strokeWidth="1.2" markerEnd="url(#pArr)" />
      <T x={X(60) - 16} y={Y(74) + 5} s={16} w={700}>A</T><T x={X(60) - 16} y={Y(-6) + 5} s={16} w={700}>A</T>

      {/* cotes CTE de position (encadrées) */}
      <Dim x1={X(0)} y1={OY} x2={X(14)} y2={OY} off={28} text="14" box s={12} />
      <Dim x1={X(0)} y1={OY} x2={X(106)} y2={OY} off={46} text="106" box s={12} />
      <Dim x1={X(0)} y1={OY} x2={X(120)} y2={OY} off={66} text="120" s={12} />
      <Dim x1={X(106)} y1={OY} x2={X(106)} y2={Y(13)} off={74} text="13" box s={12} />
      <Dim x1={X(106)} y1={OY} x2={X(106)} y2={Y(50)} off={94} text="50" box s={12} />
      <Dim x1={X(0)} y1={Y(70)} x2={X(60)} y2={Y(70)} off={-38} text="60" box s={12} />
      <Dim x1={X(0)} y1={OY} x2={X(0)} y2={Y(35)} off={-34} text="35" box s={12} />
      <Dim x1={X(0)} y1={OY} x2={X(0)} y2={Y(70)} off={-64} text="70" s={12} />
      {/* références B et C */}
      <Datum x={X(115)} y={OY} letter="B" dir="down" len={24} />
      <Datum x={X(0)} y={Y(56)} letter="C" dir="left" len={24} />
      {/* appel des 4 trous */}
      <Leader x1={X(106) + 7} y1={Y(50) - 7} x2={600} y2={262} s={13} w={600}>4x Ø6,35 H8 (+0,022 / 0)</Leader>
      <Gdt x={618} y={270} cells={["pos", "Ø0,1 Ⓜ", "A", "B", "C"]} />
      <T x={312} y={580} s={15} a="middle" w={700}>VUE DE DESSUS</T>

      {/* ---------------- COUPE A-A ---------------- */}
      <path d={`M${SX(0)},${SZ(0)} H${SX(25)} V${SZ(25)} H${SX(17)} V${SZ(11)} A${3 * S} ${3 * S} 0 0 1 ${SX(14)},${SZ(8)} H${SX(0)} Z`} fill="url(#ph45)" stroke={P.ink} strokeWidth="1.8" />
      <path d={`M${SX(45)},${SZ(0)} H${SX(70)} V${SZ(40)} H${SX(62)} V${SZ(11)} A${3 * S} ${3 * S} 0 0 1 ${SX(59)},${SZ(8)} H${SX(56)} A${3 * S} ${3 * S} 0 0 1 ${SX(53)},${SZ(11)} V${SZ(25)} H${SX(45)} Z`} fill="url(#ph45)" stroke={P.ink} strokeWidth="1.8" />
      <Axis x1={SX(35)} y1={SZ(-6)} x2={SX(35)} y2={SZ(32)} />
      {/* alésage Ø20 H7 */}
      <Dim x1={SX(25)} y1={SZ(25)} x2={SX(45)} y2={SZ(25)} off={-42} text="Ø20 H7 (+0,021 / 0)" s={12.5} />
      <Gdt x={880} y={352} cells={["perp", "Ø0,05", "A"]} s={12} h={21} />
      <line x1={SX(25) + 3} y1={SZ(22)} x2={778} y2={334} stroke={P.ink} strokeWidth="0.8" markerStart="url(#pArr)" />
      <Rough x={770} y={334} ra="0,8" />
      <T x={700} y={354} s={10.5} c={P.thin}>paroi d'alésage Ø20</T>
      {/* cotes de la coupe */}
      <Dim x1={SX(17)} y1={SZ(0)} x2={SX(53)} y2={SZ(0)} off={40} text="Ø36" s={12} />
      <Dim x1={SX(0)} y1={SZ(0)} x2={SX(0)} y2={SZ(8)} off={-26} text="8" s={12} />
      <Dim x1={SX(70)} y1={SZ(0)} x2={SX(70)} y2={SZ(40)} off={30} text="40" s={12} />
      <Dim x1={SX(53)} y1={SZ(0)} x2={SX(53)} y2={SZ(25)} off={104} text="25" s={12} />
      <Datum x={SX(9)} y={SZ(0)} letter="A" dir="down" len={24} />
      <Leader x1={SX(59) + 4} y1={SZ(8) - 4} x2={1110} y2={290} s={12.5}>R3 · raccordements non cotés</Leader>
      <T x={932} y={572} s={15} a="middle" w={700}>COUPE A-A (rabattue)</T>
      <T x={SX(0)} y={548} s={10.5} c={P.thin}>← Face avant</T>
      <T x={SX(70)} y={548} s={10.5} a="end" c={P.thin}>Bord relevé →</T>

      {/* ---------------- NOTES ---------------- */}
      <g>
        <T x={44} y={630} s={13} w={700}>NOTES (SAUF INDICATION CONTRAIRE)</T>
        {[
          "1. MATIÈRE AL 7075-T7351 : PLAQUE LAMINÉE DÉTENSIONNÉE, ÉTAT SUR-REVENU (TENUE À LA CORROSION SOUS TENSION).",
          "2. PIÈCE USINÉE DANS LA MASSE · RAYONS DE RACCORDEMENT NON COTÉS R3 (LE 7075-T7351 NE SE PLIE PAS À FROID).",
          "3. TOLÉRANCES GÉNÉRALES ISO 2768-mK : m = COTES LINÉAIRES ET ANGULAIRES · K = TOLÉRANCES GÉOMÉTRIQUES.",
          "4. COTES ENCADRÉES = COTES THÉORIQUEMENT EXACTES (CTE), TOLÉRANCÉES PAR LE CADRE DE LOCALISATION.",
          "5. ARÊTES CASSÉES 0,2 × 45° MAXI · ÉTAT DE SURFACE GÉNÉRAL Ra 3,2.",
          "6. OAC PUIS PRIMAIRE ÉPOXY SELON EI · ÉPARGNE Ø16 = ZONE DE MÉTALLISATION (MASQUÉE AVANT TRAITEMENT).",
          "7. MÉTALLISATION APRÈS POSE : R < 2,5 mΩ AU MICRO-OHMMÈTRE 4 FILS.",
          "8. MARQUAGE P/N + INDICE + N° DE SÉRIE À L'ENCRE, HORS ZONE FONCTIONNELLE.",
        ].map((l, i) => <T key={i} x={44} y={656 + i * 26} s={11.6}>{l}</T>)}
      </g>

      {/* ---------------- zones d'analyse ---------------- */}
      <Spot on={on(1)} x={900} y={702} w={486} h={184} />
      <Spot on={on(2)} x={862} y={322} w={150} h={30} />
      <Spot on={on(3)} x={690} y={296} w={220} h={120} />
      <Spot on={on(4)} x={872} y={346} w={110} h={34} />
      {on(5) && <><Spot on x={X(0) + 18} y={Y(70) + 42} w={120 * S - 36} h={180} /><Spot on x={590} y={244} w={210} h={56} /></>}
      {on(6) && <><Spot on x={X(115) - 18} y={OY - 4} w={36} h={50} /><Spot on x={X(0) - 52} y={Y(56) - 18} w={56} h={36} /><Spot on x={SX(9) - 18} y={SZ(0) - 4} w={36} h={50} /></>}
      <Spot on={on(7)} x={140} y={346} w={110} h={66} />
      <Spot on={on(8)} x={SX(-6)} y={SZ(42)} w={250} h={160} />
      <Spot on={on(9)} x={36} y={610} w={858} h={262} />
      <Hot n={1} x={890} y={720} active={on(1)} onPick={onPick} />
      <Hot n={2} x={848} y={336} active={on(2)} onPick={onPick} />
      <Hot n={3} x={668} y={350} active={on(3)} onPick={onPick} />
      <Hot n={4} x={834} y={410} active={on(4)} onPick={onPick} />
      <Hot n={5} x={584} y={232} active={on(5)} onPick={onPick} />
      <Hot n={6} x={556} y={505} active={on(6)} onPick={onPick} />
      <Hot n={7} x={258} y={298} active={on(7)} onPick={onPick} />
      <Hot n={8} x={1128} y={256} active={on(8)} onPick={onPick} />
      <Hot n={9} x={340} y={625} active={on(9)} onPick={onPick} />
    </Sheet>
  );
}

export const PLAN1_ZONES = [
  { n: 1, titre: "Cartouche", lecture: "P/N 332A27-2045-20 indice B, matière Al 7075-T7351, traitement OAC + primaire époxy, tolérances générales ISO 2768-mK, échelle 2:1, projection européenne.", gamme: "En-tête de gamme : P/N et indice applicables au MSN, matière et état. Le traitement de surface est rappelé dans toute opération de retouche (retouche de protection selon EI après un perçage ou un ébavurage).", piege: "Préparer sur l'indice A alors que l'indice B est applicable au MSN. Autre confusion : OAC = anodisation chromique, OAS = sulfurique ; l'anodisation tartrique-sulfurique (TSA) remplace progressivement l'OAC pour des raisons REACH. Seul le traitement porté au plan fait foi." },
  { n: 2, titre: "Alésage Ø20 H7", lecture: "Ø20 H7 (+0,021 / 0) : l'alésage doit mesurer entre 20,000 et 20,021 mm. C'est le logement de l'axe de la servocommande.", gamme: "Avant-trou au foret, demi-finition, puis alésoir de finition Ø20 H7 sur montage. Contrôle au tampon lisse Ø20 H7 : le côté Entre passe, le côté N'entre pas ne passe pas.", piege: "Finir au foret Ø20 : un foret ne tient pas une IT7 ni un Ra 0,8. Un alésage à 20,025 mm est hors tolérance : QN, la matière enlevée ne se remet pas." },
  { n: 3, titre: "État de surface Ra 0,8", lecture: "Symbole ISO 1302 sur la paroi de l'alésage : rugosité moyenne arithmétique Ra ≤ 0,8 µm. Le reste de la pièce est en Ra 3,2 (note 5).", gamme: "Finition à l'alésoir (ou alésage à l'outil) avec lubrification adaptée. Contrôle au rugosimètre ou, en atelier, par comparaison viso-tactile sur échantillons étalonnés.", piege: "Appliquer Ra 0,8 à toute la pièce (coût inutile) ou oublier le contrôle de la paroi : une surface rugueuse use la bague et l'axe en vibrations." },
  { n: 4, titre: "Perpendicularité ⊥ Ø0,05 | A", lecture: "L'axe de l'alésage Ø20 doit rester dans un cylindre de Ø0,05 mm perpendiculaire à la référence A (dessous de la semelle). Le Ø devant la valeur indique une zone cylindrique.", gamme: "Pièce plaquée sur A pendant l'alésage (montage d'usinage ou de perçage). Contrôle sur machine à mesurer tridimensionnelle ou au tampon long et équerre sur marbre, pièce posée sur A.", piege: "Plaquer la pièce sur le bord relevé ou sur le dessus du bossage : la perpendicularité est exigée par rapport à A, pas à une autre face." },
  { n: 5, titre: "4 trous Ø6,35 H8 + localisation", lecture: "4x Ø6,35 H8 (+0,022 / 0) : trous de 6,350 à 6,372 mm. Cadre ⌖ Ø0,1 Ⓜ | A | B | C : chaque axe dans un cylindre Ø0,1 positionné par les cotes encadrées 14 / 106 et 13 / 50, au maximum de matière.", gamme: "Perçage puis alésage Ø6,35 H8 via grille de perçage indexée A, B, C. Le bonus Ⓜ : si un trou mesure 6,365 mm, la zone de position passe à 0,1 + (6,365 − 6,350) = Ø0,115 mm.", piege: "Coter la position depuis le centre du bossage, ou oublier le bonus Ⓜ : on rebute un trou bon. Les cotes encadrées n'ont pas de tolérance propre." },
  { n: 6, titre: "Références A, B, C", lecture: "A = dessous de la semelle (appui plan, 3 points), B = chant long (appui linéaire, 2 points), C = chant d'extrémité (butée, 1 point). Ordre A | B | C = ordre de mise en position.", gamme: "« Plaquer la semelle sur A (3 appuis), accoster le chant long sur B (2 appuis) sans décoller A, mettre en butée sur C (1 appui), puis brider. » Le montage reprend exactement ces surfaces.", piege: "Brider avant d'avoir plaqué A, ou accoster B avant A : la pièce bascule au serrage et les 4 trous sortent de la zone Ø0,1." },
  { n: 7, titre: "Zone de métallisation Ø16", lecture: "Symbole de masse électrique et épargne Ø16 : surface laissée conductrice, sans couche d'anodisation ni primaire, pour la tresse ou la liaison de masse.", gamme: "Masquage de la zone Ø16 avant OAC et primaire (ou mise à nu selon EI), protection temporaire jusqu'à la pose. Après pose : mesure < 2,5 mΩ au micro-ohmmètre 4 fils étalonné, valeur tracée dans le MES.", piege: "Peindre la zone puis gratter « à la main » : surface hors tolérance, corrosion et métallisation instable. L'épargne se prévoit dès la préparation du traitement." },
  { n: 8, titre: "Coupe A-A et rayons R3", lecture: "La coupe A-A passe par l'axe de l'alésage : semelle de 8, bossage Ø36 hauteur 25, bord relevé de 40. Les surfaces coupées sont hachurées. Les raccordements non cotés sont en R3 (note 2).", gamme: "Le préparateur vérifie l'accessibilité outil : un raccord R3 interdit une rondelle ou une tête de fixation à angle vif contre le bord relevé. Prévoir une rondelle chanfreinée si le plan l'impose.", piege: "Croire que la pièce est « pliée » : en 7075-T7351, les rayons sont des raccordements d'usinage. Un pliage à froid de cet alliage fissure." },
  { n: 9, titre: "Notes et ISO 2768-mK", lecture: "ISO 2768-m s'applique aux cotes non tolérancées : 8 mm (plage 6 à 30) → ±0,2 ; 70 et 120 mm (plage 30 à 120) → ±0,3. K fixe les tolérances géométriques générales.", gamme: "La gamme ne réinvente pas les tolérances : elle cite la note du plan. Une cote de 120 se contrôle donc entre 119,7 et 120,3 mm.", piege: "Croire qu'une cote sans tolérance est libre : elle est tolérancée par la note générale du cartouche." },
];

const ctx = "Plan 332A27-2045-20 (support de servocommande H160)";
export const PLAN1_QUESTIONS = [
  { q: `${ctx}, repère 2. Tu rédiges la finition de l'alésage central. Quel outil et quel contrôle prescris-tu ?`, options: ["Alésoir de finition Ø20 H7 après avant-trou, contrôle au tampon lisse Ø20 H7", "Foret Ø20 en une passe, contrôle au pied à coulisse au 1/50 de millimètre", "Alésoir de finition Ø20 H8 après avant-trou, contrôle au tampon lisse Ø20 H8", "Foret étagé Ø19,8 puis Ø20, contrôle au calibre à mâchoires Ø20 h7"], answer: 0, why: "H7 exige un alésoir de finition dédié et un tampon Entre / N'entre pas de la même qualité. Un foret ne tient ni l'IT7 ni le Ra 0,8.", hint: "H7 et Ra 0,8 : qualité d'alésage, pas de perçage." },
  { q: `${ctx}, repère 6. Sur le montage d'usinage, quelle surface la pièce doit-elle plaquer en premier ?`, options: ["Le dessous de la semelle (A) sur 3 appuis plans", "Le chant long (B) sur 2 appuis linéaires alignés", "Le chant d'extrémité (C) sur 1 appui en butée", "Le dessus du bossage Ø36 sur 3 appuis plans"], answer: 0, why: "A est la référence primaire : elle supprime 3 degrés de liberté. B (2) puis C (1) complètent l'isostatisme 3-2-1.", hint: "La première lettre du cadre est la référence primaire." },
  { q: `${ctx}, repère 3. Quelle exigence de rugosité dois-tu faire contrôler, et où ?`, options: ["Ra ≤ 0,8 µm sur la paroi de l'alésage Ø20", "Ra ≤ 0,8 µm sur toutes les faces usinées de la pièce", "Ra ≤ 3,2 µm sur la paroi de l'alésage Ø20 seulement", "Ra ≤ 0,8 µm sur le dessous de la semelle (référence A)"], answer: 0, why: "Le symbole est porté sur la paroi de l'alésage. Le reste de la pièce suit la note générale Ra 3,2.", hint: "Regarde où pointe le symbole ISO 1302." },
  { q: `${ctx}, repère 5. Un des 4 trous Ø6,35 H8 mesure 6,365 mm. Quelle zone de position est autorisée pour son axe ?`, options: ["Ø0,115 mm", "Ø0,100 mm", "Ø0,085 mm", "Ø0,122 mm"], answer: 0, why: "Maximum de matière d'un trou = 6,350 mm. Bonus = 6,365 − 6,350 = 0,015 mm. Zone = 0,1 + 0,015 = Ø0,115 mm.", hint: "Bonus = taille mesurée − taille au maximum de matière." },
  { q: `${ctx}, repère 9. La longueur 120 n'a pas de tolérance individuelle. Entre quelles valeurs se contrôle-t-elle ?`, options: ["119,7 et 120,3 mm (ISO 2768-m)", "119,5 et 120,5 mm (ISO 2768-c)", "119,8 et 120,2 mm (ISO 2768-f)", "120,0 et 120,3 mm (tolérance unilatérale)"], answer: 0, why: "ISO 2768 classe m, plage au-dessus de 30 jusqu'à 120 mm : ±0,3 mm. La classe portée au cartouche est mK.", hint: "Lis la classe dans le cartouche puis la plage de 30 à 120 mm." },
  { q: `${ctx}, repère 2. L'alésage central mesure 20,025 mm au contrôle. Quelle est ta décision ?`, options: ["Non conforme (maxi 20,021) : arrêt, étiquetage et QN", "Conforme : l'écart de 0,004 mm reste négligeable", "Conforme : la tolérance générale ISO 2768-m s'applique", "À reprendre : nouvelle passe d'alésoir H7 pour corriger"], answer: 0, why: "H7 sur Ø20 = +0,021 / 0. 20,025 dépasse le maxi : la matière enlevée ne se remet pas, la décision appartient au BE via la QN.", hint: "Un trou trop grand ne se rattrape pas en réalésant." },
  { q: `${ctx}, repère 7. Comment traites-tu la zone de métallisation Ø16 dans la gamme ?`, options: ["Masquée avant OAC et primaire, puis mesure < 2,5 mΩ après pose", "Peinte avec la pièce, puis grattée au cutter au moment de la pose", "Masquée avant primaire seulement, sans mesure de résistance après pose", "Protégée par un ruban adhésif standard pendant la peinture de finition"], answer: 0, why: "L'épargne évite toute couche isolante sur la surface de contact. La valeur mesurée au micro-ohmmètre 4 fils est tracée.", hint: "Une couche d'anodisation est aussi isolante qu'une peinture." },
  { q: `${ctx}, repère 4. Que garantit le cadre ⊥ Ø0,05 | A porté sous la cote de l'alésage ?`, options: ["L'axe de l'alésage reste dans un cylindre Ø0,05 perpendiculaire à A", "La paroi de l'alésage est plane à 0,05 mm près sur toute sa hauteur", "Le diamètre de l'alésage varie de 0,05 mm au plus entre ses deux faces", "Le dessous de la semelle A est perpendiculaire au bord relevé à 0,05°"], answer: 0, why: "⊥ = perpendicularité, Ø = zone cylindrique, A = référence. C'est l'axe de l'élément tolérancé qui est contrôlé.", hint: "Le Ø devant la valeur indique une zone cylindrique autour de l'axe." },
];

export const PLAN1 = {
  id: "m4a-plan1-ferrure", ref: "332A27-2045-20", court: "Ferrure usinée Al 7075-T7351 · pièce élémentaire", titre: "Plan n°1 · Support de servocommande, ferrure usinée Al 7075-T7351",
  Drawing: Plan1Drawing, zones: PLAN1_ZONES, questions: PLAN1_QUESTIONS, quizTitle: "Atelier plan n°1 · Extraire les paramètres de la gamme",
};
