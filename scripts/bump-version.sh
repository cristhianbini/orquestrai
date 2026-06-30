#!/usr/bin/env bash
set -e
cd /var/www/orquestrai
TIPO="${1:?uso: bump-version.sh patch|minor|major \"mensagem\"}"
MSG="${2:-sem descricao}"

ATUAL=$(grep -oE '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' knowledge/changelog.md | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
[ -z "$ATUAL" ] && ATUAL="0.0.0"
IFS='.' read -r MAJ MIN PAT <<< "$ATUAL"
case "$TIPO" in
  patch) PAT=$((PAT+1));;
  minor) MIN=$((MIN+1)); PAT=0;;
  major) MAJ=$((MAJ+1)); MIN=0; PAT=0;;
  *) echo "tipo invalido (use patch|minor|major)"; exit 1;;
esac
NOVA="$MAJ.$MIN.$PAT"
DATA=$(date +%Y-%m-%d)

{ echo "## [$NOVA] - $DATA"; echo "### Mudado"; echo "- $MSG"; echo; cat knowledge/changelog.md; } > /tmp/cl.new && mv /tmp/cl.new knowledge/changelog.md

if [ -f package.json ]; then
  python3 -c "import json; p='package.json'; d=json.load(open(p)); d['version']='$NOVA'; json.dump(d, open(p,'w'), indent=2)"
fi

git add -A
git commit -q -m "v$NOVA: $MSG"
git tag -a "v$NOVA" -m "$MSG"
echo "Versao $ATUAL -> $NOVA (commit + tag locais)"
echo "Para publicar: git push && git push --tags"
