---
name: patch-seguro
description: Procedimento para editar com segurança qualquer arquivo de código em produção (.js/.cjs/.mjs) no OrquestrAI — backup, edição via arquivo, validação de sintaxe, confirmação por grep e restart correto. Use antes de qualquer patch em backend.
---

# patch-seguro

O ritual de patch da casa, destilado das lições. Não é script — é checklist. Cada passo
existe porque pular ele já quebrou produção.

## Checklist
1. **Backup**: `cp -a <arquivo> <arquivo>.bak-<TAG>-$(date +%Y%m%d-%H%M%S)` (L-B236). `.bak-*` é gitignored.
2. **Editar via ARQUIVO**, nunca `node -e`/`sed` inline no shell interativo (expansão de histórico
   com `!` mata o patch silenciosamente — L-BASHHIST01; sed com parênteses quebra JS — L-B235).
   Use a ferramenta Edit/Write.
3. **Validar sintaxe**: `node --check <arquivo>` para .js/.cjs/.mjs. NÃO funciona em .html (L-SPOT05).
4. **Confirmar no ARQUIVO por grep**, não pela mensagem do terminal (o terminal mente em paste
   multi-linha — L-FEEDBACK02, L-BASHHIST01). Ex: `grep -n "<trecho novo>" <arquivo>`.
5. **Restart correto**:
   - código bind-mount (server.js, api/, mas/, src/) → `docker restart orquestrai-api` (ou -web).
   - mudou `.env` → `docker compose up -d --force-recreate <service>` (restart NÃO relê .env — L-INFRA01).
   - Antes do restart do api: confirmar que NÃO há run MAS ativa (blackboard.db, status='running').
6. **Validar saúde após restart**: `/api/health` 200, logs sem erro (`docker logs --since 30s`),
   restarts=0. Nunca encadear 2 restarts sem validação intermediária.

## Se algo falhar
Rollback pelo `.bak` (L-B236) ou `git checkout`. Após 3+ patches sem sucesso no mesmo arquivo,
PARE e leia o arquivo inteiro antes do próximo (L-CTXUNIFY01).
