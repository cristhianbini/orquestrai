# META FUTURA — Plataforma Base compartilhada entre projetos (CTXDNABASE01)

**Status:** backlog, nao iniciado -- baixa prioridade de proposito
**Registrado:** 2026-07-05
**Origem:** RFC de terceira IA (conversa externa do Bini), filtrada e adaptada por Claude

## Conceito (da RFC)
Uma "Plataforma Base" oficial da CBini -- nao um SaaS especifico, mas
infraestrutura compartilhada entre todos os SaaS futuros (autenticacao,
permissoes, layout admin, componentes reutilizaveis, integracoes tipo
Resend/Supabase, auditoria, logs). Novos projetos herdariam essa base.
Melhorias em um projeto poderiam ser promovidas de volta pra base,
propagando pra todos os futuros projetos.

## Por que baixa prioridade, de proposito (nao e esquecimento)
Nao da pra abstrair corretamente "o que e comum entre projetos" com
ZERO projetos reais rodando hoje (projects/ esta vazia, confirmado em
2026-07-04). Extrair uma base compartilhada antes de ter 2-3 projetos
reais e adivinhacao de arquitetura.

## Risco a evitar, explicito
Construir a base compartilhada ANTES do isolamento por projeto
(CTXPROJISO01) estar solido inverteria a ordem de seguranca: um erro na
base se propagaria pra todo projeto futuro de uma vez -- o oposto do
principio que guiou R6-15/CTXUNIFY01-B nesta sessao (reduzir raio de
explosao, nao ampliar).

## Ordem de dependencia (nao pular etapas)
CTXPROJISO01 (isolamento) -> 2-3 projetos reais rodando -> CTXPROJDNA01
(DNA por projeto) -> SO ENTAO avaliar CTXDNABASE01 (extrair o que se
repetiu de verdade entre eles).
