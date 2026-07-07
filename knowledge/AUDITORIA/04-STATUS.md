# ★ STATUS — estado vivo

> Resumo narrativo, não lista de itens (essa vive em
> `knowledge/metas/RODADA-6-PLANO.md`, fonte única de verdade da Rodada 6).
> Atualizado a cada tarefa fechada.

**Última atualização:** `2026-07-07 (sessão Chat6)`
**Commit de referência:** `1489f4d` (ver git log para a cadeia completa da sessão)

---

## Onde estamos

Rodada 6 seguiu com foco no sistema de CONFIGURAÇÃO de agentes (agtPane,
ver 01-ARQUITETURA.md seção "Um TERCEIRO sistema"), distinto do React
island (execução). Fechamos CTXAGTUNIFY01 completo (fonte única: cards
alimentam a UI, ordem canônica do pipeline, cor/modelo sincronizados com
o ROUTING real). Descobrimos e corrigimos CTXAGTCARDMERGE01 (edição de
agente apagava telemetria/prompt/conteúdo não coberto pelo form — achado
em produção ao editar o AUDITOR, 114 amostras quase perdidas). Seed de
prompt real nos 9 agentes. Endpoint /api/agents/train (Opus sugere,
humano aprova) com botão funcional no form. Botão "usar" nas reservas
promove pra titular. Padronização visual dos botões (nav + terminal +
lic-card) com o mesmo padrão do COPIAR/EXECUTAR.

Progresso item-a-item: ver `knowledge/metas/RODADA-6-PLANO.md`.

## Destaques recentes

- Segurança: confirmação humana unificada + auditoria hash-chain cobrindo
  também o terminal root (antes só cobria execBloco).
- Qualidade: console de produção limpo (12+3 pontos de debug removidos,
  causa raiz documentada em lição).
- UX: painel de agentes com auto-scroll inteligente e reset correto de
  estado entre execuções.
- Topbar desktop ~20% mais compacta.

## Pendências abertas (alto nível -- detalhe no plano)

- CTXEXECMODAL01, R6-14, R6-13 (sub-sprints restantes), Bloco F/G completo.
- Nota de transparência: cadeia hash-chain começa do GENESIS a partir do
  commit db1d76e; execuções anteriores (origem=individual) não têm
  prev_hash retroativo (schema evoluiu depois).

## Metas registradas (fora do sprint atual)

Ver `knowledge/metas/` -- inclui CTXBLOCONUM01, CTXAGENTTRAIN01,
CTXBLOCODOC01, CTXTOPBARCONSIST01, CTXCOMMENTPASS01 (ainda a persistir
como arquivos individuais).

## Cronograma

Trabalho intensivo previsto para os próximos dias.
