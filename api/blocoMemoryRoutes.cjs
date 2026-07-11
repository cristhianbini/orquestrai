// ATUALIZADO: 2026-07-11 06:50:59 -03:00 (auto, git pre-commit)
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
// [AUTHFIX 2026-07-11] require DURO: se a lib faltar, o boot falha em vez
// de degradar para decode sem assinatura (era o buraco do auth antigo).
const jwt = require('jsonwebtoken');
// Mesmo padrao S2 do server.js: sem segredo = fatal. So JWT_SECRET — os
// fallbacks ORQ_JWT_SECRET/SESSION_SECRET nao existem no .env (conferido
// por nome em 2026-07-11) e tokens sao emitidos com JWT_SECRET mesmo.
if (!process.env.JWT_SECRET) {
  console.error('[AUTHFIX] FATAL: JWT_SECRET ausente no ambiente -- /api/memory nao sobe sem auth real.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();
const ROOTS = ['/var/www/orquestrai/data/knowledge','/app/knowledge','/var/www/orquestrai/knowledge'];
const COUNTER = '/var/www/orquestrai/data/bloco_counter.json';
function iso(){ return new Date().toISOString(); }
function stamp(){ const d=new Date(); const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds()); }
function sha(s){ return crypto.createHash('sha256').update(String(s||'')).digest('hex'); }
function ensure(root){ for(const d of ['blocos','contextos','licoes']) fs.mkdirSync(path.join(root,d),{recursive:true}); }
function writableRoots(){ const out=[]; for(const r of ROOTS){ try{ ensure(r); fs.accessSync(r, fs.constants.W_OK); out.push(r); }catch(e){} } return out; }
function writeEach(rel, body){ const files=[]; for(const r of writableRoots()){ try{ const fp=path.join(r,rel); fs.mkdirSync(path.dirname(fp),{recursive:true}); fs.writeFileSync(fp,body,'utf8'); files.push(fp); }catch(e){} } return files; }
function appendEach(rel, body){ for(const r of writableRoots()){ try{ const fp=path.join(r,rel); fs.mkdirSync(path.dirname(fp),{recursive:true}); fs.appendFileSync(fp,body,'utf8'); }catch(e){} } }
function loadCounter(){ try{ return JSON.parse(fs.readFileSync(COUNTER,'utf8')); }catch(e){ return {n:0, byHash:{}}; } }
function saveCounter(c){ try{ fs.writeFileSync(COUNTER, JSON.stringify(c,null,2)); }catch(e){} }
function nextName(h){
  const c = loadCounter(); c.byHash = c.byHash || {};
  if(c.byHash[h]) return { name: c.byHash[h], duplicate: true };
  c.n = (c.n||0) + 1;
  const name = 'BLOCO-' + c.n;
  c.byHash[h] = name;
  saveCounter(c);
  return { name, duplicate: false };
}
function readMdList(cat, limit){ const found=[]; for(const r of ROOTS){ try{ const dir=path.join(r,cat); for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.md'))){ const fp=path.join(dir,f); const st=fs.statSync(fp); const raw=fs.readFileSync(fp,'utf8'); const h=(raw.match(/^#\s+(.+)$/m)||[])[1]||f.replace(/\.md$/,''); found.push({file:f,title:h,mtime:st.mtimeMs,excerpt:raw.replace(/^---[\s\S]*?---/,'').replace(/[#*`>]/g,'').trim().slice(0,180)}); } }catch(e){} } found.sort((a,b)=>b.mtime-a.mtime); return found.slice(0,limit||12); }
// [AUTHFIX 2026-07-11] auth REAL: jwt.verify ou 401. O codigo antigo, em
// caso de assinatura invalida (ou lib/segredo ausentes), caia num "fallback
// decode" que so base64-decodava o payload e chamava next() — ou seja,
// QUALQUER token bem-formado passava. Vetor de contaminacao da KB: esta
// rota escreve .md em knowledge/ (e licoes/ e auto-commitada pelo
// roadmap-autosync). Achado da sessao A2, corrigido antes da Fase B.
function auth(req,res,next){
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  const tok = m ? m[1].trim() : '';
  if(!tok) return res.status(401).json({ok:false,error:'sem token'});
  try{ req.user = jwt.verify(tok, JWT_SECRET); return next(); }
  catch(e){ return res.status(401).json({ok:false,error:'token invalido'}); }
}
router.use(auth);
router.post('/bloco', express.json({limit:'8mb'}), (req,res)=>{
  try{
    const b=req.body||{}; const script=String(b.script||b.raw||'').trim();
    if(!script) return res.status(400).json({ok:false,error:'script vazio'});
    const h=sha(script);
    const { name, duplicate } = nextName(h);
    const titulo=String(b.titulo||b.title||name).replace(/\n/g,' ').slice(0,180);
    if(duplicate) return res.json({ok:true,duplicate:true,name,sha256:h});
    const ts=stamp();
    const blocoMd=['---','tipo: bloco-lave','id: '+name,'title: '+JSON.stringify(titulo),'sha256: '+h,'created: '+iso(),'---','','# '+name+' - '+titulo,'','## Script','~~~bash',script,'~~~',''].join('\n');
    const licaoMd=['---','tipo: licao-automatica','bloco: '+name,'title: '+JSON.stringify('Auto: '+titulo),'sha256: '+h,'created: '+iso(),'---','','# '+name+' - '+titulo,'','## O que ficou aprendido','Bloco LAVE persistido automaticamente para consulta futura.','','## Script completo','~~~bash',script,'~~~',''].join('\n');
    const slug = name + '-' + (titulo.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40) || 'bloco');
    const relB='blocos/'+slug+'-'+ts+'.md';
    const relL='licoes/'+slug+'-'+ts+'.md';
    const files=writeEach(relB,blocoMd).concat(writeEach(relL,licaoMd));
    appendEach('contextos/recentes.md', '- ['+iso()+'] '+name+' - '+titulo+' - sha256 '+h.slice(0,12)+'\n');
    res.json({ok:true,name,sha256:h,files});
  }catch(e){ res.status(500).json({ok:false,error:String(e&&e.message||e)}); }
});
router.get('/recentes', (req,res)=>{ res.json({ok:true, licoes:readMdList('licoes',12), blocos:readMdList('blocos',8)}); });
router.get('/counter', (req,res)=>{ res.json({ok:true, counter:loadCounter()}); });
module.exports = function(app){ app.use('/api/memory', router); console.log('[BLOCO-1] /api/memory montado com auth propria'); };
