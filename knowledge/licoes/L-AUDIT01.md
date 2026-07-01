# L-AUDIT01 — Nao assumir formato de arquivo por padrao de outro arquivo

**Data:** 2026-07-01
**Contexto:** CTXAUDIT01 -- primeira tentativa quebrou producao

## Erro
Assumi que api/blocosRoutes.cjs usava express.Router() (padrao visto em
mas/routes.mjs) e escrevi router.get(...) direto no patch. O arquivo real
usa module.exports = function(app, requireAuth){...} -- 'router' nao existe
nesse escopo. require() do arquivo inteiro falhou ao carregar, e o
try/catch em server.js (que existe exatamente pra evitar crash total)
engoliu o erro SILENCIOSAMENTE. BLOCO LAVE inteiro ficou fora do ar
(preparar/executar/historico) sem nenhum aviso visivel no dashboard.

## Causa raiz
Vi so o TOPO do arquivo (imports, db()) antes de escrever o patch -- nao
vi o module.exports nem como as rotas sao registradas de fato. Assumi
consistencia de padrao entre arquivos .cjs do mesmo projeto, que nao existe.

## Como foi pego rapido
node --check acusou 'router is not defined' ANTES do restart. So nao
travou 100% do sistema (silencioso) porque o server.js tem try/catch
no require() -- mas o try/catch tambem escondeu o problema do dashboard.

## Regra permanente
Antes de adicionar QUALQUER rota nova a um arquivo .cjs/.js: confirmar
como as rotas EXISTENTES nesse arquivo especifico sao registradas
(router.x, app.x, ou funcao que recebe app como parametro) -- grep
"module.exports" e ver a ASSINATURA completa, nao so os imports do topo.
Cada arquivo pode ter um padrao diferente, mesmo dentro do mesmo projeto.
