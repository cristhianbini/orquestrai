---
name: deploy-island
description: Buildar e publicar uma ilha React (frontend-vite) para src/island/ com verificação de hash. Use ao editar qualquer coisa em frontend-vite/src/ que precise aparecer no dashboard.
---

# deploy-island

Compila a ilha React e faz o deploy verificado para `src/island/`. NUNCA copiar
`dist-island/` manualmente — o script confere sha256 e aborta se divergir.

## Passos
1. Confirme que editou a FONTE (`frontend-vite/src/`), nunca `src/island/` (é artefato).
2. Rode o build+deploy:
   ```bash
   cd /var/www/orquestrai && bash scripts/build-island.sh
   ```
3. O script builda via `vite.island.config.js` e copia para `src/island/` verificando hash.
   Se ele abortar por divergência de hash, NÃO force — investigue o build.
4. `src/` é bind-mount ao vivo — a mudança já está em produção. Valide no browser com
   Ctrl+Shift+R (cache agressivo).

## Regras (lições)
- Build sozinho (`npm run build`) NÃO afeta produção — só o deploy do script publica (L-VITE03).
- Cada ilha migrada deve remover o legado equivalente no dashboard.html (ARCHITECTURE.md princípio 4).
- Ver `frontend-vite/ARCHITECTURE.md` e `frontend-vite/CLAUDE.md`.
