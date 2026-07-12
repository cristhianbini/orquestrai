PROJETO: orquestrai
TIPO: licao
CRIADO: 2026-07-12
TAGS: login, env, restart, turnstile, diagnostico, monitoramento

# L-LOGIN — senha nova "dormente" no .env + Turnstile mascara o erro real

**Sintoma (12/07 ~02:56 UTC):** login parava em "Verificacao de seguranca
falhou" mesmo com Cloudflare OK, inclusive em aba anonima.

**Causa real (2 camadas):**
1. ADMIN_PASSWORD foi definida pela 1a vez no .env em 11/07 06:53 (append
   interativo via read -rsp, sem eco nem dupla digitacao) mas o api NAO foi
   reiniciado na hora — a senha ficou DORMENTE ~15h ate o `compose restart
   api` de 22:28 UTC (feito pela sessao E1a/E1b por outro motivo). O
   processo antigo validava o fallback; apos o restart, so a senha nova vale.
2. Token Turnstile e USO UNICO e o frontend (App.jsx) NAO chama
   turnstile.reset() apos 401 — toda retentativa reenvia token consumido,
   vira "timeout-or-duplicate" e MASCARA o erro real de credencial.

**Diagnostico rapido (o que fechou o caso em ~25 min):**
- `docker compose logs api | grep CTXCLOUDFLARE01` — error-codes:
  invalid-input-secret = secret ruim; timeout-or-duplicate = reuso.
- access.log do proxy: TAMANHO do body do 401 distingue a causa
  (38 = senha incorreta; 45 = need_totp/fluxo normal; 61 = turnstile).
- Comparar sha256 do valor no .env vs env do container (sem imprimir).

**Automatizar:**
- Alerta se mtime do .env > StartedAt do container (env editado sem aplicar).
- Healthcheck sintetico de login pos-restart (espera need_totp, nao 200).
- turnstile.reset() no handler de erro do frontend.
- Segredo digitado as cegas: exigir dupla digitacao antes do append.
