# Arquitetura do Frontend — OrquestrAI

## Fluxo de build (R6-01)
Fonte React em `frontend-vite/src/` -> `scripts/build-island.sh` compila via
`vite.island.config.js` e faz deploy verificado (hash) pra `src/island/`, que
o `dashboard.html` legado carrega como <script>/<link>. NUNCA copiar manual --
sempre `bash scripts/build-island.sh`.

## Convencao de nomes (premium, aplicada em TODOS os arquivos novos)
frontend-vite/src/
components/   PascalCase.jsx      componentes React puros (AgentCard.jsx)
islands/      kebab.island.jsx    entrypoints de ilha (agent-panel.island.jsx)
hooks/        useCamelCase.js     logica reutilizavel (useSSE.js, useAuth.js)
lib/          camelCase.js        utilitarios puros, sem React (api.js, format.js)
styles/       kebab.css           design tokens e estilos (tokens.css)

## Principios
1. Componente = so UI + estado local. Logica compartilhada vai pra hooks/.
2. Nada de fetch/token espalhado: tudo passa por lib/api.js.
3. Um EventSource so, gerenciado por hooks/useSSE.js (nao interceptar window.EventSource).
4. Cada ilha migrada REMOVE o codigo legado equivalente no dashboard.html.
5. Deploy sempre via scripts/build-island.sh (build+hash verificado).

## Estado atual da migracao (strangler fig)
- [x] AgentPanel  (CTXVITE02) -- ilha React montada no dashboard legado
- Rodada 6 migra o resto, card por card. Ver knowledge/metas/RODADA-6-PLANO.md
