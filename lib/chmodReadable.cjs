// ATUALIZADO: 2026-07-24 00:48:34 -03:00 (auto, git pre-commit)
'use strict';
// [CTXCHMODSHARE01] modulo compartilhado: torna uma arvore de arquivos legivel
// pelo nginx do container static (uid 101). Extraido de api/projectsRoutes.cjs
// (Gap 2) para ser reaproveitado pelo project-supervisor no build->estatico
// (Gap 3) — o build gera dist/ com dono do processo de build, mesma classe de
// bug de permissao que o clone 640 do projrunner.
//
// Comportamento IDENTICO ao original: OR-in dos bits de leitura/travessia
// (dirs |= r-x a todos; files |= r a todos), sem tocar nos bits de escrita nem
// tornar arquivos executaveis. .git e' pulado de proposito (fica sem os bits de
// "outros" -> nginx devolve 403 em /.git/). Best-effort: erro num item nao
// aborta a arvore. NAO segue symlink.
const fs = require('fs');
const path = require('path');

function chmodReadable(root){
  const walk = (p) => {
    let st; try { st = fs.lstatSync(p); } catch(_) { return; }
    if (st.isSymbolicLink()) return;                 // nao segue symlink
    if (st.isDirectory()) {
      try { fs.chmodSync(p, st.mode | 0o555); } catch(_) {}
      let ents = []; try { ents = fs.readdirSync(p); } catch(_) {}
      for (const e of ents) { if (e === '.git') continue; walk(path.join(p, e)); }
    } else if (st.isFile()) {
      try { fs.chmodSync(p, st.mode | 0o444); } catch(_) {}
    }
  };
  walk(root);
}

module.exports = { chmodReadable };
