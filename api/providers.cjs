// ATUALIZADO: 2026-07-05 04:02:02 -03:00 (auto, git pre-commit)
const fs = require('fs');
const { loadKB, loadManifesto, STACK_CTX } = require('./mas/kb.cjs');
const crypto = require('crypto');
const FILE = '/var/www/orquestrai/data/providers.json';

// CTXSECRETS01: API keys dos providers cifradas em repouso (AES-256-GCM).
// Antes: providers.json guardava a chave em texto plano no disco -- achado
// durante auditoria de seguranca 2026-07-01 (Escopo V6.0 §11 ja exigia isso).
// Fallback: se PROVIDERS_ENC_KEY nao existir no .env, mantem texto plano
// e avisa no log -- nunca quebra o login/chat por falta de chave mestra.
const ENC_KEY = process.env.PROVIDERS_ENC_KEY
  ? Buffer.from(process.env.PROVIDERS_ENC_KEY, 'hex')
  : null;
if (!ENC_KEY) {
  console.warn('[CTXSECRETS01] PROVIDERS_ENC_KEY ausente no .env -- API keys dos providers ficam em texto plano.');
}
const ENC_PREFIX = 'enc1:'; // marca valor cifrado, distingue de chave legada em texto plano

function encryptKey(plain){
  if (!ENC_KEY || !plain) return plain;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENC_KEY, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ENC_PREFIX + Buffer.concat([iv, tag, enc]).toString('base64');
}

function decryptKey(stored){
  if (!stored || !String(stored).startsWith(ENC_PREFIX)) return stored; // texto plano legado, devolve como esta
  if (!ENC_KEY) throw new Error('PROVIDERS_ENC_KEY ausente -- nao e possivel decifrar chave existente');
  const raw = Buffer.from(String(stored).slice(ENC_PREFIX.length), 'base64');
  const iv = raw.subarray(0, 12), tag = raw.subarray(12, 28), enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENC_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

// OQ-71i SYSTEM LAVE
const OQ71I_SYS = { role: 'system', content: 'Voce e o OrquestrAI, cockpit de auditoria desta VPS. Quando a pergunta pedir comando shell, diagnostico, listagem, correcao, deploy ou qualquer acao executavel na VPS, voce DEVE responder com UM bloco fenceado triple-backtick lave (NAO bash, NAO sh) contendo o comando pronto pra rodar. Formato OBRIGATORIO: tres-crases lave + newline + comandos + newline + tres-crases. O parser do OrquestrAI captura blocos lave e cria card no painel BLOCO LAVE — bash/sh vai para o chat e nao executa. Para explicacao curta use texto normal antes do fence. Sem fence lave = comando perdido.' };

// OQ-71k gemini helper
function oq71kGeminiBody(messages){ const all = oq71iEnsureSys(messages); const sysTxt = all.filter(m=>m.role==='system').map(m=>m.content).join('\n'); const rest = all.filter(m=>m.role!=='system'); const body = { contents: rest.map(m => ({ role: m.role==='assistant'?'model':'user', parts:[{text:String(m.content||'')}] })) }; if(sysTxt) body.systemInstruction = { parts:[{text: sysTxt}] }; return body; }

function oq71iEnsureSys(msgs){ if(!Array.isArray(msgs)) return msgs; if(msgs[0] && msgs[0].role==='system'){ msgs[0].content = OQ71I_SYS.content + '\n\n' + (msgs[0].content||''); return msgs; } return [OQ71I_SYS, ...msgs]; }


function load(){
  try{
    const d = JSON.parse(fs.readFileSync(FILE,'utf8'));
    // CTXSECRETS01: decifra na leitura -- codigo que consome load() (chat/test/
    // publicList) nunca precisa saber se a chave estava cifrada ou nao.
    for (const id of Object.keys(d)) {
      if (d[id] && d[id].key) { try { d[id].key = decryptKey(d[id].key); } catch(e) { console.error('[CTXSECRETS01] falha ao decifrar chave de', id, e.message); } }
    }
    return d;
  }catch(e){ return {}; }
}
function save(d){ fs.writeFileSync(FILE, JSON.stringify(d,null,2)); fs.chmodSync(FILE,0o600); }

function publicList(){
  const d = load(); const out = {};
  for(const k of Object.keys(d)){
    out[k] = { configured: !!(d[k].key && d[k].key.length>5), models: d[k].models||[] };
  }
  return out;
}
function setKey(id, key){
  const d = load(); // ja vem decifrado
  if(!d[id]) throw new Error('provider desconhecido: '+id);
  d[id].key = String(key||'').trim(); // fica em memoria em texto plano ate save()
  const toSave = load(); // recarrega cru (evita re-cifrar o que ja foi decifrado em d)
  toSave[id] = toSave[id] || {};
  toSave[id].key = encryptKey(d[id].key); // CTXSECRETS01: cifra so na hora de gravar
  toSave[id].models = d[id].models;
  save(toSave);
}

const ENDPOINTS = {
  groq:       'https://api.groq.com/openai/v1/chat/completions',
  openai:     'https://api.openai.com/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  cerebras:   'https://api.cerebras.ai/v1/chat/completions',
  anthropic:  'https://api.anthropic.com/v1/messages',
  gemini:     'https://generativelanguage.googleapis.com/v1beta'
};/*OQ46Y*/

async function chat({ model, messages }){
  const d = load();
  const [provider, ...rest] = String(model||'').split('/');
  const modelId = rest.join('/');
  if(!provider || !modelId) throw new Error('model invalido. use "provider/model"');
  const cfg = d[provider];
  if(!cfg) throw new Error('provider nao configurado: '+provider);
  if(!cfg.key) throw new Error('key ausente para '+provider+'. configure em Provedores');

  if(provider === 'anthropic'){ /*OQ46S B53FIX*/
    const sysParts = messages.filter(m=>m.role==='system').map(m=>m.content);
    const lastUser = [...messages].reverse().find(m=>m.role==='user');
    const kbBlock = loadManifesto() + "\n\n---\n\n" + loadKB(String((lastUser&&lastUser.content)||'')) + '\n\n' + STACK_CTX;
    const sys = [OQ71I_SYS.content, kbBlock, ...sysParts].filter(Boolean).join('\n') || undefined;
    const msgs = messages.filter(m=>m.role!=='system').map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'')}));
    if(!msgs.length) msgs.push({role:'user',content:'ping'});
    const r = await fetch(ENDPOINTS.anthropic,{ method:'POST', headers:{'Content-Type':'application/json','x-api-key':cfg.key,'anthropic-version':'2023-06-01'}, body: JSON.stringify({model:modelId,max_tokens:1024,system:sys,messages:msgs}) });
    if(!r.ok) throw new Error('anthropic '+r.status+': '+(await r.text()).slice(0,300));
    const j = await r.json();
    return { content: (j && j.content && j.content.map(c=>c.text).join('')) || '' };
  }

    if(provider === 'gemini'){/*OQ46Y*/
    const url = ENDPOINTS.gemini + '/models/' + modelId + ':generateContent?key=' + encodeURIComponent(cfg.key);
    const r = await fetch(url, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        contents: messages.map(m => ({ role: m.role==='assistant'?'model':'user', parts:[{text:String(m.content||'')}] }))
      })
    });
    if(!r.ok) throw new Error('gemini '+r.status+': '+(await r.text()).slice(0,300));
    const j = await r.json();
    const txt = j?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('') || '';
    return { content: txt };
  }

  const r = await fetch(ENDPOINTS[provider],{
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+cfg.key },
    body: JSON.stringify({ model: modelId, messages })
  });
  if(!r.ok) throw new Error(provider+' '+r.status+': '+(await r.text()).slice(0,300));
  const j = await r.json();
  return { content: j?.choices?.[0]?.message?.content || '' };
}

async function test(provider){
  const d = load();
  const m = d[provider]?.models?.[0];
  if(!m) throw new Error('sem model para '+provider);
  return await chat({ model: provider+'/'+m, messages:[{role:'user',content:'responda apenas: ok'}] });
}

// B43_ANTHROPIC_BEGIN
const _b43Anthropic = {
  name: 'anthropic',
  envKey: 'ANTHROPIC_API_KEY',
  base: 'https://api.anthropic.com/v1/messages',
  models: {
    'claude-sonnet-4-5': { id: 'claude-sonnet-4-5-20250929', max: 8192, in_usd: 3,  out_usd: 15 },
    'claude-haiku-4-5':  { id: 'claude-haiku-4-5-20251022',  max: 8192, in_usd: 1,  out_usd: 5  },
    'claude-opus-4-1':   { id: 'claude-opus-4-1-20250805',   max: 8192, in_usd: 15, out_usd: 75 },
  },
  async chat({ model, messages, system, max_tokens, temperature }){
    const key = process.env[this.envKey];
    if (!key) throw new Error('ANTHROPIC_API_KEY ausente');
    const m = this.models[model] || this.models['claude-sonnet-4-5'];
    let sys = system || '';
    const msgs = [];
    for (const x of (messages||[])){
      if (x.role === 'system'){ sys = (sys ? sys+'\n' : '') + x.content; }
      else msgs.push({ role: x.role === 'assistant' ? 'assistant' : 'user', content: String(x.content||'') });
    }
    const body = {
      model: m.id,
      max_tokens: Math.min(max_tokens || 1024, m.max),
      messages: msgs.length ? msgs : [{role:'user', content:'ping'}],
      ...(sys ? { system: sys } : {}),
      ...(typeof temperature === 'number' ? { temperature } : {}),
    };
    const t0 = Date.now();
    const r = await fetch(this.base, {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(()=>({}));
    if (!r.ok) throw new Error('anthropic '+r.status+': '+(j.error?.message||JSON.stringify(j).slice(0,200)));
    const text = (j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('');
    const ti = j.usage?.input_tokens||0, to = j.usage?.output_tokens||0;
    return { text, provider:'anthropic', model:m.id, tokens_in:ti, tokens_out:to,
             cost_usd:(ti*m.in_usd + to*m.out_usd)/1e6, latency_ms:Date.now()-t0, raw:j };
  }
};
// B43_ANTHROPIC_END


module.exports = { publicList, setKey, chat, test };

module.exports.anthropic = _b43Anthropic;

// B342M_LISTMODELS — descoberta de modelos por provider
async function listModels(id){
  const data = load();
  const key = (data[id]||{}).key;
  const ENDP = {
    groq:       { url:'https://api.groq.com/openai/v1/models',                hdr: k=>({Authorization:'Bearer '+k}) },
    openrouter: { url:'https://openrouter.ai/api/v1/models',                  hdr: k=>({Authorization:'Bearer '+k}) },
    cerebras:   { url:'https://api.cerebras.ai/v1/models',                    hdr: k=>({Authorization:'Bearer '+k}) },
    openai:     { url:'https://api.openai.com/v1/models',                     hdr: k=>({Authorization:'Bearer '+k}) },
    gemini:     { url: k=>`https://generativelanguage.googleapis.com/v1beta/models?key=${k}`, hdr: ()=>({}) },
    anthropic:  { url:'https://api.anthropic.com/v1/models',                  hdr: k=>({'x-api-key':k,'anthropic-version':'2023-06-01'}) }
  };
  const e = ENDP[id];
  if(!e) throw new Error('provider desconhecido: '+id);
  if(!key) throw new Error('sem chave configurada para '+id);
  const url = typeof e.url==='function' ? e.url(key) : e.url;
  const r = await fetch(url, { headers: e.hdr(key) });
  if(!r.ok){ const t=await r.text(); throw new Error('HTTP '+r.status+' '+t.slice(0,160)); }
  const j = await r.json();
  // normalizar: extrair {id, label, ctx?, free?}
  let arr = j.data || j.models || j || [];
  if(!Array.isArray(arr)) arr = [];
  const out = arr.map(m=>{
    const mid = m.id || m.name || m.model || '';
    return {
      id: String(mid).replace(/^models\//,''),
      ctx: m.context_length || m.context_window || m.contextWindow || null,
      free: /:free$/i.test(mid) || (m.pricing && Number(m.pricing.prompt)===0)
    };
  }).filter(x=>x.id);
  return { provider:id, total: out.length, models: out };
}
module.exports.listModels = listModels;
