# HANDOFF — Estado pós-sessão Fable 5 (2026-07-07)
PROJETO: orquestrai
> Para Opus/Sonnet retomarem: leia INDICE-MESTRE-SPRINTS.md (fila S1-S25) e
> este arquivo (pendências finas). Regra de ouro: L-CTXHANDOFFVERIFY01 --
> verifique o estado pelo terminal, não confie só neste texto.

## RESOLVIDO nesta continuacao (nao refazer)
- Bug "usar reserva" (CTXUSARFIX02): slot promovido nascia com slug fake
  'pos9' -> lapis nao achava card + cor cinza. Fix: slug derivado do label
  (mesmo normalize do backend) + cor do card real. Testado: CRITICO promovido,
  lapis abre o card. Commit 84d7b2d/aafeec0.
- Layout da reserva: R# movido pra dentro do dot, labels longos nao cortam.
- Decisoes de arquitetura (R# relativo + pipeline por merito) registradas em
  META-CTXESTEIRA01.

## Fila imediata (ordem)
1. VERIFICAR CTXMEMKB01: rodar 1 run MAS -- memorialista deve concluir NO
   cerebras sem AGENT_ERROR 400 e COM tokens no card. Se falhar de novo:
   plano B = trocar modelo do memorialista p/ claude-haiku (ROUTING em
   mas/agents.mjs L174) -- o fallback informal ja provou que haiku funciona.
2. S4 continua: AUDITOR (13.2) via botao Treinar -- fluxo: lapis > Treinar >
   revisar sugestao do Opus ANTES de Cadastrar (checar: papel L2 sem invadir
   DETETIVE, limites de tamanho, KB por ID, ancora em evidencia p/ nao
   repetir L-AUDITOR01). Depois 13.3-13.9, UM POR VEZ, run de teste entre cada.
3. CTXBLOCONUM01 (SUBIU DE PRIORIDADE): 3 contadores de bloco dessincronizados
   confundem o operador diariamente -- #N do card (localStorage), BLOCO-N no
   texto (LLM inventa), arquivos em knowledge/blocos/. Unificar: fonte unica
   = contador persistido no backend, injetado no prompt do Smith.

## Backlog tecnico (registrado, sem urgencia)
- A8: JWT_SECRET placeholder ('orquestrai-secret-change-me-2025') no
  /etc/oqterm.env -- trocar exige sincronizar com o secret da API (senao
  todo token invalida). Fracao dedicada.
- CTXEXECMODAL01: confirm() nativo -> modal custom (design do sistema).
  E o checkpoint de seguranca R6-15 -- trocar com calma, nunca com pressa.
- Fallback [B222] so cobre 429; erros 400 vazam 2x antes de algo assumir.
  Avaliar fallback tambem p/ 4xx de contexto (com log explicito).
- Telemetria do caminho de fallback nao registra tokens (card mostra '--').
- Memorialista errou schema do cluster.db em run (created_at vs criado_em):
  candidata a licao L-SCHEMA01 + garantir que KB a sirva aos agentes.
- Slot #10/#11 vagos: preencher via PENEIRA (avaliacao antes da promocao),
  nunca por 'usar' direto. Fix do usar ja materializa card (L-PROMOTESEMCARD01).

## O que foi entregue nesta sessao (nao redescobrir)
Auditoria Fable (7 achados, 2 rebaixados com evidencia) | S1 KB limpa +
filtro projeto | S2 mas_run_id ponta a ponta + block_executed no harness +
portao EXECUTAR agora auditado (nunca foi antes) | S3 oqterm bind 172.18.0.1
+ nginx sem query string + 2247 tokens eliminados | S4: BATEDOR curado,
esteira 1-9 justificada no codigo, reserva R1-R15 tatica, PENEIRA visual,
fix promocao-cria-card, CTXMEMCTX01+CTXMEMKB01 (400 do memorialista).
Licoes novas: L-PORTTEST01, L-ENVFILEWINS01, L-DATASETVOLATIL01,
L-PROMOTESEMCARD01 (+2 da auditoria). ~30 commits, todos com o porque.

## VISAO DE MENTOR — observacoes do Fable p/ Opus/Sonnet (nao sao tarefas; sao direcoes)

### Estabilidade
- O padrao .bak-manual acumula (dashboard.html ja tem varios da sessao) --
  quarentenar periodicamente em _arquivados/ (regra do projeto) ou criar
  script scripts/quarentena-baks.sh que roda semanal.
- docker restart e' o unico deploy da API -- sem healthcheck pos-restart
  automatizado. Sugestao barata: script restart-api.sh = restart + curl
  /healthz + check de run ativa ANTES (o comando ja existe na KB).
- SQLite em WAL segura bem 1 operador; o teto real chega com multi-user
  (R6-19). Nao migrar antes -- Litestream ja cobre o risco de perda.

### Seguranca (alem do backlog)
- kb.cjs PROIBE no STACK_CTX comandos destrutivos em BLOCO, mas a defesa
  real e' o hardVeto do guardian -- os dois nao estao sincronizados (listas
  diferentes). Unificar num unico modulo de regras (fonte unica).
- localStorage guarda o JWT (oq_token) -- XSS = token roubado. Mitigacao
  futura: cookie httpOnly p/ sessao + token curto so p/ SSE. Custo alto,
  so vale junto do multi-user.
- Rate limit de /api/agents/* usa kbLimiter -- conferir se train (chama
  Opus, custo real) tem limite proprio mais apertado.

### Funcionalidades com maior razao valor/esforco (na minha leitura)
1. CTXMASRUNID01 push (S17): SSE unico com run-started mata o polling 2s
   e simplifica 3 pontos do frontend. ~1 sessao.
2. Score por agente: a PENDENCIA DE PRODUTO do R6-11 continua sendo o
   desbloqueio mais valioso -- agora que block_executed existe, a formula
   pode nascer simples: taxa de blocos executados+aprovados por agente.
3. PENEIRA funcional (S7): 1 run de teste padronizada (mesmo goal fixo)
   por candidato + comparativo de custo/qualidade = promocao por merito.
4. CTXBLOCONUM01: contador unico no backend (tabela counters), injetado
   no prompt do Smith e exibido no card -- 3 fontes viram 1.

### Qualidade dos agentes (p/ a curadoria 13.2-13.9)
- Padrao que funcionou no BATEDOR: papel + fronteira anti-drift explicita
  ("sem interpretar logica") + limites duros (max linhas, sem bash) + KB
  por ID. Repetir esse esqueleto nos 8.
- METRICO e AUDITOR rodam em free tier (cerebras/groq) -- mesmos riscos de
  limite do memorialista. Se aparecer 400 neles, a solucao CTXMEMKB01
  (opts no loadKB) ja esta pronta p/ reusar por agentId.
- REVISOR (Opus) e' o mais caro do run ($0.12 de $0.19 total observado) --
  quando o score por agente existir, avaliar se todo run precisa dele ou
  so runs que geram bloco (pipeline adaptativo, Q10).

### Dividas que NAO vale pagar agora (anti-tarefas)
- Nao migrar agtPane pro React antes de terminar R6-13/14 (wrappers) --
  ordem inversa dobra o risco.
- Nao mexer na formula do harness (pesos) sem decisao de produto registrada.
- Nao trocar confirm() sem redesenhar o fluxo de seguranca junto (R6-15).


## ADENDO — Sessao 2026-07-08 (Fable, continuacao)
### Fila imediata ATUALIZADA (substitui a anterior)
1. FIX METRICO (13.8 reprovado, mapa pronto): (a) clonar buildMemorialistaContext
   (mas/agents.mjs L253) -> buildMetricoContext injetando tokens_in/out,
   cost_usd, latency_ms REAIS por agente; (b) enxertar no loop L265-269
   (if ag.id==='metrico'); (c) descobrir nome real da var de results
   (grep retornou vazio p/ 'results.push' -- procurar como os done events
   sao acumulados); (d) adicionar clausula ao card: "Se os numeros nao
   estiverem disponiveis, escreva DADOS_INDISPONIVEIS -- NUNCA estime";
   (e) RESTART obrigatorio; (f) run de validacao: 2 linhas secas, zero bash,
   numeros batendo com o blackboard.
   EVIDENCIA da reprova: run mas_70fbd96f7e42 -- inventou "200tk/$0.00/0.3s/
   metrico mais pesado" quando o real era revisor 14.1k/$0.095.
2. FIX B246: mas/promote-lessons.mjs L50 retorna {skipped} e o evento done
   do memorialista grava vazio -- persistir o texto do modelo mesmo no skip.
3. 13.9 REVISOR (ultimo do S4) + decisao Q10 junto: $0.09/run em TODO run
   ou so runs com BLOCO executavel? (telemetria: revisor $2.05 em 22 runs
   vs smith $2.44 em 90).
### Novidades desta sessao (nao redescobrir)
- METAs novas: CTXROSTERUX01 (rebaixar+drag+UX modal), CTXPIPECLOSE01
  (#10 TESTADOR #11 VERIFICADOR), CTXSELFKNOW01 (tese autoconhecimento).
- CRITICO: treinado, card ok, REBAIXADO (agent_positions vazia = correto;
  titulares 1-9 vem do codigo; tabela e' so overrides, 0-based).
- 3 L-PROP aprovadas -> licoes/ (1o ciclo propor->guardian->humano->KB ok).
- LICAO DA REPROVA (vale p/ #11 VERIFICADOR futuro): agente de sintese L5
  SEM dado injetado = alucinacao garantida. Encanamento vem ANTES do prompt.
- DeepSeek + MiniMax: candidatos PENEIRA com $5-10 do Bini (comparativo
  preco/contexto/rate-limit/qualidade-PTBR pendente).

## ADENDO 2 — Continuacao 2026-07-08 (patch CTXMETRICTELEM01 + ideias Bini)
### Estado do patch (commit do codigo APOS validacao em run)
CTXMETRICTELEM01 aplicado em mas/agents.mjs (5 edits, backup .bak-telem-*):
__telem acumulador + __inj (memorialista=textual, metrico=tabela numerica)
+ enxerto no callLLM + guard morto B238 neutralizado. DESCOBERTA: B238 era
codigo morto ('results' nunca existiu) -- memorialista NUNCA recebeu run
summary; done vazio nao era bug do promote-lessons, era prompt sem material.
### Licao nova p/ KB: L-REPLACEDOLLAR01
String.replace() com substituicao contendo $' / $& / $` injeta pedacos do
proprio arquivo (footgun JS). Em patch programatico: replace(a, ()=>b) ou
split/join. Padrao consolidado dos patches: ancora unica + abort por
contagem (salvou o arquivo 3x nesta sessao).
### Ideias do Bini registradas (decisoes de produto)
1. REDESIGN DE TELAS (adendo S9-S11): padrao "Provedores de IA" (modal
   com abas SECAO) aprovado como referencia -- replicar p/ Manual, Licoes,
   Projetos. Telas separadas consistentes > hub centralizado. Fazer APOS
   S8/score (design com dado vivo > estetica com dado morto).
2. LOVABLE->GITHUB->VPS (adendo S20/S21/S25): OrquestrAI como plataforma
   de operacao da CBini. Projetos proprios: manual de exportacao padrao
   (estrutura de dirs, compose, README, envs) p/ chegar no formato ideal.
   Projetos de terceiros: BATEDOR + import GitHub reconhecem qualquer
   estrutura. Cada projeto em container proprio (S20) ou VPS dedicada.
   Modo automatizado de implantacao: so quando plataforma ~100%.
3. Sequencia mestre confirmada: S4 completo -> score -> PENEIRA
   (DeepSeek/MiniMax $5-10) -> L-SELF* -> redesign -> plataforma CBini.

## ADENDO 3 — Rodada 2026-07-08 (parte 2): ideias Bini + Q10 municiado
### Ideias registradas
1. QWEN 3.6 27B: 3o candidato PENEIRA (junto DeepSeek+MiniMax) -- Bini ouviu
   bom custo/beneficio. Comparativo dos 3: preco/1M, contexto, rate-limit,
   qualidade PT-BR. Entrada SEMPRE via PENEIRA com run padronizada.
2. DOCUMENTACAO VISUAL DO SCORE (adendo ao redesign S9-S11): quando as telas
   novas nascerem (padrao Provedores-com-abas), incluir tela/aba explicando
   COMO o score de cada agente e' pontuado -- formula visivel, interativa,
   moderna. Idem p/ fluxo da esteira, treinamento dos agentes, manuais.
   Principio: o operador deve COMPREENDER o sistema olhando pra tela
   (transparencia = confianca = CTXSELFKNOW01 na camada visual).
### Q10 municiado (decisao pendente do Bini)
127 runs / revisor 27x / \$2.54 / so 3 runs (2%) com bloco executado
(ressalva: mas_run_id e' novo, taxa real maior, mas mesmo 20% cortaria
~80% do maior custo). Proposta de implementacao quando decidir: revisor
condicional -- so convocado se smith produziu BLOCO executavel no run.

### CTXCHATUX01 — Chat narra, Mesh processa (ideia Bini 2026-07-08, refinada)
PROBLEMA: chat exibe 1 msg por agente = duplica o painel mesh (que ja mostra
status/tk/custo por agente ao vivo) e nao escala (26 agentes = 26 gritos).
DESENHO: chat = 5 marcos fixos (goal | pipeline iniciado | EXCECOES: veto/
erro | sintese do RELATOR | bloco pronto). O RELATOR curado no S4 ja E' a
voz oficial (1 frase + semver) -- o chat so precisa promove-lo. Detalhe por
agente: mesh (existe) + clique no card -> modal output completo (B339 ja
faz metade). Toggle 'modo verboso' p/ debug.
QUANDO: quick-win possivel antes do redesign (filtrar msgs de agente no
ponto de injecao SSE->chat = 1 condicional); versao completa junto S9-S11.

### CTXCHATUX01 refinamento 2 (Bini): rotulo do chat MENTE o modelo
BUG CONFIRMADO: toda msg de agente no chat sai carimbada com o MODELO ATIVO
do seletor do chat individual (ex. 'Claude Sonnet 4 5'), ignorando d.model
que JA CHEGA em cada evento SSE (bus.emit envia model real por agente).
Metrico rodou groq, auditor cerebras FREE -- chat disse Sonnet p/ tudo.
Mesma classe do confirm() mentiroso: dado certo viaja, apresentacao erra.
FIX (entra no quick-win CTXCHATUX01): marco no formato
'<emoji/cor do card> AGENTE · modelo-real' + texto. Persona = nome do
agente; cracha = modelo. Cor herdada do card (consistencia com mesh).

### CTXLEARNTEST01 — Teste de regressao de aprendizado (ideia Bini 2026-07-08)
CONCEITO: aprendizado so e' REAL se muda comportamento. Ciclo: erro ->
licao -> KB -> REPETIR O MESMO ESTIMULO -> medir se a resposta mudou.
E' a Fase 3 do harness que o codigo ja reservava ('reincidencia').
CASO DE TESTE INAUGURAL (ja engatilhado): perguntar de novo 'qual o nome
do sistema?' apos L-nome-sistema-nao-precisa-bloco entrar na KB --
sucesso = pipeline responde SEM gerar bloco (ou router nem aciona o MAS).
DESENHO FUTURO: suite de goals-gatilho (1 por licao critica) rodada
periodicamente; reincidencia detectada = licao nao absorvida = sinal de
KB scoring falho ou prompt fraco. Metrica: taxa de reincidencia por licao.
Conecta: PENEIRA (run padronizada e' o mesmo mecanismo), Fase 2 score,
CTXSELFKNOW01 (a prova final do autoconhecimento e' nao repetir o erro).

### ACHADO CRITICO fim-de-rodada (2026-07-08): gate B271 bypassado desde sempre
Frontend L1613 manda mas_mode:true HARDCODED em toda msg -> masModeExplicit
sempre true -> classifyIntent NUNCA consultado. Patch CTXROUTER01 (triggers)
esta correto e no ar, mas inerte. FIX (proxima rodada, 1a fracao): remover
o hardcode ou ligar a toggle real; VALIDACAO = 1o CTXLEARNTEST01 (repetir
'nome do sistema na VPS' -> deve responder via quickChat ~\$0.001).
Defesa em profundidade 3 aneis: porta(router, fix pendente) + meio(SMITH
nao gerar bloco p/ fato consolidado -- licao ja na KB) + fim(Q10, ok).

### CTXEARLYEXIT01 — Early-exit do pipeline (ideia Bini 2026-07-08)
'Se a resposta ja sair no batedor, nao tem porque os outros seguirem.'
Diferente do router (decide NA PORTA): early-exit decide DURANTE o run.
Desenho candidato: apos scout/auditor, um check barato (haiku ou heuristica)
avalia 'o goal ja esta respondido?' -- se sim, pula direto p/ relator
(sintese) + memorialista (licao) e encerra. Smith/guardian/revisor so
rodam se ha algo a CONSTRUIR. Conecta com Q10 (mesma familia: convocacao
por necessidade) e com a matematica do Bini: pergunta de \$0.19 viraria
~\$0.04 (scout+auditor+relator). PRE-REQUISITO: validar CTXROUTER01-fix
primeiro (a porta resolve 80% dos casos; early-exit pega o resto).
### CORRECAO de honestidade: commit 3c8ddd7 disse 'CTXLEARNTEST01 VALIDADO'
mas a run da evidencia era PRE-fix (mas_663ec anterior ao patch). O teste
real: repetir a pergunta POS Ctrl+Shift+R. Registrado p/ nao enganar o futuro.
