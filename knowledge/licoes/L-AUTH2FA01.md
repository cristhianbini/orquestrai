# L-AUTH2FA01 — Auditoria completa de login destravou 4 achados encadeados
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** CTXAUTH2FA01

## Achados corrigidos
1. Senha admin em texto plano no server.js (ja publicada no GitHub) -> movida
   para ADMIN_PASSWORD no .env, com fallback seguro (zero downtime)
2. /api/login duplicado -- segundo handler (linha 199) nunca executava
   (primeiro handler sempre finalizava a resposta antes) -- removido
3. tfa.html vazava o secret do TOTP para api.qrserver.com (terceiro externo)
   via URL -- QR agora gerado localmente (lib qrcode, sem rede)
4. JWT_SECRET tinha fallback fraco e publico -- confirmado que .env real
   tem valor forte (44 chars), fallback so dispara aviso se .env sumir

## Nao corrigido (decisao consciente)
- tfa.html nao esta linkada em nenhum menu -- fica por URL direta ate
  o CTXVITE01 (sera componente React, nao vale linkar na versao vanilla)

## Regra permanente
Ao investigar "falta X", sempre checar se X foi construido parcialmente
antes (grep pelo nome do bloco/feature) e se os PONTOS DE ENTRADA (login,
rotas publicas) de fato USAM o que foi construido -- codigo existir !=
codigo estar no caminho de execucao real. Rotas duplicadas no Express sao
silenciosas: a de baixo nunca aparece em teste manual, so em leitura de
codigo linha a linha.
