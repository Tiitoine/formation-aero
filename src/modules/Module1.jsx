import React, { useState, useEffect, useMemo } from "react";
import BackToPortal from "../lms/BackToPortal.jsx";
import Cutaway from "./m1/Cutaway.jsx";
import NormesTables from "./m1/NormesTables.jsx";
import RotorSim from "./m1/RotorLab.jsx";
import Freinages from "./m1/Freinages.jsx";
import MasticPR from "./m1/MasticPR.jsx";
import { scopedKey } from "../lms/session.js";
import { shuffle, shuffleSpread, permutation, useAtelier, AtelierCounter, AtelierResult, LockRule, LockChip, OptionButton, optState, LETTERS, LockedQuickCheck, SprintQCM, useModuleSession } from "../lib/pedago.jsx";
import {
  Plane, Wind, Gauge, Compass, Layers, Map as MapIcon, Wrench, ShieldCheck, ShieldAlert,
  CheckCircle2, XCircle, Flame, Trophy, RotateCcw, ChevronRight, ChevronDown, Crosshair,
  Target, BookOpen, Zap, Lock, Cable, Fuel, Droplets, Cog, AlertTriangle, Info,
  ClipboardList, FileText, Ruler, Award, ArrowRight, Eye, Fan, Box,
} from "lucide-react";

/* ============================================================
   UTILITAIRES
   ============================================================ */
const STORAGE_KEY = "prep-methodes-ah-m1-v2";
const loadProgress = () => {
  try {
    const raw = window.localStorage.getItem(scopedKey(STORAGE_KEY));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};
const saveProgress = (p) => {
  try {
    window.localStorage.setItem(scopedKey(STORAGE_KEY), JSON.stringify(p));
  } catch (e) {
    /* stockage indisponible : la progression reste en mémoire */
  }
};
const cx = (...c) => c.filter(Boolean).join(" ");
const fmt = (n) => (n > 0 ? "+" : "") + n.toLocaleString("fr-FR");

/* ============================================================
   BRIQUES D'INTERFACE
   ============================================================ */
function Panel({ children, className = "" }) {
  return <div className={cx("rounded-xl border border-line bg-panel", className)}>{children}</div>;
}

function Eyebrow({ children, tone = "blue" }) {
  const tones = { blue: "text-sky", amber: "text-amber", green: "text-ok", red: "text-ko" };
  return <div className={cx("font-mono text-[11px] uppercase tracking-[0.14em]", tones[tone])}>{children}</div>;
}

function SectionHead({ icon: Icon, kicker, title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-sky" />}
        <Eyebrow>{kicker}</Eyebrow>
      </div>
      <h2 className="font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl" style={{ textWrap: "balance" }}>{title}</h2>
      {children && <p className="max-w-3xl text-[15px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

function ImpactBox({ title, children }) {
  return (
    <div className="rounded-xl border border-amber/40 bg-amber/10 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Wrench size={16} className="text-amber" />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber">Impact préparateur assemblage</span>
      </div>
      <div className="font-display text-lg font-semibold text-ink">{title}</div>
      <div className="mt-1 text-[14px] leading-relaxed text-ink/85">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children, tone = "blue", disabled }) {
  const on = {
    blue: "border-sky bg-sky/15 text-ink",
    amber: "border-amber bg-amber/15 text-ink",
    green: "border-ok bg-ok/15 text-ink",
    red: "border-ko bg-ko/15 text-ink",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "rounded-lg border px-3 py-2 text-left text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
        active ? on[tone] : "border-line bg-panel2 text-ink/80 hover:border-sky/60 hover:text-ink",
        disabled && "cursor-default opacity-90"
      )}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ onClick, children, disabled, tone = "blue" }) {
  const t = tone === "green" ? "bg-ok text-bg hover:bg-ok/90" : tone === "amber" ? "bg-amber text-bg hover:bg-amber/90" : "bg-sky text-bg hover:bg-sky/90";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink",
        disabled ? "cursor-not-allowed bg-line text-muted" : t
      )}
    >
      {children}
    </button>
  );
}

function ValidatedBanner({ done, label }) {
  if (!done) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ok/50 bg-ok/10 px-4 py-3 text-sm text-ink">
      <ShieldCheck size={18} className="text-ok" />
      <span><strong className="font-semibold">Module validé.</strong> {label}</span>
    </div>
  );
}

/* QCM court réutilisable pour valider un onglet */
/* Contrôle de fin d'onglet : 1er clic verrouillé, questions et propositions mélangées, validation ≥ 85 % */
function QuickCheck(props) {
  return <LockedQuickCheck {...props} />;
}




/* ============================================================
   SILHOUETTE HÉLICOPTÈRE PARTAGÉE (type H145 / H160, cotes en mm)
   X0 en avant du nez · X vers le Fenestron · Z de la barque vers la tête rotor
   ============================================================ */
const HX = 14000, HY = 2000, HZ = 4000;
const C = { base: "#1d2a45", body: "#24365a", stroke: "#5b7299", hl: "#2b5c99", hlStroke: "#3b9eff" };

function HeliSide({ sx, sz, hl = [], overlay = [] }) {
  const f = (k, d = C.base) => (hl.includes(k) ? C.hl : d);
  const s = (k) => (hl.includes(k) ? C.hlStroke : C.stroke);
  return (
    <g>
      {/* pales rotor principal */}
      <line x1={sx(-2000)} y1={sz(3350)} x2={sx(9000)} y2={sz(3350)} stroke={hl.includes("rotor") ? C.hlStroke : "#3b9eff"} strokeOpacity={hl.includes("rotor") ? 1 : 0.6} strokeWidth="3" />
      {/* mât et tête */}
      <rect x={sx(3350)} y={sz(3300)} width={sx(3650) - sx(3350)} height={sz(3000) - sz(3300)} fill={f("rotor")} stroke={s("rotor")} />
      <ellipse cx={sx(3500)} cy={sz(3330)} rx={sx(4100) - sx(3500)} ry="5" fill={f("rotor", "#2f4570")} stroke={s("rotor")} />
      {/* BTP sur plancher mécanique */}
      <rect x={sx(2800)} y={sz(3000)} width={sx(4600) - sx(2800)} height={sz(2300) - sz(3000)} rx="4" fill={f("pm")} stroke={s("pm")} />
      {/* turbomoteurs */}
      <rect x={sx(4600)} y={sz(2900)} width={sx(6600) - sx(4600)} height={sz(2300) - sz(2900)} rx="6" fill={f("eng")} stroke={s("eng")} />
      {/* dérive + Fenestron */}
      <polygon points={`${sx(11800)},${sz(1500)} ${sx(13200)},${sz(1600)} ${sx(13300)},${sz(3800)} ${sx(12700)},${sz(3800)} ${sx(11800)},${sz(2450)}`} fill={f("fen")} stroke={s("fen")} />
      <circle cx={sx(12450)} cy={sz(2200)} r={(sx(12950) - sx(12450))} fill="#0b1220" stroke={hl.includes("fen") ? C.hlStroke : "#ffb020"} strokeWidth="1.5" />
      {/* poutre de queue */}
      <polygon points={`${sx(6200)},${sz(1500)} ${sx(11800)},${sz(1900)} ${sx(11800)},${sz(2350)} ${sx(6200)},${sz(2450)}`} fill={f("boom", C.body)} stroke={s("boom")} />
      <rect x={sx(10200)} y={sz(2100)} width={sx(10800) - sx(10200)} height={sz(1950) - sz(2100)} fill={f("boom")} stroke={s("boom")} />
      {/* cabine + barque */}
      <path d={`M${sx(500)},${sz(1400)} C${sx(500)},${sz(2100)} ${sx(1400)},${sz(2300)} ${sx(2600)},${sz(2300)} L${sx(6200)},${sz(2300)} L${sx(6200)},${sz(1000)} L${sx(900)},${sz(1000)} C${sx(650)},${sz(1050)} ${sx(500)},${sz(1200)} ${sx(500)},${sz(1400)} Z`} fill={f("cabine", C.body)} stroke={s("cabine")} />
      <path d={`M${sx(900)},${sz(1000)} L${sx(6200)},${sz(1000)} L${sx(6200)},${sz(600)} L${sx(1600)},${sz(600)} C${sx(1200)},${sz(650)} ${sx(950)},${sz(800)} ${sx(900)},${sz(1000)} Z`} fill={f("barque")} stroke={s("barque")} />
      {/* verrière */}
      <path d={`M${sx(650)},${sz(1450)} C${sx(700)},${sz(2000)} ${sx(1400)},${sz(2200)} ${sx(2400)},${sz(2200)} L${sx(2400)},${sz(1450)} Z`} fill="#17304f" stroke={C.stroke} strokeOpacity="0.7" />
      {/* plancher mécanique */}
      <line x1={sx(2600)} y1={sz(2300)} x2={sx(6600)} y2={sz(2300)} stroke={hl.includes("pm") ? C.hlStroke : "#8fa0bd"} strokeWidth={hl.includes("pm") ? 4 : 2} />
      {/* patins */}
      <line x1={sx(1200)} y1={sz(150)} x2={sx(5800)} y2={sz(150)} stroke={hl.includes("skid") ? C.hlStroke : C.stroke} strokeWidth="3" />
      <line x1={sx(2200)} y1={sz(150)} x2={sx(2400)} y2={sz(600)} stroke={C.stroke} strokeWidth="2" />
      <line x1={sx(4800)} y1={sz(150)} x2={sx(4600)} y2={sz(600)} stroke={C.stroke} strokeWidth="2" />
      {/* surcouches structurales */}
      {overlay.includes("couples") && [1500, 2600, 3500, 5200, 6200, 7400, 8600, 9800, 11000].map((x) => (
        <line key={"c" + x} x1={sx(x)} y1={sz(x < 6200 ? 650 : 1550 + (x - 6200) * 0.07)} x2={sx(x)} y2={sz(x < 6200 ? 2300 : 2440 - (x - 6200) * 0.016)} stroke="#3ddc97" strokeWidth="1.5" strokeDasharray="4 3" />
      ))}
      {overlay.includes("lisses") && [1300, 1700, 2100].map((z) => (
        <line key={"l" + z} x1={sx(z === 2100 ? 2400 : 1000)} y1={sz(z)} x2={sx(6200)} y2={sz(z)} stroke="#ffb020" strokeWidth="1.2" strokeDasharray="6 3" />
      ))}
      {overlay.includes("lisses") && [1750, 2150].map((z) => (
        <line key={"lb" + z} x1={sx(6200)} y1={sz(z)} x2={sx(11800)} y2={sz(z + (z === 1750 ? 250 : 120))} stroke="#ffb020" strokeWidth="1.2" strokeDasharray="6 3" />
      ))}
      {overlay.includes("anneaux") && [2900, 4500].map((x) => (
        <g key={"a" + x}>
          <line x1={sx(x)} y1={sz(650)} x2={sx(x)} y2={sz(2300)} stroke="#ff5d6c" strokeWidth="4" />
          <line x1={sx(x)} y1={sz(2300)} x2={sx(3500)} y2={sz(2950)} stroke="#ff5d6c" strokeWidth="2" />
        </g>
      ))}
    </g>
  );
}

function HeliTop({ sx, sy, hl = [] }) {
  const f = (k, d = C.base) => (hl.includes(k) ? C.hl : d);
  const s = (k) => (hl.includes(k) ? C.hlStroke : C.stroke);
  return (
    <g>
      <circle cx={sx(3500)} cy={sy(0)} r={Math.abs(sx(5500) - sx(0))} fill="none" stroke="#3b9eff" strokeOpacity={hl.includes("rotor") ? 0.9 : 0.3} strokeDasharray="5 5" />
      {/* patins */}
      <rect x={sx(1200)} y={sy(1400)} width={sx(5800) - sx(1200)} height={sy(1000) - sy(1400)} fill={f("700")} stroke={s("700")} />
      <rect x={sx(1200)} y={sy(-1000)} width={sx(5800) - sx(1200)} height={sy(-1400) - sy(-1000)} fill={f("700")} stroke={s("700")} />
      {/* stabilisateur + poutre + dérive */}
      <rect x={sx(10200)} y={sy(1600)} width={sx(10800) - sx(10200)} height={sy(-1600) - sy(1600)} fill={f("300")} stroke={s("300")} />
      <polygon points={`${sx(6200)},${sy(400)} ${sx(11800)},${sy(250)} ${sx(11800)},${sy(-250)} ${sx(6200)},${sy(-400)}`} fill={f("300", C.body)} stroke={s("300")} />
      <rect x={sx(11800)} y={sy(250)} width={sx(13200) - sx(11800)} height={sy(-250) - sy(250)} fill={f("fen")} stroke={s("fen")} />
      {/* cabine */}
      <path d={`M${sx(500)},${sy(0)} C${sx(500)},${sy(900)} ${sx(1400)},${sy(1100)} ${sx(2400)},${sy(1100)} L${sx(6200)},${sy(1100)} L${sx(6200)},${sy(-1100)} L${sx(2400)},${sy(-1100)} C${sx(1400)},${sy(-1100)} ${sx(500)},${sy(-900)} ${sx(500)},${sy(0)} Z`} fill={f("cab", C.body)} stroke={s("cab")} />
      {/* portes latérales */}
      <rect x={sx(2700)} y={sy(1150)} width={sx(4700) - sx(2700)} height="5" fill={f("800", "#5b7299")} />
      <rect x={sx(2700)} y={sy(-1150) - 5} width={sx(4700) - sx(2700)} height="5" fill={f("800", "#5b7299")} />
      {/* BTP et moteurs */}
      <rect x={sx(2800)} y={sy(700)} width={sx(4600) - sx(2800)} height={sy(-700) - sy(700)} rx="4" fill={f("pm", "#2f4570")} stroke={s("pm")} />
      <rect x={sx(4600)} y={sy(900)} width={sx(6600) - sx(4600)} height={sy(100) - sy(900)} rx="5" fill={f("400")} stroke={s("400")} />
      <rect x={sx(4600)} y={sy(-100)} width={sx(6600) - sx(4600)} height={sy(-900) - sy(-100)} rx="5" fill={f("400")} stroke={s("400")} />
      <circle cx={sx(3500)} cy={sy(0)} r="5" fill={hl.includes("rotor") ? "#3b9eff" : "#8fa0bd"} />
    </g>
  );
}

/* ============================================================
   ONGLET 1 : MÉCANIQUE DU VOL HÉLICOPTÈRE
   ============================================================ */
const COMMANDES = [
  { name: "Manche cyclique", effet: "Incline le plateau cyclique, donc le disque rotor : l'hélico translate dans la direction voulue.", chaine: "Manche → timonerie (bielles, guignols) → servocommandes hydrauliques → plateau cyclique" },
  { name: "Levier de pas collectif", effet: "Change en même temps le pas de toutes les pales : l'hélico monte ou descend.", chaine: "Levier → timonerie → servocommandes → plateau cyclique (translation verticale)" },
  { name: "Palonniers", effet: "Font varier le pas des pales du rotor arrière ou du Fenestron : contrôle du lacet et compensation du couple.", chaine: "Palonniers → timonerie ou câbles → servocommande arrière → pas des pales anticouple" },
];



function TabFlight({ done, onComplete }) {
  const [cmd, setCmd] = useState(0);
  const [avion, setAvion] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Fan} kicker="Onglet 1 · Mécanique du vol hélicoptère" title="Ce qui rend l'hélicoptère si exigeant à assembler">
        Voilure tournante, vibrations permanentes et aucune pressurisation : ces trois faits pilotent chaque ligne de ta gamme. Commence par manipuler le rotor.
      </SectionHead>

      <RotorSim />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Panel className="p-5">
          <div className="mb-3 flex items-center gap-2"><Gauge size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Les 3 commandes du pilote</h3></div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {COMMANDES.map((c, i) => (
              <Chip key={c.name} active={cmd === i} onClick={() => setCmd(i)}>
                <span className="font-display text-[15px] font-semibold leading-tight">{c.name}</span>
              </Chip>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-bg p-4">
            <p className="text-[14px] leading-relaxed text-ink/90">{COMMANDES[cmd].effet}</p>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted">Chaîne de commande</div>
            <div className="mt-1 font-mono text-[12px] leading-relaxed text-sky">{COMMANDES[cmd].chaine}</div>
          </div>
          <div className="mt-3 rounded-lg border border-ko/40 bg-ko/10 p-3 text-[13px] leading-relaxed text-ink">
            <strong className="text-ko">Piège : </strong>sur hélicoptère, toute cette timonerie relève de l'<strong>ATA 67</strong> (commandes de vol rotors), pas de l'ATA 27 comme sur avion. Double contrôle croisé obligatoire.
          </div>
        </Panel>
        <div className="flex flex-col gap-3">
          <Panel className="p-5">
            <div className="mb-2 flex items-center gap-2"><Wind size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Fenestron ou rotor arrière classique</h3></div>
            <p className="text-[14px] leading-relaxed text-ink/90">
              Le Fenestron est un rotor anticouple caréné dans la dérive. Ses pales sont à <strong>espacement irrégulier</strong> : le bruit se répartit sur plusieurs fréquences au lieu de se concentrer sur une seule.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
              <div className="rounded-lg border border-line bg-bg p-2"><div className="font-mono text-[10px] uppercase text-amber">Fenestron</div>H135 · H145 · H160</div>
              <div className="rounded-lg border border-line bg-bg p-2"><div className="font-mono text-[10px] uppercase text-amber">Rotor arrière</div>H125 · H175 · Super Puma</div>
            </div>
          </Panel>
          <Panel className="p-4">
            <div className="flex items-start gap-3">
              <Info size={18} className="mt-0.5 shrink-0 text-amber" />
              <p className="text-[13px] leading-relaxed text-ink/90">
                <strong className="text-amber">Rappel bonus.</strong> Sur hélicoptère Airbus, le commandant de bord est assis à <strong>droite</strong>. La gauche et la droite géométriques de l'appareil ne changent pas : elles se lisent toujours assis dans un siège pilote, regard vers l'avant (−Y à gauche, +Y à droite).
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <ImpactBox title="Environnement vibratoire extrême = freinage mécanique partout">
        Le rotor génère des vibrations permanentes qui desserrent toute fixation non freinée et accélèrent la fatigue de la structure. Chaque fixation de la gamme doit avoir son moyen de freinage défini, selon les instructions EI et l'ATA 20. Sélectionne chaque moyen pour ouvrir sa fiche :
      </ImpactBox>
      <Freinages />

      <ImpactBox title="Pas de pressurisation : alors à quoi sert le mastic PR ?">
        Un hélicoptère n'est <strong>pas pressurisé</strong>. Le PR reste partout dans tes gammes, mais pour quatre autres raisons :
      </ImpactBox>
      <MasticPR />

      <Panel className="p-4">
        <button type="button" onClick={() => setAvion(!avion)} className="flex w-full items-center gap-2 text-left">
          <Plane size={16} className="text-muted" />
          <span className="font-display text-base font-semibold text-muted">Repère avion, pour comparaison</span>
          {avion ? <ChevronDown size={14} className="ml-auto text-muted" /> : <ChevronRight size={14} className="ml-auto text-muted" />}
        </button>
        {avion && (
          <div className="mt-3 grid gap-2 text-[13px] leading-relaxed text-ink/85 md:grid-cols-3">
            <div className="rounded-lg border border-line bg-bg p-3">Voilure fixe : portance, poids, traction, traînée. Gouvernes : ailerons (roulis), profondeur (tangage), direction (lacet).</div>
            <div className="rounded-lg border border-line bg-bg p-3">Cabine pressurisée : le PR y sert d'abord à l'étanchéité de pressurisation, avec un affleurement strict des rivets fraisés.</div>
            <div className="rounded-lg border border-line bg-bg p-3">Commandes de vol avion : ATA 27. Sur hélicoptère : ATA 67.</div>
          </div>
        )}
      </Panel>

      <ValidatedBanner done={done} label="Mécanique du vol hélicoptère et contraintes d'assemblage acquises." />
      <QuickCheck
        title="Contrôle de fin d'onglet"
        onComplete={onComplete}
        questions={[
          {
            q: "H145 en stationnaire, essai au point fixe. Le pilote veut translater vers l'avant. Quelle commande incline le disque rotor ?",
            options: ["Le manche cyclique, via le plateau cyclique", "Le levier de pas collectif, via les servos", "Les palonniers, via la commande du Fenestron", "La manette de régulation moteur du poste"],
            answer: 0,
            why: "Le cyclique incline le plateau cyclique : le pas de chaque pale varie selon sa position sur le tour et le disque s'incline dans la direction voulue.",
            hint: "Le collectif agit sur toutes les pales en même temps : il fait monter ou descendre.",
          },
          {
            q: "H160 (non pressurisé), jonction cadre aluminium / panneau carbone. Pourquoi la gamme impose-t-elle une interposition de PR à cette jonction ?",
            options: ["Pour isoler les deux matériaux contre la corrosion galvanique", "Pour assurer l'étanchéité de pressurisation de la cabine", "Pour remplacer une partie des fixations par du collage", "Pour amortir les vibrations transmises par le rotor"],
            answer: 0,
            why: "L'aluminium au contact du carbone se corrode par effet galvanique. Le mastic interposé isole électriquement les deux matériaux.",
            hint: "Il n'y a pas de pressurisation sur cet appareil. Pense aux matériaux en contact.",
          },
          {
            q: "H160, montage du Fenestron. Pourquoi les pales sont-elles réparties avec un espacement angulaire irrégulier ?",
            options: ["Pour étaler le bruit sur plusieurs fréquences", "Pour compenser le balourd de la pale de calage", "Pour laisser passer la commande de pas", "Pour réduire le nombre de pales nécessaires"],
            answer: 0,
            why: "Un espacement régulier concentre le bruit sur une fréquence. L'espacement irrégulier l'étale et le rend moins gênant.",
            hint: "C'est une question d'acoustique.",
          },
          {
            q: "H145 sur banc de commandes, cyclique au neutre. Le compagnon monte le levier de pas collectif. Que fait le plateau cyclique ?",
            options: ["Il monte parallèlement le long du mât, pas de toutes les pales accru", "Il s'incline vers l'avant, le pas des pales avant augmente", "Il descend le long du mât, le pas des pales diminue", "Il tourne autour du mât sans changer le pas des pales"],
            answer: 0,
            why: "Les 3 servocommandes poussent ensemble : le plateau coulisse sur sa rotule sans s'incliner, les biellettes montent et le pas de toutes les pales augmente de la même valeur.",
            hint: "Collectif = même action sur toutes les pales.",
          },
          {
            q: "H145 en stationnaire, le pilote pousse le manche cyclique vers l'avant. Dans quel sens le disque rotor s'incline-t-il ?",
            options: ["Vers le nez : la poussée s'incline vers l'avant", "Vers la queue : la poussée s'incline vers l'arrière", "Vers la droite : la poussée compense le couple", "Il reste horizontal : seul le fuselage s'incline"],
            answer: 0,
            why: "La poussée reste perpendiculaire au disque. Pour avancer, le disque s'incline vers le nez et la poussée gagne une composante horizontale vers l'avant.",
            hint: "La poussée est toujours perpendiculaire au disque.",
          },
          {
            q: "H160, bouchon de vidange de la BTP freiné au fil sur une patte du carter. Dans quel sens le fil doit-il tirer le bouchon ?",
            options: ["Dans le sens du serrage du bouchon", "Dans le sens du desserrage du bouchon", "Perpendiculairement à l'axe du bouchon", "Peu importe, si le fil reste bien tendu"],
            answer: 0,
            why: "Si le bouchon amorce un desserrage, le fil se met en traction et le ramène dans le sens du serrage. Posé à l'envers, il aiderait le desserrage.",
            hint: "Le fil doit s'opposer au desserrage.",
          },
          {
            q: "H145, fixation sur la cloison pare-feu du compartiment moteur. Quel écrou autofreiné la gamme doit-elle prescrire ?",
            options: ["Écrou autofreiné tout métal, adapté à la température", "Écrou à bague nylon, plus simple à contrôler", "Écrou standard avec frein filet anaérobie", "Écrou à bague nylon avec rondelle large"],
            answer: 0,
            why: "La bague nylon perd son freinage au-delà d'environ 120 °C. En zone chaude, seul l'écrou tout métal garde son couple de freinage.",
            hint: "Pense à la température de la zone.",
          },
        ]}
      />
    </div>
  );
}

/* ============================================================
   ONGLET 2 : SE REPÉRER DANS LA CELLULE
   ============================================================ */
const SECTIONS = [
  { id: "barque", hl: ["barque", "cabine"], name: "Barque / pointe avant", sub: "Cockpit & canopy", desc: "Structure vitrée (verrière), palonniers, manche cyclique, levier de pas collectif. En bas, la barque : structure inférieure qui reçoit souvent les réservoirs." },
  { id: "cabine", hl: ["cabine", "pm"], name: "Cabine / fuselage central", sub: "Entre barque et plancher mécanique", desc: "Délimitée par la barque en bas et le plancher mécanique en haut. Le plancher mécanique est la zone vitale de l'hélicoptère : il supporte la BTP et les moteurs." },
  { id: "boom", hl: ["boom", "fen"], name: "Poutre de queue", sub: "Tail boom", desc: "Structure travaillante, composite ou métallique à couples et lisses. Elle reprend les efforts de l'anticouple et se prolonge par la dérive et le Fenestron (ou le rotor arrière)." },
];
const STRUCT_ELEMS = [
  { id: "couples", name: "Couples / cadres", color: "text-ok", desc: "Positionnés en X (stations). Ils donnent la forme et reprennent les efforts transverses." },
  { id: "lisses", name: "Lisses", color: "text-amber", desc: "Raidisseurs longitudinaux positionnés en Y et Z. Ils stabilisent les panneaux de peau." },
  { id: "anneaux", name: "Anneaux principaux", color: "text-ko", desc: "Cadres renforcés qui reprennent les efforts des barres de suspension BTP, donc la portance du rotor." },
  { id: "pm", name: "Plancher mécanique", color: "text-sky", desc: "Toit de la cabine qui porte la BTP et les turbomoteurs. Il intègre des drains et des cloisons pare-feu." },
];

function CelluleExplorer() {
  const [sec, setSec] = useState("cabine");
  const [ov, setOv] = useState(["anneaux"]);
  const sx = (x) => 20 + (x / HX) * 480;
  const sz = (z) => 210 - (z / HZ) * 190;
  const S = SECTIONS.find((s) => s.id === sec);
  const toggle = (id) => setOv(ov.includes(id) ? ov.filter((o) => o !== id) : [...ov, id]);
  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-center gap-2"><Layers size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Découpage de la cellule (airframe)</h3></div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="rounded-lg border border-line bg-bg p-2">
            <svg viewBox="0 0 520 225" className="h-auto w-full" role="img" aria-label="Hélicoptère de profil avec découpage de la cellule">
              <text x="8" y="16" fill="#8fa0bd" fontSize="10" fontFamily="JetBrains Mono, monospace">Vue de côté gauche · nez à gauche</text>
              <HeliSide sx={sx} sz={sz} hl={[...S.hl, ...(ov.includes("pm") ? ["pm"] : [])]} overlay={ov} />
            </svg>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STRUCT_ELEMS.map((e) => (
              <Chip key={e.id} active={ov.includes(e.id)} onClick={() => toggle(e.id)}><span className={e.color}>■</span> {e.name}</Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {SECTIONS.map((s, i) => (
            <button key={s.id} type="button" onClick={() => setSec(s.id)} className={cx("flex flex-col gap-0.5 rounded-lg border p-3 text-left transition", sec === s.id ? "border-sky bg-sky/10" : "border-line bg-bg hover:border-sky/60")}>
              <div className="flex items-baseline gap-2"><span className="font-mono text-xs text-sky">{i + 1}</span><span className="font-display text-lg font-semibold text-ink">{s.name}</span></div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{s.sub}</span>
              {sec === s.id && <span className="mt-1 text-[13px] leading-relaxed text-ink/90">{s.desc}</span>}
            </button>
          ))}
          <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-bg p-3">
            {STRUCT_ELEMS.filter((e) => ov.includes(e.id)).map((e) => (
              <div key={e.id} className="text-[12px] leading-snug text-ink/85"><strong className={e.color}>{e.name} : </strong>{e.desc}</div>
            ))}
            {ov.length === 0 && <span className="text-[12px] text-muted">Active un élément structural pour le voir sur le profil.</span>}
          </div>
        </div>
      </div>
    </Panel>
  );
}

const STRUCT_ITEMS = [
  { name: "Plancher mécanique", cat: "primaire", why: "Il reçoit la BTP et les turbomoteurs : effort majeur, structure primaire." },
  { name: "Anneau principal (reprise des barres BTP)", cat: "primaire", why: "Il transmet la portance du rotor à la cellule : structure primaire." },
  { name: "Poutre de queue", cat: "primaire", why: "Structure travaillante qui reprend la poussée de l'anticouple." },
  { name: "Couple de barque", cat: "primaire", why: "Il fait partie de la structure inférieure qui reprend les efforts d'atterrissage et des réservoirs." },
  { name: "Capot de turbomoteur", cat: "secondaire", why: "Pièce d'accès et de profil aérodynamique, sans effort structural majeur." },
  { name: "Carénage de BTP", cat: "secondaire", why: "Il protège et profile, sans reprendre d'effort global." },
  { name: "Cloison d'habillage cabine", cat: "secondaire", why: "Aménagement intérieur, sans rôle dans la tenue globale." },
  { name: "Boîte de Transmission Principale (BTP)", cat: "critique", why: "Sa défaillance unique est catastrophique sans redondance possible : pièce critique, traçabilité totale." },
  { name: "Barre de suspension BTP", cat: "critique", why: "Elle porte l'hélicoptère suspendu à son rotor : pièce critique suivie unitairement." },
  { name: "Mât rotor", cat: "critique", why: "Il transmet couple et portance. Aucune redondance : pièce critique." },
  { name: "Moyeu rotor (Starflex / Spheriflex)", cat: "critique", why: "Rupture du moyeu = perte des pales. Pièce critique, traçabilité totale." },
];
const STRUCT_CATS = [
  { id: "primaire", label: "Primaire (PSE)" },
  { id: "secondaire", label: "Secondaire" },
  { id: "critique", label: "Pièce critique" },
];

function StructureSort({ onAllCorrect }) {
  const at = useAtelier({ id: "m1-tri-structure", label: "Atelier de tri : primaire / secondaire / pièce critique", total: STRUCT_ITEMS.length, onComplete: onAllCorrect });
  /* Fisher-Yates à chaque tirage, en évitant deux catégories identiques à la suite */
  const items = useMemo(() => shuffleSpread(STRUCT_ITEMS.map((it, i) => ({ ...it, _i: i })), (x) => x.cat), [at.draw]);
  const cats = useMemo(() => shuffle(STRUCT_CATS), [at.draw]);
  return (
    <Panel className="p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ShieldAlert size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Atelier de tri : classe chaque pièce</h3>
        <AtelierCounter at={at} />
      </div>
      <p className="mb-3 text-[13px] text-muted">Pour chaque pièce, un seul clic : la catégorie choisie est verrouillée. Une erreur reste affichée en rouge avec la correction et compte dans ton score. Validation à 85 % (10/11 minimum).</p>
      <LockRule className="mb-4" />
      <div className="flex flex-col gap-2">
        {items.map((it) => {
          const a = at.get(it._i);
          return (
            <div key={`${at.draw}-${it._i}`} className={cx("flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center", !a ? "border-line bg-bg" : a.ok ? "border-ok/50 bg-ok/5" : "border-ko/50 bg-ko/5")}>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-ink">{it.name}</div>
                {a && (
                  <div className={cx("text-[12px] leading-snug", a.ok ? "text-ok" : "text-ko")}>
                    {a.ok ? "Exact. " : `Faux : c'est « ${STRUCT_CATS.find((c) => c.id === it.cat).label} ». `}
                    <span className="text-ink/85">{it.why}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cats.map((c) => (
                  <LockChip key={c.id} state={optState(c.id, a?.k, it.cat)}
                    onClick={() => at.lock(it._i, { k: c.id, ok: c.id === it.cat, q: it.name, choix: c.label, bonne: STRUCT_CATS.find((x) => x.id === it.cat).label })}>
                    {c.label}
                  </LockChip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4"><AtelierResult at={at} /></div>
    </Panel>
  );
}

const ZONES = [
  { code: "100", hl: ["cab"], name: "Fuselage inférieur", detail: "Sur hélicoptère : la barque, sous le plancher cabine. Réservoirs carburant, structure inférieure." },
  { code: "200", hl: ["cab"], name: "Fuselage supérieur", detail: "Pointe avant (cockpit, verrière) et cabine, jusqu'au plancher mécanique." },
  { code: "300", hl: ["300", "fen"], name: "Arrière / poutre de queue", detail: "Poutre de queue, stabilisateur horizontal, dérive, Fenestron ou rotor arrière." },
  { code: "400", hl: ["400"], name: "Groupes motopropulseurs", detail: "Turbomoteurs (Arriel, Arrano, Makila…), capots, cloisons pare-feu." },
  { code: "500", hl: [], name: "Voilure gauche (avion)", detail: "Sans voilure fixe sur hélicoptère : vérifie l'affectation de ces numéros dans le zonage du manuel du type." },
  { code: "600", hl: [], name: "Voilure droite (avion)", detail: "Même remarque que 500. La logique impair = gauche, pair = droite reste valable partout." },
  { code: "700", hl: ["700"], name: "Atterrisseurs", detail: "Patins (H125, H145) ou train à roues (H160, H175, Super Puma)." },
  { code: "800", hl: ["800"], name: "Portes et trappes", detail: "Portes cabine coulissantes, portes pilote, trappes d'accès et capots ouvrants." },
];

function ZoneMap() {
  const [zone, setZone] = useState("200");
  const z = ZONES.find((x) => x.code === zone);
  const sx = (x) => 30 + (x / HX) * 460;
  const sy = (y) => 125 - (y / HY) * 100;
  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-center gap-2"><MapIcon size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Le zonage ATA 100 appliqué à l'hélicoptère</h3></div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 rounded-lg border border-line bg-bg p-2">
          <svg viewBox="0 0 520 250" className="h-auto w-full" role="img" aria-label="Hélicoptère vu de dessus avec zones">
            <text x="8" y="14" fill="#8fa0bd" fontSize="10" fontFamily="JetBrains Mono, monospace">Vu de dessus · nez à gauche</text>
            <text x="370" y="14" fill="#ffb020" fontSize="10" fontFamily="JetBrains Mono, monospace">+Y DROITE ↑</text>
            <text x="8" y="244" fill="#ffb020" fontSize="10" fontFamily="JetBrains Mono, monospace">↓ −Y GAUCHE</text>
            <HeliTop sx={sx} sy={sy} hl={z.hl} />
            {(zone === "100" || zone === "200") && <text x={sx(1650)} y={sy(0) + 4} fill="#e6edf7" fontSize="11" fontWeight="700" fontFamily="JetBrains Mono, monospace" textAnchor="middle">{zone === "100" ? "BARQUE" : "CABINE"}</text>}
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-1.5">
            {ZONES.map((x) => (
              <button key={x.code} type="button" onClick={() => setZone(x.code)} className={cx("rounded-lg border py-2 font-mono text-sm font-semibold transition", zone === x.code ? "border-sky bg-sky text-bg" : x.hl.length ? "border-line bg-bg text-ink hover:border-sky/60" : "border-line bg-bg text-muted hover:border-sky/60")}>{x.code}</button>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-bg p-4">
            <div className="font-mono text-3xl font-semibold text-sky">{z.code}</div>
            <div className="font-display text-xl font-semibold text-ink">{z.name}</div>
            <p className="mt-1 text-[14px] text-ink/85">{z.detail}</p>
          </div>
          <div className="rounded-lg border border-amber/40 bg-amber/10 p-3 text-[13px] leading-relaxed text-ink">
            <strong className="text-amber">Astuce préparateur.</strong> Dans une sous-zone, le dernier chiffre <strong>impair</strong> désigne la <strong>gauche</strong>, le <strong>pair</strong> la <strong>droite</strong> : 211 = gauche, 212 = droite (côté du commandant de bord sur hélico Airbus).
          </div>
        </div>
      </div>
    </Panel>
  );
}

function decodeZone(raw) {
  const s = (raw || "").trim();
  if (!/^\d{3}$/.test(s)) return null;
  const major = ZONES.find((z) => z.code === s[0] + "00");
  if (!major) return { error: "Zone majeure inconnue : le premier chiffre doit aller de 1 à 8." };
  let side;
  if (s[0] === "5") side = "Gauche (zone majeure impaire)";
  else if (s[0] === "6") side = "Droite (zone majeure paire)";
  else if (s[2] === "0") side = "Zone entière ou dans l'axe (dernier chiffre 0)";
  else side = Number(s[2]) % 2 === 1 ? "Gauche (dernier chiffre impair)" : "Droite (dernier chiffre pair)";
  return { major, side };
}

function SubzoneDecoder() {
  const [val, setVal] = useState("212");
  const r = decodeZone(val);
  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-center gap-2"><Crosshair size={18} className="text-sky" /><h3 className="font-display text-xl font-semibold text-ink">Décodeur express de zone</h3></div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-1">
          <label htmlFor="zone-input" className="font-mono text-[11px] uppercase tracking-wider text-muted">Zone de l'OF</label>
          <input id="zone-input" value={val} maxLength={3} inputMode="numeric" onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))} className="w-32 rounded-lg border border-line bg-bg px-3 py-2 font-mono text-2xl text-ink focus:border-sky focus:outline-none" />
          <div className="mt-1 flex flex-wrap gap-1">
            {["211", "212", "131", "412", "322"].map((z) => (
              <button key={z} type="button" onClick={() => setVal(z)} className="rounded border border-line px-2 py-0.5 font-mono text-xs text-muted hover:text-ink">{z}</button>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1 rounded-lg border border-line bg-bg p-4">
          {!r && <span className="text-sm text-muted">Saisis un code à 3 chiffres.</span>}
          {r && r.error && <span className="text-sm text-ko">{r.error}</span>}
          {r && !r.error && (
            <div className="flex flex-col gap-1">
              <div className="text-[14px] text-ink"><span className="font-mono text-muted">Partie : </span><strong>{r.major.code} · {r.major.name}</strong></div>
              <div className="text-[14px] text-ink"><span className="font-mono text-muted">Côté : </span><strong className="text-amber">{r.side}</strong></div>
              <div className="text-[12px] text-muted">Le côté se lit toujours assis dans un siège pilote, regard vers l'avant, quelle que soit la place du commandant de bord.</div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function TabLocate({ done, onComplete }) {
  const [axisOpen, setAxisOpen] = useState("X");
  const axes = [
    { id: "X", name: "Station · STA", dir: "Longitudinal : du nez vers le Fenestron", pos: "Couples / cadres (Frames, FR), anneaux principaux", note: "Le point zéro X0 est placé en avant du nez : toutes les stations restent positives jusqu'au Fenestron.", color: "text-sky" },
    { id: "Y", name: "Buttock Line · BL", dir: "Transversal : gauche / droite", pos: "Lisses (Stringers), longerons de plancher", note: "Règle d'or : gauche et droite se lisent assis dans un siège pilote, regard vers l'avant. −Y à gauche (impair), +Y à droite (pair). Le commandant de bord est à droite sur hélico Airbus, mais la géométrie ne change pas.", color: "text-amber" },
    { id: "Z", name: "Water Line · WL", dir: "Vertical : barque → cabine → plancher mécanique → tête rotor", pos: "Plancher cabine, plancher mécanique, BTP", note: "La WL te dit si tu travailles dans la barque (réservoirs), en cabine, sur le plancher mécanique ou au niveau de la tête rotor.", color: "text-ok" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Compass} kicker="Onglet 2 · Se repérer dans la cellule" title="Trièdre, structure et zonage d'un hélicoptère">
        Un OF ne te dit jamais « derrière la porte coulissante » : il donne des coordonnées, une zone et une classe de pièce. Apprends à les lire sur une cellule d'hélicoptère.
      </SectionHead>

      <div className="grid gap-3 md:grid-cols-3">
        {axes.map((a) => (
          <button key={a.id} type="button" onClick={() => setAxisOpen(a.id)} className={cx("flex flex-col gap-1 rounded-xl border p-4 text-left transition", axisOpen === a.id ? "border-sky bg-sky/10" : "border-line bg-panel hover:border-sky/60")}>
            <div className="flex items-baseline gap-2"><span className={cx("font-mono text-3xl font-bold", a.color)}>{a.id}</span><span className="font-display text-lg font-semibold text-ink">{a.name}</span></div>
            <div className="text-[13px] text-muted">{a.dir}</div>
            <div className="text-[13px] text-ink"><span className="text-muted">Positionne : </span>{a.pos}</div>
            {axisOpen === a.id && <div className={cx("mt-2 rounded-lg border border-line bg-bg p-2 text-[13px] leading-relaxed", a.id === "Y" ? "text-amber" : "text-ink/90")}>{a.note}</div>}
          </button>
        ))}
      </div>

      <Cutaway />

      <CelluleExplorer />

      <div className="grid gap-3 md:grid-cols-3">
        <Panel className="p-4">
          <div className="mb-1 flex items-center gap-2"><ShieldCheck size={16} className="text-sky" /><Eyebrow>Structure primaire (PSE)</Eyebrow></div>
          <p className="text-[14px] leading-relaxed text-ink/90">Reprend les efforts majeurs : plancher mécanique, anneaux principaux, poutre de queue, couples de barque. Souvent conçue <strong>fail-safe</strong> (chemins d'effort redondants).</p>
        </Panel>
        <Panel className="p-4">
          <div className="mb-1 flex items-center gap-2"><Box size={16} className="text-ok" /><Eyebrow tone="green">Structure secondaire</Eyebrow></div>
          <p className="text-[14px] leading-relaxed text-ink/90">Ne reprend pas les efforts majeurs : capots moteur, carénages de BTP, cloisons d'habillage.</p>
        </Panel>
        <Panel className="p-4">
          <div className="mb-1 flex items-center gap-2"><ShieldAlert size={16} className="text-ko" /><Eyebrow tone="red">Pièce critique</Eyebrow></div>
          <p className="text-[14px] leading-relaxed text-ink/90">Défaillance <strong>unique</strong> = issue catastrophique, sans redondance : BTP, barres de suspension, mât, moyeu, pales. <strong>Traçabilité totale</strong> dans la gamme.</p>
        </Panel>
      </div>
      <p className="-mt-3 text-[12px] text-muted">Classification de référence : exigences de conception et de production EASA Part-21.</p>

      <StructureSort onAllCorrect={onComplete} />
      <ValidatedBanner done={done} label="Tu sais classer une pièce et te repérer dans la cellule." />
      <ZoneMap />
      <SubzoneDecoder />
    </div>
  );
}

/* ============================================================
   ONGLET 3 : SYSTÈMES ATA, BNAE & STANDARDS AIRBUS HELICOPTERS
   ============================================================ */
const HELI_CHAPTERS = [
  { code: "62", name: "Rotor principal", icon: Fan, ops: ["Pales", "Moyeu rotor (Starflex, Spheriflex)", "Amortisseurs de traînée"], note: "Pièces critiques : traçabilité totale, serrages tracés." },
  { code: "63", name: "Entraînement rotor principal", icon: Cog, ops: ["BTP (MGB)", "Barres de suspension BTP, béquilles", "Plateau cyclique", "Mât rotor"], note: "Le cœur mécanique : chaque fixation est freinée et tracée." },
  { code: "64", name: "Rotor arrière / Fenestron", icon: Wind, ops: ["Rotor anticouple ou Fenestron", "Pales à espacement irrégulier (Fenestron)", "Moyeu arrière"], note: "Fenestron sur H135, H145, H160 ; rotor classique sur H125, H175, Super Puma." },
  { code: "65", name: "Entraînement rotor arrière", icon: Cable, ops: ["Arbres de transmission arrière", "Paliers intermédiaires", "Boîte intermédiaire (IGB) et BTA (TGB)"], note: "Alignement des arbres et freinage des paliers : sources classiques de vibrations." },
  { code: "67", name: "Commandes de vol rotors", icon: Gauge, ops: ["Timonerie, bielles, guignols", "Servocommandes hydrauliques", "Double contrôle croisé obligatoire"], note: "Piège : sur avion c'est l'ATA 27, sur hélicoptère c'est l'ATA 67." },
  { code: "71 à 79", name: "Groupe turbomoteur", icon: Flame, ops: ["Intégration moteur (Arriel, Arrano, Makila…)", "Cloisons pare-feu titane / inox", "Entrées d'air"], note: "L'étanchéité des pare-feu se monte avec les produits et méthodes imposés." },
];
const GEN_CHAPTERS = [
  { code: "20", name: "Pratiques standard cellule", txt: "Couples de serrage, métallisation, application PR, freinage." },
  { code: "24 / 92", name: "Électricité & EWIS", txt: "Ségrégation puissance / signal, rayons de courbure, métallisation." },
  { code: "28", name: "Carburant", txt: "Réservoirs sous plancher : FOD, PR carburant, continuité électrique." },
  { code: "29", name: "Hydraulique", txt: "Alimentation des servocommandes : propreté, B-nuts au couple." },
  { code: "52 / 53", name: "Portes / Fuselage", txt: "Perçage, ébavurage, interposition, calage, rivetage." },
];

const OF_CARDS = [
  {
    id: "OF-H160-0412", title: "Montage bielle de pas cyclique entre manche et servocommande", aircraft: "H160", x: 2200, y: 300, z: 1200, zone: "212", ref: "EI · double contrôle des commandes de vol",
    answers: { side: "droite", part: "200", ata: "67", type: "ah" }, ataOptions: ["27", "67", "63", "22"],
    explain: "Zone 212 : pointe avant, dernier chiffre pair donc droite (BL positive), côté du commandant de bord. La timonerie de commande rotor relève de l'ATA 67, pas de l'ATA 27. La référence EI est une instruction interne Airbus Helicopters.",
  },
  {
    id: "OF-H175-0587", title: "Pose barre de suspension BTP sur anneau principal", aircraft: "H175", x: 4200, y: -600, z: 2500, zone: "Plancher mécanique", ref: "ATA 63 · Entraînement rotor principal",
    answers: { side: "gauche", part: "pm", ata: "63", type: "ata" }, ataOptions: ["53", "62", "63", "67"],
    explain: "BL négative : côté gauche. WL au-dessus du plancher mécanique, sur l'ensemble BTP. Les barres de suspension relèvent de l'ATA 63. Pièce critique : traçabilité totale. La référence citée est un chapitre ATA, donc fonctionnelle.",
  },
  {
    id: "OF-H125-0733", title: "Fixation capot du turbomoteur Arriel", aircraft: "H125", x: 5000, y: 500, z: 2600, zone: "412", ref: "Vis ASN xxxx",
    answers: { side: "droite", part: "400", ata: "71", type: "ah" }, ataOptions: ["71", "54", "63", "28"],
    explain: "Zone 412 : groupe motopropulseur, dernier chiffre pair donc droite. Capots et intégration moteur : ATA 71 à 79. ASN est une norme Aerospatiale reprise par Airbus Helicopters pour les pièces standard et fixations.",
  },
  {
    id: "OF-H145-0901", title: "Montage arbre de transmission arrière et palier intermédiaire", aircraft: "H145", x: 8000, y: 0, z: 2350, zone: "310", ref: "ATA 65 · Entraînement rotor arrière",
    answers: { side: "axe", part: "boom", ata: "65", type: "ata" }, ataOptions: ["64", "65", "63", "67"],
    explain: "BL = 0 : dans le plan de symétrie, sur le dessus de la poutre de queue. Arbres et paliers vers l'arrière : ATA 65. Le Fenestron lui-même serait l'ATA 64. Référence fonctionnelle ATA.",
  },
  {
    id: "OF-H160-1044", title: "Pose réservoir sous plancher et étanchéité PR carburant", aircraft: "H160", x: 3500, y: -500, z: 800, zone: "131", ref: "Écrou auto-freiné NF L 22-xxx",
    answers: { side: "gauche", part: "100", ata: "28", type: "bnae" }, ataOptions: ["28", "29", "53", "71"],
    explain: "Zone 131 : fuselage inférieur (barque), dernier chiffre impair donc gauche, BL négative. Réservoir : ATA 28, avec FOD, PR carburant et continuité électrique. La NF L est une norme produite sous l'égide du BNAE.",
  },
  {
    id: "OF-H135-1178", title: "Fixation carénage du Fenestron", aircraft: "H135", x: 12600, y: 200, z: 2400, zone: "322", ref: "Vis ECS xxxx",
    answers: { side: "droite", part: "boom", ata: "64", type: "ah" }, ataOptions: ["64", "65", "55", "62"],
    explain: "Zone 322 : arrière / poutre, dernier chiffre pair donc droite. L'ensemble Fenestron relève de l'ATA 64. ECS (Eurocopter Standard) est le référentiel interne de pièces standard d'Airbus Helicopters.",
  },
  {
    id: "OF-H125-1290", title: "Montage du moyeu Starflex sur le mât rotor", aircraft: "H125", x: 3500, y: 0, z: 3300, zone: "Tête rotor", ref: "RG.Aéro 000 23 · gestion de configuration",
    answers: { side: "axe", part: "rotor", ata: "62", type: "bnae" }, ataOptions: ["62", "63", "64", "20"],
    explain: "BL = 0 : dans l'axe, au sommet du mât. Le moyeu relève de l'ATA 62 (le mât, de l'ATA 63). Pièce critique : traçabilité totale. Les RG.Aéro sont éditées par le BNAE.",
  },
];

const PART_OPTS = [
  { id: "100", label: "Barque / sous plancher (100)" },
  { id: "200", label: "Pointe avant & cabine (200)" },
  { id: "pm", label: "Plancher mécanique / BTP" },
  { id: "rotor", label: "Rotor principal" },
  { id: "400", label: "Turbomoteur (400)" },
  { id: "boom", label: "Poutre / Fenestron (300)" },
  { id: "700", label: "Atterrisseurs (700)" },
];
const SIDE_OPTS = [
  { id: "gauche", label: "Gauche" },
  { id: "droite", label: "Droite" },
  { id: "axe", label: "Dans l'axe" },
];
const TYPE_OPTS = [
  { id: "ata", label: "ATA · fonctionnel" },
  { id: "bnae", label: "BNAE · NF L, EN, RG.Aéro" },
  { id: "ah", label: "Airbus Helicopters · ECS, ASN, EI" },
];

function OFDecoder({ onComplete }) {
  const fields = ["side", "part", "ata", "type"];
  const at = useAtelier({ id: "m1-decodeur-of", label: "Décodeur d'Ordre de Fabrication (7 OF × 4 champs)", total: OF_CARDS.length * fields.length, onComplete });
  /* Nouveau tirage : ordre des OF et ordre des propositions de chaque champ */
  const cards = useMemo(() => shuffle(OF_CARDS).map((c) => ({
    ...c,
    opts: {
      side: shuffle(SIDE_OPTS),
      part: shuffle(PART_OPTS),
      ata: shuffle(c.ataOptions.map((x) => ({ id: x, label: "ATA " + x }))),
      type: shuffle(TYPE_OPTS),
    },
  })), [at.draw]);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState({});
  useEffect(() => { setIdx(0); setSel({}); }, [at.draw]);
  const card = cards[idx];
  const checked = at.isLocked(`${card.id}:side`);
  const goodFields = fields.filter((f) => at.get(`${card.id}:${f}`)?.ok).length;
  const complete = fields.every((f) => sel[f] !== undefined);
  const labels = { side: "Côté", part: "Partie de l'hélicoptère", ata: "Chapitre ATA", type: "Type de référence" };
  const allOpts = { side: SIDE_OPTS, part: PART_OPTS, type: TYPE_OPTS };
  const lbl = (f, id) => (f === "ata" ? "ATA " + id : allOpts[f].find((o) => o.id === id)?.label || id);

  const check = () => {
    fields.forEach((f) => at.lock(`${card.id}:${f}`, { k: sel[f], ok: sel[f] === card.answers[f], q: `${card.id} · ${labels[f]}`, choix: lbl(f, sel[f]), bonne: lbl(f, card.answers[f]) }));
  };
  const go = (i) => { setIdx(i); setSel({}); };
  const nextOpen = () => {
    for (let s = 1; s <= cards.length; s++) {
      const j = (idx + s) % cards.length;
      if (!at.isLocked(`${cards[j].id}:side`)) return go(j);
    }
  };
  const Row = ({ field, label, opts }) => (
    <div className="flex flex-col gap-1.5">
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {opts.map((o) => {
          const locked = at.get(`${card.id}:${field}`);
          const state = locked ? optState(o.id, locked.k, card.answers[field]) : sel[field] === o.id ? "sel" : "idle";
          if (state === "sel") return <Chip key={o.id} active tone="blue" onClick={() => setSel({ ...sel, [field]: o.id })}>{o.label}</Chip>;
          return <LockChip key={o.id} state={state} onClick={() => setSel({ ...sel, [field]: o.id })}>{o.label}</LockChip>;
        })}
      </div>
    </div>
  );

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-panel2 px-5 py-3">
        <FileText size={18} className="text-amber" />
        <h3 className="font-display text-xl font-semibold text-ink">Simulateur 1 : le décodeur d'Ordre de Fabrication</h3>
        <AtelierCounter at={at} />
      </div>
      <div className="px-5 pt-4"><LockRule /><p className="mt-2 text-[12px] text-muted">Tu peux ajuster tes 4 choix tant que l'OF n'est pas validé. Le bouton « Valider l'OF » verrouille définitivement la ligne : pas de seconde chance. Validation à 85 % des 28 champs (24 minimum).</p></div>
      <div className="flex gap-1.5 overflow-x-auto px-5 pt-3">
        {cards.map((c, i) => {
          const done = at.isLocked(`${c.id}:side`);
          const g = fields.filter((f) => at.get(`${c.id}:${f}`)?.ok).length;
          return (
            <button key={c.id} type="button" onClick={() => go(i)} className={cx("shrink-0 rounded-md border px-2.5 py-1 font-mono text-[11px] transition", i === idx ? "border-amber bg-amber/15 text-ink" : done ? (g === 4 ? "border-ok/60 text-ok" : "border-ko/60 text-ko") : "border-line text-muted hover:text-ink")}>
              {c.id}{done && ` · ${g}/4`}
            </button>
          );
        })}
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-lg border border-dashed border-amber/50 bg-bg p-4 font-mono text-[13px] text-ink">
          <div className="mb-3 flex items-center justify-between border-b border-line pb-2"><span className="text-amber">ORDRE DE FABRICATION</span><span className="text-muted">{card.id}</span></div>
          <div className="mb-3 font-display text-lg font-semibold leading-snug">{card.title}</div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="text-muted">Appareil</dt><dd>{card.aircraft}</dd>
            <dt className="text-muted">X · STA</dt><dd>{card.x.toLocaleString("fr-FR")} mm</dd>
            <dt className="text-muted">Y · BL</dt><dd>{card.y === 0 ? "0" : fmt(card.y)} mm</dd>
            <dt className="text-muted">Z · WL</dt><dd>{card.z.toLocaleString("fr-FR")} mm</dd>
            <dt className="text-muted">Zone</dt><dd className="text-sky">{card.zone}</dd>
            <dt className="text-muted">Référence</dt><dd className="text-amber">{card.ref}</dd>
          </dl>
          <div className="mt-4 text-[11px] text-muted">Références génériques (xxxx) : la gamme réelle donne le numéro complet. Cotes pédagogiques, non issues d'un plan constructeur.</div>
        </div>
        <div className="flex flex-col gap-4">
          {Row({ field: "side", label: "1 · Côté", opts: card.opts.side })}
          {Row({ field: "part", label: "2 · Partie de l'hélicoptère", opts: card.opts.part })}
          {Row({ field: "ata", label: "3 · Chapitre ATA de l'opération", opts: card.opts.ata })}
          {Row({ field: "type", label: "4 · La référence citée relève de…", opts: card.opts.type })}
          {!checked ? (
            <div><PrimaryButton onClick={check} disabled={!complete} tone="amber"><Lock size={16} /> Valider l'OF (définitif)</PrimaryButton></div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className={cx("rounded-lg border p-3 text-[13px] leading-relaxed text-ink", goodFields === 4 ? "border-ok/50 bg-ok/10" : "border-ko/50 bg-ko/10")}>
                <strong className={goodFields === 4 ? "text-ok" : "text-ko"}>{goodFields}/4 champs justes. </strong>{card.explain}
              </div>
              {!at.finished && <div><PrimaryButton onClick={nextOpen}>OF suivant <ArrowRight size={16} /></PrimaryButton></div>}
            </div>
          )}
        </div>
      </div>
      {at.finished && <div className="border-t border-line p-5"><AtelierResult at={at} /></div>}
    </Panel>
  );
}

function TabSystems({ done, onComplete }) {
  const [open, setOpen] = useState("67");
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={BookOpen} kicker="Onglet 3 · Systèmes & normes" title="Trois référentiels sur chaque plan Airbus Helicopters">
        ATA classe les systèmes, le BNAE normalise les composants au niveau national et européen, et Airbus Helicopters fixe ses propres standards et règles métier. Chaque gamme croise les trois.
      </SectionHead>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2"><MapIcon size={18} className="text-sky" /><span className="font-display text-xl font-semibold text-ink">ATA 100 · iSpec 2200 · S1000D</span></div>
          <p className="text-[14px] leading-relaxed text-ink/90">Standard international de <strong>classification fonctionnelle</strong> par systèmes (chapitres) et par zones.</p>
          <div className="mt-auto rounded-lg border border-sky/40 bg-sky/10 p-3 font-display text-[16px] italic text-ink">« Sur quel système et dans quelle zone je travaille ? »</div>
        </Panel>
        <Panel className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2"><Ruler size={18} className="text-ok" /><span className="font-display text-xl font-semibold text-ink">BNAE</span></div>
          <p className="text-[14px] leading-relaxed text-ink/90">Par délégation de l'AFNOR : normes françaises <strong>NF L</strong>, participation aux normes européennes <strong>EN</strong> (ASD-STAN), et <strong>RG.Aéro</strong> (ex. RG.Aéro 000 23, gestion de configuration).</p>
          <div className="mt-auto rounded-lg border border-ok/40 bg-ok/10 p-3 font-display text-[16px] italic text-ink">« Quels composants, matériaux et procédés normalisés j'applique ? »</div>
        </Panel>
        <Panel className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2"><Wrench size={18} className="text-amber" /><span className="font-display text-xl font-semibold text-ink">Airbus Helicopters</span></div>
          <ul className="flex flex-col gap-1.5 text-[14px] leading-relaxed text-ink/90">
            <li><strong className="text-amber">ECS</strong> (Eurocopter Standard) et <strong className="text-amber">ASN</strong> (Aerospatiale Norme) : pièces standard et fixations.</li>
            <li><strong className="text-amber">EI / EICM</strong> (instructions Eurocopter / Airbus Helicopters) : procédés spéciaux et règles métier (couples, freinage, métallisation, application PR).</li>
          </ul>
          <div className="mt-auto rounded-lg border border-amber/40 bg-amber/10 p-3 font-display text-[16px] italic text-ink">« Quelle pièce standard et quelle règle maison sont imposées sur ce plan ? »</div>
        </Panel>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-ko/50 bg-ko/10 p-4 sm:flex-row sm:items-center">
        <AlertTriangle size={22} className="shrink-0 text-ko" />
        <div className="text-[14px] leading-relaxed text-ink">
          <strong className="text-ko">Piège n°1 des QCM.</strong> Commandes de vol : <span className="font-mono">ATA 27</span> sur avion, mais <span className="font-mono text-ko">ATA 67</span> sur hélicoptère (timonerie, bielles, guignols, servocommandes hydrauliques des rotors). Le double contrôle croisé reste obligatoire.
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2"><Fan size={16} className="text-sky" /><Eyebrow>Chapitres vitaux de l'hélicoptère · clique pour ouvrir</Eyebrow></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {HELI_CHAPTERS.map((c) => {
            const Icon = c.icon;
            const isOpen = open === c.code;
            return (
              <button key={c.code} type="button" onClick={() => setOpen(isOpen ? null : c.code)} className={cx("flex flex-col gap-2 rounded-xl border p-4 text-left transition", isOpen ? "border-sky bg-sky/10" : "border-line bg-panel hover:border-sky/60", c.code === "67" && !isOpen && "border-ko/50")}>
                <div className="flex items-center gap-2">
                  <Icon size={18} className={c.code === "67" ? "text-ko" : "text-sky"} />
                  <span className={cx("font-mono text-lg font-semibold", c.code === "67" ? "text-ko" : "text-sky")}>ATA {c.code}</span>
                  {isOpen ? <ChevronDown size={14} className="ml-auto text-muted" /> : <ChevronRight size={14} className="ml-auto text-muted" />}
                </div>
                <div className="font-display text-base font-semibold leading-tight text-ink">{c.name}</div>
                {isOpen && (
                  <div className="flex flex-col gap-2">
                    <ul className="flex flex-col gap-1">
                      {c.ops.map((o) => <li key={o} className="flex items-start gap-1.5 text-[13px] text-ink/90"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-ok" />{o}</li>)}
                    </ul>
                    <div className="text-[12px] leading-snug text-amber">{c.note}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-2"><BookOpen size={16} className="text-muted" /><Eyebrow>Chapitres généraux toujours présents</Eyebrow></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {GEN_CHAPTERS.map((c) => (
            <div key={c.code} className="rounded-lg border border-line bg-panel p-3">
              <div className="font-mono text-sm font-semibold text-sky">ATA {c.code}</div>
              <div className="text-[13px] font-semibold text-ink">{c.name}</div>
              <div className="mt-1 text-[12px] leading-snug text-muted">{c.txt}</div>
            </div>
          ))}
        </div>
      </div>

      <NormesTables />

      <OFDecoder onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu as décodé tous les OF de la série." />
    </div>
  );
}

/* ============================================================
   ONGLET 4 : ATELIER TRIÈDRE & DIAGNOSTIC GAMME (HÉLICOPTÈRE)
   ============================================================ */
function locate(X, Y, Z) {
  const ay = Math.abs(Y);
  if (X >= 3200 && X <= 3800 && ay <= 400 && Z > 3000 && Z <= 3500) return "rotor";
  if (X >= 2800 && X < 4600 && ay <= 700 && Z > 2300 && Z <= 3000) return "pm";
  if (X >= 4600 && X <= 6600 && ay >= 100 && ay <= 900 && Z > 2300 && Z <= 2900) return "400";
  if (Z <= 600 && X >= 1200 && X <= 5800 && ay >= 900 && ay <= 1400) return "700";
  if (X >= 500 && X <= 6200 && ay <= 1100 && Z > 600 && Z <= 2300) return Z < 1000 ? "100" : "200";
  if (X >= 11800 && X <= 13300 && ay <= 250 && Z >= 1500 && Z <= 3800) return "fen";
  if (X >= 10200 && X <= 10800 && ay <= 1600 && Z >= 1950 && Z <= 2100) return "300";
  if (X > 6200 && X < 11800 && ay <= 400 && Z >= 1500 && Z <= 2450) return "300";
  return null;
}

const ZONE_INFO = {
  "100": { tag: "Zone 100", name: "Barque / sous plancher", ata: ["ATA 28 réservoirs", "ATA 53 structure inférieure", "ATA 24/92 harnais"], ops: ["Inventaire outillage entrée / sortie (FOD)", "PR carburant et continuité électrique", "Interposition anticorrosion alu / carbone"] },
  "200": { tag: "Zone 200", name: "Pointe avant & cabine", ata: ["ATA 67 timonerie (manche, collectif, palonniers)", "ATA 24/92 harnais", "ATA 52/53 portes et fuselage"], ops: ["Double contrôle croisé des commandes ATA 67", "Ségrégation et métallisation EWIS", "Étanchéité intempéries de la verrière (PR)"] },
  pm: { tag: "Plancher mécanique", name: "BTP et barres de suspension", ata: ["ATA 63 BTP, barres, plateau cyclique", "ATA 53 plancher mécanique", "ATA 67 servocommandes"], ops: ["Traçabilité totale des pièces critiques", "Serrages au couple tracés + freinage (EI)", "PR des drains : étanchéité fluides"] },
  rotor: { tag: "Tête rotor", name: "Mât et moyeu rotor", ata: ["ATA 62 moyeu, pales, amortisseurs", "ATA 63 mât rotor"], ops: ["Traçabilité totale (n° de série, appairage)", "Freinage systématique (fil, goupille, écrou crénelé)", "Serrages contre-vérifiés par un second opérateur"] },
  "400": { tag: "Zone 400", name: "Turbomoteur", ata: ["ATA 71 à 79 groupe turbomoteur", "ATA 26 protection incendie", "ATA 28 alimentation carburant"], ops: ["Étanchéité des cloisons pare-feu titane / inox", "Freinage des fixations moteur", "Métallisation des capots"] },
  "300": { tag: "Zone 300", name: "Poutre de queue / stabilisateur", ata: ["ATA 53 poutre de queue", "ATA 65 arbres et paliers", "ATA 55 stabilisateur"], ops: ["Alignement des arbres et freinage des paliers", "Interposition anticorrosion composite / métal", "Freinage systématique (vibrations)"] },
  fen: { tag: "Zone 300", name: "Dérive / Fenestron", ata: ["ATA 64 Fenestron", "ATA 65 BTA (TGB)", "ATA 67 commande de pas arrière"], ops: ["Traçabilité des pièces tournantes", "Freinage de la BTA et du moyeu arrière", "Double contrôle de la commande de pas"] },
  "700": { tag: "Zone 700", name: "Atterrisseurs / patins", ata: ["ATA 32 atterrisseurs"], ops: ["Serrage au couple des fixations de traverses", "Interposition anticorrosion", "Freinage des fixations"] },
};

const MISSIONS = [
  { text: "Place le point dans le cockpit, côté DROIT : la place du commandant de bord (type sous-zone 212).", test: (z, X, Y) => z === "200" && X < 2600 && Y > 0 },
  { text: "Place le point dans le réservoir sous plancher, côté GAUCHE (type sous-zone 131).", test: (z, X, Y) => z === "100" && Y < 0 },
  { text: "Place le point sur le plancher mécanique, au niveau d'une barre de suspension BTP côté DROIT.", test: (z, X, Y) => z === "pm" && Y > 0 },
  { text: "Place le point sur le turbomoteur GAUCHE d'un bimoteur type H145 / H160.", test: (z, X, Y) => z === "400" && Y < 0 },
  { text: "Place le point sur le Fenestron, dans le plan de symétrie.", test: (z, X, Y) => z === "fen" && Math.abs(Y) <= 250 },
  { text: "Place le point sur la tête rotor (moyeu Starflex / Spheriflex).", test: (z) => z === "rotor" },
  { text: "Place le point sur l'atterrisseur (patin ou train) côté DROIT (type sous-zone 712).", test: (z, X, Y) => z === "700" && Y > 0 },
];

function TriedreSim({ onComplete }) {
  const [pos, setPos] = useState({ X: 2000, Y: 400, Z: 1500 });
  /* 7 missions tirées dans un ordre aléatoire ; une seule vérification par mission (verrouillée) */
  const at = useAtelier({ id: "m1-triedre", label: "Atelier trièdre : 7 missions de placement X / Y / Z", total: MISSIONS.length, onComplete });
  const order = useMemo(() => permutation(MISSIONS.length), [at.draw]);
  const [step, setStep] = useState(0);
  useEffect(() => { setStep(0); }, [at.draw]);
  const mission = order[Math.min(step, order.length - 1)];
  const locked = at.get(mission);
  const feedback = locked ? { ok: locked.ok, txt: locked.txt } : null;
  const { X, Y, Z } = pos;
  const zone = locate(X, Y, Z);
  const info = zone ? ZONE_INFO[zone] : null;

  const fb = X < 2600 ? "Pointe avant" : X <= 6200 ? "Cabine" : X < 11800 ? "Poutre" : "Fenestron";
  const lr = Y === 0 ? "Dans l'axe" : Y < 0 ? "Gauche" : "Droite";
  const ud = Z < 1000 ? "Barque" : Z <= 2300 ? "Cabine" : Z <= 3000 ? "Plancher méca" : "Tête rotor";
  const sub = zone && ["100", "200", "300", "400", "700", "fen"].includes(zone) ? `${zone === "fen" ? "3" : zone[0]}1${Y === 0 ? "0" : Y < 0 ? "1" : "2"}` : null;

  const W = 520, PADX = 30;
  const sx = (x) => PADX + (x / HX) * (W - 2 * PADX);
  const syTop = (y) => 110 - (y / HY) * 95;
  const szSide = (z) => 205 - (z / HZ) * 180;

  const m = MISSIONS[mission];
  const checkMission = () => {
    if (locked) return;
    const ok = !!m.test(zone, X, Y, Z);
    const where = zone ? `${info.name.toLowerCase()}${Y !== 0 ? ", côté " + lr.toLowerCase() : ", dans l'axe"}` : "hors cellule";
    at.lock(mission, { ok, q: m.text, choix: `X ${X} / Y ${Y} / Z ${Z} mm (${where})`, bonne: "Point situé dans la zone demandée",
      txt: ok ? "Point d'intervention correct. Mission validée et verrouillée." : `Mission échouée (réponse verrouillée) : ton point est en ${where}. Relis la consigne : zone, côté (+Y droite / −Y gauche) et hauteur.` });
  };
  const nextMission = () => setStep((s) => Math.min(s + 1, MISSIONS.length - 1));

  const Slider = ({ axis, label, value, min, max, step, color }) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label htmlFor={`sl-${axis}`} className="text-[13px] font-semibold text-ink"><span className={cx("font-mono", color)}>{axis}</span> · {label}</label>
        <span className="font-mono text-sm text-ink tabular-nums">{axis === "Y" ? (value === 0 ? "0" : fmt(value)) : value.toLocaleString("fr-FR")} mm</span>
      </div>
      <input id={`sl-${axis}`} type="range" min={min} max={max} step={step} value={value} onChange={(e) => setPos({ ...pos, [axis]: Number(e.target.value) })} className="w-full accent-sky" />
    </div>
  );

  const hlTop = zone === "100" || zone === "200" ? ["cab"] : zone === "pm" ? ["pm"] : zone === "rotor" ? ["rotor"] : zone ? [zone] : [];
  const hlSide = zone === "100" ? ["barque"] : zone === "200" ? ["cabine"] : zone === "pm" ? ["pm"] : zone === "rotor" ? ["rotor"] : zone === "400" ? ["eng"] : zone === "300" ? ["boom"] : zone === "fen" ? ["fen"] : zone === "700" ? ["skid"] : [];
  const px = sx(X), pyT = syTop(Y), pzS = szSide(Z);

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-panel2 px-5 py-3">
        <Crosshair size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">Simulateur 2 : le trièdre & diagnostic gamme</h3>
        <span className="ml-auto font-mono text-[11px] text-muted">Hélicoptère bimoteur type H145 / H160 · cotes en mm</span>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="rounded-lg border border-line bg-bg p-2">
            <div className="flex justify-between px-1 font-mono text-[10px] uppercase tracking-wider text-muted"><span>Vue de dessus (plan X-Y)</span><span>X0 en avant du nez →</span></div>
            <svg viewBox={`0 0 ${W} 220`} className="h-auto w-full" role="img" aria-label="Vue de dessus avec point d'intervention">
              <text x="8" y="16" fill="#ffb020" fontSize="10" fontFamily="JetBrains Mono, monospace">+Y DROITE (pair) · place CdB</text>
              <text x="8" y="214" fill="#ffb020" fontSize="10" fontFamily="JetBrains Mono, monospace">−Y GAUCHE (impair)</text>
              <line x1={sx(0)} y1={syTop(0)} x2={sx(HX)} y2={syTop(0)} stroke="#2a3a5c" strokeDasharray="4 4" />
              <line x1={sx(0)} y1="24" x2={sx(0)} y2="200" stroke="#3b9eff" strokeOpacity="0.5" />
              <text x={sx(0) + 3} y="34" fill="#3b9eff" fontSize="9" fontFamily="JetBrains Mono, monospace">X0</text>
              <HeliTop sx={sx} sy={syTop} hl={hlTop} />
              <line x1={px} y1="6" x2={px} y2="214" stroke="#3ddc97" strokeOpacity="0.35" />
              <line x1={PADX} y1={pyT} x2={W - PADX} y2={pyT} stroke="#3ddc97" strokeOpacity="0.35" />
              <circle cx={px} cy={pyT} r="7" fill="none" stroke="#3ddc97" strokeWidth="2" />
              <circle cx={px} cy={pyT} r="2.5" fill="#3ddc97" />
            </svg>
          </div>
          <div className="rounded-lg border border-line bg-bg p-2">
            <div className="flex justify-between px-1 font-mono text-[10px] uppercase tracking-wider text-muted"><span>Vue de côté gauche (plan X-Z)</span><span>← nez · Fenestron →</span></div>
            <svg viewBox={`0 0 ${W} 215`} className="h-auto w-full" role="img" aria-label="Vue de profil avec point d'intervention">
              <line x1={PADX} y1={szSide(0)} x2={W - PADX} y2={szSide(0)} stroke="#2a3a5c" />
              <HeliSide sx={sx} sz={szSide} hl={hlSide} />
              {[[1000, "plancher cabine"], [2300, "plancher mécanique"]].map(([z, l]) => (
                <g key={l}>
                  <line x1={sx(6700)} y1={szSide(z)} x2={sx(7300)} y2={szSide(z)} stroke="#ffb020" strokeOpacity="0.5" strokeDasharray="3 3" />
                  <text x={sx(7400)} y={szSide(z) + 3} fill="#ffb020" fontSize="9" fontFamily="JetBrains Mono, monospace">{l} WL {z.toLocaleString("fr-FR")}</text>
                </g>
              ))}
              <line x1={px} y1="6" x2={px} y2="210" stroke="#3ddc97" strokeOpacity="0.35" />
              <line x1={PADX} y1={pzS} x2={W - PADX} y2={pzS} stroke="#3ddc97" strokeOpacity="0.35" />
              <circle cx={px} cy={pzS} r="7" fill="none" stroke="#3ddc97" strokeWidth="2" />
              <circle cx={px} cy={pzS} r="2.5" fill="#3ddc97" />
            </svg>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3">
            {Slider({ axis: "X", label: "Station (nez → Fenestron)", value: X, min: 0, max: HX, step: 50, color: "text-sky" })}
            {Slider({ axis: "Y", label: "Buttock Line (−gauche / +droite)", value: Y, min: -HY, max: HY, step: 50, color: "text-amber" })}
            {Slider({ axis: "Z", label: "Water Line (barque → tête rotor)", value: Z, min: 0, max: HZ, step: 50, color: "text-ok" })}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[["Long.", fb], ["Latéral", lr], ["Vertical", ud]].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-line bg-bg p-2 text-center">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{k}</div>
                <div className={cx("font-display text-base font-semibold leading-tight", k === "Latéral" ? "text-amber" : "text-ink")}>{v}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-bg p-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Zone estimée</span>
              {sub && <span className="ml-auto font-mono text-xs text-sky">sous-zone type {sub}</span>}
            </div>
            {info ? (
              <>
                <div className="font-display text-xl font-semibold text-sky">{info.tag} · {info.name}</div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted">Chapitres probables</div>
                <div className="mt-1 flex flex-wrap gap-1">{info.ata.map((a) => <span key={a} className="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink/90">{a}</span>)}</div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-amber">Diagnostic gamme · opérations à prévoir</div>
                <ul className="mt-1 flex flex-col gap-1">
                  {info.ops.map((o) => <li key={o} className="flex items-start gap-1.5 text-[13px] text-ink"><Wrench size={12} className="mt-1 shrink-0 text-amber" />{o}</li>)}
                </ul>
              </>
            ) : (
              <div className="mt-1 text-[14px] text-ko">Hors cellule : aucun point d'intervention à ces coordonnées.</div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-panel2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Target size={18} className="text-amber" />
          <span className="font-display text-lg font-semibold text-ink">Mission {step + 1}/{MISSIONS.length}</span>
          {locked && (locked.ok ? <CheckCircle2 size={16} className="text-ok" /> : <XCircle size={16} className="text-ko" />)}
          <AtelierCounter at={at} />
        </div>
        <p className="mt-2 text-[15px] text-ink">{m.text}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PrimaryButton onClick={checkMission} disabled={!!locked} tone="amber"><Lock size={16} /> Vérifier mon point (définitif)</PrimaryButton>
          {locked && step < MISSIONS.length - 1 && <PrimaryButton onClick={nextMission}>Mission suivante <ArrowRight size={16} /></PrimaryButton>}
        </div>
        <p className="mt-2 text-[12px] text-muted">Une seule vérification par mission : place ton point avec soin avant de cliquer. Validation à 85 % (6/7 missions minimum).</p>
        {feedback && <div className={cx("mt-3 rounded-lg border px-3 py-2 text-[13px]", feedback.ok ? "border-ok/50 bg-ok/10 text-ok" : "border-ko/50 bg-ko/10 text-ko")}>{feedback.txt}</div>}
        {at.finished && <div className="mt-4"><AtelierResult at={at} /></div>}
      </div>
    </Panel>
  );
}

function TabAtelier({ done, onComplete }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHead icon={Ruler} kicker="Onglet 4 · Atelier pratique" title="Place le point d'intervention, la gamme suit">
        Déplace les curseurs X, Y, Z : le point apparaît sur les deux vues de l'hélicoptère, la zone est estimée et les opérations obligatoires de la gamme s'affichent. Cotes et zonage simplifiés à but pédagogique : la référence reste la documentation du type.
      </SectionHead>
      <TriedreSim onComplete={onComplete} />
      <ValidatedBanner done={done} label="Tu sais situer un point d'intervention à partir de ses coordonnées." />
    </div>
  );
}

/* ============================================================
   ONGLET 5 : SPRINT PRÉPARATEUR MÉTHODES (AIRBUS HELICOPTERS)
   ============================================================ */
const QUESTIONS = [
  {
    tag: "ATA 67 · commandes", scenario: true,
    q: "H145, FAL, poste plancher mécanique (zone 300). Tu rédiges la gamme de pose d'une bielle de pas cyclique entre servocommande et plateau. Quel chapitre ATA et quelle opération de clôture inscris-tu ?",
    options: [
      "ATA 67, double contrôle croisé par un second opérateur qualifié et indépendant",
      "ATA 27, autocontrôle de l'opérateur puis tampon du chef d'équipe en fin de poste",
      "ATA 63, contrôle visuel du freinage par l'opérateur qui a réalisé le montage",
      "ATA 62, vérification différée lors de l'essai rotor au point fixe en piste",
    ],
    answer: 0,
    why: "Sur hélicoptère, les commandes de vol (timonerie, bielles, guignols, servocommandes) relèvent de l'ATA 67. Une opération de commande de vol se clôt par un double contrôle croisé : un second opérateur qualifié vérifie montage, freinage et sens de débattement.",
    risk: "Une commande inversée ou mal freinée n'est pas toujours détectable au sol. Classer la gamme en ATA 27 (avion) renvoie de plus vers une documentation inadaptée.",
  },
  {
    tag: "PR · étanchéité",
    q: "H160 (cellule non pressurisée), poste jonction cadre / panneau de toit. Le dossier de fabrication justifie l'application de mastic PR. Laquelle de ces justifications est FAUSSE sur cet appareil ?",
    options: [
      "Étanchéité de l'enveloppe à l'eau et aux intempéries",
      "Étanchéité aux fluides carburant et hydraulique",
      "Étanchéité de pressurisation de la cabine passagers",
      "Isolation anticorrosion par interposition entre matériaux",
    ],
    answer: 2,
    why: "Un hélicoptère comme le H160 n'est pas pressurisé. Le PR y sert à l'étanchéité intempéries et fluides, aux traversées pare-feu et à l'interposition anticorrosion.",
    risk: "Copier une justification de gamme avion entraîne des contrôles inutiles et fait oublier les vraies exigences : drains, pare-feu, couple galvanique.",
  },
  {
    tag: "Anticorrosion", scenario: true,
    q: "H175, poste structure arrière. La gamme assemble un cadre en alliage d'aluminium contre une peau en carbone. Quelle disposition la gamme doit-elle imposer à la jonction ?",
    options: [
      "Montage à sec, puis cordon de PR d'aspect en bordure après serrage",
      "Interposition (PR ou film isolant) selon l'EI applicable, contre le couple galvanique",
      "Dégraissage solvant des deux faces puis montage direct au couple nominal",
      "Primaire de peinture sur l'aluminium uniquement, la face carbone restant nue",
    ],
    answer: 1,
    why: "L'aluminium au contact du carbone forme un couple galvanique : l'aluminium se corrode. L'interposition (mastic ou film isolant) est définie par le plan et l'instruction EI.",
    risk: "Corrosion cachée sous la peau carbone, découverte en visite : dépose et réparation structurale lourde.",
  },
  {
    tag: "Pare-feu · ATA 71", scenario: true,
    q: "H160, compartiment moteur Arrano (zone 400). Tu prépares la pose d'une traversée de cloison pare-feu. Quelle exigence est déterminante dans la gamme ?",
    options: [
      "Cloison titane ou inox et étanchéité avec le produit et la méthode qualifiés de l'EI",
      "Cloison titane ou inox et étanchéité avec le PR standard disponible au poste",
      "Cloison en alliage léger, plus facile à percer, avec un joint silicone courant",
      "Cloison en composite carbone, ventilée par un jeu de 2 mm autour du passage",
    ],
    answer: 0,
    why: "Le pare-feu doit contenir un feu moteur : matériau (titane, inox) et étanchéité sont qualifiés au feu. Le préparateur reprend exactement le produit et la méthode de l'instruction.",
    risk: "Un mastic non qualifié ne tient pas au feu : en cas d'incendie moteur, les flammes atteignent la BTP ou la cabine.",
  },
  {
    tag: "ASN · ECS",
    q: "H125, nomenclature d'un ensemble capot. Le plan appelle « Vis ASN… » alors qu'un plan plus récent du même appareil appelle « Vis ECS… ». Quelle lecture est correcte ?",
    options: [
      "ASN est périmée : on remplace d'office par l'ECS de même diamètre et longueur",
      "ASN et ECS sont deux référentiels internes valides ; on monte la référence appelée",
      "ASN est une norme européenne et ECS une norme française : elles sont équivalentes",
      "ASN désigne un procédé et ECS une pièce : la vis doit être choisie dans l'EI",
    ],
    answer: 1,
    why: "ASN (Aerospatiale Norme, historique) et ECS (Eurocopter Standard) sont deux référentiels de pièces standard utilisés chez Airbus Helicopters selon l'âge de la définition. On ne les oppose pas : on monte exactement ce que le plan appelle.",
    risk: "Substituer une référence sans décision du bureau d'études rend l'ensemble non conforme à sa définition : rebut ou dérogation.",
  },
  {
    tag: "EI · EICM",
    q: "H135, poste équipement. La gamme doit préciser la méthode de freinage au fil d'un bouchon et la métallisation d'un support. Dans quel document trouves-tu la règle maison applicable ?",
    options: [
      "Dans l'instruction EI / EICM citée en note de plan",
      "Dans la fiche norme ECS de la vis de fixation",
      "Dans le tableau de zonage ATA de l'appareil",
      "Dans la fiche de navigabilité de l'appareil",
    ],
    answer: 0,
    why: "Les EI / EICM sont les instructions Airbus Helicopters des procédés et règles métier (freinage, couples, PR, métallisation). Les normes ASN / ECS définissent les pièces, pas la façon de les poser.",
    risk: "Un procédé appliqué de mémoire, sans renvoi à l'EI, donne un montage non traçable et souvent hors tolérance.",
  },
  {
    tag: "RG.Aéro 000 23",
    q: "H160, chaîne FAL. Une modification change l'indice d'un support à partir du MSN 1061. Quel document BNAE encadre la façon de gérer cette effectivité par MSN ?",
    options: [
      "La RG.Aéro 000 23, sur la gestion de configuration",
      "La norme EN de la vis qui fixe le support modifié",
      "Le chapitre ATA 53 du manuel de maintenance",
      "L'instruction EI de métallisation du support",
    ],
    answer: 0,
    why: "La RG.Aéro 000 23 du BNAE porte sur la gestion de configuration : quelle définition exacte est montée sur quel appareil, à partir de quel rang d'application.",
    risk: "Sans gestion de configuration, une pièce d'ancien indice part sur un MSN d'un nouveau standard : appareil non conforme à sa définition certifiée.",
  },
  {
    tag: "Côté · place CdB", scenario: true,
    q: "H145, poste habillage cabine. Le commandant de bord est assis à droite. L'OF indique la sous-zone 211. De quel côté de l'appareil interviens-tu ?",
    options: [
      "Côté droit, celui de la place du commandant de bord",
      "Côté gauche géométrique (−Y), lu assis regard vers l'avant",
      "Dans l'axe de symétrie, la sous-zone 211 étant centrale",
      "Côté porte cargo, le seul accessible sur cette sous-zone",
    ],
    answer: 1,
    why: "Une sous-zone se terminant par un chiffre impair est à gauche. Gauche et droite se lisent assis, regard vers l'avant. La place du CdB ne change pas la géométrie.",
    risk: "Perçage ou pose du mauvais côté : trous en trop dans la structure, réparation à faire approuver par le bureau d'études.",
  },
  {
    tag: "Trièdre",
    q: "H160, lecture de plan d'ensemble cellule. Dans quel sens croissent les stations X (STA) ?",
    options: [
      "Du point zéro situé en avant du nez vers le Fenestron",
      "Du Fenestron vers le point zéro situé sous le nez",
      "Du plancher de barque vers le plateau de tête rotor",
      "Du côté gauche (−Y) vers le côté droit (+Y)",
    ],
    answer: 0,
    why: "X0 est placé en avant du nez pour que toutes les stations soient positives jusqu'à l'arrière. Z va de la barque vers la tête rotor, Y de gauche à droite.",
    risk: "Une erreur d'axe déplace un couple ou un support sur le papier : incohérence plan / gamme, montage bloqué.",
  },
  {
    tag: "Structure",
    q: "H145, plancher mécanique (zone 300). Qu'est-ce qui distingue le plancher mécanique (structure primaire) de la BTP (pièce critique) ?",
    options: [
      "Le plancher a des chemins d'effort redondants, la BTP n'en a aucun",
      "Le plancher est démontable en ligne, la BTP seulement en atelier",
      "Le plancher est en composite, la BTP est en alliage de magnésium",
      "Le plancher porte les moteurs, la BTP porte seulement le rotor",
    ],
    answer: 0,
    why: "Une structure primaire fail-safe garde un chemin d'effort si un élément casse. Une pièce critique n'en a pas : d'où la traçabilité totale (série, appairage, serrages enregistrés).",
    risk: "Sans traçabilité, un défaut matière sur un lot de BTP rend impossible l'identification des appareils à immobiliser.",
  },
  {
    tag: "ATA 63 · suspension",
    q: "H125, montage de l'ensemble BTP sur le plancher mécanique. Quel est le rôle des barres de suspension BTP ?",
    options: [
      "Transmettre la portance du rotor, via la BTP, aux anneaux principaux",
      "Reprendre le poids des turbomoteurs et filtrer leurs vibrations",
      "Guider la timonerie de commande entre le poste et le plateau",
      "Supporter les capots de BTP et les ouvertures de visite",
    ],
    answer: 0,
    why: "L'hélicoptère est suspendu à son rotor : la portance passe par le mât, la BTP et les barres de suspension jusqu'aux anneaux principaux. Ce sont des pièces critiques (ATA 63).",
    risk: "Une barre mal montée ou mal freinée peut rompre en vol : séparation de l'ensemble rotor-BTP de la cellule.",
  },
  {
    tag: "Freinage", scenario: true,
    q: "H160, poste plateau cyclique. La gamme héritée ne précise pas le freinage d'un écrou de biellette de pas. Quelle est ta décision de préparateur ?",
    options: [
      "Bloquer l'opération et faire définir le freinage conforme (plan, EI) avant diffusion",
      "Prescrire un frein filet anaérobie standard, déjà utilisé sur d'autres postes",
      "Prescrire le couple maximal de la plage pour compenser l'absence de freinage",
      "Diffuser en l'état et demander au contrôle final de statuer sur le freinage",
    ],
    answer: 0,
    why: "Sur hélicoptère, chaque fixation a un moyen de freinage défini par le plan ou l'EI. Le préparateur ne l'improvise pas : il le fait définir et l'écrit dans la gamme.",
    risk: "Sous vibration rotor, un écrou non freiné se desserre : jeu dans la chaîne de commande et perte de contrôle du pas des pales.",
  },
  {
    tag: "ATA 64 · Fenestron",
    q: "H160, montage du Fenestron dans la dérive. Pourquoi ses pales sont-elles réparties avec un espacement angulaire irrégulier ?",
    options: [
      "Pour répartir le bruit sur plusieurs fréquences et le rendre moins gênant",
      "Pour compenser le balourd créé par la pale porteuse du repère de calage",
      "Pour laisser le passage de la biellette de pas entre deux pales voisines",
      "Pour réduire le nombre de pales sans modifier la poussée anticouple",
    ],
    answer: 0,
    why: "Avec un espacement régulier, le bruit se concentre sur une fréquence. L'espacement irrégulier l'étale et le rend moins gênant. Le Fenestron relève de l'ATA 64.",
    risk: "Monter une pale à une position différente de la définition détruit l'équilibrage et le gain acoustique : vibrations et non-conformité.",
  },
  {
    tag: "ATA 65",
    q: "H145, poutre de queue. Tu prépares la pose des arbres de transmission arrière, de leurs paliers et de la boîte arrière. Quel chapitre ATA portes-tu sur la gamme ?",
    options: ["ATA 65 · Transmission rotor arrière", "ATA 64 · Rotor arrière / Fenestron", "ATA 63 · Transmission rotor principal", "ATA 67 · Commandes de vol rotors"],
    answer: 0,
    why: "ATA 65 : entraînement du rotor arrière (arbres, paliers, boîtes). ATA 64 : le rotor arrière ou le Fenestron lui-même. ATA 63 : entraînement du rotor principal.",
    risk: "Un mauvais chapitre renvoie vers la mauvaise documentation : couples ou alignement faux sur les paliers.",
  },
  {
    tag: "ATA 62",
    q: "H125, tête rotor. Tu prépares la pose du moyeu Starflex et des pales. Quel chapitre ATA portes-tu sur la gamme ?",
    options: ["ATA 62 · Rotor principal", "ATA 63 · Transmission rotor principal", "ATA 67 · Commandes de vol rotors", "ATA 53 · Structure de fuselage"],
    answer: 0,
    why: "Pales, moyeu (Starflex, Spheriflex) et amortisseurs relèvent de l'ATA 62. Le mât et la BTP relèvent de l'ATA 63, le plateau cyclique et les bielles de l'ATA 67.",
    risk: "Le moyeu est une pièce critique : un classement erroné peut faire perdre les exigences de traçabilité associées.",
  },
  {
    tag: "ATA 28 · carburant", scenario: true,
    q: "H160, barque (zone 100). Intervention dans le caisson de réservoir sous plancher cabine. Quelle séquence la gamme doit-elle imposer ?",
    options: [
      "Inventaire outillage entrée / sortie, PR qualifié carburant, continuité électrique",
      "Nettoyage final par aspiration, PR standard d'aspect, contrôle visuel des fixations",
      "Inventaire outillage en fin de poste, PR qualifié carburant, peinture de protection",
      "Contrôle visuel des fixations, PR standard, essai d'étanchéité au remplissage en piste",
    ],
    answer: 0,
    why: "En zone carburant : risque FOD maximal (inventaire à l'entrée et à la sortie du caisson), PR qualifié carburant, et continuité électrique pour éviter les charges statiques.",
    risk: "Un outil oublié peut obstruer une pompe ; une fixation sans continuité électrique peut provoquer un arc dans les vapeurs de carburant.",
  },
  {
    tag: "Mécanique du vol",
    q: "H145 en stationnaire. Le pilote augmente le pas collectif. Que se passe-t-il et que doit-il compenser ?",
    options: [
      "L'appareil monte ; le couple augmente et il compense aux palonniers",
      "L'appareil avance ; le disque s'incline et il compense au cyclique",
      "L'appareil monte ; le régime rotor augmente et il réduit la puissance",
      "L'appareil tourne en lacet ; il compense en réduisant le collectif",
    ],
    answer: 0,
    why: "Plus de pas collectif = plus de portance, mais aussi plus de couple absorbé : le fuselage tend à tourner en sens inverse du rotor, d'où l'action aux palonniers.",
    risk: "Confondre collectif et cyclique dans une gamme de réglage du plateau fausse les débattements : réglage non conforme au point fixe.",
  },
];

function TabSprint({ done, onComplete, onScore }) {
  return (
    <SprintQCM questions={QUESTIONS} done={done} onComplete={onComplete} onScore={onScore}
      SectionHead={SectionHead} ValidatedBanner={ValidatedBanner}
      kicker="Onglet 5 · Évaluation" title="Sprint Préparateur Méthodes Hélicoptère"
      intro={`${QUESTIONS.length} questions tirées au hasard, théorie et mises en situation en atelier Airbus Helicopters. Après chaque réponse, une explication technique te montre pourquoi c'est juste, et ce que l'erreur aurait provoqué sur chaîne.`} />
  );
}

/* ============================================================
   APPLICATION
   ============================================================ */
const TABS = [
  { id: "vol", short: "Mécanique du vol", n: "1", icon: Fan, rule: "Contrôle de fin d'onglet ≥ 85 % (réponses verrouillées)" },
  { id: "reperer", short: "Se repérer", n: "2", icon: Compass, rule: "Atelier de tri ≥ 85 % (10/11), 1er choix verrouillé" },
  { id: "systemes", short: "Systèmes & normes", n: "3", icon: BookOpen, rule: "Décodeur d'OF ≥ 85 % des 28 champs" },
  { id: "atelier", short: "Atelier trièdre", n: "4", icon: Crosshair, rule: "Trièdre ≥ 85 % (6/7 missions), 1 essai par mission" },
  { id: "sprint", short: "Sprint évaluation", n: "5", icon: Trophy, rule: "Sprint final ≥ 85 % (score enregistré au portail)" },
];

export default function App({ onSaveScore, onBack, student } = {}) {
  const [tab, setTab] = useState("vol");
  const [progress, setProgress] = useState(() => loadProgress());
  useEffect(() => saveProgress(progress), [progress]);
  const complete = (id) => () => setProgress((p) => (p[id] ? p : { ...p, [id]: true }));
  const doneCount = TABS.filter((t) => progress[t.id]).length;
  const current = TABS.find((t) => t.id === tab);
  const go = (id) => {
    setTab(id);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { /* sans effet */ }
  };
  const idx = TABS.findIndex((t) => t.id === tab);
  const gutter = { paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" };

  return (
    <div className="min-h-full bg-bg text-ink">
      <header className="sticky z-20 border-b border-line bg-bg/95 backdrop-blur" style={{ top: "env(safe-area-inset-top, 0px)" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 py-3" style={gutter}>
          <div className="flex flex-wrap items-center gap-3">
            {onBack && <BackToPortal onBack={onBack} />}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky/50 bg-sky/10"><Fan size={18} className="text-sky" /></div>
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Bureau des Méthodes · Airbus Helicopters · Module 1</div>
              <h1 className="font-display text-xl font-semibold leading-none text-ink sm:text-2xl">Préparateur Méthodes Assemblage Hélicoptère</h1>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Modules validés</div>
                <div className="font-mono text-lg font-semibold text-ok tabular-nums">{doneCount}/{TABS.length}</div>
              </div>
              <div className="flex gap-1">
                {TABS.map((t) => <div key={t.id} className={cx("h-8 w-2 rounded-sm", progress[t.id] ? "bg-ok" : t.id === tab ? "bg-sky" : "bg-line")} title={t.short} />)}
              </div>
            </div>
          </div>
          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5" aria-label="Onglets du module">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = t.id === tab;
              const ok = progress[t.id];
              return (
                <button key={t.id} type="button" onClick={() => go(t.id)} className={cx("flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", active ? "border-sky bg-sky/15 text-ink" : "border-transparent text-muted hover:bg-panel hover:text-ink")}>
                  <span className={cx("flex h-5 w-5 items-center justify-center rounded font-mono text-[11px]", ok ? "bg-ok text-bg" : active ? "bg-sky text-bg" : "bg-line text-ink")}>{ok ? <CheckCircle2 size={12} /> : t.n}</span>
                  <Icon size={14} className="hidden sm:block" />
                  {t.short}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl py-6" style={gutter}>
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-[12px] text-muted">
          <Info size={14} className="text-sky" />
          <span>Pour valider cet onglet : <strong className="text-ink">{current.rule}</strong></span>
          {progress[tab] && <span className="ml-auto inline-flex items-center gap-1 text-ok"><CheckCircle2 size={14} /> Validé</span>}
        </div>

        {tab === "vol" && <TabFlight done={progress.vol} onComplete={complete("vol")} />}
        {tab === "reperer" && <TabLocate done={progress.reperer} onComplete={complete("reperer")} />}
        {tab === "systemes" && <TabSystems done={progress.systemes} onComplete={complete("systemes")} />}
        {tab === "atelier" && <TabAtelier done={progress.atelier} onComplete={complete("atelier")} />}
        {tab === "sprint" && <TabSprint done={progress.sprint} onComplete={complete("sprint")} onScore={onSaveScore} />}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <button type="button" onClick={() => idx > 0 && go(TABS[idx - 1].id)} disabled={idx === 0} className={cx("inline-flex items-center gap-1 text-sm font-semibold", idx === 0 ? "text-line" : "text-muted hover:text-ink")}>
            ← {idx > 0 ? TABS[idx - 1].short : "Début"}
          </button>
          <button type="button" onClick={() => setProgress({})} className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ko">
            <RotateCcw size={12} /> Réinitialiser la progression
          </button>
          {idx < TABS.length - 1 ? <PrimaryButton onClick={() => go(TABS[idx + 1].id)}>{TABS[idx + 1].short} <ChevronRight size={16} /></PrimaryButton> : <span />}
        </div>
      </main>
    </div>
  );
}
