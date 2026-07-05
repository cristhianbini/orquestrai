# 📋 Dossiê de Auditoria — OrquestrAI

> **Porta de entrada.** Se você é o auditor, comece por aqui.
> Este dossiê é mantido **vivo** durante o desenvolvimento — o arquivo que muda
> a cada sprint é o `04-STATUS.md`. Os demais são relativamente estáveis.

---

## O que é o OrquestrAI

Cockpit de orquestração multi-agente de IA. Coordena um pipeline de agentes
(BATEDOR → AUDITOR → DETETIVE → ARQUITETO → GUARDIÃO → MEMORIALISTA → RELATOR →
MÉTRICO → REVISOR) através de um **blackboard** (quadro-negro compartilhado em
SQLite) que registra eventos do MAS (Multi-Agent System). Roda em produção em
`orquestrai.cbini.com.br` sobre uma VPS Hostinger.

O esforço atual é um **refactor strangler fig**: migrar um `dashboard.html`
monolítico (~4700 linhas) para *ilhas React* (island architecture), um passo
cirúrgico por vez, **sem quebrar produção**.

---

## Como navegar este dossiê

| Arquivo | Conteúdo | Estabilidade |
|---|---|---|
| `00-LEIA-PRIMEIRO.md` | Este índice | estável |
| `01-ARQUITETURA.md` | Stack, containers, bind-mounts, os 2 sistemas de card, fluxo SSE | estável |
| `02-SEGURANCA.md` | Camadas de proteção já implementadas + riscos conhecidos (transparência) | estável |
| `03-DESAFIOS-ABERTOS.md` | ★ Perguntas diretas ao auditor — onde mais queremos ajuda | evolui |
| `04-STATUS.md` | ★ **VIVO** — estado atual, atualizado a cada tarefa fechada | muda toda hora |
| `05-PENDENCIAS.md` | Follow-ups catalogados (para o auditor não "descobrir" o que já sabemos) | evolui |
| `06-COMO-VALIDAR.md` | Passos concretos para o auditor **reproduzir** o que afirmamos | estável |

---

## Acesso ao repositório

Você tem acesso de leitura **completo ao repositório inteiro** (todo o
histórico git, `knowledge/licoes/`, `knowledge/metas/`), não só a esta
pasta. Pontos de entrada úteis:

- `git log --oneline` -- histórico real, incluindo erros e correções (não
  escondemos retrabalho; é evidência de processo real).
- `knowledge/licoes/` -- bugs encontrados e corrigidos, causa raiz
  documentada.
- `knowledge/metas/RODADA-6-PLANO.md` -- fonte única de verdade do plano
  técnico da rodada atual (este dossiê resume; aquele é o detalhe
  granular).

---

## Filosofia deste dossiê

Preferimos **admitir dívida técnica a escondê-la**. Um sistema "aparentemente
perfeito" gera desconfiança; um sistema que mapeia honestamente suas pendências
(veja `02` e `05`) merece mais confiança. O `03-DESAFIOS-ABERTOS` transforma a
auditoria de "caça a defeitos" em **consultoria dirigida** — dizemos onde
sabemos que há atrito e pedimos a melhor abordagem.

---

## Protocolo de trabalho (contexto para entender os commits)

- **LAVE**: Ler → Avaliar → Verificar → Executar antes de qualquer mudança.
- **LAVE-F** (fractionation): validar sintaxe real (`node --check`) antes de
  commitar; nunca commitar antes de verificação no browser (Ctrl+Shift+R);
  remover por *conteúdo âncorado* (regex), nunca por número de linha; um alvo
  por passo.
- Detalhes em `knowledge/PROTOCOLO-LAVE-F.md` e nas lições em
  `knowledge/licoes/`.
