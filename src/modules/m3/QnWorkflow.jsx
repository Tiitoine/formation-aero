/* ============================================================
   M3 · WORKFLOW QN SAP & FRONTIÈRE LÉGALE PART-21G / PART-21J
   Qui constate, qui décrit, qui décide, qui exécute, qui solde.
   ============================================================ */
import React from "react";
import { Factory, Building2, ArrowRight, ArrowDown, FileWarning, Ban, Search, Scale, Wrench, ClipboardCheck, BookOpenCheck, Stamp } from "lucide-react";
import { LockedQuickCheck } from "../../lib/pedago.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");

const LANE_G = [
  { icon: Ban, who: "Compagnon / opérateur", t: "Constate l'écart, arrête l'opération, étiquette la pièce" },
  { icon: FileWarning, who: "Préparateur méthodes", t: "Ouvre la QN SAP : faits cotés, référence, localisation, MSN" },
  { icon: Search, who: "Qualité production", t: "Vérifie la QN, bloque la zone dans le MES, cherche la cause" },
  { icon: BookOpenCheck, who: "Préparateur méthodes", t: "Cas couvert par une réparation standard pré-approuvée ? Si oui : appliquer et tracer" },
];
const LANE_J = [
  { icon: Scale, who: "Bureau d'études / Stress Office", t: "Analyse l'écart hors réparation standard, calcule les marges" },
  { icon: Stamp, who: "Signataire habilité DOA", t: "Approuve la décision : Rework, Repair, Use As Is ou Scrap (concession)" },
];
const BACK = [
  { icon: Wrench, who: "Préparateur méthodes", t: "Traduit la décision BE en opérations de gamme QN (outillage, valeurs, contrôles)" },
  { icon: ClipboardCheck, who: "Opérateur + Qualité", t: "Exécutent, contrôlent, signent ; la QN est soldée, l'appareil reste conforme à une définition approuvée" },
];

function Card({ s, tone }) {
  const I = s.icon;
  return (
    <div className={cx("flex items-start gap-2.5 rounded-lg border p-3", tone === "j" ? "border-amber/50 bg-amber/5" : "border-sky/40 bg-sky/5")}>
      <I size={17} className={cx("mt-0.5 shrink-0", tone === "j" ? "text-amber" : "text-sky")} />
      <div className="min-w-0"><div className="font-mono text-[10.5px] uppercase tracking-wider text-muted">{s.who}</div><div className="text-[13px] leading-snug text-ink">{s.t}</div></div>
    </div>
  );
}

export function QnSwimlane() {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-sky/15 px-3 py-2"><Factory size={16} className="text-sky" /><span className="text-[13px] font-semibold text-ink">Organisme de production · EASA Part-21G (POA)</span></div>
          <p className="text-[12.5px] text-muted">Fabrique conformément à la définition approuvée. Peut appliquer une réparation déjà approuvée, jamais en créer une.</p>
          {LANE_G.map((s, i) => <React.Fragment key={i}><Card s={s} />{i < LANE_G.length - 1 && <ArrowDown size={14} className="mx-auto text-muted" />}</React.Fragment>)}
        </div>
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-ko/70 px-2 py-3 text-center lg:h-full lg:justify-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ko">Frontière légale</span>
            <ArrowRight size={18} className="rotate-90 text-ko lg:rotate-0" />
            <span className="max-w-[9rem] text-[11px] text-ko">Hors réparation standard : la QN passe au DOA</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-amber/15 px-3 py-2"><Building2 size={16} className="text-amber" /><span className="text-[13px] font-semibold text-ink">Organisme de conception · EASA Part-21J (DOA)</span></div>
          <p className="text-[12.5px] text-muted">Détient l'approbation de la définition de type. Seul habilité à accepter un écart à cette définition (concession).</p>
          {LANE_J.map((s, i) => <React.Fragment key={i}><Card s={s} tone="j" />{i < LANE_J.length - 1 && <ArrowDown size={14} className="mx-auto text-muted" />}</React.Fragment>)}
          <div className="mt-2 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-muted"><ArrowDown size={13} />Retour en production</div>
          {BACK.map((s, i) => <Card key={i} s={s} />)}
        </div>
      </div>
    </div>
  );
}

const MATRIX = [
  { d: "REWORK", fr: "Retouche", qui: "Production, selon la définition existante", doc: "Gamme QN de retouche", res: "Pièce exactement conforme au plan d'origine", ex: "Rivets de mauvaise longueur déposés et reposés dans des trous conformes" },
  { d: "REPAIR", fr: "Réparation", qui: "BE (DOA) approuve, production exécute", doc: "Dossier de réparation BE + gamme QN", res: "Définition différente mais approuvée, aptitude au vol restaurée", ex: "Doubleur et fixation de diamètre supérieur non prévus au plan" },
  { d: "USE AS IS", fr: "Utiliser en l'état", qui: "BE (DOA) par le calcul", doc: "Concession (dérogation) signée", res: "Aucune retouche, écart accepté et tracé sur le MSN", ex: "Semelle 0,05 mm sous le mini, marge démontrée par le Stress Office" },
  { d: "SCRAP", fr: "Rebut", qui: "Qualité / BE selon le cas", doc: "QN soldée rebut, destruction tracée", res: "Pièce détruite, ne revient jamais en production", ex: "Crique traversante sur ferrure titane" },
];

export function QnDecisionMatrix() {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[760px] border-collapse text-[13px]">
        <thead><tr className="bg-panel2 text-left text-muted">{["Décision", "Qui décide", "Document", "Résultat sur la pièce", "Exemple"].map((h) => <th key={h} className="border-b border-line px-3 py-2 font-mono text-[11px] uppercase tracking-wider">{h}</th>)}</tr></thead>
        <tbody>
          {MATRIX.map((m) => (
            <tr key={m.d} className="align-top odd:bg-panel even:bg-bg">
              <td className="border-b border-line px-3 py-2"><div className="font-mono font-semibold text-ink">{m.d}</div><div className="text-[12px] text-muted">{m.fr}</div></td>
              <td className="border-b border-line px-3 py-2 text-ink/90">{m.qui}</td>
              <td className="border-b border-line px-3 py-2 text-ink/90">{m.doc}</td>
              <td className="border-b border-line px-3 py-2 text-ink/90">{m.res}</td>
              <td className="border-b border-line px-3 py-2 text-ink/80">{m.ex}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StandardVsConcession() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-ok/40 bg-ok/5 p-4">
        <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ok">Réparation standard pré-approuvée</div>
        <ul className="list-disc space-y-1 pl-5 text-[13.5px] leading-relaxed text-ink/90">
          <li>Document de réparations standard approuvé par le BE (type SRM de production, abaque de passage en fixation <strong>oversize</strong>).</li>
          <li>Applicable <strong>sans nouvelle approbation</strong> si toutes ses conditions sont remplies : diamètre de reprise, ED ≥ 2D (2,5D en composite) avec le nouveau diamètre, pas, nombre de reprises par zone.</li>
          <li>Le préparateur applique, trace dans la QN et dans la gamme ; la Qualité contrôle.</li>
        </ul>
      </div>
      <div className="rounded-xl border border-amber/50 bg-amber/5 p-4">
        <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-amber">Concession (dérogation)</div>
        <ul className="list-disc space-y-1 pl-5 text-[13.5px] leading-relaxed text-ink/90">
          <li>Écart non couvert, ou une seule condition de la réparation standard non remplie (exemple : ED insuffisante après passage en oversize).</li>
          <li>La QN part au <strong>BE / Stress Office (DOA Part-21J)</strong>, la zone reste bloquée jusqu'à la décision signée.</li>
          <li>La décision (Repair, Use As Is, Scrap) est rattachée au MSN et archivée avec le dossier de l'appareil.</li>
        </ul>
      </div>
    </div>
  );
}

const ctx = "FAL H160, poste jonction";
export const QN_WF_Q = [
  { q: `${ctx}. Un alésage Ø4,8 est hors tolérance. L'abaque oversize approuvé autorise Ø5,6, et l'ED reste ≥ 2D avec ce diamètre. Que fais-tu ?`, options: ["J'applique la réparation standard et je la trace dans la QN", "J'envoie la QN au BE pour une concession avant toute action", "Je passe en Ø5,6 sans QN puisque l'abaque l'autorise", "Je rebute la pièce : un alésage hors tolérance est perdu"], answer: 0, why: "Toutes les conditions de la réparation standard pré-approuvée sont remplies : la production l'applique, mais la QN reste ouverte pour tracer l'écart et la réparation.", hint: "Une réparation pré-approuvée s'applique, mais se trace." },
  { q: `${ctx}. Même cas, mais avec Ø5,6 l'ED tombe à 1,8D. Que fais-tu ?`, options: ["QN au BE (DOA) : une condition de la réparation n'est pas remplie", "J'applique l'abaque : l'écart d'ED de 0,2D reste négligeable", "Je décale le nouveau trou pour retrouver une ED de 2D", "Je pose une fixation Ø4,8 avec une bague de réduction"], answer: 0, why: "Si une seule condition de la réparation standard n'est pas remplie, elle ne s'applique plus : la décision revient au BE sous Part-21J.", hint: "Toutes les conditions, ou aucune." },
  { q: `${ctx}. Sous quel agrément le préparateur méthodes travaille-t-il ?`, options: ["Part-21G (POA), organisme de production", "Part-21J (DOA), organisme de conception", "Part-145, organisme d'entretien agréé", "Part-M, gestion du maintien de navigabilité"], answer: 0, why: "La FAL fabrique sous agrément de production Part-21G. La définition et ses écarts relèvent du DOA Part-21J.", hint: "Production ou conception ?" },
  { q: `${ctx}. Qui peut approuver un USE AS IS sur une semelle 0,05 mm sous le mini ?`, options: ["Le BE (DOA) après démonstration par le calcul", "La Qualité production après contrôle de la pièce", "Le préparateur méthodes responsable de la gamme", "Le chef d'équipe si la chaîne est en retard"], answer: 0, why: "Accepter un écart sans retouche modifie de fait la définition pour ce MSN : c'est une concession signée par le DOA.", hint: "Qui détient l'approbation de conception ?" },
  { q: `${ctx}. Le BE a décidé un REPAIR. Quel est ton travail de préparateur ?`, options: ["Rédiger la gamme QN : opérations, outillages, valeurs, contrôles", "Valider moi-même la réparation une fois les travaux terminés", "Classer la QN : la décision du BE suffit à la solder", "Modifier le plan d'origine pour y intégrer la réparation"], answer: 0, why: "La décision BE devient une instruction exécutable et traçable. La QN n'est soldée qu'une fois l'opération exécutée et contrôlée.", hint: "La décision n'est pas encore une instruction de travail." },
];

export function QnWorkflowAtelier({ onComplete }) {
  return <LockedQuickCheck id="m3-qn-workflow" title="Atelier · Réparation standard ou concession ?" questions={QN_WF_Q} onComplete={onComplete} />;
}
