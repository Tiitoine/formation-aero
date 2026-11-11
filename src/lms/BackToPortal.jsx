import React from "react";

/* Bouton injecté dans l'en-tête de chaque module (M1 à M4B) */
export default function BackToPortal({ onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-sky/50 bg-sky/10 px-3 text-[13px] font-semibold text-ink transition hover:bg-sky/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
    >
      ← Retour au Portail LMS
    </button>
  );
}
