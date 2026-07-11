# CLAUDE.md — knowledge/ (base de conhecimento)

Maior ativo do projeto. Ver `../CLAUDE.md` para regras gerais.

## O que é cada subdiretório
- `licoes/` — lições permanentes (L-*, R6-*, BLOCO-*). Regras já aprendidas. **Consulte antes de
  agir** — grep pelo tema. Cada lição tem `PROJETO: orquestrai`.
- `metas/` — planejamento. **`ROADMAP-FUTURO.md` é a fonte CANÔNICA** de planejamento;
  `INDICE-MESTRE-SPRINTS.md` (fila S1-S25), `HANDOFF-POS-FABLE.md` (estado entre sessões),
  `RODADA-6-PLANO.md`, e os `META-CTX*.md` (uma meta cada).
- `decisoes/` — ADRs + `PROTOCOLO-ANTICONTAMINACAO.md` (fontes canônicas vs não-canônicas; ler no
  início de cada rodada).
- `_pending/` — **fila de curadoria humana** (L-PROP aguardando aprovação). NÃO auto-commitar
  (o watcher exclui essa pasta de propósito).
- `_audit/promocoes.jsonl` — ledger do ciclo de promoção. `blocos/` — blocos LAVE executados.
- `_arquivados/`, `.archive/` — histórico (gitignored/preservado). `agents/` — AGENT_CARDs dos 9 titulares.

## Ciclo de curadoria de lições
Falha/sucesso → Memorialista propõe `L-PROP-*` → Guardian pré-aprova → fila `_pending/` →
**humano aprova** → vira lição em `licoes/`. Só o humano promove (CTXKBCURATOR01).

## Armadilhas
- **`roadmap.md` (raiz de knowledge/) está SUPERADO** — é só um redirect p/ `metas/ROADMAP-FUTURO.md`.
  Não editar como planejamento; não deletar (o `roadmap-autosync` vigia o path).
- `contextos/001-sistema-orquestrai.md` é histórico desatualizado (era GLM/Release 0.1) — não é estado atual.
- Documento é inspiração; **sistema vivo é verdade** (L-CONTAMINACAO01). Handoff herdado é hipótese
  a verificar, não fato (L-CTXHANDOFFVERIFY01).
- `INDEX.md` e diretórios vazios (esqueleto de 2026-06-19) estão parcialmente defasados.
