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

/* ---------------- Dessin de profil ---------------- */
function Hot({ id, n, x, y, sel, onSel }) {
  const on = sel === id;
  return (
    <g role="button" tabIndex={0} aria-label={`Repère ${n}`} onClick={() => onSel(id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSel(id)} style={{ cursor: "pointer" }}>
      <circle cx={x} cy={y} r={on ? 15 : 13} fill={on ? K.hl : "#0b1220"} stroke={K.hl} strokeWidth="2" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill={on ? "#0b1220" : K.hl}>{n}</text>
    </g>
  );
}

function SideView({ sel, onSel }) {
  const H = (id) => sel === id;
  const st = (id, crit) => ({ fill: H(id) ? (crit ? K.critFill : K.hlFill) : K.fill, stroke: H(id) ? (crit ? K.crit : K.hl) : K.line, strokeWidth: H(id) ? 2 : 1.2 });
  /* Fenestron : 10 pales à espacement modulé (angles en degrés) */
  const fenAngles = [0, 32, 68, 101, 140, 175, 212, 247, 284, 323];
  return (
    <svg viewBox="0 0 1000 440" className="h-auto w-full" role="img" aria-label="Écorché de profil d'une cellule d'hélicoptère avec repères numérotés">
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke={K.thin} strokeWidth="1" /></pattern>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={K.txt} /></marker>
      </defs>
      {/* cartouche grille */}
      <rect x="0.5" y="0.5" width="999" height="439" fill="none" stroke={K.thin} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={100 + i * 100} y1="0" x2={100 + i * 100} y2="440" stroke="#16223a" />)}
      {/* trièdre */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill={K.txt}>
        <line x1="30" y1="410" x2="90" y2="410" stroke={K.txt} markerEnd="url(#arr)" /><text x="94" y="414">X (STA)</text>
        <line x1="30" y1="410" x2="30" y2="350" stroke={K.txt} markerEnd="url(#arr)" /><text x="22" y="342">Z (WL)</text>
        <text x="40" y="430">Vue de profil gauche · nez à gauche · X0 en avant du nez</text>
      </g>

      {/* rotor principal (pales coupées) */}
      <line x1="150" y1="58" x2="520" y2="58" stroke={K.line} strokeWidth="4" strokeLinecap="round" />
      <line x1="520" y1="58" x2="560" y2="58" stroke={K.line} strokeWidth="4" strokeDasharray="6 5" />
      {/* moyeu + mât + plateau */}
      <g>
        <rect x="330" y="50" width="70" height="18" rx="4" {...st("btp", true)} />
        <rect x="358" y="68" width="14" height="52" {...st("btp", true)} />
        <rect x="335" y="98" width="60" height="7" {...st("btp", true)} />
        <rect x="330" y="107" width="70" height="7" {...st("btp", true)} />
        <line x1="345" y1="68" x2="342" y2="98" stroke={H("btp") ? K.crit : K.line} />
        <line x1="385" y1="68" x2="388" y2="98" stroke={H("btp") ? K.crit : K.line} />
        <path d="M318,120 h94 l10,44 h-114 z" {...st("btp", true)} />
        <text x="365" y="146" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill={K.txt}>BTP</text>
        <text x="326" y="104" textAnchor="end" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.txt}>étoile tournante</text>
        <text x="326" y="116" textAnchor="end" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.txt}>étoile fixe</text>
      </g>
      {/* plancher mécanique + barres de suspension */}
      <g>
        <rect x="240" y="164" width="330" height="12" {...st("plancher")} />
        <rect x="240" y="164" width="330" height="12" fill="url(#hatch)" opacity="0.6" />
        <line x1="322" y1="160" x2="290" y2="176" stroke={H("plancher") ? K.hl : K.amber} strokeWidth="3" />
        <line x1="408" y1="160" x2="440" y2="176" stroke={H("plancher") ? K.hl : K.amber} strokeWidth="3" />
        <line x1="330" y1="160" x2="312" y2="176" stroke={H("plancher") ? K.hl : K.amber} strokeWidth="2" strokeDasharray="3 2" />
        <line x1="400" y1="160" x2="418" y2="176" stroke={H("plancher") ? K.hl : K.amber} strokeWidth="2" strokeDasharray="3 2" />
        {[290, 440].map((x) => <rect key={x} x={x - 6} y="176" width="12" height="110" fill="none" stroke={H("plancher") ? K.hl : K.line} strokeWidth="2" />)}
        <circle cx="560" cy="178" r="3" fill={K.ok} /><text x="548" y="196" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.ok}>drain</text>
        <text x="250" y="160" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.amber}>4 barres de suspension</text>
      </g>
      {/* moteurs + pare-feu */}
      <g>
        <rect x="440" y="124" width="120" height="38" rx="10" {...st("moteur")} />
        <text x="500" y="148" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill={K.txt}>turbomoteur</text>
        <line x1="432" y1="116" x2="432" y2="164" stroke={H("moteur") ? K.hl : K.ko} strokeWidth="3" />
        <line x1="568" y1="116" x2="568" y2="164" stroke={H("moteur") ? K.hl : K.ko} strokeWidth="3" />
        <text x="576" y="134" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.ko}>pare-feu Ti / inox</text>
        <path d="M560,150 h30" stroke={K.line} strokeWidth="6" />
      </g>
      {/* fuselage : pointe avant + cabine + barque */}
      <path d="M240,176 L570,176 L600,200 L600,286 L240,286 L170,282 C120,276 92,252 86,228 C84,214 92,200 110,192 L170,180 Z" fill="none" stroke={K.line} strokeWidth="1.6" />
      {/* verrière */}
      <path d="M240,176 L170,180 L110,192 C92,200 84,214 86,228 L150,232 L200,200 Z" {...st("pointe")} />
      {/* siège + manche */}
      <path d="M190,256 v-34 h14 v34" fill="none" stroke={H("pointe") ? K.hl : K.line} strokeWidth="2" />
      <line x1="172" y1="262" x2="166" y2="236" stroke={H("pointe") ? K.hl : K.line} strokeWidth="2" /><circle cx="166" cy="234" r="3" fill={H("pointe") ? K.hl : K.line} />
      <line x1="120" y1="264" x2="140" y2="264" stroke={H("pointe") ? K.hl : K.line} strokeWidth="3" />
      {/* cabine : couples */}
      {[260, 320, 380, 440, 500, 560].map((x) => <line key={x} x1={x} y1="178" x2={x} y2="284" stroke={K.thin} strokeDasharray="4 4" />)}
      <rect x="300" y="196" width="120" height="66" rx="6" fill="none" stroke={K.thin} /><text x="360" y="234" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.txt}>cabine · porte</text>
      {/* barque */}
      <path d="M170,286 L600,286 L600,316 L200,316 C186,312 176,300 170,286 Z" {...st("barque")} />
      {[240, 300, 360, 420, 480, 540].map((x) => <line key={x} x1={x} y1="288" x2={x} y2="314" stroke={H("barque") ? K.hl : K.line} />)}
      <rect x="300" y="292" width="170" height="18" rx="4" fill="url(#hatch)" stroke={K.thin} /><text x="385" y="305" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.txt}>réservoirs</text>
      <circle cx="590" cy="314" r="3" fill={K.ok} />
      {/* patins */}
      <path d="M250,316 l-14,58 M520,316 l14,58" stroke={K.line} strokeWidth="3" />
      <path d="M180,376 Q190,384 210,384 L600,384" fill="none" stroke={K.line} strokeWidth="4" strokeLinecap="round" />
      {/* poutre de queue */}
      <path d="M600,200 L880,226 L880,262 L600,286 Z" {...st("poutre")} />
      {[650, 700, 750, 800, 850].map((x, i) => <line key={x} x1={x} y1={204 + i * 4.6} x2={x} y2={282 - i * 4} stroke={H("poutre") ? K.hl : K.line} />)}
      <line x1="600" y1="226" x2="880" y2="236" stroke={K.thin} /><line x1="600" y1="262" x2="880" y2="254" stroke={K.thin} />
      <line x1="590" y1="214" x2="880" y2="240" stroke={H("poutre") ? K.hl : K.amber} strokeWidth="2.5" />
      {[660, 740, 820].map((x) => <rect key={x} x={x - 5} y={214 + (x - 590) * 0.09 - 5} width="10" height="10" fill="#0b1220" stroke={H("poutre") ? K.hl : K.amber} />)}
      <text x="640" y="196" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.amber}>arbre ATA 65 + paliers</text>
      {/* dérive + Fenestron */}
      <path d="M860,226 L900,90 L960,90 L960,300 L880,262 Z" {...st("fenestron", true)} />
      <circle cx="915" cy="220" r="38" fill="#0b1220" stroke={H("fenestron") ? K.crit : K.line} strokeWidth="2" />
      <circle cx="915" cy="220" r="8" fill={K.fill2} stroke={K.line} />
      {fenAngles.map((a) => { const r = (a * Math.PI) / 180; return <line key={a} x1={915 + 9 * Math.cos(r)} y1={220 + 9 * Math.sin(r)} x2={915 + 34 * Math.cos(r)} y2={220 + 34 * Math.sin(r)} stroke={H("fenestron") ? K.crit : K.hl} strokeWidth="3" />; })}
      <rect x="878" y="212" width="12" height="16" fill={K.fill2} stroke={K.line} /><text x="850" y="290" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.txt}>BTA</text>
      {/* cotes de station indicatives */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill={K.txt}>
        {[[86, "STA 0"], [365, "STA ~ mât"], [600, "jonction poutre"], [915, "Fenestron"]].map(([x, t]) => <g key={t}><line x1={x} y1="20" x2={x} y2="34" stroke={K.txt} /><text x={x} y="16" textAnchor="middle">{t}</text></g>)}
        <line x1="86" y1="27" x2="915" y2="27" stroke={K.thin} />
      </g>
      {/* repères */}
      <Hot id="barque" n={1} x={240} y={340} sel={sel} onSel={onSel} />
      <Hot id="pointe" n={2} x={128} y={208} sel={sel} onSel={onSel} />
      <Hot id="plancher" n={3} x={268} y={192} sel={sel} onSel={onSel} />
      <Hot id="btp" n={4} x={420} y={84} sel={sel} onSel={onSel} />
      <Hot id="moteur" n={5} x={540} y={100} sel={sel} onSel={onSel} />
      <Hot id="poutre" n={6} x={740} y={276} sel={sel} onSel={onSel} />
      <Hot id="fenestron" n={7} x={930} y={120} sel={sel} onSel={onSel} />
    </svg>
  );
}

/* Poste de pilotage vu de dessus : CdB à droite, copilote à gauche */
function CockpitTop() {
  const seat = (x, label, sub) => (
    <g>
      <rect x={x - 30} y="110" width="60" height="62" rx="8" fill={K.fill2} stroke={K.line} />
      <text x={x} y="190" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="Barlow, sans-serif" fill="#e6edf7">{label}</text>
      <text x={x} y="204" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.txt}>{sub}</text>
      <circle cx={x} cy="96" r="6" fill={K.hl} /><line x1={x} y1="102" x2={x} y2="112" stroke={K.hl} strokeWidth="2" />
      <rect x={x - 44} y="118" width="8" height="40" rx="3" fill={K.amber} />
      <rect x={x - 22} y="46" width="14" height="8" rx="2" fill={K.ok} /><rect x={x + 8} y="46" width="14" height="8" rx="2" fill={K.ok} />
    </g>
  );
  return (
    <svg viewBox="0 0 300 230" className="h-auto w-full" role="img" aria-label="Poste de pilotage vu de dessus : copilote à gauche, commandant de bord à droite">
      <path d="M150,8 C220,10 270,40 280,90 L280,220 L20,220 L20,90 C30,40 80,10 150,8 Z" fill="#0f1729" stroke={K.line} />
      <text x="150" y="26" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={K.txt}>avant ▲</text>
      {seat(85, "Copilote", "GAUCHE · −Y")}
      {seat(215, "Commandant de bord", "DROITE · +Y")}
      <g fontSize="9" fontFamily="JetBrains Mono, monospace">
        <circle cx="34" cy="64" r="4" fill={K.hl} /><text x="42" y="67" fill={K.txt}>cyclique</text>
        <rect x="30" y="74" width="8" height="8" fill={K.amber} /><text x="42" y="81" fill={K.txt}>collectif (à gauche du siège)</text>
        <rect x="200" y="74" width="10" height="6" fill={K.ok} /><text x="214" y="81" fill={K.txt}>palonniers</text>
      </g>
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
  const p = CUT_PARTS.find((x) => x.id === sel);
  const cs = classeStyle[p.classe];
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-sky">Écorché de cellule · fiches de cours</div>
          <h3 className="font-display text-2xl font-semibold text-ink">Anatomie d'un hélicoptère Airbus, ensemble par ensemble</h3>
          <p className="mt-1 max-w-3xl text-[13px] text-muted">Clique un repère numéroté : la fiche donne le rôle de l'ensemble, son chapitre ATA, sa classe de pièce, ce que le préparateur doit écrire dans la gamme et les contrôles qualité associés.</p>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-xl border border-line bg-bg p-2"><SideView sel={sel} onSel={setSel} /></div>
          <div className="flex flex-wrap gap-1.5">
            {CUT_PARTS.map((x) => (
              <button key={x.id} type="button" onClick={() => setSel(x.id)} className={cx("rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold", sel === x.id ? "border-sky bg-sky/15 text-ink" : "border-line bg-panel2 text-muted hover:text-ink")}>
                <span className="font-mono text-sky">{x.n}</span> {x.titre.split(" (")[0].split(",")[0]}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <figure className="rounded-xl border border-line bg-bg p-2"><CockpitTop /><figcaption className="px-2 pb-1 text-[12px] text-muted">Poste vu de dessus : sur hélicoptère Airbus, le CdB est à droite. Collectif à gauche de chaque siège, cyclique devant, palonniers au plancher.</figcaption></figure>
            <figure className="rounded-xl border border-line bg-bg p-2"><FenestronFront /><figcaption className="px-2 pb-1 text-[12px] text-muted">Fenestron (ATA 64) : l'espacement irrégulier des pales étale le bruit sur plusieurs fréquences.</figcaption></figure>
          </div>
        </div>
        <article className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-5" aria-live="polite">
          <div className="flex items-start gap-3">
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
          <p className="text-[14px] leading-relaxed text-ink/90">{p.resume}</p>
          <div>
            <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted"><Wrench size={12} />À retenir pour la gamme</div>
            <ul className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-ink/90">{p.points.map((t) => <li key={t} className="flex gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sky" />{t}</li>)}</ul>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ok"><ClipboardCheck size={12} />Contrôles qualité</div>
            <ul className="flex flex-col gap-1 text-[13px] text-ink/90">{p.qc.map((t) => <li key={t} className="flex gap-2"><span className="text-ok">✓</span>{t}</li>)}</ul>
          </div>
          <div className="mt-auto flex gap-2 rounded-lg border border-amber/50 bg-amber/10 p-3 text-[13px] leading-relaxed text-ink"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber" /><span><strong className="text-amber">Piège : </strong>{p.piege}</span></div>
        </article>
      </div>
      <p className="text-[11px] text-muted">Dessin de principe, proportions et stations indicatives. La documentation de l'appareil (plans, manuel de maintenance) fait foi.</p>
    </section>
  );
}
