# ★ Desafios abertos — perguntas diretas ao auditor

> Este é o coração do dossiê. Em vez de só listar defeitos, formulamos as
> perguntas onde mais queremos sua opinião. Cobrimos **três frentes**:
> segurança da execução, arquitetura da migração e qualidade/manutenção.

---

## Frente 1 — Segurança da execução

O `oqterm` (PTY host) roda como **root, fora do Docker**, na porta 7654. Hoje a
mitigação é um **checkpoint de confirmação humana** (R6-15) antes de qualquer
execução. Perguntas:

1. Dado que precisamos de um terminal root funcional para operação, qual seria
   sua abordagem de **isolamento** sem perder a funcionalidade? (namespaces,
   seccomp, usuário dedicado com sudo granular, container privilegiado com
   capabilities restritas?)
2. O checkpoint humano é suficiente como defesa, ou você recomenda também
   **allowlist de comandos** / assinatura de comandos?
3. Existem hoje caminhos de execução distintos (`execBloco` protegido vs.
   caminho interativo do `oqterm`). Como você os **unificaria** sem quebrar o
   fluxo interativo? (registro: `CTXEXEC01`)

---

## Frente 2 — Arquitetura da migração (strangler fig)

Estamos migrando um `dashboard.html` de ~4700 linhas para ilhas React,
incrementalmente. Perguntas:

4. O `run_id` corrente hoje é obtido por **polling de 2s** em `/api/mas/last`.
   Isso é reconhecidamente uma gambiarra. Qual arquitetura de **push** você
   recomenda? (SSE dedicado com o run_id no próprio stream? WebSocket? O
   `run_id` deveria ser empurrado pelo pipeline no momento da criação?)
   (registro: `CTXMASRUNID01`)
5. O campo `execucoes.mas_run_id` **nunca é populado na prática** (todos os
   registros ficam null), o que bloqueia o cálculo completo do Harness Score.
   Onde no pipeline você injetaria o run_id para fechar esse elo?
6. Restam **containers-fantasma** no legado (`#agentes` com `display:none`
   permanente). Removê-los **agora** ou esperar migrar mais ilhas antes de
   limpar o legado? Qual o risco de remoção prematura vs. dívida acumulada?

---

## Frente 3 — Qualidade e manutenção

7. Os logs de debug foram removidos ponto a ponto (R6-16). O follow-up
   `CTXDEBUGFLAG01` propõe um **wrapper `DEBUG && log(...)`** com flag única, em
   vez de remover linha por linha (que é frágil e "volta" no próximo
   desenvolvedor). Você validaria esse padrão? Alguma alternativa melhor
   (ex.: logger com níveis)?
8. O `dashboard.html` monolítico ainda concentra muita lógica. Qual seria sua
   **ordem de extração** de ilhas para maximizar redução de risco por passo?
9. Padrão de entrega de patches: usamos **scripts Python base64** para evitar
   corrupção de heredoc no PTY, com matching ancorado (aborta se contagem de
   âncora ≠ 1). Há um padrão mais robusto que você recomendaria para edições
   cirúrgicas em produção com bind-mount ao vivo?

---

## Como responder

Qualquer uma dessas perguntas respondida já é ganho. Priorize as das Frentes 1
e 2 se o tempo for curto — são as de maior impacto arquitetural.
