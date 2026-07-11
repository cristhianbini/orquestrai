#!/usr/bin/env bash
# Instalacao do project-supervisor (Fase B). Idempotente. Roda como root.
# NAO expoe o valor de JWT_SECRET (copiado por redirecionamento, nunca impresso).
#
# ATENCAO: cria o usuario projsup e o ADICIONA AO GRUPO docker. Isso e'
# root-equivalente na pratica -- decisao consciente (3o portao root, R1).
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"

echo "[1/6] usuario de sistema projsup (sem shell, sem login) + grupo docker"
if ! id projsup >/dev/null 2>&1; then
  useradd --system --no-create-home --shell /usr/sbin/nologin projsup
  echo "  criado"
else echo "  ja existe"; fi
# grupo docker precisa existir (existe se o Docker foi instalado)
if getent group docker >/dev/null 2>&1; then
  usermod -aG docker projsup
  echo "  projsup adicionado ao grupo docker"
else
  echo "  ERRO: grupo docker inexistente -- Docker instalado?"; exit 1
fi

echo "[2/6] /opt/project-supervisor + server.js"
install -d -o root -g root -m 755 /opt/project-supervisor
install -o root -g root -m 644 "$SRC/server.js" /opt/project-supervisor/server.js

echo "[3/6] (sem staging proprio -- o supervisor nao escreve arquivo no host)"

echo "[4/6] /etc/project-supervisor.env (JWT_SECRET copiada SEM expor valor)"
umask 077
{
  # mesma chave do api/project-runner (copia a linha sem imprimir o valor)
  grep '^JWT_SECRET=' /etc/oqterm.env
  echo 'PS_HOST=172.18.0.1'         # B3: gateway da app-net (igual A2/7655)
  echo 'PS_PORT=7656'
  echo 'PS_PROJECTS_DIR=/var/www/orquestrai/projects'
  echo 'PS_NETWORK=orquestrai_app-net'   # nome REAL da rede (prefixo do compose)
  echo 'PS_MAX_CONTAINERS=3'
} > /etc/project-supervisor.env
chown root:projsup /etc/project-supervisor.env
chmod 640 /etc/project-supervisor.env
echo "  criado (chaves: $(grep -oE '^[A-Z_]+' /etc/project-supervisor.env | tr '\n' ' '))"

echo "[5/6] unit systemd"
install -o root -g root -m 644 "$SRC/project-supervisor.service" /etc/systemd/system/project-supervisor.service
systemctl daemon-reload

echo "[6/6] enable + start"
systemctl enable --now project-supervisor
sleep 1
systemctl is-active project-supervisor && echo "  ATIVO" || { echo "  FALHOU"; journalctl -u project-supervisor -n 20 --no-pager; exit 1; }
echo "OK. healthz:"
curl -s http://127.0.0.1:7656/healthz && echo
