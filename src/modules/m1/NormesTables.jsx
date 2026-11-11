/* ============================================================
   M1 · TABLEAUX DE DÉCODAGE DES RÉFÉRENCES
   1. Référentiels : BNAE (NF L / EN / RG.Aéro), ASN, ECS, EI / EICM
   2. Anatomie d'une désignation de fixation normalisée
   3. Gestion de configuration (RG.Aéro 000 23) : rangs d'application MSN
   ============================================================ */
import React, { useState } from "react";
import { BookOpen, Info, AlertTriangle, Layers, GitBranch } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

const REFS = [
  { code: "NF L · EN", org: "BNAE (par délégation AFNOR) · ASD-STAN pour les EN", def: "Normes françaises (NF L) et européennes (EN) de composants, matériaux et procédés aéronautiques : vis, écrous, rivets, inserts, colliers…", plan: "« Vis EN xxxx-… » ou « Écrou NF L xx-xxx-… » dans la nomenclature", tone: "text-ok" },
  { code: "RG.Aéro", org: "BNAE", def: "Recommandations générales : méthodes et organisation communes à la profession. Ex. RG.Aéro 000 23 : gestion de configuration.", plan: "Référencé dans les procédures qualité et de configuration, rarement sur le plan de pièce", tone: "text-ok" },
  { code: "ASN", org: "Aerospatiale Norme (référentiel historique)", def: "Normes internes de pièces standard créées par Aerospatiale (division hélicoptères avant 1992). Toujours valides et appelées sur de nombreux plans et nomenclatures.", plan: "« Vis ASN… », « Rondelle ASN… » sur les ensembles dont la définition est héritée", tone: "text-amber" },
  { code: "ECS", org: "Eurocopter Standard (référentiel interne depuis Eurocopter)", def: "Standards internes de pièces standard et fixations créés après la fusion de 1992, toujours appelés chez Airbus Helicopters.", plan: "« Écrou ECS… », « Collier ECS… » sur les définitions plus récentes", tone: "text-amber" },
  { code: "EI · EICM", org: "Instructions Eurocopter / Airbus Helicopters", def: "Procédés spéciaux et règles métier : couples, freinage, application des mastics PR, métallisation, interposition, contrôle.", plan: "Renvoi en note de plan ou dans la gamme : « Appliquer selon EI xx-xxx »", tone: "text-sky" },
];

const SEGMENTS = [
  { id: "norme", txt: "EN6115", sep: "", label: "Norme de définition", detail: "Désigne la famille de la vis. Exemple d'école construit sur le modèle de l'EN6115 : vis à tête fraisée 100°, en alliage de titane, de série inch. La fiche de la norme donne la forme, la matière autorisée, la résistance et le tableau des dimensions.", ex: "Autres désignations rencontrées sur une nomenclature Airbus Helicopters : « Écrou NF L 22-xxx », « Vis ASN-A xxxx », « Collier ECS xxxx »." },
  { id: "mat", txt: "T", sep: " - ", label: "Matière / classe de résistance", detail: "Code de matière défini par la norme : alliage de titane (TA6V), acier allié haute résistance, acier inoxydable, superalliage A286, alliage d'aluminium.", ex: "Une vis titane et une vis acier de même géométrie ne sont PAS interchangeables (masse, résistance, couple galvanique)." },
  { id: "trait", txt: "C", sep: " - ", label: "Traitement de surface / revêtement", detail: "Protection anticorrosion et frottement : anodisation, passivation (inox), revêtement aluminium (IVD), lubrifiant sec. Le dessin montre le revêtement sur toute la vis.", ex: "Le traitement conditionne le couple de serrage et la compatibilité avec la structure (carbone, aluminium)." },
  { id: "dia", txt: "04", sep: " - ", label: "Diamètre nominal D", detail: "Code du diamètre nominal, mesuré sur le fût lisse. L'unité dépend de la série : millimètres en métrique, fraction de pouce en série inch (le tableau de la norme donne la correspondance).", ex: "Toujours lire l'unité dans la norme : un « 04 » n'est pas forcément 4 mm." },
  { id: "grip", txt: "10", sep: " - ", label: "Longueur de prise (grip)", detail: "Longueur de la partie lisse qui doit correspondre à l'épaisseur totale serrée. Sur une vis fraisée, elle se mesure depuis le dessus de la tête. Dans les séries inch, le grip progresse souvent par pas de 1/16 po.", ex: "Grip trop court : le filet travaille dans l'alésage. Grip trop long : l'écrou ou la bague talonne et ne serre plus." },
];

/* Schéma coté de la vis : chaque bloc de la désignation s'allume sur le dessin */
function VisSchema({ seg }) {
  const on = (id) => seg === id;
  const hl = "#3b9eff", line = "#5b7299", txt = "#8fa0bd", amber = "#ffb020";
  const bodyStroke = on("mat") || on("trait") || on("norme") ? hl : line;
  return (
    <svg viewBox="0 0 480 230" className="h-auto w-full" role="img" aria-label="Schéma coté d'une vis à tête fraisée 100°">
      <defs>
        <marker id="vs-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={txt} /></marker>
        <pattern id="vs-h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#2e4168" strokeWidth="1" /></pattern>
      </defs>
      <rect width="480" height="230" fill="#0b1220" />
      {/* tôles serrées */}
      <path d="M60,40 L60,190 L150,190 L150,40 Z" fill="url(#vs-h)" stroke={line} opacity="0.55" />
      <line x1="105" y1="40" x2="105" y2="190" stroke={line} opacity="0.55" />
      {/* tête fraisée 100° */}
      <path d="M60,74 L60,146 L90,126 L90,94 Z" fill={on("norme") ? "rgba(59,158,255,0.25)" : "#1b2a47"} stroke={bodyStroke} strokeWidth="1.6" />
      {/* fût lisse */}
      <rect x="90" y="94" width="120" height="32" fill={on("dia") || on("grip") ? "rgba(59,158,255,0.2)" : "#1b2a47"} stroke={bodyStroke} strokeWidth="1.6" />
      {/* partie filetée */}
      <rect x="210" y="96" width="90" height="28" fill="#1b2a47" stroke={bodyStroke} strokeWidth="1.6" />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1={214 + i * 8} y1="96" x2={220 + i * 8} y2="124" stroke={line} />)}
      <path d="M300,96 L306,100 L306,120 L300,124" fill="none" stroke={bodyStroke} strokeWidth="1.6" />
      {/* revêtement */}
      {on("trait") && <path d="M58,72 L92,92 L212,92 L212,94 L302,94 L308,99 L308,121 L302,126 L212,126 L212,128 L92,128 L58,148 Z" fill="none" stroke={amber} strokeWidth="2" strokeDasharray="4 2" />}
      {/* empreinte */}
      <line x1="66" y1="102" x2="66" y2="118" stroke={line} strokeWidth="2" />
      {/* cote angle 100° */}
      <path d="M48,70 L76,110 L48,150" fill="none" stroke={on("norme") ? hl : txt} strokeDasharray="3 2" />
      <text x="22" y="114" fontSize="12" fontFamily="JetBrains Mono, monospace" fill={on("norme") ? hl : txt}>100°</text>
      {/* cote diamètre D */}
      <line x1="180" y1="60" x2="180" y2="94" stroke={on("dia") ? hl : txt} markerEnd="url(#vs-a)" />
      <line x1="180" y1="160" x2="180" y2="126" stroke={on("dia") ? hl : txt} markerEnd="url(#vs-a)" />
      <text x="186" y="66" fontSize="12" fontFamily="JetBrains Mono, monospace" fontWeight={on("dia") ? 700 : 400} fill={on("dia") ? hl : txt}>Ø D (code 04)</text>
      {/* cote grip */}
      <line x1="60" y1="200" x2="60" y2="152" stroke={txt} strokeWidth="0.7" /><line x1="210" y1="200" x2="210" y2="130" stroke={txt} strokeWidth="0.7" />
      <line x1="62" y1="196" x2="208" y2="196" stroke={on("grip") ? hl : txt} markerStart="url(#vs-a)" markerEnd="url(#vs-a)" />
      <text x="135" y="214" textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fontWeight={on("grip") ? 700 : 400} fill={on("grip") ? hl : txt}>grip (code 10) = épaisseur serrée</text>
      {/* cote longueur filetée */}
      <line x1="300" y1="92" x2="300" y2="40" stroke={txt} strokeWidth="0.7" />
      <line x1="212" y1="46" x2="298" y2="46" stroke={txt} markerStart="url(#vs-a)" markerEnd="url(#vs-a)" />
      <text x="256" y="38" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill={txt}>longueur filetée</text>
      {/* étiquette matière / traitement */}
      <line x1="250" y1="124" x2="330" y2="168" stroke="#3a4c70" />
      <text x="334" y="166" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight={on("mat") ? 700 : 400} fill={on("mat") ? hl : txt}>matière : titane (T)</text>
      <text x="334" y="182" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight={on("trait") ? 700 : 400} fill={on("trait") ? amber : txt}>revêtement (C)</text>
      <text x="334" y="104" fontSize="11" fontFamily="JetBrains Mono, monospace" fill={txt}>écrou / bague</text>
      <text x="334" y="118" fontSize="11" fontFamily="JetBrains Mono, monospace" fill={txt}>côté filetage</text>
      <text x="62" y="30" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={txt}>tôles assemblées</text>
    </svg>
  );
}

const MSN_RANGE = [1040, 1080];
const CONFIG = [
  { from: 1040, to: 1060, pn: "C531A2051-03", mod: "Définition de base", interch: true },
  { from: 1061, to: 1072, pn: "C531A2051-04", mod: "Mod 07421 : épaisseur de semelle portée de 2,0 à 2,5 mm (interchangeable : nouvel indice)", interch: true },
  { from: 1073, to: 1080, pn: "C531A2287-01", mod: "Mod 07688 : nouvel entraxe de fixation (non interchangeable : nouvelle référence)", interch: false },
];

export default function NormesTables() {
  const [seg, setSeg] = useState("norme");
  const [msn, setMsn] = useState(1058);
  const s = SEGMENTS.find((x) => x.id === seg);
  const cfg = CONFIG.find((c) => msn >= c.from && msn <= c.to);
  return (
    <section className="flex flex-col gap-6">
      {/* 1. Référentiels */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2"><BookOpen size={18} className="text-sky" /><h3 className="font-display text-2xl font-semibold text-ink">Tableau des référentiels cités sur un plan Airbus Helicopters</h3></div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-panel2 font-mono text-[11px] uppercase tracking-wider text-muted">
              <tr><th className="px-3 py-2">Référentiel</th><th className="px-3 py-2">Origine</th><th className="px-3 py-2">Ce qu'il définit</th><th className="px-3 py-2">Où on le rencontre</th></tr>
            </thead>
            <tbody>
              {REFS.map((r) => (
                <tr key={r.code} className="border-t border-line align-top">
                  <td className={cx("px-3 py-2 font-mono font-semibold", r.tone)}>{r.code}</td>
                  <td className="px-3 py-2 text-ink">{r.org}</td>
                  <td className="px-3 py-2 text-ink/90">{r.def}</td>
                  <td className="px-3 py-2 text-muted">{r.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 rounded-xl border border-amber/50 bg-amber/10 p-4 text-[14px] leading-relaxed text-ink">
          <Info size={20} className="mt-0.5 shrink-0 text-amber" />
          <div>
            <strong className="text-amber">ASN et ECS ne s'opposent pas.</strong> ASN (Aerospatiale Norme) est le référentiel historique, ECS (Eurocopter Standard) le référentiel plus récent. Les deux sont utilisés aujourd'hui chez Airbus Helicopters pour les pièces standard, souvent sur le même appareil, selon l'âge de la définition de chaque ensemble. La règle est simple : <strong>on monte exactement la référence appelée par le plan ou la nomenclature</strong>. Remplacer une ASN par une ECS ou une EN « équivalente » n'est permis que si le bureau d'études l'a prévu (table d'équivalence ou modification approuvée).
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-panel p-4 text-[13px] leading-relaxed text-ink/90"><span className="font-mono text-[11px] uppercase tracking-wider text-amber">ASN / ECS = la pièce</span><p className="mt-1">Quelle vis, quel écrou, quelle rondelle : géométrie, matière, traitement, marquage.</p></div>
          <div className="rounded-xl border border-line bg-panel p-4 text-[13px] leading-relaxed text-ink/90"><span className="font-mono text-[11px] uppercase tracking-wider text-sky">EI / EICM = la façon de faire</span><p className="mt-1">Comment la poser : couple, lubrification, freinage, mastic, métallisation, contrôle.</p></div>
        </div>
      </div>

      {/* 2. Désignation */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2"><Layers size={18} className="text-sky" /><h3 className="font-display text-2xl font-semibold text-ink">Décoder la désignation d'une vis ou d'un écrou normalisé</h3></div>
        <p className="max-w-3xl text-[13px] text-muted">Une désignation de fixation se lit par blocs. Exemple d'école sur le modèle d'une vis <strong className="text-ink">EN6115</strong> (tête fraisée 100°, titane) : clique un bloc, il s'allume sur le schéma coté. L'ordre et le codage exacts de chaque lettre sont donnés par la fiche de la norme.</p>
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-line bg-bg p-4 font-mono text-xl sm:text-2xl">
          {SEGMENTS.map((x) => (
            <React.Fragment key={x.id}>
              {x.sep && <span className="text-muted">{x.sep.trim()}</span>}
              <button type="button" onClick={() => setSeg(x.id)} className={cx("rounded-md border px-2 py-1 transition", seg === x.id ? "border-sky bg-sky/20 text-ink" : "border-line bg-panel2 text-sky hover:border-sky/60")}>{x.txt}</button>
            </React.Fragment>
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-xl border border-line"><VisSchema seg={seg} /></div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-sky/50 bg-sky/10 p-4">
              <div className="font-mono text-[11px] uppercase tracking-wider text-sky">{s.txt} · {s.label}</div>
              <p className="mt-1 text-[14px] leading-relaxed text-ink">{s.detail}</p>
              <p className="mt-2 text-[13px] text-amber">{s.ex}</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-panel2 font-mono text-[10px] uppercase tracking-wider text-muted"><tr><th className="px-3 py-2">Bloc</th><th className="px-3 py-2">Information</th></tr></thead>
                <tbody>{SEGMENTS.map((x) => <tr key={x.id} className={cx("border-t border-line", seg === x.id && "bg-sky/10")}><td className="px-3 py-1.5 font-mono text-sky">{x.txt}</td><td className="px-3 py-1.5 text-ink">{x.label}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3 text-[13px] leading-relaxed">
          <div className="rounded-xl border border-line bg-panel p-3"><span className="font-semibold text-ink">Écrou : </span><span className="text-ink/90">norme + matière + traitement + diamètre de filetage. Pour un autofreiné, la norme précise le type de freinage (tout métal ou insert) et la température maximale.</span></div>
          <div className="rounded-xl border border-line bg-panel p-3"><span className="font-semibold text-ink">Rondelle : </span><span className="text-ink/90">norme + matière + diamètre intérieur + épaisseur. Une rondelle oubliée change le grip et le couple réel.</span></div>
          <div className="rounded-xl border border-line bg-panel p-3"><span className="font-semibold text-ink">Marquage : </span><span className="text-ink/90">la tête porte souvent un repère de fabricant et de matière. En cas de doute, la référence du bon de sortie magasin fait foi, pas l'aspect.</span></div>
        </div>
      </div>

      {/* 3. Configuration */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2"><GitBranch size={18} className="text-sky" /><h3 className="font-display text-2xl font-semibold text-ink">Gestion de configuration (RG.Aéro 000 23) : rangs d'application par MSN</h3></div>
        <p className="max-w-3xl text-[13px] text-muted">Chaque appareil (MSN, numéro de série constructeur) doit être monté selon sa propre définition. Une modification s'applique à partir d'un rang : la gamme et la nomenclature doivent pointer la bonne référence pour le bon MSN. Exemple fictif sur un support de H160 :</p>
        <div className="rounded-xl border border-line bg-panel p-4">
          <label htmlFor="msn" className="flex flex-wrap items-center gap-3 text-[14px] text-ink">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">MSN de l'appareil sur chaîne</span>
            <input id="msn" type="range" min={MSN_RANGE[0]} max={MSN_RANGE[1]} value={msn} onChange={(e) => setMsn(Number(e.target.value))} className="w-56 accent-sky" />
            <span className="font-mono text-xl font-semibold text-sky">{msn}</span>
          </label>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="font-mono text-[11px] uppercase tracking-wider text-muted"><tr><th className="px-3 py-2">Rang d'application</th><th className="px-3 py-2">Référence à monter</th><th className="px-3 py-2">Origine</th></tr></thead>
              <tbody>
                {CONFIG.map((c) => (
                  <tr key={c.pn} className={cx("border-t border-line", c === cfg && "bg-sky/15")}>
                    <td className="px-3 py-2 font-mono text-ink">MSN {c.from} à {c.to}</td>
                    <td className={cx("px-3 py-2 font-mono font-semibold", c === cfg ? "text-sky" : "text-ink")}>{c.pn}</td>
                    <td className="px-3 py-2 text-ink/90">{c.mod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[14px] text-ink">Pour le MSN <strong className="font-mono text-sky">{msn}</strong>, la gamme doit appeler <strong className="font-mono text-sky">{cfg.pn}</strong>.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 text-[13px] leading-relaxed">
          <div className="rounded-xl border border-line bg-panel p-4"><span className="font-mono text-[11px] uppercase tracking-wider text-ok">Interchangeable → nouvel indice</span><p className="mt-1 text-ink/90">Forme, montage et fonction inchangés : la pièce garde sa référence de base et change d'indice (-03 → -04). Les deux indices peuvent souvent se monter selon les règles d'interchangeabilité définies.</p></div>
          <div className="rounded-xl border border-line bg-panel p-4"><span className="font-mono text-[11px] uppercase tracking-wider text-ko">Non interchangeable → nouvelle référence</span><p className="mt-1 text-ink/90">Le montage ou la fonction change : nouvelle référence. Monter l'ancienne pièce sur un MSN postérieur au rang rend l'appareil non conforme à sa définition.</p></div>
        </div>
        <div className="flex gap-2 rounded-lg border border-ko/50 bg-ko/10 p-3 text-[13px] text-ink"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-ko" />Le préparateur ne choisit jamais la référence « disponible en magasin » : il applique l'effectivité MSN de la nomenclature. Une pièce d'ancien indice sur un MSN neuf exige une dérogation.</div>
      </div>
    </section>
  );
}
