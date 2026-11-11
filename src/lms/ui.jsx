/* Briques d'interface partagées (portail, espace stagiaire, tableau de bord admin) */
import React, { useEffect } from "react";
import { CheckCircle2, XCircle, CircleDashed, X } from "lucide-react";
import { cx, isNum, statutDe, V, R } from "./db.js";

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

function IconBtn({ children, label, onClick, danger }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className={cx("grid h-8 w-8 place-items-center rounded-md border border-line bg-panel2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky", danger ? "text-ko hover:border-ko" : "text-ink hover:border-sky/60")}>{children}</button>;
}


/** Propose un fichier à l'utilisateur : téléchargement navigateur classique */
export async function offerFile(name, content, mime = "application/json") {
  try {
    const blob = new Blob([content], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (e) { return false; }
}

export { Panel, Eyebrow, StatusBadge, ThresholdBar, Btn, Modal, Field, inputCls, Kpi, IconBtn };
