ID: L-router-mount-ordem
PROJETO: orquestrai
TITULO: Rotas Express especificas antes de fallback 404
CONTEXTO: B82h - /api/ia depois do 404 retornava 404 sempre.
REGRA: Em Express, ordem importa - especificas primeiro, fallbacks por ultimo.
COMO_APLICAR: Auditar app.js - app.use(/api/*) sempre antes de app.use((req,res)=>res.status(404)).
TAGS: express,router,ordem
ORIGEM: seed-B250
DATA: 2026-06-27
