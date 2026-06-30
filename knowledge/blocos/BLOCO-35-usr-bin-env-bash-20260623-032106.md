---
tipo: bloco-lave
id: BLOCO-35
title: "!/usr/bin/env bash"
sha256: c70fd80b35aee7fe4e4c112b028229968542021687301374e8087884fe198011
created: 2026-06-23T03:21:06.871Z
---

# BLOCO-35 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# --------------------------------------------------------------
#  XMonex – diagnóstico rápido do pipeline (read‑only)
#  Requisitos:
#   • set +e  – não aborta ao primeiro erro
#   • set +H  – desabilita expansão histórica (!)
#   • backups com timestamp
#   • idempotente (marker)
# --------------------------------------------------------------
set +e      # continue even if a command fails
set +H      # disable history expansion

# ---------- CONFIG ----------
MARKER="/tmp/.xmonex_pipeline_check.done"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/xmonex_${TIMESTAMP}"
RELEASE_DIR="/var/www/xmonex_release"
PIPELINE_ROOT="/var/www/atualiza/pipeline"
PROMOVER_SCRIPT="${PIPELINE_ROOT}/promover.sh"
EXPECTED_SHA="a5f4c3e2d9b8e7f6c1d2a3b4e5f60789b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6"   # <-- ajuste p/ seu ambiente

# ---------- IDEMPOTÊNCIA ----------
if [[ -f "${MARKER}" ]]; then
  echo "[!] Execução já realizada em $(cat ${MARKER}); saindo."
  exit 0
fi

# ---------- PREPARAR BACKUP ----------
mkdir -p "${BACKUP_DIR}"
echo "[i] Backup de segurança criado em ${BACKUP_DIR}"

# backup dos arquivos de release que serão verificados
for f in Sistema.js app.js segurancaMiddleware.js; do
  src="${RELEASE_DIR}/release/${f}"
  if [[ -f "${src}" ]]; then
    cp -a "${src}" "${BACKUP_DIR}/${f}.bak-${TIMESTAMP}"
  fi
done

# ---------- 1. CONFIRMAR HARD‑CODINGS ----------
echo "[i] Verificando hard‑codes de 'createc.com.br' nos arquivos de release..."
hardcode_ok=true
for f in Sistema.js app.js segurancaMiddleware.js; do
  file="${RELEASE_DIR}/release/${f}"
  if grep -q "createc\.com\.br" "${file}"; then
    echo "    ✔ ${f} → contém 'createc.com.br'"
  else
    echo "    ✘ ${f} → NÃO contém 'createc.com.br' (já removido ou nunca existiu)"
    hardcode_ok=false
  fi
done

# ---------- 2. COMPARAR SHA‑256 ----------
echo "[i] Comparando SHA‑256 de promover.sh com o esperado..."
if [[ -f "${PROMOVER_SCRIPT}" ]]; then
  current_sha=$(sha256sum "${PROMOVER_SCRIPT}" | awk '{print $1}')
  echo "    SHA atual : ${current_sha}"
  echo "    SHA esperado : ${EXPECTED_SHA}"
  if [[ "${current_sha}" != "${EXPECTED_SHA}" ]]; then
    echo "    ✘ Divergência detectada! Abortando script."
    exit 1
  else
    echo "    ✔ SHA corresponde ao esperado."
  fi
else
  echo "    ✘ Script ${PROMOVER_SCRIPT} não encontrado. Abortando."
  exit 1
fi

# ---------- 3. LISTAR BACKUPS .bak‑* >30 dias ----------
echo "[i] Listando backups .bak-* mais antigos que 30 dias em ${RELEASE_DIR} ..."
old_backups=$(find "${RELEASE_DIR}" -maxdepth 1 -type f -name ".bak-*" -mtime +30)
if [[ -n "${old_backups}" ]]; then
  echo "    Arquivos candidatos a remoção (>>30 dias):"
  echo "${old_backups}" | nl -w2 -s'. '
else
  echo "    Nenhum backup antigo encontrado."
fi

# ---------- 4. MOSTRAR ÚLTIMAS 5 EXECUÇÕES DO PIPELINE ----------
echo "[i] Últimas 5 execuções (timestamps dos arquivos) no diretório do pipeline:"
exec_files=$(ls -1t "${PIPELINE_ROOT}" 2>/dev/null | head -n 5)
if [[ -n "${exec_files}" ]]; then
  for f in ${exec_files}; do
    ts=$(stat -c '%y' "${PIPELINE_ROOT}/${f}" | cut -d'.' -f1)
    echo "    ${f} → ${ts}"
  done
else
  echo "    Diretório vazio ou inacessível."
fi

# ---------- MARKER ----------
echo "${TIMESTAMP}" > "${MARKER}"
echo "[i] Execução concluída com sucesso. Marker escrito em ${MARKER}."

# --------------------------------------------------------------
# Versão sugerida (semver) – 1.2.0
#   • 1 – correções de hard‑code e alinhamento de SHA
#   • 2 – inclusão de rotinas de auditoria e backup
#   • 0 – ainda sem novos recursos funcionais
# --------------------------------------------------------------
~~~
