// OQ-71j parser bash/sh
// laveRoutes.cjs - OQ-70
// KB LAVE: .md persistente em data/lave/ (e exposto as IAs via data/knowledge/lave/)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LAVE_DIR = process.env.LAVE_DIR || '/var/www/orquestrai/data/lave';
try { fs.mkdirSync(LAVE_DIR, { recursive: true }); } catch(e) {}

// SSE subscribers
const subs = new Set();
function broadcast(ev, payload){
  const data = 'event: '+ev+'\ndata: '+JSON.stringify(payload)+'\n\n';
  for(const r of subs){ try{ r.write(data); }catch(_){ subs.delete(r); } }
}

function slug(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60) || 'bloco'; }
function sha(s){ return crypto.createHash('sha256').update(String(s||'')).digest('hex'); }
function nowIso(){ return new Date().toISOString(); }
function nextId(){
  const ids = fs.readdirSync(LAVE_DIR).filter(f=>/^IA-\d+__/.test(f)).map(f=>parseInt(f.match(/^IA-(\d+)/)[1],10));
  const n = ids.length ? Math.max(...ids)+1 : 1;
  return 'IA-'+String(n).padStart(4,'0');
}

// Parser de fences ```lave\n[# titulo]\n<script>\n```
// Aceita tambem ```bash quando precedido por linha 'LAVE:' no proximo PR; por ora so ```lave.
function parseLaveFences(text){
  const out = [];
  if(!text || typeof text !== 'string') return out;
  const re = /```(?:lave|bash|sh)\s*\n([\s\S]*?)```/g;
  let m;
  while((m = re.exec(text)) !== null){
    const body = m[1].replace(/\s+$/,'');
    if(!body.trim()) continue;
    const lines = body.split('\n');
    let titulo = '';
    if(/^\s*#\s+/.test(lines[0])){ titulo = lines.shift().replace(/^\s*#\s+/, '').trim(); }
    out.push({ titulo: titulo || 'Bloco da IA', script: lines.join('\n') });
  }
  return out;
}

function writeBlocoMd({ id, titulo, script, modo, tags, origem }){
  const created = nowIso();
  const hash = sha(script);
  const fm = [
    '---',
    'id: '+id,
    'titulo: '+JSON.stringify(titulo||'(sem titulo)'),
    'status: pendente',
    'modo: '+(modo||'read-only'),
    'tags: ['+(Array.isArray(tags)?tags.map(t=>JSON.stringify(String(t))).join(', '):'')+']',
    'origem: '+(origem||'ia'),
    'created: '+created,
    'updated: '+created,
    'hash: '+hash,
    'execucoes: []',
    '---',
    '',
    '# '+(titulo||id),
    '',
    '```bash',
    script,
    '```',
    ''
  ].join('\n');
  const file = path.join(LAVE_DIR, id+'__'+slug(titulo)+'.md');
  fs.writeFileSync(file, fm);
  return { id, file, titulo, status:'pendente', modo:modo||'read-only', tags:tags||[], origem:origem||'ia', created, updated:created, hash, script };
}

function readBlocoMd(file){
  try{
    const raw = fs.readFileSync(file,'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    const meta = {};
    if(fm){
      for(const ln of fm[1].split('\n')){
        const mm = ln.match(/^(\w+):\s*(.*)$/);
        if(mm) meta[mm[1]] = mm[2];
      }
    }
    let titulo = meta.titulo||'';
    try{ if(titulo.startsWith('"')) titulo = JSON.parse(titulo); }catch(_){}
    const scriptM = raw.match(/```bash\n([\s\S]*?)```/);
    return {
      id: meta.id||path.basename(file).split('__')[0],
      titulo,
      status: meta.status||'pendente',
      modo: meta.modo||'read-only',
      origem: meta.origem||'?',
      created: meta.created||'',
      updated: meta.updated||'',
      hash: meta.hash||'',
      script: scriptM?scriptM[1].replace(/\s+$/,''):'',
      file
    };
  }catch(e){ return null; }
}

function listBlocos(status){
  const files = fs.readdirSync(LAVE_DIR).filter(f=>f.endsWith('.md') && !f.startsWith('_'));
  const items = files.map(f=>readBlocoMd(path.join(LAVE_DIR,f))).filter(Boolean);
  items.sort((a,b)=> (b.created||'').localeCompare(a.created||''));
  if(status && status!=='todos') return items.filter(x=>x.status===status);
  return items;
}

function patchBloco(id, patch){
  const files = fs.readdirSync(LAVE_DIR).filter(f=>f.startsWith(id+'__'));
  if(!files.length) return null;
  const file = path.join(LAVE_DIR, files[0]);
  const raw = fs.readFileSync(file,'utf8');
  let body = raw;
  const updated = nowIso();
  if(patch.status){ body = body.replace(/(\nstatus:\s*)[^\n]+/, '$1'+patch.status); }
  body = body.replace(/(\nupdated:\s*)[^\n]+/, '$1'+updated);
  if(patch.execucao){
    const ex = patch.execucao;
    const linha = '  - ts: '+(ex.ts||updated)+'\n    exit: '+(ex.exit||0)+'\n    sha256: '+(ex.sha256||'')+'\n    resumo: '+JSON.stringify(ex.resumo||'');
    body = body.replace(/\nexecucoes:\s*\[\]/, '\nexecucoes:\n'+linha);
    if(!/\nexecucoes:\s*\n/.test(body)){
      // ja tinha entries: append antes do --- final do frontmatter
      body = body.replace(/(\nexecucoes:\s*\n(?:[ \t].*\n)*)/, '$1'+linha+'\n');
    }
  }
  fs.writeFileSync(file, body);
  const item = readBlocoMd(file);
  broadcast('bloco-updated', item);
  return item;
}

// Hook usado pelo /api/chat
function parseAndPersistFromIA(text, user){
  const fences = parseLaveFences(text);
  const created = [];
  for(const f of fences){
    const id = nextId();
    const item = writeBlocoMd({ id, titulo:f.titulo, script:f.script, modo:'read-only', tags:['ia'], origem: (user&&user.email)||'ia' });
    broadcast('bloco-novo', item);
    created.push(item);
  }
  return created;
}

function mount(app, auth){
  const _a = typeof auth==='function' ? auth : (req,res,next)=>next();

  app.get('/api/lave/blocos', _a, (req,res)=>{
    try{ res.json({ items: listBlocos(req.query.status) }); }
    catch(e){ res.status(500).json({ error: e.message }); }
  });

  app.post('/api/lave/blocos', _a, (req,res)=>{
    try{
      const { titulo, script, modo, tags, origem } = req.body||{};
      if(!script || !String(script).trim()) return res.status(400).json({ error:'script obrigatorio' });
      const id = nextId();
      const item = writeBlocoMd({ id, titulo, script:String(script), modo, tags, origem: origem||((req.user&&req.user.email)||'manual') });
      broadcast('bloco-novo', item);
      res.json(item);
    }catch(e){ res.status(500).json({ error: e.message }); }
  });

  app.patch('/api/lave/blocos/:id', _a, (req,res)=>{
    try{
      const item = patchBloco(req.params.id, req.body||{});
      if(!item) return res.status(404).json({ error:'nao encontrado' });
      res.json(item);
    }catch(e){ res.status(500).json({ error: e.message }); }
  });

  app.get('/api/lave/stream', (req,res)=>{
    res.set({ 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache', 'Connection':'keep-alive', 'X-Accel-Buffering':'no' });
    res.flushHeaders && res.flushHeaders();
    res.write('event: hello\ndata: {"ok":true}\n\n');
    subs.add(res);
    const ka = setInterval(()=>{ try{ res.write(': ka\n\n'); }catch(_){} }, 25000);
    req.on('close', ()=>{ clearInterval(ka); subs.delete(res); });
  });
  // OQ-B147-LAVE-STATUS: stub para polling do cockpit
  app.get('/api/lave/status', (req,res)=>{
    try {
      const files = fs.readdirSync(LAVE_DIR).filter(f=>f.endsWith('.md'));
      res.json({ state: 'idle', total: files.length, last: files.slice(-1)[0] || null, ts: nowIso() });
    } catch(e) {
      res.json({ state: 'idle', total: 0, last: null, ts: new Date().toISOString() });
    }
  });


  console.log('[OQ70] /api/lave/* montado. LAVE_DIR='+LAVE_DIR);
}

module.exports = mount;
module.exports.parseAndPersistFromIA = parseAndPersistFromIA;
module.exports.parseLaveFences = parseLaveFences;
