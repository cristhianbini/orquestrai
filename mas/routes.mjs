// ATUALIZADO: 2026-07-01 18:05:50 -03:00 (auto, git pre-commit)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import express from 'express';
import { runMas, getRun, bus } from './agents.mjs';
import rateLimit from 'express-rate-limit';

// CTXRATELIM02: limites diferenciados por sensibilidade da rota.
// /run dispara pipeline completo (custo real por chamada) -- restritivo.
// Leituras (run/:id, last, models-last, harness-score) sao baratas -- soltas.
// /events/:id (SSE) fica DE FORA -- rate limit quebraria o stream aberto.
const runLimiter = rateLimit({
  windowMs: 60000, max: 5,
  message: { error: 'Limite de runs do MAS atingido. Aguarde um minuto.' },
  standardHeaders: true, legacyHeaders: false,
});
const readLimiter = rateLimit({
  windowMs: 60000, max: 30,
  message: { error: 'Limite de requisicoes atingido.' },
  standardHeaders: true, legacyHeaders: false,
});


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

router.post('/run', runLimiter, express.json(), async (req,res)=>{ // CTXRATELIM02
    try {
      const userText = (req.body && (req.body.prompt || req.body.message || req.body.text || req.body.goal)) || '';
      // CTXROUTE01: respeita mas_mode=true do frontend (usuario ativou MAS explicitamente)
      const masModeExplicit = !!(req.body && req.body.mas_mode);
      if (!masModeExplicit && classifyIntent(userText) === 'chat') {
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

router.get('/run/:id', readLimiter, (req,res)=>{ res.json(getRun(req.params.id)); }); // CTXRATELIM02

router.get('/last', readLimiter, (req,res)=>{ // CTXRATELIM02
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
  // CTXSSE03: heartbeat 15s evita timeout 504 do nginx em runs longas
  const _hb=setInterval(()=>{try{res.write(': keepalive\n\n');}catch(_){}},15000);
  req.on('close',()=>clearInterval(_hb));
  const { events }=getRun(runId);
  for(const ev of events){
    res.write('data: '+JSON.stringify({type:'agent.done',run_id:runId,agent:ev.agent,model:ev.model,tokens_in:ev.tokens_in,tokens_out:ev.tokens_out,latency_ms:ev.latency_ms,cost_usd:ev.cost_usd,text:ev.output,ts:ev.ts})+'\n\n');
  }
  const on=(ev)=>{ try{ res.write('data: '+JSON.stringify(ev)+'\n\n'); if(ev.type==='run.done'||ev.type==='run.error') setTimeout(()=>res.end(),100); }catch(_){}};
  bus.on(runId,on);
  req.on('close',()=>bus.off(runId,on));
});


// B418_MODELS_LAST — último modelo real por agente (lido do SQLite)
router.get('/models-last', readLimiter, (req,res) => { // CTXRATELIM02
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

// ===== CTXHARNESS01_SCORE =====
// Harness Score v1: mede qualidade+custo de um run do MAS.
// Le SO do blackboard.db (mas_run + mas_event) -- decisao 2026-07-01 apos
// confirmar que execucoes.mas_run_id NUNCA e preenchido na pratica (16/16
// execucoes com valor nulo). Fazer join com a tabela execucoes daria
// numero sempre zerado, entao ficou fora ate a ponte existir de verdade.
// Formula: 0.4*exec_success + 0.3*guardian_pass + 0.3*cost_score
// human_approve (w3, botao 👍/👎 do CTXFEEDBACK01) fica de fora por ora --
// falta o item CTXPROVBRIDGE01 (proxima rodada) ligando bloco_n ao run_id
// certo. Campo retornado como null, nao omitido, pra deixar claro que o
// dado existe no sistema mas nao esta conectado ainda.
function computeHarnessScore(runId){
  const D = require('better-sqlite3');
  const d = new D('/app/data/blackboard.db', { readonly: true });

  const run = d.prepare('SELECT * FROM mas_run WHERE id=?').get(runId);
  if (!run) { d.close(); return null; }

  // exec_success: o run terminou sem cair no catch geral do pipeline
  const execSuccess = run.status === 'done' ? 1 : 0;

  // guardian_pass: nenhum veto nesse run. HARD-VETO e regra fixa (regex,
  // roda antes do loop de agentes); REJEITADO/VETO sao vetos via LLM
  // (guardian dentro do loop normal). phase='error' cobre crash do guardian.
  const vetoEvent = d.prepare(
    `SELECT id FROM mas_event WHERE run_id=? AND agent='guardian'
     AND (phase='error' OR output LIKE '%HARD-VETO%' OR output LIKE '%REJEITADO%' OR output LIKE '%VETO%')
     LIMIT 1`
  ).get(runId);
  const guardianPass = vetoEvent ? 0 : 1;

  // cost_score: normalizado contra teto de referencia $0.10/run.
  // Amostra real de producao (antes do REVISOR/Opus) ficou entre
  // $0.02-$0.05. Reavaliar o teto se o custo medio subir muito com o
  // REVISOR (CTXREVISOR01) rodando Opus 4.8 em todo run.
  const COST_CEILING = 0.10;
  const costScore = Math.max(0, 1 - (run.cost_usd || 0) / COST_CEILING);

  const score = 0.4*execSuccess + 0.3*guardianPass + 0.3*costScore;
  d.close();

  return {
    run_id: runId,
    harness_score: Math.round(score * 1000) / 1000,
    signals: {
      exec_success: execSuccess,
      guardian_pass: guardianPass,
      cost_score: Math.round(costScore * 1000) / 1000,
      human_approve: null // pendente CTXPROVBRIDGE01 -- ver nota acima
    },
    cost_usd: run.cost_usd,
    status: run.status
  };
}

// Score de um run especifico
router.get('/harness-score/:id', readLimiter, (req,res) => { // CTXRATELIM02
  const result = computeHarnessScore(req.params.id);
  if (!result) return res.status(404).json({ error: 'run nao encontrado' });
  res.json(result);
});

// Ultimos N runs com score + media -- alimenta o futuro dashboard (CTXVITE02)
router.get('/harness-score', readLimiter, (req,res) => { // CTXRATELIM02
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const D = require('better-sqlite3');
  const d = new D('/app/data/blackboard.db', { readonly: true });
  const runs = d.prepare('SELECT id FROM mas_run ORDER BY started_at DESC LIMIT ?').all(limit);
  d.close();

  const scored = runs.map(r => computeHarnessScore(r.id)).filter(Boolean);
  const avg = scored.length
    ? Math.round((scored.reduce((a,s)=>a+s.harness_score,0)/scored.length) * 1000) / 1000
    : null;
  res.json({ count: scored.length, avg_harness_score: avg, runs: scored });
});

export default router;
