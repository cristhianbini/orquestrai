---
slug: rel
label_pt: RELATOR
emoji: 📝
cor: "#06b6d4"
modelo_atual: anthropic/claude-haiku-4-5
custo_medio_usd: 0.004913
latencia_media_s: null
tokens_medio: 4156.0
free: false
versao_card: 1.0
gerado_em: 20260701-193000
fonte: CTXSKILL01 (mas/agents.mjs role + telemetria mas_event)
---

# 📝 RELATOR

## Bom em
- Resumir em 1 frase o que o BLOCO entrega
- Sugerir a versao semver correta (patch/minor/major) pra mudanca

## Ruim em
- Analise tecnica (so resume o que os outros ja concluiram)
- Decisoes de arquitetura ou seguranca
- Relatorios longos (formato exige max 3 linhas)

## Quando me chamar
Automatico, proximo ao final do pipeline -- nao e convocado manualmente

## Não me chame para
diagnostico, validacao, execucao

## Entrega típica
- 1 frase de resumo + sugestao de versao semver

## Telemetria histórica
- Modelo: `claude-haiku-4-5`
- Custo médio/run: $0.004913
- Latência média: sem dado (coleta iniciada em CTXDURATION01)
- Tokens médios: 4156.0
- Gratuito: false
- Amostras: 59 runs (haiku) + 40 (gpt-oss)
