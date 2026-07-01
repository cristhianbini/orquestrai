// ATUALIZADO: 2026-07-01 17:48:35 -03:00 (auto, git pre-commit)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // CTXVITE01: em dev, /api/* precisa ser encaminhado pro backend real --
    // o servidor do Vite so serve os arquivos React, nao tem rota /api propria.
    proxy: {
      '/api': {
        target: 'https://orquestrai.cbini.com.br',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: { outDir: 'dist' }
})
