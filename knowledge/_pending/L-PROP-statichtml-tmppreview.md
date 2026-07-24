# L-PROP-statichtml-tmppreview

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-14T08:12:23.795Z. Aguardando revisao humana._

ID: L-PROP-statichtml-tmppreview
TITULO: BUILD static-html sem DB requer separacao nitida preview (/tmp) vs persistencia (/projetos/{slug}/) e chamada explícita a /api/mas/construir
CONTEXTO: Run BUILD sabordaterra (stack=static-html, db=none). SMITH gerou ARCHITECTURE.md em /tmp; arquivo nunca foi gravado em /var/www/orquestrai/projetos/sabordaterra/ porque nenhum agente chamou POST /api/mas/construir com project_slug. Risco: desenvolvedor vê "run completou" no log, mas projeto fica órfão (blueprint existe, site não existe).
REGRA: (1) Toda ação que gera arquivo em /tmp DEVE ter checkpoint explícito: "pronto para gravar? sim/não"; (2) Se resposta = sim, OBRIGATORIAMENTE chamar /api/mas/construir com body {project_slug, file_path, content_hash}; (3) Nunca assumir que "ls /tmp mostra arquivo" = "projeto foi criado". Diferenciar claramente: preview (validação, leitura) vs persist (commit ao site). (4) Para static-html, após gravação, rodar sanidade: ls /var/www/orquestrai/projetos/{slug}/index.html && wc -l /var/www/orquestrai/projetos/{slug}/*.html.
EVIDENCIA: Run mas_<runid>, agent smith gerou /tmp/sabordaterra_ARCHITECTURE_*.md (existente, verificável com ls -lh /tmp/), mas ARCHITECTURE.md NÃO aparece em /var/www/orquestrai/projetos/sabordaterra/ (confirmável via docker exec orquestrai-api ls -la /var/www/orquestrai/projetos/sabordaterra/). BLOCO-sabordaterra-architecture-plan gerou preview; faltou passo de gravação real.

---
