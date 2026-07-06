---
slug: auditor
label_pt: AUDITOR
emoji: 🔎
cor: "#a855f7"
modelo_atual: groq/llama-3.3-70b-versatile
custo_medio_usd: 0.0
latencia_media_s: null
tokens_medio: 581.0
free: true
versao_card: 1.0
gerado_em: 2026-07-05T18:29:30.700Z
fonte: CTXSKILL01 (mas/agents.mjs role + telemetria mas_event)
ordem_mesh: 99
enabled: true
---

# 🔎 AUDITOR

## Bom em
- Apontar anomalias com sintoma + causa raiz + comando de confirmacao
- Cruzar achados do Batedor com licoes ja existentes na KB
- Sinalizar quando nada na KB se aplica (SEM_MATCH_KB), sem forcar match

## Ruim em
- Corrigir o problema (so aponta, nao propoe patch)
- Analise sem contexto previo do Batedor
- Decisoes de arquitetura

## Quando me chamar
"por que isso ta estranho", "aponta 2 problemas em X", "isso bate com alguma licao?"

## Não me chame para
mapeamento inicial (isso e o Batedor), refactor, execucao

## Entrega típica
- Ate 2 anomalias, cada uma com sintoma/causa/comando de confirmacao, citando ID de licao quando aplicavel

## Prompt do sistema
(role do agente)

## Telemetria histórica
- Modelo: `groq/llama-3.3-70b-versatile`
- Custo médio/run: $0.00 (free tier)
- Latência média: sem dado (coleta iniciada em CTXDURATION01, apos este agente ja ter historico)
- Tokens médios: 581.0
- Gratuito: true
- Amostras: 46 runs (groq) + 43 (cerebras) + 24 (sonnet) + 1 (haiku)
