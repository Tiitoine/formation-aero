import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Build « un seul fichier » : tout le JS et le CSS inlinés dans dist-single/index.html
// (à ouvrir par double-clic ou à téléverser dans un assistant IA).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: "./",
  build: { outDir: "dist-single", chunkSizeWarningLimit: 5000 },
});
