/* ============================================================
   M4A · LABORATOIRE D'ÉTUDE DE PLANS INDUSTRIELS
   3 plans grand format, zones cliquables, 1 atelier verrouillé par plan.
   L'onglet est validé quand les 3 ateliers sont à 85 % ou plus.
   ============================================================ */
import React, { useState, useRef } from "react";
import { CheckCircle2, FileText } from "lucide-react";
import { PlanLab, cx } from "./PlanKit.jsx";
import { PLAN1 } from "./Plan1Ferrure.jsx";
import { PLAN2_AUDIT } from "./Plan2Jonction.jsx";
import { PLAN3 } from "./Plan3Composite.jsx";

const PLANS = [PLAN1, PLAN2_AUDIT, PLAN3];

export default function LaboPlans({ onComplete }) {
  const [cur, setCur] = useState(PLANS[0].id);
  const [ok, setOk] = useState({});
  const sent = useRef(false);
  const pass = (id) => () => setOk((o) => {
    const n = { ...o, [id]: true };
    if (!sent.current && PLANS.every((p) => n[p.id])) { sent.current = true; setTimeout(() => onComplete?.(), 0); }
    return n;
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Plans du laboratoire">
        {PLANS.map((p, i) => (
          <button key={p.id} type="button" role="tab" aria-selected={cur === p.id} onClick={() => setCur(p.id)}
            className={cx("flex items-start gap-3 rounded-xl border p-3 text-left transition", cur === p.id ? "border-sky bg-sky/10" : "border-line bg-panel hover:border-sky/50")}>
            <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold", ok[p.id] ? "bg-ok text-bg" : cur === p.id ? "bg-sky text-bg" : "bg-line text-ink")}>{ok[p.id] ? <CheckCircle2 size={16} /> : i + 1}</span>
            <span className="min-w-0">
              <span className="block font-mono text-[11px] text-muted"><FileText size={11} className="mr-1 inline" />{p.ref}</span>
              <span className="block text-[13.5px] font-semibold leading-snug text-ink">{p.court}</span>
            </span>
          </button>
        ))}
      </div>
      {PLANS.map((p) => (
        <div key={p.id} hidden={cur !== p.id}><PlanLab visible={cur === p.id} plan={{ ...p, onComplete: pass(p.id) }} /></div>
      ))}
    </div>
  );
}
