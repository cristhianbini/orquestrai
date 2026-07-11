---
name: smoke-preview
description: Revalidar o preview de sites de projetos (nginx auth_request) após qualquer mudança em nginx/proxy.conf ou no fluxo de preview. Confirma mount, auth por header, root+try_files e o 403 de paths não-/site/.
---

# smoke-preview

Roda o smoke-test do preview de projetos em segundos. Use SEMPRE após editar
`nginx/proxy.conf` ou qualquer coisa ligada ao preview de `/projects/{slug}/site/`.

## Passos
1. Depois de `nginx -t` + `nginx -s reload` (ver `nginx/CLAUDE.md`), rode:
   ```bash
   cd /var/www/orquestrai && bash scripts/smoke-preview.sh
   ```
2. O script checa os casos: mount de projects/ no container proxy, auth_request via header,
   root+try_files servindo o arquivo, e 403 para paths que não são `/site/`.
3. Qualquer caso falhando = não fechar a mudança. Instrumentar com headers de debug
   (auth_request_set + add_header) e MEDIR onde a requisição vai (L-CTXPREVIEWAUTH01).

## Contexto
O preview teve 4 bugs empilhados (mount, auth_request com $1, alias+try_files, root expondo dir).
Todos documentados em L-CTXPREVIEWAUTH01. Este smoke-test existe para não regredir nenhum deles.
