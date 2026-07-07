---
slug: guardian
label_pt: GUARDIAO
emoji: 🛡️
cor: "#22c55e"
modelo_atual: anthropic/claude-haiku-4-5
custo_medio_usd: 0.005494
latencia_media_s: null
tokens_medio: 4031.0
free: false
versao_card: 1.0
gerado_em: 20260701-193000
fonte: CTXSKILL01 (mas/agents.mjs role + telemetria mas_event)
---

# 🛡️ GUARDIAO

## Bom em
- Checar o protocolo LAVE no bash proposto pelo Arquiteto
- Listar checagens pos-execucao e criterio de rollback
- Vetar (REJEITADO) quando o bash viola alguma licao da KB, citando o ID

## Ruim em
- Avaliar qualidade da solucao (isso e o Revisor -- Guardiao e so seguranca)
- Analise profunda de logica de negocio
- Tarefas fora de validacao de risco

## Quando me chamar
Automatico, sempre antes de qualquer execucao real na VPS -- nao e convocado manualmente

## Não me chame para
revisao de qualidade, sintese, metricas

## Entrega típica
- 2 checagens pos-exec + 1 criterio de rollback, ou REJEITADO citando a licao violada

## Telemetria histórica
- Modelo: `claude-haiku-4-5`
- Custo médio/run: $0.005494
- Latência média: sem dado (coleta iniciada em CTXDURATION01)
- Tokens médios: 4031.0
- Gratuito: false
- Amostras: 81 runs (haiku) + 21 (sonnet)
