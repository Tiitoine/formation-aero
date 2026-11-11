import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" : chemins relatifs, le même build fonctionne sur
// GitHub Pages (https://<compte>.github.io/<depot>/) et sur Vercel (racine).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1500,
  },
});
