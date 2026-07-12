// ATUALIZADO: 2026-07-12 15:51:53 -03:00 (auto, git pre-commit)

// [B220-LOG]
import { appendFileSync as _appB220 } from "node:fs";
const _LOG_B220="/app/data/logs/mas-pipeline.log";
function _log220(runId,agent,phase,extra=""){
  const line=`[${new Date().toISOString()}] run=${runId} agent=${agent} phase=${phase} ${extra}\n`;
  try{_appB220(_LOG_B220,line);}catch{}
  console.log("[MAS]",line.trim());
}
import { loadKB, loadManifesto, STACK_CTX } from './kb.cjs';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { createRequire as __b124c_createRequire } from 'module';

const DB_PATH='/app/data/blackboard.db';

const HAIKU='claude-haiku-4-5';
const SONNET='claude-sonnet-4-5';
const OPUS='claude-opus-4-8';

const MODEL_BY_AGENT={
  // R9-ELENCO01: rotulos p/ eventos de erro (a chamada real usa ROUTING)
  estrategista: 'openai/gpt-5.5',
  testador:     'openai/gpt-5.4',
  scout:        HAIKU,
  auditor:      SONNET,
  detetive:     SONNET,
  smith:        SONNET,
  guardian:     SONNET,
  memorialista: HAIKU,
  rel:          HAIKU,
  metrico:      HAIKU,
  revisor:      OPUS,
};

const PRICE={
  [HAIKU]:  { in:1.0, out:5.0  },
  [SONNET]: { in:3.0, out:15.0 },
  [OPUS]:   { in:5.0, out:25.0 },
};

/* B124g9_LAVE */

/* B124g10_STACK */


const AGENTS=[
  // R9-ELENCO01 (2026-07-12, aprovado CBini): titular #10 — abre o pipeline
  // decompondo o objetivo ANTES da exploracao (conecta ROADMAP #5 PLANEJADOR).
  { id:'estrategista', role:'ESTRATEGISTA (L0). Antes de qualquer exploracao: decomponha o OBJETIVO em 2-4 subtarefas concretas e defina criterios de aceite MENSURAVEIS (o que provaria sucesso). Sinalize risco de escopo (grande demais? ambiguo? falta contexto?). Se o objetivo ja e atomico, diga OBJETIVO_ATOMICO e so liste os criterios. Sem bash. Max 8 linhas.' },
  { id:'scout', role:'EXPLORADOR (L1). Leia OBJETIVO + LICOES RELEVANTES acima. Liste 3 hipoteses concretas (caminhos, comandos, tabelas). Se alguma licao da KB se aplica, cite o ID (ex: L-B70). Max 6 linhas. Sem bash.' },
  { id:'auditor', role:'AUDITOR (L2). Com base no Explorador + LICOES da KB acima, aponte 2 anomalias com (a) sintoma (b) causa raiz (c) comando shell de confirmacao. Cite IDs de licoes aplicaveis (ex: L-B70). Se nenhuma bate, escreva SEM_MATCH_KB. Max 10 linhas.' },
  { id:'detetive',     role:'DETETIVE (L2). Procure APENAS nas LICOES RELEVANTES e INDEX da KB acima. REGRA CRITICA: cite SOMENTE IDs que aparecem LITERALMENTE no texto da KB fornecida. Se nenhuma licao bate, escreva exatamente: SEM_MATCH_KB. PROIBIDO inventar IDs. Max 6 linhas.' },
  { id:'smith',        role:'CODIFICADOR (L3). Gere BLOCO bash read-only PRONTO PARA COLAR. Regras LAVE: (1) set +e; set +H (2) variaveis para paths (3) backup com $(date +%s) (4) idempotente via marker (grep -q MK && exit) (5) sem rm/mv/chmod destrutivo (6) terminar com echo ===== fim BLOCO-XXX =====. APENAS o bloco entre ```bash e ```. 15-60 linhas.' },
  { id:'guardian',     role:'VALIDADOR (L4). Cheque LAVE no bash do Smith, liste 2 checagens pos-exec e 1 criterio de rollback. Se violar licao da KB diga REJEITADO citando ID. Max 8 linhas.' },
  // R9-ELENCO01: titular #11 — especializa a VERIFICACAO pos-execucao
  // (guardian = seguranca/LAVE; revisor = revisao de codigo; ninguem fazia isso).
  { id:'testador',     role:'TESTADOR (L4.5). Recebendo o BLOCO validado pelo Guardiao: gere o plano de verificacao POS-EXECUCAO — 2-3 checagens read-only concretas (comandos prontos), 1 criterio de sucesso MENSURAVEL e 1 sintoma de falha a observar nas primeiras horas. NAO repita as checagens de seguranca do Guardiao. Se nao houver BLOCO executavel, diga SEM_BLOCO e sugira como verificar a resposta mesmo assim. Max 8 linhas.' },
  { id:'memorialista', role:'MEMORIALISTA (L4). Apos sintese, PROPONHA exatamente 1 licao nova OU diga SEM_NOVA_LICAO. Formato OBRIGATORIO (literal, sem variacao): \nID: L-PROP-<slug-curto>\nTITULO: <texto>\nCONTEXTO: <quando aparece>\nREGRA: <o que fazer/evitar>\nEVIDENCIA: <run_id ou trecho>\nSe ja existe licao equivalente nas LICOES RELEVANTES acima, responda APENAS: SEM_NOVA_LICAO L-<id-existente>. NUNCA invente IDs fora da KB.' },
  { id:'rel',          role:'RELATOR (L5). Resuma em 1 frase o que o BLOCO entrega ao Cris e sugira semver vX.Y.Z. Max 3 linhas.' },
  { id:'metrico',      role:'METRICO (L5). Em 2 linhas: avalie custo/latencia do pipeline e diga se algum agente esta sobrecarregado ou se cabe trocar modelo (free vs pago).' },
  { id:'revisor',      role:'REVISOR (L6). Ultimo agente antes do desenvolvedor humano que executa o BLOCO em PRODUCAO. Fale de par para par com um dev experiente: profissional e didatico, denso, SEM enrolar. ORCAMENTO: sua resposta inteira deve caber em ~1200 tokens -- priorize densidade, corte redundancia, NAO narre linha a linha o obvio. Entregue, nesta ordem e de forma ENXUTA: (1) o bloco/codigo final com comentarios curtos apenas onde a decisao NAO e obvia (o PORQUE, nao o QUE); (2) Procedencia (2-4 linhas): o que foi feito e por que assim; (3) Risco (2-3 linhas): o que pode falhar e o que observar apos rodar; (4) Rollback + idempotencia (1-2 linhas); (5) Versao semver sugerida (1 linha). Se faltar espaco, encurte comentarios do codigo, nunca omita risco/rollback. Nao repita seguranca do Guardiao. Se inseguro, diga o que falta. Objetivo: dar CERTEZA INFORMADA para executar, sem estourar o orcamento.' },
]; /* B175_AGENTES9_CTXREVISOR01 */

/* B172 */

import { readFileSync, readdirSync, existsSync } from 'fs';

// CTXAGTUNIFY01 Frac1: comeca a unificar a fonte do agente (ver META-CTXAGTUNIFY01).
// Tenta ler o system_prompt REAL do AGENT_CARD-<slug>.md; se nao existir ou
// nao tiver a secao, cai no 'role' hardcoded acima (fallback = comportamento
// IDENTICO ao de hoje). Nenhum dos 9 cards atuais tem essa secao preenchida
// -> zero regressao nesta fracao. So passa a ter efeito quando um card for
// editado/treinado/seed com a secao '## Prompt do sistema'.
const AGENT_CARDS_DIR = '/app/knowledge/agents';
function loadAgentCardPrompt(slug, runId){
  // CTXAGTUNIFY01 Frac2d: instrumentacao p/ PROVAR (nao inferir) que o
  // pipeline real esta lendo do card. Log so dispara quando ha match --
  // silencioso no fallback, nao polui runs normais.
  // CTXAGTUNIFY01 Frac2e: placeholders do formulario ("(role do agente)",
  // "(preencher)" -- gravados quando o campo chega vazio no save) NAO contam
  // como prompt real. Sem isso, o auditor rodou em PRODUCAO com o texto
  // placeholder no lugar do papel de verdade (achado Chat6, causa raiz:
  // server.js/create regenera o card do zero, sem merge -- ver CTXAGTCARDMERGE01).
  try{
    const file = AGENT_CARDS_DIR + '/AGENT_CARD-' + slug + '.md';
    if(!existsSync(file)) return '';
    const raw = readFileSync(file, 'utf8');
    const m = raw.match(/## Prompt do sistema\n([\s\S]*?)(?=\n## |\n---|$)/);
    if(!m) return '';
    const content = m[1].trim();
    if(!content || /^\(.*\)$/.test(content)) return '';
    if(runId) _log220(runId, slug, 'card-prompt-used', 'chars='+content.length);
    return content;
  } catch(e){ return ''; }
}
import { join } from 'path';
// STACK_CTX/loadKB/loadManifesto extraidos para mas/kb.cjs (modulo
// compartilhado com api/providers.cjs -- CTXKBSHARE01, 2026-07-05).

export const bus=new EventEmitter(); bus.setMaxListeners(0);
function db(){ const d=new Database(DB_PATH); d.pragma('journal_mode=WAL'); return d; }

(function ensureSchemaTELEM01(){ // TELEM01: project_slug nullable (sql/mas-002.sql), idempotente
  // Espelha ensureSchemaCTXPROV01 do blocosRoutes: DB novo/restaurado ganha
  // a coluna no boot mesmo que a migration manual nao tenha rodado.
  // NULL = run solta (sem projeto); rotulo '(sem-projeto)' e' so apresentacao.
  const d=db();
  ['mas_run','runs'].forEach(t=>{
    try{ d.prepare('ALTER TABLE '+t+' ADD COLUMN project_slug TEXT').run(); }
    catch(e){ if(!/duplicate column/i.test(e.message||'')) throw e; }
  });
  d.close();
})();

// CTXMAS01: memoria entre runs -- ultimas N runs concluidas, goal + resumo final
function getRecentRunsContext(excludeRunId, limit=3){
  try{
    const d=db();
    const rows=d.prepare(`
      SELECT r.id, r.goal,
             (SELECT output FROM mas_event WHERE run_id=r.id AND agent IN ('rel','metrico') ORDER BY ts DESC LIMIT 1) AS resumo
      FROM mas_run r
      WHERE r.status='done' AND r.id <> ?
      ORDER BY r.started_at DESC
      LIMIT ?
    `).all(excludeRunId||'', limit);
    d.close();
    if(!rows.length) return '';
    const lines = rows.reverse().map(r=>`- [${r.id}] objetivo: ${r.goal}\n  resumo: ${(r.resumo||'(sem resumo)').slice(0,300)}`);
    return '\n\n--- MEMORIA: ultimas '+rows.length+' runs anteriores ---\n'+lines.join('\n')+'\n--- fim memoria ---\n';
  }catch(e){ console.error('[CTXMAS01] erro ao buscar memoria:', e.message); return ''; }
}

function ensureSchema(){
  const d=db();
  d.exec("CREATE TABLE IF NOT EXISTS mas_run(id TEXT PRIMARY KEY,goal TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'running',started_at INTEGER NOT NULL,ended_at INTEGER,tokens_in INTEGER DEFAULT 0,tokens_out INTEGER DEFAULT 0,cost_usd REAL DEFAULT 0);");
  d.exec("CREATE TABLE IF NOT EXISTS mas_event(id INTEGER PRIMARY KEY AUTOINCREMENT,run_id TEXT NOT NULL,agent TEXT NOT NULL,phase TEXT NOT NULL,model TEXT,tokens_in INTEGER DEFAULT 0,tokens_out INTEGER DEFAULT 0,latency_ms INTEGER DEFAULT 0,cost_usd REAL DEFAULT 0,output TEXT,ts INTEGER NOT NULL);");
  d.exec("CREATE INDEX IF NOT EXISTS idx_event_run ON mas_event(run_id, ts);");
  d.close();
}
ensureSchema();

// B124a: regex hard-veto universal (sem LLM)
const HARD_VETO_RULES = [
  { rule:'rm-rf-root',     re:/\brm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+(\/|\$HOME|~)(\s|$)/, severity:'block' },
  { rule:'rm-rf-var',      re:/\brm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+\/(etc|var|usr|bin|boot|root)(\s|\/|$)/, severity:'block' },
  { rule:'fork-bomb',      re:/:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, severity:'block' },
  { rule:'drop-database',  re:/\bDROP\s+(DATABASE|SCHEMA)\b/i, severity:'block' },
  { rule:'drop-table-bare',re:/\bDROP\s+TABLE\s+(?!IF\s+EXISTS\b)[^;]*(?<!WHERE[^;]{0,200});?/i, severity:'block' },
  { rule:'truncate-bare',  re:/\bTRUNCATE\s+(TABLE\s+)?[a-zA-Z_]/i, severity:'warn' },
  { rule:'chmod-777-root', re:/\bchmod\s+-?R?\s*777\s+\//, severity:'block' },
  { rule:'overwrite-passwd',re:/>\s*\/etc\/(passwd|shadow|sudoers)/, severity:'block' },
  { rule:'mkfs',           re:/\bmkfs\.[a-z0-9]+\s+\/dev\//, severity:'block' },
  { rule:'dd-to-dev',      re:/\bdd\s+[^|]*of=\/dev\/(sd|nvme|hd|vd)/, severity:'block' },
  { rule:'curl-pipe-sh',   re:/\bcurl\s+[^|]*\|\s*(sudo\s+)?(ba)?sh\b/, severity:'warn' },
  { rule:'secret-openai',  re:/\bsk-[A-Za-z0-9]{40,}\b/, severity:'block' },
  { rule:'secret-anthropic',re:/\bsk-ant-[A-Za-z0-9_\-]{40,}\b/, severity:'block' },
  { rule:'secret-aws',     re:/\bAKIA[0-9A-Z]{16}\b/, severity:'block' },
 { rule:'createc-domain',  re:/createc\.com\.br/i, severity:'block' }, // B379_KB_VETOS L-28
  { rule:'mutobs-body-loop', re:/new\s+MutationObserver[\s\S]{0,200}observe\s*\(\s*document\.body[\s\S]{0,80}subtree\s*:\s*true/, severity:'warn' }, // B379_KB_VETOS L-B70
  { rule:'docker-rm-api',    re:/docker\s+rm\s+-f\s+orquestrai-api\b/, severity:'block' }, // B379_KB_VETOS
  { rule:'secret-jwt',     re:/\beyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\b/, severity:'block' },
];
function hardVeto(text){
  const hits=[];
  for(const r of HARD_VETO_RULES){
    const m = (text||'').match(r.re);
    if(m) hits.push({rule:r.rule, severity:r.severity, match: String(m[0]).slice(0,120)});
  }
  return hits;
}
function ensureVetoesTable(){
  const d=db();
  d.exec("CREATE TABLE IF NOT EXISTS vetoes(id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT NOT NULL, artifact_id INTEGER, rule TEXT NOT NULL, severity TEXT NOT NULL DEFAULT 'block', details TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));");
  d.close();
}
ensureVetoesTable();



// B124c_ROUTING — multi-provider routing via providers.cjs
const __b124c_require = __b124c_createRequire(import.meta.url);
let __b124c_P = null;
try { __b124c_P = __b124c_require('/app/providers.cjs'); } catch(e) { console.warn('[B124c] providers.cjs indisponivel:', e.message); }

const ROUTING = {
  estrategista: { provider: 'openai',    model: 'gpt-5.5' },   // R9-ELENCO01: titular #10 (aprovado CBini 12/07)
  testador:     { provider: 'openai',    model: 'gpt-5.4' },   // R9-ELENCO01: titular #11 (aprovado CBini 12/07)
  scout:        { provider: 'anthropic', model: 'claude-haiku-4-5' },
  auditor:      { provider: 'openai',    model: 'gpt-5.4-mini' }, // R9-OAI1 (2026-07-12): 1o posto OpenAI da mesa — diversidade de fornecedor no contra-voto; ID real conferido via GET /v1/models
  detetive:     { provider: 'anthropic', model: 'claude-sonnet-4-5' },
  smith:        { provider: 'anthropic', model: 'claude-sonnet-4-5' },
  guardian:     { provider: 'anthropic', model: 'claude-haiku-4-5' },
  memorialista: { provider: 'anthropic', model: 'claude-haiku-4-5' }, // CTXMEMHAIKU01 (2026-07-08): zai-glm falhou 3x no papel (400 contexto -> vazio sem material -> vazio COM material, tokens_out=0 em mas_d17af4a8b43f); haiku ja provou no fallback informal; free!=gratis quando a saida e' vazia -- custo estimado ~¢0.5/run
  rel:          { provider: 'anthropic', model: 'claude-haiku-4-5' },
  metrico:      { provider: 'cerebras',  model: 'gpt-oss-120b' },
  revisor:      { provider: 'anthropic', model: 'claude-opus-4-8' },
};

async function callLLM(prompt, agentId='scout', meta=''){
  // [B222] fallback 429
  const _orig = ROUTING[agentId];
  const _fb = _orig && _orig.provider==='groq' ? {provider:'cerebras',model:'gpt-oss-120b'} : {provider:'groq',model:'llama-3.3-70b-versatile'};
  try { return await _callLLM_inner(prompt, agentId, meta); }
  catch(e){ if(String(e.message||'').match(/429|rate.?limit/i) && _orig){ console.warn('[B222] fallback',agentId,'→',_fb.provider); ROUTING[agentId]=_fb; const r=await _callLLM_inner(prompt,agentId,meta); ROUTING[agentId]=_orig; return r;} throw e; }
}
async function _callLLM_inner(prompt, agentId='scout', meta=''){
  const route = ROUTING[agentId] || { provider: 'anthropic', model: 'claude-haiku-4-5' };
  if (route.provider === 'anthropic') {
    return await callClaude(prompt, route.model, agentId, meta);
  }
  if (!__b124c_P || typeof __b124c_P.chat !== 'function') {
    throw new Error('providers.cjs chat indisponivel para ' + route.provider);
  }
  const t0 = Date.now();
  const fullModel = route.provider + '/' + route.model;
  // CTXMEMKB01: memorialista PRODUZ licao (nao consome KB extensa) e roda em
  // free tier com limite curto -- recebe top-2 licoes de 600 chars (~1.5k)
  // em vez de top-5 de 1500 (~9k). Demais agentes: KB completa (inalterado).
  const __kbOpts = (agentId === 'memorialista') ? { topN: 2, bodyCap: 600 } : undefined;
  const __kb = loadManifesto() + "\n\n---\n\n" + loadKB((meta||'')+' '+(prompt||''), __kbOpts);
  const rr = await __b124c_P.chat({
    model: fullModel,
    messages: [{ role: 'system', content: __kb+'\n\n'+STACK_CTX }, { role: 'user', content: prompt }],
  });
  const dt = Date.now() - t0;
  const text = String((rr && (rr.content || rr.text || rr.output)) || '').trim();
  const tin = Math.ceil(String(prompt || '').length / 4);
  const tout = Math.ceil(text.length / 4);
  // R9-OAI1: custo real p/ provider pago no caminho generico (antes: 0 fixo
  // => OpenAI pago apareceria FREE na telemetria). USD/1M tokens; tokens ja
  // sao estimados por chars/4 acima, entao o custo e estimativa na mesma moeda.
  const __pp = EXT_PRICE[fullModel];
  return { text, tokens_in: tin, tokens_out: tout, latency_ms: dt, cost_usd: __pp ? (tin*__pp.in + tout*__pp.out)/1e6 : 0, model: fullModel };
}
// R9-OAI1: precos dos modelos pagos roteados pelo caminho generico
// (free tiers ficam fora e seguem custo 0). gpt-5.4-mini: $0.75 in /
// $4.50 out por 1M (pricing OpenAI 2026-03).
const EXT_PRICE = {
  'openai/gpt-5.4-mini': { in: 0.75, out: 4.5 },
  'openai/gpt-5.4':      { in: 2.5,  out: 15 },  // R9-ELENCO01
  'openai/gpt-5.5':      { in: 5,    out: 30 },  // R9-ELENCO01
};


async function callClaude(prompt, model, agentId='', meta=''){
  const key=process.env.ANTHROPIC_API_KEY;
  if(!key) throw new Error('ANTHROPIC_API_KEY ausente');
  const p=PRICE[model]||PRICE[HAIKU];
  const t0=Date.now();
  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'x-api-key':key,'anthropic-version':'2023-06-01','content-type':'application/json'},
    body:JSON.stringify({model,max_tokens:1400,system:`${loadManifesto() + "\n\n---\n\n" + loadKB((meta||'')+' '+(prompt||''))}\n\n${STACK_CTX}
Voce e um agente do OrquestrAI no protocolo LAVE (Ler, Avaliar, Verificar, Executar). Responda em PT-BR, tecnico, direto. Siga ESTRITAMENTE o papel do agente. Quando pedirem bash, gere bash real read-only, nunca npm/yarn genericos.`,messages:[{role:'user',content:prompt}]})
  });
  const dt=Date.now()-t0;
  const j=await r.json();
  if(!r.ok) throw new Error('claude '+r.status+': '+JSON.stringify(j).slice(0,200));
  const text=(j.content&&j.content[0]&&j.content[0].text)||'';
  const u=j.usage||{};
  const inT=u.input_tokens||0, outT=u.output_tokens||0;
  return { text:text.trim(), tokens_in:inT, tokens_out:outT, latency_ms:dt, cost_usd:(inT*p.in+outT*p.out)/1e6, model };
}

// R9-DNA01 (2026-07-12, MVP aprovado CBini): DNA = contrato do projeto
// (bloco `dna` do project.json). Runs ligadas a um projeto recebem o DNA
// no contexto, mesma filosofia da KB — o mesh audita CONTRA o contrato
// e Guardiao/Auditor apontam violacoes. Sem versionamento na v1.
function getProjectDnaContext(slug){
  if(!slug) return '';
  try{
    const pj = JSON.parse(readFileSync('/app/projects/'+slug+'/project.json','utf8'));
    const dna = pj && pj.dna; if(!dna) return '';
    const li = v => (Array.isArray(v) && v.length) ? v.map(x=>'- '+x).join('\n') : null;
    const parts = [];
    if(dna.objetivo) parts.push('OBJETIVO DO PROJETO: '+dna.objetivo);
    if(dna.publico) parts.push('PUBLICO: '+dna.publico);
    const r = li(dna.restricoes);        if(r)  parts.push('RESTRICOES:\n'+r);
    const c = li(dna.criterios_aceite);  if(c)  parts.push('CRITERIOS DE ACEITE:\n'+c);
    const de = li(dna.decisoes);         if(de) parts.push('DECISOES JA TOMADAS:\n'+de);
    if(!parts.length) return '';
    return '\n\n=== DNA DO PROJETO '+slug+' (contrato: NAO viole; aponte violacoes) ===\n'
      + parts.join('\n') + '\n=== fim do DNA ===\n';
  }catch(e){ return ''; }
}

export async function runMas(goal, projectSlug){
  // CTXPROJRUN01: projectSlug (opcional) liga o run ao projeto; validado
  // aqui de novo (defesa em profundidade alem da rota).
  if(projectSlug && !/^[a-z0-9-]{1,60}$/.test(projectSlug)) projectSlug=null;
  const runId='mas_'+crypto.randomBytes(6).toString('hex');
  const d=db();
  d.prepare('INSERT INTO mas_run(id,goal,status,started_at,project_slug) VALUES(?,?,?,?,?)').run(runId,goal,'running',Date.now(),projectSlug||null);
  d.close();
  bus.emit(runId,{type:'run.start',run_id:runId,goal,ts:Date.now()});
  (async()=>{
    let ctx='OBJETIVO: '+goal+getProjectDnaContext(projectSlug)+getRecentRunsContext(runId,3); let tin=0,tout=0,tc=0; // CTXMAS01 + R9-DNA01
    try{
      let __smithOut=''; let __vetoed=false;
      // CTXMETRICTELEM01 (2026-07-08): acumulador ESTRUTURADO por agente.
      // B238 checava 'results' que NUNCA existiu (guard sempre falso = codigo
      // morto): memorialista rodava SEM material (done vazio) e metrico
      // INVENTAVA numeros (run mas_70fbd96f7e42). __telem alimenta ambos via __inj.
      const __telem=[];
      console.log('[B236] AGENTS len=', AGENTS.length, 'ids=', AGENTS.map(a=>a.id));
  
// B238_MEM_CTX — enriquece prompt do memorialista com run summary
// CTXMEMCTX01 (2026-07-07): 1500 chars/agente x 8 agentes (~12k) + KB (7.5k)
// + STACK_CTX estourava o limite de input do zai-glm no free tier do cerebras
// (erro 400 'reduce the length', 3 runs no mesmo dia). O memorialista NAO
// precisa reler o run inteiro -- o papel dele e' destilar 1 licao. Recebe:
// 300 chars/agente (o suficiente p/ identificar acerto/erro/padrao) + o
// veredito integral do guardian (a informacao mais densa p/ licao).
// CTXMETRICTELEM01: injecao LOCAL por agente (memorialista=textual, metrico=numerica).
// Licao 13.8: agente de sintese L5 SEM dado injetado alucina numeros.
function __inj(agentId, telem){
  if(!telem || !telem.length) return '';
  if(agentId==='memorialista') return '\n\n'+buildMemorialistaContext(telem);
  if(agentId==='metrico'){
    const rows=telem.map(t=>t.agent+' | '+t.model+' | '+(t.tk_in+t.tk_out)+' tk | $'+((t.usd||0).toFixed(4))+' | '+t.ms+'ms');
    const tot=telem.reduce((a,t)=>({tk:a.tk+t.tk_in+t.tk_out,usd:a.usd+(t.usd||0),ms:a.ms+t.ms}),{tk:0,usd:0,ms:0});
    return '\n\n=== TELEMETRIA REAL DO RUN (fonte: blackboard; use SOMENTE estes numeros) ===\nagente | modelo | tokens | custo | latencia\n'+rows.join('\n')+'\nTOTAL: '+tot.tk+' tk | $'+tot.usd.toFixed(4)+' | '+tot.ms+'ms (ate aqui; voce fecha o pipeline)';
  }
  return '';
}
function buildMemorialistaContext(runResults){
  const lines = ['=== RESUMO DO RUN (destilado p/ licao) ===\n'];
  for(const r of runResults){
    const head = `--- ${r.agent} (${r.model||'?'}) ---`;
    // guardian integral (ate 800): vetos/aprovacoes sao a materia-prima da licao
    const cap = r.agent === 'guardian' ? 800 : 300;
    const body = (r.output||'').slice(0, cap);
    lines.push(head + '\n' + body + '\n');
  }
  return lines.join('\n');
}

  for(const ag of AGENTS){
    // B238: memorialista recebe run completo como contexto
    if(ag.id === 'memorialista' && false /* B238 morto: 'results' nunca existiu; substituido por __inj (CTXMETRICTELEM01) */){
      meta = {...meta, runContext: buildMemorialistaContext(results)};
    } console.log('[B236] iter agente=', ag.id);
    // Q10/CTXREVCOND01 (2026-07-08, decisao Bini): REVISOR (opus, ~\$0.09/run =
    // ~50% do custo do pipeline) so e' convocado se o SMITH produziu BLOCO bash
    // executavel. Dado: 27 convocacoes/\$2.54 com pouquissimos blocos executados.
    // Run de diagnostico puro termina no METRICO; GUARDIAO segue em TODO run
    // (risco != qualidade). Skip e' AUDITAVEL: evento 'skipped' no blackboard
    // (score sabe que foi pulado, nao falhou) + msg no chat via bus.
    if(ag.id==='revisor'){
      const __temBloco = /```bash[\s\S]*?```/.test(__smithOut) || (/(^|\n)\s*set\s+\+[eH]/.test(__smithOut) && /(^|\n)\s*echo\s+/.test(__smithOut));
      if(!__temBloco){
        console.log('[Q10] revisor SKIPPED: run sem bloco executavel');
        const dQ=db();
        dQ.prepare('INSERT INTO mas_event(run_id,agent,phase,model,tokens_in,tokens_out,latency_ms,cost_usd,output,ts,duration_ms) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
          .run(runId,'revisor','skipped','q10-conditional',0,0,0,0,'[Q10] Convocacao condicional: run sem BLOCO executavel do SMITH -- revisor nao convocado (economia ~\$0.09). Decisao CTXREVCOND01.',Date.now(),0);
        dQ.close();
        bus.emit(runId,{type:'agent.done',run_id:runId,agent:'revisor',model:'dispensado (sem bloco)',tokens_in:0,tokens_out:0,latency_ms:0,cost_usd:0,text:'Revisor dispensado: este run nao gerou BLOCO executavel, entao a revisao final (Opus) nao foi necessaria. Economia: ~\$0.11. [Q10/CTXREVCOND01]',ts:Date.now()});
        continue;
      }
    }
        if(__vetoed) break;
        try { /*B387_GUARDIAN_TRY*/
        if(ag.id==='guardian'){
          const hits=hardVeto(__smithOut);
          if(hits.length){
            const dV=db();
            for(const h of hits){
              dV.prepare('INSERT INTO vetoes(run_id,artifact_id,rule,severity,details) VALUES(?,?,?,?,?)')
                .run(runId,null,h.rule,h.severity,h.match);
            }
            dV.close();
            const blocked=hits.filter(h=>h.severity==='block');
            if(blocked.length){
              const msg='# [GUARDIAN HARD-VETO]\n\nBloqueado por regras universais:\n'+blocked.map(h=>'- `'+h.rule+'`: '+h.match).join('\n');
              const d3=db();
              d3.prepare('INSERT INTO mas_event(run_id,agent,phase,model,tokens_in,tokens_out,latency_ms,cost_usd,output,ts) VALUES(?,?,?,?,?,?,?,?,?,?)')
                .run(runId,'guardian','vetoed','regex',0,0,0,0,msg,Date.now());
              d3.close();
              bus.emit(runId,{type:'agent.done',run_id:runId,agent:'guardian',model:'regex',tokens_in:0,tokens_out:0,latency_ms:0,cost_usd:0,text:msg,ts:Date.now()});
              const dF2=db();
              dF2.prepare('UPDATE mas_run SET status=?,ended_at=?,tokens_in=?,tokens_out=?,cost_usd=? WHERE id=?').run('vetoed',Date.now(),tin,tout,tc,runId);
              dF2.close();
              bus.emit(runId,{type:'run.done',run_id:runId,status:'vetoed',vetoes:blocked,ts:Date.now()});
              /*B393_VETO_STOP*/ try{const dV=db();dV.prepare("UPDATE mas_run SET status=?,ended_at=? WHERE id=?").run('vetoed',Date.now(),runId);dV.close();}catch(e){console.error('[B393] update vetoed fail',e);} return;
              __vetoed=true; break;
            }
          }
        }
        } catch(eG){ console.error('[B387_GUARDIAN_ERR]', eG && eG.stack || eG); const dE=db(); dE.prepare('INSERT INTO mas_event(run_id,agent,phase,model,tokens_in,tokens_out,latency_ms,cost_usd,output,ts,duration_ms) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(runId,'guardian','error','regex',0,0,0,0,'[GUARDIAN_CRASH] '+String(eG&&eG.message||eG).slice(0,400),Date.now(),0); dE.close(); bus.emit(runId,{type:'agent.error',run_id:runId,agent:'guardian',error:String(eG&&eG.message||eG),ts:Date.now()}); }
        const agStart=Date.now(); const model=MODEL_BY_AGENT[ag.id]||HAIKU;
        bus.emit(runId,{type:'agent.start',run_id:runId,agent:ag.id,model,ts:Date.now()});
        /* B124e8_AGENT_ERROR */ let out; try { out=await callLLM(ctx+__inj(ag.id,__telem)+'\n\n[VOCE E '+ag.id.toUpperCase()+'] '+(loadAgentCardPrompt(ag.id,runId)||ag.role), ag.id, ctx); } catch(eAg){ const errMsg='[AGENT_ERROR] '+ag.id+': '+String(eAg&&eAg.message||eAg).slice(0,300); const dErr=db(); dErr.prepare('INSERT INTO mas_event(run_id,agent,phase,model,tokens_in,tokens_out,latency_ms,cost_usd,output,ts,duration_ms) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(runId,ag.id,'error',(MODEL_BY_AGENT&&MODEL_BY_AGENT[ag.id])||'unknown',0,0,0,0,errMsg,Date.now(),Date.now()-agStart); dErr.close(); bus.emit(runId,{type:'agent.error',run_id:runId,agent:ag.id,error:errMsg,ts:Date.now()}); out={text:errMsg,model:(MODEL_BY_AGENT&&MODEL_BY_AGENT[ag.id])||'error',tokens_in:0,tokens_out:0,latency_ms:0,cost_usd:0}; }
        const d2=db();
        d2.prepare('INSERT INTO mas_event(run_id,agent,phase,model,tokens_in,tokens_out,latency_ms,cost_usd,output,ts,duration_ms) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
          .run(runId,ag.id,'done',out.model,out.tokens_in,out.tokens_out,out.latency_ms,out.cost_usd,out.text,Date.now(),Date.now()-agStart);
        d2.close();
        tin+=out.tokens_in; tout+=out.tokens_out; tc+=out.cost_usd;
        __telem.push({agent:ag.id,model:out.model,tk_in:out.tokens_in,tk_out:out.tokens_out,usd:out.cost_usd,ms:out.latency_ms,output:out.text}); // CTXMETRICTELEM01
        bus.emit(runId,{type:'agent.done',run_id:runId,agent:ag.id,model:out.model,tokens_in:out.tokens_in,tokens_out:out.tokens_out,latency_ms:out.latency_ms,cost_usd:out.cost_usd,text:out.text,ts:Date.now()});
        if(ag.id==='smith') __smithOut=out.text;
        ctx+='\n\n['+ag.id.toUpperCase()+']: '+out.text;
      }
      const dF=db();
      dF.prepare('UPDATE mas_run SET status=?,ended_at=?,tokens_in=?,tokens_out=?,cost_usd=? WHERE id=?').run('done',Date.now(),tin,tout,tc,runId);
      // CTXPROJRUN01: persiste o entregavel no projeto (se vinculado).
      // RELATOR = sintese p/ humano; SMITH = arquitetura/bloco. Falha aqui
      // NAO derruba o run (try isolado): entregar e bonus, run ja e 'done'.
      if(projectSlug){ try{
        const fsN=await import('node:fs'); const pathN=await import('node:path');
        const dir=pathN.join('/app/projects', projectSlug, 'docs');
        if(fsN.existsSync(dir)){
          const dP=db();
          const evs=dP.prepare("SELECT agent,output FROM mas_event WHERE run_id=? AND agent IN ('rel','smith') ORDER BY id").all(runId);
          dP.close();
          const corpo=evs.map(e=>'## '+(e.agent==='rel'?'RELATOR (sintese)':'SMITH (arquitetura)')+'\n\n'+(e.output||'')).join('\n\n---\n\n');
          const md='# Plano gerado pelo mesh OrquestrAI\n\n- run: '+runId+'\n- goal: '+goal.slice(0,200)+'\n- gerado em: '+new Date().toISOString()+'\n\n---\n\n'+(corpo||'_agentes rel/smith sem saida neste run_');
          const tmp=pathN.join(dir,'.plano.tmp'); const dst=pathN.join(dir,'plano-'+runId+'.md');
          fsN.writeFileSync(tmp,md); fsN.renameSync(tmp,dst); // escrita atomica (padrao CTXPROJPERSIST01)
          console.log('[CTXPROJRUN01] plano persistido:', dst);
        } else { console.warn('[CTXPROJRUN01] projeto sem docs/:', projectSlug); }
      }catch(e){ console.error('[CTXPROJRUN01] falha ao persistir plano (run segue done):', e.message); } }
      // CTXPROJRUN02 f2: gera+valida+persiste site estatico
      if(projectSlug && /^BUILD\s+novo\s+projeto/i.test(goal)){ try{
        const fsN2=await import('node:fs'); const pathN2=await import('node:path');
        const pdir=pathN2.join('/app/projects', projectSlug);
        const pjPath=pathN2.join(pdir,'project.json');
        if(fsN2.existsSync(pjPath)){
          const proj=JSON.parse(fsN2.readFileSync(pjPath,'utf8'));
          if(proj.stack==='static-html'){
            const sitePrompt = 'Crie uma pagina web para: '+(proj.name||projectSlug)+'. '+(proj.description||'')+((proj.features&&proj.features.length)?(' Elementos a incluir: '+proj.features.join(', ')+'.'):'');
            const built = await buildStaticSite(sitePrompt, projectSlug);
            const html = built.html||'';
            const hits = hardVeto(html); // mesmas regras universais do Guardian
            const htmlChecks = [];
            if(/<script[^>]+src=/i.test(html)) htmlChecks.push({rule:'html-script-src-externo',severity:'block',match:'script src externo'});
            if(/fetch\(|XMLHttpRequest|\/api\//i.test(html)) htmlChecks.push({rule:'html-fetch-ou-api',severity:'block',match:'fetch/XHR ou /api'});
            if(!/^<!doctype html/i.test(html.trim())) htmlChecks.push({rule:'html-sem-doctype',severity:'block',match:'sem DOCTYPE'});
            if(html.length < 50) htmlChecks.push({rule:'html-vazio-ou-curto',severity:'block',match:'len='+html.length});
            const allHits=[...hits, ...htmlChecks];
            const blocked=allHits.filter(function(h){ return h.severity==='block'; });
            if(allHits.length){
              const dV2=db();
              for(const h of allHits){
                dV2.prepare('INSERT INTO vetoes(run_id,artifact_id,rule,severity,details) VALUES(?,?,?,?,?)').run(runId,'site',h.rule,h.severity,String(h.match).slice(0,200));
              }
              dV2.close();
            }
            if(blocked.length){
              console.warn('[CTXPROJRUN02] site NAO gravado (bloqueado):', blocked.map(function(h){return h.rule;}).join(','));
            } else {
              const siteDir=pathN2.join(pdir,'site');
              if(fsN2.existsSync(siteDir)){
                const qdir=pathN2.join(pdir,'_arquivados');
                fsN2.mkdirSync(qdir,{recursive:true});
                fsN2.renameSync(siteDir, pathN2.join(qdir,'site-'+new Date().toISOString().replace(/[:.]/g,'-')));
              }
              fsN2.mkdirSync(siteDir,{recursive:true});
              const tmp2=pathN2.join(siteDir,'.index.html.tmp');
              const dst2=pathN2.join(siteDir,'index.html');
              fsN2.writeFileSync(tmp2, html);
              fsN2.renameSync(tmp2, dst2);
              console.log('[CTXPROJRUN02] site persistido:', dst2, '| custo:', built.cost_usd);
            }
          }
        }
      }catch(e){ console.error('[CTXPROJRUN02] falha ao gerar/persistir site (run segue done):', e.message); } }
      dF.close();
      bus.emit(runId,{type:'run.done',run_id:runId,tokens_in:tin,tokens_out:tout,cost_usd:tc,ts:Date.now()});
    }catch(e){
      const dE=db();
      dE.prepare('UPDATE mas_run SET status=?,ended_at=? WHERE id=?').run('error',Date.now(),runId);
      dE.close();
      bus.emit(runId,{type:'run.error',run_id:runId,error:String(e.message||e),ts:Date.now()});
    }
  })();
  return { run_id:runId };
}

export function getRun(runId){
  const d=db();
  const run=d.prepare('SELECT * FROM mas_run WHERE id=?').get(runId);
  const events=d.prepare('SELECT * FROM mas_event WHERE run_id=? ORDER BY ts').all(runId);
  d.close();
  return { run, events };
}

// ============================================================
// CTXPROJRUN02 f1 -- gerador de site estatico (caminho dedicado)
// ============================================================
// R10-1a (2026-07-12): teto de saida do build de site. Era 4000 (~13KB HTML,
// truncava "descricao completa" — achado no E2E do /construir R9). Sondado
// contra a API: sonnet-4-5 aceita ate 64000; 16000 (~50KB HTML) cobre pagina
// rica completa sem truncar, com custo limitado (~$0.24 no pior caso vs $0.06).
const SITE_MAX_TOKENS = 16000;
export async function buildStaticSite(goal, slug){
  // CTXPROJRUN02 f1v2 (correcoes documentadas no cabecalho do patch)
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY ausente');
  const model = MODEL_BY_AGENT.smith; // string direta (bug f1: nao e' {model:..})
  const sys = [
    'Voce e um CONSTRUTOR de sites estaticos. Gere UM arquivo index.html',
    'COMPLETO e AUTOSSUFICIENTE para o pedido do usuario.',
    'REGRAS RIGIDAS:',
    '- TODO CSS em <style> e TODO JS em <script> inline no proprio arquivo.',
    '- PROIBIDO <script src=...> externo, <link> para CDN, @import de URL,',
    '  fetch()/XMLHttpRequest para qualquer dominio, e chamadas a /api.',
    '- Sem bibliotecas externas. HTML+CSS+JS puro.',
    '- Design limpo e responsivo. Portugues do Brasil.',
    'RESPONDA APENAS com o HTML, comecando em <!DOCTYPE html>. Sem markdown, sem cercas de codigo, sem explicacao.'
  ].join('\n');
  const prompt = String(goal||'').slice(0,4000);
  const t0=Date.now();
  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'x-api-key':key,'anthropic-version':'2023-06-01','content-type':'application/json'},
    body:JSON.stringify({model,max_tokens:SITE_MAX_TOKENS,system:sys,messages:[{role:'user',content:prompt}]})
  });
  const dt=Date.now()-t0;
  const j=await r.json();
  if(!r.ok) throw new Error('claude '+r.status+': '+JSON.stringify(j).slice(0,300));
  let html=(j.content&&j.content[0]&&j.content[0].text)||'';
  html=html.replace(/^\s*```(?:html)?\s*/i,'').replace(/\s*```\s*$/,'').trim();
  if(!/^<!doctype html/i.test(html)){
    const di = html.search(/<!doctype html/i);
    if(di > 0){ html = html.slice(di); console.warn('[buildStaticSite] preambulo removido antes do DOCTYPE'); }
  }
  const p=PRICE[model]||PRICE[HAIKU];
  const u=j.usage||{};
  const inT=u.input_tokens||0, outT=u.output_tokens||0;
  return { html, model, tokens_in:inT, tokens_out:outT, latency_ms:dt, cost_usd:(inT*p.in+outT*p.out)/1e6 };
}

// R9-CONSTRUIR01 (2026-07-12, Fatia B opcao 1 aprovada CBini): comando
// /construir <pedido> no chat de um projeto static-html. Gera UMA pagina
// nomeada (site/<pagina>.html) via buildStaticSite com DNA+descricao+pedido,
// SEM tocar as paginas irmas (arquiva so o alvo se ja existir). Diferente do
// CTXPROJRUN02 (BUILD novo projeto), que regenera o index inteiro. R10-1b
// adicionou navegacao multi-pagina (nav ligando as irmas). Mesmos vetos
// universais do Guardian.
const CONSTRUIR_STOP = new Set(['de','do','da','para','com','uma','um','a','o','the','of','sobre-o','no','na']);
function pageFilenameFromPedido(pedido){
  // normaliza acentos p/ casar "pagina"/"página" e slugificar o nome
  const t = String(pedido||'').normalize('NFD').replace(/[̀-ͯ]/g,'');
  const m = t.match(/\bpagina\s+(.+)/i) || t.match(/\bpage\s+(.+)/i) || t.match(/\btela\s+(.+)/i);
  let name = 'index';
  if(m){
    const words = m[1].toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const first = words.find(w => !CONSTRUIR_STOP.has(w) && w.length>1);
    if(first) name = first;
  }
  if(['index','home','inicial','principal','inicio'].includes(name)) return 'index.html';
  return name.slice(0,40) + '.html';
}
export async function buildProjectPage(slug, pedido){
  if(!slug || !/^[a-z0-9-]{1,60}$/.test(slug)) throw new Error('slug invalido');
  const fsN = await import('node:fs'); const pathN = await import('node:path');
  const pdir = pathN.join('/app/projects', slug);
  const pjPath = pathN.join(pdir, 'project.json');
  if(!fsN.existsSync(pjPath)) throw new Error('projeto nao encontrado: '+slug);
  const proj = JSON.parse(fsN.readFileSync(pjPath,'utf8'));
  if(proj.stack !== 'static-html') throw new Error('/construir v1 so suporta stack static-html (o projeto "'+slug+'" e "'+proj.stack+'")');

  const file = pageFilenameFromPedido(pedido);
  if(!/^[a-z0-9-]{1,40}\.html$/.test(file)) throw new Error('nome de pagina invalido derivado do pedido');

  // R10-1b: navegacao multi-pagina. Le as paginas irmas ja existentes em site/,
  // monta a lista COMPLETA (irmas + a que esta sendo construida + index sempre)
  // e instrui o modelo a gerar um <nav> consistente ligando todas com links
  // relativos. Limitacao MVP: paginas ANTIGAS so ganham o link da nova quando
  // reconstruidas (o /construir regenera 1 pagina por vez).
  let __siblings = [];
  try {
    const sdir = pathN.join(pdir, 'site');
    if (fsN.existsSync(sdir)) __siblings = fsN.readdirSync(sdir).filter(f => /^[a-z0-9-]+\.html$/.test(f));
  } catch(_) {}
  const allPages = Array.from(new Set([...__siblings, file, 'index.html']));
  allPages.sort((a,b) => a==='index.html' ? -1 : b==='index.html' ? 1 : a.localeCompare(b));
  const labelOf = f => f==='index.html' ? 'Inicio' : f.replace(/\.html$/,'').replace(/-/g,' ').replace(/^./, c=>c.toUpperCase());
  const navList = allPages.map(f => '  - '+labelOf(f)+' -> ./'+f).join('\n');

  const sitePrompt =
    'Projeto: '+(proj.name||slug)+'. '
    + (proj.description ? ('Descricao geral: '+proj.description+'. ') : '')
    + getProjectDnaContext(slug)
    + '\n\nCONSTRUA a pagina "'+file.replace(/\.html$/,'')+'" deste site conforme o pedido a seguir. '
    + 'Respeite o DNA/contrato do projeto acima quando houver. Pedido: '
    + String(pedido||'').slice(0,2000)
    + '\n\nNAVEGACAO DO SITE — este site tem estas paginas (rotulo -> arquivo):\n'
    + navList
    + '\nInclua no TOPO da pagina um menu <nav> com links RELATIVOS para TODAS essas paginas '
    + '(exatamente os arquivos listados, ex: <a href="./'+(allPages.find(f=>f!==file)||'index.html')+'">...</a>), '
    + 'destacando visualmente a pagina ATUAL ("'+labelOf(file)+'"). Nao invente paginas fora da lista.';

  const built = await buildStaticSite(sitePrompt, slug);
  const html = built.html||'';

  // vetos universais IDENTICOS ao CTXPROJRUN02 (fonte da verdade da seguranca de site)
  const hits = hardVeto(html);
  const htmlChecks = [];
  if(/<script[^>]+src=/i.test(html)) htmlChecks.push({rule:'html-script-src-externo'});
  if(/fetch\(|XMLHttpRequest|\/api\//i.test(html)) htmlChecks.push({rule:'html-fetch-ou-api'});
  if(!/^<!doctype html/i.test(html.trim())) htmlChecks.push({rule:'html-sem-doctype'});
  if(html.length < 50) htmlChecks.push({rule:'html-vazio-ou-curto'});
  const allHits = [...hits.map(h=>({rule:h.rule})), ...htmlChecks];
  if(allHits.length){
    return { ok:false, blocked:true, page:file, vetoes:allHits.map(h=>h.rule), cost_usd:built.cost_usd };
  }

  const siteDir = pathN.join(pdir, 'site');
  fsN.mkdirSync(siteDir, {recursive:true});
  const target = pathN.join(siteDir, file);
  // arquiva SO o arquivo alvo (preserva paginas irmas — diferenca-chave do CTXPROJRUN02)
  if(fsN.existsSync(target)){
    const qdir = pathN.join(pdir, '_arquivados'); fsN.mkdirSync(qdir, {recursive:true});
    fsN.renameSync(target, pathN.join(qdir, file.replace(/\.html$/,'')+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.html'));
  }
  const tmp = pathN.join(siteDir, '.'+file+'.tmp'); // escrita atomica (padrao CTXPROJPERSIST01)
  fsN.writeFileSync(tmp, html); fsN.renameSync(tmp, target);
  console.log('[R9-CONSTRUIR01] pagina persistida:', target, '| custo:', built.cost_usd);
  return { ok:true, page:file, path:'projects/'+slug+'/site/'+file, cost_usd:built.cost_usd, tokens_in:built.tokens_in, tokens_out:built.tokens_out };
}

export { AGENTS, MODEL_BY_AGENT, PRICE };
