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
  # IP do host na bridge app-net (mesmo padrao do oqterm no proxy.conf):
  # o container orquestrai-api alcanca o daemon por aqui. NUNCA 0.0.0.0.
  echo 'PR_HOST=172.18.0.1'
  echo 'PR_PORT=7655'
  echo 'PR_STAGING=/var/www/orquestrai/projects/.staging'
  echo 'PR_MAX_MB=100'
} > /etc/project-runner.env
chown root:projrunner /etc/project-runner.env
chmod 640 /etc/project-runner.env
echo "  criado (chaves: $(grep -oE '^[A-Z_]+' /etc/project-runner.env | tr '\n' ' '))"

echo "[5/7] SSH p/ repos privados: deploy-keys/ + known_hosts fixo + mapping"
# dir das deploy keys (700, projrunner). As CHAVES PRIVADAS em si sao provisionadas
# MANUALMENTE (fora deste script, nunca no git) — aqui so garantimos o diretorio.
install -d -o projrunner -g projrunner -m 700 /etc/project-runner/deploy-keys
# known_hosts FIXO com as chaves OFICIAIS do GitHub (api.github.com/meta; versionado
# em github-known-hosts). NUNCA ssh-keyscan dinamico. Chaves publicas -> reinstalar
# a cada setup e' seguro/idempotente.
install -o root -g root -m 644 "$SRC/github-known-hosts" /etc/project-runner/known_hosts
# mapeamento owner/repo -> caminho da deploy key. Semeado VAZIO se ausente; NAO
# sobrescreve o existente (as entradas reais sao adicionadas fora do git).
if [ ! -f /etc/project-runner/private-repos.json ]; then
  echo '{}' > /etc/project-runner/private-repos.json
  chown root:root /etc/project-runner/private-repos.json
  chmod 644 /etc/project-runner/private-repos.json
  echo "  private-repos.json semeado vazio"
else echo "  private-repos.json ja existe (preservado)"; fi

echo "[6/7] unit systemd"
install -o root -g root -m 644 "$SRC/project-runner.service" /etc/systemd/system/project-runner.service
systemctl daemon-reload

echo "[7/7] enable + start"
systemctl enable --now project-runner
sleep 1
systemctl is-active project-runner && echo "  ATIVO" || { echo "  FALHOU"; journalctl -u project-runner -n 20 --no-pager; exit 1; }
echo "OK. healthz:"
curl -s http://172.18.0.1:7655/healthz && echo
