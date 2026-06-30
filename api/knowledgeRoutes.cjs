// OQ46Y2-v1 knowledge routes — file-based, read-only
const fs=require('fs'),path=require('path');
const ROOT='/var/www/orquestrai/knowledge';
const CATS=['licoes','decisoes','rfcs','agentes','incidentes','contextos','metas','pendencias','blocos','loops','custo','gateways','avaliacoes','audit-logs','contexto-cliente'];
function parseMd(fp){
  let raw='';try{raw=fs.readFileSync(fp,'utf8')}catch(e){return null}
  const meta={};let body=raw;
  const fm=raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if(fm){body=raw.slice(fm[0].length);fm[1].split(/\n/).forEach(l=>{const m=l.match(/^([\w-]+):\s*(.*)$/);if(m)meta[m[1].trim()]=m[2].trim()});}
  let title=meta.title||meta.titulo;
  if(!title){const h=body.match(/^#\s+(.+)$/m);if(h)title=h[1].trim();}
  if(!title)title=path.basename(fp,'.md');
  const excerpt=body.replace(/^#.*$/m,'').replace(/[#*`>\-]/g,'').trim().split(/\n+/).filter(Boolean)[0]||'';
  return{title,meta,excerpt:excerpt.slice(0,140)};
}
module.exports=function(app,requireAuth){
  const mw=requireAuth||((req,res,nx)=>nx());
  app.get('/api/knowledge/_cats',mw,(req,res)=>{const out=CATS.map(c=>{try{return{cat:c,count:fs.readdirSync(path.join(ROOT,c)).filter(f=>f.endsWith('.md')).length}}catch(e){return{cat:c,count:0}}});res.json({ok:true,root:ROOT,cats:out});});
  app.get('/api/knowledge/:cat',mw,(req,res)=>{
    const cat=req.params.cat;if(!CATS.includes(cat))return res.status(404).json({error:'cat invalida',cats:CATS});
    const dir=path.join(ROOT,cat);let files=[];try{files=fs.readdirSync(dir).filter(f=>f.endsWith('.md'))}catch(e){return res.json({ok:true,cat,items:[]})}
    const items=files.map(f=>{const fp=path.join(dir,f);let st;try{st=fs.statSync(fp)}catch(e){return null}const p=parseMd(fp)||{title:f,excerpt:'',meta:{}};const idm=f.match(/^(\d+)/);return{id:idm?'#'+idm[1]:f.replace('.md',''),file:f,title:p.title,excerpt:p.excerpt,tags:(p.meta.tags||'').split(/[,;]/).map(s=>s.trim()).filter(Boolean),size:st.size,mtime:st.mtimeMs};}).filter(Boolean).sort((a,b)=>b.mtime-a.mtime);
    res.json({ok:true,cat,count:items.length,items});
  });
};
