/* ============================================================
   LABORATOIRE D'ÉTUDE DE PLANS · briques de dessin communes
   Feuille de liasse BE (cadre, repères de zones, cartouche), cotes,
   cadres de tolérance ISO GPS, repères de référence, bulles de
   nomenclature et zones cliquables d'analyse.
   Références et valeurs : support de formation, le plan réel fait foi.
   ============================================================ */
import React, { useState, useEffect } from "react";
import { Maximize2, X, MousePointerClick, BookOpen, Wrench, AlertTriangle } from "lucide-react";
import { LockedQuickCheck } from "../../lib/pedago.jsx";

export const cx = (...c) => c.filter(Boolean).join(" ");
/* Encre et papier d'une liasse BE */
export const P = {
  paper: "#f3f0e6", ink: "#1b2533", thin: "#45536a", faint: "#9aa5b5", hatch: "#6b788c",
  red: "#c0392b", blue: "#1f6fd1", hot: "#1f6fd1", hotFill: "rgba(31,111,209,0.12)", sel: "#e67e22",
  cfrp: "#3a3f47", ti: "#8c96a3", alu: "#c9d2dc", bronze: "#c8a165", glass: "#7fb2d9", core: "#e8d9a8", mastic: "#8e6fd6",
};
export const FONT = "Arial Narrow, Roboto Condensed, Arial, sans-serif";

/* ---------- motifs ---------- */
export function PlanDefs() {
  return (
    <defs>
      <pattern id="ph45" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke={P.hatch} strokeWidth="0.8" /></pattern>
      <pattern id="ph135" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="7" stroke={P.hatch} strokeWidth="0.8" /></pattern>
      <pattern id="phTi" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke={P.ink} strokeWidth="0.7" /><line x1="2.5" y1="0" x2="2.5" y2="5" stroke={P.ink} strokeWidth="0.3" /></pattern>
      <pattern id="phHex" width="17.32" height="30" patternUnits="userSpaceOnUse">
        <path d="M8.66,0 L17.32,5 L17.32,15 L8.66,20 L0,15 L0,5 Z M8.66,20 L8.66,30" fill="none" stroke="#a08a48" strokeWidth="0.7" />
      </pattern>
      <pattern id="phCfrp" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#59606b" /><line x1="0" y1="3" x2="6" y2="3" stroke="#7a828e" strokeWidth="0.6" /></pattern>
      <marker id="pArr" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0,0.8 L9,4 L0,7.2 z" fill={P.ink} /></marker>
      <marker id="pArrR" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0,0.8 L9,4 L0,7.2 z" fill={P.red} /></marker>
      <marker id="pDot" markerWidth="6" markerHeight="6" refX="3" refY="3" markerUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" fill={P.ink} /></marker>
    </defs>
  );
}

/* ---------- texte ---------- */
export const T = ({ x, y, children, s = 13, a = "start", c = P.ink, w = 400, it = false, rot }) => (
  <text x={x} y={y} fontSize={s} fontFamily={FONT} fill={c} textAnchor={a} fontWeight={w} fontStyle={it ? "italic" : "normal"} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>{children}</text>
);

/* ---------- feuille de liasse : cadre, zones, cartouche ---------- */
const COLS = 8, ROWS = 6;
export function Sheet({ W = 1400, H = 900, children, cartouche, title, onBackground }) {
  const m = 22;
  const cw = (W - 2 * m) / COLS, rh = (H - 2 * m) / ROWS;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" role="img" aria-label={title} style={{ background: P.paper }}>
      <PlanDefs />
      <rect x="0" y="0" width={W} height={H} fill={P.paper} onClick={onBackground} />
      <rect x={6} y={6} width={W - 12} height={H - 12} fill="none" stroke={P.ink} strokeWidth="0.6" />
      <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} fill="none" stroke={P.ink} strokeWidth="2" />
      {Array.from({ length: COLS }, (_, i) => (
        <g key={"c" + i}>
          {i > 0 && <><line x1={m + i * cw} y1={6} x2={m + i * cw} y2={m} stroke={P.ink} strokeWidth="0.6" /><line x1={m + i * cw} y1={H - m} x2={m + i * cw} y2={H - 6} stroke={P.ink} strokeWidth="0.6" /></>}
          <T x={m + (i + 0.5) * cw} y={18} s={10} a="middle">{COLS - i}</T>
          <T x={m + (i + 0.5) * cw} y={H - 9} s={10} a="middle">{COLS - i}</T>
        </g>
      ))}
      {Array.from({ length: ROWS }, (_, i) => (
        <g key={"r" + i}>
          {i > 0 && <><line x1={6} y1={m + i * rh} x2={m} y2={m + i * rh} stroke={P.ink} strokeWidth="0.6" /><line x1={W - m} y1={m + i * rh} x2={W - 6} y2={m + i * rh} stroke={P.ink} strokeWidth="0.6" /></>}
          <T x={14} y={m + (i + 0.5) * rh + 4} s={10} a="middle">{"FEDCBA"[i]}</T>
          <T x={W - 14} y={m + (i + 0.5) * rh + 4} s={10} a="middle">{"FEDCBA"[i]}</T>
        </g>
      ))}
      {children}
      {cartouche && <Cartouche W={W} H={H} m={m} {...cartouche} />}
    </svg>
  );
}

/* Symbole de projection européenne (1er dièdre) */
export function ProjEuro({ x, y }) {
  return (
    <g stroke={P.ink} strokeWidth="1" fill="none">
      <path d={`M${x},${y - 7} L${x + 22},${y - 12} L${x + 22},${y + 12} L${x},${y + 7} Z`} />
      <line x1={x - 4} y1={y} x2={x + 26} y2={y} strokeDasharray="5 2 1 2" strokeWidth="0.6" />
      <circle cx={x + 44} cy={y} r={12} /><circle cx={x + 44} cy={y} r={6} />
      <line x1={x + 28} y1={y} x2={x + 60} y2={y} strokeDasharray="5 2 1 2" strokeWidth="0.6" />
    </g>
  );
}

/* Cartouche normé (coin inférieur droit) */
function Cartouche({ W, H, m, designation, reference, indice = "A", matiere, traitement, tolerances, echelle = "2:1", masse, folio = "1/1", appareil, format = "A3" }) {
  const w = 470, h = 168, x = W - m - w, y = H - m - h;
  const L = (x1, y1, x2, y2, sw = 0.8) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.ink} strokeWidth={sw} />;
  const F = ({ fx, fy, k, v, vs = 13, vw = 600 }) => (<g><T x={fx + 5} y={fy + 11} s={8.5} c={P.thin}>{k}</T><T x={fx + 5} y={fy + 27} s={vs} w={vw}>{v}</T></g>);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={P.paper} stroke={P.ink} strokeWidth="2" />
      {L(x, y + 34, x + w, y + 34)}{L(x, y + 68, x + w, y + 68)}{L(x, y + 102, x + w, y + 102)}{L(x, y + 136, x + w, y + 136)}
      {L(x + 300, y, x + 300, y + 136)}{L(x + 150, y + 68, x + 150, y + 136)}{L(x + 385, y + 68, x + 385, y + 136)}{L(x + 235, y + 136, x + 235, y + h)}{L(x + 340, y + 136, x + 340, y + h)}
      <F fx={x} fy={y} k="DÉSIGNATION" v={designation} vs={12.5} />
      <F fx={x + 300} fy={y} k="APPAREIL / ATA" v={appareil} vs={12} />
      <F fx={x} fy={y + 34} k="RÉFÉRENCE (P/N)" v={reference} vs={16} vw={700} />
      <F fx={x + 300} fy={y + 34} k="INDICE" v={indice} vs={16} vw={700} />
      <F fx={x} fy={y + 68} k="MATIÈRE" v={matiere} vs={11.5} />
      <F fx={x + 150} fy={y + 68} k="TOLÉRANCES GÉNÉRALES" v={tolerances} vs={11.5} />
      <F fx={x + 300} fy={y + 68} k="ÉCHELLE" v={echelle} />
      <F fx={x + 385} fy={y + 68} k="FORMAT" v={format} />
      <F fx={x} fy={y + 102} k="TRAITEMENT DE SURFACE" v={traitement} vs={10.5} />
      <F fx={x + 300} fy={y + 102} k="MASSE" v={masse} vs={11.5} />
      <F fx={x + 385} fy={y + 102} k="FOLIO" v={folio} />
      <T x={x + 6} y={y + 150} s={8.5} c={P.thin}>DESSINÉ · VÉRIFIÉ · APPROUVÉ BE (DOA)</T>
      <T x={x + 6} y={y + 162} s={9} w={600}>FORMATION · DOCUMENT NON CONTRACTUEL</T>
      <T x={x + 241} y={y + 147} s={8} c={P.thin}>PROJECTION</T>
      <g transform={`translate(${x + 262} ${y + 157}) scale(0.62) translate(${-(x + 262)} ${-(y + 157)})`}><ProjEuro x={x + 262} y={y + 157} /></g>
      <T x={x + 346} y={y + 152} s={11} w={700}>AIRBUS HELICOPTERS</T>
      <T x={x + 346} y={y + 164} s={8.5} c={P.thin}>liasse de formation</T>
    </g>
  );
}

/* ---------- cotation ---------- */
/* Cote linéaire entre (x1,y1) et (x2,y2), décalée de off perpendiculairement */
export function Dim({ x1, y1, x2, y2, off = 30, text, box = false, s = 13, c = P.ink, tx = 0, ty = 0 }) {
  const horiz = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  const a = horiz ? [x1, y1 + off] : [x1 + off, y1];
  const b = horiz ? [x2, y1 + off] : [x1 + off, y2];
  const mx = (a[0] + b[0]) / 2 + tx, my = (a[1] + b[1]) / 2 + ty;
  const ext = (px, py, qx, qy) => <line x1={px} y1={py} x2={qx} y2={qy} stroke={P.thin} strokeWidth="0.6" />;
  const sgn = off >= 0 ? 1 : -1;
  return (
    <g>
      {horiz ? <>{ext(x1, y1 + 3 * sgn, x1, a[1] + 5 * sgn)}{ext(x2, y2 + 3 * sgn, x2, b[1] + 5 * sgn)}</> : <>{ext(x1 + 3 * sgn, y1, a[0] + 5 * sgn, y1)}{ext(x2 + 3 * sgn, y2, b[0] + 5 * sgn, y2)}</>}
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth="0.8" markerStart="url(#pArr)" markerEnd="url(#pArr)" />
      {horiz ? <DimText x={mx} y={my - 5} text={text} box={box} s={s} c={c} /> : <DimText x={mx - 5} y={my} text={text} box={box} s={s} c={c} rot={-90} />}
    </g>
  );
}
function DimText({ x, y, text, box, s, c, rot }) {
  const w = String(text).length * s * 0.5 + 8;
  return (
    <g transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
      {box && <rect x={x - w / 2} y={y - s} width={w} height={s + 5} fill={P.paper} stroke={c} strokeWidth="0.9" />}
      <T x={x} y={y} s={s} a="middle" c={c}>{text}</T>
    </g>
  );
}
/* Ligne de rappel avec texte (flèche vers la cible) */
export function Leader({ x1, y1, x2, y2, children, a = "start", s = 13, c = P.ink, w = 400, dot = false }) {
  return (
    <g>
      <polyline points={`${x1},${y1} ${x2},${y2} ${x2 + (a === "end" ? -14 : 14)},${y2}`} fill="none" stroke={c} strokeWidth="0.8" markerStart={dot ? "url(#pDot)" : "url(#pArr)"} />
      <T x={x2 + (a === "end" ? -18 : 18)} y={y2 + 4} s={s} a={a} c={c} w={w}>{children}</T>
    </g>
  );
}

/* ---------- ISO GPS ---------- */
const SYM = { pos: "⌖", perp: "⊥", flat: "⏥", par: "∥" };
/* Cadre de tolérance : cells = ["pos", "Ø0,1 Ⓜ", "A", "B", "C"] */
export function Gdt({ x, y, cells, s = 13, h = 22 }) {
  let cx0 = x;
  const widths = cells.map((c, i) => (i === 0 ? 26 : Math.max(22, String(c).length * s * 0.55 + 10)));
  return (
    <g>
      {cells.map((c, i) => {
        const w = widths[i];
        const el = (
          <g key={i}>
            <rect x={cx0} y={y} width={w} height={h} fill={P.paper} stroke={P.ink} strokeWidth="1" />
            {i === 0 ? <PosSym kind={c} x={cx0 + w / 2} y={y + h / 2} /> : <T x={cx0 + w / 2} y={y + h / 2 + 4.5} s={s} a="middle">{c}</T>}
          </g>
        );
        cx0 += w;
        return el;
      })}
    </g>
  );
}
function PosSym({ kind, x, y }) {
  if (kind === "pos") return <g stroke={P.ink} strokeWidth="1" fill="none"><circle cx={x} cy={y} r="5.5" /><line x1={x - 9} y1={y} x2={x + 9} y2={y} /><line x1={x} y1={y - 9} x2={x} y2={y + 9} /></g>;
  if (kind === "perp") return <g stroke={P.ink} strokeWidth="1.3"><line x1={x - 7} y1={y + 7} x2={x + 7} y2={y + 7} /><line x1={x} y1={y + 7} x2={x} y2={y - 7} /></g>;
  return <T x={x} y={y + 5} s={14} a="middle">{SYM[kind] || kind}</T>;
}
/* Repère de référence (triangle noirci + lettre encadrée), dir = sens de la tige */
export function Datum({ x, y, letter, dir = "down", len = 26 }) {
  const d = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[dir];
  const ex = x + d[0] * len, ey = y + d[1] * len;
  const tri = dir === "down" || dir === "up"
    ? `${x - 7},${y} ${x + 7},${y} ${x},${y + d[1] * 10}`
    : `${x},${y - 7} ${x},${y + 7} ${x + d[0] * 10},${y}`;
  return (
    <g>
      <polygon points={tri} fill={P.ink} />
      <line x1={x} y1={y} x2={ex} y2={ey} stroke={P.ink} strokeWidth="1" />
      <rect x={ex - 11 + d[0] * 11} y={ey - 11 + d[1] * 11} width="22" height="22" fill={P.paper} stroke={P.ink} strokeWidth="1.2" />
      <T x={ex + d[0] * 11} y={ey + d[1] * 11 + 5} s={14} a="middle" w={700}>{letter}</T>
    </g>
  );
}
/* État de surface ISO 1302 : √ avec Ra */
export function Rough({ x, y, ra, rot = 0 }) {
  return (
    <g transform={`rotate(${rot} ${x} ${y})`} stroke={P.ink} strokeWidth="1" fill="none">
      <polyline points={`${x - 8},${y - 9} ${x},${y} ${x + 16},${y - 26} ${x + 50},${y - 26}`} />
      <line x1={x - 8} y1={y - 9} x2={x + 6} y2={y - 9} />
      <text x={x + 20} y={y - 30} fontSize="12" fontFamily={FONT} fill={P.ink} stroke="none">Ra {ra}</text>
    </g>
  );
}
/* Bulle de nomenclature */
export function Bubble({ x, y, n, tx, ty }) {
  return (
    <g>
      {tx !== undefined && <line x1={x} y1={y} x2={tx} y2={ty} stroke={P.ink} strokeWidth="0.8" markerEnd="url(#pDot)" />}
      <circle cx={x} cy={y} r="13" fill={P.paper} stroke={P.ink} strokeWidth="1.2" />
      <T x={x} y={y + 5} s={13} a="middle" w={700}>{n}</T>
    </g>
  );
}
/* Symbole de masse électrique (métallisation) */
export function Ground({ x, y }) {
  return (
    <g stroke={P.ink} strokeWidth="1.3">
      <line x1={x} y1={y - 14} x2={x} y2={y} /><line x1={x - 11} y1={y} x2={x + 11} y2={y} /><line x1={x - 7} y1={y + 4} x2={x + 7} y2={y + 4} /><line x1={x - 3} y1={y + 8} x2={x + 3} y2={y + 8} />
    </g>
  );
}
/* Trait d'axe mixte */
export const Axis = ({ x1, y1, x2, y2 }) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.thin} strokeWidth="0.6" strokeDasharray="14 3 2 3" />;

/* ---------- zone cliquable d'analyse ---------- */
export function Hot({ x, y, n, active, onPick }) {
  return (
    <g onClick={(e) => { e.stopPropagation(); onPick(n); }} style={{ cursor: "pointer" }} role="button" aria-label={`Zone d'analyse ${n}`} tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick(n)}>
      <circle cx={x} cy={y} r="17" fill={active ? P.sel : P.hot} opacity={active ? 1 : 0.92} />
      <circle cx={x} cy={y} r="22" fill="none" stroke={active ? P.sel : P.hot} strokeWidth="1.5" opacity="0.55">
        {!active && <animate attributeName="r" values="18;26;18" dur="2.4s" repeatCount="indefinite" />}
      </circle>
      <text x={x} y={y + 5} fontSize="14" fontFamily="JetBrains Mono, monospace" fontWeight="700" fill="#fff" textAnchor="middle">{n}</text>
    </g>
  );
}
/* Zone surlignée autour d'une région du plan */
export const Spot = ({ x, y, w, h, on }) => on ? <rect x={x} y={y} width={w} height={h} rx="8" fill="rgba(230,126,34,0.12)" stroke={P.sel} strokeWidth="2" strokeDasharray="7 4" pointerEvents="none" /> : null;

/* ============================================================
   VISIONNEUSE + FICHE DE ZONE + ATELIER
   plan = { id, titre, sousTitre, Drawing, zones:[{n,titre,lecture,gamme,piege}], questions, quizTitle }
   ============================================================ */
export function PlanLab({ plan, children, visible = true }) {
  const [sel, setSel] = useState(null);
  const [big, setBig] = useState(false);
  const zone = plan.zones.find((z) => z.n === sel);
  useEffect(() => {
    if (!big) return undefined;
    const k = (e) => e.key === "Escape" && setBig(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [big]);
  const D = plan.Drawing;
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-line bg-panel p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded border border-sky/40 bg-sky/10 px-2 py-0.5 font-mono text-[11px] text-sky">{plan.ref}</span>
          <h3 className="min-w-0 flex-1 font-display text-lg font-semibold text-ink">{plan.titre}</h3>
          <span className="hidden items-center gap-1 text-[12px] text-muted sm:inline-flex"><MousePointerClick size={14} />Clique sur les repères bleus</span>
          <button type="button" onClick={() => setBig(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3 py-1.5 text-[13px] font-semibold text-ink hover:border-sky/60"><Maximize2 size={14} />Grand format</button>
        </div>
        <div className="overflow-hidden rounded-lg border border-line">{visible && !big && <D sel={sel} onPick={setSel} />}{(!visible || big) && <div className="aspect-[14/9] bg-[#f3f0e6]" />}</div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {plan.zones.map((z) => (
            <button key={z.n} type="button" onClick={() => setSel(z.n)} className={cx("rounded-md border px-2.5 py-1 text-[12px] font-medium transition", sel === z.n ? "border-amber bg-amber/15 text-ink" : "border-line bg-bg text-muted hover:border-sky/60 hover:text-ink")}>
              <span className="mr-1 font-mono font-semibold text-sky">{z.n}</span>{z.titre}
            </button>
          ))}
        </div>
      </div>

      {zone ? (
        <div className="grid gap-3 rounded-xl border border-amber/50 bg-amber/5 p-4 lg:grid-cols-3">
          <div className="lg:col-span-3 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber font-mono text-sm font-bold text-bg">{zone.n}</span><h4 className="font-display text-lg font-semibold text-ink">{zone.titre}</h4></div>
          <div><div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-sky"><BookOpen size={13} />Ce que dit le plan</div><p className="text-[13.5px] leading-relaxed text-ink/90">{zone.lecture}</p></div>
          <div><div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ok"><Wrench size={13} />Ce que tu écris dans la gamme</div><p className="text-[13.5px] leading-relaxed text-ink/90">{zone.gamme}</p></div>
          <div><div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ko"><AlertTriangle size={13} />Piège de lecture</div><p className="text-[13.5px] leading-relaxed text-ink/90">{zone.piege}</p></div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line px-4 py-3 text-[13px] text-muted">Sélectionne un repère sur le plan pour afficher sa fiche d'analyse : lecture du plan, traduction en gamme et piège à éviter.</div>
      )}

      {children}

      {plan.questions && <LockedQuickCheck id={plan.id} title={plan.quizTitle} questions={plan.questions} onComplete={plan.onComplete} />}

      {big && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg" role="dialog" aria-modal="true" aria-label={plan.titre}>
          <div className="flex items-center gap-3 border-b border-line bg-panel px-4 py-2">
            <span className="font-mono text-[12px] text-sky">{plan.ref}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{plan.titre}</span>
            {zone && <span className="hidden truncate text-[12px] text-amber md:block">Zone {zone.n} · {zone.titre}</span>}
            <button type="button" onClick={() => setBig(false)} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm text-ink hover:border-ko/60"><X size={15} />Fermer</button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <div style={{ width: "max(100%, 1900px)" }}><D sel={sel} onPick={setSel} /></div>
          </div>
          {zone && <div className="max-h-[28vh] overflow-auto border-t border-line bg-panel px-4 py-2 text-[13px] text-ink/90"><strong className="text-amber">{zone.n} · {zone.titre} : </strong>{zone.lecture} <span className="text-ok">Gamme : </span>{zone.gamme}</div>}
        </div>
      )}
    </div>
  );
}
