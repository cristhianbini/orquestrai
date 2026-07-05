// ATUALIZADO: 2026-07-05 04:02:02 -03:00 (auto, git pre-commit)
// mas/kb.cjs -- CTXKBSHARE01 (2026-07-05)
// Modulo compartilhado entre mas/agents.mjs (MAS, 9 agentes) e
// api/providers.cjs (chat individual). Antes, cada caminho tinha sua
// propria copia (ou nenhuma) de contexto de stack + absorcao de licoes --
// chat individual nunca teve acesso a nenhum dos dois.
const fs = require('fs');
const path = require('path');

const KB_ROOT = process.env.KB_ROOT || '/app/knowledge';

const STACK_CTX = `
CONTEXTO OBRIGATORIO -- OrquestrAI roda numa VPS Ubuntu 24.04 (host cbini), producao em orquestrai.cbini.com.br.
- Stack: Node.js/Express (API) + nginx (proxy) + Docker Compose (orquestrai-api, orquestrai-proxy, orquestrai-web) + oqterm (PTY host root, systemd, FORA do Docker, porta 7654).
- NAO E Next.js, NAO E MySQL/Sequelize, NAO E PM2. Nao invente esses caminhos.
- Persistencia: SQLite (better-sqlite3) -- blackboard.db (eventos MAS) e cluster.db (execucoes), em /var/www/orquestrai/data/.
- src/ e bind-mount direto no container web -- edicoes ficam ao vivo sem build/restart.
- Comandos READ-ONLY tipicos: ls, stat, sha256sum, diff, grep -rn, find -mtime, cat, wc -l, sqlite3 ... 'SELECT ...', docker ps, systemctl status.
PROIBIDO em BLOCO: rm, mv, > (redirect criando arquivo fora /tmp), git push/commit, npm install, systemctl restart, kill, docker stop/rm/restart.
TODA variavel usada em bash DEVE estar definida no proprio bloco.
`;

function loadManifesto(){
  try { return fs.readFileSync('/app/knowledge/_manifesto/MISSAO.md', 'utf8'); }
  catch { return ''; }
}

function loadKB(meta){
  try{
    const idxPath = path.join(KB_ROOT, 'INDEX.md');
    const idx = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, 'utf8').slice(0, 2500) : '';
    const kws = (meta || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const licDir = path.join(KB_ROOT, 'licoes');
    const lic = fs.readdirSync(licDir).filter(f => f.endsWith('.md'));
    const scored = lic.map(f => {
      const t = fs.readFileSync(path.join(licDir, f), 'utf8').toLowerCase();
      return {
        f,
        score: kws.reduce((a, k) => a + (t.includes(k) ? 1 : 0), 0),
        body: fs.readFileSync(path.join(licDir, f), 'utf8').slice(0, 400),
      };
    }).sort((a, b) => b.score - a.score).slice(0, 5).filter(x => x.score > 0);
    const top = scored.map(x => `### ${x.f}\n${x.body}`).join('\n\n');
    return `\n\n--- KB INDEX (resumo) ---\n${idx}\n\n--- LICOES RELEVANTES ---\n${top || '(nenhuma match)'}`;
  } catch (e) { return ''; }
}

module.exports = { loadKB, loadManifesto, STACK_CTX, KB_ROOT };
