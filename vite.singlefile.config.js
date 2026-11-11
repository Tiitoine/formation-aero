import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { createHash } from "node:crypto";

/* CSP du fichier autonome : le JS étant inliné, on autorise CE script précis
   par son empreinte sha256 (aucun 'unsafe-inline' pour les scripts). */
const cspInlineHash = () => ({
  name: "csp-inline-hash",
  enforce: "post",
  generateBundle(_, bundle) {
    const html = bundle["index.html"];
    if (!html || typeof html.source !== "string") return;
    const hashes = [...html.source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
      .filter((m) => m[1].trim())
      .map((m) => `'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
    html.source = html.source.replace("script-src 'self'", `script-src 'self' ${hashes.join(" ")}`);
  },
});

// Build « un seul fichier » : tout le JS et le CSS inlinés dans dist-single/index.html
// (à ouvrir par double-clic ou à téléverser dans un assistant IA).
export default defineConfig({
  plugins: [react(), viteSingleFile(), cspInlineHash()],
  base: "./",
  build: { outDir: "dist-single", chunkSizeWarningLimit: 5000 },
});
