-- MAS schema v2 — Telemetria por projeto (ROADMAP-FUTURO item #3)
-- Data: 2026-07-11. Sessao dedicada, decisoes CBini:
--   * project_slug NULLABLE em runs e mas_run. NULL = run "solta" (chat
--     direto, mas.html, e as 158 linhas historicas — nao inventamos
--     atribuicao retroativa). O rotulo humano '(sem-projeto)' e aplicado
--     via COALESCE no endpoint de agregacao, NUNCA gravado no banco:
--     um projeto real poderia se chamar 'loose'/'chat' (regex de slug
--     permite), entao valor-sentinela no banco arriscaria colisao.
--   * runs esta DORMENTE (0 linhas, sem INSERT no codigo em 2026-07-11);
--     ganha a coluna mesmo assim para manter paridade de schema com
--     mas_run — se voltar a ser usada, ja nasce certa.
-- ATENCAO: SQLite nao tem ADD COLUMN IF NOT EXISTS — este arquivo NAO e
-- idempotente; reaplicar da erro 'duplicate column' (inofensivo). O guard
-- idempotente em runtime (padrao blocosRoutes ensureSchemaCTXPROV01)
-- entra junto com o codigo que grava o slug (passo E2).

ALTER TABLE mas_run ADD COLUMN project_slug TEXT;
ALTER TABLE runs    ADD COLUMN project_slug TEXT;

INSERT INTO schema_version(v, note)
  VALUES (2, 'Telemetria por projeto: project_slug nullable em runs/mas_run');
