// ATUALIZADO: 2026-07-08 22:32:02 -03:00 (auto, git pre-commit)
// B259 — lista lições da KB para o chip do header
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const KB_DIR = '/app/knowledge/licoes';

router.get('/list', (req, res) => {
  try {
    if (!fs.existsSync(KB_DIR)) return res.json({ count: 0, items: [] });
    const files = fs.readdirSync(KB_DIR)
      .filter(f => f.endsWith('.md')).filter(f => !f.startsWith('BLOCO-')) /* CTXLICCLEAN01 (2026-07-09): BLOCO-* e' LOG de execucao (mora em knowledge/blocos + espelhado aqui pelo autosync), NAO e' licao -- 20 de 100 itens poluiam a lista. Licao = L-*.md com Regra pratica. Blocos tem card proprio na UI. */
      .sort();
    const items = files.map(f => {
      const full = path.join(KB_DIR, f);
      const st = fs.statSync(full);
      const id = f.replace(/\.md$/, '');
      let title = id;
      try {
        const first = fs.readFileSync(full, 'utf8').split('\n').slice(0, 20);
        const t = first.find(l => /^TITULO:/i.test(l) || /^#\s+/.test(l));
        if (t) title = t.replace(/^TITULO:\s*/i, '').replace(/^#\s+/, '').trim();
      } catch(_) {}
      return { id, title, mtime: st.mtimeMs };
    }).sort((a,b) => b.mtime - a.mtime);
    res.json({ count: items.length, items });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

module.exports = router;
