// ATUALIZADO: 2026-07-01 19:18:35 -03:00 (auto, git pre-commit)
// ATUALIZADO: 2026-07-01 (CTXKBCURATOR01)
import fs from 'node:fs';
import path from 'node:path';

const KB_LICOES = '/app/knowledge/licoes';
// CTXKBCURATOR01: fila de lessoes propostas, aguardando revisao humana em
// lote (semanal). Antes, promoteFromRun() gravava DIRETO em KB_LICOES --
// qualquer licao mal formulada (ou Guardian enganado pela regex de
// aprovacao) entrava imediatamente na base que alimenta TODO agente
// futuro, sem ninguem olhar. Agora e sempre: propor -> fila -> humano
// decide -> so entao vira licao de verdade.
const KB_PENDING = '/app/knowledge/_pending';
const AUDIT = '/app/knowledge/_audit/promocoes.jsonl';

function parseLProp(text){
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
  const ok = /\b(APROVA|APROVADO|READY|OK|\u2713)\b/.test(t);
  const block = /\b(REJEITA|REJEITADO|BLOQUEIA|BLOQUEADO|NEGA|NEGADO|N\u00c3O\s+APROVA)\b/.test(t);
  return ok && !block;
}

function logAudit(entry){
  fs.mkdirSync(path.dirname(AUDIT), { recursive:true });
  fs.appendFileSync(AUDIT, JSON.stringify({ ts:Date.now(), ...entry })+'\n');
}

// CTXKBCURATOR01: agora enfileira em KB_PENDING, nunca escreve em
// KB_LICOES diretamente. Guardian continua sendo o pre-filtro (so
// propostas que ele aprovou chegam a fila), mas a decisao final e
// sempre humana.
export function promoteFromRun(events=[]){
  const mem = events.find(e => (e.agent||'').toLowerCase() === 'memorialista');
  const grd = events.find(e => (e.agent||'').toLowerCase() === 'guardian');
  if (!mem) return { skipped:'no-memorialista' };
  if (!grd) return { skipped:'no-guardian-event' };
  if (!guardianApproved(grd.output||'')) return { skipped:'guardian-nao-aprovou', guardian_output: (grd.output||'').slice(0,200) };

  const props = parseLProp(mem.output||'');
  if (!props.length) return { skipped:'no-L-PROP-in-memorialista' };

  fs.mkdirSync(KB_PENDING, { recursive:true });

  const queued = [];
  for (const p of props) {
    const fname = `${p.id}.md`;
    const pendingPath = path.join(KB_PENDING, fname);
    const livePath = path.join(KB_LICOES, fname);
    if (fs.existsSync(livePath)) { queued.push({ id:p.id, fname, skipped:'ja-existe-na-kb' }); continue; }
    if (fs.existsSync(pendingPath)) { queued.push({ id:p.id, fname, skipped:'ja-na-fila' }); continue; }
    const md = `# ${p.id}\n\n_Proposta por Memorialista, pre-aprovada por Guardian em ${new Date().toISOString()}. Aguardando revisao humana._\n\n${p.body}\n`;
    fs.writeFileSync(pendingPath, md);
    queued.push({ id:p.id, fname });
    logAudit({ id:p.id, fname, event:'queued', by:'guardian' });
  }
  return { queued };
}

// Lista tudo que esta esperando revisao -- usado pelo review semanal.
export function listPending(){
  fs.mkdirSync(KB_PENDING, { recursive:true });
  return fs.readdirSync(KB_PENDING)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const full = path.join(KB_PENDING, f);
      const body = fs.readFileSync(full, 'utf8');
      const stat = fs.statSync(full);
      return { id: f.replace(/\.md$/,''), fname: f, preview: body.slice(0, 500), proposed_at: stat.mtimeMs };
    })
    .sort((a,b) => a.proposed_at - b.proposed_at);
}

// Aprova em lote: move da fila pra KB de verdade.
export function approvePending(ids=[]){
  const done = [];
  for (const id of ids) {
    const fname = `${id}.md`;
    const from = path.join(KB_PENDING, fname);
    const to = path.join(KB_LICOES, fname);
    if (!fs.existsSync(from)) { done.push({ id, skipped:'nao-esta-na-fila' }); continue; }
    fs.mkdirSync(KB_LICOES, { recursive:true });
    const body = fs.readFileSync(from, 'utf8').replace(
      '_Proposta por Memorialista, pre-aprovada por Guardian',
      `_Aprovada por humano em ${new Date().toISOString()}. Originalmente proposta por Memorialista, pre-aprovada por Guardian`
    );
    fs.writeFileSync(to, body);
    fs.unlinkSync(from);
    done.push({ id, fname });
    logAudit({ id, fname, event:'approved', by:'human' });
  }
  return { approved: done };
}

// Rejeita em lote: remove da fila, guarda motivo no audit (nunca vira licao).
export function rejectPending(ids=[], reason=''){
  const done = [];
  for (const id of ids) {
    const fname = `${id}.md`;
    const from = path.join(KB_PENDING, fname);
    if (!fs.existsSync(from)) { done.push({ id, skipped:'nao-esta-na-fila' }); continue; }
    fs.unlinkSync(from);
    done.push({ id, fname });
    logAudit({ id, fname, event:'rejected', by:'human', reason: String(reason||'').slice(0,300) });
  }
  return { rejected: done };
}
