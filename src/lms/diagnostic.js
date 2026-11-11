/* ============================================================
   DIAGNOSTIC RECRUTEUR — calculé automatiquement à partir de
   l'historique réel des réponses (ateliers + sprints notés).
   Forces / lacunes par domaine A–E, erreurs sécurité des vols,
   tentatives, durée des sprints et chronologie.
   Règle unique : < 85 % = À REVOIR · ≥ 85 % = VALIDE.
   ============================================================ */
import { DOMAINES, MODULES, SEUIL, isNum, statutDe } from "./db.js";

const fold = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* Domaine = celui du module (M1→A, M2→B, M3→C, M4A→D, M4B→E), sauf question
   sécurité des vols (ATA 67, pièce critique, double contrôle) rattachée au domaine E */
const DOM_MOD = { mod1: "A", mod2: "B", mod3: "C", mod4a: "D", mod4b: "E" };
const RE_E = /ata ?67|commandes? de vol|servocommande|biellette|double controle|inspection independante|piece critique|securite des vols/;

/* Thèmes sécurité des vols : une erreur sur l'un d'eux est un drapeau rouge automatique */
export const THEMES_SECU = [
  { id: "ata67", label: "Commandes de vol ATA 67 / pièces critiques", re: /ata ?67|commande[s]? de vol|servocommande|piece critique|biellette/ },
  { id: "freinage", label: "Freinage, goupille, couple de serrage", re: /freinage|frein|goupille|fil a freiner|couple|running torque|autofrein|creneau/ },
  { id: "fod", label: "FOD (corps étrangers, comptage des protections)", re: /\bfod\b|corps etranger|protections? temporaire|comptage|outil oublie/ },
  { id: "metal", label: "Métallisation / continuité électrique", re: /metallisation|bonding|continuite|m(ω|ohm|Ω)|foudre/ },
  { id: "peremption", label: "Péremption, pot life, shelf life", re: /peremption|pot life|shelf life|duree de vie|perime/ },
  { id: "controle", label: "Hold point, double contrôle, traçabilité", re: /double controle|hold point|inspection independante|tracabilite|n° de lot|numero de lot|n° de serie|numero de serie|etalonnage|autocontrole/ },
  { id: "litige", label: "Écart non déclaré, QN, dérogation", re: /\bqn\b|non-conformite|derogation|use as is|en l'etat|concession|ecart/ },
];

const textOf = (h, a) => fold(`${a?.q || ""} ${a?.tag || ""} ${a?.detail || ""} ${h.label || ""} ${h.atelierId || ""}`);
const domaineDe = (h, a) => (RE_E.test(textOf(h, a)) ? "E" : DOM_MOD[h.moduleId] || "A");

const fmtDuree = (ms) => {
  if (!isNum(ms) || ms <= 0) return "—";
  const m = Math.round(ms / 60000);
  if (m < 1) return "< 1 min";
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
};
export { fmtDuree };
/** Intitulé court pour les listes (les énoncés de cas pratiques sont longs) */
export const court = (q, n = 110) => { const t = String(q || "").replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s\S*$/, "") + " …" : t; };

export function diagnostic(s) {
  const hist = [...(s.historique || [])].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const dom = Object.fromEntries(DOMAINES.map((d) => [d.id, { id: d.id, titre: d.titre, n: 0, ok: 0, erreurs: [] }]));
  const alertes = [];
  let nbReponses = 0;

  hist.forEach((h) => {
    if (h.kind === "debut") return;
    const answers = Array.isArray(h.answers) ? h.answers : [];
    answers.forEach((a) => {
      nbReponses += 1;
      const d = dom[domaineDe(h, a)];
      d.n += 1;
      if (a.ok) { d.ok += 1; return; }
      d.erreurs.push({ q: a.q, module: h.moduleId, date: h.date });
      const t = textOf(h, a);
      const grave = /erreur grave/.test(t);
      const th = THEMES_SECU.find((x) => x.re.test(t));
      if (th || grave) alertes.push({ theme: th ? th.label : "Erreur grave (simulateur H160)", themeId: th ? th.id : "grave", q: a.q, choix: a.choix, bonne: a.bonne, module: h.moduleId, date: h.date, note: h.kind === "sprint" });
    });
  });

  const domaines = Object.values(dom).map((d) => {
    const taux = d.n ? (d.ok / d.n) * 100 : null;
    return { ...d, taux, statut: statutDe(taux) };
  });
  const forces = domaines.filter((d) => d.n >= 5 && d.taux >= SEUIL).sort((a, b) => b.taux - a.taux);
  const lacunes = domaines.filter((d) => d.n > 0 && d.taux < SEUIL).sort((a, b) => a.taux - b.taux);
  const nonCouverts = domaines.filter((d) => d.n === 0);

  /* Alertes regroupées par thème (les erreurs en sprint noté pèsent plus qu'en atelier d'entraînement) */
  const parTheme = {};
  alertes.forEach((a) => { (parTheme[a.themeId] = parTheme[a.themeId] || { label: a.theme, n: 0, notees: 0, ex: [] }); const g = parTheme[a.themeId]; g.n += 1; if (a.note) g.notees += 1; if (g.ex.length < 3) g.ex.push(a); });
  const themes = Object.values(parTheme).sort((a, b) => b.notees - a.notees || b.n - a.n);

  /* Durée des sprints : « debut » apparié au sprint suivant du même module */
  const sprints = [];
  MODULES.forEach((m) => {
    let start = null;
    hist.filter((h) => h.moduleId === m.id).forEach((h) => {
      if (h.kind === "debut") start = h.date;
      else if (h.kind === "sprint") {
        const ms = start ? new Date(h.date) - new Date(start) : null;
        sprints.push({ module: m.code, date: h.date, score: h.score, statut: statutDe(h.score), duree: ms && ms < 6 * 3600e3 ? ms : null });
        start = null;
      }
    });
  });

  const dates = hist.map((h) => h.date).filter(Boolean);
  const jours = new Set(dates.map((d) => String(d).slice(0, 10)));
  const ateliers = hist.filter((h) => h.kind === "atelier");
  return {
    nbReponses, domaines, forces, lacunes, nonCouverts, alertes, themes,
    sprints, nbSprints: sprints.length, sprintsKO: sprints.filter((x) => x.statut !== "VALIDE").length,
    ateliers: ateliers.length, ateliersOK: ateliers.filter((h) => isNum(h.score) && h.score >= SEUIL).length,
    premiere: dates[0] || "", derniere: dates[dates.length - 1] || "", joursActifs: jours.size,
    dureeSprints: sprints.reduce((t, x) => t + (x.duree || 0), 0),
  };
}
