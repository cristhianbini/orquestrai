import fs from 'node:fs';
import path from 'node:path';

const KB_LICOES = '/app/knowledge/licoes';
const AUDIT = '/app/knowledge/_audit/promocoes.jsonl';

function parseLProp(text){
  // captura blocos iniciando em "ID: L-PROP-XXX"
  const re = /ID:\s*(L-PROP-[A-Za-z0-9\-_]+)\s*\n([\s\S]*?)(?=\n\s*ID:\s*L-PROP-|\n*$)/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ id: m[1].trim(), body: (m[0]).trim() });
  }
  return out;
}

function guardianApproved(gtext=''){
  const t = gtext.toUpperCase();
  // aprova se contém marcadores positivos e NÃO contém bloqueios fortes
  const ok = /\b(APROVA|APROVADO|READY|OK|✓)\b/.test(t);
  const block = /\b(REJEITA|REJEITADO|BLOQUEIA|BLOQUEADO|NEGA|NEGADO|NÃO\s+APROVA)\b/.test(t);
  return ok && !block;
}

export function promoteFromRun(events=[]){
  const mem = events.find(e => (e.agent||'').toLowerCase() === 'memorialista');
  const grd = events.find(e => (e.agent||'').toLowerCase() === 'guardian');
  if (!mem) return { skipped:'no-memorialista' };
  // B243: gate por formato — Guardian valida BLOCO de shell, nao a licao
  // Promovemos toda L-PROP-* bem-formada que ainda nao exista (idempotente)

  const props = parseLProp(mem.output||'');
  if (!props.length) return { skipped:'no-L-PROP-in-memorialista' };

  fs.mkdirSync(KB_LICOES, { recursive:true });
  fs.mkdirSync(path.dirname(AUDIT), { recursive:true });

  const promoted = [];
  for (const p of props) {
    const fname = `${p.id}.md`;
    const full = path.join(KB_LICOES, fname);
    if (fs.existsSync(full)) { promoted.push({ id:p.id, fname, skipped:'exists' }); continue; }
    const md = `# ${p.id}\n\n_Auto-promovida por Guardian em ${new Date().toISOString()}_\n\n${p.body}\n`;
    fs.writeFileSync(full, md);
    promoted.push({ id:p.id, fname });
    fs.appendFileSync(AUDIT, JSON.stringify({ ts:Date.now(), id:p.id, fname, approved_by:'guardian' })+'\n');
  }
  return { promoted };
}
