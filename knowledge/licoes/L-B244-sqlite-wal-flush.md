ID: L-B244-sqlite-wal-flush
TITULO: Hook que le sqlite imediatamente apos write pode pegar 0 rows (WAL nao flushado)
CONTEXTO: B244 hook leu mas_event 400ms depois de runMas e viu 0 eventos, mesmo com 8 inseridos.
REGRA: Apos write em sqlite WAL, leitor em conexao separada pode ver dados defasados. Use retry loop (5-8x com 800ms) ate count atingir esperado.
COMO_APLICAR: Setar pragma journal_mode=WAL na conexao readonly e loopar com break quando count>=esperado.
TAGS: sqlite,wal,race,hook
ORIGEM: seed-historico-B248
DATA: 2026-06-27
