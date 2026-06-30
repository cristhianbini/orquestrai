ID: L-B109-comentario-parcial-quebra
TITULO: Comentar parcialmente JSX/TSX deixa tags orfas e quebra build
CONTEXTO: B108 comentou só uma linha de um bloco JSX e quebrou page.tsx do ChatBot.
REGRA: Para desabilitar bloco JSX, comente do { ate } completo, ou envolva tudo em {/* ... */}.
COMO_APLICAR: Sempre 'next build' ou 'tsc --noEmit' apos editar TSX.
TAGS: tsx,jsx,build,comentarios
ORIGEM: seed-historico-B248
DATA: 2026-06-27
