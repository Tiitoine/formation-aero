import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ShieldCheck, ShieldAlert, Users, LayoutGrid, ClipboardCheck, FileText, Search, Plus, Pencil,
  Trash2, Download, Upload, FileSpreadsheet, ExternalLink, X, CheckCircle2, XCircle, RotateCcw,
  Wand2, Flag, AlertTriangle, BookOpen, Wrench, Layers, Ruler, Plane, Target, ChevronRight,
  Copy, Award, Info, CircleDashed, Database,
} from "lucide-react";

/* ============================================================
   CONSTANTES — RÈGLE UNIQUE : SEUIL 85 %
   ============================================================ */
const DB_KEY = "ah_lms_db_85_v1";
const SEUIL = 85;
const V = "VALIDE";
const R = "À REVOIR";
const N = "Non évalué";

const MODULES = [
  {
    id: "mod1", code: "M1", icon: Plane,
    titre: "Fondamentaux Hélicoptère, Zonage, ATA (62-67) & Normes BNAE / ECS",
    resume: "Architecture H125 → H175, zonage et stations, chapitres ATA 62 à 67, normes BNAE, ECS, ASN et EI/EICM.",
    url: "https://claude.ai/artifact/Kt83NBcg6SqAYxSJfbPE2e",
  },
  {
    id: "mod2", code: "M2", icon: Wrench,
    titre: "Procédés d'Assemblage, Fixations (Hi-Lok), PR, Freinage & Métallisation",
    resume: "Assemblage alu / carbone, pose Hi-Lok, mastics PR classe B, couples, freinage au fil et métallisation.",
    url: "https://claude.ai/artifact/ND5spg1dpfn9VezcV6Tdb8",
  },
  {
    id: "mod3", code: "M3", icon: Layers,
    titre: "Du BE à la FAL (E-BOM/M-BOM), Gammes SAP/MES & Litiges (QN / Dérogations Part-21G)",
    resume: "Dossier de définition, passage E-BOM → M-BOM, gammes SAP/MES, hold points, FOD, QN et dérogations.",
    url: "https://claude.ai/artifact/4QvaG8UjGGnzWB9y8BpZmc",
  },
  {
    id: "mod4a", code: "M4A", icon: Ruler,
    titre: "Lecture de Plans Avancée, Ajustements ISO (Azote LN2), ISO GPS & Calcul de Calage",
    resume: "Cotation ISO 286, frettage à l'azote liquide, ISO GPS, isostatisme 3-2-1, chaînes de cotes et cale pelable.",
    url: "https://claude.ai/artifact/8s22YCyPk62kt8zon2FhbB",
  },
  {
    id: "mod4b", code: "M4B", icon: Target,
    titre: "Grand Simulateur Final — Mission Industrialisation H160 de A à Z",
    resume: "Étude de cas H160 en 5 missions : définition, M-BOM, gamme, litiges et calage jusqu'à l'habilitation.",
    url: "https://claude.ai/artifact/6Miry1GjRqsyogmPsq1VJq",
  },
];
const MOD = Object.fromEntries(MODULES.map((m) => [m.id, m]));

const DOMAINES = [
  {
    id: "A", titre: "Culture Hélicoptère, Zonage & Normes", detail: "ATA 62-67, BNAE NF L / RG.Aéro, ECS / EICM",
    comps: [
      { id: "A1", label: "Situer une zone, une station et un accès sur la cellule hélicoptère", mods: ["mod1"] },
      { id: "A2", label: "Rattacher un ensemble au bon chapitre ATA (62 à 67)", mods: ["mod1"] },
      { id: "A3", label: "Appliquer les normes BNAE (NF L, EN, RG.Aéro) citées au plan", mods: ["mod1", "mod3"] },
      { id: "A4", label: "Exploiter les standards internes ECS, ASN et EI / EICM", mods: ["mod1", "mod2"] },
    ],
  },
  {
    id: "B", titre: "Procédés d'Assemblage", detail: "Alu / Carbone, Hi-Lok, PR B1/2 vs B2, Couple, Freinage, Métallisation",
    comps: [
      { id: "B1", label: "Choisir le procédé d'assemblage adapté (alu, carbone, mixte)", mods: ["mod2"] },
      { id: "B2", label: "Spécifier la pose et le contrôle d'une fixation Hi-Lok", mods: ["mod2"] },
      { id: "B3", label: "Prescrire le mastic PR (B1/2 ou B2), l'interposition et l'anticorrosion", mods: ["mod2"] },
      { id: "B4", label: "Garantir couple de serrage, freinage et métallisation", mods: ["mod2", "mod4b"], critique: true },
    ],
  },
  {
    id: "C", titre: "Industrialisation & Litiges", detail: "Gammes SAP/MES, Hold Points, FOD, QN / Part-21G",
    comps: [
      { id: "C1", label: "Transformer une E-BOM en M-BOM structurée par poste FAL", mods: ["mod3"] },
      { id: "C2", label: "Rédiger une gamme SAP/MES avec ses hold points", mods: ["mod3", "mod4b"] },
      { id: "C3", label: "Intégrer la prévention FOD dans la séquence d'assemblage", mods: ["mod3", "mod4b"], critique: true },
      { id: "C4", label: "Traiter un litige : QN, dérogation, cadre Part-21 sous-partie G", mods: ["mod3"] },
    ],
  },
  {
    id: "D", titre: "Lecture de Plans & Géométrie", detail: "Ajustements ISO (Azote LN2), ISO GPS, Isostatisme 3-2-1, Calage pelable",
    comps: [
      { id: "D1", label: "Lire un plan d'ensemble et une chaîne de cotes", mods: ["mod4a"] },
      { id: "D2", label: "Interpréter un ajustement ISO 286 et prescrire un montage à l'azote LN2", mods: ["mod4a"] },
      { id: "D3", label: "Exploiter les spécifications ISO GPS et l'isostatisme 3-2-1", mods: ["mod4a"] },
      { id: "D4", label: "Calculer et prescrire un calage pelable", mods: ["mod4a", "mod4b"] },
    ],
  },
  {
    id: "E", titre: "Sécurité des Vols & Étude de cas H160", detail: "Rigueur, traçabilité, mission d'industrialisation complète",
    comps: [
      { id: "E1", label: "Appliquer les exigences sécurité des vols (pièces critiques, commandes ATA 67)", mods: ["mod4b", "mod2"], critique: true },
      { id: "E2", label: "Assurer traçabilité, autocontrôle et inspection indépendante", mods: ["mod3", "mod4b"], critique: true },
      { id: "E3", label: "Industrialiser un ensemble H160 de la définition à la gamme", mods: ["mod4b"] },
      { id: "E4", label: "Communiquer un écart au BE, à la Qualité et à la FAL", mods: ["mod3", "mod4b"] },
    ],
  },
];
const ALL_COMPS = DOMAINES.flatMap((d) => d.comps.map((c) => ({ ...c, domaine: d.id })));

/* ============================================================
   MINI-TESTS DE CONTRÔLE (7 questions : 6/7 = 85,7 % → VALIDE)
   ============================================================ */
const MINI_TESTS = {
  mod1: [
    { q: "Sur un hélicoptère, quel chapitre ATA couvre les commandes de vol des rotors ?", o: ["ATA 27", "ATA 67", "ATA 62", "ATA 76"], a: 1 },
    { q: "Le chapitre ATA 63 regroupe…", o: ["Les pales du rotor principal", "La transmission du rotor principal (BTP)", "Le rotor anticouple", "Les commandes moteur"], a: 1 },
    { q: "Pourquoi applique-t-on des mastics d'interposition sur une cellule d'hélicoptère ?", o: ["Pour tenir la pressurisation cabine", "Contre les intempéries, les fluides et la corrosion galvanique", "Uniquement pour l'esthétique", "Pour remplacer les fixations"], a: 1 },
    { q: "Qui édite les normes NF L et les recommandations RG.Aéro ?", o: ["L'EASA", "Le BNAE", "La DGAC", "L'AFNOR seule, sans le secteur"], a: 1 },
    { q: "Chez Airbus Helicopters, une pièce standard (vis, écrou, rondelle) est référencée en…", o: ["ASN", "EICM", "ECS", "M-BOM"], a: 0 },
    { q: "Un standard interne qui décrit un procédé (application de mastic, collage) est de type…", o: ["ASN", "EI / EICM", "ATA", "QN"], a: 1 },
    { q: "Le zonage de l'hélicoptère sert d'abord au préparateur à…", o: ["Calculer la masse de l'appareil", "Localiser précisément l'opération et son accès dans la gamme", "Choisir la peinture", "Définir le prix de vente"], a: 1 },
  ],
  mod2: [
    { q: "Une fixation Hi-Lok est correctement posée quand…", o: ["La tige dépasse de 5 mm", "La partie hexagonale du collet a cassé au couple prévu", "Le collet est serré à la main", "Un point de peinture est apposé"], a: 1 },
    { q: "Dans la désignation d'un mastic PR classe B (B1/2, B2), le chiffre indique…", o: ["La couleur", "Le temps d'application en heures", "Le nombre de couches", "La température de service"], a: 1 },
    { q: "Principal risque d'un assemblage direct carbone / aluminium ?", o: ["Le délaminage thermique", "La corrosion galvanique de l'aluminium", "Le bruit en vol", "Aucun risque"], a: 1 },
    { q: "Un fil à freiner doit être posé de façon à…", o: ["Tirer dans le sens du serrage", "Tirer dans le sens du desserrage", "Être le plus long possible", "Rester détendu"], a: 0 },
    { q: "Comment vérifie-t-on une métallisation ?", o: ["À l'œil", "Par mesure d'une résistance électrique très faible (milliohms)", "Au couple", "Par ressuage"], a: 1 },
    { q: "Sauf indication contraire du plan, le couple se prend de préférence…", o: ["Sur la tête de vis", "Sur l'écrou", "Indifféremment", "Avec une clé à chocs"], a: 1 },
    { q: "Au perçage d'un stratifié carbone, la précaution clé est…", o: ["Percer à grande avance", "Un foret adapté et un appui en sortie contre le délaminage", "Lubrifier à l'huile de coupe", "Percer sans gabarit"], a: 1 },
  ],
  mod3: [
    { q: "La M-BOM se distingue de l'E-BOM car elle est structurée…", o: ["Par fournisseur", "Selon la séquence de fabrication et les postes FAL", "Par ordre alphabétique", "Selon le prix des pièces"], a: 1 },
    { q: "Un hold point dans une gamme MES est…", o: ["Une pause café", "Une opération bloquante qui exige un visa avant de poursuivre", "Un point de graissage", "Un repère de zonage"], a: 1 },
    { q: "Une QN (Quality Notification) sert à…", o: ["Commander des pièces", "Déclarer et tracer une non-conformité", "Planifier la FAL", "Valider une paie"], a: 1 },
    { q: "La Part-21 sous-partie G concerne…", o: ["L'agrément de l'organisme de production (POA)", "La maintenance en ligne", "Le transport des pièces", "La formation des pilotes"], a: 0 },
    { q: "Qui peut accepter une pièce hors définition par dérogation ?", o: ["L'opérateur seul", "Le préparateur", "L'autorité de conception (BE) via le circuit de dérogation", "Le magasin"], a: 2 },
    { q: "La prévention FOD consiste notamment à…", o: ["Peindre les outils", "Contrôler l'outillage et la propreté avant fermeture de zone", "Accélérer la cadence", "Supprimer les contrôles"], a: 1 },
    { q: "Le préparateur constate une incohérence sur le plan. Il…", o: ["Corrige le plan lui-même", "Ouvre un écart vers le BE sans modifier la définition", "Ignore l'écart", "Demande à l'opérateur d'improviser"], a: 1 },
  ],
  mod4a: [
    { q: "Un ajustement Ø20 H7/g6 est…", o: ["Serré", "Avec jeu, en système alésage normal", "Incertain", "Hors norme ISO"], a: 1 },
    { q: "Pour un montage serré à l'azote liquide (LN2), on refroidit…", o: ["L'alésage", "La pièce mâle pour la contracter", "Les deux pièces à 200 °C", "Rien, on force à la presse"], a: 1 },
    { q: "L'isostatisme 3-2-1 supprime combien de degrés de liberté ?", o: ["3", "5", "6", "9"], a: 2 },
    { q: "Une tolérance de planéité nécessite-t-elle une référence ?", o: ["Oui, toujours A", "Non, c'est une tolérance de forme", "Oui, A et B", "Seulement en ISO 286"], a: 1 },
    { q: "Avec une cale pelable, l'épaisseur finale est obtenue…", o: ["Au hasard", "En mesurant le jeu réel puis en pelant jusqu'à la cote calculée", "En empilant des rondelles", "En limant la pièce"], a: 1 },
    { q: "Le principe d'indépendance (ISO 8015) signifie que…", o: ["Chaque exigence s'applique seule, sauf modificateur comme Ⓔ", "Les cotes sont facultatives", "La forme dépend toujours de la taille", "Seule la cote nominale compte"], a: 0 },
    { q: "Un cadre de position ⌖ suivi de A | B | C se rapporte…", o: ["Au système de références A, B, C dans cet ordre", "À trois tolérances différentes", "Aux trois vues du plan", "À une rugosité"], a: 0 },
  ],
  mod4b: [
    { q: "Premier réflexe à la réception du dossier de définition du H160 ?", o: ["Lancer la gamme", "Vérifier l'indice et l'applicabilité au MSN", "Commander l'outillage", "Appeler le client"], a: 1 },
    { q: "Une distance au bord (Edge Distance) est dépassée après perçage. Vous…", o: ["Rebouchez au mastic", "Arrêtez, ouvrez une QN et attendez la disposition BE", "Posez une fixation plus grosse sans rien dire", "Continuez"], a: 1 },
    { q: "Avant la fermeture d'une zone (capotage), la gamme doit prévoir…", o: ["Rien de particulier", "Une inspection FOD avec visa de hold point", "Une peinture", "Un essai en vol"], a: 1 },
    { q: "Un freinage oublié sur une commande de vol rotor est…", o: ["Un défaut mineur", "Un drapeau rouge sécurité des vols, bloquant pour l'habilitation", "Acceptable si le couple est bon", "À traiter au prochain lot"], a: 1 },
    { q: "Industrialiser un ensemble, c'est définir…", o: ["Uniquement les temps", "Séquence, moyens, temps et contrôles dans la gamme", "Le design de la pièce", "Le prix de vente"], a: 1 },
    { q: "Sur une fixation critique de commande ATA 67, on exige…", o: ["Une inspection indépendante (double visa)", "Une simple photo", "Aucun contrôle", "Un contrôle au prochain lot"], a: 0 },
    { q: "Ordre logique d'une mission d'industrialisation…", o: ["Gamme → définition → M-BOM", "Analyse définition → M-BOM → gamme → premier article", "M-BOM → livraison → définition", "Premier article → définition"], a: 1 },
  ],
};

/* ============================================================
   CALCULS
   ============================================================ */
const cx = (...c) => c.filter(Boolean).join(" ");
const isNum = (x) => typeof x === "number" && Number.isFinite(x);
const clamp = (x) => Math.max(0, Math.min(100, x));
const statutDe = (s) => (!isNum(s) ? N : s >= SEUIL ? V : R);
const mean = (arr) => { const v = arr.filter(isNum); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
/* Affichage tronqué à 0,1 : 84,96 s'affiche 84,9 et non 85 */
const pct = (x) => (isNum(x) ? (Math.floor(x * 10) / 10).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %" : "—");
const today = () => new Date().toISOString().slice(0, 10);
const frDate = (d) => { if (!d) return "—"; const t = new Date(d + "T12:00:00"); return isNaN(t) ? d : t.toLocaleDateString("fr-FR"); };
const uid = () => "stg_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

const binEntry = (v) => ({ mode: "bin", score: v === V ? 100 : 0, statut: v });
const pctEntry = (x, auto = false) => ({ mode: "pct", score: clamp(Math.round(x * 10) / 10), statut: statutDe(x), auto });
const autoScore = (comp, modules) => { const m = mean(comp.mods.map((id) => modules?.[id]?.score)); return m; };

function calcGrille(grille) {
  const domaines = DOMAINES.map((d) => {
    const items = d.comps.map((c) => ({ ...c, entry: grille?.[c.id] || null, score: isNum(grille?.[c.id]?.score) ? grille[c.id].score : null }));
    const evalues = items.filter((i) => isNum(i.score));
    const score = mean(evalues.map((i) => i.score));
    return {
      ...d, items, score, statut: statutDe(score), nbEval: evalues.length,
      aRetravailler: items.filter((i) => isNum(i.score) && i.score < SEUIL),
      nonEvalues: items.filter((i) => !isNum(i.score)),
    };
  });
  const scores = ALL_COMPS.map((c) => (isNum(grille?.[c.id]?.score) ? grille[c.id].score : null));
  const nbEval = scores.filter(isNum).length;
  const global = mean(scores);
  const critiquesKO = ALL_COMPS.filter((c) => c.critique && isNum(grille?.[c.id]?.score) && grille[c.id].score < SEUIL);
  return { domaines, global, statut: statutDe(global), nbEval, complete: nbEval === ALL_COMPS.length, critiquesKO };
}

function calcStagiaire(s) {
  const mods = MODULES.map((m) => {
    const e = s.modules?.[m.id] || {};
    return { ...m, score: isNum(e.score) ? e.score : null, statut: statutDe(e.score), tentatives: e.tentatives || 0, datePassage: e.datePassage || "" };
  });
  const moyenne = mean(mods.map((m) => m.score));
  const grille = calcGrille(s.grilleCompetences);
  const modulesOK = mods.every((m) => m.statut === V);
  const drapeau = !!s.drapeauSecurite?.actif || grille.critiquesKO.length > 0;
  const raisons = [];
  mods.forEach((m) => {
    if (m.statut === N) raisons.push(`${m.code} non évalué`);
    else if (m.statut === R) raisons.push(`${m.code} à ${pct(m.score)} (< 85 %)`);
  });
  if (!grille.complete) raisons.push(`Grille incomplète (${grille.nbEval}/20 compétences évaluées)`);
  else if (grille.global < SEUIL) raisons.push(`Grille globale à ${pct(grille.global)} (< 85 %)`);
  if (s.drapeauSecurite?.actif) raisons.push(`Drapeau rouge sécurité : ${s.drapeauSecurite.motif || "motif non renseigné"}`);
  grille.critiquesKO.forEach((c) => raisons.push(`Compétence critique ${c.id} à revoir (drapeau rouge automatique)`));
  const valide = modulesOK && grille.complete && grille.global >= SEUIL && !drapeau;
  return { mods, moyenne, grille, modulesOK, drapeau, raisons, statutGlobal: valide ? V : R };
}

/* Recalcule et fige les champs dérivés stockés dans la BDD */
function normaliser(s) {
  const modules = {};
  MODULES.forEach((m) => {
    const e = s.modules?.[m.id] || {};
    const score = isNum(e.score) ? clamp(e.score) : null;
    modules[m.id] = { score, statut: statutDe(score), tentatives: Number(e.tentatives) || (isNum(score) ? 1 : 0), datePassage: e.datePassage || "" };
  });
  const grilleCompetences = {};
  ALL_COMPS.forEach((c) => {
    const e = s.grilleCompetences?.[c.id];
    if (!e) { grilleCompetences[c.id] = null; return; }
    if (e.mode === "bin" || e.valeur) grilleCompetences[c.id] = binEntry(e.statut === V || e.valeur === V ? V : R);
    else if (isNum(e.score)) grilleCompetences[c.id] = pctEntry(e.score, !!e.auto);
    else grilleCompetences[c.id] = null;
  });
  const base = {
    id: s.id || uid(), nom: String(s.nom || "").trim(), prenom: String(s.prenom || "").trim(),
    matricule: String(s.matricule || "").trim(), entreprise: String(s.entreprise || "").trim(),
    session: String(s.session || "").trim(), dateEntree: s.dateEntree || "",
    modules, grilleCompetences,
    commentaireFormateur: s.commentaireFormateur || "", pointsARevoir: s.pointsARevoir || "",
    drapeauSecurite: { actif: !!s.drapeauSecurite?.actif, motif: s.drapeauSecurite?.motif || "" },
  };
  const r = calcStagiaire(base);
  return { ...base, moyenneModules: r.moyenne === null ? null : Math.round(r.moyenne * 10) / 10, scoreGrille: r.grille.global === null ? null : Math.round(r.grille.global * 10) / 10, statutGlobal: r.statutGlobal };
}

/* ============================================================
   DONNÉES DE DÉMONSTRATION (4 stagiaires fictifs)
   ============================================================ */
const g = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "number" ? pctEntry(v) : v === null ? null : binEntry(v)]));
const toutValide = Object.fromEntries(ALL_COMPS.map((c) => [c.id, V]));
const DEMO = [
  {
    id: "demo_1", prenom: "Camille", nom: "Bertrand", matricule: "AH-2026-041", entreprise: "Airbus Helicopters Marignane",
    session: "Promo FAL H160", dateEntree: "2026-09-07",
    modules: {
      mod1: { score: 94, tentatives: 1, datePassage: "2026-09-18" }, mod2: { score: 91, tentatives: 1, datePassage: "2026-09-29" },
      mod3: { score: 88, tentatives: 2, datePassage: "2026-10-09" }, mod4a: { score: 90, tentatives: 1, datePassage: "2026-10-21" },
      mod4b: { score: 93, tentatives: 1, datePassage: "2026-11-04" },
    },
    grilleCompetences: g({ ...toutValide, D2: 88, D4: 90, E3: 92 }),
    commentaireFormateur: "Très bonne rigueur documentaire. Gammes H160 claires, hold points bien placés. Prête pour une prise de poste en préparation FAL.",
    pointsARevoir: "",
  },
  {
    id: "demo_2", prenom: "Yanis", nom: "Ferhat", matricule: "AH-2026-042", entreprise: "Sous-traitant aérostructures — Vitrolles",
    session: "Promo FAL H160", dateEntree: "2026-09-07",
    modules: {
      mod1: { score: 91, tentatives: 1, datePassage: "2026-09-18" }, mod2: { score: 72, tentatives: 2, datePassage: "2026-10-01" },
      mod3: { score: 86, tentatives: 1, datePassage: "2026-10-09" }, mod4a: { score: 80, tentatives: 1, datePassage: "2026-10-21" },
      mod4b: { score: 85, tentatives: 1, datePassage: "2026-11-04" },
    },
    grilleCompetences: g({
      A1: V, A2: V, A3: V, A4: 86, B1: V, B2: R, B3: 70, B4: V, C1: V, C2: V, C3: V, C4: 88,
      D1: V, D2: R, D3: 82, D4: 78, E1: V, E2: V, E3: 85, E4: V,
    }),
    commentaireFormateur: "Bonne culture hélicoptère. Les procédés de fixation et les ajustements ISO ne sont pas encore maîtrisés.",
    pointsARevoir: "Repasser M2 (pose Hi-Lok, choix PR B1/2 / B2) et M4A (ajustements serrés, calage pelable).",
  },
  {
    id: "demo_3", prenom: "Léa", nom: "Moreau", matricule: "AH-2026-043", entreprise: "Airbus Helicopters Marignane",
    session: "Promo FAL H145", dateEntree: "2026-09-14",
    modules: {
      mod1: { score: 89, tentatives: 1, datePassage: "2026-09-25" }, mod2: { score: 87, tentatives: 1, datePassage: "2026-10-06" },
      mod3: { score: 92, tentatives: 1, datePassage: "2026-10-16" }, mod4a: { score: 86, tentatives: 2, datePassage: "2026-10-28" },
      mod4b: { score: 88, tentatives: 1, datePassage: "2026-11-06" },
    },
    grilleCompetences: g({ ...toutValide, D3: 90, E2: R }),
    commentaireFormateur: "Scores modules tous validés. Lors de l'étude de cas, oubli du double visa sur une fixation de commande rotor : point bloquant sécurité.",
    pointsARevoir: "Reprendre la traçabilité et l'inspection indépendante (E2) en situation, puis réévaluer.",
  },
  {
    id: "demo_4", prenom: "Hugo", nom: "Lambert", matricule: "AH-2026-044", entreprise: "Alternance — Airbus Helicopters Marignane",
    session: "Promo FAL H145", dateEntree: "2026-10-05",
    modules: {
      mod1: { score: 84, tentatives: 1, datePassage: "2026-10-16" }, mod2: { score: 89, tentatives: 1, datePassage: "2026-10-28" },
      mod3: { score: null }, mod4a: { score: null }, mod4b: { score: null },
    },
    grilleCompetences: g({ A1: V, A2: 84, A3: R, A4: V, B1: V, B2: V, B3: 88, B4: V }),
    commentaireFormateur: "Démarrage récent. M1 manqué de peu : normes BNAE à consolider.",
    pointsARevoir: "Repasser M1 (normes BNAE / RG.Aéro), puis enchaîner M3.",
  },
].map(normaliser);

const freshDB = () => ({ version: 1, cle: DB_KEY, seuil: SEUIL, updatedAt: new Date().toISOString(), activeId: DEMO[0].id, stagiaires: DEMO.map((s) => ({ ...s })) });

function loadDB() {
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && Array.isArray(p.stagiaires)) return { ...p, stagiaires: p.stagiaires.map(normaliser) };
    }
  } catch (e) { /* stockage indisponible */ }
  return freshDB();
}
function saveDB(db) {
  try { window.localStorage.setItem(DB_KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
}

/* ============================================================
   TÉLÉCHARGEMENTS (capability downloads, repli : copier le texte)
   ============================================================ */
let dlPromise = null;
const getDownloads = () => {
  if (!dlPromise) dlPromise = (window.claude && typeof window.claude.use === "function") ? window.claude.use("downloads").catch(() => null) : Promise.resolve(null);
  return dlPromise;
};

/* ============================================================
   BRIQUES D'INTERFACE
   ============================================================ */
function Panel({ children, className = "" }) {
  return <div className={cx("rounded-xl border border-line bg-panel", className)}>{children}</div>;
}
function Eyebrow({ children, className = "" }) {
  return <div className={cx("font-mono text-[11px] uppercase tracking-[0.14em] text-sky", className)}>{children}</div>;
}
function StatusBadge({ statut, size = "md", habilite = false }) {
  const sz = size === "lg" ? "px-3 py-1.5 text-[13px]" : size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]";
  if (statut === V)
    return <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-ok/60 bg-ok/15 font-mono font-semibold uppercase tracking-wider text-ok", sz)}><CheckCircle2 size={size === "sm" ? 11 : 14} />{habilite ? "VALIDE (HABILITÉ)" : "VALIDE"}</span>;
  if (statut === R)
    return <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-ko/60 bg-ko/15 font-mono font-semibold uppercase tracking-wider text-ko", sz)}><XCircle size={size === "sm" ? 11 : 14} />À REVOIR</span>;
  return <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-line bg-panel2 font-mono uppercase tracking-wider text-muted", sz)}><CircleDashed size={size === "sm" ? 11 : 14} />Non évalué</span>;
}
function ThresholdBar({ score, height = "h-2.5", showLabel = true }) {
  const st = statutDe(score);
  const color = st === V ? "bg-ok" : st === R ? (score >= 75 ? "bg-amber" : "bg-ko") : "bg-line";
  return (
    <div className="flex flex-col gap-1">
      <div className={cx("relative w-full overflow-visible rounded-full bg-panel2 ring-1 ring-line", height)} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={isNum(score) ? score : 0} aria-label="Score avec seuil 85 %">
        <div className={cx("absolute inset-y-0 left-0 rounded-full transition-all", color)} style={{ width: (isNum(score) ? score : 0) + "%" }} />
        <div className="absolute -top-1 -bottom-1 w-[2px] bg-ink" style={{ left: "85%" }} title="Seuil 85 %" />
      </div>
      {showLabel && (
        <div className="relative h-3 font-mono text-[10px] text-muted">
          <span className="absolute left-0">0</span>
          <span className="absolute -translate-x-1/2 font-semibold text-ink" style={{ left: "85%" }}>85</span>
          <span className="absolute right-0">100</span>
        </div>
      )}
    </div>
  );
}
function Btn({ onClick, children, tone = "ghost", disabled, className = "", title, type = "button" }) {
  const tones = {
    primary: "bg-sky text-bg hover:bg-sky/90 border-sky",
    ok: "bg-ok text-bg hover:bg-ok/90 border-ok",
    danger: "bg-ko text-bg hover:bg-ko/90 border-ko",
    ghost: "bg-panel2 text-ink border-line hover:border-sky/60",
    dangerGhost: "bg-panel2 text-ko border-ko/40 hover:border-ko",
  };
  return (
    <button type={type} title={title} onClick={onClick} disabled={disabled}
      className={cx("inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
        disabled ? "cursor-not-allowed border-line bg-panel2 text-muted opacity-60" : tones[tone], className)}>
      {children}
    </button>
  );
}
function Modal({ open, onClose, title, kicker, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bg/80 px-3 py-6 backdrop-blur-sm sm:py-12" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={cx("w-full rounded-xl border border-line bg-panel shadow-2xl", wide ? "max-w-3xl" : "max-w-xl")}>
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            {kicker && <Eyebrow>{kicker}</Eyebrow>}
            <h3 className="font-display text-xl font-semibold leading-tight text-ink" style={{ textWrap: "balance" }}>{title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-md p-1 text-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"><X size={20} /></button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, id, children, hint }) {
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1">
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</span>
      {children}
      {hint && <span className="text-[12px] text-muted">{hint}</span>}
    </label>
  );
}
const inputCls = "w-full min-w-0 rounded-lg border border-line bg-panel2 px-3 py-2 text-[14px] text-ink placeholder:text-muted/70 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky";

/* ============================================================
   EN-TÊTE : STAGIAIRE ACTIF
   ============================================================ */
function Header({ db, active, calc, setActive, tab, setTab, saved }) {
  const tabs = [
    { id: "portail", label: "Portail & Modules", icon: LayoutGrid },
    { id: "promotion", label: "Base Stagiaires", icon: Users },
    { id: "grille", label: "Grille Formateur", icon: ClipboardCheck },
    { id: "bilan", label: "Fiche Bilan", icon: FileText },
  ];
  return (
    <header className="no-print relative z-40 border-b sm:sticky border-line bg-bg/95 backdrop-blur" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 py-3 gutter">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-sky/50 bg-sky/10"><Award size={20} className="text-sky" /></div>
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Airbus Helicopters · Cursus métier</div>
              <div className="font-display text-[19px] font-semibold leading-tight text-ink">Préparateur Méthodes Assemblage</div>
            </div>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center gap-3">
            <label htmlFor="sel-stagiaire" className="font-mono text-[11px] uppercase tracking-wider text-muted">Stagiaire actif</label>
            <select id="sel-stagiaire" value={active?.id || ""} onChange={(e) => setActive(e.target.value)} className={cx(inputCls, "w-auto max-w-[260px] py-1.5")}>
              {db.stagiaires.map((s) => <option key={s.id} value={s.id}>{s.prenom} {s.nom} · {s.matricule}</option>)}
            </select>
            {active && calc && (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-panel px-3 py-1.5">
                <div className="text-right">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Moyenne modules</div>
                  <div className={cx("font-mono text-[17px] font-semibold tabular-nums", calc.moyenne >= SEUIL ? "text-ok" : isNum(calc.moyenne) ? "text-ko" : "text-muted")}>{pct(calc.moyenne)}</div>
                </div>
                <StatusBadge statut={calc.statutGlobal} habilite />
              </div>
            )}
          </div>
        </div>
        <nav className="-mb-3 flex gap-1 overflow-x-auto" aria-label="Espaces">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-current={tab === t.id ? "page" : undefined}
              className={cx("flex shrink-0 items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-[14px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
                tab === t.id ? "border-sky text-ink" : "border-transparent text-muted hover:text-ink")}>
              <t.icon size={16} />{t.label}
            </button>
          ))}
          <span className={cx("ml-auto hidden shrink-0 items-center gap-1.5 self-center pb-2 font-mono text-[10px] uppercase tracking-wider sm:flex", saved ? "text-muted" : "text-amber")}>
            <Database size={12} />{saved ? `BDD locale · ${DB_KEY}` : "Stockage local indisponible · données en mémoire"}
          </span>
        </nav>
      </div>
    </header>
  );
}

/* ============================================================
   ESPACE 1 : PORTAIL & CATALOGUE
   ============================================================ */
function MiniTest({ moduleId, onResult }) {
  const questions = useMemo(() => MINI_TESTS[moduleId].map((q) => {
    const order = q.o.map((_, i) => i).sort(() => Math.random() - 0.5);
    return { ...q, order };
  }), [moduleId]);
  const [picked, setPicked] = useState({});
  const [corrige, setCorrige] = useState(false);
  const nbRep = Object.keys(picked).length;
  const bonnes = questions.filter((q, i) => picked[i] === q.a).length;
  const score = (bonnes / questions.length) * 100;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-lg border border-line bg-panel2 px-3 py-2 text-[13px] text-muted">
        <Info size={16} className="mt-0.5 shrink-0 text-sky" />
        <span>7 questions de contrôle. Une seule erreur est tolérée : 6/7 donne 85,7 % (VALIDE), 5/7 donne 71,4 % (À REVOIR).</span>
      </div>
      {questions.map((q, i) => (
        <fieldset key={i} className="flex flex-col gap-2">
          <legend className="mb-2 text-[14px] font-medium text-ink">{i + 1}. {q.q}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.order.map((k) => {
              const sel = picked[i] === k;
              const good = k === q.a;
              const state = corrige ? (good ? "good" : sel ? "bad" : "idle") : sel ? "sel" : "idle";
              return (
                <button key={k} type="button" disabled={corrige} onClick={() => setPicked({ ...picked, [i]: k })}
                  className={cx("rounded-lg border px-3 py-2 text-left text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
                    state === "good" && "border-ok bg-ok/15 text-ink", state === "bad" && "border-ko bg-ko/15 text-ink",
                    state === "sel" && "border-sky bg-sky/15 text-ink", state === "idle" && "border-line bg-panel2 text-ink/80 hover:border-sky/60")}>
                  {q.o[k]}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {!corrige ? (
        <div className="flex flex-wrap items-center gap-3">
          <Btn tone="primary" disabled={nbRep < questions.length} onClick={() => setCorrige(true)}><ClipboardCheck size={16} />Corriger le mini-test</Btn>
          <span className="font-mono text-[12px] text-muted">{nbRep}/{questions.length} réponses</span>
        </div>
      ) : (
        <div className={cx("flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3", score >= SEUIL ? "border-ok/50 bg-ok/10" : "border-ko/50 bg-ko/10")}>
          <div className="font-mono text-[22px] font-semibold tabular-nums text-ink">{bonnes}/7 · {pct(score)}</div>
          <StatusBadge statut={statutDe(score)} />
          <div className="ml-auto flex gap-2">
            <Btn onClick={() => { setPicked({}); setCorrige(false); }}><RotateCcw size={15} />Recommencer</Btn>
            <Btn tone="ok" onClick={() => onResult(Math.round(score * 10) / 10)}><CheckCircle2 size={15} />Enregistrer ce score</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreModal({ open, onClose, stagiaire, moduleId, onSave }) {
  const m = MOD[moduleId];
  const cur = stagiaire?.modules?.[moduleId];
  const [mode, setMode] = useState("saisie");
  const [val, setVal] = useState(80);
  const [date, setDate] = useState(today());
  const [nouvelle, setNouvelle] = useState(true);
  useEffect(() => {
    if (open) { setMode("saisie"); setVal(isNum(cur?.score) ? cur.score : 80); setDate(today()); setNouvelle(true); }
  }, [open, moduleId, stagiaire?.id]);
  if (!m || !stagiaire) return null;
  const v = clamp(Number(val) || 0);
  return (
    <Modal open={open} onClose={onClose} wide kicker={`${m.code} · ${stagiaire.prenom} ${stagiaire.nom}`} title={m.titre}>
      <div className="mb-4 flex gap-1 rounded-lg border border-line bg-panel2 p-1">
        {[["saisie", "Saisir / simuler le score"], ["test", "Mini-test de contrôle"]].map(([id, l]) => (
          <button key={id} type="button" onClick={() => setMode(id)} className={cx("flex-1 rounded-md px-3 py-2 text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", mode === id ? "bg-sky text-bg" : "text-muted hover:text-ink")}>{l}</button>
        ))}
      </div>
      {mode === "saisie" ? (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label="Score obtenu (%)" id="score-range">
              <input id="score-range" type="range" min="0" max="100" step="1" value={v} onChange={(e) => setVal(e.target.value)} className="w-full accent-sky" />
            </Field>
            <input id="score-num" aria-label="Score en pourcentage" type="number" min="0" max="100" step="0.1" value={val} onChange={(e) => setVal(e.target.value)} className={cx(inputCls, "w-28 text-right font-mono text-lg")} />
          </div>
          <ThresholdBar score={v} height="h-3" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[14px] text-muted">Verdict immédiat :</span><StatusBadge statut={statutDe(v)} size="lg" />
            <span className="font-mono text-[12px] text-muted">{v >= SEUIL ? `+${pct(v - SEUIL)} au-dessus du seuil` : `${pct(SEUIL - v)} manquants`}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date de passage" id="score-date"><input id="score-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></Field>
            <label htmlFor="score-tentative" className="flex items-center gap-2 self-end pb-2 text-[14px] text-ink">
              <input id="score-tentative" type="checkbox" checked={nouvelle} onChange={(e) => setNouvelle(e.target.checked)} className="h-4 w-4 accent-sky" />
              Compter une nouvelle tentative (actuellement {cur?.tentatives || 0})
            </label>
          </div>
          <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4">
            <Btn tone="dangerGhost" onClick={() => onSave({ score: null, tentatives: 0, datePassage: "" })}><RotateCcw size={15} />Remettre à « Non évalué »</Btn>
            <Btn tone="primary" onClick={() => onSave({ score: v, tentatives: (cur?.tentatives || 0) + (nouvelle ? 1 : 0) || 1, datePassage: date })}><CheckCircle2 size={15} />Enregistrer {pct(v)}</Btn>
          </div>
        </div>
      ) : (
        <MiniTest key={moduleId + stagiaire.id} moduleId={moduleId} onResult={(s) => onSave({ score: s, tentatives: (cur?.tentatives || 0) + 1, datePassage: today() })} />
      )}
    </Modal>
  );
}

function Portail({ active, calc, updateStagiaire, goto, onLaunchModule }) {
  const [edit, setEdit] = useState(null);
  if (!active) return <EmptyState goto={goto} />;
  const nbValides = calc.mods.filter((m) => m.statut === V).length;
  return (
    <div className="flex flex-col gap-6">
      <Panel className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-3 p-5 sm:p-6">
            <Eyebrow>Espace apprenant · {active.session || "Session non renseignée"}</Eyebrow>
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl" style={{ textWrap: "balance" }}>Bonjour {active.prenom}, voici votre parcours.</h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-muted">Chaque module se valide à <strong className="text-ink">85 % minimum</strong>. En dessous, il passe en « À revoir » et doit être repassé. L'habilitation exige les 5 modules validés, une grille formateur à 85 % ou plus et aucun drapeau rouge sécurité.</p>
            <div className="mt-1 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] text-muted">
              <span>Matricule <span className="text-ink">{active.matricule}</span></span>
              <span>Entreprise <span className="text-ink">{active.entreprise || "—"}</span></span>
              <span>Entrée <span className="text-ink">{frDate(active.dateEntree)}</span></span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3 border-t border-line bg-panel2 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Modules validés</span>
              <span className="font-mono text-2xl font-semibold tabular-nums text-ink">{nbValides}<span className="text-muted">/5</span></span>
            </div>
            <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
              {calc.mods.map((m) => <div key={m.id} className={cx("h-2 rounded-full", m.statut === V ? "bg-ok" : m.statut === R ? "bg-ko" : "bg-line")} />)}
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Grille formateur</span>
              <span className={cx("font-mono text-lg font-semibold tabular-nums", calc.grille.global >= SEUIL ? "text-ok" : isNum(calc.grille.global) ? "text-ko" : "text-muted")}>{pct(calc.grille.global)} <span className="text-[12px] text-muted">({calc.grille.nbEval}/20)</span></span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge statut={calc.statutGlobal} habilite size="lg" />
              {calc.drapeau && <span className="inline-flex items-center gap-1 rounded-md border border-ko bg-ko px-2 py-1 font-mono text-[11px] font-semibold uppercase text-bg"><Flag size={13} />Drapeau rouge</span>}
            </div>
          </div>
        </div>
      </Panel>

      <div className="flex flex-col gap-2">
        <Eyebrow>Catalogue du cursus</Eyebrow>
        <h2 className="font-display text-2xl font-semibold text-ink">Les 5 modules</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {calc.mods.map((m) => {
          const Icon = m.icon;
          const tone = m.statut === V ? "border-ok/40" : m.statut === R ? "border-ko/40" : "border-line";
          return (
            <article key={m.id} className={cx("flex flex-col gap-4 rounded-xl border bg-panel p-5", tone)}>
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-line bg-panel2"><Icon size={20} className="text-sky" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[12px] font-semibold tracking-wider text-sky">MODULE {m.code.slice(1)}</span>
                    <StatusBadge statut={m.statut} size="sm" />
                  </div>
                  <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug text-ink" style={{ textWrap: "balance" }}>{m.titre}</h3>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-muted">{m.resume}</p>
              <div className="mt-auto flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className={cx("font-mono text-2xl font-semibold tabular-nums", m.statut === V ? "text-ok" : m.statut === R ? "text-ko" : "text-muted")}>{pct(m.score)}</span>
                  <span className="font-mono text-[11px] text-muted">{m.tentatives} tentative{m.tentatives > 1 ? "s" : ""} · {frDate(m.datePassage)}</span>
                </div>
                <ThresholdBar score={m.score} />
              </div>
              <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                <Btn tone="primary" onClick={() => setEdit(m.id)} className="flex-1"><ClipboardCheck size={15} />Saisir / Simuler le score du module</Btn>
                <button type="button" onClick={() => onLaunchModule(m.id)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ok/60 bg-ok/15 px-3 py-2 text-[13px] font-semibold text-ink transition hover:bg-ok/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"><BookOpen size={15} />Lancer {m.code}<ChevronRight size={14} className="text-muted" /></button>
              </div>
            </article>
          );
        })}
        <Panel className="flex flex-col justify-between gap-4 border-dashed p-5">
          <div className="flex flex-col gap-2">
            <Eyebrow>Prochaine étape</Eyebrow>
            {calc.statutGlobal === V ? (
              <p className="text-[14px] leading-relaxed text-ink">Toutes les conditions sont réunies. La fiche bilan peut être éditée et signée.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-[13px] text-ink">
                {calc.raisons.slice(0, 6).map((r, i) => <li key={i} className="flex gap-2"><ChevronRight size={14} className="mt-0.5 shrink-0 text-ko" />{r}</li>)}
                {calc.raisons.length > 6 && <li className="text-muted">… et {calc.raisons.length - 6} autre(s) point(s)</li>}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => goto("grille")}><ClipboardCheck size={15} />Grille formateur</Btn>
            <Btn onClick={() => goto("bilan")}><FileText size={15} />Fiche bilan</Btn>
          </div>
        </Panel>
      </div>
      <ScoreModal open={!!edit} moduleId={edit} stagiaire={active} onClose={() => setEdit(null)}
        onSave={(entry) => { updateStagiaire(active.id, (s) => ({ ...s, modules: { ...s.modules, [edit]: entry } })); setEdit(null); }} />
    </div>
  );
}

function EmptyState({ goto }) {
  return (
    <Panel className="flex flex-col items-start gap-3 p-8">
      <Eyebrow>Base vide</Eyebrow>
      <h2 className="font-display text-2xl font-semibold text-ink">Aucun stagiaire dans la base</h2>
      <p className="text-[14px] text-muted">Ajoutez un stagiaire, importez une base JSON ou rechargez les 4 profils de démonstration depuis l'espace Base Stagiaires.</p>
      <Btn tone="primary" onClick={() => goto("promotion")}><Users size={15} />Aller à la base stagiaires</Btn>
    </Panel>
  );
}

/* ============================================================
   ESPACE 2 : BASE STAGIAIRES & PROMOTIONS
   ============================================================ */
function StagiaireForm({ open, onClose, initial, onSave, existing }) {
  const blank = { prenom: "", nom: "", matricule: "", entreprise: "Airbus Helicopters Marignane", session: "Promo FAL H160", dateEntree: today(), commentaireFormateur: "", pointsARevoir: "" };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!open) return;
    setErr("");
    if (initial) setF({ ...blank, ...initial });
    else {
      const nums = existing.map((s) => parseInt(String(s.matricule).split("-").pop(), 10)).filter((n) => !isNaN(n));
      const next = String((nums.length ? Math.max(...nums) : 40) + 1).padStart(3, "0");
      setF({ ...blank, matricule: `AH-${new Date().getFullYear()}-${next}` });
    }
  }, [open, initial?.id]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const entreprises = [...new Set(["Airbus Helicopters Marignane", "Airbus Helicopters Donauwörth", "Sous-traitant aérostructures", "Alternance — Airbus Helicopters Marignane", ...existing.map((s) => s.entreprise).filter(Boolean)])];
  const sessions = [...new Set(["Promo FAL H160", "Promo FAL H145", "Promo FAL H175", ...existing.map((s) => s.session).filter(Boolean)])];
  const submit = (e) => {
    e.preventDefault();
    if (!f.prenom.trim() || !f.nom.trim() || !f.matricule.trim()) { setErr("Renseignez au minimum le prénom, le nom et le matricule."); return; }
    if (existing.some((s) => s.matricule.toLowerCase() === f.matricule.trim().toLowerCase() && s.id !== initial?.id)) { setErr(`Le matricule ${f.matricule} existe déjà dans la base. Choisissez-en un autre.`); return; }
    onSave(f);
  };
  return (
    <Modal open={open} onClose={onClose} kicker={initial ? "Modifier le profil" : "Nouveau profil"} title={initial ? `${initial.prenom} ${initial.nom}` : "Ajouter un stagiaire"} wide>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom *" id="f-prenom"><input id="f-prenom" value={f.prenom} onChange={set("prenom")} className={inputCls} /></Field>
          <Field label="Nom *" id="f-nom"><input id="f-nom" value={f.nom} onChange={set("nom")} className={inputCls} /></Field>
          <Field label="Matricule *" id="f-mat" hint="Format conseillé : AH-AAAA-NNN"><input id="f-mat" value={f.matricule} onChange={set("matricule")} className={cx(inputCls, "font-mono")} /></Field>
          <Field label="Date d'entrée" id="f-date"><input id="f-date" type="date" value={f.dateEntree} onChange={set("dateEntree")} className={inputCls} /></Field>
          <Field label="Entreprise" id="f-ent"><input id="f-ent" list="dl-ent" value={f.entreprise} onChange={set("entreprise")} className={inputCls} /><datalist id="dl-ent">{entreprises.map((x) => <option key={x} value={x} />)}</datalist></Field>
          <Field label="Session" id="f-ses"><input id="f-ses" list="dl-ses" value={f.session} onChange={set("session")} className={inputCls} /><datalist id="dl-ses">{sessions.map((x) => <option key={x} value={x} />)}</datalist></Field>
        </div>
        <Field label="Commentaire formateur" id="f-com"><textarea id="f-com" rows={3} value={f.commentaireFormateur} onChange={set("commentaireFormateur")} className={inputCls} /></Field>
        <Field label="Points à revoir" id="f-par"><textarea id="f-par" rows={2} value={f.pointsARevoir} onChange={set("pointsARevoir")} className={inputCls} /></Field>
        {err && <div className="flex items-center gap-2 rounded-lg border border-ko/50 bg-ko/10 px-3 py-2 text-[13px] text-ink"><AlertTriangle size={16} className="text-ko" />{err}</div>}
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn tone="primary" type="submit"><CheckCircle2 size={15} />{initial ? "Enregistrer les modifications" : "Ajouter à la base"}</Btn>
        </div>
      </form>
    </Modal>
  );
}

function Kpi({ label, value, sub, tone }) {
  const c = tone === "ok" ? "text-ok" : tone === "ko" ? "text-ko" : "text-ink";
  return (
    <Panel className="flex flex-col gap-1 p-4">
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</span>
      <span className={cx("font-mono text-3xl font-semibold tabular-nums", c)}>{value}</span>
      {sub && <span className="text-[12px] text-muted">{sub}</span>}
    </Panel>
  );
}

function toCSV(list) {
  const num = (x) => (isNum(x) ? String(Math.round(x * 10) / 10).replace(".", ",") : "");
  const esc = (x) => { const s = String(x ?? ""); return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const head = ["Matricule", "Nom", "Prénom", "Entreprise", "Session", "Date entrée",
    ...MODULES.flatMap((m) => [`${m.code} score (%)`, `${m.code} verdict`, `${m.code} tentatives`, `${m.code} date`]),
    "Moyenne modules (%)", "Grille globale (%)", "Compétences évaluées", "Drapeau sécurité", "Seuil (%)", "Statut global", "Points à revoir", "Commentaire formateur"];
  const rows = list.map((s) => {
    const c = calcStagiaire(s);
    return [s.matricule, s.nom, s.prenom, s.entreprise, s.session, frDate(s.dateEntree),
      ...c.mods.flatMap((m) => [num(m.score), m.statut, m.tentatives, m.datePassage ? frDate(m.datePassage) : ""]),
      num(c.moyenne), num(c.grille.global), `${c.grille.nbEval}/20`, c.drapeau ? "OUI" : "NON", SEUIL,
      c.statutGlobal === V ? "VALIDE (HABILITÉ)" : "À REVOIR", s.pointsARevoir, s.commentaireFormateur];
  });
  return "﻿" + [head, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}

function Promotion({ db, setDB, setActive, goto, offerFile }) {
  const [q, setQ] = useState("");
  const [session, setSession] = useState("Toutes");
  const [filtre, setFiltre] = useState("tous");
  const [form, setForm] = useState({ open: false, initial: null });
  const [del, setDel] = useState(null);
  const [imp, setImp] = useState(null);
  const [reset, setReset] = useState(false);
  const fileRef = useRef(null);

  const sessions = ["Toutes", ...new Set(db.stagiaires.map((s) => s.session).filter(Boolean))];
  const scope = db.stagiaires.filter((s) => session === "Toutes" || s.session === session);
  const calcs = useMemo(() => Object.fromEntries(db.stagiaires.map((s) => [s.id, calcStagiaire(s)])), [db.stagiaires]);
  const nbV = scope.filter((s) => calcs[s.id].statutGlobal === V).length;
  const moyPromo = mean(scope.map((s) => calcs[s.id].moyenne));
  const rows = scope.filter((s) => {
    const st = calcs[s.id].statutGlobal;
    if (filtre === "valide" && st !== V) return false;
    if (filtre === "revoir" && st !== R) return false;
    const hay = `${s.nom} ${s.prenom} ${s.matricule} ${s.entreprise}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  }).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  const saveForm = (f) => {
    if (form.initial) {
      setDB((d) => ({ ...d, stagiaires: d.stagiaires.map((s) => (s.id === form.initial.id ? normaliser({ ...s, ...f }) : s)) }));
    } else {
      const ns = normaliser({ ...f, id: uid(), modules: {}, grilleCompetences: {} });
      setDB((d) => ({ ...d, stagiaires: [...d.stagiaires, ns], activeId: ns.id }));
    }
    setForm({ open: false, initial: null });
  };
  const doDelete = () => {
    setDB((d) => {
      const list = d.stagiaires.filter((s) => s.id !== del.id);
      return { ...d, stagiaires: list, activeId: d.activeId === del.id ? list[0]?.id || null : d.activeId };
    });
    setDel(null);
  };
  const exportJSON = () => {
    const payload = { ...db, exportedAt: new Date().toISOString(), regle: "Score < 85 % = À REVOIR ; Score ≥ 85 % = VALIDE" };
    offerFile(`ah_lms_bdd_${today()}.json`, JSON.stringify(payload, null, 2), "application/json");
  };
  const exportCSV = () => offerFile(`ah_lms_suivi_${session === "Toutes" ? "toutes-sessions" : session.replace(/\s+/g, "-")}_${today()}.csv`, toCSV(scope), "text/csv");
  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const p = JSON.parse(String(rd.result));
        const list = Array.isArray(p) ? p : p?.stagiaires;
        if (!Array.isArray(list)) throw new Error("Le fichier ne contient pas de liste « stagiaires ».");
        const clean = list.filter((s) => s && (s.nom || s.prenom || s.matricule)).map(normaliser);
        if (!clean.length) throw new Error("Aucun profil stagiaire exploitable dans ce fichier.");
        setImp({ name: file.name, list: clean });
      } catch (err) {
        setImp({ name: file.name, error: err.message || "Fichier JSON illisible." });
      }
    };
    rd.readAsText(file);
  };
  const applyImport = (mode) => {
    setDB((d) => {
      if (mode === "remplacer") return { ...d, stagiaires: imp.list, activeId: imp.list[0].id };
      const byMat = new Map(d.stagiaires.map((s) => [s.matricule.toLowerCase(), s]));
      imp.list.forEach((s) => { const prev = byMat.get(s.matricule.toLowerCase()); byMat.set(s.matricule.toLowerCase(), prev ? { ...s, id: prev.id } : s); });
      return { ...d, stagiaires: [...byMat.values()] };
    });
    setImp(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>Espace formateur · CRM promotion</Eyebrow>
          <h2 className="font-display text-3xl font-semibold text-ink">Base stagiaires & promotions</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn tone="primary" onClick={() => setForm({ open: true, initial: null })}><Plus size={15} />Ajouter un stagiaire</Btn>
          <Btn onClick={exportCSV}><FileSpreadsheet size={15} />Exporter CSV (Excel)</Btn>
          <Btn onClick={exportJSON}><Download size={15} />Exporter BDD (.json)</Btn>
          <Btn onClick={() => fileRef.current?.click()}><Upload size={15} />Importer BDD (.json)</Btn>
          <input ref={fileRef} id="import-json" type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Stagiaires" value={scope.length} sub={session === "Toutes" ? "Toutes sessions" : session} />
        <Kpi label="VALIDE (≥ 85 % partout)" value={nbV} tone="ok" sub={scope.length ? `${Math.round((nbV / scope.length) * 100)} % de la promotion` : "—"} />
        <Kpi label="À REVOIR (< 85 %)" value={scope.length - nbV} tone="ko" sub="Au moins un critère sous le seuil" />
        <Kpi label="Moyenne modules" value={pct(moyPromo)} tone={moyPromo >= SEUIL ? "ok" : isNum(moyPromo) ? "ko" : undefined} sub="Moyenne des modules évalués" />
      </div>

      <Panel className="p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-ink">Taux de réussite par module</h3>
          <span className="font-mono text-[11px] text-muted">Part des stagiaires évalués à ≥ 85 % · trait blanc = seuil 85 %</span>
        </div>
        <div className="flex flex-col gap-3">
          {MODULES.map((m) => {
            const ev = scope.filter((s) => isNum(s.modules?.[m.id]?.score));
            const ok = ev.filter((s) => s.modules[m.id].score >= SEUIL).length;
            const taux = ev.length ? (ok / ev.length) * 100 : null;
            return (
              <div key={m.id} className="grid grid-cols-[52px_1fr_auto] items-center gap-3">
                <span className="font-mono text-[13px] font-semibold text-sky">{m.code}</span>
                <ThresholdBar score={taux} height="h-3" showLabel={false} />
                <span className="w-36 text-right font-mono text-[12px] tabular-nums text-ink">{isNum(taux) ? `${Math.round(taux)} %` : "—"} <span className="text-muted">({ok}/{ev.length} évalués)</span></span>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <div className="relative min-w-0 flex-1 basis-56">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input id="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher nom, matricule, entreprise…" aria-label="Rechercher" className={cx(inputCls, "pl-9")} />
          </div>
          <select id="filtre-session" aria-label="Filtrer par session" value={session} onChange={(e) => setSession(e.target.value)} className={cx(inputCls, "w-auto")}>
            {sessions.map((s) => <option key={s} value={s}>{s === "Toutes" ? "Toutes les sessions" : s}</option>)}
          </select>
          <div className="flex gap-1 rounded-lg border border-line bg-panel2 p-1" role="group" aria-label="Filtre statut">
            {[["tous", "Tous"], ["valide", "VALIDE (≥ 85 %)"], ["revoir", "À REVOIR (< 85 %)"]].map(([id, l]) => (
              <button key={id} type="button" onClick={() => setFiltre(id)} aria-pressed={filtre === id}
                className={cx("whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
                  filtre === id ? (id === "valide" ? "bg-ok text-bg" : id === "revoir" ? "bg-ko text-bg" : "bg-sky text-bg") : "text-muted hover:text-ink")}>{l}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-line bg-panel2 text-left font-mono text-[10px] uppercase tracking-wider text-muted">
                <th className="px-4 py-2.5 font-medium">Stagiaire</th>
                <th className="px-3 py-2.5 font-medium">Entreprise · Session</th>
                {MODULES.map((m) => <th key={m.id} className="px-2 py-2.5 text-center font-medium">{m.code}</th>)}
                <th className="px-2 py-2.5 text-center font-medium">Grille</th>
                <th className="px-3 py-2.5 font-medium">Statut global</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const c = calcs[s.id];
                const isActive = s.id === db.activeId;
                return (
                  <tr key={s.id} className={cx("border-b border-line/70 align-middle", isActive && "bg-sky/5")}>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => { setActive(s.id); goto("portail"); }} className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky">
                        <div className="font-semibold text-ink hover:text-sky">{s.nom.toUpperCase()} {s.prenom}</div>
                        <div className="font-mono text-[11px] text-muted">{s.matricule}{isActive && <span className="ml-2 text-sky">· actif</span>}</div>
                      </button>
                    </td>
                    <td className="px-3 py-3"><div className="max-w-[220px] truncate text-ink" title={s.entreprise}>{s.entreprise || "—"}</div><div className="text-[11px] text-muted">{s.session || "—"}</div></td>
                    {c.mods.map((m) => (
                      <td key={m.id} className="px-2 py-3 text-center">
                        <div className={cx("font-mono text-[13px] font-semibold tabular-nums", m.statut === V ? "text-ok" : m.statut === R ? "text-ko" : "text-muted")}>{isNum(m.score) ? Math.floor(m.score) : "—"}</div>
                        <div className={cx("mx-auto mt-1 h-1 w-8 rounded-full", m.statut === V ? "bg-ok" : m.statut === R ? "bg-ko" : "bg-line")} />
                      </td>
                    ))}
                    <td className="px-2 py-3 text-center"><div className={cx("font-mono text-[13px] font-semibold tabular-nums", c.grille.global >= SEUIL ? "text-ok" : isNum(c.grille.global) ? "text-ko" : "text-muted")}>{isNum(c.grille.global) ? Math.floor(c.grille.global) : "—"}</div><div className="font-mono text-[10px] text-muted">{c.grille.nbEval}/20</div></td>
                    <td className="px-3 py-3"><div className="flex flex-wrap items-center gap-1.5"><StatusBadge statut={c.statutGlobal} size="sm" habilite />{c.drapeau && <Flag size={14} className="text-ko" aria-label="Drapeau rouge sécurité" />}</div></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconBtn label="Grille d'évaluation" onClick={() => { setActive(s.id); goto("grille"); }}><ClipboardCheck size={15} /></IconBtn>
                        <IconBtn label="Fiche bilan" onClick={() => { setActive(s.id); goto("bilan"); }}><FileText size={15} /></IconBtn>
                        <IconBtn label="Modifier" onClick={() => setForm({ open: true, initial: s })}><Pencil size={15} /></IconBtn>
                        <IconBtn label="Supprimer" danger onClick={() => setDel(s)}><Trash2 size={15} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={10} className="px-4 py-10 text-center text-muted">Aucun stagiaire ne correspond à ces filtres.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted">
        <span className="flex items-center gap-2"><Database size={14} />Les données sont enregistrées dans ce navigateur (clé {DB_KEY}). Exportez le JSON pour les sauvegarder ou les transférer sur un autre poste.</span>
        <Btn tone="dangerGhost" onClick={() => setReset(true)}><RotateCcw size={14} />Recharger les 4 profils de démonstration</Btn>
      </div>

      <StagiaireForm open={form.open} initial={form.initial} existing={db.stagiaires} onClose={() => setForm({ open: false, initial: null })} onSave={saveForm} />
      <Modal open={!!del} onClose={() => setDel(null)} kicker="Suppression définitive" title={del ? `Supprimer ${del.prenom} ${del.nom} ?` : ""}>
        <p className="text-[14px] text-muted">Le profil, ses scores de modules et sa grille d'évaluation seront retirés de la base locale. Exportez la BDD avant si vous souhaitez en garder une trace.</p>
        <div className="mt-5 flex justify-end gap-2"><Btn onClick={() => setDel(null)}>Annuler</Btn><Btn tone="danger" onClick={doDelete}><Trash2 size={15} />Supprimer</Btn></div>
      </Modal>
      <Modal open={!!imp} onClose={() => setImp(null)} kicker="Import BDD" title={imp?.name || ""}>
        {imp?.error ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-lg border border-ko/50 bg-ko/10 px-3 py-2 text-[14px] text-ink"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-ko" />{imp.error} Vérifiez qu'il s'agit d'un export de ce portail.</div>
            <div className="flex justify-end"><Btn onClick={() => setImp(null)}>Fermer</Btn></div>
          </div>
        ) : imp && (
          <div className="flex flex-col gap-4">
            <p className="text-[14px] text-ink">{imp.list.length} profil(s) lu(s). Les statuts sont recalculés avec le seuil de 85 %.</p>
            <ul className="max-h-40 overflow-y-auto rounded-lg border border-line bg-panel2 p-2 font-mono text-[12px] text-muted">
              {imp.list.map((s) => <li key={s.id} className="py-0.5">{s.matricule} · {s.nom} {s.prenom} · <span className={s.statutGlobal === V ? "text-ok" : "text-ko"}>{s.statutGlobal}</span></li>)}
            </ul>
            <div className="flex flex-wrap justify-end gap-2">
              <Btn onClick={() => applyImport("fusionner")}>Fusionner (par matricule)</Btn>
              <Btn tone="danger" onClick={() => applyImport("remplacer")}>Remplacer toute la base</Btn>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={reset} onClose={() => setReset(false)} kicker="Base de démonstration" title="Remplacer la base par les 4 profils de démonstration ?">
        <p className="text-[14px] text-muted">Tous les stagiaires actuels seront remplacés. Exportez la BDD avant si besoin.</p>
        <div className="mt-5 flex justify-end gap-2"><Btn onClick={() => setReset(false)}>Annuler</Btn><Btn tone="danger" onClick={() => { setDB(() => freshDB()); setReset(false); }}><RotateCcw size={15} />Recharger la démo</Btn></div>
      </Modal>
    </div>
  );
}
function IconBtn({ children, label, onClick, danger }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className={cx("grid h-8 w-8 place-items-center rounded-md border border-line bg-panel2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", danger ? "text-ko hover:border-ko" : "text-ink hover:border-sky/60")}>{children}</button>;
}

/* ============================================================
   ESPACE 3 : GRILLE D'ÉVALUATION FORMATEUR
   ============================================================ */
function remediation(s, c) {
  const modules = c.mods.filter((m) => m.statut !== V).map((m) => ({ ...m, action: m.statut === N ? "À passer" : `À repasser (${pct(m.score)}, ${m.tentatives} tentative${m.tentatives > 1 ? "s" : ""})` }));
  const comps = c.grille.domaines.flatMap((d) => d.aRetravailler.map((i) => ({ ...i, domaine: d.id, domTitre: d.titre })));
  const nonEval = c.grille.domaines.flatMap((d) => d.nonEvalues.map((i) => ({ ...i, domaine: d.id })));
  return { modules, comps, nonEval };
}
function remediationTexte(s, c) {
  const r = remediation(s, c);
  const l = [];
  r.modules.forEach((m) => l.push(`• ${m.code} — ${m.action}`));
  r.comps.forEach((i) => l.push(`• ${i.id} ${i.label} (${i.entry?.mode === "bin" ? "À REVOIR" : pct(i.score)}) → revoir ${i.mods.map((x) => MOD[x].code).join(" / ")}${i.critique ? " [CRITIQUE SÉCURITÉ]" : ""}`));
  if (s.drapeauSecurite?.actif) l.push(`• Drapeau rouge sécurité : ${s.drapeauSecurite.motif || "à préciser"}`);
  return l.join("\n");
}

function CompRow({ item, modules, onSet }) {
  const e = item.entry;
  const [draft, setDraft] = useState(e?.mode === "pct" ? String(e.score) : "");
  useEffect(() => { setDraft(e?.mode === "pct" ? String(e.score) : ""); }, [e?.mode, e?.score]);
  const auto = autoScore(item, modules);
  const commitPct = () => {
    if (draft.trim() === "") return;
    const n = Number(draft.replace(",", "."));
    if (Number.isFinite(n)) onSet(pctEntry(clamp(n)));
  };
  const st = isNum(item.score) ? statutDe(item.score) : N;
  return (
    <div className={cx("grid gap-3 border-b border-line/70 px-4 py-3 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center", st === R && "bg-ko/5")}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 w-7 shrink-0 font-mono text-[12px] font-semibold text-sky">{item.id}</span>
        <div className="min-w-0">
          <div className="text-[14px] text-ink">{item.label}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {item.mods.map((x) => <span key={x} className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">{MOD[x].code} {isNum(modules?.[x]?.score) ? Math.floor(modules[x].score) + "%" : "—"}</span>)}
            {item.critique && <span className="inline-flex items-center gap-1 rounded border border-ko/50 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ko"><ShieldAlert size={11} />Critique sécurité</span>}
            {e?.auto && <span className="font-mono text-[10px] text-muted">auto-calculé</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-10 lg:pl-0">
        <div className="flex overflow-hidden rounded-lg border border-line" role="group" aria-label={`Évaluation ${item.id}`}>
          <button type="button" onClick={() => onSet(binEntry(V))} aria-pressed={e?.mode === "bin" && e.statut === V}
            className={cx("px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", e?.mode === "bin" && e.statut === V ? "bg-ok text-bg" : "bg-panel2 text-ok hover:bg-ok/10")}>Valide</button>
          <button type="button" onClick={() => onSet(binEntry(R))} aria-pressed={e?.mode === "bin" && e.statut === R}
            className={cx("border-l border-line px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", e?.mode === "bin" && e.statut === R ? "bg-ko text-bg" : "bg-panel2 text-ko hover:bg-ko/10")}>À revoir</button>
        </div>
        <div className="flex items-center gap-1">
          <input id={`pct-${item.id}`} aria-label={`Score en % pour ${item.id}`} inputMode="decimal" value={draft} placeholder="%"
            onChange={(ev) => setDraft(ev.target.value)} onBlur={commitPct} onKeyDown={(ev) => ev.key === "Enter" && commitPct()}
            className={cx("w-16 rounded-lg border bg-panel2 px-2 py-1.5 text-right font-mono text-[13px] text-ink focus:border-sky focus:outline-none", e?.mode === "pct" ? (st === V ? "border-ok" : "border-ko") : "border-line")} />
          <button type="button" title={isNum(auto) ? `Auto-calcul depuis les modules : ${pct(auto)}` : "Aucun module lié n'est encore évalué"} aria-label={`Auto-calcul ${item.id}`}
            disabled={!isNum(auto)} onClick={() => onSet(pctEntry(auto, true))}
            className={cx("grid h-8 w-8 place-items-center rounded-md border border-line bg-panel2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", isNum(auto) ? "text-sky hover:border-sky/60" : "cursor-not-allowed text-muted opacity-50")}><Wand2 size={15} /></button>
          <button type="button" title="Effacer (Non évalué)" aria-label={`Effacer ${item.id}`} disabled={!e} onClick={() => onSet(null)}
            className={cx("grid h-8 w-8 place-items-center rounded-md border border-line bg-panel2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", e ? "text-muted hover:text-ink" : "cursor-not-allowed text-muted opacity-40")}><X size={15} /></button>
        </div>
        <div className="w-[104px]"><StatusBadge statut={st} size="sm" /></div>
      </div>
    </div>
  );
}

function Grille({ active, calc, updateStagiaire, goto }) {
  const [autoAsk, setAutoAsk] = useState(false);
  if (!active) return <EmptyState goto={goto} />;
  const setComp = (id, entry) => updateStagiaire(active.id, (s) => ({ ...s, grilleCompetences: { ...s.grilleCompetences, [id]: entry } }));
  const autoAll = (onlyEmpty) => {
    updateStagiaire(active.id, (s) => {
      const gc = { ...s.grilleCompetences };
      ALL_COMPS.forEach((c) => {
        if (onlyEmpty && gc[c.id]) return;
        const a = autoScore(c, s.modules);
        if (isNum(a)) gc[c.id] = pctEntry(a, true);
      });
      return { ...s, grilleCompetences: gc };
    });
    setAutoAsk(false);
  };
  const rem = remediation(active, calc);
  const G = calc.grille;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>Espace formateur · Grille des 20 compétences métier</Eyebrow>
          <h2 className="font-display text-3xl font-semibold text-ink">{active.prenom} {active.nom.toUpperCase()}</h2>
          <span className="font-mono text-[12px] text-muted">{active.matricule} · {active.session}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn tone="primary" onClick={() => setAutoAsk(true)}><Wand2 size={15} />Auto-calcul depuis les 5 modules</Btn>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_repeat(5,1fr)]">
        <Panel className={cx("flex flex-col gap-2 p-4", G.statut === V ? "border-ok/50" : G.statut === R ? "border-ko/50" : "")}>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Score global de grille</span>
          <div className="flex items-baseline gap-2"><span className={cx("font-mono text-3xl font-semibold tabular-nums", G.statut === V ? "text-ok" : G.statut === R ? "text-ko" : "text-muted")}>{pct(G.global)}</span><span className="font-mono text-[12px] text-muted">{G.nbEval}/20</span></div>
          <StatusBadge statut={G.complete ? G.statut : G.nbEval ? R : N} />
          {!G.complete && G.nbEval > 0 && <span className="text-[11px] text-amber">Grille incomplète : statut À REVOIR tant que les 20 critères ne sont pas évalués.</span>}
        </Panel>
        {G.domaines.map((d) => (
          <a key={d.id} href={`#dom-${d.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`dom-${d.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
            className={cx("flex flex-col gap-2 rounded-xl border bg-panel p-4 transition hover:border-sky/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", d.statut === V ? "border-ok/40" : d.statut === R ? "border-ko/40" : "border-line")}>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Domaine {d.id}</span>
            <span className={cx("font-mono text-xl font-semibold tabular-nums", d.statut === V ? "text-ok" : d.statut === R ? "text-ko" : "text-muted")}>{pct(d.score)}</span>
            <ThresholdBar score={d.score} height="h-1.5" showLabel={false} />
          </a>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          {G.domaines.map((d) => (
            <section key={d.id} id={`dom-${d.id}`} className={cx("scroll-mt-40 overflow-hidden rounded-xl border bg-panel", d.statut === R ? "border-ko/50" : d.statut === V ? "border-ok/40" : "border-line")}>
              <div className="flex flex-wrap items-center gap-4 border-b border-line bg-panel2 px-4 py-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-sky/40 font-display text-xl font-semibold text-sky">{d.id}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold leading-tight text-ink">Domaine {d.id} — {d.titre}</h3>
                  <div className="text-[12px] text-muted">{d.detail}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right"><div className={cx("font-mono text-xl font-semibold tabular-nums", d.statut === V ? "text-ok" : d.statut === R ? "text-ko" : "text-muted")}>{pct(d.score)}</div><div className="font-mono text-[10px] text-muted">{d.nbEval}/4 évaluées</div></div>
                  <StatusBadge statut={d.statut} />
                </div>
              </div>
              {d.items.map((it) => <CompRow key={it.id} item={it} modules={active.modules} onSet={(en) => setComp(it.id, en)} />)}
              {d.statut === R && (
                <div className="border-t border-ko/40 bg-ko/10 px-4 py-3">
                  <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ko"><AlertTriangle size={14} />Domaine à revoir · points à retravailler</div>
                  <ul className="flex flex-col gap-1 text-[13px] text-ink">
                    {d.aRetravailler.map((i) => <li key={i.id}><span className="font-mono text-ko">{i.id}</span> {i.label} <span className="text-muted">→ revoir {i.mods.map((x) => MOD[x].code).join(" / ")}</span></li>)}
                    {!d.aRetravailler.length && <li className="text-muted">La moyenne du domaine est sous 85 % : renforcer les critères les plus faibles.</li>}
                  </ul>
                </div>
              )}
              {d.nonEvalues.length > 0 && d.nbEval > 0 && (
                <div className="border-t border-line px-4 py-2 text-[12px] text-amber">Reste à évaluer : {d.nonEvalues.map((i) => i.id).join(", ")}</div>
              )}
            </section>
          ))}
        </div>

        <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-40 xl:self-start">
          <Panel className={cx("p-5", rem.modules.length || rem.comps.length ? "border-amber/50" : "border-ok/50")}>
            <div className="mb-3 flex items-center gap-2"><Target size={18} className="text-amber" /><h3 className="font-display text-xl font-semibold text-ink">Plan de remédiation</h3></div>
            {!rem.modules.length && !rem.comps.length && !rem.nonEval.length ? (
              <p className="flex items-center gap-2 text-[14px] text-ok"><CheckCircle2 size={16} />Aucun module ni compétence sous 85 %.</p>
            ) : (
              <div className="flex flex-col gap-4 text-[13px]">
                {rem.modules.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Modules à faire repasser</span>
                    {rem.modules.map((m) => (
                      <button type="button" key={m.id} onClick={() => onLaunchModule(m.id)} className="flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-2 text-left text-ink hover:border-sky/60">
                        <span className={cx("font-mono font-semibold", m.statut === R ? "text-ko" : "text-muted")}>{m.code}</span><span className="min-w-0 flex-1 truncate">{m.action}</span><ExternalLink size={13} className="text-muted" />
                      </button>
                    ))}
                  </div>
                )}
                {rem.comps.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Compétences sous 85 %</span>
                    {rem.comps.map((i) => (
                      <div key={i.id} className="flex gap-2"><span className={cx("w-7 shrink-0 font-mono font-semibold", i.critique ? "text-ko" : "text-amber")}>{i.id}</span><span className="text-ink">{i.label}{i.critique && <span className="ml-1 font-mono text-[10px] uppercase text-ko">· critique</span>}<span className="text-muted"> → {i.mods.map((x) => MOD[x].code).join(" / ")}</span></span></div>
                    ))}
                  </div>
                )}
                {rem.nonEval.length > 0 && <div className="text-[12px] text-muted">Non évaluées ({rem.nonEval.length}) : {rem.nonEval.map((i) => i.id).join(", ")}</div>}
              </div>
            )}
          </Panel>

          <Panel className={cx("p-5", calc.drapeau ? "border-ko" : "")}>
            <div className="mb-3 flex items-center gap-2"><Flag size={18} className="text-ko" /><h3 className="font-display text-lg font-semibold text-ink">Drapeau rouge sécurité des vols</h3></div>
            <label htmlFor="flag-on" className="flex items-center gap-2 text-[14px] text-ink">
              <input id="flag-on" type="checkbox" className="h-4 w-4 accent-ko" checked={!!active.drapeauSecurite?.actif}
                onChange={(e) => updateStagiaire(active.id, (s) => ({ ...s, drapeauSecurite: { ...s.drapeauSecurite, actif: e.target.checked } }))} />
              Lever un drapeau rouge manuel (bloque l'habilitation)
            </label>
            {active.drapeauSecurite?.actif && (
              <textarea id="flag-motif" rows={2} placeholder="Motif : ex. freinage absent sur biellette de commande rotor" value={active.drapeauSecurite.motif}
                onChange={(e) => updateStagiaire(active.id, (s) => ({ ...s, drapeauSecurite: { ...s.drapeauSecurite, motif: e.target.value } }))} className={cx(inputCls, "mt-3")} />
            )}
            {G.critiquesKO.length > 0 && <p className="mt-3 text-[12px] text-ko">Drapeau automatique : compétence(s) critique(s) {G.critiquesKO.map((c) => c.id).join(", ")} sous 85 %.</p>}
          </Panel>

          <Panel className="flex flex-col gap-4 p-5">
            <Field label="Commentaire formateur" id="g-com"><textarea id="g-com" rows={4} value={active.commentaireFormateur} onChange={(e) => updateStagiaire(active.id, (s) => ({ ...s, commentaireFormateur: e.target.value }))} className={inputCls} /></Field>
            <Field label="Points à revoir" id="g-par"><textarea id="g-par" rows={4} value={active.pointsARevoir} onChange={(e) => updateStagiaire(active.id, (s) => ({ ...s, pointsARevoir: e.target.value }))} className={inputCls} /></Field>
            <Btn onClick={() => updateStagiaire(active.id, (s) => ({ ...s, pointsARevoir: remediationTexte(s, calcStagiaire(s)) || "Aucun point sous 85 %." }))}><Copy size={15} />Insérer le plan de remédiation</Btn>
          </Panel>
        </aside>
      </div>

      <Modal open={autoAsk} onClose={() => setAutoAsk(false)} kicker="Auto-calcul" title="Calculer la grille depuis les scores des modules">
        <p className="text-[14px] leading-relaxed text-muted">Chaque compétence reçoit la moyenne des modules qui lui sont liés (ex. B2 ← M2). Les compétences dont aucun module lié n'est évalué restent « Non évalué ».</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Btn onClick={() => autoAll(true)}>Compléter les non évaluées</Btn>
          <Btn tone="primary" onClick={() => autoAll(false)}><Wand2 size={15} />Tout recalculer</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ============================================================
   ESPACE 4 : FICHE BILAN & ATTESTATION
   ============================================================ */
const ATT_CSS = `
.att{background:#fff;color:#14213a;font-family:Barlow,system-ui,sans-serif;font-size:13px;line-height:1.45;max-width:860px;margin:0 auto;padding:36px 40px;border-radius:6px}
.att *{box-sizing:border-box}
.att h1,.att h2{font-family:'Barlow Condensed','Arial Narrow',sans-serif;margin:0;color:#0b1220}
.att .mono{font-family:'JetBrains Mono',ui-monospace,Menlo,monospace}
.att-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:3px solid #0b1220;padding-bottom:14px}
.att-brand{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#4a5a78}
.att-ref{text-align:right;font-size:11px;color:#4a5a78}
.att h1{font-size:28px;line-height:1.1;margin-top:4px}
.att h2{font-size:16px;text-transform:uppercase;letter-spacing:.06em;margin:22px 0 8px;border-left:4px solid #1f6fd1;padding-left:8px}
.att-id{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 18px;margin-top:16px}
.att-id div span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#5d6b85}
.att-id div b{font-size:14px}
.att table{width:100%;border-collapse:collapse;font-size:12.5px}
.att th{background:#eef2f8;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#3a4a66;padding:7px 8px;border:1px solid #c9d3e3}
.att td{padding:7px 8px;border:1px solid #c9d3e3;vertical-align:top}
.att td.n{text-align:right;font-variant-numeric:tabular-nums;font-family:'JetBrains Mono',ui-monospace,monospace;white-space:nowrap}
.att .v{display:inline-block;padding:2px 7px;border-radius:4px;font-weight:700;font-size:11px;letter-spacing:.06em;font-family:'JetBrains Mono',ui-monospace,monospace;white-space:nowrap}
.att .v-ok{background:#dff6ec;color:#0b7a4b;border:1px solid #0b7a4b}
.att .v-ko{background:#fde5e7;color:#b3202f;border:1px solid #b3202f}
.att .v-na{background:#f1f3f7;color:#5d6b85;border:1px solid #b9c3d4}
.att-dec{margin-top:22px;border:3px solid;padding:16px 18px;border-radius:4px}
.att-dec.ok{border-color:#0b7a4b;background:#f0fbf6}
.att-dec.ko{border-color:#b3202f;background:#fff5f6}
.att-dec .t{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-size:24px;font-weight:700;letter-spacing:.02em}
.att-dec.ok .t{color:#0b7a4b}.att-dec.ko .t{color:#b3202f}
.att-dec ul{margin:8px 0 0;padding-left:18px}
.att-txt{border:1px solid #c9d3e3;border-radius:4px;padding:10px 12px;min-height:44px;white-space:pre-wrap}
.att-sign{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:22px}
.att-sign div{border:1px solid #9aa8c0;border-radius:4px;padding:10px 12px;height:120px;display:flex;flex-direction:column;justify-content:space-between}
.att-sign span{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#5d6b85}
.att-foot{margin-top:18px;font-size:10px;color:#6b7891;display:flex;justify-content:space-between;gap:12px;border-top:1px solid #c9d3e3;padding-top:8px}
@media (max-width:640px){.att{padding:22px 16px}.att-id{grid-template-columns:1fr 1fr}.att-sign{grid-template-columns:1fr}.att-top{flex-direction:column}.att-ref{text-align:left}}
@media print{@page{size:A4;margin:12mm}.att{padding:0;max-width:none;border-radius:0}.att-dec,.att table,.att-sign{break-inside:avoid}}
`;
const vClass = (st) => (st === V ? "v v-ok" : st === R ? "v v-ko" : "v v-na");

function Bilan({ active, calc, goto, offerFile, onLaunchModule }) {
  const ref = useRef(null);
  if (!active) return <EmptyState goto={goto} />;
  const ok = calc.statutGlobal === V;
  const rem = remediation(active, calc);
  const refDoc = `BIL-${active.matricule}-${today().replace(/-/g, "")}`;
  const download = () => {
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fiche bilan ${active.matricule} — ${active.prenom} ${active.nom}</title>`
      + `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@600;700&family=JetBrains+Mono:wght@400;700&display=swap">`
      + `<style>body{margin:0;background:#e9edf3;padding:24px 0}.pbtn{display:block;margin:0 auto 16px;padding:10px 18px;font:600 14px Barlow,system-ui,sans-serif;background:#1f6fd1;color:#fff;border:0;border-radius:6px;cursor:pointer}@media print{body{background:#fff;padding:0}.pbtn{display:none}}${ATT_CSS}</style></head><body>`
      + `<button class="pbtn" onclick="window.print()">Imprimer / Enregistrer en PDF</button>${ref.current.outerHTML}</body></html>`;
    offerFile(`fiche-bilan_${active.matricule}_${active.nom}.html`, html, "text/html");
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="no-print flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>Espace documentaire · Fiche bilan individuelle</Eyebrow>
          <h2 className="font-display text-3xl font-semibold text-ink">Attestation de fin de cursus</h2>
          <p className="max-w-2xl text-[13px] text-muted">Le fichier téléchargé s'ouvre dans votre navigateur avec un bouton « Imprimer / Enregistrer en PDF » au format A4.</p>
        </div>
        <Btn tone="primary" onClick={download}><Download size={15} />Télécharger la fiche imprimable (.html)</Btn>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-panel2 p-3 sm:p-6">
        <style>{ATT_CSS}</style>
        <div className="att" ref={ref}>
          <div className="att-top">
            <div>
              <div className="att-brand">Airbus Helicopters · Formation métier</div>
              <h1>Fiche bilan individuelle &amp; attestation</h1>
              <div style={{ marginTop: 4, color: "#3a4a66" }}>Cursus « Préparateur Méthodes Assemblage — Standard Airbus Helicopters »</div>
            </div>
            <div className="att-ref mono">Réf. {refDoc}<br />Édité le {new Date().toLocaleDateString("fr-FR")}<br />Seuil de validation : 85 %</div>
          </div>

          <div className="att-id">
            <div><span>Stagiaire</span><b>{active.prenom} {active.nom.toUpperCase()}</b></div>
            <div><span>Matricule</span><b className="mono">{active.matricule}</b></div>
            <div><span>Entreprise</span><b>{active.entreprise || "—"}</b></div>
            <div><span>Session</span><b>{active.session || "—"}</b></div>
            <div><span>Date d'entrée</span><b>{frDate(active.dateEntree)}</b></div>
            <div><span>Moyenne modules</span><b className="mono">{pct(calc.moyenne)}</b></div>
          </div>

          <h2>1. Résultats des modules</h2>
          <table>
            <thead><tr><th>Module</th><th>Intitulé</th><th>Score</th><th>Seuil requis</th><th>Tent.</th><th>Date</th><th>Verdict</th></tr></thead>
            <tbody>
              {calc.mods.map((m) => (
                <tr key={m.id}><td className="mono"><b>{m.code}</b></td><td>{m.titre}</td><td className="n">{pct(m.score)}</td><td className="n">85 %</td><td className="n">{m.tentatives}</td><td className="n">{frDate(m.datePassage)}</td><td><span className={vClass(m.statut)}>{m.statut === N ? "NON ÉVALUÉ" : m.statut}</span></td></tr>
              ))}
            </tbody>
          </table>

          <h2>2. Grille d'évaluation formateur (20 compétences)</h2>
          <table>
            <thead><tr><th>Domaine</th><th>Intitulé</th><th>Critères évalués</th><th>Score</th><th>Verdict</th></tr></thead>
            <tbody>
              {calc.grille.domaines.map((d) => (
                <tr key={d.id}><td className="mono"><b>{d.id}</b></td><td>{d.titre}<div style={{ fontSize: 11, color: "#5d6b85" }}>{d.detail}</div></td><td className="n">{d.nbEval}/4</td><td className="n">{pct(d.score)}</td><td><span className={vClass(d.statut)}>{d.statut === N ? "NON ÉVALUÉ" : d.statut}</span></td></tr>
              ))}
              <tr><td colSpan={2}><b>Score global de grille</b></td><td className="n">{calc.grille.nbEval}/20</td><td className="n"><b>{pct(calc.grille.global)}</b></td><td><span className={vClass(calc.grille.complete ? calc.grille.statut : calc.grille.nbEval ? R : N)}>{calc.grille.complete ? calc.grille.statut : calc.grille.nbEval ? "À REVOIR" : "NON ÉVALUÉ"}</span></td></tr>
            </tbody>
          </table>

          <div className={cx("att-dec", ok ? "ok" : "ko")}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#5d6b85" }}>Décision finale</div>
            <div className="t">{ok ? "FORMATION VALIDÉE (Score ≥ 85 %)" : "FORMATION À REVOIR (Score < 85 % — Modules à repasser)"}</div>
            {ok ? (
              <div style={{ marginTop: 6 }}>Les 5 modules et la grille de compétences atteignent le seuil de 85 %, sans drapeau rouge sécurité. Le stagiaire est déclaré <b>VALIDE (HABILITÉ)</b> pour la fonction de Préparateur Méthodes Assemblage.</div>
            ) : (
              <ul>
                {calc.raisons.map((r, i) => <li key={i}>{r}</li>)}
                {rem.comps.length > 0 && <li>Compétences à retravailler : {rem.comps.map((i) => i.id).join(", ")}</li>}
              </ul>
            )}
          </div>

          <h2>3. Observations du formateur</h2>
          <div className="att-txt">{active.commentaireFormateur || "—"}</div>
          {(!ok || active.pointsARevoir) && (<><h2>4. Points à revoir</h2><div className="att-txt">{active.pointsARevoir || remediationTexte(active, calc) || "—"}</div></>)}

          <div className="att-sign">
            <div><span>Le formateur · nom, date et signature</span><span style={{ textTransform: "none", letterSpacing: 0 }}>Date : ____ / ____ / ________</span></div>
            <div><span>Le stagiaire · « lu et pris connaissance »</span><span style={{ textTransform: "none", letterSpacing: 0 }}>{active.prenom} {active.nom.toUpperCase()} · Date : ____ / ____ / ________</span></div>
          </div>
          <div className="att-foot mono"><span>Règle : score &lt; 85 % = À REVOIR · score ≥ 85 % = VALIDE</span><span>{refDoc}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   APPLICATION
   ============================================================ */
const TABS = ["portail", "promotion", "grille", "bilan"];
const readHash = () => { const h = (window.location.hash || "").replace("#", ""); return TABS.includes(h) ? h : "portail"; };

export default function PortailLMS({ db, setDBRaw, saved = true, onLaunchModule }) {
  const [tab, setTabState] = useState(readHash);
  const [fileOffer, setFileOffer] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const h = () => setTabState(readHash());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); }, [toast]);

  const setDB = useCallback((fn) => setDBRaw((d) => ({ ...fn(d), updatedAt: new Date().toISOString() })), []);
  const setTab = (t) => { setTabState(t); try { window.location.hash = t; } catch (e) { /* hash indisponible */ } window.scrollTo({ top: 0 }); };
  const active = db.stagiaires.find((s) => s.id === db.activeId) || db.stagiaires[0] || null;
  const calc = useMemo(() => (active ? calcStagiaire(active) : null), [active]);
  const setActive = (id) => setDB((d) => ({ ...d, activeId: id }));
  const updateStagiaire = useCallback((id, fn) => setDB((d) => ({ ...d, stagiaires: d.stagiaires.map((s) => (s.id === id ? normaliser(fn(s)) : s)) })), [setDB]);

  const offerFile = async (filename, content, mime) => {
    const dl = await getDownloads();
    if (dl) {
      try { await dl.save({ filename, data: new Blob([content], { type: mime }) }); setToast(`${filename} enregistré.`); return; }
      catch (e) {
        if (e?.code === "declined") { setToast("Téléchargement annulé."); return; }
        if (e?.code === "rate_limited") { setToast("Une demande de téléchargement est déjà ouverte. Réessayez dans un instant."); return; }
      }
    }
    /* Hors artifact Claude (GitHub Pages / Vercel) : téléchargement navigateur classique */
    try {
      const url = URL.createObjectURL(new Blob([content], { type: mime }));
      const a = document.createElement("a");
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setToast(`${filename} téléchargé.`);
      return;
    } catch (e) { /* repli : copier le texte */ }
    setFileOffer({ filename, content });
  };

  return (
    <div className="min-h-full bg-bg text-ink">
      <Header db={db} active={active} calc={calc} setActive={setActive} tab={tab} setTab={setTab} saved={saved} />
      <main className="mx-auto max-w-7xl py-6 gutter sm:py-8">
        {tab === "portail" && <Portail active={active} calc={calc} updateStagiaire={updateStagiaire} goto={setTab} onLaunchModule={onLaunchModule} />}
        {tab === "promotion" && <Promotion db={db} setDB={setDB} setActive={setActive} goto={setTab} offerFile={offerFile} />}
        {tab === "grille" && <Grille active={active} calc={calc} updateStagiaire={updateStagiaire} goto={setTab} />}
        {tab === "bilan" && <Bilan active={active} calc={calc} goto={setTab} offerFile={offerFile} onLaunchModule={onLaunchModule} />}
      </main>
      <footer className="no-print mx-auto max-w-7xl border-t border-line py-5 font-mono text-[11px] text-muted gutter">
        Règle unique : score &lt; 85 % = À REVOIR · score ≥ 85 % = VALIDE · habilitation = 5 modules ≥ 85 % + grille ≥ 85 % (20/20 évaluées) + aucun drapeau rouge sécurité. Profils de démonstration fictifs.
      </footer>
      <Modal open={!!fileOffer} onClose={() => setFileOffer(null)} kicker="Export" title={fileOffer?.filename || ""} wide>
        <p className="mb-3 text-[13px] text-muted">Le téléchargement direct n'est pas disponible dans cet affichage. Copiez le contenu ci-dessous et collez-le dans un fichier portant ce nom.</p>
        <textarea id="export-text" readOnly rows={12} value={fileOffer?.content || ""} className={cx(inputCls, "font-mono text-[11px]")} onFocus={(e) => e.target.select()} />
        <div className="mt-4 flex justify-end">
          <Btn tone="primary" onClick={() => {
            const ta = document.getElementById("export-text");
            navigator.clipboard?.writeText(fileOffer.content).then(() => setToast("Contenu copié."), () => { ta?.select(); setToast("Sélection faite : copiez avec Ctrl+C."); });
            if (!navigator.clipboard) ta?.select();
          }}><Copy size={15} />Copier le contenu</Btn>
        </div>
      </Modal>
      {toast && (
        <div role="status" className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-line bg-panel px-4 py-2.5 text-[13px] text-ink shadow-2xl" style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}>{toast}</div>
      )}
    </div>
  );
}

/* Exports utilisés par App.jsx (state global + pont des scores) */
export { DB_KEY, SEUIL, V, R, N, MODULES, MOD, loadDB, saveDB, normaliser, statutDe, today, pct };
