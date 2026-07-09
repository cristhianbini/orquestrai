PROJETO: orquestrai
TIPO: visao-estrategica
CRIADO: 2026-07-09
STATUS: capturada, aguardando priorizacao no Chat 9
ORIGEM: dita pelo Bini no encerramento da sessao — registrar antes de dormir

# VISAO — Import GitHub como resgate de infraestrutura, nao so como feature

## A dor real (em texto do proprio Bini, resumido)
Hoje sistemas dele (e de clientes) vivem espalhados em infraestrutura de
TERCEIROS. A prioridade nao e so "importar codigo pra dentro do OrquestrAI
pra consultar/RAG" (isso ja e o CTXRAG01, pequeno, ja escopado) — e trazer
sistemas PRONTOS, DE VERDADE, pra dentro do proprio ambiente, melhora-los
la dentro, e hospeda-los com portabilidade real: rodar no proprio VPS
Hostinger hoje, ou exportar pra uma VPS dedicada, ou Google Cloud, ou
qualquer outro provedor — sem reescrever nada pra isso.

## Modelo de negocio associado (conecta com o Plano Mestre CBini, ja
## avaliado nesta mesma sessao)
"VPS e barata por mes. Se eu tenho 10 clientes pagantes num sistema, a
VPS dedicada ja se paga sozinha." — e o MESMO padrao do "gatilho de
promocao" ja registrado no roadmap (secao absorvida do Plano Mestre
CBini): criterio duro e mensuravel decide quando um projeto sai do
compartilhado e ganha infraestrutura propria. Aqui o Bini da um numero
concreto (10 clientes) como referencia de bolso, nao uma regra final.

## O que ele quer replicar (aspiracional, nao prometido)
Elasticidade tipo Google Cloud/containers auto-escalaveis — o Bini quer
avaliar se da pra reproduzir esse padrao (escala sob demanda) na propria
infra dele, ao inves de depender do provedor terceiro pra isso. Registrar
como interesse de pesquisa, NAO como compromisso de entrega — e' um tipo
de infra bem mais complexo que tudo que foi construido ate hoje.

## Como isso conecta com decisoes JA TOMADAS nesta sessao (nao reinventar)
- CTXIMPORT01 vs CTXRAG01 (ja separados no roadmap): CTXRAG01 e' so
  indexar codigo pra KB; CTXIMPORT01 e' criar um projeto executavel a
  partir de um repo. ESTA VISAO diz que CTXIMPORT01 precisa crescer pra
  cobrir "importar sistema JA FUNCIONANDO de terceiro", nao so "clonar
  repo vazio pro wizard".
- S20 (container isolado por projeto, ja no roadmap): se cada projeto do
  OrquestrAI ja nascer como container Docker padrao (nao amarrado a
  nenhum provedor especifico), a portabilidade "rodar aqui hoje, exportar
  pra outro lugar depois" fica muito mais barata — Docker roda igual em
  qualquer VPS ou Cloud. S20 deveria ser desenhado JA PENSANDO nessa
  exportabilidade, nao só isolamento local.
- Gatilho de promocao (Plano Mestre, ja absorvido no roadmap): a regra
  "N execucoes reais OU status:producao no project.json" vira candidata
  natural a "quando um projeto importado merece VPS dedicada", com o
  numero de clientes pagantes como sinal adicional (dado que ainda nao
  existe no sistema — precisaria de campo novo).

## Fases sugeridas (ordem de exploracao, NAO cronograma fechado)
1. CTXIMPORT01 crescer: clonar repo GitHub existente -> vira projeto
   OrquestrAI de verdade (project.json + container via S20), nao so
   arquivo solto.
2. S20 desenhado com portabilidade em mente desde o inicio (container
   Docker padrao, sem dependencia de provedor).
3. Export/deploy manual pra outra VPS (mesmo Hostinger ou outro provedor)
   — "docker save/load" ou equivalente, sem magica de auto-scale ainda.
4. (Distante, pesquisa) — elasticidade/auto-scale self-hosted, so depois
   dos passos anteriores provados na pratica com projetos reais.

## O que NAO decidir agora
Numero exato de clientes-gatilho, provedor de nuvem especifico pra
exportar, arquitetura de auto-scale — tudo isso fica pra quando houver
mais dado real (primeiro projeto importado de verdade) e cabeca fresca
no Chat 9. Este documento e' captura de visao, nao spec de implementacao.
