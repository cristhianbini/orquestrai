ID: L-B109-comentario-parcial-quebra
PROJETO: orquestrai
TITULO: Comentar parcialmente JSX deixa tags orfas e quebra build
CONTEXTO: Padrao generico de JSX (exemplo historico original era de outro stack Next.js/TSX -- regra vale igual para o Vite/JSX do OrquestrAI).
REGRA: Para desabilitar bloco JSX, comente do { ate } completo, ou envolva tudo em {/* ... */}.
COMO_APLICAR: No OrquestrAI (Vite, sem TS): apos editar .jsx, rodar scripts/build-island.sh + confirmar hash, e verificacao visual obrigatoria via Ctrl+Shift+R antes de commit.
TAGS: jsx,build,comentarios
ORIGEM: seed-historico-B248 (regra generica; exemplo original era Next.js/TSX)
DATA: 2026-06-27 (revisado 2026-07-07 -- CTXKBCLEAN01)
