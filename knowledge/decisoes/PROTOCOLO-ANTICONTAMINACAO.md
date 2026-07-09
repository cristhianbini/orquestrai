PROJETO: orquestrai
TIPO: protocolo-vivo
CRIADO: 2026-07-09
REVISAO-OBRIGATORIA: inicio de cada Rodada + sempre que um documento novo entrar no Project/KB

# PROTOCOLO ANTICONTAMINACAO — "PARE TUDO"

## 1. O que e contaminacao
Contaminacao de contexto = qualquer informacao de OUTRO projeto, de uma
PROPOSTA nao implementada, ou de um BRAINSTORM, sendo tratada como fato
sobre o estado real do OrquestrAI. Ela nao gera erro — gera comportamento
errado silencioso. E o pior tipo de bug: o sistema "funciona", mas na
direcao errada.

## 2. Historico de incidentes REAIS (por que este protocolo existe)
- XMONEX_STACK hardcoded em mas/agents.mjs instruia os agentes a NAO usar
  Docker — o OrquestrAI RODA em Docker. Descoberto por auditoria, nao por erro.
- 5 licoes de outros projetos na KB (removidas na S1 da Rodada 6);
  frontmatter PROJETO: obrigatorio nasceu dai.
- 2026-07-09: constatado que o proprio Project Knowledge contem 4 documentos
  nao-canonicos (ver secao 4) que aparecem misturados em buscas.

## 3. FONTES CANONICAS (unicas fontes de verdade sobre o estado atual)
1. O SISTEMA VIVO: arquivos em /var/www/orquestrai lidos NESTA sessao,
   saida de docker/curl/sqlite NESTA sessao. Nada supera isso.
2. roadmap.md (planejamento vigente) e RODADA-N-PLANO.md (sprint vigente).
3. knowledge/metas/HANDOFF-POS-FABLE.md (estado entre sessoes — mas
   VERIFICAR no vivo antes de agir: L-CTXHANDOFFVERIFY01).
4. knowledge/licoes/ com PROJETO: orquestrai.
5. parecer_consultivo_orquestrai_v2.md (retrato fiel validado em 2026-07-01;
   e analise, nao especificacao — confirmar detalhes no vivo).

## 4. FONTES NAO-CANONICAS conhecidas (consultar SO como inspiracao,
##    NUNCA como descricao do sistema)
- EscopoOrquestrAIV6.0.pdf — VISAO COMERCIAL/FUTURA. Next.js 15, MySQL 8,
  Redis+BullMQ, runner Go mTLS NAO EXISTEM no sistema real (Docker Compose,
  Express, SQLite, dashboard.html monolitico). Diz "Docker e alternativa,
  nao padrao" — o REAL e o oposto.
- Diretrizes_Estrategicas__Integracao_do_Claude_Mega.docx — proposta de
  consultoria externa (plugin Mega-Brain). NUNCA implementado. Estrutura de
  pastas que descreve nao confere com knowledge/ real.
- Evolucao_Colaborativa_de_Agentes.docx — RASCUNHO DE PERGUNTA do Bini a
  uma IA consultora. Brainstorm ("imagino que...", "gostaria da opiniao").
  NADA dali e decisao ou implementacao.
- READM-EAIOX-CORE.md — README de projeto de TERCEIROS (@aiox-squads/core,
  SynkraAI). Sem relacao com o OrquestrAI. Ignorar.
- PLANO-MESTRE-CBINI-v3_0.md — stack do PORTFOLIO CBini (Lovable + Cloud
  Run + Supabase, XMoney etc.). Otimo p/ inspirar padroes (DNA de projeto,
  gatilhos de promocao, checklist operacional) — PESSIMO como descricao de
  infra do OrquestrAI.

## 5. SINAIS DE ALERTA (qualquer um = suspeitar de contaminacao)
- Mencao a MySQL, Redis, BullMQ, Next.js, Go runner, Cloud Run, Supabase,
  GCP, Lovable-como-runtime NO CONTEXTO do OrquestrAI atual.
- Instrucao para NAO usar Docker, ou tratar Docker como opcional.
- Caminho /opt/orquestrai/ (o real e /var/www/orquestrai).
- Referencia a tela/rota/tabela que o grep NAO encontra no codigo.
- Agente do MAS citando stack/cliente que nao e o OrquestrAI.
- Numeracao de sprint sem espelho no roadmap.md/RODADA-N-PLANO.md.

## 6. PROCEDIMENTO "PARE TUDO" (prioridade sobre qualquer tarefa em curso)
Ao detectar sinal de alerta, NA ORDEM:
1. PARAR — nenhum commit, nenhum bloco E do LAVE, nenhuma edicao.
2. ISOLAR — identificar a fonte exata da informacao suspeita (arquivo? KB?
   memoria de sessao? prompt de agente?).
3. VERIFICAR NO VIVO — grep/cat/docker no sistema real decide. O sistema
   vivo SEMPRE vence o documento.
4. CLASSIFICAR — (a) contaminacao real -> remover/quarentenar a fonte
   (_arquivados/, nunca rm) e corrigir o que ja foi afetado;
   (b) falso positivo -> DOCUMENTAR mesmo assim (auditoria ja provou que
   falso positivo documentado vale tanto quanto achado real).
5. REGISTRAR — incidente em knowledge/incidentes/ + atualizar a secao 2
   deste protocolo + licao se houver regra generalizavel.
6. So entao RETOMAR a tarefa original.

## 7. VERIFICACAO PERIODICA (inicio de cada Rodada)
- [ ] grep -ri "XMONEX\|mysql\|bullmq\|cloud run\|supabase\|/opt/orquestrai" \
      mas/ api/ server.js src/dashboard.html — esperado: ZERO no codigo vivo
      (excecoes documentadas aqui, se surgirem)
- [ ] Licoes novas na KB tem PROJETO: orquestrai
- [ ] Documento novo no Project/KB? Classificar aqui (canonico/nao-canonico)
- [ ] Prompts dos AGENT_CARDs mencionam apenas a stack real
- [ ] Handoff da sessao anterior foi verificado no vivo antes de agir

## 8. Alucinacao (irma da contaminacao)
Mesmo tratamento: afirmacao sobre o sistema que o grep nao confirma =
PARE TUDO passo 3. Regra de ouro operacional ja vigente que este protocolo
formaliza: NUNCA propor mudanca sem ler o estado atual primeiro
(L-CTXHANDOFFVERIFY01), e NUNCA "lembrar" de codigo — sempre reler.

## 9. EXCECOES CONHECIDAS do grep periodico (falsos positivos classificados)
Verificacao 2026-07-09 (1a execucao do protocolo):
- mas/routes.mjs L39: comentario com 'xmonex' como exemplo de fala do usuario. BENIGNO.
- mas/kb.cjs L15/L44: as PROPRIAS defesas anticontaminacao (texto "NAO E MySQL"
  e referencia ao bug XMONEX_STACK fechado). BENIGNO — e o antidoto.
- dashboard.html L3492: mysql/postgres como OPCOES de DB no wizard de projetos
  futuros. BENIGNO — opcao de produto, nao stack do OrquestrAI.
- dashboard.html L3583: var DEF=['orquestrai','xmonex','hello-world-vps'] —
  RESOLVIDO 2026-07-09: contaminacao leve CONFIRMADA (oq288 semeava
  projetos fake no localStorage). Corrigido via CTXPROJSEL01: DEF=[orquestrai],
  limpeza unica do localStorage legado, seletor sincroniza com /api/projects.

## 10. REGISTRO OPERACIONAL (CTXOPSCHECK01)
- 2026-07-09: 1o TESTE DE RESTORE do Litestream executado (resultado no
  commit desta data). Proximo teste obrigatorio: outubro/2026 (trimestral).

## 11. CHECKS OPERACIONAIS RECORRENTES (CTXOPSCHECK01, alimentado pela KB)
Origem: licoes aprovadas viram verificacoes concretas aqui. Rodar no inicio
de cada Rodada (junto do grep anticontaminacao da secao 7).
- [ ] proxy_pass correto (L-audit-regressao-proxy-nginx): 
      grep -n 'proxy_pass.*8080' nginx/proxy.conf -> esperado VAZIO.
      Se achar: CRITICO, 502 iminente (regressao do fix 8080->3000).
- [ ] restore Litestream: trimestral (proximo out/2026, CTXOPSCHECK01 secao 10).
- [ ] auth coverage das rotas MAS: contar rotas vs rotas com Authorization.
