# Licao R6-15 — Dois portoes para o root: confirmacao no B94/oqterm
PROJETO: orquestrai

## Problema
O botao "EXECUTAR" do card BLOCO LAVE mandava o script direto pro PTY **root**
(`ws.send(...)`) sem confirmacao, sem sha256, sem auditoria -- diferente do
`execBloco` (caminho protegido). Risco: bloco gerado por LLM ia direto pro root
sem checkpoint humano.

## A pegadinha (causa de 2 rodadas perdidas)
Havia **DOIS** botoes "EXECUTAR" independentes, os dois mandando pro terminal:
1. `sendDirect` (B94, ~L2446) -- protegido primeiro.
2. `oq71z-exec` em `wireCard` (~L2038, `ws.send(b.raw)`) -- o que REALMENTE
   dispara no clique. Nao passava pelo sendDirect.
Proteger so o sendDirect nao teve efeito visivel: o usuario clicava no OUTRO
portao. Padrao classico de "handler duplicado" (ja tinha mordido antes no 2FA).

## Como foi diagnosticado
- grep de TODOS os `ws.send`/`oqRealWs.send` -> revelou os 2 pontos (L2038, L2471).
- Confirmado que `src/` e **bind-mount** no container web
  (`./src:/usr/share/nginx/html:ro`) -> editar src/ ja e producao ao vivo,
  sem build/restart. O "executou sem modal" era cache do browser + portao errado,
  NAO fonte-de-verdade divergente.

## Fix aplicado (R6-15a + R6-15b)
- `window.__b94Confirm(cmd)`: portao unico de confirmacao. Preview (N linhas +
  trecho) + toggle `sessionStorage b94_skip_confirm` (helpers `oqB94NoConfirm()`
  / `oqB94Confirm()` no console). Retorna true=libera.
- Chamado nos DOIS portoes: `oq71z-exec` (L2038) e `sendDirect` (B94).
- Usa `window.confirm()` nativo: bloqueante de verdade (garantido pelo browser).
  Feio, mas a prova de falha -- adequado p/ um portao que manda pro root.

## Follow-ups
- **CTXEXEC01**: unificar os 2 portoes + o execBloco num unico `execToTerminal()`.
  Um so caminho pro root = uma so regra de seguranca.
- **CTXEXECMODAL01**: trocar o confirm() nativo por modal custom no dashboard
  (preview com highlight, botao 'nao perguntar' visivel). Fazer JUNTO do CTXEXEC01,
  com bloqueio real via Promise -- nao apressar UI de seguranca.
- **R6-15b real (CTXUNIFY01-B)**: criar endpoint /api/blocos/oqterm-log +
  hash-chain (nao existe hoje; confirmado por grep). Registrar hash na auditoria.
- **CTXDEPLOY01**: remover copias orfas de dashboard.html (/root/dashboard.html
  sem patch; .trash/ no docroot). src/ e a unica fonte-de-verdade servida.
- **Cache-Control no dashboard.html**: hoje depende de Ctrl+Shift+R. Header
  no-cache no nginx-web/default.conf elimina o "editei e nao vejo".
