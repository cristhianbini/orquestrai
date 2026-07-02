// ATUALIZADO: 2026-07-02 00:23:53 -03:00 (auto, git pre-commit)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // CTXVITE02-FIX: builds em modo lib (build.lib) nao recebem o define
  // automatico de process.env.NODE_ENV que builds de app tem por padrao.
  // Sem isso, qualquer dependencia que checa NODE_ENV (comum em libs React)
  // sobra com 'process' cru no bundle -> ReferenceError no browser, que
  // nao tem 'process' (isso e global do Node.js, nao existe em navegador).
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: "dist-island",
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client"],
      output: {
        globals: { react: "React", "react-dom": "ReactDOM", "react-dom/client": "ReactDOM" },
      },
    },
    cssCodeSplit: false,
    lib: {
      entry: "src/island.jsx",
      name: "OrquestrAIAgentPanel",
      formats: ["iife"],
      fileName: () => "agent-panel-island.js",
    },
  },
});
