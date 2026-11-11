/* ============================================================
   M1 · ÉCORCHÉ DE CELLULE HÉLICOPTÈRE (style plan CAO) + FICHES DE COURS
   Vue de profil gauche, trièdre X / Z, repères cliquables.
   Les valeurs de station sont indicatives (cellule type biturbine) :
   seule la documentation de l'appareil fait foi.
   ============================================================ */
import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Wrench, AlertTriangle, ClipboardCheck, MapPin } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

/* Palette « plan » : traits fins sur fond nuit */
const K = { line: "#5b7299", thin: "#3a4c70", fill: "#16223a", fill2: "#1b2a47", hl: "#3b9eff", hlFill: "rgba(59,158,255,0.18)", crit: "#ff5d6c", critFill: "rgba(255,93,108,0.16)", ok: "#3ddc97", amber: "#ffb020", txt: "#8fa0bd" };

export const CUT_PARTS = [
  {
    id: "barque", n: 1, titre: "Barque (structure inférieure)", ata: "ATA 53 · ATA 28 (réservoirs)", zone: "Zones 100 (sous plancher cabine)", classe: "primaire",
    resume: "Caisson inférieur du fuselage, du nez à la jonction de poutre. Il porte le plancher cabine, abrite les réservoirs souples et reçoit les ferrures d'atterrisseur (patins ou train).",
    points: [
      "Constitution : couples (cadres transversaux) + longerons de plancher + revêtement travaillant, en alliage d'aluminium ou en composite selon le type.",
      "Abrite les réservoirs carburant souples ou structuraux : zone à risque FOD maximal et à étanchéité PR carburant.",
      "Points bas équipés de drains : l'eau de condensation et les fluides doivent s'évacuer, sinon corrosion cachée.",
      "Ferrures de patins / train : fixations structurales, couple et freinage enregistrés.",
    ],
    qc: ["Inventaire outillage entrée / sortie de chaque caisson avant fermeture", "Drains débouchés et non obstrués par le mastic", "Continuité électrique des tuyauteries carburant"],
    piege: "Fermer un caisson de réservoir sans inventaire FOD : un outil oublié peut obstruer une pompe ou percer une vessie.",
  },
  {
    id: "pointe", n: 2, titre: "Pointe avant, verrière et poste de pilotage", ata: "ATA 56 (vitrages) · ATA 67 (commandes) · ATA 25", zone: "Zones 200 (poste)", classe: "secondaire",
    resume: "Nez, verrière et poste. Sur les hélicoptères Airbus, le commandant de bord est assis à DROITE, le copilote à GAUCHE. Chaque place dispose d'un manche cyclique (devant le siège), d'un levier de pas collectif (à gauche du siège) et de palonniers.",
    points: [
      "Cyclique : incline le plateau cyclique, donc le disque rotor : l'appareil se déplace dans la direction voulue.",
      "Collectif : fait varier le pas de toutes les pales en même temps : montée / descente (et puissance moteur associée).",
      "Palonniers : pas du rotor arrière ou du Fenestron : contrôle en lacet et compensation du couple.",
      "La place du CdB ne change jamais la géométrie : gauche = −Y (sous-zone impaire), droite = +Y (sous-zone paire), lues assis regard vers l'avant.",
      "Verrière : pièces transparentes rayables, protection obligatoire pendant les travaux voisins, fixations au couple défini (risque de fissuration).",
    ],
    qc: ["Débattements et sens des commandes après montage, double contrôle croisé (ATA 67)", "Protection verrière posée avant tout perçage voisin", "Absence de FOD sous le plancher de poste (zone des timoneries)"],
    piege: "Déduire le côté d'intervention de la place du CdB : la sous-zone se lit uniquement sur la géométrie de l'appareil.",
  },
  {
    id: "plancher", n: 3, titre: "Plancher mécanique, anneaux et barres de suspension", ata: "ATA 53 · ATA 63 (suspension BTP)", zone: "Zones 300 (toit cabine / plancher mécanique)", classe: "primaire",
    resume: "Plateau structural au-dessus de la cabine qui supporte la BTP et les moteurs. La portance du rotor descend par le mât, la BTP et les 4 barres de suspension jusqu'aux anneaux principaux (cadres forts) de la cellule.",
    points: [
      "4 barres de suspension BTP : pièces critiques, montées selon la définition (sens, rondelles, couple, freinage) et tracées par numéro de série.",
      "Anneaux principaux : cadres forts qui reprennent les efforts de suspension et répartissent la charge dans la cellule.",
      "Béquilles / plaque de suspension : reprennent le couple et les efforts horizontaux de la BTP (souplesse de suspension qui filtre les vibrations selon le type).",
      "Drains et pentes du plancher mécanique : l'huile et l'eau ne doivent pas stagner sous les moteurs ni sous la BTP.",
      "Structure primaire conçue fail-safe : plusieurs chemins d'effort. Toute reprise de trou ou d'entaille passe par le bureau d'études.",
    ],
    qc: ["Couple et freinage des axes de barres relevés et signés (traçabilité série)", "Drains libres après application PR", "Aucune rayure ou entaille sur les ferrures des anneaux"],
    piege: "Croire que le plancher mécanique est une pièce critique au même titre que la BTP : il est primaire et redondant, la BTP et les barres ne le sont pas.",
  },
  {
    id: "btp", n: 4, titre: "BTP, mât, plateau cyclique et moyeu rotor", ata: "ATA 63 (BTP, mât) · ATA 62 (moyeu, pales) · ATA 67 (plateau, bielles)", zone: "Zones 300 / 400", classe: "critique",
    resume: "La boîte de transmission principale réduit la vitesse des turbines vers le rotor. Le mât transmet la portance. Le plateau cyclique (étoile fixe en bas, étoile tournante en haut) transmet les ordres de pas aux pales par les biellettes de pas. Le moyeu (Starflex, Spheriflex ou rotor rigide selon le type) relie les pales au mât.",
    points: [
      "Étoile fixe : ne tourne pas, actionnée par les servocommandes (ordres cyclique et collectif). Étoile tournante : entraînée par le compas, attaque les biellettes de pas.",
      "Starflex (H125, AS365 Dauphin) : étoile composite dont la flexibilité assure le battement et la traînée, avec rotules élastomère. Spheriflex (H155, H175, H225) : butées sphériques lamifiées élastomère / métal. D'autres types utilisent un rotor sans articulation : la définition de l'appareil fait foi.",
      "Pièces critiques : BTP, mât, moyeu, pales, plateau cyclique, biellettes. Chacune est tracée par numéro de série et appairée selon la définition.",
      "Freinage systématique de chaque écrou de commande : goupille, fil à freiner ou écrou autofreiné selon le plan et l'EI.",
    ],
    qc: ["Double contrôle croisé des commandes rotor par un second opérateur qualifié", "Couples enregistrés, freinages vérifiés visuellement", "Numéros de série relevés dans le dossier de l'appareil"],
    piege: "Classer le moyeu en ATA 63 : moyeu et pales sont en ATA 62. Le mât et la BTP sont en ATA 63.",
  },
  {
    id: "moteur", n: 5, titre: "Turbomoteurs et cloisons pare-feu", ata: "ATA 71 à 80 (groupe motopropulseur) · ATA 26 (protection incendie)", zone: "Zones 400 (compartiments moteurs)", classe: "primaire",
    resume: "Les turbomoteurs (Arriel, Arrano, Makila…) sont installés sur le plancher mécanique, derrière la BTP. Chaque compartiment est fermé par des cloisons pare-feu en titane ou en acier inoxydable qui doivent contenir un feu moteur.",
    points: [
      "Cloisons pare-feu : matériau qualifié feu (titane, inox), traversées étanches avec produits et méthode imposés par l'EI.",
      "Sur biturbine, une cloison sépare aussi les deux moteurs : un feu reste confiné à un compartiment.",
      "Jamais de fixation nylon ni de mastic standard dans la zone chaude : la température dépasse les limites des inserts nylon (≈ 120 °C).",
      "Supports moteur et suspente : couple défini, freinage, contrôle de non-contact avec les tuyauteries.",
    ],
    qc: ["Étanchéité des traversées pare-feu conforme à l'EI (produit, cordon, temps de polymérisation)", "Aucune vis ou écrou à insert nylon en zone chaude", "Jeux tuyauteries / structure respectés"],
    piege: "Remplacer le mastic pare-feu par un PR courant « parce qu'il est disponible » : il ne tient pas au feu.",
  },
  {
    id: "poutre", n: 6, titre: "Poutre de queue et transmission arrière", ata: "ATA 53 / 55 (structure) · ATA 65 (transmission arrière)", zone: "Zones 300 arrière (poutre)", classe: "primaire",
    resume: "Structure semi-monocoque (couples + lisses + revêtement) qui porte le rotor arrière ou le Fenestron. L'arbre de transmission arrière la parcourt sur des paliers jusqu'à la boîte intermédiaire (BTI, si présente) puis la boîte arrière (BTA).",
    points: [
      "Couples : cadres transversaux qui donnent la forme et reçoivent les paliers. Lisses : raidisseurs longitudinaux qui reprennent la flexion.",
      "Arbre ATA 65 en tronçons reliés par accouplements flexibles, posé sur paliers à roulement : alignement et jeux définis par la documentation.",
      "BTI (boîte intermédiaire) : renvoi d'angle au pied de dérive lorsque l'architecture l'exige. BTA (boîte arrière) : entraîne le rotor arrière ou le Fenestron.",
      "Toute la chaîne est critique pour le contrôle en lacet : traçabilité et freinage comme sur la BTP.",
    ],
    qc: ["Alignement de l'arbre et serrage des paliers selon la documentation", "Freinage des accouplements", "Inventaire FOD avant fermeture des capots de poutre"],
    piege: "Confondre ATA 65 (entraînement du rotor arrière) et ATA 64 (le rotor arrière ou le Fenestron lui-même).",
  },
  {
    id: "fenestron", n: 7, titre: "Fenestron (rotor anticouple caréné)", ata: "ATA 64", zone: "Zones 300 arrière (dérive)", classe: "critique",
    resume: "Rotor anticouple caréné intégré dans la dérive (H130, H135, H145, H160…). Ses pales sont réparties avec un espacement angulaire IRRÉGULIER : le bruit se répartit sur plusieurs fréquences au lieu d'une seule raie, ce qui le rend moins gênant.",
    points: [
      "Chaque pale a une position angulaire définie : monter une pale ailleurs détruit l'équilibrage et le gain acoustique.",
      "Le carénage protège le rotor et les personnes au sol, et améliore le rendement aux basses vitesses.",
      "Commande de pas par les palonniers via une timonerie ou des câbles, puis un servo de pas (ATA 67 pour la commande, ATA 64 pour le rotor).",
      "Jeu pales / carénage contrôlé : une déformation du carénage peut provoquer un contact.",
    ],
    qc: ["Position de chaque pale conforme au repérage", "Jeu radial pale / carénage dans la tolérance", "Freinage de la fixation du rotor et de la commande de pas"],
    piege: "Penser que l'espacement irrégulier est un défaut de fabrication ou sert à équilibrer : il sert à réduire la gêne acoustique.",
  },
];

const classeStyle = {
  critique: { label: "Pièce critique", cls: "border-ko/60 bg-ko/10 text-ko", Icon: ShieldAlert },
  primaire: { label: "Structure primaire", cls: "border-sky/60 bg-sky/10 text-sky", Icon: ShieldCheck },
  secondaire: { label: "Structure secondaire", cls: "border-ok/60 bg-ok/10 text-ok", Icon: ShieldCheck },
};

/* ---------------- Dessin de profil détaillé (type H160 / H145) ---------------- */
const MONO = "JetBrains Mono, monospace";
const VIO = "#a78bfa";

export const STRUCT_ELEMS = [
  { id: "couples", name: "Couples / cadres", color: "text-ok", desc: "Positionnés en X (stations). Ils donnent la forme et reprennent les efforts transverses." },
  { id: "lisses", name: "Lisses", color: "text-amber", desc: "Raidisseurs longitudinaux positionnés en Y et Z. Ils stabilisent les panneaux de peau." },
  { id: "anneaux", name: "Anneaux principaux", color: "text-ko", desc: "Cadres forts qui reprennent les efforts des barres de suspension BTP, donc la portance du rotor." },
  { id: "pm", name: "Plancher mécanique", color: "text-sky", desc: "Toit de la cabine qui porte la BTP et les turbomoteurs. Il intègre des drains et des cloisons pare-feu." },
];

function Hot({ id, n, x, y, sel, onSel }) {
  const on = sel === id;
  return (
    <g role="button" tabIndex={0} aria-label={`Repère ${n}`} onClick={() => onSel(id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSel(id)} style={{ cursor: "pointer" }}>
      <circle cx={x} cy={y} r={on ? 15 : 13} fill={on ? K.hl : "#0b1220"} stroke={K.hl} strokeWidth="2" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fontFamily={MONO} fill={on ? "#0b1220" : K.hl}>{n}</text>
    </g>
  );
}

const Lb = ({ x1, y1, x2, y2, t, a = "start", c = K.txt }) => (
  <g pointerEvents="none">
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={K.thin} strokeWidth="0.9" />
    <circle cx={x1} cy={y1} r="2" fill={c} />
    <text x={x2 + (a === "start" ? 3 : -3)} y={y2 + 4} fontSize="11" fontFamily={MONO} fill={c} textAnchor={a}>{t}</text>
  </g>
);

function SideView({ sel, onSel, ov }) {
  const H = (id) => sel === id;
  const st = (id, crit) => ({ fill: H(id) ? (crit ? K.critFill : K.hlFill) : K.fill, stroke: H(id) ? (crit ? K.crit : K.hl) : K.line, strokeWidth: H(id) ? 2 : 1.2 });
  const ln = (id, base = K.line, crit) => (H(id) ? (crit ? K.crit : K.hl) : base);
  const pmOn = H("plancher") || ov.includes("pm");
  const fen = [0, 32, 68, 101, 140, 175, 212, 247, 284, 323];
  const boomTop = (x) => 208 + (x - 748) * 0.137;
  const boomBot = (x) => 330 - (x - 766) * 0.175;
  const shaftY = (x) => 201 + (x - 748) * 0.137;
  return (
    <svg viewBox="0 0 1200 500" className="h-auto w-full" role="img" aria-label="Écorché de profil d'un hélicoptère bimoteur type H160 / H145 avec repères numérotés">
      <defs>
        <pattern id="cw-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke={K.thin} strokeWidth="1" /></pattern>
        <marker id="cw-arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={K.txt} /></marker>
      </defs>
      <rect x="0.5" y="0.5" width="1199" height="499" fill="#0b1220" stroke={K.thin} />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1={100 + i * 100} y1="0" x2={100 + i * 100} y2="500" stroke="#131d33" />)}
      {/* trièdre + cotes de station */}
      <g fontFamily={MONO} fontSize="11" fill={K.txt}>
        <line x1="26" y1="128" x2="80" y2="128" stroke={K.txt} markerEnd="url(#cw-arr)" /><text x="84" y="132">X (STA)</text>
        <line x1="26" y1="128" x2="26" y2="76" stroke={K.txt} markerEnd="url(#cw-arr)" /><text x="14" y="68">Z (WL)</text>
        <text x="24" y="492">Vue de profil gauche · nez à gauche · X0 en avant du nez · dessin de principe</text>
        {[[62, "STA 0"], [400, "STA ~ mât"], [760, "jonction poutre"], [1095, "Fenestron"]].map(([x, t]) => <g key={t}><line x1={x} y1="20" x2={x} y2="32" stroke={K.txt} /><text x={x} y="15" textAnchor="middle">{t}</text></g>)}
        <line x1="62" y1="26" x2="1095" y2="26" stroke={K.thin} />
      </g>

      {/* ===== rotor principal : pales, moyeu, plateau cyclique, servos ===== */}
      <line x1="110" y1="52" x2="720" y2="52" stroke={K.line} strokeWidth="4" strokeLinecap="round" />
      <line x1="720" y1="52" x2="760" y2="52" stroke={K.line} strokeWidth="4" strokeDasharray="6 5" />
      <path d="M368,46 L432,46 L428,58 L372,58 Z" {...st("btp", true)} />
      <rect x="394" y="58" width="12" height="56" {...st("btp", true)} />
      <rect x="368" y="80" width="64" height="6" rx="1.5" {...st("btp", true)} />
      <rect x="364" y="88" width="72" height="6" rx="1.5" {...st("btp", true)} />
      <line x1="372" y1="80" x2="376" y2="58" stroke={ln("btp", K.amber, true)} strokeWidth="2" />
      <line x1="428" y1="80" x2="424" y2="58" stroke={ln("btp", K.amber, true)} strokeWidth="2" />
      <polyline points="406,66 420,72 424,80" fill="none" stroke={ln("btp", VIO, true)} strokeWidth="1.8" />
      {[370, 430].map((x) => <g key={x}><rect x={x - 5} y="100" width="10" height="28" rx="2" {...st("btp", true)} /><line x1={x} y1="100" x2={x} y2="94" stroke={ln("btp", K.line, true)} strokeWidth="2" /></g>)}
      {/* BTP nervurée sur carter conique */}
      <rect x="358" y="112" width="84" height="38" rx="6" {...st("btp", true)} />
      {[366, 374, 382, 390, 410, 418, 426, 434].map((x) => <line key={x} x1={x} y1="116" x2={x} y2="146" stroke={ln("btp", K.thin, true)} strokeWidth="1" />)}
      <path d="M352,150 L448,150 L462,190 L338,190 Z" {...st("btp", true)} />
      <rect x="334" y="190" width="132" height="6" {...st("btp", true)} />
      {/* barres de suspension (2 visibles, 2 dessinées en pointillé) + béquilles */}
      <line x1="364" y1="120" x2="322" y2="198" stroke={H("plancher") || H("btp") ? K.crit : K.amber} strokeWidth="3" />
      <line x1="436" y1="120" x2="478" y2="198" stroke={H("plancher") || H("btp") ? K.crit : K.amber} strokeWidth="3" />
      <line x1="370" y1="124" x2="332" y2="198" stroke={K.amber} strokeWidth="1.6" strokeDasharray="3 2" />
      <line x1="430" y1="124" x2="468" y2="198" stroke={K.amber} strokeWidth="1.6" strokeDasharray="3 2" />
      <line x1="344" y1="186" x2="316" y2="197" stroke={K.amber} strokeWidth="2.2" />
      <line x1="456" y1="186" x2="484" y2="197" stroke={K.amber} strokeWidth="2.2" />

      {/* ===== compartiment moteur, turbomoteur, cloisons pare-feu ===== */}
      <path d="M480,196 L486,126 C520,110 690,108 730,120 L748,196 Z" {...st("moteur")} />
      <rect x="492" y="136" width="20" height="48" fill="#0b1220" stroke={ln("moteur")} />
      {[144, 152, 160, 168, 176].map((y) => <line key={y} x1="492" y1={y} x2="512" y2={y} stroke={K.thin} />)}
      {[499, 505].map((x) => <line key={x} x1={x} y1="136" x2={x} y2="184" stroke={K.thin} />)}
      <path d="M512,138 L572,148 L572,176 L512,186 Z" fill={K.fill2} stroke={ln("moteur")} />
      {[522, 532, 542, 552, 562].map((x) => <line key={x} x1={x} y1={140 + (x - 512) * 0.16} x2={x} y2={184 - (x - 512) * 0.13} stroke={K.thin} />)}
      <rect x="572" y="146" width="54" height="32" rx="10" fill={K.fill2} stroke={ln("moteur")} />
      {[586, 600, 614].map((x) => <path key={x} d={`M${x},170 q-4,-6 0,-12 q4,6 0,12`} fill="none" stroke={K.amber} strokeWidth="1" />)}
      <path d="M626,148 L656,142 L656,182 L626,176 Z" fill={K.fill2} stroke={ln("moteur")} />
      {[634, 642, 650].map((x) => <line key={x} x1={x} y1={148 - (x - 626) * 0.2} x2={x} y2={176 + (x - 626) * 0.2} stroke={K.thin} />)}
      <path d="M656,142 C690,140 712,128 726,110 L738,98 L750,108 C736,128 714,150 690,162 L656,182 Z" fill="#0b1220" stroke={ln("moteur")} />
      <line x1="512" y1="170" x2="448" y2="170" stroke={K.line} strokeWidth="3" />
      <line x1="480" y1="116" x2="480" y2="196" stroke={H("moteur") ? K.hl : K.crit} strokeWidth="3" />
      <line x1="748" y1="118" x2="748" y2="196" stroke={H("moteur") ? K.hl : K.crit} strokeWidth="3" />
      <line x1="482" y1="193" x2="746" y2="193" stroke={K.crit} strokeWidth="1.5" strokeDasharray="5 3" />

      {/* ===== poutre de queue, arbre ATA 65, stabilisateur, dérive Fenestron ===== */}
      <path d={`M748,208 L1040,${boomTop(1040)} L1040,${boomBot(1040)} L766,330 C770,300 770,240 760,214 Z`} {...st("poutre")} />
      {[810, 870, 930, 990].map((x) => <line key={x} x1={x} y1={boomTop(x) + 1} x2={x} y2={boomBot(x) - 1} stroke={ln("poutre")} />)}
      <line x1="770" y1="236" x2="1040" y2="262" stroke={K.thin} /><line x1="768" y1="300" x2="1040" y2="273" stroke={K.thin} />
      <line x1="462" y1="184" x2="748" y2="200" stroke={K.amber} strokeWidth="1.6" strokeDasharray="4 3" />
      <line x1="748" y1={shaftY(748)} x2="1046" y2={shaftY(1046)} stroke={ln("poutre", K.amber)} strokeWidth="2.6" />
      {[770, 870, 970].map((x) => <circle key={x} cx={x} cy={shaftY(x)} r="3.5" fill="#0b1220" stroke={ln("poutre", K.amber)} />)}
      {[820, 920, 1020].map((x) => <rect key={x} x={x - 5} y={shaftY(x) - 3} width="10" height="9" fill="#0b1220" stroke={ln("poutre", K.amber)} />)}
      <path d="M940,232 C955,223 995,223 1012,232 C995,239 955,239 940,232 Z" {...st("poutre")} />
      <path d="M944,298 C959,289 999,289 1016,298 C999,305 959,305 944,298 Z" {...st("poutre")} />
      <line x1="976" y1="238" x2="976" y2="246" stroke={K.line} /><line x1="980" y1="292" x2="980" y2="286" stroke={K.line} />
      <path d="M1030,248 L1070,104 L1128,98 L1152,112 L1156,300 L1110,322 L1044,284 Z" {...st("fenestron", true)} />
      <circle cx="1095" cy="215" r="47" fill="none" stroke={ln("fenestron", K.line, true)} strokeWidth="3" />
      <circle cx="1095" cy="215" r="42" fill="#0b1220" stroke={K.thin} />
      {fen.map((a) => { const r = (a * Math.PI) / 180; return <line key={a} x1={1095 + 10 * Math.cos(r)} y1={215 + 10 * Math.sin(r)} x2={1095 + 39 * Math.cos(r)} y2={215 + 39 * Math.sin(r)} stroke={H("fenestron") ? K.crit : K.hl} strokeWidth="3" />; })}
      <circle cx="1095" cy="215" r="9" fill={K.fill2} stroke={K.line} />
      <rect x="1040" y="240" width="12" height="11" fill={K.fill2} stroke={ln("poutre", K.amber)} />
      <line x1="1052" y1="244" x2="1088" y2="222" stroke={ln("fenestron", K.amber, true)} strokeWidth="2" />

      {/* ===== fuselage : cabine, barque, pointe avant ===== */}
      <path d="M78,352 C62,330 64,300 92,282 C130,258 200,232 250,218 C275,212 290,208 305,208 L748,208 L760,214 C770,240 770,300 757,352 Z" fill={K.fill} stroke={K.line} strokeWidth="1.5" />
      <path d="M78,352 L757,352 C745,380 718,398 690,402 L180,402 C130,402 95,385 78,352 Z" {...st("barque")} />
      {[150, 210, 270, 330, 390, 450, 510, 570, 630, 690].map((x) => <line key={x} x1={x} y1="354" x2={x} y2={x < 160 ? 390 : 400} stroke={ln("barque")} strokeWidth="0.9" />)}
      <rect x="420" y="360" width="230" height="34" rx="6" fill="url(#cw-hatch)" stroke={K.thin} />
      <text x="535" y="381" textAnchor="middle" fontSize="11" fontFamily={MONO} fill={K.txt}>réservoirs souples</text>
      {/* pointe avant : radôme, verrière plongeante, montants, fenêtre de pied */}
      <path d="M78,352 C62,330 64,300 92,282 L104,300 C88,318 90,338 98,352 Z" fill={H("pointe") ? K.hlFill : K.fill2} stroke={ln("pointe")} />
      <path d="M104,300 C118,284 160,258 214,236 C250,222 276,213 298,211 L298,270 L248,296 L132,318 C112,320 104,312 104,300 Z" fill={H("pointe") ? K.hlFill : "#17304f"} stroke={ln("pointe")} strokeWidth={H("pointe") ? 2 : 1.2} />
      <line x1="214" y1="236" x2="218" y2="302" stroke={ln("pointe")} strokeWidth="2" />
      <line x1="160" y1="258" x2="168" y2="312" stroke={ln("pointe")} strokeWidth="1.2" />
      <path d="M112,334 C130,326 160,324 180,326 L184,348 L116,348 C112,344 111,338 112,334 Z" fill="#17304f" stroke={ln("pointe")} strokeOpacity="0.8" />
      {/* porte pilote */}
      <path d="M220,232 L296,212 L300,348 L226,348 C222,310 220,270 220,232 Z" fill="none" stroke={K.line} strokeWidth="1" />
      {/* siège pilote de profil, harnais */}
      <path d="M232,318 L272,318 L276,310 L236,310 Z" fill={K.fill2} stroke={ln("pointe")} />
      <path d="M270,312 L286,244 L296,246 L282,318 Z" fill={K.fill2} stroke={ln("pointe")} />
      <rect x="284" y="232" width="12" height="12" rx="3" fill={K.fill2} stroke={ln("pointe")} />
      <line x1="290" y1="252" x2="252" y2="312" stroke={K.amber} strokeWidth="1.2" />
      <line x1="244" y1="318" x2="244" y2="352" stroke={ln("pointe")} /><line x1="268" y1="318" x2="268" y2="352" stroke={ln("pointe")} />
      {/* manche cyclique col-de-cygne, collectif articulé, palonniers */}
      <path d="M216,352 C216,334 214,318 206,306 C200,298 198,290 206,284" fill="none" stroke={H("pointe") ? K.hl : K.ink} strokeWidth="2.2" />
      <circle cx="207" cy="282" r="3.5" fill={H("pointe") ? K.hl : K.ink} />
      <line x1="280" y1="344" x2="242" y2="330" stroke={H("pointe") ? K.hl : K.amber} strokeWidth="2.4" />
      <rect x="232" y="325" width="12" height="7" rx="2" transform="rotate(20 238 328)" fill={K.amber} />
      <circle cx="280" cy="344" r="2.5" fill={K.amber} />
      <line x1="150" y1="350" x2="140" y2="322" stroke={K.ok} strokeWidth="2.2" /><line x1="134" y1="320" x2="146" y2="326" stroke={K.ok} strokeWidth="3" />
      {/* timonerie ATA 67 : sous plancher puis remontée vers les servocommandes */}
      <polyline points="150,352 152,364 214,364" fill="none" stroke={VIO} strokeWidth="1.6" />
      <polyline points="216,356 216,366 306,366" fill="none" stroke={VIO} strokeWidth="1.8" />
      <path d="M306,366 L316,358 L318,372 Z" fill={VIO} />
      <polyline points="316,360 316,212 340,204 366,128" fill="none" stroke={VIO} strokeWidth="1.8" />
      <circle cx="316" cy="212" r="3" fill={VIO} />
      {/* plancher cabine */}
      <line x1="84" y1="352" x2="757" y2="352" stroke={K.line} strokeWidth="1.8" />
      {/* porte cabine coulissante + rail + hublots */}
      <rect x="340" y="222" width="220" height="124" rx="5" fill="none" stroke={K.line} />
      <line x1="330" y1="217" x2="612" y2="217" stroke={K.thin} strokeWidth="2" />
      <rect x="356" y="234" width="188" height="56" rx="8" fill="#17304f" stroke={K.line} strokeOpacity="0.7" />
      <rect x="590" y="234" width="110" height="52" rx="8" fill="#17304f" stroke={K.line} strokeOpacity="0.6" />
      <text x="450" y="318" textAnchor="middle" fontSize="11" fontFamily={MONO} fill={K.txt}>porte cabine coulissante</text>
      {/* plancher mécanique */}
      <rect x="300" y="196" width="448" height="12" fill={pmOn ? K.hlFill : K.fill2} stroke={pmOn ? K.hl : K.line} strokeWidth={pmOn ? 2 : 1.2} />
      <rect x="300" y="196" width="448" height="12" fill="url(#cw-hatch)" opacity="0.6" />
      {ov.includes("pm") && <text x="610" y="205.5" textAnchor="middle" fontSize="9" fontWeight="700" fontFamily={MONO} fill={K.ink}>PLANCHER MÉCANIQUE</text>}
      <circle cx="740" cy="210" r="3" fill={K.ok} /><circle cx="748" cy="356" r="3" fill={K.ok} />
      {/* patins cintrés */}
      <path d="M262,402 C258,430 250,452 244,468" fill="none" stroke={K.line} strokeWidth="3" />
      <path d="M610,402 C618,430 626,452 632,468" fill="none" stroke={K.line} strokeWidth="3" />
      <path d="M146,442 Q156,468 192,468 L700,468" fill="none" stroke={K.line} strokeWidth="4.5" strokeLinecap="round" />

      {/* ===== surcouches structurales ===== */}
      {ov.includes("couples") && (
        <g stroke={K.ok} strokeWidth="1.6" strokeDasharray="5 3">
          {[[140, 270, 392], [200, 240, 400], [326, 210, 400], [400, 210, 400], [474, 210, 400], [560, 210, 400], [640, 210, 400], [720, 210, 398]].map(([x, a, b]) => <line key={x} x1={x} y1={a} x2={x} y2={b} />)}
          {[810, 870, 930, 990].map((x) => <line key={"b" + x} x1={x} y1={boomTop(x)} x2={x} y2={boomBot(x)} strokeWidth="2.4" />)}
        </g>
      )}
      {ov.includes("lisses") && (
        <g stroke={K.amber} strokeWidth="1.4" strokeDasharray="7 3">
          <line x1="200" y1="250" x2="762" y2="250" /><line x1="140" y1="300" x2="764" y2="300" /><line x1="110" y1="378" x2="740" y2="378" />
          <line x1="770" y1="232" x2="1040" y2="258" /><line x1="768" y1="306" x2="1040" y2="276" />
        </g>
      )}
      {ov.includes("anneaux") && (
        <g>
          {[326, 474].map((x) => <line key={x} x1={x} y1="208" x2={x} y2="402" stroke={K.crit} strokeWidth="5" />)}
          <text x="560" y="426" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily={MONO} fill={K.crit}>anneaux principaux (cadres forts) sous les pieds de barres</text>
        </g>
      )}

      {/* ===== nomenclature ===== */}
      <Lb x1={400} y1={46} x2={440} y2={36} t="moyeu Starflex / Spheriflex (ATA 62)" />
      <Lb x1={374} y1={68} x2={356} y2={64} t="biellette de pas" a="end" c={K.amber} />
      <Lb x1={414} y1={70} x2={356} y2={76} t="compas" a="end" c={VIO} />
      <Lb x1={368} y1={84} x2={356} y2={88} t="étoiles tournante / fixe" a="end" />
      <Lb x1={366} y1={110} x2={352} y2={102} t="servocommandes ×3 (ATA 67)" a="end" />
      <Lb x1={358} y1={132} x2={344} y2={130} t="BTP nervurée (ATA 63)" a="end" />
      <Lb x1={345} y1={160} x2={330} y2={152} t="carter conique" a="end" />
      <Lb x1={336} y1={176} x2={322} y2={176} t="4 barres de suspension + béquilles" a="end" c={K.amber} />
      <Lb x1={500} y1={140} x2={516} y2={100} t="entrée d'air grillagée" />
      <Lb x1={545} y1={150} x2={600} y2={80} t="compresseur · chambre · turbine" />
      <Lb x1={740} y1={102} x2={758} y2={116} t="tuyère" />
      <Lb x1={748} y1={150} x2={762} y2={150} t="cloisons pare-feu Ti / inox" c={K.crit} />
      <Lb x1={850} y1={shaftY(850)} x2={830} y2={184} t="arbre ATA 65 + paliers" c={K.amber} />
      <Lb x1={1046} y1={246} x2={1010} y2={200} t="BTI" a="end" />
      <Lb x1={978} y1={302} x2={978} y2={340} t="stabilisateur biplan" />
      <Lb x1={1095} y1={262} x2={1190} y2={348} t="Fenestron (ATA 64)" a="end" />
      <Lb x1={86} y1={330} x2={40} y2={420} t="radôme avionique" />
      <Lb x1={180} y1={250} x2={150} y2={226} t="verrière" a="end" />
      <Lb x1={140} y1={334} x2={110} y2={386} t="palonniers" a="end" c={K.ok} />
      <Lb x1={206} y1={296} x2={190} y2={378} t="cyclique" a="end" />
      <Lb x1={250} y1={333} x2={262} y2={386} t="collectif" c={K.amber} />
      <Lb x1={316} y1={330} x2={296} y2={446} t="timonerie ATA 67 (bielles, renvois)" a="end" c={VIO} />

      {/* repères */}
      <Hot id="barque" n={1} x={690} y={382} sel={sel} onSel={onSel} />
      <Hot id="pointe" n={2} x={128} y={292} sel={sel} onSel={onSel} />
      <Hot id="plancher" n={3} x={284} y={198} sel={sel} onSel={onSel} />
      <Hot id="btp" n={4} x={460} y={74} sel={sel} onSel={onSel} />
      <Hot id="moteur" n={5} x={604} y={128} sel={sel} onSel={onSel} />
      <Hot id="poutre" n={6} x={900} y={322} sel={sel} onSel={onSel} />
      <Hot id="fenestron" n={7} x={1172} y={88} sel={sel} onSel={onSel} />
    </svg>
  );
}

/* Poste de pilotage vu de dessus (nez en haut) : CdB à DROITE (+Y, 212), copilote à GAUCHE (−Y, 211) */
function CockpitTop() {
  const seat = (x, title, sub, coll) => (
    <g>
      {/* palonniers doubles */}
      <rect x={x - 24} y="140" width="12" height="18" rx="3" fill="none" stroke={K.ok} strokeWidth="1.6" />
      <rect x={x + 12} y="140" width="12" height="18" rx="3" fill="none" stroke={K.ok} strokeWidth="1.6" />
      {/* siège baquet anatomique : assise + dossier + joues */}
      <path d={`M${x - 30},196 C${x - 32},236 ${x - 30},262 ${x - 22},274 L${x + 22},274 C${x + 30},262 ${x + 32},236 ${x + 30},196 C${x + 18},190 ${x - 18},190 ${x - 30},196 Z`} fill={K.fill2} stroke={K.line} strokeWidth="1.3" />
      <path d={`M${x - 24},250 L${x + 24},250 L${x + 20},272 L${x - 20},272 Z`} fill="#22355a" stroke={K.line} />
      {/* harnais 4 points */}
      <line x1={x - 14} y1="252" x2={x} y2="226" stroke={K.amber} strokeWidth="1.6" /><line x1={x + 14} y1="252" x2={x} y2="226" stroke={K.amber} strokeWidth="1.6" />
      <line x1={x - 22} y1="218" x2={x} y2="226" stroke={K.amber} strokeWidth="1.3" /><line x1={x + 22} y1="218" x2={x} y2="226" stroke={K.amber} strokeWidth="1.3" />
      <circle cx={x} cy="226" r="3.5" fill={K.amber} />
      {/* manche cyclique entre les jambes */}
      <line x1={x} y1="196" x2={x} y2="178" stroke={K.hl} strokeWidth="2" /><circle cx={x} cy="176" r="5" fill={K.hl} />
      {/* levier de pas collectif sur le flanc gauche du siège */}
      <line x1={coll} y1="262" x2={coll} y2="206" stroke={K.amber} strokeWidth="3" strokeLinecap="round" /><rect x={coll - 4} y="198" width="8" height="12" rx="2" fill={K.amber} />
      <text x={x} y="292" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Barlow, sans-serif" fill="#e6edf7">{title}</text>
      <text x={x} y="306" textAnchor="middle" fontSize="10" fontFamily={MONO} fill={K.amber}>{sub}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 340 320" className="h-auto w-full" role="img" aria-label="Poste de pilotage vu de dessus : copilote à gauche, commandant de bord à droite">
      <rect width="340" height="320" fill="#0b1220" />
      {/* contour du nez vitré + montants */}
      <path d="M170,10 C244,12 300,52 314,118 L318,280 L22,280 L26,118 C40,52 96,12 170,10 Z" fill="#0f1729" stroke={K.line} strokeWidth="1.4" />
      <path d="M170,16 C236,18 288,54 302,108 L38,108 C52,54 104,18 170,16 Z" fill="#17304f" stroke={K.line} strokeOpacity="0.8" />
      <line x1="170" y1="16" x2="170" y2="108" stroke={K.line} strokeWidth="1.5" />
      <line x1="96" y1="34" x2="70" y2="108" stroke={K.line} /><line x1="244" y1="34" x2="270" y2="108" stroke={K.line} />
      {/* planche de bord en T + piédestal */}
      <path d="M60,108 L280,108 L280,128 L196,128 L196,136 L144,136 L144,128 L60,128 Z" fill={K.fill2} stroke={K.line} strokeWidth="1.3" />
      {[80, 118, 222, 260].map((x) => <rect key={x} x={x - 14} y="112" width="28" height="12" rx="2" fill="#0b1220" stroke={K.thin} />)}
      <rect x="150" y="136" width="40" height="120" rx="4" fill={K.fill2} stroke={K.line} strokeWidth="1.3" />
      {[150, 168, 186, 204, 222].map((y) => <rect key={y} x="156" y={y} width="28" height="10" rx="1.5" fill="#0b1220" stroke={K.thin} />)}
      <text x="170" y="270" textAnchor="middle" fontSize="8" fontFamily={MONO} fill={K.txt}>piédestal</text>
      {/* conjoncteur des palonniers */}
      <line x1="94" y1="162" x2="246" y2="162" stroke={K.ok} strokeWidth="1.2" strokeDasharray="4 3" />
      <text x="170" y="100" textAnchor="middle" fontSize="9" fontFamily={MONO} fill={K.txt}>avant ▲ · nez vitré</text>
      {seat(94, "Copilote", "GAUCHE · −Y · 211", 58)}
      {seat(246, "Commandant de bord", "DROITE · +Y · 212", 210)}
      <g fontSize="8.5" fontFamily={MONO}>
        <text x="30" y="178" fill={K.ok}>conjoncteur</text>
        <text x="30" y="188" fill={K.ok}>palonniers</text>
      </g>
      <line x1="296" y1="22" x2="328" y2="22" stroke={K.amber} markerEnd="url(#ck-a)" />
      <defs><marker id="ck-a" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill={K.amber} /></marker></defs>
      <text x="276" y="26" fontSize="9" fontFamily={MONO} fill={K.amber}>+Y</text>
    </svg>
  );
}

/* Fenestron vu de face : espacement angulaire irrégulier */
function FenestronFront() {
  const ang = [0, 32, 68, 101, 140, 175, 212, 247, 284, 323];
  const gaps = ang.map((a, i) => ((ang[(i + 1) % ang.length] - a + 360) % 360));
  return (
    <svg viewBox="0 0 300 230" className="h-auto w-full" role="img" aria-label="Fenestron vu de face avec pales à espacement irrégulier">
      <circle cx="150" cy="112" r="96" fill="#0f1729" stroke={K.line} strokeWidth="3" />
      <circle cx="150" cy="112" r="84" fill="none" stroke={K.thin} strokeDasharray="3 3" />
      <circle cx="150" cy="112" r="20" fill={K.fill2} stroke={K.line} />
      {ang.map((a, i) => {
        const r = ((a - 90) * Math.PI) / 180, m = ((a + gaps[i] / 2 - 90) * Math.PI) / 180;
        return (
          <g key={a}>
            <path d={`M${150 + 22 * Math.cos(r - 0.08)},${112 + 22 * Math.sin(r - 0.08)} L${150 + 80 * Math.cos(r - 0.05)},${112 + 80 * Math.sin(r - 0.05)} L${150 + 80 * Math.cos(r + 0.07)},${112 + 80 * Math.sin(r + 0.07)} L${150 + 22 * Math.cos(r + 0.06)},${112 + 22 * Math.sin(r + 0.06)} Z`} fill={K.hlFill} stroke={K.hl} />
            <text x={150 + 64 * Math.cos(m)} y={112 + 64 * Math.sin(m) + 3} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill={K.amber}>{gaps[i]}°</text>
          </g>
        );
      })}
      <text x="150" y="224" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.txt}>écarts inégaux (valeurs illustratives)</text>
    </svg>
  );
}

export default function Cutaway() {
  const [sel, setSel] = useState("btp");
  const [ov, setOv] = useState(["anneaux"]);
  const toggle = (id) => setOv(ov.includes(id) ? ov.filter((o) => o !== id) : [...ov, id]);
  const p = CUT_PARTS.find((x) => x.id === sel);
  const cs = classeStyle[p.classe];
  return (
    <section className="flex flex-col gap-4">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-sky">Écorché de cellule · fiches de cours</div>
        <h3 className="font-display text-2xl font-semibold text-ink">Anatomie d'un hélicoptère Airbus, ensemble par ensemble</h3>
        <p className="mt-1 max-w-4xl text-[13px] text-muted">Clique un repère numéroté pour ouvrir sa fiche (rôle, chapitre ATA, classe de pièce, points de gamme, contrôles qualité). Active les surcouches pour voir où se trouvent les couples, les lisses, les anneaux principaux et le plancher mécanique.</p>
      </div>
      <div className="flex flex-col gap-2 rounded-xl border border-line bg-panel p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-muted">Surcouches structure</span>
          {STRUCT_ELEMS.map((e) => (
            <button key={e.id} type="button" aria-pressed={ov.includes(e.id)} onClick={() => toggle(e.id)} className={cx("rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold", ov.includes(e.id) ? "border-sky bg-sky/15 text-ink" : "border-line bg-panel2 text-muted hover:text-ink")}>
              <span className={e.color}>■</span> {e.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-muted">Repères</span>
          {CUT_PARTS.map((x) => (
            <button key={x.id} type="button" onClick={() => setSel(x.id)} className={cx("rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold", sel === x.id ? "border-sky bg-sky/15 text-ink" : "border-line bg-panel2 text-muted hover:text-ink")}>
              <span className="font-mono text-sky">{x.n}</span> {x.titre.split(" (")[0].split(",")[0]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-bg"><SideView sel={sel} onSel={setSel} ov={ov} /></div>
      {ov.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {STRUCT_ELEMS.filter((e) => ov.includes(e.id)).map((e) => (
            <div key={e.id} className="rounded-lg border border-line bg-bg p-3 text-[13px] leading-snug text-ink/90"><strong className={e.color}>{e.name} : </strong>{e.desc}</div>
          ))}
        </div>
      )}
      <article className="rounded-xl border border-line bg-panel p-5" aria-live="polite">
        <div className="mb-3 flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky font-mono text-[15px] font-bold text-bg">{p.n}</span>
          <div className="min-w-0">
            <h4 className="font-display text-xl font-semibold leading-tight text-ink">{p.titre}</h4>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-sky">{p.ata}</span>
              <span className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted"><MapPin size={10} />{p.zone}</span>
              <span className={cx("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase", cs.cls)}><cs.Icon size={10} />{cs.label}</span>
            </div>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <p className="text-[14px] leading-relaxed text-ink/90">{p.resume}</p>
            <div className="flex gap-2 rounded-lg border border-amber/50 bg-amber/10 p-3 text-[13px] leading-relaxed text-ink"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber" /><span><strong className="text-amber">Piège : </strong>{p.piege}</span></div>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted"><Wrench size={12} />À retenir pour la gamme</div>
            <ul className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-ink/90">{p.points.map((t) => <li key={t} className="flex gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sky" />{t}</li>)}</ul>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ok"><ClipboardCheck size={12} />Contrôles qualité</div>
            <ul className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-ink/90">{p.qc.map((t) => <li key={t} className="flex gap-2"><span className="text-ok">✓</span>{t}</li>)}</ul>
          </div>
        </div>
      </article>
      <div className="grid gap-3 md:grid-cols-2">
        <figure className="rounded-xl border border-line bg-bg p-2"><CockpitTop /><figcaption className="px-2 pb-1 text-[12px] text-muted">Poste vu de dessus : sur hélicoptère Airbus, le commandant de bord est à droite (+Y, sous-zone paire 212), le copilote à gauche (−Y, 211). Cyclique entre les jambes, collectif sur le flanc gauche de chaque siège, palonniers doubles reliés par le conjoncteur.</figcaption></figure>
        <figure className="rounded-xl border border-line bg-bg p-2"><FenestronFront /><figcaption className="px-2 pb-1 text-[12px] text-muted">Fenestron (ATA 64) : l'espacement irrégulier des pales étale le bruit sur plusieurs fréquences.</figcaption></figure>
      </div>
      <p className="text-[11px] text-muted">Dessin de principe, proportions et stations indicatives. La documentation de l'appareil (plans, manuel de maintenance) fait foi.</p>
    </section>
  );
}
