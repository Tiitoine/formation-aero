import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Lock, ShieldCheck, ShieldAlert, ClipboardList, Shuffle, Eye, Ban, Trophy, Flame, Gauge, AlertTriangle, Zap, Award, ArrowRight } from "lucide-react";

/* ============================================================
   RÈGLES PÉDAGOGIQUES COMMUNES À TOUS LES MODULES
   1. Verrouillage au 1er clic : la première réponse est définitive.
   2. Mélange Fisher-Yates des items ET des propositions à chaque tirage.
   3. Atelier validé à 85 % minimum, sinon relance complète avec un nouveau tirage.
   4. Chaque tentative (atelier ou sprint) est historisée dans la fiche stagiaire.
   ============================================================ */

export const SEUIL = 85;
export const LETTERS = ["A", "B", "C", "D", "E", "F"];
const cx = (...c) => c.filter(Boolean).join(" ");

/** Score brut tronqué au dixième : 84,96 % reste 84,9 % (jamais arrondi vers le haut). */
export const trunc1 = (x) => Math.floor(x * 10) / 10;

/** Entier aléatoire uniforme dans [0, n[ (crypto si disponible). */
function randInt(n) {
  try {
    if (window.crypto?.getRandomValues) {
      const max = Math.floor(0xffffffff / n) * n;
      const buf = new Uint32Array(1);
      do { window.crypto.getRandomValues(buf); } while (buf[0] >= max);
      return buf[0] % n;
    }
  } catch (e) { /* repli Math.random */ }
  return Math.floor(Math.random() * n);
}

/** Mélange de Fisher-Yates (Durstenfeld) : chaque permutation a la même probabilité. */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Mélange qui évite au maximum que deux items consécutifs aient la même catégorie
 * (ex. ne jamais enchaîner 4 « Primaire » de suite dans un atelier de tri).
 * On tire plusieurs permutations Fisher-Yates et on garde la meilleure.
 */
export function shuffleSpread(arr, keyOf) {
  let best = shuffle(arr);
  const runs = (a) => a.reduce((n, x, i) => n + (i > 0 && keyOf(a[i - 1]) === keyOf(x) ? 1 : 0), 0);
  let bestRuns = runs(best);
  for (let t = 0; t < 60 && bestRuns > 0; t++) {
    const c = shuffle(arr);
    const r = runs(c);
    if (r < bestRuns) { best = c; bestRuns = r; }
  }
  return best;
}

/** Permutation mélangée des indices 0..n-1 */
export const permutation = (n) => shuffle(Array.from({ length: n }, (_, i) => i));

/* ============================================================
   SESSION DU MODULE (fournie par App.jsx)
   ============================================================ */
const defaultSession = {
  mode: "libre",           // "stagiaire" | "apercu" | "libre" (hors portail)
  moduleId: null,
  canAttempt: true,        // le sprint final peut-il être passé ?
  blockReason: "",
  logAttempt: () => {},    // historise une tentative d'atelier
};
export const ModuleSessionContext = createContext(defaultSession);
export const useModuleSession = () => useContext(ModuleSessionContext) || defaultSession;

/* ============================================================
   MOTEUR D'ATELIER VERROUILLÉ
   ============================================================ */
/**
 * useAtelier : gère un atelier noté dont chaque réponse est verrouillée au 1er choix.
 *  - lock(key, entry) : enregistre définitivement la réponse de l'item `key`
 *    entry = { ok, q, choix, bonne }
 *  - draw : numéro de tirage (sert de dépendance aux useMemo de mélange)
 *  - relaunch() : relance l'atelier entier avec un nouveau tirage
 * À la fin (toutes les réponses verrouillées) : historisation + onComplete si ≥ 85 %.
 */
export function useAtelier({ id, label, total, onComplete }) {
  const session = useModuleSession();
  const [draw, setDraw] = useState(0);
  const [answers, setAnswers] = useState({});
  const keys = Object.keys(answers);
  const nb = keys.length;
  const good = keys.filter((k) => answers[k].ok).length;
  const finished = total > 0 && nb >= total;
  const score = finished ? (good / total) * 100 : nb ? (good / nb) * 100 : null;
  const passed = finished && score >= SEUIL;
  const logged = useRef(-1);
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  useEffect(() => {
    if (!finished || logged.current === draw) return;
    logged.current = draw;
    const s = trunc1((good / total) * 100);
    session.logAttempt?.({
      kind: "atelier", atelierId: id, label, score: s, total, good,
      statut: s >= SEUIL ? "VALIDE" : "À REVOIR",
      answers: keys.map((k) => answers[k]),
    });
    if (s >= SEUIL) cbRef.current?.();
  }, [finished, draw]);

  const lock = (key, entry) => setAnswers((a) => (key in a ? a : { ...a, [key]: entry }));
  const relaunch = () => { setAnswers({}); setDraw((d) => d + 1); };
  return { draw, answers, lock, isLocked: (k) => k in answers, get: (k) => answers[k], nb, good, total, finished, score, passed, relaunch };
}

/** Bandeau de règle affiché en tête de chaque atelier noté */
export function LockRule({ className = "" }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-line bg-bg px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-muted", className)}>
      <span className="inline-flex items-center gap-1.5"><Lock size={12} className="text-amber" />1er choix verrouillé</span>
      <span className="inline-flex items-center gap-1.5"><Shuffle size={12} className="text-sky" />Ordre tiré au hasard</span>
      <span className="inline-flex items-center gap-1.5"><ShieldCheck size={12} className="text-ok" />Validation ≥ 85 %</span>
    </div>
  );
}

/** Compteur compact : 7/11 répondues · 6 justes */
export function AtelierCounter({ at }) {
  return (
    <span className="ml-auto font-mono text-xs text-muted">
      {at.nb}/{at.total} répondues · <span className="text-ok">{at.good} juste{at.good > 1 ? "s" : ""}</span>
      {at.nb - at.good > 0 && <> · <span className="text-ko">{at.nb - at.good} faux</span></>}
    </span>
  );
}

/** Résultat final d'un atelier + relance avec nouveau tirage */
export function AtelierResult({ at, okText, koText, onRelaunch }) {
  if (!at.finished) return null;
  const s = trunc1(at.score);
  const ok = s >= SEUIL;
  return (
    <div className={cx("flex flex-wrap items-center gap-4 rounded-xl border p-4", ok ? "border-ok/60 bg-ok/10" : "border-ko/60 bg-ko/10")}>
      {ok ? <ShieldCheck size={28} className="text-ok" /> : <ShieldAlert size={28} className="text-ko" />}
      <div className="min-w-0 flex-1">
        <div className={cx("font-mono text-[11px] uppercase tracking-wider", ok ? "text-ok" : "text-ko")}>Résultat de l'atelier · {ok ? "VALIDE" : "À REVOIR"}</div>
        <div className="font-mono text-2xl font-semibold tabular-nums text-ink">{at.good}/{at.total} · {s.toLocaleString("fr-FR")} %</div>
        <div className="text-[13px] text-ink/85">
          {ok ? (okText || "Atelier validé (≥ 85 %). Le résultat est enregistré dans ta fiche.")
            : (koText || "Moins de 85 % : l'atelier n'est pas validé. Relis les corrections en rouge puis relance l'atelier entier : un nouveau tirage aléatoire est effectué.")}
        </div>
      </div>
      <button type="button" onClick={onRelaunch || at.relaunch} className={cx("inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink", ok ? "border border-line bg-panel2 text-ink hover:border-sky/60" : "bg-amber text-bg hover:bg-amber/90")}>
        <RotateCcw size={16} />Relancer l'atelier (nouveau tirage)
      </button>
    </div>
  );
}

/** Bouton de proposition verrouillable (état : idle / good / bad / answer / dim) */
export function OptionButton({ letter, state, onClick, children, compact = false }) {
  return (
    <button type="button" onClick={onClick} disabled={state !== "idle"}
      className={cx("flex items-start gap-2.5 rounded-lg border text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
        compact ? "px-2.5 py-2 text-[13px]" : "p-3 text-[14px]",
        state === "idle" && "border-line bg-bg text-ink hover:border-sky/70",
        state === "good" && "border-ok bg-ok/15 text-ink",
        state === "bad" && "border-ko bg-ko/15 text-ink",
        state === "answer" && "border-ok/70 border-dashed bg-ok/5 text-ink",
        state === "dim" && "cursor-default border-line bg-bg text-muted")}>
      {letter && <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs font-semibold", state === "good" || state === "answer" ? "bg-ok text-bg" : state === "bad" ? "bg-ko text-bg" : "bg-line text-ink")}>{letter}</span>}
      <span className="min-w-0 flex-1">{children}</span>
      {state === "good" && <CheckCircle2 size={17} className="shrink-0 text-ok" />}
      {state === "bad" && <XCircle size={17} className="shrink-0 text-ko" />}
      {state === "idle" ? null : state === "dim" ? <Lock size={13} className="mt-1 shrink-0 text-line" /> : null}
    </button>
  );
}

/** État d'affichage d'une proposition k pour une réponse verrouillée `picked` et une bonne réponse `answer` */
export const optState = (k, picked, answer) => (picked === undefined || picked === null ? "idle" : k === picked ? (k === answer ? "good" : "bad") : k === answer ? "answer" : "dim");

/** Petite puce verrouillable pour les ateliers de tri (catégories) */
export function LockChip({ state, onClick, children }) {
  return (
    <button type="button" onClick={onClick} disabled={state !== "idle"}
      className={cx("rounded-lg border px-3 py-2 text-left text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky",
        state === "idle" && "border-line bg-panel2 text-ink/85 hover:border-sky/60 hover:text-ink",
        state === "good" && "border-ok bg-ok/15 text-ink",
        state === "bad" && "border-ko bg-ko/15 text-ink line-through decoration-ko/70",
        state === "answer" && "border-ok/70 border-dashed bg-ok/5 text-ok",
        state === "dim" && "cursor-default border-line/60 bg-panel2 text-muted/60")}>
      {children}
    </button>
  );
}

/* ============================================================
   CONTRÔLE DE FIN D'ONGLET (QCM court verrouillé)
   questions : [{ q, options, answer, why, hint }]
   ============================================================ */
export function LockedQuickCheck({ id, title, questions, onComplete }) {
  const at = useAtelier({ id: id || title, label: title, total: questions.length, onComplete });
  const drawn = useMemo(
    () => shuffle(questions.map((q, i) => ({ ...q, _i: i, perm: permutation(q.options.length) }))),
    [at.draw] // le tableau de questions est souvent écrit en ligne : on ne remélange qu'à la relance
  );
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ClipboardList size={18} className="text-sky" />
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        <AtelierCounter at={at} />
      </div>
      <LockRule className="mb-4" />
      <div className="flex flex-col gap-5">
        {drawn.map((q, i) => {
          const a = at.get(q._i);
          return (
            <div key={`${at.draw}-${q._i}`} className="flex flex-col gap-2">
              <div className="text-[15px] font-medium leading-snug text-ink">{i + 1}. {q.q}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.perm.map((k, pos) => (
                  <OptionButton key={k} compact letter={LETTERS[pos]} state={optState(k, a?.k, q.answer)}
                    onClick={() => at.lock(q._i, { k, ok: k === q.answer, q: q.q, choix: q.options[k], bonne: q.options[q.answer] })}>
                    {q.options[k]}
                  </OptionButton>
                ))}
              </div>
              {a && (
                <div className={cx("rounded-lg border px-3 py-2 text-[13px] leading-relaxed", a.ok ? "border-ok/40 bg-ok/10 text-ink" : "border-ko/40 bg-ko/10 text-ink")}>
                  {a.ok ? <strong className="text-ok">Exact. </strong> : <strong className="text-ko">Faux, réponse verrouillée. Bonne réponse : {q.options[q.answer]}. </strong>}
                  {q.why || q.hint}
                  {!a.ok && q.hint && q.why && <span className="mt-1 block text-muted">Piste : {q.hint}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-5"><AtelierResult at={at} /></div>
    </div>
  );
}

/* ============================================================
   SPRINT FINAL (QCM noté envoyé au portail)
   questions : [{ tag, scenario, q, options, answer, why, risk }]
   ============================================================ */
export function SprintQCM({ questions, kicker, title, intro, done, onComplete, onScore, SectionHead, ValidatedBanner }) {
  const session = useModuleSession();
  const [draw, setDraw] = useState(0);
  const order = useMemo(() => permutation(questions.length), [draw]);
  const perms = useMemo(() => questions.map((q) => permutation(q.options.length)), [draw]);
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState(null);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [started, setStarted] = useState(false);
  const sent = useRef(-1);

  const total = order.length;
  const finished = started && pos >= total;
  const correct = history.filter((h) => h.ok).length;
  const reliability = history.length ? Math.round((correct / history.length) * 100) : 100;
  const q = started && !finished ? questions[order[pos]] : null;

  useEffect(() => {
    if (!finished || sent.current === draw) return;
    sent.current = draw;
    const s = trunc1((correct / total) * 100);
    const entry = {
      kind: "sprint", atelierId: "sprint", label: "Sprint final (QCM noté)", score: s, total, good: correct,
      statut: s >= SEUIL ? "VALIDE" : "À REVOIR",
      answers: history.map((h) => { const qq = questions[h.qi]; return { q: qq.q, tag: qq.tag, choix: qq.options[h.picked], bonne: qq.options[qq.answer], ok: h.ok }; }),
    };
    if (onScore) onScore(s, entry);
    if (s >= SEUIL) onComplete?.();
  }, [finished, draw]);

  const answer = (k) => {
    if (picked !== null) return;
    setPicked(k);
    const ok = k === q.answer;
    setHistory((h) => [...h, { qi: order[pos], picked: k, ok }]);
    const s = ok ? streak + 1 : 0;
    setStreak(s);
    setBest((b) => Math.max(b, s));
  };
  const next = () => { setPos((p) => p + 1); setPicked(null); };
  const restart = () => {
    if (!session.canAttempt) return;
    /* Journalise le démarrage : un sprint abandonné en cours reste visible du formateur */
    session.logAttempt?.({ kind: "debut", atelierId: "sprint", label: "Sprint final démarré", total: order.length });
    setDraw((d) => d + 1);
    setPos(0); setPicked(null); setHistory([]); setStreak(0); setBest(0); setStarted(true);
  };
  const relTone = reliability >= 85 ? "text-ok" : reliability >= 65 ? "text-amber" : "text-ko";

  const Gate = () => session.mode === "apercu" ? (
    <div className="flex items-start gap-2 rounded-lg border border-sky/50 bg-sky/10 px-4 py-3 text-[13px] text-ink"><Eye size={16} className="mt-0.5 shrink-0 text-sky" /><span><strong>Mode aperçu formateur.</strong> Le sprint est jouable mais aucun score n'est enregistré.</span></div>
  ) : !session.canAttempt ? (
    <div className="flex items-start gap-2 rounded-lg border border-amber/50 bg-amber/10 px-4 py-3 text-[13px] text-ink"><Ban size={16} className="mt-0.5 shrink-0 text-amber" /><span>{session.blockReason || "Nouvelle tentative non autorisée."}</span></div>
  ) : null;

  if (!started) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHead icon={Trophy} kicker={kicker} title={title}>{intro}</SectionHead>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-panel p-4"><Lock size={18} className="text-amber" /><div className="mt-2 font-display text-lg font-semibold text-ink">Réponse définitive</div><p className="text-[13px] text-muted">Ton premier clic est verrouillé. Les questions et les propositions A à D sont mélangées à chaque lancement.</p></div>
          <div className="rounded-xl border border-line bg-panel p-4"><Gauge size={18} className="text-ok" /><div className="mt-2 font-display text-lg font-semibold text-ink">Seuil 85 %</div><p className="text-[13px] text-muted">Score &lt; 85 % = À REVOIR, ≥ 85 % = VALIDE. Le score est enregistré dans ta fiche à la dernière question.</p></div>
          <div className="rounded-xl border border-line bg-panel p-4"><AlertTriangle size={18} className="text-ko" /><div className="mt-2 font-display text-lg font-semibold text-ink">Conséquence terrain</div><p className="text-[13px] text-muted">Chaque erreur est reliée à la non-conformité qu'elle aurait causée sur chaîne.</p></div>
        </div>
        <Gate />
        <div><BigButton onClick={restart} disabled={!session.canAttempt} tone="amber"><Zap size={16} /> Lancer le sprint ({total} questions)</BigButton></div>
        {ValidatedBanner && <ValidatedBanner done={done} label="Sprint réussi avec au moins 85 %." />}
      </div>
    );
  }

  if (finished) {
    const s = trunc1((correct / total) * 100);
    const ok = s >= SEUIL;
    const errors = history.filter((h) => !h.ok);
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-line bg-panel p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Award size={44} className={ok ? "text-ok" : "text-ko"} />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber">Débriefing du sprint</div>
              <div className={cx("font-display text-3xl font-semibold", ok ? "text-ok" : "text-ko")}>{ok ? "VALIDE" : "À REVOIR"}</div>
              <p className="text-[14px] text-ink/85">{ok ? "Score ≥ 85 % : module validé et enregistré dans ta fiche." : "Score < 85 % : module non validé. Relis les corrections ci-dessous et les onglets concernés avant une nouvelle tentative."}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-line bg-bg px-3 py-2"><div className="font-mono text-2xl font-semibold tabular-nums text-ink">{correct}/{total}</div><div className="font-mono text-[10px] uppercase text-muted">Bonnes</div></div>
              <div className="rounded-lg border border-line bg-bg px-3 py-2"><div className={cx("font-mono text-2xl font-semibold tabular-nums", ok ? "text-ok" : "text-ko")}>{s.toLocaleString("fr-FR")}%</div><div className="font-mono text-[10px] uppercase text-muted">Score</div></div>
              <div className="rounded-lg border border-line bg-bg px-3 py-2"><div className="font-mono text-2xl font-semibold tabular-nums text-amber">{best}</div><div className="font-mono text-[10px] uppercase text-muted">Meilleure série</div></div>
            </div>
          </div>
        </div>
        {errors.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ko">À revoir · {errors.length} point{errors.length > 1 ? "s" : ""}</div>
            {errors.map((h) => {
              const qq = questions[h.qi];
              return (
                <div key={h.qi} className="rounded-xl border border-line bg-panel p-4">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{qq.tag}</div>
                  <div className="text-[14px] font-semibold text-ink">{qq.q}</div>
                  <div className="mt-1 text-[13px] text-ko">Ta réponse : {qq.options[h.picked]}</div>
                  <div className="text-[13px] text-ok">Bonne réponse : {qq.options[qq.answer]}</div>
                  <div className="mt-1 text-[13px] text-ink/80">{qq.why}</div>
                </div>
              );
            })}
          </div>
        )}
        <Gate />
        {session.canAttempt && <div><BigButton onClick={restart} tone="amber"><RotateCcw size={16} /> Nouvelle tentative (nouveau tirage)</BigButton></div>}
        {ValidatedBanner && <ValidatedBanner done={done} label="Sprint réussi avec au moins 85 %." />}
      </div>
    );
  }

  const ok = picked !== null && picked === q.answer;
  const perm = perms[order[pos]];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-line bg-panel p-3"><div className="font-mono text-[10px] uppercase tracking-wider text-muted">Question</div><div className="font-mono text-xl font-semibold tabular-nums text-ink">{pos + 1}<span className="text-muted">/{total}</span></div></div>
        <div className="rounded-xl border border-line bg-panel p-3"><div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted"><Flame size={12} className={streak > 0 ? "text-amber" : "text-muted"} /> Série</div><div className={cx("font-mono text-xl font-semibold tabular-nums", streak >= 3 ? "text-amber" : "text-ink")}>{streak}</div></div>
        <div className="rounded-xl border border-line bg-panel p-3"><div className="font-mono text-[10px] uppercase tracking-wider text-muted">Taux de réussite</div><div className={cx("font-mono text-xl font-semibold tabular-nums", relTone)}>{reliability}%</div></div>
      </div>
      <div className="flex gap-1" aria-label="Progression du sprint">
        {order.map((qi, i) => { const h = history[i]; return <div key={qi} className={cx("h-1.5 flex-1 rounded-full", h ? (h.ok ? "bg-ok" : "bg-ko") : i === pos ? "bg-sky" : "bg-line")} />; })}
      </div>
      <div className="rounded-xl border border-line bg-panel p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-sky/50 bg-sky/10 px-2 py-0.5 font-mono text-[11px] text-sky">{q.tag}</span>
          {q.scenario && <span className="rounded-md border border-amber/50 bg-amber/10 px-2 py-0.5 font-mono text-[11px] text-amber">Mise en situation</span>}
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted"><Lock size={11} />1er clic définitif</span>
        </div>
        <h3 className="font-display text-xl font-semibold leading-snug text-ink sm:text-2xl" style={{ textWrap: "pretty" }}>{q.q}</h3>
        <div className="mt-5 flex flex-col gap-2">
          {perm.map((k, i) => (
            <OptionButton key={k} letter={LETTERS[i]} state={optState(k, picked === null ? undefined : picked, q.answer)} onClick={() => answer(k)}>{q.options[k]}</OptionButton>
          ))}
        </div>
        {picked !== null && (
          <div className="mt-5 flex flex-col gap-3">
            <div className={cx("rounded-lg border p-4", ok ? "border-ok/50 bg-ok/10" : "border-ko/50 bg-ko/10")}>
              <div className="mb-1 flex items-center gap-2">{ok ? <CheckCircle2 size={18} className="text-ok" /> : <XCircle size={18} className="text-ko" />}<span className={cx("font-display text-lg font-semibold", ok ? "text-ok" : "text-ko")}>{ok ? "Bonne réponse" : "Réponse incorrecte (verrouillée)"}</span></div>
              {!ok && <div className="mb-1 text-[13px] text-ok">Bonne réponse : {q.options[q.answer]}</div>}
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Explication technique</div>
              <p className="mt-1 text-[14px] leading-relaxed text-ink">{q.why}</p>
            </div>
            {q.risk && (
              <div className="rounded-lg border border-amber/40 bg-amber/10 p-4">
                <div className="mb-1 flex items-center gap-2"><AlertTriangle size={16} className="text-amber" /><span className="font-mono text-[11px] uppercase tracking-wider text-amber">{ok ? "Ce que tu viens d'éviter sur chaîne" : "Ce que ton erreur aurait provoqué sur chaîne"}</span></div>
                <p className="text-[14px] leading-relaxed text-ink">{q.risk}</p>
              </div>
            )}
            <div><BigButton onClick={next}>{pos + 1 === total ? "Voir le débriefing" : "Question suivante"} <ArrowRight size={16} /></BigButton></div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BigButton({ onClick, children, disabled, tone = "blue" }) {
  const t = tone === "green" ? "bg-ok text-bg hover:bg-ok/90" : tone === "amber" ? "bg-amber text-bg hover:bg-amber/90" : "bg-sky text-bg hover:bg-sky/90";
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={cx("inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink", disabled ? "cursor-not-allowed bg-line text-muted" : t)}>
      {children}
    </button>
  );
}
