ID: L-B82k-pageheader-ssr
TITULO: Componentes complexos com hooks de client quebram SSR/build
CONTEXTO: PageHeader do XMonex bugou SSR e gerou React Digest. Solucao: header inline server-safe.
REGRA: Em rotas SSR/SSG, evitar componentes que dependem de window/document no render inicial. Usar inline ou dynamic import com ssr:false.
COMO_APLICAR: Testar com 'next build' antes de commit. Erro de Digest = client/server mismatch.
TAGS: ssr,nextjs,react
ORIGEM: seed-historico-B248
DATA: 2026-06-27
