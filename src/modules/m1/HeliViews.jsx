/* ============================================================
   M1 · SILHOUETTES TECHNIQUES PARTAGÉES (bimoteur type H145 / H160)
   Coordonnées en mm : X0 en avant du nez → Fenestron, Y ± (−gauche / +droite),
   Z de la barque (0) vers la tête rotor. Les régions respectent la fonction
   locate() de l'atelier trièdre (cabine X 500-6200, Z 600-2300, etc.).
   Dessin de principe, proportions indicatives.
   ============================================================ */
import React from "react";

export const HX = 14000, HY = 2000, HZ = 4000;
const K = { line: "#5b7299", thin: "#3a4c70", fill: "#16223a", fill2: "#1b2a47", glass: "#17304f", hl: "#2b5c99", hlS: "#3b9eff", ok: "#3ddc97", amber: "#ffb020", ko: "#ff5d6c", txt: "#8fa0bd", ink: "#e6edf7" };
const MONO = "JetBrains Mono, monospace";
const FEN = [0, 32, 68, 101, 140, 175, 212, 247, 284, 323];

/* étiquette de zone posée sur le dessin */
function ZoneTag({ x, y, code, on }) {
  const w = code.length * 7.2 + 10;
  return (
    <g pointerEvents="none">
      <rect x={x - w / 2} y={y - 9} width={w} height="17" rx="3" fill={on ? K.hlS : "#0b1220"} fillOpacity={on ? 1 : 0.85} stroke={on ? K.hlS : K.amber} strokeWidth="1" />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily={MONO} fill={on ? "#0b1220" : K.amber}>{code}</text>
    </g>
  );
}

/* ---------------- VUE DE PROFIL GAUCHE ---------------- */
export function HeliSide({ sx, sz, hl = [], overlay = [], zones = null }) {
  const P = (x, z) => `${sx(x)},${sz(z)}`;
  const on = (k) => hl.includes(k);
  const f = (k, d = K.fill) => (on(k) ? K.hl : d);
  const s = (k) => (on(k) ? K.hlS : K.line);
  const r = (mm) => Math.abs(sx(mm) - sx(0));
  const fenC = [12500, 2300], fenR = r(520);
  return (
    <g strokeLinejoin="round">
      {/* pales rotor principal + moyeu */}
      <line x1={sx(-1200)} y1={sz(3420)} x2={sx(8200)} y2={sz(3420)} stroke={on("rotor") ? K.hlS : "#3b9eff"} strokeOpacity={on("rotor") ? 1 : 0.55} strokeWidth="2.5" strokeLinecap="round" />
      <rect x={sx(3430)} y={sz(3400)} width={r(140)} height={sz(2950) - sz(3400)} fill={f("rotor", K.fill2)} stroke={s("rotor")} />
      <path d={`M${P(3050, 3380)} L${P(3950, 3380)} L${P(3850, 3470)} L${P(3150, 3470)} Z`} fill={f("rotor", K.fill2)} stroke={s("rotor")} />
      <rect x={sx(3250)} y={sz(3170)} width={r(500)} height={sz(3110) - sz(3170)} fill={f("rotor", K.fill2)} stroke={s("rotor")} />
      {/* capotage BTP (plancher mécanique) */}
      <path d={`M${P(2600, 2300)} C${P(2750, 2800)} ${P(3150, 2980)} ${P(3500, 2990)} C${P(3950, 2990)} ${P(4400, 2850)} ${P(4600, 2300)} Z`} fill={f("pm", K.fill2)} stroke={s("pm")} />
      {[3000, 3250, 3500, 3750, 4000].map((x) => <line key={x} x1={sx(x)} y1={sz(2380)} x2={sx(x)} y2={sz(2800)} stroke={K.thin} strokeWidth="0.8" />)}
      {/* capot moteur + entrée d'air + échappement */}
      <path d={`M${P(4600, 2300)} L${P(4700, 2820)} C${P(5200, 2930)} ${P(6100, 2930)} ${P(6500, 2800)} L${P(6900, 2300)} Z`} fill={f("eng", K.fill2)} stroke={s("eng")} />
      <path d={`M${P(4720, 2420)} L${P(4950, 2420)} L${P(4950, 2760)} L${P(4770, 2760)} Z`} fill="#0b1220" stroke={s("eng")} strokeWidth="0.8" />
      {[2480, 2560, 2640, 2720].map((z) => <line key={z} x1={sx(4740)} y1={sz(z)} x2={sx(4950)} y2={sz(z)} stroke={K.thin} strokeWidth="0.7" />)}
      <path d={`M${P(6300, 2780)} C${P(6500, 2950)} ${P(6750, 3000)} ${P(7000, 2980)} L${P(7000, 2860)} C${P(6800, 2870)} ${P(6600, 2820)} ${P(6450, 2720)} Z`} fill="#0b1220" stroke={s("eng")} />
      {/* poutre de queue */}
      <path d={`M${P(6200, 2380)} L${P(11800, 2260)} L${P(11800, 1900)} L${P(6200, 1520)} Z`} fill={f("boom", K.fill)} stroke={s("boom")} />
      <path d={`M${P(6900, 2300)} L${P(6200, 2380)}`} stroke={K.line} />
      {/* stabilisateur + dérives latérales */}
      <path d={`M${P(10150, 2040)} C${P(10300, 2110)} ${P(10650, 2100)} ${P(10850, 2030)} C${P(10650, 1990)} ${P(10300, 1990)} ${P(10150, 2040)} Z`} fill={f("boom", K.fill2)} stroke={s("boom")} />
      <path d={`M${P(10600, 1820)} L${P(10820, 1850)} L${P(10860, 2290)} L${P(10660, 2260)} Z`} fill={f("boom", K.fill2)} stroke={s("boom")} strokeOpacity="0.8" />
      {/* dérive carénée + Fenestron */}
      <path d={`M${P(11700, 2270)} L${P(12250, 3780)} L${P(12950, 3860)} L${P(13250, 3650)} L${P(13300, 1750)} L${P(12650, 1480)} L${P(11800, 1880)} Z`} fill={f("fen", K.fill)} stroke={s("fen")} />
      <circle cx={sx(fenC[0])} cy={sz(fenC[1])} r={fenR + 4} fill="none" stroke={s("fen")} strokeWidth="2.5" />
      <circle cx={sx(fenC[0])} cy={sz(fenC[1])} r={fenR} fill="#0b1220" stroke={on("fen") ? K.hlS : K.amber} strokeWidth="1" />
      {FEN.map((a) => { const t = (a * Math.PI) / 180; return <line key={a} x1={sx(fenC[0]) + fenR * 0.25 * Math.cos(t)} y1={sz(fenC[1]) + fenR * 0.25 * Math.sin(t)} x2={sx(fenC[0]) + fenR * 0.92 * Math.cos(t)} y2={sz(fenC[1]) + fenR * 0.92 * Math.sin(t)} stroke={on("fen") ? K.hlS : "#3b9eff"} strokeWidth="1.4" />; })}
      <circle cx={sx(fenC[0])} cy={sz(fenC[1])} r={fenR * 0.22} fill={K.fill2} stroke={K.line} />
      {/* fuselage : cabine (au-dessus du plancher cabine) */}
      <path d={`M${P(560, 1000)} C${P(480, 1300)} ${P(560, 1650)} ${P(900, 1900)} C${P(1300, 2150)} ${P(1900, 2290)} ${P(2600, 2300)} L${P(6200, 2300)} L${P(6200, 1550)} C${P(6050, 1300)} ${P(5950, 1120)} ${P(5850, 1000)} Z`} fill={f("cabine", K.fill)} stroke={s("cabine")} strokeWidth="1.3" />
      {/* barque (sous le plancher cabine) */}
      <path d={`M${P(560, 1000)} L${P(5850, 1000)} C${P(5650, 780)} ${P(5400, 620)} ${P(5150, 600)} L${P(1400, 600)} C${P(950, 620)} ${P(650, 760)} ${P(560, 1000)} Z`} fill={f("barque", K.fill)} stroke={s("barque")} strokeWidth="1.3" />
      {/* verrière plongeante + montants */}
      <path d={`M${P(620, 1250)} C${P(640, 1600)} ${P(900, 1880)} ${P(1350, 2080)} C${P(1700, 2210)} ${P(2000, 2260)} ${P(2350, 2270)} L${P(2350, 1650)} L${P(1500, 1500)} C${P(1100, 1400)} ${P(800, 1300)} ${P(620, 1250)} Z`} fill={K.glass} stroke={K.line} strokeOpacity="0.9" />
      <line x1={sx(1350)} y1={sz(2080)} x2={sx(1500)} y2={sz(1500)} stroke={K.line} strokeWidth="1.5" />
      <path d={`M${P(700, 1150)} C${P(800, 1000)} ${P(1100, 980)} ${P(1350, 1050)} L${P(1300, 1200)} C${P(1050, 1180)} ${P(850, 1180)} ${P(700, 1150)} Z`} fill={K.glass} stroke={K.line} strokeOpacity="0.7" />
      {/* porte pilote + porte cabine coulissante (zone 800) */}
      <path d={`M${P(1600, 1080)} L${P(2550, 1080)} L${P(2550, 2220)} L${P(1900, 2200)} C${P(1750, 2050)} ${P(1650, 1800)} ${P(1600, 1500)} Z`} fill={on("800") ? K.hl : "none"} stroke={on("800") ? K.hlS : K.line} strokeWidth="1" />
      <rect x={sx(2800)} y={sz(2180)} width={r(1900)} height={sz(1060) - sz(2180)} rx="4" fill={on("800") ? K.hl : "none"} stroke={on("800") ? K.hlS : K.line} />
      <rect x={sx(3000)} y={sz(2050)} width={r(1450)} height={sz(1650) - sz(2050)} rx="6" fill={K.glass} stroke={K.line} strokeOpacity="0.7" />
      <line x1={sx(2700)} y1={sz(2240)} x2={sx(5000)} y2={sz(2240)} stroke={K.thin} strokeWidth="1.5" />
      <rect x={sx(5000)} y={sz(2000)} width={r(700)} height={sz(1650) - sz(2000)} rx="5" fill={K.glass} stroke={K.line} strokeOpacity="0.6" />
      {/* plancher mécanique */}
      <line x1={sx(2600)} y1={sz(2300)} x2={sx(6900)} y2={sz(2300)} stroke={on("pm") ? K.hlS : "#8fa0bd"} strokeWidth={on("pm") ? 3.5 : 1.8} />
      {/* patins cintrés */}
      <path d={`M${P(700, 520)} Q${P(850, 150)} ${P(1300, 150)} L${P(5900, 150)}`} fill="none" stroke={on("skid") ? K.hlS : K.line} strokeWidth="3" strokeLinecap="round" />
      <path d={`M${P(2300, 600)} C${P(2250, 420)} ${P(2150, 260)} ${P(2050, 150)}`} fill="none" stroke={on("skid") ? K.hlS : K.line} strokeWidth="2.2" />
      <path d={`M${P(4700, 600)} C${P(4750, 420)} ${P(4850, 260)} ${P(4950, 150)}`} fill="none" stroke={on("skid") ? K.hlS : K.line} strokeWidth="2.2" />
      {/* surcouches structurales */}
      {overlay.includes("couples") && [1500, 2600, 3500, 5200, 6200, 7400, 8600, 9800, 11000].map((x) => (
        <line key={"c" + x} x1={sx(x)} y1={sz(x < 6200 ? 650 : 1550 + (x - 6200) * 0.062)} x2={sx(x)} y2={sz(x < 6200 ? 2300 : 2380 - (x - 6200) * 0.021)} stroke={K.ok} strokeWidth="1.5" strokeDasharray="4 3" />
      ))}
      {overlay.includes("lisses") && [1300, 1700, 2100].map((z) => (
        <line key={"l" + z} x1={sx(z === 2100 ? 2400 : 900)} y1={sz(z)} x2={sx(6100)} y2={sz(z)} stroke={K.amber} strokeWidth="1.2" strokeDasharray="6 3" />
      ))}
      {overlay.includes("lisses") && [[1700, 1990], [2250, 2180]].map(([z0, z1]) => (
        <line key={"lb" + z0} x1={sx(6200)} y1={sz(z0)} x2={sx(11800)} y2={sz(z1)} stroke={K.amber} strokeWidth="1.2" strokeDasharray="6 3" />
      ))}
      {overlay.includes("anneaux") && [2900, 4500].map((x) => (
        <g key={"a" + x}>
          <line x1={sx(x)} y1={sz(650)} x2={sx(x)} y2={sz(2300)} stroke={K.ko} strokeWidth="4" />
          <line x1={sx(x)} y1={sz(2300)} x2={sx(3500)} y2={sz(2950)} stroke={K.ko} strokeWidth="2" />
        </g>
      ))}
      {zones && (
        <g>
          <ZoneTag x={sx(3300)} y={sz(820)} code="100" on={zones === "100"} />
          <ZoneTag x={sx(1050)} y={sz(1500)} code="200" on={zones === "200"} />
          <ZoneTag x={sx(9800)} y={sz(1850)} code="300" on={zones === "300"} />
          <ZoneTag x={sx(5700)} y={sz(2620)} code="400" on={zones === "400"} />
          <ZoneTag x={sx(3500)} y={sz(360)} code="700" on={zones === "700"} />
          <ZoneTag x={sx(3750)} y={sz(1400)} code="800" on={zones === "800"} />
        </g>
      )}
    </g>
  );
}

/* ---------------- VUE DE DESSUS ---------------- */
export function HeliTop({ sx, sy, hl = [], zones = null }) {
  const P = (x, y) => `${sx(x)},${sy(y)}`;
  const on = (k) => hl.includes(k);
  const f = (k, d = K.fill) => (on(k) ? K.hl : d);
  const s = (k) => (on(k) ? K.hlS : K.line);
  const half = (sgn) => sgn; /* lisibilité */
  return (
    <g strokeLinejoin="round">
      <circle cx={sx(3500)} cy={sy(0)} r={Math.abs(sx(5300) - sx(0))} fill="none" stroke="#3b9eff" strokeOpacity={on("rotor") ? 0.9 : 0.28} strokeDasharray="5 5" />
      {/* patins + traverses */}
      {[1, -1].map((g) => (
        <g key={"sk" + g}>
          <path d={`M${P(900, half(g) * 1200)} Q${P(950, g * 1300)} ${P(1300, g * 1300)} L${P(5900, g * 1300)} L${P(5900, g * 1150)} L${P(1300, g * 1150)} Q${P(1000, g * 1150)} ${P(900, g * 1200)} Z`} fill={f("700", K.fill2)} stroke={s("700")} />
        </g>
      ))}
      {[2200, 4800].map((x) => <line key={x} x1={sx(x)} y1={sy(1200)} x2={sx(x)} y2={sy(-1200)} stroke={on("700") ? K.hlS : K.thin} strokeWidth="2" strokeDasharray="5 3" />)}
      {/* stabilisateur à dérives latérales */}
      <path d={`M${P(10200, 1550)} L${P(10750, 1550)} L${P(10700, -1550)} L${P(10200, -1550)} Z`} fill={f("300", K.fill2)} stroke={s("300")} />
      <rect x={sx(10150)} y={sy(1650)} width={sx(10850) - sx(10150)} height={sy(1500) - sy(1650)} rx="2" fill={f("300", K.fill2)} stroke={s("300")} />
      <rect x={sx(10150)} y={sy(-1500)} width={sx(10850) - sx(10150)} height={sy(-1650) - sy(-1500)} rx="2" fill={f("300", K.fill2)} stroke={s("300")} />
      {/* poutre de queue effilée */}
      <path d={`M${P(6200, 600)} C${P(6800, 420)} ${P(7400, 380)} ${P(8000, 360)} L${P(11800, 240)} L${P(11800, -240)} L${P(8000, -360)} C${P(7400, -380)} ${P(6800, -420)} ${P(6200, -600)} Z`} fill={f("300", K.fill)} stroke={s("300")} />
      <line x1={sx(6400)} y1={sy(0)} x2={sx(11800)} y2={sy(0)} stroke={K.amber} strokeWidth="1" strokeDasharray="8 4" strokeOpacity="0.7" />
      {/* dérive / carénage Fenestron */}
      <path d={`M${P(11700, 230)} C${P(12200, 330)} ${P(12900, 330)} ${P(13300, 150)} L${P(13300, -150)} C${P(12900, -330)} ${P(12200, -330)} ${P(11700, -230)} Z`} fill={f("fen", K.fill2)} stroke={s("fen")} />
      <line x1={sx(12050)} y1={sy(0)} x2={sx(12950)} y2={sy(0)} stroke={on("fen") ? K.hlS : "#3b9eff"} strokeWidth="2.5" />
      {/* fuselage */}
      <path d={`M${P(450, 0)} C${P(450, 700)} ${P(1100, 1080)} ${P(2400, 1100)} L${P(5800, 1100)} C${P(6100, 1050)} ${P(6200, 900)} ${P(6200, 600)} L${P(6200, -600)} C${P(6200, -900)} ${P(6100, -1050)} ${P(5800, -1100)} L${P(2400, -1100)} C${P(1100, -1080)} ${P(450, -700)} ${P(450, 0)} Z`} fill={f("cab", K.fill)} stroke={s("cab")} strokeWidth="1.3" />
      {/* verrière */}
      <path d={`M${P(620, 0)} C${P(620, 620)} ${P(1150, 930)} ${P(2000, 960)} L${P(2200, 960)} L${P(2200, -960)} L${P(2000, -960)} C${P(1150, -930)} ${P(620, -620)} ${P(620, 0)} Z`} fill={K.glass} stroke={K.line} strokeOpacity="0.8" />
      <line x1={sx(700)} y1={sy(0)} x2={sx(2200)} y2={sy(0)} stroke={K.line} strokeWidth="1.2" />
      {/* portes : pilote et coulissantes (zone 800) */}
      {[1, -1].map((g) => (
        <g key={"d" + g}>
          <line x1={sx(1600)} y1={sy(g * 1110)} x2={sx(2550)} y2={sy(g * 1110)} stroke={on("800") ? K.hlS : "#7f93b5"} strokeWidth="4" />
          <line x1={sx(2800)} y1={sy(g * 1110)} x2={sx(4700)} y2={sy(g * 1110)} stroke={on("800") ? K.hlS : "#7f93b5"} strokeWidth="4" />
        </g>
      ))}
      {/* capotage BTP */}
      <path d={`M${P(2700, 0)} C${P(2700, 650)} ${P(3200, 720)} ${P(3700, 720)} C${P(4300, 720)} ${P(4600, 600)} ${P(4600, 0)} C${P(4600, -600)} ${P(4300, -720)} ${P(3700, -720)} C${P(3200, -720)} ${P(2700, -650)} ${P(2700, 0)} Z`} fill={f("pm", "#22355a")} stroke={s("pm")} />
      {/* turbomoteurs : entrées d'air grillagées, tuyères orientées vers l'extérieur */}
      {[1, -1].map((g) => (
        <g key={"e" + g}>
          <path d={`M${P(4650, g * 150)} L${P(6500, g * 150)} C${P(6650, g * 300)} ${P(6650, g * 750)} ${P(6500, g * 880)} L${P(4650, g * 880)} C${P(4600, g * 700)} ${P(4600, g * 330)} ${P(4650, g * 150)} Z`} fill={f("400", K.fill2)} stroke={s("400")} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={sx(4700 + i * 60)} y1={sy(g * 250)} x2={sx(4700 + i * 60)} y2={sy(g * 780)} stroke={K.thin} strokeWidth="0.8" />)}
          <path d={`M${P(6300, g * 800)} L${P(6750, g * 1050)} L${P(6850, g * 900)} L${P(6450, g * 650)} Z`} fill="#0b1220" stroke={s("400")} />
        </g>
      ))}
      <line x1={sx(4600)} y1={sy(1000)} x2={sx(4600)} y2={sy(-1000)} stroke={K.ko} strokeWidth="1.6" strokeOpacity="0.8" />
      <line x1={sx(4650)} y1={sy(0)} x2={sx(6550)} y2={sy(0)} stroke={K.ko} strokeWidth="1.6" strokeOpacity="0.8" />
      <circle cx={sx(3500)} cy={sy(0)} r="5" fill={on("rotor") ? "#3b9eff" : "#8fa0bd"} />
      {zones && (
        <g>
          <ZoneTag x={sx(3700)} y={sy(-930)} code="200" on={zones === "200" || zones === "100"} />
          <ZoneTag x={sx(5600)} y={sy(520)} code="400" on={zones === "400"} />
          <ZoneTag x={sx(5600)} y={sy(-520)} code="400" on={zones === "400"} />
          <ZoneTag x={sx(9000)} y={sy(0)} code="300" on={zones === "300"} />
          <ZoneTag x={sx(3500)} y={sy(1530)} code="700" on={zones === "700"} />
          <ZoneTag x={sx(3500)} y={sy(-1530)} code="700" on={zones === "700"} />
          <ZoneTag x={sx(2000)} y={sy(1400)} code="800" on={zones === "800"} />
        </g>
      )}
    </g>
  );
}
