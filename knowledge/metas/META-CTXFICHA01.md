# META FUTURA — Protocolo FICHA de cabecalhos (CTXFICHA01)

**Status:** backlog, nao iniciado (nome e estrutura ja definidos)
**Registrado:** 2026-07-04
**Origem:** Bini, inspirado no "Cabecalhos Padrao v4" do projeto XMonex

## O que ja foi decidido
- Nome: FICHA (Funcao, Identificacao, Causa, Historico, Aponta)
- Nao duplica historico/versao por arquivo (git commits + knowledge/licoes/
  ja cumprem esse papel -- evita o erro de "duas fontes de verdade" que
  foi corrigido na reconciliacao da Rodada 6 em 2026-07-04)
- Linha de credito fixa em todo arquivo: "OrquestrAI (c) CBini Solucoes
  em TI -- Cristhian Bini (Dev. Principal)" -- sem mencionar IA por
  arquivo (fica so 1 vez, em knowledge/AUDITORIA/00-LEIA-PRIMEIRO.md)
- Campos de alta prioridade herdados do XMonex v4: COMPORTAMENTO NAO
  OBVIO, ARQUIVOS RELACIONADOS, ESTADO ATUAL (icones), VERIFICACAO RAPIDA

## Falta fazer
- Criar knowledge/PROTOCOLO-FICHA.md (mesmo padrao do
  PROTOCOLO-LAVE-F.md ja existente)
- Adaptar pros 4 tipos de arquivo do OrquestrAI: blocos inline no
  dashboard.html, rotas .cjs, componentes/hooks React, scripts de infra
- Tabela de criticidade por arquivo (vermelho: dashboard.html,
  oqterm/server.js; laranja: rotas de auth/execucao; amarelo: resto)
- Aplicar so prospectivamente (arquivo tocado a partir dai) -- nunca
  retroativo em lote (isso e o CTXCOMMENTPASS01, separado)
