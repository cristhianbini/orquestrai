# META FUTURA — Estratégia de Auditoria com Fable 5

**Status:** planejamento (nao executar ate o Fable 5 ser explicitamente acionado)
**Registrado:** 2026-07-02
**Origem:** discussao estrategica do Bini + analise critica do Claude (mentor)

---

## Objetivo
Auditoria PROFUNDA do OrquestrAI, alem de bugs: arquitetura, organizacao,
aderencia doc-vs-codigo, divida tecnica, escalabilidade, seguranca,
organizacao dos agentes, qualidade de prompts, fluxo entre agentes, UX,
roadmap e visao de produto. Entregavel final: roadmap atualizado + lista
priorizada de melhorias.

---

## As 3 hipoteses avaliadas (do documento original)

1. **Doc-first** — alimentar o Project so com documentacao (roadmap, changelog,
   arquitetura, regras de negocio). Entende a INTENCAO, mas ignora a realidade.
2. **Codigo-first** — scripts de auditoria na VPS geram relatorios; a fonte de
   verdade e a implementacao real, nao a doc.
3. **Hibrido** — gera fotografia tecnica automatica + alimenta com doc historica
   + Fable cruza as duas visoes.

**Recomendacao do Claude: hibrido (hipotese 3), mas com um ajuste-chave que o
documento nao considerava (ver abaixo).**

---

## Analise critica do Claude (contrapontos, nao validacao)

### 1. Codigo direto vs relatorios: a resposta e "os dois", mas NAO na ordem intuitiva
Fable lendo codigo cru = contexto enorme, irrepetivel, caro (paga pra ler
node_modules). Ordem certa:
- Scripts geram a FOTOGRAFIA TECNICA (barato, repetivel, versionavel)
- Fable analisa FOTOGRAFIA + DOCUMENTACAO -- quase nunca o codigo cru
- Codigo cru entra SO sob demanda, quando a fotografia aponta um ponto que
  merece leitura profunda

Comparacao das abordagens:
| Criterio            | Codigo cru no Fable | Fotografia destilada |
|---------------------|---------------------|----------------------|
| Profundidade        | Alta mas dispersa   | Focada no que importa|
| Precisao            | Ruido alto          | Alta (pre-filtrado)  |
| Consumo de contexto | Altissimo           | Baixo                |
| Consumo de creditos | Caro, queima rapido | Economico            |
| Repetibilidade      | Refaz tudo sempre   | Roda o script de novo|
| Manter atualizada   | Dificil             | Trivial (versionado) |

### 2. Falta um 4o artefato: LICOES APRENDIDAS
knowledge/licoes/ ja registra tudo que foi vivido (porta 8080/3000, crypto
duplicado, os pontos de auth que escaparam, etc). Auditor que ignora isso
vai "descobrir" problemas ja mapeados e resolvidos -- desperdicio de creditos
re-achando o conhecido. O 4o artefato alimenta o Fable com o historico real.

### 3. Auditoria em DOIS modos, nao evento unico
- **Profunda**: cara, rara, o mergulho completo. Rodada dedicada.
- **Incremental**: script barato a cada rodada, so o DELTA desde a ultima.
  E o mecanismo natural pro "mapa de rastro de bugs" (nao repetir erros).

### 4. Cautela de custo
Fable 5 = modelo de topo, caro por token. "Destilar antes de perguntar" nao
e so arquitetura elegante -- e economia real dos creditos do Bini.

---

## Os 4 artefatos (3 do documento + 1 do Claude)

1. **Estado Atual** — implementacao real, so fatos, gerado por script na VPS.
2. **Visao Original** — intencao: arquitetura, roadmap, objetivos, doc.
3. **Diferencas (drift report)** — divergencias, inconsistencias, codigo morto,
   doc desatualizada, funcionalidades abandonadas, decisoes a revisar.
4. **Licoes Aprendidas** [ADICIONADO PELO CLAUDE] — historico de knowledge/licoes/
   pra o Fable nao re-investigar o ja resolvido.

---

## Metodologia proposta (Claude como "CTO")

**Fase 0 — Fotografia automatica (script, sem Fable):**
estrutura, modulos, dependencias, schema do banco, endpoints, servicos,
integracoes, TODOs, FIXMEs, arquivos orfaos, codigo morto, duplicacoes,
acoplamentos, metricas, riscos. Saida: JSON/markdown estruturado, versionado.

**Fase 1 — Montagem do contexto:** os 4 artefatos, destilados.

**Fase 2 — Fable cruza e raciocina:** sobre a fotografia + doc + licoes,
NAO sobre codigo cru. Codigo cru so sob demanda pontual.

**Fase 3 — Entregavel:** roadmap atualizado + lista priorizada + drift report.

**Permanencia:** Fase 0 vira script no repo, roda a cada rodada (modo
incremental). Auditoria profunda com Fable = quando o Bini decidir gastar
os creditos, com contexto ja destilado esperando.

---

## Visao de Longo Prazo -- Arquitetura de Projetos e Deploy (recebida 2026-07-07)

**Origem:** documento do Bini, "nao prioridade imediata, mas visao de
evolucao que deve orientar decisoes arquiteturais tomadas AGORA".

### Resumo da visao
- Criacao de projeto: origem = branco OU clone GitHub (auto-conecta conta,
  lista repos, clona, analisa stack/framework/docker/deps automaticamente).
- Todo projeto NASCE containerizado (Dockerfile, compose, .env, rede,
  volumes, proxy reverso) -- nunca adicionado depois.
- Acoes simples sem terminal: Criar/Executar/Parar/Reiniciar/Atualizar/Excluir.
- **Deployment Targets** desacoplados da infra: VPS local, Hostinger, GCP
  Cloud Run/GKE/Compute, Docker Hub, GHCR, ECS, K8s, Azure, Oracle,
  DigitalOcean, registry privado -- MESMO projeto publicavel em qualquer um.
- Build automatizado: 1 botao "Publicar" -> valida/testa/builda/versiona/
  push/deploy/healthcheck/rollback automatico.
- Integracoes conectadas 1x (GitHub, GCP, Docker Hub, AWS, Azure, etc.),
  reutilizadas sempre.
- Filosofia: "usuario decide, OrquestrAI executa a complexidade" --
  minimizar terminal ao maximo.

### Analise critica do Claude (contraponto, nao validacao -- mesmo espirito
### adversarial do parecer_consultivo_orquestrai_v2.md)

**Pontos fortes (concordo):**
- Import GitHub + analise automatica tem sinergia real e imediata com
  `CTXRAG01` (GitHub RAG), ja no roadmap. Fazer JUNTO, nao do zero.
- Desacoplar "onde roda" de "onde publica" e o principio arquitetural
  certo -- evita reescrever tudo quando o Bini quiser migrar pra GCP.

**Riscos que a visao nao nomeia:**
- **Multi-cloud e meta, nao requisito hoje** (mesmo padrao ja identificado
  no parecer v2 sobre "100 IAs"): existe 1 VPS em producao. Construir
  abstracao pra 10 destinos antes de validar com 2 reais e abstrair sobre
  hipotese, nao sobre uso -- risco de errar a interface e refatorar de
  qualquer jeito depois.
- **Containerizar todo projeto novo por padrao inverte a prioridade
  "dogfood primeiro"** (principio ja adotado no projeto): o proprio
  OrquestrAI ainda nao segue esse padrao pra si mesmo (roda direto na VPS,
  nao em container isolado por projeto). Provar no proprio produto antes
  de oferecer a clientes/usuarios.
- **Tensao real com o trabalho de HOJE**: a visao pede "minimizar terminal
  ao maximo"; esta sessao investiu em melhorar UX do terminal (botoes
  padronizados, cores). Nao e contradicao, mas precisa de decisao
  consciente: terminal continua sendo ferramenta core pro operador tecnico
  (Bini), enquanto GUI cresce pra acoes simples do usuario final? Ou o
  terminal e um "modo avancado" a ser progressivamente escondido?

**Decisoes de arquitetura a tomar AGORA (fundacao, sem implementar tudo):**
1. Definir uma interface `DeploymentTarget` (deploy/stop/status/logs) com
   UMA UNICA implementacao real (VPS atual via Docker Compose) -- padrao
   Adapter. Adicionar GCP/K8s depois vira extensao, nao reescrita.
2. Padronizar scaffold de projeto novo pra SEMPRE gerar Dockerfile +
   docker-compose.yml + .env.example desde o dia 1 (baixo esforco agora,
   caro de retrofitar depois).
3. Import GitHub: esperar/juntar com `CTXRAG01` (mesmo escopo, nao duplicar).
4. NAO construir o pipeline "1 botao Publicar" ate existirem >=2 destinos
   reais -- validar a abstracao contra 1 alvo so arrisca abstrair errado.
5. Registrar a tensao terminal-vs-GUI como decisao consciente pendente,
   nao ignorar.

## Pendente do Bini
Demais ideias trocadas com outra IA, a incorporar aqui conforme chegarem,
antes de acionar o modelo.
