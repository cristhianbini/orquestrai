# L-OQ65 — /api/blocos/executar exige body completo
Data: 2026-06-21

Sintoma: cockpit mostra 'ERR executar HTTP 409: sha256 nao bate (anti-tampering)'.

Causa: o fetch do client estava `{method:'POST', headers:H}` sem body. Backend (blocosRoutes.cjs) le req.body.sha256 e compara com row.script_sha256; undefined !== <hash> -> 409.

Regra: SEMPRE enviar { sha256: prep.sha256, autorizo:true, confirmacao:'EXECUTAR', motivo: '<>=5ch>' } no POST /api/blocos/executar/:id. Tambem mandar modo:'altera' no /preparar pra nao cair em 423 read-only.
