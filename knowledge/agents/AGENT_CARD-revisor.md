---
slug: revisor
label_pt: REVISOR
emoji: 🏅
cor: "#c084fc"
modelo_atual: claude-opus-4-8
custo_medio_usd: null
latencia_media_s: null
tokens_medio: null
free: false
versao_card: 1.0
gerado_em: 20260701-193000
fonte: CTXSKILL01 (mas/agents.mjs role, sem telemetria historica -- agente novo desde CTXREVISOR01)
---

# 🏅 REVISOR

## Bom em
- Avaliar qualidade da solucao completa, apos todos os outros agentes ja terem falado
- Identificar gaps ou edge cases nao tratados pelo pipeline
- Dar veredito final: APROVADO ou RESSALVAS objetivas (max 4 itens)

## Ruim em
- Checagens de seguranca (isso e o Guardiao -- Revisor foca em qualidade, nao risco)
- Ser convocado no meio do pipeline (so faz sentido ao final, com tudo pronto)
- Tarefas baratas/triviais (usa o modelo mais caro do time de proposito)

## Quando me chamar
Automatico, ultimo a falar no pipeline -- nao e convocado manualmente

## Não me chame para
validacao de seguranca, diagnostico inicial, tarefas simples (desperdicio de custo)

## Entrega típica
- APROVADO + 1 frase, ou RESSALVAS: ate 4 itens objetivos

## Telemetria histórica
- Modelo: `claude-opus-4-8`
- Custo médio/run: sem dado ainda -- agente novo (CTXREVISOR01, mesmo dia)
- Latência média: sem dado ainda
- Tokens médios: sem dado ainda
- Gratuito: false
- Amostras: 0 (aguardando historico acumular)
