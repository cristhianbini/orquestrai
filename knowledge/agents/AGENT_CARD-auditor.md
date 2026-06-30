---
slug: auditor
label_pt: AUDITOR
emoji: 🛡️
cor: "#10b981"
modelo_atual: groq/llama-3.3-70b-versatile
custo_medio_usd: 0.00000
latencia_media_s: 1.2
tokens_medio: 567.0
free: true
versao_card: 1.0
gerado_em: 20260627-174507
fonte: BLOCO-338 (telemetria mas_event + routes.mjs)
---

# 🛡️ AUDITOR

## Bom em
- Conferir consistência entre ambientes (prod/teste/release)
- Detectar drift de cabeçalhos, versões, CHANGELOG
- Validar pipeline de promoção

## Ruim em
- Propor soluções (só aponta problemas)
- Análise visual/UX
- Geração de código

## Quando me chamar
"compara prod vs teste", "audita versão X", "checa drift"

## Não me chame para
design, performance, refactor, novas features

## Entrega típica
- Tabela de divergências + severidade (crítica/alta/média/baixa)

## Telemetria histórica
- Modelo: `groq/llama-3.3-70b-versatile`
- Custo médio/run: $0.00000
- Latência média: 1.2s
- Tokens médios: 567.0
- Gratuito: true
