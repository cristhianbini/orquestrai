---
tipo: bloco-lave
id: BLOCO-194
title: "!/usr/bin/env bash"
sha256: ff5ad5208f6bb33c90515c4493c2654626d19692ce5843d7c7bd88bd0400b28d
created: 2026-07-08T07:07:43.779Z
---

# BLOCO-194 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# BLOCO-305 v1.0 — Auditoria de disco OrquestrAI (READ-ONLY)
set +e; set -H

PROJECT_ROOT="/var/www/orquestrai"
DATA_DIR="$PROJECT_ROOT/data"

echo "===== [1/4] Tamanho total (exclui node_modules/.git em qualquer nivel) ====="
# --exclude do du casa por padrao de path relativo; funciona recursivo.
du -sh --exclude="*/node_modules" --exclude="*/.git" "$PROJECT_ROOT" 2>/dev/null \
  || echo "ERRO: $PROJECT_ROOT inacessivel"

echo -e "\n===== [2/4] Top 5 subdirs (exclusao propagada aos filhos) ====="
# du por subdir mantendo exclusao interna: senao um subdir com node_modules
# aninhado infla o ranking. sort -rh ordena por tamanho humano.
find "$PROJECT_ROOT" -mindepth 1 -maxdepth 1 -type d \
   ! -name node_modules ! -name .git -print0 2>/dev/null |
while IFS= read -r -d '' dir; do
    du -sh --exclude="*/node_modules" --exclude="*/.git" "$dir" 2>/dev/null
done | sort -rh | head -5

echo -e "\n===== [3/4] Tamanho fisico dos DBs (inclui -wal/-shm se houver) ====="
# -wal/-shm importam: DB "pequeno" no .db pode ter MBs presos no WAL.
ls -lh "$DATA_DIR"/cluster.db* "$DATA_DIR"/blackboard.db* 2>/dev/null \
  || echo "ERRO: DBs nao encontrados em $DATA_DIR"

for DB in cluster blackboard; do
  echo -e "\n===== [4/4] Estatisticas internas ${DB}.db ====="
  # freelist_count > 0 => espaco recuperavel via VACUUM (nao executado aqui).
  sqlite3 "$DATA_DIR/${DB}.db" "
    SELECT
      (SELECT page_count    FROM pragma_page_count())    AS pages,
      (SELECT freelist_count FROM pragma_freelist_count()) AS free_pages,
      (SELECT page_size     FROM pragma_page_size())      AS page_bytes,
      ROUND((SELECT page_count FROM pragma_page_count())
            * (SELECT page_size FROM pragma_page_size())/1048576.0, 2) AS size_mb,
      ROUND((SELECT freelist_count FROM pragma_freelist_count())
            * (SELECT page_size FROM pragma_page_size())/1048576.0, 2) AS reclaimable_mb;
  " 2>/dev/null || echo "ERRO: ${DB}.db inacessivel/corrompido"
done

echo -e "\n===== FIM BLOCO-305 ====="
~~~
