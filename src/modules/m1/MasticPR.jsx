/* ============================================================
   M1 · LES 4 RÔLES DU MASTIC PR SUR HÉLICOPTÈRE (non pressurisé)
   Chaque carte : coupe d'assemblage, familles de produits, précautions de gamme.
   Références données à titre de formation : la gamme suit l'EI et le plan.
   ============================================================ */
import React from "react";
import { Droplets, Fuel, Flame, ShieldCheck, FlaskConical, AlertTriangle } from "lucide-react";

const K = { line: "#5b7299", thin: "#3a4c70", fill: "#16223a", fill2: "#1b2a47", hl: "#3b9eff", ok: "#3ddc97", amber: "#ffb020", ko: "#ff5d6c", txt: "#8fa0bd", metal: "#9fb3d1", pr: "#7d8a9e", glass: "#5fd0e0", cf: "#2b2f38", ink: "#e6edf7", fire: "#ff7a3d" };
const MONO = "JetBrains Mono, monospace";
const T = ({ x, y, children, c = K.txt, a = "start" }) => <text x={x} y={y} fill={c} fontSize="9" fontFamily={MONO} textAnchor={a}>{children}</text>;
const Lead = ({ x1, y1, x2, y2 }) => <><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={K.thin} strokeWidth="0.8" /><circle cx={x1} cy={y1} r="1.6" fill={K.txt} /></>;
const Bolt = ({ x, y1, y2 }) => (
  <g>
    <rect x={x - 3} y={y1} width="6" height={y2 - y1} fill={K.fill2} stroke={K.metal} />
    <rect x={x - 7} y={y1 - 4} width="14" height="4" fill={K.fill2} stroke={K.metal} />
    <rect x={x - 7} y={y2} width="14" height="5" fill={K.fill2} stroke={K.metal} />
  </g>
);

/* verrière : glace acrylique sur cadre, cordon PR et joint */
function CutCanopy() {
  return (
    <svg viewBox="0 0 260 140" className="h-auto w-full" role="img" aria-label="Coupe de la fixation de verrière avec cordon de mastic">
      <rect width="260" height="140" fill="#0d1526" />
      <path d="M20,40 L200,40 L200,52 L20,52 Z" fill="rgba(95,208,224,0.18)" stroke={K.glass} />
      <rect x="90" y="52" width="150" height="10" fill={K.fill2} stroke={K.metal} />
      <path d="M150,62 H240 V100 H230 V72 H150 Z" fill={K.fill} stroke={K.line} />
      <rect x="150" y="30" width="90" height="10" fill={K.fill2} stroke={K.metal} />
      <Bolt x={176} y1={30} y2={72} /><Bolt x={214} y1={30} y2={72} />
      <path d="M200,40 Q206,34 212,40 L212,52 Q206,58 200,52 Z" fill={K.pr} />
      <path d="M140,30 Q146,22 152,30 L150,40 L140,40 Z" fill={K.pr} />
      <Lead x1={206} y1={46} x2={236} y2={118} /><T x={236} y={128} a="end" c={K.ink}>cordon PR de lissage</T>
      <Lead x1={146} y1={30} x2={110} y2={16} /><T x={60} y={14} c={K.ink}>joint extérieur</T>
      <Lead x1={60} y1={46} x2={40} y2={80} /><T x={14} y={90} c={K.glass}>glace acrylique</T>
      <Lead x1={110} y1={57} x2={80} y2={110} /><T x={14} y={120}>bande d'interposition</T>
      <T x={226} y={88} a="end" c={K.txt}>cadre de verrière</T>
    </svg>
  );
}

/* drain du plancher mécanique : bac, cordon d'angle et goulotte libre */
function CutDrain() {
  return (
    <svg viewBox="0 0 260 140" className="h-auto w-full" role="img" aria-label="Coupe d'un drain de plancher mécanique avec cordon d'angle">
      <rect width="260" height="140" fill="#0d1526" />
      <path d="M20,40 H110 L118,78 H142 L150,40 H240 V50 H156 L148,88 H112 L104,50 H20 Z" fill={K.fill} stroke={K.line} />
      <rect x="122" y="88" width="16" height="40" fill={K.fill2} stroke={K.metal} />
      <path d="M126,92 V126 M134,92 V126" stroke="#0d1526" strokeWidth="3" />
      <path d="M104,50 Q108,56 112,52 L112,50 Z M156,50 Q152,56 148,52 L148,50 Z" fill={K.pr} />
      <path d="M112,86 Q118,84 122,88 L112,88 Z M148,86 Q142,84 138,88 L148,88 Z" fill={K.pr} />
      <path d="M40,30 Q60,26 80,34 Q96,40 104,44" fill="none" stroke={K.amber} strokeWidth="1.4" strokeDasharray="4 3" />
      <path d="M130,92 V132" stroke={K.amber} strokeWidth="1.4" strokeDasharray="4 3" />
      <T x={14} y={24} c={K.amber}>fuite huile BTP / carburant</T>
      <Lead x1={150} y1={52} x2={168} y2={70} /><T x={170} y={76} c={K.ink}>cordon d'angle B</T>
      <Lead x1={116} y1={87} x2={60} y2={110} /><T x={14} y={120} c={K.ink}>pinceau classe A</T>
      <T x={146} y={128} c={K.ok}>drain dégagé</T>
      <T x={252} y={34} a="end">plancher mécanique</T>
    </svg>
  );
}

/* traversée de cloison pare-feu Ti / inox */
function CutFirewall() {
  return (
    <svg viewBox="0 0 260 140" className="h-auto w-full" role="img" aria-label="Coupe d'une traversée de cloison pare-feu avec mastic coupe-feu">
      <rect width="260" height="140" fill="#0d1526" />
      <rect x="120" y="14" width="10" height="112" fill={K.fill2} stroke={K.metal} />
      <rect x="40" y="62" width="180" height="16" rx="3" fill={K.fill} stroke={K.line} />
      <rect x="108" y="54" width="34" height="32" fill="none" stroke={K.metal} />
      <path d="M108,54 h12 v32 h-12 Z M130,54 h12 v32 h-12 Z" fill="rgba(159,179,209,0.15)" stroke={K.metal} />
      <path d="M142,54 Q150,58 142,62 Z M142,78 Q150,82 142,86 Z M108,54 Q100,58 108,62 Z M108,78 Q100,82 108,86 Z" fill={K.fire} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${172 + i * 24},126 q-6,-10 0,-18 q6,8 0,18`} fill="none" stroke={K.fire} strokeWidth="1.4" />)}
      <T x={254} y={136} a="end" c={K.fire}>compartiment moteur</T>
      <T x={14} y={134}>cabine / zone froide</T>
      <Lead x1={125} y1={30} x2={150} y2={20} /><T x={154} y={22} c={K.ink}>cloison Ti / inox</T>
      <Lead x1={146} y1={82} x2={152} y2={96} /><T x={150} y={102} c={K.fire}>mastic coupe-feu HT</T>
      <Lead x1={60} y1={70} x2={40} y2={40} /><T x={14} y={34}>câble / tuyauterie</T>
      <Lead x1={112} y1={56} x2={80} y2={20} /><T x={14} y={14}>passe-cloison qualifié feu</T>
    </svg>
  );
}

/* jonction CFRP / Al : pli de verre + PR interposé, fixation posée humide */
function CutGalva() {
  return (
    <svg viewBox="0 0 260 140" className="h-auto w-full" role="img" aria-label="Coupe d'une jonction carbone aluminium avec pli de verre et mastic interposé">
      <rect width="260" height="140" fill="#0d1526" />
      <rect x="20" y="40" width="200" height="16" fill={K.cf} stroke={K.line} />
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={24 + i * 10} y1="44" x2={30 + i * 10} y2="52" stroke="#454b57" />)}
      <rect x="20" y="56" width="200" height="4" fill="rgba(95,208,224,0.5)" stroke={K.glass} strokeWidth="0.6" />
      <rect x="20" y="60" width="200" height="4" fill={K.pr} />
      <path d="M40,64 H240 V80 H40 Z" fill="#26344f" stroke={K.metal} />
      <Bolt x={90} y1={40} y2={80} /><Bolt x={160} y1={40} y2={80} />
      <path d="M220,60 Q228,64 220,68 Z" fill={K.pr} />
      <Lead x1={60} y1={48} x2={40} y2={22} /><T x={14} y={16} c={K.ink}>peau carbone (CFRP)</T>
      <Lead x1={120} y1={58} x2={140} y2={22} /><T x={252} y={16} a="end" c={K.glass}>pli de verre d'isolation</T>
      <Lead x1={200} y1={62} x2={226} y2={34} /><T x={252} y={30} a="end" c={K.ink}>PR interposé</T>
      <Lead x1={60} y1={74} x2={40} y2={104} /><T x={14} y={114}>cadre aluminium</T>
      <Lead x1={160} y1={82} x2={180} y2={110} /><T x={252} y={122} a="end" c={K.ok}>fixation Ti posée humide</T>
    </svg>
  );
}

export const PR_CARDS = [
  {
    id: "canopy", name: "Intempéries : cordon de verrière", icon: Droplets, tone: "text-sky", border: "border-sky/40", Cut: CutCanopy,
    role: "Empêcher l'eau de pluie et de lavage d'entrer sous la verrière et dans les baies avionique, et lisser la jonction côté aérodynamique.",
    produits: ["Mastic polysulfure ou polythioéther de lissage, compatible avec l'acrylique, référence imposée par l'EI", "Bande ou joint d'interposition entre glace et cadre (la glace ne touche jamais le métal)"],
    precautions: ["Seul le solvant de nettoyage prescrit : certains solvants fissurent l'acrylique (craquelures)", "Protéger la glace (film) et masquer avant application", "Cordon continu, sans bulle, lissé, temps de polymérisation respecté avant essai d'étanchéité à l'eau"],
  },
  {
    id: "drain", name: "Fluides : drains du plancher mécanique", icon: Fuel, tone: "text-amber", border: "border-amber/40", Cut: CutDrain,
    role: "Étancher la barque et le plancher mécanique pour canaliser les fuites d'huile BTP, d'hydraulique et de carburant vers les drains, sans infiltration dans la structure.",
    produits: ["Polysulfure résistant au carburant (famille PR 1422 / PR 1440, AMS-S-8802)", "Classe B (pâteux) pour cordons d'angle et bourrage, classe A (fluide) pour application au pinceau"],
    precautions: ["Surfaces dégraissées, primaire si l'EI le demande, durée de vie en pot (pot life) respectée", "Le drain doit rester dégagé : aucun mastic dans l'orifice ni dans la goulotte", "Contrôle visuel du cordon continu, puis essai d'écoulement des drains"],
  },
  {
    id: "fire", name: "Feu : traversée de cloison pare-feu", icon: Flame, tone: "text-ko", border: "border-ko/40", Cut: CutFirewall,
    role: "Garder l'étanchéité au feu des cloisons titane ou inox qui isolent les turbomoteurs, au droit de chaque traversée de câble ou de tuyauterie.",
    produits: ["Mastic coupe-feu haute température qualifié (silicone ou produit spécifique feu défini par l'EI)", "Passe-cloisons et colliers qualifiés feu"],
    precautions: ["Jamais un polysulfure standard : il ne tient pas la température et ne remplit pas l'exigence feu", "Pas de trou ajouté ni de modification de cloison hors plan", "Toute traversée refaite est tracée sur la gamme, référence et lot du produit relevés"],
  },
  {
    id: "galva", name: "Corrosion : jonction CFRP / aluminium", icon: ShieldCheck, tone: "text-ok", border: "border-ok/40", Cut: CutGalva,
    role: "Isoler électriquement le carbone de l'aluminium : au contact, l'aluminium devient l'anode et se corrode (couple galvanique), très présent sur H160, H175 et NH90.",
    produits: ["Pli de verre d'isolation côté carbone (au drapage ou rapporté)", "PR interposé (exemple de famille : PR 1776 classe B) entre les surfaces, et fixations titane posées humides"],
    precautions: ["Application humide : PR sur les faces et sur les fixations avant pose, serrage avant polymérisation", "Cordon continu sur tout le pourtour, bourrelet visible à l'extrusion", "Pas de contact direct carbone / aluminium, même au niveau d'une fixation ou d'une cale"],
  },
];

export default function MasticPR() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {PR_CARDS.map((c) => {
        const Icon = c.icon;
        return (
          <article key={c.id} className={`flex min-w-0 flex-col gap-2 rounded-xl border bg-panel p-4 ${c.border}`}>
            <h4 className="flex items-center gap-2 font-display text-lg font-semibold text-ink"><Icon size={17} className={c.tone} />{c.name}</h4>
            <p className="text-[13px] leading-snug text-ink/90">{c.role}</p>
            <div className="overflow-hidden rounded-lg border border-line"><c.Cut /></div>
            <div className="rounded-lg border border-line bg-bg p-3">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-sky"><FlaskConical size={13} />Familles de produits</div>
              <ul className="flex flex-col gap-1 text-[13px] leading-snug text-ink/90">{c.produits.map((t) => <li key={t}>• {t}</li>)}</ul>
            </div>
            <div className="rounded-lg border border-line bg-bg p-3">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-amber"><AlertTriangle size={13} />Précautions de gamme</div>
              <ul className="flex flex-col gap-1 text-[13px] leading-snug text-ink/90">{c.precautions.map((t) => <li key={t}>• {t}</li>)}</ul>
            </div>
          </article>
        );
      })}
    </div>
  );
}
