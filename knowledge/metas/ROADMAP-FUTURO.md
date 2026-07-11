# Roadmap Futuro — OrquestrAI
Ultima atualizacao: 2026-07-11. Ordem = alicerce antes do acabamento.

## ALICERCE
0. [~] **CTXOPSCHECK01 — restore do Litestream** — 1o teste de restore FEITO e
   APROVADO em 2026-07-11 (restore p/ path descartavel; integrity_check=ok nos 2
   bancos; contagem+timestamp restaurado == vivo ao milissegundo; RPO efetivo ~0).
   FALTA ainda: formalizar o checklist operacional (semanal/mensal/trimestral) em
   knowledge/decisoes/ e reteste trimestral. Migrado do roadmap.md antigo.
0b. [ ] **orquestrai.db (2FA/TOTP) NAO tem backup Litestream** — achado no teste de
   restore 2026-07-11: /etc/litestream.yml replica so cluster.db e blackboard.db.
   Se a VPS morrer, os segredos TOTP se perdem (usuarios teriam de refazer 2FA).
   Avaliar adicionar orquestrai.db ao litestream.yml. Decisao do Bini, sem urgencia.
1. [x] Token efemero de preview — feito 2026-07-10 (CTXPREVIEWTOKEN02/03)
2. [ ] Import GitHub + container isolado — proximo passo concreto, habilita metade das metas.
   Visao ampliada em knowledge/decisoes/VISAO-IMPORT-MIGRACAO-INFRA.md: nao e so
   "importar codigo pra referencia" (isso e o CTXRAG01), e trazer sistema de
   terceiro pra DENTRO do OrquestrAI, melhorar aqui e hospedar/exportar com
   portabilidade real (VPS propria hoje -> VPS dedicada/outro provedor depois).
   O container deve nascer portavel. Ver tambem o gatilho de promocao por projeto
   no BACKLOG DE PRODUTO abaixo.
3. [ ] Telemetria por projeto (custo/tokens) — DO ZERO (project_slug nao existe em runs/mas_run; ver correcao 2026-07-10)

## ESTRUTURA
4. [ ] Telemetria expandida (disco/memoria/CPU) — depende do container isolado
5. [ ] PLANEJADOR + ORQUESTRADOR — pipeline dinamico, conecta com CTXEARLYEXIT01/CTXROUTER01
5b. [ ] **Sprint de Higiene de execucao root** (registrado 2026-07-11, sessao dedicada):
   - **CTXEXEC01** — unificar os dois portoes de execucao ao root: `execBloco`
     (auditado, sha256 + hash-chain) e `oq71z-exec`/`b94` (raw pro WebSocket do PTY
     root, com confirm desligavel via sessionStorage) coexistem. A auditoria
     hash-chain e contornavel pelo caminho usado no dia a dia. Unificar num
     `execToTerminal()` unico que registra em `execucoes`. Ler /opt/oqterm/server.js
     inteiro antes do 1o patch (L-CTXUNIFY01). Risco ALTO estrutural.
   - **CTXOQTERM01** — oqterm roda root sem senha, fora do Docker; unico controle e
     a assinatura do JWT (se vazar = root total no host). Escopo de usuario limitado
     (nao root direto) + 2FA de terminal ja desenhado. Mesma familia de risco.

## ACABAMENTO
6. [ ] Agente DESIGNER dedicado no pipeline — especializado em UI e consistencia
   visual. Encaixa mais naturalmente DEPOIS que a migracao Tailwind/React
   (strangler fig do dashboard) estiver madura, para o agente ter um sistema de
   design coerente sobre o qual opinar. Entra pela PENEIRA (META-CTXESTEIRA01)
   como novo titular do elenco.
7. [ ] Curadoria de elenco premium (GLM-5.2, MiniMax, OpenAI, Anthropic) — comparar custo x qualidade
8. [ ] UI padrao janelas (menu lateral + conteudo a direita, estilo Claude) — manter modal Provedores como esta

## EXPANSAO (bem pro final)
9. [ ] Cotas/multi-tenancy ("VPS dentro da VPS") — depende de container isolado maduro
10. [ ] Cluster multi-VPS / datacenter proprio

## OUTROS (dashboard "EM BREVE")
- [ ] DNA de projeto
- [ ] Deploy automatizado

## Ferramentas discutidas (sem prioridade de rodada ainda)
- Claude Code na VPS — instalar quando houver janela dedicada
- Auditoria com modelo forte — script pronto (scripts/gerar-dossie-auditoria.py)

## BACKLOG DE PRODUTO (ideias de feature, sem prioridade de sprint)
Migrado do roadmap.md antigo em 2026-07-11 — ideias de produto, nao debito.
- **Botao "Consultar agente" no card LAVE** — botao opt-in no card que deixa o
  usuario escolher qual dos 9 agentes quer ouvir sobre aquele bloco (Revisor
  comenta codigo, Detetive investiga, Auditor da 2a opiniao de seguranca).
  Chamada isolada e externa ao pipeline MAS (nao interrompe o fluxo sequencial).
  Endpoint esperado: POST /api/blocos/:id/consultar.
- **Gatilho duro de promocao por projeto** (principio de design p/ o item #2 /
  container isolado): container isolado so quando o projeto tiver >=N execucoes
  reais via /api/mas/run OU o humano marcar status:'producao' no project.json.
  Nunca container-por-padrao no wizard.

## BACKLOG TECNICO (condensado, sem prioridade — migrado do roadmap.md antigo 2026-07-11)
Lista de desejos de longo prazo, so para nao ficar invisivel. Detalhe quando
cada um for promovido a uma rodada:
- Limite de orcamento configuravel; rate limit por modelo; fallback automatico
  entre modelos; seletor de modelo dinamico.
- Cadastro de provedores na UI (parcial via CTXSECRETS01); comparacao de
  respostas lado a lado.
- Editor visual de workflow (DAG); loops sequencial/paralelo (fan-out/fan-in) /
  ReAct condicional.
- Guardrails / cerca eletronica / kill-switch.
- Consulta a KB antes de responder + embeddings sqlite-vss (RAG semantico).
- JARVIS: wake-word + Whisper STT + Piper TTS on-premise.
- Tabela agent_executions com ranking por posicao real; LM Eval Harness
  (benchmark padronizado de modelos por posicao).
- Multi-tenant + billing + DPA/LGPD + docs publicas + hardening (fase GA,
  conecta com item #9 EXPANSAO).
