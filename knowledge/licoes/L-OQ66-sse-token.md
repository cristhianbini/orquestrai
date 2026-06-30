# L-OQ66 — EventSource nao manda Bearer header
Data: 2026-06-21

Sintoma: '[LAVE] stream desconectado' logo apos disparar EXECUTAR.

Causa: API do browser EventSource nao permite custom headers. O endpoint /api/blocos/:id/stream rejeita 401 quando nao chega Authorization, e o backend ja aceita ?_t=<jwt> na query como fallback.

Regra: SEMPRE construir URL do SSE como `/api/blocos/<id>/stream?_t=<encodeURIComponent(TOKEN)>`. Se um dia migrar pra fetch+ReadableStream, ai sim da pra usar Bearer header.
