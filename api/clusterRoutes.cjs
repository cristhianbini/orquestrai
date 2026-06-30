// OQ48A-v1 — cluster IA com lição-first
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const KB = '/var/www/orquestrai/knowledge';
const DB_PATH = '/var/www/orquestrai/data/cluster.db';
function db(){ return new Database(DB_PATH); }

// RAG simples: busca substring case-insensitive nas categorias-chave
function consultarKB(textoMeta, limite=10){
  const cats = ['licoes','decisoes','incidentes','metas','rfcs'];
  const termos = String(textoMeta).toLowerCase().split(/\s+/).filter(t=>t.length>=4).slice(0,12);
  const out = [];
  for(const cat of cats){
    const dir = path.join(KB, cat);
    if(!fs.existsSync(dir)) continue;
    function walk(d){
      for(const f of fs.readdirSync(d)){
        const p = path.join(d,f); const st = fs.statSync(p);
        if(st.isDirectory()) walk(p);
        else if(f.endsWith('.md')){
          const txt = fs.readFileSync(p,'utf8').toLowerCase();
          let score = 0; for(const t of termos){ if(txt.includes(t)) score++; }
          if(score>0){
            const idx = Math.max(0, txt.indexOf(termos.find(t=>txt.includes(t))||'')-100);
            out.push({ cat, arquivo: p.replace(KB+'/',''), score, trecho: fs.readFileSync(p,'utf8').slice(idx, idx+400) });
          }
        }
      }
    }
    walk(dir);
  }
  return out.sort((a,b)=>b.score-a.score).slice(0,limite);
}

function ctxLicoes(consultas){
  if(!consultas.length) return '(sem licoes previas relevantes)';
  return consultas.map((c,i)=>`### [${i+1}] ${c.arquivo} (score ${c.score})\n${c.trecho.trim()}`).join('\n\n');
}

module.exports = function(app, requireAuth){
  // POST /api/cluster/meta — cria meta, consulta KB, salva contexto
  app.post('/api/cluster/meta', requireAuth, (req,res)=>{
    try{
      const { texto, ambiente='teste', criterio_aceite='' } = req.body||{};
      if(!texto) return res.status(400).json({error:'texto obrigatorio'});
      const id = 'm_' + crypto.randomBytes(6).toString('hex');
      const now = Date.now();
      const d = db();
      d.prepare('INSERT INTO metas(id,texto,ambiente,status,criterio_aceite,criada_em) VALUES(?,?,?,?,?,?)').run(id,texto,ambiente,'aberta',criterio_aceite,now);
      // RAG obrigatorio antes de qualquer agente
      const consultas = consultarKB(texto);
      const insRag = d.prepare('INSERT INTO rag_consultas(meta_id,iter_n,fonte,arquivo,score,trecho,criada_em) VALUES(?,?,?,?,?,?,?)');
      for(const c of consultas) insRag.run(id,0,c.cat,c.arquivo,c.score,c.trecho,now);
      // persiste meta.md com contexto das licoes ja embutido
      const dir = path.join(KB,'metas',id); fs.mkdirSync(dir,{recursive:true});
      fs.writeFileSync(path.join(dir,'meta.md'),
        `# Meta ${id}\n\n**Ambiente:** ${ambiente}\n**Status:** aberta\n**Criada:** ${new Date(now).toISOString()}\n\n## Descricao\n${texto}\n\n## Criterio de aceite\n${criterio_aceite||'(nao definido)'}\n\n## Licoes consultadas (RAG)\n${ctxLicoes(consultas)}\n`
      );
      d.close();
      res.json({ok:true, id, ambiente, status:'aberta', rag_count: consultas.length, consultas: consultas.map(c=>({arquivo:c.arquivo,score:c.score})) });
    }catch(e){ res.status(500).json({error:e.message}); }
  });

  // GET /api/cluster/meta/:id
  app.get('/api/cluster/meta/:id', requireAuth, (req,res)=>{
    try{
      const d = db();
      const meta = d.prepare('SELECT * FROM metas WHERE id=?').get(req.params.id);
      if(!meta){ d.close(); return res.status(404).json({error:'meta nao encontrada'}); }
      const iters = d.prepare('SELECT * FROM iteracoes WHERE meta_id=? ORDER BY n,id').all(req.params.id);
      const rag = d.prepare('SELECT * FROM rag_consultas WHERE meta_id=? ORDER BY iter_n,score DESC').all(req.params.id);
      d.close();
      res.json({ok:true, meta, iteracoes: iters, rag_consultas: rag });
    }catch(e){ res.status(500).json({error:e.message}); }
  });

  // GET /api/cluster/metas — lista
  app.get('/api/cluster/metas', requireAuth, (req,res)=>{
    try{ const d=db(); const r=d.prepare('SELECT id,texto,ambiente,status,criada_em,fechada_em FROM metas ORDER BY criada_em DESC LIMIT 50').all(); d.close(); res.json({ok:true,items:r}); }
    catch(e){ res.status(500).json({error:e.message}); }
  });

  // POST /api/cluster/meta/:id/iterar — stub: registra 1 iter consultando KB de novo
  app.post('/api/cluster/meta/:id/iterar', requireAuth, (req,res)=>{
    try{
      const id = req.params.id; const d = db();
      const meta = d.prepare('SELECT * FROM metas WHERE id=?').get(id);
      if(!meta){ d.close(); return res.status(404).json({error:'meta nao encontrada'}); }
      const lastN = d.prepare('SELECT COALESCE(MAX(n),0) AS n FROM iteracoes WHERE meta_id=?').get(id).n;
      const n = lastN + 1;
      const consultas = consultarKB(meta.texto + ' ' + (req.body?.foco||''));
      const now = Date.now();
      const insRag = d.prepare('INSERT INTO rag_consultas(meta_id,iter_n,fonte,arquivo,score,trecho,criada_em) VALUES(?,?,?,?,?,?,?)');
      for(const c of consultas) insRag.run(id,n,c.cat,c.arquivo,c.score,c.trecho,now);
      // stub do agente — proximo bloco (OQ-48c) chama LLM real via providers
      const prompt = `META: ${meta.texto}\n\nLICOES RELEVANTES:\n${ctxLicoes(consultas)}\n\nFOCO DA ITER: ${req.body?.foco||'(livre)'}`;
      const resposta = '(stub) iteracao registrada. OQ-48c liga LLM real.';
      d.prepare('INSERT INTO iteracoes(meta_id,n,agente,provider,modelo,prompt,resposta,tokens_in,tokens_out,custo_usd,status,criada_em) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(id,n,'Bibliotecario','local','rag-v1',prompt,resposta,0,0,0,'ok',now);
      const dir = path.join(KB,'metas',id); fs.mkdirSync(dir,{recursive:true});
      fs.writeFileSync(path.join(dir,`iter-${n}.md`), `# Iter ${n} — ${new Date(now).toISOString()}\n\n## Licoes consultadas\n${ctxLicoes(consultas)}\n\n## Prompt\n\`\`\`\n${prompt}\n\`\`\`\n\n## Resposta\n${resposta}\n`);
      d.close();
      res.json({ok:true, meta_id:id, n, rag_count: consultas.length, resposta});
    }catch(e){ res.status(500).json({error:e.message}); }
  });

  // POST /api/cluster/meta/:id/licao — extrai licao da iter atual pro KB
  app.post('/api/cluster/meta/:id/licao', requireAuth, (req,res)=>{
    try{
      const { titulo, conteudo, tags=[] } = req.body||{};
      if(!titulo||!conteudo) return res.status(400).json({error:'titulo+conteudo obrigatorios'});
      const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,60);
      const fname = `${Date.now()}-${slug}.md`;
      const p = path.join(KB,'licoes',fname); fs.mkdirSync(path.dirname(p),{recursive:true});
      fs.writeFileSync(p, `---\ntitle: ${titulo}\ntags: [${tags.join(', ')}]\nmeta_origem: ${req.params.id}\n---\n\n${conteudo}\n`);
      res.json({ok:true, arquivo: `licoes/${fname}`});
    }catch(e){ res.status(500).json({error:e.message}); }
  });

  console.log('[OQ48A] /api/cluster montado (RAG-first)');

  // OQ50-sse-v3 — timeline ao vivo (dentro do factory, escopo de app+requireAuth+db)
  app.get('/api/cluster/meta/:id/stream', requireAuth, (req, res) => {
    res.set({
      'Content-Type':'text/event-stream',
      'Cache-Control':'no-cache',
      'Connection':'keep-alive',
      'X-Accel-Buffering':'no'
    });
    if (res.flushHeaders) res.flushHeaders();
    const id = req.params.id;
    let lastIter = -1;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      try {
        const d = db();
        const meta = d.prepare('SELECT * FROM metas WHERE id=?').get(id);
        if (!meta) {
          d.close();
          res.write('event: error\ndata: {"error":"meta nao encontrada"}\n\n');
          res.end();
          alive = false;
          return;
        }
        const iters = d.prepare('SELECT id,n,agente,provider,modelo,status,criada_em,substr(resposta,1,300) AS resposta_trecho FROM iteracoes WHERE meta_id=? AND id>? ORDER BY n,id').all(id, lastIter);
        d.close();
        res.write('event: meta\ndata: ' + JSON.stringify(meta) + '\n\n');
        for (const it of iters) {
          res.write('event: iter\ndata: ' + JSON.stringify(it) + '\n\n');
          lastIter = Math.max(lastIter, it.id);
        }
      } catch (e) {
        res.write('event: error\ndata: ' + JSON.stringify({error: e.message}) + '\n\n');
      }
    };
    tick();
    const iv = setInterval(tick, 2000);
    req.on('close', () => { alive = false; clearInterval(iv); });
  });

  console.log('[OQ50] SSE /api/cluster/meta/:id/stream montado');
};
