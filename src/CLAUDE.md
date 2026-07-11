# CLAUDE.md — src/ (frontend servido)

Docroot do container `orquestrai-web` (bind-mount `:ro`). Ver `../CLAUDE.md` para regras gerais.

## ⚠️ Editar src/ = PRODUÇÃO AO VIVO
`./src` é bind-mount no nginx. Salvar um arquivo aqui já está no ar (sem build/restart).
Mudanças visuais podem precisar de Ctrl+Shift+R (cache do browser é agressivo — várias lições).

## dashboard.html — o monólito
- ~5.500 linhas, 77 blocos `<script>`, cockpit legado principal.
- `node --check` NÃO funciona em `.html` (dá falso positivo — L-SPOT05). Para validar JS:
  extrair o script ou confirmar HTTP 200 + comportamento visual.
- `git add` do arquivo inteiro arrasta patches não commitados de outras sessões — `git diff --stat`
  antes (CTXGITADDSCOPE01).
- Vários `setInterval` globais tocam elementos que só existem em certas abas — guardar TODOS os
  elementos antes de escrever, não só o primeiro (L-SPOT06).

## island/ — NUNCA editar direto
`src/island/*` é ARTEFATO de build (vem de `frontend-vite/`). Editar aqui é sobrescrito no próximo
build. Fonte fica em `frontend-vite/src/`; deploy via `scripts/build-island.sh` (ver skill `deploy-island`).

## Código morto conhecido
- Painel `#agentes` (`display:none`) + `paintAg()` + CSS associado = legado fantasma. O painel real
  é a ilha React `#oq-agent-panel-island` (R6-13.5.x). Remover só com método de âncora-por-conteúdo.
- Dois botões EXECUTAR (execBloco vs oq71z-exec/b94) = dois portões pro root (R6-15, CTXEXEC01 pendente).
- `js/login.js`, `routes/blocos.cjs`, `mas.html` = candidatos a órfão (verificar refs antes de mover).
