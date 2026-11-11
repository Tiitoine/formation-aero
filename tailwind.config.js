/** Thème « cockpit de nuit » commun au portail et aux modules M1 à M4B */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1220",
        panel: "#111a2e",
        panel2: "#0f1729",
        line: "#22304d",
        ink: "#e6edf7",
        muted: "#8fa0bd",
        sky: "#3b9eff",
        amber: "#ffb020",
        ok: "#3ddc97",
        ko: "#ff5d6c",
      },
      fontFamily: {
        sans: ["Barlow", "system-ui", "sans-serif"],
        display: ["Barlow Condensed", "Arial Narrow", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
