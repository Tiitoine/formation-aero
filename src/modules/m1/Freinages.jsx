/* ============================================================
   M1 · LES 5 MOYENS DE FREINAGE : dessin vectoriel + fiche méthodes.
   Les références produits et valeurs sont des exemples pédagogiques :
   la gamme applique toujours l'instruction EI et le plan en vigueur.
   ============================================================ */
import React from "react";
import { Lock, Cog, MapPin, ClipboardList, ShieldCheck } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");
const K = { line: "#5b7299", thin: "#3a4c70", fill: "#16223a", fill2: "#1b2a47", hl: "#3b9eff", ok: "#3ddc97", amber: "#ffb020", ko: "#ff5d6c", txt: "#8fa0bd", metal: "#9fb3d1", metal2: "#c8d6ea", red: "#e2485a", nylon: "#f5f0d8", ink: "#e6edf7" };
const MONO = "JetBrains Mono, monospace";
const T = ({ x, y, children, c = K.txt, a = "start", s = 9 }) => <text x={x} y={y} fill={c} fontSize={s} fontFamily={MONO} textAnchor={a}>{children}</text>;
const Hex = ({ x, y, r = 16, fill = K.fill2 }) => {
  const pts = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i + Math.PI / 6; return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`; }).join(" ");
  return <polygon points={pts} fill={fill} stroke={K.metal} strokeWidth="1.3" />;
};
const Defs = ({ id }) => (
  <defs>
    <marker id={`${id}-a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={K.ok} /></marker>
    <marker id={`${id}-r`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={K.ko} /></marker>
    <pattern id={`${id}-h`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#2e4168" strokeWidth="1" /></pattern>
  </defs>
);

/* 1 · fil à freiner : deux têtes de vis vues de dessus, fil torsadé tirant dans le sens du serrage */
function DrawFil() {
  const twist = Array.from({ length: 9 }, (_, i) => 92 + i * 9);
  return (
    <svg viewBox="0 0 260 160" className="h-auto w-full" role="img" aria-label="Fil à freiner entre deux têtes de vis">
      <Defs id="fw" />
      <rect width="260" height="160" fill="#0d1526" />
      <rect x="14" y="112" width="232" height="22" fill={K.fill} stroke={K.line} /><rect x="14" y="112" width="232" height="22" fill="url(#fw-h)" />
      <Hex x={66} y={70} r={22} /><Hex x={194} y={70} r={22} />
      <circle cx="66" cy="70" r="5" fill={K.fill} stroke={K.metal2} /><circle cx="194" cy="70" r="5" fill={K.fill} stroke={K.metal2} />
      {/* trous de freinage */}
      <circle cx="80" cy="60" r="2.4" fill="#0d1526" stroke={K.metal2} /><circle cx="180" cy="80" r="2.4" fill="#0d1526" stroke={K.metal2} />
      {/* fil torsadé */}
      <path d={`M80,60 ${twist.map((x, i) => `L${x},${i % 2 ? 66 : 74}`).join(" ")} L180,80`} fill="none" stroke={K.amber} strokeWidth="1.6" />
      <path d={`M80,60 ${twist.map((x, i) => `L${x},${i % 2 ? 74 : 66}`).join(" ")} L180,80`} fill="none" stroke={K.amber} strokeWidth="1.6" opacity="0.75" />
      {/* boucle autour de la tête droite */}
      <path d="M180,80 C178,100 210,98 214,78 C216,62 204,50 194,48" fill="none" stroke={K.amber} strokeWidth="1.6" />
      {/* queue de cochon */}
      <path d="M194,48 l6,-4 l-4,-4 l6,-4 l-4,-4 l6,-3 q6,-2 4,6" fill="none" stroke={K.amber} strokeWidth="1.6" />
      <T x={186} y={30} a="end" c={K.amber}>queue de cochon</T><T x={186} y={40} a="end" c={K.amber}>3 à 6 torsades</T>
      {/* sens de serrage */}
      <path d="M40,40 A30,30 0 0 1 92,40" fill="none" stroke={K.ok} strokeWidth="1.6" markerEnd="url(#fw-a)" />
      <path d="M168,100 A30,30 0 0 0 220,100" fill="none" stroke={K.ok} strokeWidth="1.6" markerEnd="url(#fw-a)" />
      <T x={8} y={14} c={K.ok}>sens de serrage</T>
      <T x={120} y={100} a="middle">le fil tire chaque vis</T><T x={120} y={109} a="middle">dans le sens du serrage</T>
      <T x={130} y={150} a="middle">carter / bride</T>
    </svg>
  );
}

/* 2 · écrou autofreiné : coupe bague nylon vs tout métal déformé */
function DrawAutofreine() {
  const nut = (x, metal) => (
    <g>
      <rect x={x - 6} y="20" width="12" height="120" fill={K.fill2} stroke={K.metal} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={x - 6} y1={24 + i * 10} x2={x + 6} y2={28 + i * 10} stroke={K.thin} />)}
      <rect x={x - 38} y="62" width="76" height="40" fill="none" stroke={K.metal} strokeWidth="1.3" />
      <rect x={x - 38} y="62" width="32" height="40" fill="url(#af-h)" stroke={K.metal} /><rect x={x + 6} y="62" width="32" height="40" fill="url(#af-h)" stroke={K.metal} />
      {metal ? (
        <>
          <path d={`M${x - 38},62 L${x - 6},62 L${x - 4},66 L${x - 38},66 Z`} fill={K.ko} opacity="0.75" />
          <path d={`M${x + 38},62 L${x + 6},62 L${x + 4},66 L${x + 38},66 Z`} fill={K.ko} opacity="0.75" />
        </>
      ) : (
        <>
          <rect x={x - 30} y="54" width="24" height="8" fill={K.nylon} stroke={K.metal} />
          <rect x={x + 6} y="54" width="24" height="8" fill={K.nylon} stroke={K.metal} />
          <path d={`M${x - 38},54 L${x - 30},54 L${x - 30},62 L${x - 38},62 Z M${x + 30},54 L${x + 38},54 L${x + 38},62 L${x + 30},62 Z`} fill={K.fill2} stroke={K.metal} />
        </>
      )}
      <rect x={x - 46} y="102" width="92" height="18" fill={K.fill} stroke={K.line} />
    </g>
  );
  return (
    <svg viewBox="0 0 260 160" className="svg-halo h-auto w-full" role="img" aria-label="Coupe écrou à bague nylon et écrou tout métal">
      <Defs id="af" />
      <rect width="260" height="160" fill="#0d1526" />
      {nut(68, false)}{nut(192, true)}
      <T x={68} y={14} a="middle" c={K.ink}>Bague nylon ≤ 120 °C</T>
      <T x={192} y={14} a="middle" c={K.ink}>Tout métal</T>
      <line x1="40" y1="56" x2="18" y2="44" stroke={K.thin} /><T x={4} y={40} c={K.nylon}>insert</T>
      <line x1="222" y1="64" x2="246" y2="48" stroke={K.thin} /><T x={256} y={44} a="end" c={K.ko}>filets ovalisés</T>
      <line x1="68" y1="30" x2="100" y2="30" stroke={K.ok} /><line x1="68" y1="50" x2="100" y2="50" stroke={K.ok} /><line x1="98" y1="30" x2="98" y2="50" stroke={K.ok} markerStart="url(#af-a)" markerEnd="url(#af-a)" />
      <T x={102} y={43} c={K.ok}>≥ 2 filets</T>
      <T x={130} y={152} a="middle">pièces assemblées</T>
    </svg>
  );
}

/* 3 · goupille fendue : écrou crénelé, goupille, deux branches rabattues */
function DrawGoupille() {
  return (
    <svg viewBox="0 0 260 160" className="h-auto w-full" role="img" aria-label="Écrou crénelé et goupille fendue aux branches rabattues">
      <Defs id="gf" />
      <rect width="260" height="160" fill="#0d1526" />
      {/* tige de boulon */}
      <rect x="30" y="64" width="190" height="24" fill={K.fill} stroke={K.metal} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={120 + i * 8} y1="64" x2={124 + i * 8} y2="88" stroke={K.thin} />)}
      {/* pièce */}
      <rect x="30" y="34" width="70" height="84" fill="url(#gf-h)" stroke={K.line} />
      {/* écrou crénelé de profil */}
      <path d="M104,40 H150 V52 H160 V40 H174 V112 H104 Z" fill={K.fill2} stroke={K.metal} strokeWidth="1.3" />
      <rect x="150" y="40" width="10" height="12" fill="#0d1526" stroke={K.metal} />
      {/* goupille (tête + 2 branches) */}
      <circle cx="155" cy="30" r="6" fill="none" stroke={K.amber} strokeWidth="2" />
      <line x1="153" y1="36" x2="153" y2="118" stroke={K.amber} strokeWidth="2" /><line x1="157" y1="36" x2="157" y2="118" stroke={K.amber} strokeWidth="2" />
      {/* branche haute rabattue sur le bout de la tige */}
      <path d="M157,36 C176,22 214,26 216,62" fill="none" stroke={K.amber} strokeWidth="2" />
      {/* branche basse rabattue sur le plat de l'écrou */}
      <path d="M153,118 C153,130 170,132 172,114" fill="none" stroke={K.amber} strokeWidth="2" />
      <T x={254} y={12} a="end" c={K.amber}>branche sur la tige</T>
      <T x={254} y={140} a="end" c={K.amber}>branche sur le plat</T>
      <line x1="196" y1="134" x2="170" y2="124" stroke={K.thin} />
      <T x={6} y={20}>pièce</T><T x={148} y={128} a="end">écrou crénelé</T>
      <T x={6} y={154} c={K.ok}>créneau aligné en serrant</T>
    </svg>
  );
}

/* 4 · frein filet + vernis témoin */
function DrawFreinFilet() {
  return (
    <svg viewBox="0 0 260 160" className="h-auto w-full" role="img" aria-label="Vis avec frein filet et trait de vernis témoin">
      <Defs id="ff" />
      <rect width="260" height="160" fill="#0d1526" />
      <rect x="20" y="96" width="220" height="40" fill={K.fill} stroke={K.line} /><rect x="20" y="96" width="220" height="40" fill="url(#ff-h)" />
      {/* vis en coupe */}
      <rect x="90" y="56" width="56" height="40" rx="3" fill={K.fill2} stroke={K.metal} strokeWidth="1.3" />
      <rect x="106" y="96" width="24" height="40" fill={K.fill2} stroke={K.metal} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M106,${100 + i * 6} l-5,3 l5,3 M130,${100 + i * 6} l5,3 l-5,3`} fill="none" stroke={K.metal} />)}
      {/* produit anaérobie dans les filets */}
      <rect x="100" y="98" width="6" height="36" fill={K.ko} opacity="0.55" /><rect x="130" y="98" width="6" height="36" fill={K.ko} opacity="0.55" />
      {/* vernis témoin à cheval tête / pièce */}
      <path d="M140,58 L150,60 L152,96 L170,96 L170,102 L146,102 L144,62 Z" fill={K.amber} stroke={K.amber} />
      <T x={176} y={70} c={K.amber}>vernis témoin</T><T x={176} y={80} c={K.amber}>tête → pièce</T>
      <line x1="100" y1="120" x2="60" y2="70" stroke={K.thin} /><T x={8} y={60} c={K.ko}>frein filet</T><T x={8} y={70} c={K.ko}>anaérobie</T>
      <T x={8} y={20}>filetage dégraissé, référence exacte</T>
      <T x={8} y={32}>temps de polymérisation respecté</T>
      <T x={130} y={152} a="middle">un trait cassé = vis qui a tourné</T>
    </svg>
  );
}

/* 5 · rondelle frein à languette rabattue */
function DrawRondelle() {
  return (
    <svg viewBox="0 0 260 160" className="h-auto w-full" role="img" aria-label="Rondelle frein à languette rabattue sur un plat d'écrou">
      <Defs id="rf" />
      <rect width="260" height="160" fill="#0d1526" />
      {/* vue de dessus */}
      <circle cx="80" cy="82" r="44" fill={K.fill} stroke={K.line} />
      <path d="M116,72 L150,64 L156,90 L118,94 Z" fill={K.fill} stroke={K.line} />
      <circle cx="80" cy="82" r="36" fill="none" stroke={K.metal} strokeDasharray="2 2" />
      <Hex x={80} y={82} r={28} />
      <circle cx="80" cy="82" r="10" fill="#0d1526" stroke={K.metal2} />
      {/* languette rabattue contre un plat */}
      <path d="M104,70 L114,66 L118,96 L106,96 Z" fill={K.amber} opacity="0.9" />
      <T x={8} y={18}>vue de dessus</T>
      <T x={124} y={52} c={K.amber}>languette rabattue</T><T x={124} y={62} c={K.amber}>à plat contre le pan</T>
      {/* coupe latérale */}
      <rect x="168" y="112" width="84" height="20" fill="url(#rf-h)" stroke={K.line} />
      <rect x="188" y="96" width="44" height="14" fill={K.fill2} stroke={K.metal} />
      <path d="M180,110 H240 V112 H180 Z" fill={K.amber} />
      <path d="M232,110 L234,110 L234,96 L232,96 Z" fill={K.amber} />
      <path d="M180,110 L180,124 L178,124 L178,110 Z" fill={K.amber} />
      <T x={168} y={90}>coupe</T>
      <T x={254} y={152} a="end" c={K.ok}>ergot dans la pièce</T>
      <T x={8} y={140} c={K.ko}>pliage unique, jamais redressée</T>
    </svg>
  );
}

export const FREINAGES = [
  {
    id: "fil", name: "Fil à freiner", Draw: DrawFil,
    principe: "Un fil inox (ou inconel en zone chaude) relie deux éléments percés et forme une torsade tendue. Si une vis amorce un desserrage, le fil se met en traction et la retient : il est posé pour tirer chaque élément dans le sens du serrage.",
    zones: ["BTP et boîtes de transmission arrière : bouchons de vidange, détecteurs de limaille (ATA 63 / 65)", "Raccords et bouchons des circuits hydrauliques (ATA 29)", "Turbomoteurs : raccords et bouchons en zone chaude, fil inconel (ATA 71 / 72)"],
    regle: ["Fil neuf, diamètre et matière définis par l'EI", "Serrer au couple avant de freiner, jamais l'inverse", "Torsade dans le sens du serrage, tendue sans entailler le fil", "3 éléments maximum par boucle (selon EI), queue de cochon de 3 à 6 torsades rabattue vers la pièce"],
    qc: "Le fil tire dans le sens du serrage, il est tendu, sans pli vif ni entaille, la queue de cochon est rabattue et ne peut pas blesser un opérateur ni accrocher une gaine. L'opération est tamponnée sur la gamme.",
  },
  {
    id: "auto", name: "Écrou autofreiné", Draw: DrawAutofreine,
    principe: "Le freinage vient d'un frottement permanent sur le filetage : une bague nylon que la vis taraude, ou un filet tout métal ovalisé qui pince la vis. Ce couple de freinage existe avant même le serrage.",
    zones: ["Structure et fixations secondaires en zone tempérée : bague nylon (≤ 120 °C environ)", "Cloisons pare-feu, capots moteur, zone BTP chaude : tout métal obligatoire (ATA 71 / 54)", "Supports d'équipements et ferrures de cabine (ATA 25 / 53)"],
    regle: ["Type d'écrou imposé par la température de la zone", "Au moins 2 filets de vis dépassant de l'écrou", "Mesurer le couple de freinage (couple résiduel) avant d'appliquer le couple de serrage spécifié", "Interdit sur un axe soumis à rotation : on y met écrou crénelé et goupille", "Réutilisation seulement si le couple de freinage mini est encore atteint"],
    qc: "Dépassement de filets conforme, type d'écrou conforme à la zone, couple de serrage relevé sur la gamme avec la valeur du couple de freinage mesurée.",
  },
  {
    id: "goupille", name: "Goupille fendue", Draw: DrawGoupille,
    principe: "Une goupille traverse les créneaux de l'écrou et le trou de la tige : l'écrou ne peut plus tourner. C'est le freinage des axes articulés, qui tournent en service.",
    zones: ["Commandes de vol rotor : axes de biellettes, guignols, renvois (ATA 67)", "Axes d'articulation de servocommandes et de compas du plateau cyclique (ATA 62 / 67)", "Atterrisseurs et axes de trappes (ATA 32)"],
    regle: ["Goupille neuve, diamètre et matière définis", "Aligner un créneau en serrant à l'intérieur de la plage de couple, jamais en desserrant", "Une branche rabattue sur le bout de la tige, l'autre sur un plat de l'écrou (ou selon la pratique de l'EI)", "Couper l'excédent, sans entailler les branches"],
    qc: "Goupille neuve et bien engagée, branches rabattues serrées contre l'écrou et la tige, sans fissure au pli. Sur commande de vol, double inspection indépendante avant fermeture.",
  },
  {
    id: "filet", name: "Frein filet", Draw: DrawFreinFilet,
    principe: "Une résine anaérobie polymérise en l'absence d'air entre les filets et colle la vis dans son taraudage. Le vernis témoin, lui, ne freine rien : c'est un indicateur visuel qui révèle une rotation.",
    zones: ["Vis d'équipements et carters là où le fil ou l'écrou ne sont pas possibles (ATA 25 / 63)", "Inserts filetés de panneaux composites (selon plan)", "Vernis témoin : sur toute fixation critique déjà freinée, en complément"],
    regle: ["Nettoyer et dégraisser vis et taraudage", "Utiliser la référence exacte de la gamme : la résistance du produit varie d'une référence à l'autre", "Respecter le temps de polymérisation avant d'appliquer un effort ou un essai", "Après serrage, trait de vernis témoin continu de la tête à la pièce"],
    qc: "Référence produit et numéro de lot tracés sur la gamme, date de péremption vérifiée, trait de vernis continu et non cassé.",
  },
  {
    id: "rondelle", name: "Rondelle frein", Draw: DrawRondelle,
    principe: "Une rondelle à languette ou à ergot est prise sous l'écrou : un ergot entre dans un trou de la pièce et une languette est rabattue contre un pan de l'écrou. L'écrou est bloqué en rotation.",
    zones: ["Écrous de mât rotor et de moyeu, écrous à encoches de transmission (ATA 62 / 63)", "Arbres de transmission arrière et paliers (ATA 65)", "Fixations de BTP et de boîtier d'accessoires (selon plan)"],
    regle: ["Rondelle neuve à chaque pose", "Serrer au couple, puis aligner un pan de l'écrou avec une languette en restant dans la plage de couple", "Pliage unique, net, à plat contre le pan : on ne redresse jamais une languette pour la replier"],
    qc: "Languette rabattue au contact du pan sur toute sa hauteur, sans criquage au pli, ergot bien engagé, rondelle neuve tracée sur la gamme.",
  },
];

const Section = ({ icon: Icon, title, tone, children }) => (
  <div className="rounded-lg border border-line bg-bg p-3">
    <div className={cx("mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider", tone)}><Icon size={13} />{title}</div>
    {children}
  </div>
);
const List = ({ items }) => (
  <ul className="flex flex-col gap-1 text-[13px] leading-snug text-ink/90">
    {items.map((t) => <li key={t} className="flex gap-1.5"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-muted" /><span>{t}</span></li>)}
  </ul>
);

export default function Freinages() {
  return (
    <div className="flex flex-col gap-3">
      {FREINAGES.map((f, i) => (
        <article key={f.id} className="grid gap-4 rounded-xl border border-amber/40 bg-panel p-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <div className="min-w-0">
            <h4 className="mb-2 flex items-center gap-2 font-display text-xl font-semibold text-ink"><span className="grid h-7 w-7 place-items-center rounded-md bg-amber font-mono text-[13px] font-bold text-bg">{i + 1}</span><Lock size={16} className="text-amber" />{f.name}</h4>
            <div className="overflow-hidden rounded-lg border border-line"><f.Draw /></div>
          </div>
          <div className="grid min-w-0 gap-2 md:grid-cols-2">
            <Section icon={Cog} title="Principe mécanique" tone="text-sky"><p className="text-[13px] leading-snug text-ink/90">{f.principe}</p></Section>
            <Section icon={MapPin} title="Où sur l'hélicoptère (zones / ATA)" tone="text-amber"><List items={f.zones} /></Section>
            <Section icon={ClipboardList} title="Règle de pose en gamme (EI)" tone="text-ok"><List items={f.regle} /></Section>
            <Section icon={ShieldCheck} title="Critère de contrôle Qualité" tone="text-ko"><p className="text-[13px] leading-snug text-ink/90">{f.qc}</p></Section>
          </div>
        </article>
      ))}
      <p className="font-mono text-[11px] text-muted">Valeurs et pratiques données à titre de formation : la gamme applique toujours l'instruction EI et le plan en vigueur.</p>
    </div>
  );
}
