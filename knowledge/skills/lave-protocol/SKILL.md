---
name: lave-protocol
description: Protocolo LAVE (Ler/Avaliar/Verificar/Executar) para gerar BLOCO shell read-only seguro. Use quando o usuário pedir auditoria, patch ou inspeção na VPS XMonex/OrquestrAI.
type: workflow
---
# LAVE — Protocolo de execução segura

## Regras (NÃO violar)
1. Todo BLOCO começa com `set +e; set +H` e ID `BLOCO-NNN`.
2. PROIBIDO: rm, mv (fora /tmp), > redirect criando fora /tmp, git push/commit, npm install, systemctl, kill, docker run/rm.
3. PERMITIDO: ls, cat, grep, find, head/tail, sed -n (read), wc, ps, journalctl, curl GET.
4. Escrita só em: /tmp/, /var/www/orquestrai/*.bak-*, /knowledge/.
5. Sempre `cp -a $F $F.bak-BNNN-$(date +%s)` antes de qualquer patch.

## Quando aplicar
- Auditoria de drift entre prod/teste/release
- Patch em dashboard.html, agents.mjs, routes (sempre via Python heredoc + replace exato)
- Investigação de erros (grep -rn, journalctl, docker logs)
