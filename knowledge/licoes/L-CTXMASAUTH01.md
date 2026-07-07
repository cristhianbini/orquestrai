# L-CTXMASAUTH01 — Auth nas rotas do MAS (2026-07-02)
PROJETO: orquestrai

## Problema
`app.use('/api/mas', masRoutes)` estava SEM authMiddleware. As 10 rotas do
MAS (incluindo /run, que dispara pipeline completo = custo real de API, e
/kb/approve + /kb/reject, que alteram a KB) aceitavam qualquer requisicao
da internet, sem token. Exposicao real, nao teorica.

## Solucao
1. Novo modulo mas/auth.mjs (fonte unica de verdade):
   - authMiddleware: valida header Authorization Bearer com jwt.verify REAL
   - authMiddlewareSSE: valida ?_t=<token> na URL (EventSource nao manda
     header) -- COM jwt.verify de verdade, diferente do padrao frágil que
     existe em blocosRoutes.cjs (que aceita qualquer string nao-vazia).
2. 10 rotas em mas/routes.mjs protegidas (9 com authMiddleware, /events/:id
   com authMiddlewareSSE).
3. 9 pontos de chamada em src/dashboard.html atualizados p/ mandar o token.

## Por que NAO consolidamos com o authMiddleware de server.js
server.js ja tem sua propria copia funcionando. Consolidar seria o ideal,
mas decidimos NAO tocar em codigo critico que ja funciona na mesma sessao
de um incidente anterior (crash do oqterm). Fica como item de limpeza futura.
mas/auth.mjs vive dentro de mas/ (pasta ja montada como volume live) pra
nao precisar mexer no docker-compose.yml nem recriar container.

## Retrabalho / licao operacional
3 pontos de chamada escaparam do patch inicial por usarem sintaxe levemente
diferente (arrow vs function, espacos no objeto de options, concatenacao com
espacos) -- grep por string exata nao casou as variacoes. Foram descobertos
so quando o dashboard entrou em loop de 401 em producao.

REGRA PERMANENTE: ao proteger rotas, verificar com CONTAGEM
(grep -c 'rota' == grep -c 'Authorization'), nunca confiar em ter casado
todas as ocorrencias por string exata. A contagem revela quantos pontos
faltam mesmo com sintaxes diferentes.

## Diagnostico que consumiu tempo (registrar p/ nao repetir)
O loop de 401 foi investigado por varios angulos ate achar a causa:
descartado cache de borda (Cloudflare servia versao correta), descartado
Service Worker (0 registrados). A causa era simplesmente 1 fetch de polling
(findLastRun, linha 2998) + 1 EventSource (linha 2989) sem token. O fetch
manual no console retornando 200 foi o que provou que backend/patch estavam
certos e o problema era ponto de chamada faltante.

## Item futuro relacionado
Bug real em blocosRoutes.cjs /api/blocos/:id/stream: valida token so checando
se string nao e vazia (TODO OQ-58a-fix, nunca corrigido). Mesma correcao
que fizemos aqui (jwt.verify real) deve ser aplicada la. Fora do escopo
desta rodada (arquivo .cjs, complicacao de import ESM->CJS).
