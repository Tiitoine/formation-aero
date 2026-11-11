/* ============================================================
   M3 · SCHÉMAS TECHNIQUES
   - Distance au bord (ED) et pas (pitch), modes de ruine
   - Écran SAP QM01 de création d'avis qualité (QN)
   - Détrompage (Poka-Yoke) sur servocommande hydraulique ATA 67
   - Zone BTP / servocommandes avec protections temporaires
   Données de formation : références, ordres et valeurs fictifs.
   ============================================================ */
import React, { useState } from "react";
import { Monitor, Paperclip, Send, Save, Camera, CheckCircle2, Lock } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");
const C = { line: "#5b7299", thin: "#3a4c70", fill: "#1b2a47", fill2: "#24304a", hatch: "#2e4168", sky: "#3b9eff", amber: "#ffb020", ok: "#3ddc97", ko: "#ff5d6c", txt: "#8fa0bd", ink: "#e6edf7", metal: "#9fb3d1", metal2: "#c8d6ea", bg: "#0d1526" };
const MONO = "JetBrains Mono, monospace";
const T = ({ x, y, children, c = C.txt, a = "start", s = 9, w }) => <text x={x} y={y} fontSize={s} fontFamily={MONO} fill={c} textAnchor={a} fontWeight={w}>{children}</text>;
const Hatch = ({ id, color = C.hatch }) => (
  <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="1.2" /></pattern>
);
const Arr = ({ id, color }) => <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={color} /></marker>;

/* ---------- 1. Distance au bord & pas ---------- */
export function EdPitchSVG() {
  const D = 16; /* px pour 1 D */
  const edge = 226, r1 = edge - 2 * D, r2 = r1 - 4 * D;
  const row1 = [80, 160, 240, 320, 400], row2 = [120, 200, 280, 360];
  return (
    <svg viewBox="0 0 690 300" className="h-auto w-full rounded-lg border border-line bg-bg" role="img" aria-label="Schéma coté distance au bord et pas des fixations">
      <defs>
        <Hatch id="ed-h" />
        <Arr id="ed-a" color={C.amber} /><Arr id="ed-ok" color={C.ok} /><Arr id="ed-ko" color={C.ko} />
      </defs>
      <T x={16} y={22} c={C.ink} w="600" s={10}>Jonction à recouvrement · 2 rangées en quinconce · vue de dessus</T>
      {/* tôle inférieure (recouvrement) puis tôle supérieure avec bord libre */}
      <rect x="30" y="70" width="420" height="190" fill={C.fill2} stroke={C.line} />
      <rect x="30" y="40" width="420" height={edge - 40} fill={C.fill} stroke={C.line} />
      <line x1="30" x2="450" y1={edge} y2={edge} stroke={C.ink} strokeWidth="2" />
      <T x={262} y={edge + 14}>bord libre de la tôle supérieure</T>
      {/* axes des rangées */}
      {[r1, r2].map((y) => <line key={y} x1="40" x2="440" y1={y} y2={y} stroke={C.thin} strokeDasharray="10 3 2 3" />)}
      {[...row1.map((x) => [x, r1]), ...row2.map((x) => [x, r2])].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={D / 2} fill={C.bg} stroke={C.metal} strokeWidth="1.4" />
          <line x1={x - 12} x2={x + 12} y1={y} y2={y} stroke={C.thin} strokeWidth="0.8" /><line x1={x} x2={x} y1={y - 12} y2={y + 12} stroke={C.thin} strokeWidth="0.8" />
        </g>
      ))}
      {/* D */}
      <line x1={200 - D / 2} x2={200 + D / 2} y1={r2 - 22} y2={r2 - 22} stroke={C.amber} markerStart="url(#ed-a)" markerEnd="url(#ed-a)" />
      <line x1={200 - D / 2} x2={200 - D / 2} y1={r2 - 26} y2={r2} stroke={C.thin} /><line x1={200 + D / 2} x2={200 + D / 2} y1={r2 - 26} y2={r2} stroke={C.thin} />
      <T x={200} y={r2 - 28} a="middle" c={C.amber} w="600">Ø D</T>
      {/* ED juste : axe → bord */}
      <line x1="60" x2="60" y1={r1} y2={edge} stroke={C.ok} strokeWidth="1.4" markerStart="url(#ed-ok)" markerEnd="url(#ed-ok)" />
      <line x1="56" x2="80" y1={r1} y2={r1} stroke={C.ok} strokeWidth="0.8" />
      <T x={40} y={r1 - 20} c={C.ok} w="600">✓ ED = 2D</T>
      <T x={40} y={r1 - 8} c={C.ok}>axe → bord</T>
      {/* erreur classique : bord du trou → bord */}
      <line x1="420" x2="420" y1={r1 + D / 2} y2={edge} stroke={C.ko} strokeWidth="1.4" markerStart="url(#ed-ko)" markerEnd="url(#ed-ko)" />
      <line x1="400" x2="424" y1={r1 + D / 2} y2={r1 + D / 2} stroke={C.ko} strokeWidth="0.8" />
      <T x={360} y={r1 - 22} c={C.ko} w="600">✗ bord du trou</T>
      <T x={360} y={r1 - 10} c={C.ko}>→ bord : faux</T>
      {/* pas : cote sous le bord, sur la tôle inférieure */}
      {[160, 240].map((x) => <line key={x} x1={x} x2={x} y1={r1 + 10} y2={250} stroke={C.thin} strokeDasharray="3 2" />)}
      <line x1="160" x2="240" y1="246" y2="246" stroke={C.amber} strokeWidth="1.4" markerStart="url(#ed-a)" markerEnd="url(#ed-a)" />
      <T x={200} y={242} a="middle" c={C.amber} w="600">pas = 4D à 6D</T>
      <T x={262} y={256} c={C.txt}>entre deux axes consécutifs</T>
      {/* entraxe des lignes */}
      {[r1, r2].map((y) => <line key={y} x1="440" x2="474" y1={y} y2={y} stroke={C.thin} strokeDasharray="3 2" />)}
      <line x1="468" x2="468" y1={r2} y2={r1} stroke={C.sky} strokeWidth="1.4" markerStart="url(#ed-a)" markerEnd="url(#ed-a)" />
      <T x={474} y={(r1 + r2) / 2 - 4} c={C.sky} w="600">entraxe</T>
      <T x={474} y={(r1 + r2) / 2 + 8} c={C.sky}>des lignes</T>
      <T x={474} y={(r1 + r2) / 2 + 20} c={C.txt}>(valeur plan)</T>
      <T x={16} y={290}>Exemple Ø 4,8 mm : ED ≥ 9,6 mm (2D) en métal, ≥ 12 mm (2,5D) en carbone ; pas de 19,2 à 28,8 mm.</T>
      {/* modes de ruine */}
      <line x1="546" x2="546" y1="36" y2="270" stroke="#22304d" />
      <T x={560} y={44} c={C.ko} w="600">ED &lt; 2D</T>
      <T x={560} y={56}>arrachement du bord</T>
      <g transform="translate(560 64)">
        <rect x="0" y="0" width="86" height="56" fill={C.fill} stroke={C.line} />
        <line x1="0" x2="86" y1="56" y2="56" stroke={C.ink} strokeWidth="2" />
        <path d="M34,40 L32,56 M52,40 L54,56" stroke={C.ko} strokeWidth="1.6" />
        <path d="M32,56 L34,66 H52 L54,56" fill={C.fill} stroke={C.ko} strokeWidth="1" strokeDasharray="2 1.5" />
        <circle cx="43" cy="38" r="8" fill={C.bg} stroke={C.metal} strokeWidth="1.2" />
        <circle cx="43" cy="44" r="6" fill={C.metal2} />
        <line x1="43" x2="43" y1="14" y2="28" stroke={C.amber} strokeWidth="1.4" markerStart="url(#ed-a)" />
      </g>
      <T x={560} y={158} c={C.ko} w="600">pas &lt; 4D</T>
      <T x={560} y={170}>découpe timbre-poste</T>
      <g transform="translate(560 180)">
        <rect x="0" y="0" width="86" height="60" fill={C.fill} stroke={C.line} />
        {[14, 32, 50, 68].map((x) => <circle key={x} cx={x} cy="30" r="6" fill={C.bg} stroke={C.metal} strokeWidth="1.2" />)}
        <path d="M0,30 H8 M20,30 H26 M38,30 H44 M56,30 H62 M74,30 H86" stroke={C.ko} strokeWidth="1.8" />
        <path d="M0,24 l-0,0" />
        <line x1="43" x2="43" y1="2" y2="16" stroke={C.amber} strokeWidth="1.4" markerStart="url(#ed-a)" />
        <line x1="43" x2="43" y1="44" y2="58" stroke={C.amber} strokeWidth="1.4" markerEnd="url(#ed-a)" />
      </g>
      <T x={560} y={256}>la tôle se déchire</T>
      <T x={560} y={268}>d'un trou à l'autre</T>
    </svg>
  );
}

/* ---------- 2. Écran SAP QM01 ---------- */
export function QM01Screen() {
  const [sent, setSent] = useState(false);
  const [tab, setTab] = useState("desc");
  const head = [["Avis qualité", "300041872 (Q3 · non-conformité interne)"], ["Statut", sent ? "OSNO · TRANSMIS BE" : "OSNO · OUVERT"], ["MSN · Effectivité", "H160 MSN 1462 · ind. C"], ["Ordre (OF)", "1004587"], ["Opération bloquée", "0040 · Perçage / alésage Ø 4,8"], ["Article (P/N)", "365A21-0050-01 · cornière Rep 2"], ["Poste FAL", "P20 · Jonction"], ["Déclarant", "Préparateur méthodes · P20"]];
  return (
    <div className="overflow-hidden rounded-xl border border-[#9fb0c8] bg-[#eef2f7] text-[#1b2533] shadow-lg">
      <div className="flex flex-wrap items-center gap-2 bg-gradient-to-b from-[#3c5a80] to-[#2b4466] px-3 py-1.5 text-white">
        <Monitor size={15} />
        <span className="text-[12.5px] font-semibold">SAP · Créer avis qualité : non-conformité</span>
        <span className="ml-auto font-mono text-[11px] opacity-80">Transaction QM01 · type Q3</span>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-[#b9c6d8] bg-[#dfe6ef] px-3 py-1 text-[11.5px]">
        {["Avis", "Traiter", "Saut", "Environnement", "Système", "Aide"].map((m) => <span key={m} className="rounded px-2 py-0.5">{m}</span>)}
      </div>
      <div className="grid gap-x-6 gap-y-1 border-b border-[#b9c6d8] bg-white px-4 py-2.5 text-[12px] sm:grid-cols-2">
        {head.map(([k, v]) => (
          <div key={k} className="flex gap-2"><span className="w-36 shrink-0 text-[#5a6678]">{k}</span><span className={cx("font-mono font-semibold", k === "Opération bloquée" && "text-[#b3261e]", k === "Statut" && sent && "text-[#1d5fa8]")}>{k === "Opération bloquée" && <Lock size={11} className="mr-1 inline" />}{v}</span></div>
        ))}
      </div>
      <div className="flex gap-1 border-b border-[#b9c6d8] bg-[#dfe6ef] px-3 pt-1.5 text-[12px]">
        {[["desc", "Description"], ["codes", "Codes défaut"], ["pj", "Pièces jointes (2)"]].map(([id, l]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cx("rounded-t border border-b-0 px-3 py-1", tab === id ? "border-[#b9c6d8] bg-white font-semibold" : "border-transparent text-[#3c4a5c] hover:bg-white/60")}>{l}</button>
        ))}
      </div>
      <div className="bg-white p-4 text-[12.5px]">
        {tab === "desc" && (
          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#5a6678]">Texte descriptif (factuel et coté)</div>
              <div className="rounded border border-[#b9c6d8] bg-[#f8fafc] p-2 font-mono text-[12px] leading-relaxed">Alésage position 12 (rangée 1, 3e trou depuis le cadre X4500) mesuré Ø 6,42 mm. Plan : Ø 6,35 H7 (+0,015 / 0). Écart : +0,055 mm au-delà du maxi. Mesure au tampon et à l'alésomètre AL-06 (valide 05/2027). ED mesurée 12,8 mm. Aucune autre position touchée.</div>
            </div>
            <table className="w-full border-collapse text-[12px]">
              <thead><tr className="bg-[#cfdbe9] text-left">{["Caractéristique", "Attendu au plan", "Relevé métrologique", "Écart"].map((h) => <th key={h} className="border border-[#b9c6d8] px-2 py-1">{h}</th>)}</tr></thead>
              <tbody className="font-mono">
                <tr><td className="border border-[#b9c6d8] px-2 py-1">Ø alésage pos. 12</td><td className="border border-[#b9c6d8] px-2 py-1">6,350 à 6,365</td><td className="border border-[#b9c6d8] px-2 py-1 font-semibold text-[#b3261e]">6,420</td><td className="border border-[#b9c6d8] px-2 py-1 text-[#b3261e]">+0,055</td></tr>
                <tr><td className="border border-[#b9c6d8] px-2 py-1">ED pos. 12</td><td className="border border-[#b9c6d8] px-2 py-1">≥ 12,7 (2D)</td><td className="border border-[#b9c6d8] px-2 py-1">12,8</td><td className="border border-[#b9c6d8] px-2 py-1 text-[#1d7a4a]">conforme</td></tr>
              </tbody>
            </table>
          </div>
        )}
        {tab === "codes" && (
          <table className="w-full border-collapse text-[12px]">
            <thead><tr className="bg-[#cfdbe9] text-left">{["Catalogue", "Groupe de codes", "Code", "Libellé"].map((h) => <th key={h} className="border border-[#b9c6d8] px-2 py-1">{h}</th>)}</tr></thead>
            <tbody className="font-mono">
              {[["Défaut", "PERCAGE", "D-ALE-03", "Diamètre d'alésage hors tolérance"], ["Localisation", "CORNIERE", "L-REP2-12", "Rep 2, position 12, rangée 1"], ["Cause", "OUTIL", "C-OUT-02", "Usure alésoir non détectée"], ["Origine", "FAL", "O-P20", "Poste P20 jonction"]].map((r) => (
                <tr key={r[2]}>{r.map((c, i) => <td key={i} className="border border-[#b9c6d8] px-2 py-1">{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "pj" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <figure className="rounded border border-[#b9c6d8] bg-[#f8fafc] p-2">
              <div className="mb-1 flex items-center gap-1 text-[11.5px] font-semibold"><Paperclip size={12} />Croquis coté · pos12.pdf</div>
              <svg viewBox="0 0 220 120" className="h-auto w-full" aria-label="Croquis coté de l'alésage hors tolérance">
                <rect x="10" y="20" width="200" height="70" fill="#e3e9f1" stroke="#5a6678" />
                <line x1="10" x2="210" y1="90" y2="90" stroke="#1b2533" strokeWidth="2" />
                {[40, 90, 140, 190].map((x) => <circle key={x} cx={x} cy="60" r={x === 140 ? 9 : 7.5} fill="#fff" stroke={x === 140 ? "#b3261e" : "#5a6678"} strokeWidth="1.4" />)}
                <line x1="160" x2="160" y1="60" y2="90" stroke="#1d5fa8" /><text x="164" y="80" fontSize="8" fontFamily={MONO} fill="#1d5fa8">12,8</text>
                <text x="118" y="40" fontSize="8" fontFamily={MONO} fill="#b3261e">Ø 6,42</text>
                <text x="14" y="112" fontSize="8" fontFamily={MONO} fill="#5a6678">pos. 12 · plan Ø 6,35 H7</text>
              </svg>
            </figure>
            <figure className="rounded border border-[#b9c6d8] bg-[#f8fafc] p-2">
              <div className="mb-1 flex items-center gap-1 text-[11.5px] font-semibold"><Camera size={12} />Photo · pos12.jpg</div>
              <svg viewBox="0 0 220 120" className="h-auto w-full" aria-label="Photo de l'alésage">
                <rect width="220" height="120" fill="#4a5568" />
                <rect x="0" y="0" width="220" height="120" fill="url(#none)" />
                <ellipse cx="110" cy="60" rx="80" ry="40" fill="#8c97a8" />
                <circle cx="110" cy="60" r="16" fill="#1b2533" stroke="#cfd6e0" strokeWidth="3" />
                <circle cx="110" cy="60" r="24" fill="none" stroke="#ffb020" strokeWidth="2" strokeDasharray="4 3" />
                <text x="8" y="112" fontSize="8" fontFamily={MONO} fill="#fff">MSN 1462 · OF 1004587 · 11/11</text>
              </svg>
            </figure>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-[#b9c6d8] bg-[#dfe6ef] px-3 py-2 text-[12px]">
        <span className="inline-flex items-center gap-1 rounded border border-[#9fb0c8] bg-white px-2 py-1"><Save size={12} />Sauvegarder</span>
        <button type="button" disabled={sent} onClick={() => setSent(true)} className={cx("inline-flex items-center gap-1 rounded border px-2 py-1 font-semibold", sent ? "border-[#9fb0c8] bg-[#e6edf5] text-[#5a6678]" : "border-[#1d5fa8] bg-[#1d5fa8] text-white hover:bg-[#174d8a]")}>
          {sent ? <CheckCircle2 size={12} /> : <Send size={12} />}{sent ? "Transmis au DOA Part-21J" : "Transférer au DOA Part-21J (concession)"}
        </button>
        <span className="ml-auto font-mono text-[11px] text-[#5a6678]">{sent ? "Zone bloquée jusqu'à la décision signée du BE" : "OF bloqué à l'op. 0040 tant que l'avis est ouvert"}</span>
      </div>
    </div>
  );
}

/* ---------- 3. Poka-Yoke sur servocommande ATA 67 ---------- */
export function PokaYokeSVG() {
  const hexSide = (x, y, w, h, fill) => (
    <g><rect x={x} y={y} width={w} height={h} fill={fill} stroke={C.ink} strokeWidth="0.8" /><line x1={x + w / 4} x2={x + w / 4} y1={y} y2={y + h} stroke={C.thin} /><line x1={x + (3 * w) / 4} x2={x + (3 * w) / 4} y1={y} y2={y + h} stroke={C.thin} /></g>
  );
  const twist = (x1, y1, x2, y2) => { let d = `M${x1},${y1}`; const n = 8; for (let i = 1; i <= n; i++) { const t = i / n; d += ` L${x1 + (x2 - x1) * t + (i % 2 ? 2 : -2)},${y1 + (y2 - y1) * t}`; } return d; };
  const thread = (x, y, w, h) => Array.from({ length: Math.floor(h / 3) }, (_, i) => <line key={i} x1={x} x2={x + w} y1={y + i * 3} y2={y + i * 3 + 1.5} stroke={C.thin} strokeWidth="0.8" />);
  return (
    <svg viewBox="0 0 660 340" className="h-auto w-full rounded-lg border border-line bg-bg" role="img" aria-label="Détrompage d'une servocommande hydraulique ATA 67">
      <defs><Hatch id="pk-h" /><Arr id="pk-a" color={C.ok} /></defs>
      {/* tuyauteries */}
      <path d="M300,98 V82 Q300,64 282,64 H40" fill="none" stroke={C.sky} strokeWidth="14" />
      <path d="M420,108 V70 Q420,52 440,52 H520" fill="none" stroke={C.amber} strokeWidth="9" />
      {/* bossages + B-nuts */}
      <rect x="274" y="126" width="52" height="26" fill={C.metal} stroke={C.line} />{thread(276, 128, 48, 22)}
      {hexSide(280, 98, 40, 28, C.sky)}
      <rect x="404" y="132" width="32" height="20" fill={C.metal} stroke={C.line} />{thread(406, 134, 28, 16)}
      {hexSide(406, 108, 28, 24, C.amber)}
      {/* oreilles de freinage et fil */}
      <rect x="330" y="138" width="10" height="14" rx="2" fill={C.metal} stroke={C.line} /><circle cx="335" cy="143" r="1.8" fill={C.bg} />
      <path d={twist(316, 110, 335, 143)} stroke="#d9dde4" strokeWidth="1.2" fill="none" />
      <rect x="440" y="138" width="10" height="14" rx="2" fill={C.metal} stroke={C.line} /><circle cx="445" cy="143" r="1.8" fill={C.bg} />
      <path d={twist(430, 118, 445, 143)} stroke="#d9dde4" strokeWidth="1.2" fill="none" />
      {/* corps de servocommande */}
      <rect x="60" y="168" width="90" height="44" rx="6" fill={C.fill2} stroke={C.line} />
      <rect x="14" y="183" width="48" height="14" fill={C.metal2} stroke={C.line} />
      <circle cx="16" cy="190" r="10" fill={C.metal} stroke={C.line} /><circle cx="16" cy="190" r="4" fill={C.bg} />
      <path d="M150,152 H530 Q546,152 546,168 V218 Q546,232 530,232 H150 Z" fill="#2b3f63" stroke={C.metal} strokeWidth="1.2" />
      <path d="M150,152 H530 Q546,152 546,168 V218 Q546,232 530,232 H150 Z" fill="url(#pk-h)" opacity="0.35" />
      <circle cx="574" cy="192" r="16" fill={C.metal} stroke={C.line} /><circle cx="574" cy="192" r="6" fill={C.bg} />
      <rect x="546" y="184" width="18" height="16" fill={C.metal} stroke={C.line} />
      {/* semelle + ferrure support + pions */}
      <rect x="190" y="232" width="300" height="14" fill={C.fill2} stroke={C.line} />
      <rect x="170" y="276" width="340" height="22" fill={C.fill} stroke={C.line} /><rect x="170" y="276" width="340" height="22" fill="url(#pk-h)" />
      <rect x="215" y="246" width="12" height="30" fill={C.ok} stroke={C.ink} strokeWidth="0.6" />
      <rect x="432" y="246" width="7" height="30" fill={C.ok} stroke={C.ink} strokeWidth="0.6" />
      <rect x="215" y="232" width="12" height="14" fill="none" stroke={C.ok} strokeDasharray="2 2" />
      <rect x="432" y="232" width="7" height="14" fill="none" stroke={C.ok} strokeDasharray="2 2" />
      {/* repères */}
      <T x={40} y={22} c={C.sky} w="600">PORT PRESSION HP</T>
      <T x={40} y={34} c={C.sky}>UNJF 3/4-16 · Dash -8</T>
      <T x={470} y={30} c={C.amber} w="600">PORT RETOUR BÂCHE</T>
      <T x={470} y={42} c={C.amber}>UNJF 9/16-18 · Dash -6</T>
      <line x1="326" y1="112" x2="356" y2="96" stroke={C.thin} /><T x={358} y={94}>B-nut freiné au fil</T>
      <T x={190} y={200} c={C.ink} w="600">SERVOCOMMANDE ATA 67 · corps usiné</T>
      <T x={62} y={162}>vérin</T>
      <T x={520} y={258}>ferrure support</T>
      <T x={170} y={316} c={C.ok} w="600">pion Ø 10 et pion Ø 6, entraxe asymétrique :</T>
      <T x={170} y={330} c={C.ok}>la servocommande ne se pose que dans un seul sens</T>
      {/* encart : inversion impossible */}
      <g transform="translate(560 70)">
        <rect x="-8" y="-24" width="92" height="100" rx="6" fill={C.bg} stroke="#22304d" />
        <T x={-2} y={-10} s={8.4} c={C.ko} w="600">-8 sur port -6 ?</T>
        {hexSide(14, 6, 40, 24, C.sky)}
        <rect x="22" y="40" width="24" height="18" fill={C.metal} stroke={C.line} />{thread(24, 42, 20, 14)}
        <path d="M10,0 L60,64 M60,0 L10,64" stroke={C.ko} strokeWidth="2.4" />
        <T x={-2} y={72} s={8.4}>ne se visse pas</T>
      </g>
    </svg>
  );
}

/* ---------- 4. Zone BTP / servocommandes avec protections ---------- */
const PROT_POS = {
  t1: { k: "mat", x: 24, y: 196, w: 180, h: 46 }, t2: { k: "mat", x: 456, y: 196, w: 180, h: 46 },
  h1: { k: "cap", x: 140, y: 64, left: true }, h2: { k: "cap", x: 180, y: 64 }, h3: { k: "cap", x: 480, y: 64, left: true }, h4: { k: "cap", x: 520, y: 64 },
  h5: { k: "cap", x: 290, y: 30, left: true }, h6: { k: "cap", x: 370, y: 30 },
  e1: { k: "conn", x: 46, y: 118 }, e2: { k: "conn", x: 82, y: 64 }, e3: { k: "conn", x: 580, y: 64 }, e4: { k: "conn", x: 614, y: 118 },
  x1: { k: "cap", x: 556, y: 166 },
};
function Flag({ x: x0, y, left }) {
  const x = left ? x0 - 54 : x0;
  return (
    <g>
      <line x1={x0} y1={y} x2={left ? x0 - 8 : x0 + 6} y2={y + 6} stroke={C.ko} strokeWidth="0.8" />
      <rect x={x + 6} y={y + 3} width="40" height="10" rx="1" fill={C.ko} />
      <text x={x + 26} y={y + 8} fontSize="3.6" fontFamily={MONO} fill="#fff" textAnchor="middle" fontWeight="700">REMOVE BEFORE</text>
      <text x={x + 26} y={y + 12} fontSize="3.6" fontFamily={MONO} fill="#fff" textAnchor="middle" fontWeight="700">FLIGHT</text>
    </g>
  );
}
export function ProtectionsZoneSVG({ removed, lamp, disabled, onRemove, labels }) {
  const item = (id) => {
    const p = PROT_POS[id];
    const r = removed[id];
    const hidden = id === "x1" && !lamp;
    const click = () => { if (!r && !disabled && !hidden) onRemove(id); };
    const ghost = { fill: "none", stroke: C.ok, strokeDasharray: "3 2", strokeWidth: 1 };
    let body;
    if (p.k === "mat") body = r ? <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="4" {...ghost} /> : (
      <g><rect x={p.x} y={p.y} width={p.w} height={p.h} rx="4" fill="#3b4f73" stroke={C.metal} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={p.x + 10 + i * 21} x2={p.x + 10 + i * 21} y1={p.y + 4} y2={p.y + p.h - 4} stroke="#2b3f63" strokeWidth="3" />)}
        <Flag x={p.x + p.w - 50} y={p.y + p.h - 18} /></g>);
    else if (p.k === "conn") body = r ? <circle cx={p.x} cy={p.y} r="9" {...ghost} /> : (
      <g><circle cx={p.x} cy={p.y} r="9" fill={C.ko} stroke="#7a1a22" /><circle cx={p.x} cy={p.y} r="4" fill="#b8323e" /><Flag x={p.x + 4} y={p.y + 4} /></g>);
    else body = r ? <rect x={p.x - 6} y={p.y - 8} width="12" height="14" rx="2" {...ghost} /> : (
      <g opacity={hidden ? 0.12 : 1}><rect x={p.x - 6} y={p.y - 8} width="12" height="14" rx="2" fill={C.ko} stroke="#7a1a22" /><rect x={p.x - 7} y={p.y + 4} width="14" height="3" fill="#b8323e" /><Flag x={p.left ? p.x - 4 : p.x + 4} y={p.y + 6} left={p.left} /></g>);
    return (
      <g key={id} onClick={click} style={{ cursor: r || disabled || hidden ? "default" : "pointer" }} role="button" aria-label={labels?.[id] || id}>
        {id === "x1" && lamp && !r && <circle cx={p.x} cy={p.y} r="16" fill={C.amber} opacity="0.3" />}
        {body}
      </g>
    );
  };
  return (
    <svg viewBox="0 0 660 260" className="h-auto w-full rounded-lg border border-line bg-[#101827]" role="img" aria-label="Zone BTP et servocommandes avec protections temporaires">
      {/* plancher et structure */}
      <rect x="10" y="180" width="640" height="72" fill="#16223a" stroke="#22304d" />
      {[110, 330, 550].map((x) => <rect key={x} x={x - 4} y="180" width="8" height="72" fill="#22304d" />)}
      {/* BTP */}
      <path d="M270,170 L262,90 Q330,40 398,90 L390,170 Z" fill="#2b3f63" stroke={C.metal} />
      <rect x="318" y="20" width="24" height="40" fill={C.metal} stroke={C.line} />
      <T x={330} y={130} a="middle" c={C.ink} w="600">BTP</T>
      {/* lignes hydrauliques réservoir / filtre */}
      <path d="M290,36 V80 H268" stroke={C.sky} strokeWidth="5" fill="none" /><path d="M370,36 V80 H392" stroke={C.amber} strokeWidth="4" fill="none" />
      {/* servocommandes */}
      {[[110, "S1"], [450, "S2"]].map(([x, n]) => (
        <g key={n}>
          <path d={`M${x + 30},70 V110 M${x + 70},70 V110`} stroke={C.sky} strokeWidth="4" />
          <rect x={x} y="110" width="100" height="44" rx="6" fill="#2b3f63" stroke={C.metal} />
          <rect x={x + 100} y="124" width="40" height="14" fill={C.metal2} stroke={C.line} />
          <T x={x + 8} y={136} c={C.ink}>servo {n}</T>
        </g>
      ))}
      {/* harnais */}
      <path d="M20,90 C40,100 40,130 46,118 M46,118 C60,90 70,70 82,64 M640,90 C620,100 620,130 614,118 M614,118 C600,90 590,70 580,64" stroke="#e6edf7" strokeWidth="3" fill="none" opacity="0.5" />
      {/* bouchon caché : dessiné avant le corps S2 pour être masqué sans la lampe */}
      {item("x1")}
      {!lamp && <rect x="540" y="150" width="36" height="28" fill="#101827" />}
      {Object.keys(PROT_POS).filter((k) => k !== "x1").map(item)}
      {lamp && (
        <g>
          <path d="M640,210 L572,172 L560,186 Z" fill={C.amber} opacity="0.22" />
          <rect x="626" y="204" width="24" height="10" rx="3" fill="#5b7299" stroke={C.ink} strokeWidth="0.6" transform="rotate(28 638 209)" />
          <ellipse cx="596" cy="176" rx="9" ry="5" fill="#cfe3ff" stroke={C.ink} transform="rotate(-30 596 176)" />
          <line x1="603" y1="180" x2="624" y2="196" stroke={C.metal} strokeWidth="2" />
          <T x={420} y={256} c={C.amber}>lampe + miroir d'inspection</T>
        </g>
      )}
      <T x={24} y={190} c={C.txt}>tapis mousse</T>
    </svg>
  );
}
