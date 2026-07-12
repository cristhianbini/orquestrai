// CTXMASAUTH01 (2026-07-02): auth adicionada em todas as rotas do MAS,
// exceto /events/:id que usa authMiddlewareSSE (SSE nao manda headers).
// Ver mas/auth.mjs para o raciocinio completo.
import { authMiddleware, authMiddlewareSSE } from './auth.mjs';

// ATUALIZADO: 2026-07-12 15:39:22 -03:00 (auto, git pre-commit)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import express from 'express';
import { runMas, getRun, bus, buildProjectPage } from './agents.mjs';
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
// FIX 2026-07-01: 30/min era baixo demais para o polling legado real
// do dashboard.html (findLastRun/fetchOnce/pull/tick chamam /last e
// /models-last com frequencia alta) -- achado ao vivo via console do
// usuario, nao mapeado nos meus testes originais do CTXRATELIM02.
const readLimiter = rateLimit({
  windowMs: 60000, max: 300,
  message: { error: 'Limite de requisicoes atingido.' },
  standardHeaders: true, legacyHeaders: false,
});


// ===== B271_INTENT_GATE =====
const AUDIT_TRIGGERS = [
  /\baudit(a|ar|oria)\b/i, /\binvestig(a|ar|ue)\b/i, /\banalis(a|ar|e)\b/i,
  /\bvarredura\b/i, /\bdiagnostic(a|ar|o)\b/i,
  /\brod(a|ar)\s+(mas|mesh|pipeline)\b/i, /\b\/mas\b/i,
  // CTXROUTER01 (2026-07-08): substantivos REMOVIDOS dos gatilhos (orquestrai/
  // vps/servidor/xmonex). Falar SOBRE o sistema != pedir auditoria DO sistema:
  // 'qual o nome do sistema na VPS?' custava \$0.19 no pipeline (caso Bini,
  // L-nome-sistema-nao-precisa-bloco). VERBOS de acao continuam gatilhos;
  // na duvida = chat (escalar custa 1 prefixo /mas; desperdicar nao volta).
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
          { role: 'system', content: 'Voce e o OrquestrAI (orquestrai.cbini.com.br), cockpit multi-agente de auditoria e desenvolvimento da CBini Solucoes em TI, criado por Cristhian Bini. Roda em VPS Ubuntu com Docker (containers orquestrai-api/web/proxy), pipeline de 9 agentes (BATEDOR AUDITOR DETETIVE ARQUITETO GUARDIAO MEMORIALISTA RELATOR METRICO REVISOR) que gera BLOCOs bash seguros no protocolo LAVE. Responda curto e amigavel em PT-BR usando esse conhecimento. Para auditoria real: audita X, investiga X ou /mas X.' }, // CTXROUTER01-fix3: quickChat agora CONHECE o sistema (antes so instruia comandos)
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

router.post('/run', authMiddleware, runLimiter, express.json(), async (req,res)=>{ // CTXRATELIM02 + CTXMASAUTH01
    try {
      const userText = (req.body && (req.body.prompt || req.body.message || req.body.text || req.body.goal)) || '';
      // CTXROUTER01-fix2 (2026-07-08): classifier era enganado pelo __masCtx colado
      // no goal (1387 chars c/ 'orquestrai' de conversa antiga -> length>120 -> audit
      // sempre). Classifica SO o texto puro do usuario (antes do marcador);
      // o contexto continua indo INTEIRO pro pipeline quando a run acontece.
      const userTextPure = userText.split('[CONTEXTO DO CHAT ANTES DO MAS]')[0].trim();
      // CTXROUTE01: respeita mas_mode=true do frontend (usuario ativou MAS explicitamente)
      const masModeExplicit = !!(req.body && req.body.mas_mode);
      if (!masModeExplicit && classifyIntent(userTextPure) === 'chat') {
        const reply = (await quickChatReply(userTextPure)).reply;
        console.log('[B271] intent=chat len_pure='+userTextPure.length+' len_full='+userText.length); // CTXROUTER01-fix2: log da decisao
        return res.json({ ok:true, mode:'chat', reply, agents:[], cost_usd:0, tokens:0 });
      }
    } catch(e){ console.error('[B271_GATE_ERR]', e && e.message); }

  const goal=(req.body&&req.body.goal)||'Auditoria geral rapida';
  // CTXPROJRUN01: slug opcional vindo do wizard; sanitizado aqui e de novo
  // dentro do runMas (defesa em profundidade).
  const projectSlug=(req.body&&typeof req.body.project_slug==='string'&&/^[a-z0-9-]{1,60}$/.test(req.body.project_slug))?req.body.project_slug:null;
  try{
    const r=await runMas(goal, projectSlug);
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

router.get('/run/:id', authMiddleware, readLimiter, (req,res)=>{ res.json(getRun(req.params.id)); }); // CTXRATELIM02 + CTXMASAUTH01

// R9-CONSTRUIR01 (Fatia B opcao 1, aprovada CBini): /construir <pedido> gera
// UMA pagina nomeada num projeto static-html (buildProjectPage). runLimiter:
// e build pago (Claude direto), mesmo peso de /run. NAO entra no pipeline MAS.
router.post('/construir', authMiddleware, runLimiter, express.json(), async (req,res)=>{
  try{
    const slug = String((req.body&&req.body.slug)||'');
    const pedido = String((req.body&&req.body.pedido)||'').trim();
    if(!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
    if(!pedido) return res.status(400).json({ ok:false, error:'pedido vazio' });
    const r = await buildProjectPage(slug, pedido);
    if(r && r.blocked) return res.status(422).json({ ok:false, error:'conteudo bloqueado pelos vetos de seguranca', vetoes:r.vetoes });
    res.json(r);
  }catch(e){ res.status(500).json({ ok:false, error:String(e.message||e) }); }
});

router.get('/last', authMiddleware, readLimiter, (req,res)=>{ // CTXRATELIM02 + CTXMASAUTH01
  try{
    const D=require('better-sqlite3');
    const d=new D('/app/data/blackboard.db',{readonly:true});
    const r=d.prepare('select run_id,max(ts) t from mas_event group by run_id order by t desc limit 1').get();
    res.json({run_id:r?r.run_id:null});
  }catch(e){ res.json({run_id:null,err:String(e.message||e)}); }
});

router.get('/events/:id', authMiddlewareSSE, (req,res)=>{ // CTXMASAUTH01: auth via ?_t= (EventSource nao manda headers)
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
router.get('/models-last', authMiddleware, readLimiter, (req,res) => { // CTXRATELIM02 + CTXMASAUTH01
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

  // CTXMASRUNLINK01/S2 item 10 (2026-07-07): join real com cluster.db.
  // block_executed = humano executou o bloco desta run pelo terminal
  // (execucoes.mas_run_id, populado desde o F4 do frontend). NAO altera os
  // pesos da formula -- status 'registrado' do oqterm nao captura sucesso/
  // falha do comando (isso e' o CTXAGENTSCORE01 futuro). Sinal exposto p/
  // consumo do dashboard e decisao de produto sobre peso.
  let blockExecuted = 0, execCount = 0;
  try {
    const dc = new D('/app/data/cluster.db', { readonly: true });
    const ex = dc.prepare('SELECT COUNT(*) n FROM execucoes WHERE mas_run_id=?').get(runId);
    execCount = (ex && ex.n) || 0;
    blockExecuted = execCount > 0 ? 1 : 0;
    dc.close();
  } catch(_) { /* cluster.db indisponivel: sinal fica 0, nao derruba o score */ }

  const score = 0.4*execSuccess + 0.3*guardianPass + 0.3*costScore;
  d.close();

  return {
    run_id: runId,
    harness_score: Math.round(score * 1000) / 1000,
    signals: {
      exec_success: execSuccess,
      guardian_pass: guardianPass,
      cost_score: Math.round(costScore * 1000) / 1000,
      block_executed: blockExecuted,        // CTXMASRUNLINK01: bloco executado por humano
      execucoes_count: execCount,           // CTXMASRUNLINK01: qtd de execucoes vinculadas
      human_approve: null // pendente CTXPROVBRIDGE01 -- ver nota acima
    },
    cost_usd: run.cost_usd,
    status: run.status
  };
}

// Score de um run especifico
router.get('/harness-score/:id', authMiddleware, readLimiter, (req,res) => { // CTXRATELIM02 + CTXMASAUTH01
  const result = computeHarnessScore(req.params.id);
  if (!result) return res.status(404).json({ error: 'run nao encontrado' });
  res.json(result);
});

// Ultimos N runs com score + media -- alimenta o futuro dashboard (CTXVITE02)
// CTXAGTDASH01/S8 (2026-07-08): Tabela do Elenco -- 'salario alto exige
// resultado' (Bini). Agrega por agente: custo acumulado (salario), runs,
// tokens, latencia, skips do Q10 (economia = dinheiro que NAO saiu).
// Score por agente entra na Fase 2; a tela ja nasce com a coluna reservada.
router.get('/telemetry', authMiddleware, readLimiter, (req,res) => {
  try{
    const D = require('better-sqlite3');
    const d = new D('/app/data/blackboard.db', { readonly: true }); // padrao do arquivo (L128/L158/L188)
    const rows = d.prepare(`SELECT agent, COUNT(*) runs,
      SUM(tokens_in+tokens_out) tokens, ROUND(SUM(cost_usd),4) custo_total,
      ROUND(AVG(cost_usd),4) custo_medio, ROUND(AVG(latency_ms)) lat_media
      FROM mas_event WHERE phase='done' GROUP BY agent ORDER BY custo_total DESC`).all();
    const skips = d.prepare(`SELECT agent, COUNT(*) n FROM mas_event WHERE phase='skipped' GROUP BY agent`).all();
    const skipMap = {}; skips.forEach(x=>skipMap[x.agent]=x.n);
    // R9-SCORE01: a "Fase 2" chegou — score = done/(done+error) por agente,
    // direto do mas_event (o /api/agents/score do blocosRoutes le execucoes
    // com origem='mas', que tem 0 linhas: a mesa nao executa blocos LAVE).
    const errs = d.prepare(`SELECT agent, COUNT(*) n FROM mas_event WHERE phase='error' GROUP BY agent`).all();
    const errMap = {}; errs.forEach(x=>errMap[x.agent]=x.n);
    rows.forEach(r=>{ r.skips = skipMap[r.agent]||0; r.economia_q10 = Math.round((r.skips * (r.custo_medio||0.1))*100)/100;
      r.falhas = errMap[r.agent]||0;
      r.score = (r.runs + r.falhas) > 0 ? Math.round(100*r.runs/(r.runs+r.falhas)) : null; });
    const tot = rows.reduce((a,r)=>({custo:a.custo+r.custo_total, tokens:a.tokens+r.tokens, economia:a.economia+r.economia_q10}),{custo:0,tokens:0,economia:0});
    res.json({ ok:true, agents: rows, total: { custo_usd: Math.round(tot.custo*100)/100, tokens: tot.tokens, economia_q10_usd: tot.economia } });
  }catch(e){ res.status(500).json({ok:false,error:String(e.message||e)}); }
});

// TELEM01 (2026-07-11): custo/tokens POR PROJETO (ROADMAP #3, sql/mas-002.sql).
// Irma do /telemetry acima (que agrega por agente). project_slug NULL = run
// solta (chat direto/mas.html); o rotulo '(sem-projeto)' e' aplicado AQUI via
// COALESCE — apresentacao, nunca gravado no banco (colisao com slug real).
router.get('/telemetry/projects', authMiddleware, readLimiter, (req,res) => {
  try{
    const D = require('better-sqlite3');
    const d = new D('/app/data/blackboard.db', { readonly: true });
    const rows = d.prepare(`SELECT COALESCE(project_slug,'(sem-projeto)') projeto,
      COUNT(*) runs, SUM(tokens_in) tokens_in, SUM(tokens_out) tokens_out,
      ROUND(SUM(cost_usd),6) custo_usd, MAX(started_at) ultima_run_ts
      FROM mas_run GROUP BY project_slug ORDER BY custo_usd DESC`).all();
    d.close();
    const total = rows.reduce((a,r)=>({ runs:a.runs+r.runs,
      custo_usd:a.custo_usd+(r.custo_usd||0),
      tokens:a.tokens+(r.tokens_in||0)+(r.tokens_out||0) }),
      { runs:0, custo_usd:0, tokens:0 });
    total.custo_usd = Math.round(total.custo_usd*1e6)/1e6;
    res.json({ ok:true, projects: rows, total });
  }catch(e){ res.status(500).json({ok:false,error:String(e.message||e)}); }
});

router.get('/harness-score', authMiddleware, readLimiter, (req,res) => { // CTXRATELIM02 + CTXMASAUTH01
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

// ===========================================================================
// CTXAGENTSCORE01 FASE 1 (2026-07-07) -- AgentScore por (agente x papel).
// On-the-fly (dados ja no SQLite, janela pequena, 1 operador -- persistir so
// se virar gargalo). Formula (META-CTXAGENTSCORE01):
//   0.35 contribuicao + 0.30 qualidade + 0.20 eficiencia + 0.15 convergencia
// FASE 1 usa so sinais que JA existem em mas_event (done/error/vetoed) +
// execucoes (block_executed do S2). Fases 2/3 (humano, reincidencia) depois.
// READ-ONLY: nao grava nada, nao afeta runs.
// ===========================================================================
router.get('/agent-scores', authMiddleware, readLimiter, (req, res) => {
  try {
    const D = require('better-sqlite3');
    const WINDOW = Math.min(parseInt(req.query.window) || 30, 200);
    const d = new D('/app/data/blackboard.db', { readonly: true });
    const runs = d.prepare("SELECT id FROM mas_run ORDER BY started_at DESC LIMIT ?").all(WINDOW).map(r => r.id);
    if (!runs.length) { d.close(); return res.json({ ok: true, window: WINDOW, agents: [] }); }
    const ph = runs.map(() => '?').join(',');
    const rows = d.prepare(
      "SELECT agent, COUNT(*) AS eventos, " +
      "SUM(CASE WHEN phase='done' THEN 1 ELSE 0 END) AS dones, " +
      "SUM(CASE WHEN phase='error' THEN 1 ELSE 0 END) AS erros, " +
      "SUM(CASE WHEN phase='vetoed' THEN 1 ELSE 0 END) AS vetos, " +
      "AVG(NULLIF(cost_usd,0)) AS custo_medio, " +
      "COUNT(DISTINCT run_id) AS runs_participadas " +
      "FROM mas_event WHERE run_id IN (" + ph + ") GROUP BY agent"
    ).all(...runs);
    d.close();

    const dc = new D('/app/data/cluster.db', { readonly: true });
    let runsComExec = 0;
    try {
      const ex = dc.prepare("SELECT COUNT(DISTINCT mas_run_id) n FROM execucoes WHERE mas_run_id IN (" + ph + ")").get(...runs);
      runsComExec = (ex && ex.n) || 0;
    } catch(_) {}
    dc.close();

    // CTXAGENTSCORE01-fix: eficiencia NAO compara custo entre papeis (Opus vs
    // free tier) -- isso puniria o REVISOR por ser Opus (anti-armadilha da META).
    // FASE 1: eficiencia = 1 se o agente concluiu sem retrabalho custoso; o
    // custo bruto vira sinal informativo (exposto), nao penalidade cross-papel.
    // Comparacao de custo POR PAPEL fica pra FASE 3 (PENEIRA, mesmo papel).
    const agents = rows.map(row => {
      const total = (row.dones + row.erros) || 1;
      const qualidade = Math.max(0, (row.dones - row.vetos) / total);
      const convergencia = Math.max(0, 1 - (row.erros / (row.runs_participadas || 1)));
      // eficiencia FASE 1: proxy = tokens/custo nao explodiram (sem retrabalho).
      // Base 1.0, penaliza so se houve erro (retrabalho = desperdicio). Custo
      // absoluto exposto em sinais p/ leitura, mas NAO entra como penalidade
      // cross-papel. Revisao p/ comparacao intra-papel na FASE 3.
      const eficiencia = Math.max(0.5, 1 - (row.erros * 0.1));
      const contribuicao = runs.length ? runsComExec / runs.length : 0;
      const score = 0.35*contribuicao + 0.30*qualidade + 0.20*eficiencia + 0.15*convergencia;
      return {
        agent: row.agent,
        score: Math.round(score * 1000) / 1000,
        dims: {
          contribuicao: Math.round(contribuicao*100)/100,
          qualidade: Math.round(qualidade*100)/100,
          eficiencia: Math.round(eficiencia*100)/100,
          convergencia: Math.round(convergencia*100)/100
        },
        sinais: { runs: row.runs_participadas, dones: row.dones, erros: row.erros, vetos: row.vetos, custo_medio_usd: Math.round((row.custo_medio||0)*100000)/100000 }
      };
    }).sort((a,b) => b.score - a.score);

    const contribImatura = runsComExec < 5;
    res.json({ ok: true, window: WINDOW, formula: '0.35c+0.30q+0.20e+0.15conv',
      nota: 'FASE 1: contribuicao=sinal de time; humano+reincidencia nas fases 2/3',
      aviso: contribImatura ? 'contribuicao imatura: so '+runsComExec+' runs com bloco executado vinculado (mas_run_id novo). Dimensao ganha sinal com o uso.' : null,
      agents });
  } catch(e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
});

// ===== CTXKBCURATOR01_REVIEW =====
// Revisao semanal em lote das licoes propostas pelo Memorialista (ja
// pre-filtradas pelo Guardian). Humano decide de verdade antes de
// qualquer coisa virar licao real na KB.

router.get('/kb/pending', authMiddleware, readLimiter, async (req, res) => { // CTXMASAUTH01
  try {
    const { listPending } = await import('./promote-lessons.mjs');
    res.json({ ok: true, items: listPending() });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post('/kb/approve', authMiddleware, express.json(), async (req, res) => { // CTXMASAUTH01
  try {
    const ids = (req.body && req.body.ids) || [];
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids[] obrigatorio' });
    const { approvePending } = await import('./promote-lessons.mjs');
    res.json({ ok: true, ...approvePending(ids) });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post('/kb/reject', authMiddleware, express.json(), async (req, res) => { // CTXMASAUTH01
  try {
    const ids = (req.body && req.body.ids) || [];
    const reason = (req.body && req.body.reason) || '';
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids[] obrigatorio' });
    const { rejectPending } = await import('./promote-lessons.mjs');
    res.json({ ok: true, ...rejectPending(ids, reason) });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

export default router;
