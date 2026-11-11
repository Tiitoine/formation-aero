/* ============================================================
   M3 · ÉCRAN DE GAMME SAP / MES (ordre de fabrication complet)
   Jonction cadre principal / plancher mécanique H160, op. 0010 à 0090.
   Données de formation : ordre, lots et outillages fictifs.
   ============================================================ */
import React, { useState } from "react";
import { Lock, CheckCircle2, Clock, Users, ShieldAlert, Package, Wrench, FileText, PenLine, Monitor } from "lucide-react";
import { LockedQuickCheck } from "../../lib/pedago.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");

export const OPS = [
  { op: "0010", poste: "P10 · Préassemblage", desc: "Ouverture du poste. Vérifier le kit M-BOM contre l'OF (références, quantités, indices). Poser les protections temporaires (13 unités, compte reporté en op. 0080).", params: "Kit complet = 100 % des articles ; protections : 13 posées", outils: "—", comp: "Kit K10-0050 (Rep 3, Rep 4)", normes: "MES · règles FOD AH", visa: "ok", hp: null },
  { op: "0020", poste: "P10 · Préassemblage", desc: "Frettage de la bague Rep 4 dans la ferrure Rep 3. Immersion LN₂, pose immédiate épaulement en appui, retour à température ambiante avant contrôle.", params: "LN₂ −196 °C · immersion selon EI · attente ≥ retour à l'ambiante", outils: "Dewar LN₂ D-04 · pince cryo · tampon Ø12 H7 T-1187 (valide 03/2027)", comp: "Rep 4 ASN-A 2048-20, lot 24-8812", normes: "EI frettage · plan note 4", visa: "ok", hp: { kind: "HP", t: "Contrôle bague (appui + Ø intérieur) par la Qualité" } },
  { op: "0030", poste: "P20 · Jonction", desc: "Accostage de la cornière Rep 2 sur la ferrure Rep 3. Mesurer le jeu aux cales d'épaisseur en 4 points. Si jeu > 0,05 mm : peler la cale Rep 7 au jeu mesuré.", params: "Jeu relevé : 0,12 / 0,10 / 0,11 / 0,12 mm → calage 0,10 mm", outils: "Jeu de cales JC-22 (valide 11/2026)", comp: "Rep 2 · Rep 7 NF L 23-410-05", normes: "EICM calage · plan note 5", visa: "ok", hp: null },
  { op: "0040", poste: "P20 · Jonction", desc: "Perçage et alésage Ø4,8 de la cornière et de la ferrure à la grille de perçage. Démonter, ébavurer, nettoyer, retoucher la protection (OAC) des alésages selon EI.", params: "Ø4,8 H8 · ébavurage 0,1 × 45° maxi", outils: "Perceuse pneumatique PP-3 · grille GP-0050-2 · tampon Ø4,8 H8 T-0921 (valide 06/2027)", comp: "—", normes: "EICM perçage métal", visa: "cours", hp: null },
  { op: "0050", poste: "P20 · Jonction", desc: "Interposition PR 1776 B2 sur les faces Rep 3 / Rep 7 / Rep 2. Pose humide des Hi-Lok Rep 5 (tête côté cornière), colliers Rep 6 serrés jusqu'à rupture.", params: "Lot, date limite (shelf life) et heure de mélange relevés · pose dans la durée d'application", outils: "Pistolet à cartouche · clé Allen · outil de pose collier HL-4", comp: "Rep 5 ×4 · Rep 6 ×4 · Rep 8 lot 25-0412 (limite 30/04/2027)", normes: "EI montage humide · plan notes 2, 3, 7", visa: "", hp: null },
  { op: "0060", poste: "P30 · Plancher", desc: "Pose du plancher CFRP Rep 1. Perçage composite foret carbure avec martyr et aspiration, fraisage 100° à la cage micrométrique, pose humide des Hi-Lok Rep 5 tête côté plancher.", params: "ED ≥ 12 mm · pas 24 · affleurement 0 / −0,1", outils: "Foret carbure Ø4,8 FC-48 · cage micrométrique CM-100 (valide 01/2027) · aspiration ATEX", comp: "Rep 1 · Rep 5 ×6 · Rep 6 ×6 · Rep 8", normes: "EICM composite · plan note 6", visa: "", hp: { kind: "HP", t: "Contrôle ED, sorties de trou (délaminage) et affleurement" } },
  { op: "0070", poste: "P30 · Plancher", desc: "Contrôle de métallisation entre ferrure Rep 3 et structure de cadre. Mesure 4 fils, valeur reportée dans le MES.", params: "R < 2,5 mΩ", outils: "Micro-ohmmètre 4 fils MO-07 (valide 09/2027)", comp: "—", normes: "EI métallisation", visa: "", hp: { kind: "HP", t: "Valeur mesurée validée par la Qualité" } },
  { op: "0080", poste: "P30 · Plancher", desc: "Inspection FOD de la zone, retrait et comptage des protections temporaires, nettoyage. Fermeture interdite si le compte n'est pas juste.", params: "Protections retirées = 13 / 13", outils: "Lampe d'inspection · miroir", comp: "—", normes: "Règles FOD AH", visa: "", hp: { kind: "HP", t: "Fermeture de zone autorisée par la Qualité" } },
  { op: "0090", poste: "P30 · Plancher", desc: "Pose de la servocommande sur la bague Rep 4 : axe, rondelles, écrou à créneaux au couple, goupille neuve. Vérification du sens de débattement.", params: "Couple selon EI · goupille neuve · débattement libre", outils: "Clé dynamométrique 5-25 N·m CD-112 (valide 02/2027)", comp: "Kit K30-0067 (axe, écrou, goupille)", normes: "ATA 67 · EI freinage", visa: "", hp: { kind: "DI", t: "Double contrôle indépendant ATA 67 : second contrôleur habilité" } },
];

const COLS = ["N° Op", "Poste FAL", "Description détaillée & paramètres", "Outillages & étalonnage", "Composants M-BOM & consommables (lot / shelf life)", "Normes EI / ATA", "Visa opérateur", "Point d'arrêt / double contrôle"];

function VisaCell({ v, blocked }) {
  if (v === "ok") return <span className="inline-flex items-center gap-1 text-[#1d7a4a]"><CheckCircle2 size={14} />Signé</span>;
  if (v === "cours") return <span className="inline-flex items-center gap-1 text-[#b26a00]"><Clock size={14} />En cours</span>;
  if (blocked) return <span className="inline-flex items-center gap-1 text-[#8a96a8]"><Lock size={13} />Bloqué</span>;
  return <span className="inline-flex items-center gap-1 text-[#5a6678]"><PenLine size={13} />À signer</span>;
}

export function GammeMESScreen() {
  const [sel, setSel] = useState("0040");
  const cur = OPS.find((o) => o.op === sel);
  /* une opération après un point d'arrêt non levé est bloquée dans le MES */
  const firstOpen = OPS.findIndex((o) => o.visa !== "ok");
  return (
    <div className="overflow-hidden rounded-xl border border-[#9fb0c8] bg-[#eef2f7] text-[#1b2533] shadow-lg">
      {/* barre de titre façon SAP GUI */}
      <div className="flex flex-wrap items-center gap-2 bg-gradient-to-b from-[#3c5a80] to-[#2b4466] px-3 py-1.5 text-white">
        <Monitor size={15} />
        <span className="text-[12.5px] font-semibold">SAP · MES Atelier · Afficher ordre de fabrication : opérations</span>
        <span className="ml-auto font-mono text-[11px] opacity-80">Transaction CO03 · FAL H160 · Poste P20</span>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-[#b9c6d8] bg-[#dfe6ef] px-3 py-1 text-[11.5px]">
        {["Ordre", "Traiter", "Saut", "Détails", "Environnement", "Système", "Aide"].map((m) => <span key={m} className="rounded px-2 py-0.5 hover:bg-white/60">{m}</span>)}
      </div>
      {/* en-tête d'OF */}
      <div className="grid gap-x-6 gap-y-1 border-b border-[#b9c6d8] bg-white px-4 py-2.5 text-[12px] sm:grid-cols-2 lg:grid-cols-4">
        {[["Ordre (OF)", "1004587"], ["Article", "365A21-0050-01 ind. C"], ["Désignation", "Jonction cadre / plancher méca."], ["MSN · Effectivité", "MSN 1462 · ind. C applicable"], ["Gamme", "G-365A21-0050 version 04"], ["Quantité", "1 EA"], ["Statut système", "LANC · CONF.PART"], ["Agrément", "EASA Part-21G (POA)"]].map(([k, v]) => (
          <div key={k} className="flex gap-2"><span className="w-32 shrink-0 text-[#5a6678]">{k}</span><span className="font-mono font-semibold">{v}</span></div>
        ))}
      </div>
      {/* table des opérations */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-[11.5px]">
          <thead>
            <tr className="bg-[#cfdbe9] text-left">
              {COLS.map((c) => <th key={c} className="border border-[#b9c6d8] px-2 py-1.5 align-bottom font-semibold">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {OPS.map((o, i) => {
              const blocked = i > firstOpen;
              return (
                <tr key={o.op} onClick={() => setSel(o.op)} className={cx("cursor-pointer align-top", sel === o.op ? "bg-[#ffe9a8]" : i % 2 ? "bg-[#f6f8fb]" : "bg-white", "hover:bg-[#fff3cc]")}>
                  <td className="border border-[#d2dbe7] px-2 py-1.5 font-mono font-semibold">{o.op}</td>
                  <td className="border border-[#d2dbe7] px-2 py-1.5 whitespace-nowrap">{o.poste}</td>
                  <td className="border border-[#d2dbe7] px-2 py-1.5"><div>{o.desc}</div><div className="mt-1 font-mono text-[11px] text-[#2b4466]">▸ {o.params}</div></td>
                  <td className="border border-[#d2dbe7] px-2 py-1.5">{o.outils}</td>
                  <td className="border border-[#d2dbe7] px-2 py-1.5">{o.comp}</td>
                  <td className="border border-[#d2dbe7] px-2 py-1.5">{o.normes}</td>
                  <td className="border border-[#d2dbe7] px-2 py-1.5 whitespace-nowrap"><VisaCell v={o.visa} blocked={blocked} /></td>
                  <td className="border border-[#d2dbe7] px-2 py-1.5">
                    {o.hp ? (
                      <span className={cx("inline-flex items-start gap-1 rounded px-1.5 py-0.5 font-semibold", o.hp.kind === "DI" ? "bg-[#fde2e2] text-[#a12a2a]" : "bg-[#fff0d6] text-[#94570a]")}>
                        {o.hp.kind === "DI" ? <Users size={13} className="mt-0.5 shrink-0" /> : <ShieldAlert size={13} className="mt-0.5 shrink-0" />}
                        <span>{o.hp.kind === "DI" ? "Double contrôle" : "Hold Point"} : {o.hp.t}</span>
                      </span>
                    ) : <span className="text-[#8a96a8]">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* détail de l'opération sélectionnée */}
      <div className="grid gap-3 border-t border-[#b9c6d8] bg-white px-4 py-3 text-[12.5px] md:grid-cols-3">
        <div><div className="mb-1 flex items-center gap-1 font-semibold text-[#2b4466]"><FileText size={13} />Op. {cur.op} · {cur.poste}</div><p>{cur.desc}</p></div>
        <div><div className="mb-1 flex items-center gap-1 font-semibold text-[#2b4466]"><Wrench size={13} />Outillages (étalonnage vérifié au poste)</div><p>{cur.outils}</p></div>
        <div><div className="mb-1 flex items-center gap-1 font-semibold text-[#2b4466]"><Package size={13} />Composants et consommables tracés</div><p>{cur.comp}</p></div>
      </div>
      <div className="border-t border-[#b9c6d8] bg-[#dfe6ef] px-3 py-1 font-mono text-[11px] text-[#5a6678]">Les opérations suivant une opération non signée ou un Hold Point non levé sont bloquées par le MES.</div>
    </div>
  );
}

const ctx = "OF 1004587, gamme G-365A21-0050 (jonction cadre / plancher H160)";
export const GAMME_Q = [
  { q: `${ctx}, op. 0050. Avant d'appliquer le PR 1776 B2, quelles données l'opérateur doit-il saisir dans le MES ?`, options: ["Lot, date limite (shelf life) et heure de mélange", "Couleur du mastic et nom du fournisseur agréé", "Température de l'atelier et humidité relative", "Référence du pistolet et numéro de poste de travail"], answer: 0, why: "Le lot assure la traçabilité, la date limite garantit la polymérisation, l'heure de mélange permet de tenir la durée d'application.", hint: "Le mastic vieillit en stock et après mélange." },
  { q: `${ctx}, op. 0020. À quel moment le contrôle de la bague frettée est-il réalisé ?`, options: ["Après retour à température ambiante", "Immédiatement à la sortie du LN₂", "Pendant l'immersion dans le dewar", "Avant le frettage, sur la bague seule"], answer: 0, why: "Contrôler à froid fausse les cotes : la bague et la ferrure doivent être revenues à l'ambiante.", hint: "Une pièce froide n'a pas ses cotes définitives." },
  { q: `${ctx}, op. 0040. Le tampon T-0921 affiche une validité d'étalonnage dépassée. Que fait l'opérateur ?`, options: ["Il n'utilise pas l'outil, le signale et en prend un valide", "Il l'utilise : un tampon lisse ne se dérègle pas", "Il l'utilise et note le dépassement dans le MES", "Il demande au chef d'équipe de prolonger la date"], answer: 0, why: "Un moyen de contrôle hors validité ne prouve rien. L'outil est isolé, les contrôles déjà faits avec lui sont réévalués par la Qualité.", hint: "Que vaut une mesure faite avec un moyen non étalonné ?" },
  { q: `${ctx}, op. 0030. Le jeu relevé est de 0,12 mm. Qu'impose l'opération ?`, options: ["Peler la cale Rep 7 au jeu mesuré et la poser", "Serrer les Hi-Lok pour refermer le jeu mesuré", "Augmenter l'épaisseur du cordon de mastic", "Ouvrir une QN : tout jeu est hors tolérance"], answer: 0, why: "L'opération et la note 5 du plan prévoient le calage pelable au-delà de 0,05 mm. Ce cas est couvert par la définition : pas de QN.", hint: "Le plan prévoit déjà ce cas." },
  { q: `${ctx}, op. 0060 en Hold Point. Le contrôleur Qualité n'est pas encore passé. L'opérateur peut-il lancer l'op. 0070 ?`, options: ["Non : le MES bloque la suite jusqu'au visa Qualité", "Oui : le visa Qualité peut être apposé plus tard", "Oui : s'il note l'attente du contrôleur dans le MES", "Oui : si le chef d'équipe signe à la place du contrôleur"], answer: 0, why: "Le Hold Point bloque informatiquement la gamme. Seul le visa du contrôleur habilité lève le point d'arrêt.", hint: "Que signifie Hold Point ?" },
  { q: `${ctx}, op. 0090 (ATA 67). Qui signe le double contrôle indépendant ?`, options: ["Un second contrôleur habilité qui n'a pas fait le montage", "Le compagnon qui a monté, après une seconde vérification", "Le chef d'équipe du poste, sur la base de la gamme signée", "Le préparateur méthodes qui a rédigé l'opération 0090"], answer: 0, why: "Le double contrôle des commandes de vol est réalisé et signé séparément par une personne habilitée, indépendante du montage.", hint: "Indépendant de qui ?" },
];

export function GammeMESAtelier({ onComplete }) {
  return <LockedQuickCheck id="m3-gamme-mes" title="Atelier · Exécuter et tracer la gamme dans le MES" questions={GAMME_Q} onComplete={onComplete} />;
}
