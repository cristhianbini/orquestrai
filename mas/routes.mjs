import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import express from 'express';
import { runMas, getRun, bus } from './agents.mjs';


// ===== B271_INTENT_GATE =====
const AUDIT_TRIGGERS = [
  /\baudit(a|ar|oria)\b/i, /\binvestig(a|ar|ue)\b/i, /\banalis(a|ar|e)\b/i,
  /\bvarredura\b/i, /\bdiagnostic(a|ar|o)\b/i,
  /\brod(a|ar)\s+(mas|mesh|pipeline)\b/i, /\b\/mas\b/i,
  /\bxmonex\b/i, /\borquestrai\b/i, /\bvps\b/i, /\bservidor\b/i,
  /\bdrift\b/i, /\bbloco[- ]?\d+/i, /\bL-[A-Z0-9-]+/,
];
function classifyIntent(text){
  const t = String(text||'').trim();
  if (!t) return 'chat';
  if (/^\/(mas|audita|investiga|mesh|run)\b/i.test(t)) return 'audit';
  if (AUDIT_TRIGGERS.some(function(rx){return rx.test(t)})) return 'audit';
  if (t.length > 120) return 'audit';
  if (t.length < 25) return 'chat';
  return 'chat';
}
async function quickChatReply(text){
  const key = process.env.GROQ_API_KEY;
  if (!key) return { reply: 'Oi! Em que posso ajudar? Para auditar, diga "audita X" ou use /mas X.' };
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Voce e o OrquestrAI, um cockpit de auditoria. Responda curto e amigavel em PT-BR. Se o usuario quiser auditoria real, instrua a usar audita, investiga ou prefixo /mas.' },
          { role: 'user', content: text }
        ],
        max_tokens: 200, temperature: 0.4
      })
    });
    const j = await r.json();
    return { reply: (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) ? j.choices[0].message.content.trim() : 'Oi!' };
  } catch(e){ return { reply: 'Oi! Em que posso ajudar?' }; }
}
// ===== /B271_INTENT_GATE =====

const router=express.Router();

router.post('/run', express.json(), async (req,res)=>{
    try {
      const userText = (req.body && (req.body.prompt || req.body.message || req.body.text || req.body.goal)) || '';
      if (classifyIntent(userText) === 'chat') {
        const reply = (await quickChatReply(userText)).reply;
        return res.json({ ok:true, mode:'chat', reply, agents:[], cost_usd:0, tokens:0 });
      }
    } catch(e){ console.error('[B271_GATE_ERR]', e && e.message); }

  const goal=(req.body&&req.body.goal)||'Auditoria geral rapida';
  try{
    const r=await runMas(goal);
    // [B209] auto-promote: Memorialista propõe → Guardião aprova → vira lição
    try{
      const rid = r.run_id||r.runId||r.id||'';
      console.log('[B246] hook rid=', rid);
      const { promoteFromRun } = await import('./promote-lessons.mjs');
      const D=require('better-sqlite3');
      let evs=[];
      for(let i=0;i<60;i++){
        await new Promise(rs=>setTimeout(rs,2000));
        const db=new D('/app/data/blackboard.db',{readonly:true,fileMustExist:true});
        try{ db.pragma('journal_mode = WAL'); }catch(e){}
        evs=db.prepare("SELECT agent,output FROM mas_event WHERE run_id=? ORDER BY id").all(rid);
        db.close();
        console.log('[B254] try',i+1,'events=',evs.length);
        if(evs.length>=8) break;
      }
      const promo=promoteFromRun(evs);
      if(promo.promoted&&promo.promoted.length) console.log('[B246] promoted:',promo.promoted.map(x=>x.fname).join(','));
      else console.log('[B246] result:', JSON.stringify(promo));
    }catch(e){ console.error('[B246] promote err:',e.message); }
    res.json({ok:true,...r});
  }
  catch(e){ res.status(500).json({ok:false,error:String(e.message||e)}); }
});

router.get('/run/:id',(req,res)=>{ res.json(getRun(req.params.id)); });

router.get('/last',(req,res)=>{
  try{
    const D=require('better-sqlite3');
    const d=new D('/app/data/blackboard.db',{readonly:true});
    const r=d.prepare('select run_id,max(ts) t from mas_event group by run_id order by t desc limit 1').get();
    res.json({run_id:r?r.run_id:null});
  }catch(e){ res.json({run_id:null,err:String(e.message||e)}); }
});

router.get('/events/:id',(req,res)=>{
  const runId=req.params.id;
  res.setHeader('Content-Type','text/event-stream');
  res.setHeader('Cache-Control','no-cache, no-transform');
  res.setHeader('Connection','keep-alive');
  res.setHeader('X-Accel-Buffering','no');
  res.flushHeaders&&res.flushHeaders();
  const { events }=getRun(runId);
  for(const ev of events){
    res.write('data: '+JSON.stringify({type:'agent.done',run_id:runId,agent:ev.agent,model:ev.model,tokens_in:ev.tokens_in,tokens_out:ev.tokens_out,latency_ms:ev.latency_ms,cost_usd:ev.cost_usd,text:ev.output,ts:ev.ts})+'\n\n');
  }
  const on=(ev)=>{ try{ res.write('data: '+JSON.stringify(ev)+'\n\n'); if(ev.type==='run.done'||ev.type==='run.error') setTimeout(()=>res.end(),100); }catch(_){}};
  bus.on(runId,on);
  req.on('close',()=>bus.off(runId,on));
});


// B418_MODELS_LAST — último modelo real por agente (lido do SQLite)
router.get('/models-last', (req,res) => {
  try {
    const Database = require('better-sqlite3');
    const db = new Database('/app/data/blackboard.db', { readonly: true });
    // B444 — também devolve tokens (in+out) do último evento por agente
    const rows = db.prepare(`
      SELECT e.agent, e.model, e.tokens_in, e.tokens_out, e.ts
      FROM mas_event e
      JOIN (SELECT agent, MAX(ts) AS mts FROM mas_event WHERE model IS NOT NULL AND model <> '' GROUP BY agent) m
        ON m.agent = e.agent AND m.mts = e.ts
    `).all();
    db.close();
    const models = {}, tokens = {};
    rows.forEach(r => { models[r.agent] = r.model; tokens[r.agent] = (r.tokens_in||0) + (r.tokens_out||0); });
    res.json({ ok: true, models, tokens, ts: Date.now() });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

export default router;
