---
slug: metrico
label_pt: METRICO
emoji: 📊
cor: "#94a3b8"
modelo_atual: cerebras/gpt-oss-120b
custo_medio_usd: 0.0
latencia_media_s: null
tokens_medio: 2729.0
free: true
versao_card: 1.0
gerado_em: 20260701-193000
fonte: CTXSKILL01 (mas/agents.mjs role + telemetria mas_event)
---

# 📊 METRICO

## Bom em
- Avaliar custo/latencia do pipeline em 2 linhas
- Sinalizar se algum agente esta sobrecarregado
- Sugerir troca de modelo (free vs pago) quando fizer sentido

## Ruim em
- Analise de qualidade da solucao (so olha custo/performance)
- Decisoes de seguranca
- Relatorios extensos (formato exige max 2 linhas)

## Quando me chamar
Automatico, ao final do pipeline -- nao e convocado manualmente

## Não me chame para
diagnostico tecnico, validacao de seguranca, sintese de entrega

## Entrega típica
- 2 linhas: avaliacao de custo/latencia + recomendacao de modelo se aplicavel

## Prompt do sistema
METRICO (L5). Em 2 linhas: avalie custo/latencia do pipeline e diga se algum agente esta sobrecarregado ou se cabe trocar modelo (free vs pago).

## Telemetria histórica
- Modelo: `cerebras/gpt-oss-120b`
- Custo médio/run: $0.00 (free tier)
- Latência média: sem dado (coleta iniciada em CTXDURATION01)
- Tokens médios: 2729.0
- Gratuito: true
- Amostras: 33 runs (gpt-oss) + 11 (groq) + 4 (haiku)
