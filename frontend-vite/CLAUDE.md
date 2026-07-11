# CLAUDE.md — frontend-vite/ (React, strangler fig)

**Leia `ARCHITECTURE.md` neste diretório primeiro** — ele é a fonte do fluxo de build,
convenção de nomes e princípios. Este CLAUDE.md só reforça as armadilhas.

## Regra de ouro do build
Fonte em `frontend-vite/src/` → SEMPRE `bash scripts/build-island.sh` (build via
`vite.island.config.js` + deploy com verificação sha256 para `src/island/`). NUNCA copiar
manual, NUNCA editar `src/island/` direto. Ver skill `deploy-island`.

## Dois modos de build (não confundir)
- `vite.config.js` → app SPA (login), `outDir: dist` → vira `src/index.html` + `src/assets/`.
- `vite.island.config.js` → ilha, `outDir: dist-island`, IIFE, React external. `define
  process.env.NODE_ENV` explícito (senão `process is not defined` no browser — L-VITE02FINAL).

## Strangler fig
Cada ilha migrada REMOVE o legado equivalente no dashboard.html (princípio 4 do ARCHITECTURE.md).
Estado: só AgentPanel migrado (CTXVITE02). Resto = Rodada 6 (`knowledge/metas/RODADA-6-PLANO.md`).

## Armadilhas (lições)
- Após corrigir, rebuild + deploy no MESMO passo — build sozinho não afeta produção; pedir teste
  após só `npm run build` engana (L-VITE03). Confirmar hash dist == src/island.
- Grid responsivo (md:/lg:) reage à largura da JANELA, não do container — em sidebar estreita usar
  colunas fixas (L-VITE02FINAL).
- Sem TypeScript (JSX puro). react-router precisa da rota `/index.html` além de `/` (L-VITE03).
