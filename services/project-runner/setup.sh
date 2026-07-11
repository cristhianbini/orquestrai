#!/usr/bin/env bash
# Instalacao do project-runner (Fase A). Idempotente. Roda como root.
# NAO expoe o valor de JWT_SECRET (copiado por redirecionamento, nunca impresso).
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"

echo "[1/6] usuario de sistema projrunner (sem shell, sem login)"
if ! id projrunner >/dev/null 2>&1; then
  useradd --system --no-create-home --shell /usr/sbin/nologin projrunner
  echo "  criado"
else echo "  ja existe"; fi

echo "[2/6] /opt/project-runner + server.js"
install -d -o root -g root -m 755 /opt/project-runner
install -o root -g root -m 644 "$SRC/server.js" /opt/project-runner/server.js

echo "[3/6] staging projects/.staging (dono projrunner, 700)"
install -d -o projrunner -g projrunner -m 700 /var/www/orquestrai/projects/.staging

echo "[4/6] /etc/project-runner.env (JWT_SECRET copiada SEM expor valor)"
umask 077
{
  # copia a linha JWT_SECRET=... de oqterm.env (mesma chave do api) sem imprimir o valor
  grep '^JWT_SECRET=' /etc/oqterm.env
  echo 'PR_HOST=127.0.0.1'
  echo 'PR_PORT=7655'
  echo 'PR_STAGING=/var/www/orquestrai/projects/.staging'
  echo 'PR_MAX_MB=100'
} > /etc/project-runner.env
chown root:projrunner /etc/project-runner.env
chmod 640 /etc/project-runner.env
echo "  criado (chaves: $(grep -oE '^[A-Z_]+' /etc/project-runner.env | tr '\n' ' '))"

echo "[5/6] unit systemd"
install -o root -g root -m 644 "$SRC/project-runner.service" /etc/systemd/system/project-runner.service
systemctl daemon-reload

echo "[6/6] enable + start"
systemctl enable --now project-runner
sleep 1
systemctl is-active project-runner && echo "  ATIVO" || { echo "  FALHOU"; journalctl -u project-runner -n 20 --no-pager; exit 1; }
echo "OK. healthz:"
curl -s http://127.0.0.1:7655/healthz && echo
