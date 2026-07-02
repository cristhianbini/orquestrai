import React, { useState, useEffect, useRef } from "react";

/*
 * OrquestrAI — painel de agentes MAS (CTXVITE02)
 *
 * Substitui o mecanismo antigo de dashboard.html que interceptava
 * window.EventSource duas vezes em camadas (B332 + B334) so para
 * recalcular custo em paralelo. Aqui e um unico EventSource nativo,
 * sem interceptacao -- mais simples, mais facil de debugar.
 */

// Mapa fixo dos 9 agentes do pipeline MAS. Ordem = ordem real de execucao
// (mas/agents.mjs, array AGENTS). Cores seguem a paleta ja usada no
// dashboard antigo, para nao quebrar a identidade visual entre as telas.
const AGENTS = [
  { id: "scout",        nome: "BATEDOR",      funcao: "Varredura rapida e inicial",     dot: "bg-cyan" },
  { id: "auditor",      nome: "AUDITOR",      funcao: "Analise detalhada e revisao",    dot: "bg-purple-400" },
  { id: "detetive",     nome: "DETETIVE",     funcao: "Investigacao e correlacao",      dot: "bg-cyan" },
  { id: "smith",        nome: "ARQUITETO",    funcao: "Arquitetura e estruturacao",     dot: "bg-amber" },
  { id: "guardian",     nome: "GUARDIAO",     funcao: "Protecao e validacao",           dot: "bg-green" },
  { id: "memorialista", nome: "MEMORIALISTA", funcao: "Registro de memorias",           dot: "bg-pink-400" },
  { id: "rel",          nome: "RELATOR",      funcao: "Relatorios e sinteses",          dot: "bg-cyan" },
  { id: "metrico",      nome: "METRICO",      funcao: "Metricas e monitoramento",       dot: "bg-gray-400" },
  { id: "revisor",      nome: "REVISOR",      funcao: "Revisao final de qualidade",     dot: "bg-purple-400" },
];

// Selo de status: idle e done ficam quietos, running pisca (trabalho em
// andamento), error tem destaque forte (fundo solido + pulso) -- e o
// unico estado que precisa "gritar" para o operador olhar rapido.
const STATUS_STYLE = {
  idle:    { label: "aguardando",  badge: "text-muted border border-line" },
  running: { label: "executando",  badge: "text-cyan border border-cyan/50 bg-cyan/10 animate-pulse" },
  done:    { label: "concluido",   badge: "text-green border border-green/40 bg-green/10" },
  error:   { label: "erro",        badge: "text-white border border-err bg-err/80 animate-pulse font-bold" },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLE[status];
  return (
    <span className={"text-[10px] px-2 py-0.5 rounded-full shrink-0 " + style.badge}>
      {style.label}
    </span>
  );
}

// Formata tokens no mesmo estilo compacto do dashboard antigo (4.1k, nao 4142)
function fmtTokens(n) {
  if (n == null) return "—";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

// Uma linha "Rotulo: valor" -- mesmo padrao visual do dashboard.html antigo,
// so que reutilizavel como componente em vez de string HTML repetida.
/*
 * ScoreMeter -- medidor de score em barras tipo equalizador de audio.
 * 10 barras crescentes (esquerda->direita), cada uma com uma cor fixa
 * no degrade verde->amarelo->vermelho conforme sua POSICAO (nao o valor).
 * As barras "acendem" (cor + brilho) ate o ponto que o score alcanca;
 * o resto fica apagado/cinza. score=null -> tudo apagado (sem dado real
 * ainda, honesto em vez de inventar numero). Entrada com leve atraso
 * escalonado por barra, para dar sensacao de "carregando/calibrando".
 */
const SCORE_BARS = 10;

function ScoreMeter({ score }) {
  const activeCount = score == null ? 0 : Math.round((Math.max(0, Math.min(100, score)) / 100) * SCORE_BARS);

  return (
    <div className="flex items-end gap-[3px] h-4" title={score == null ? "sem dados ainda" : score + "/100"}>
      {Array.from({ length: SCORE_BARS }).map((_, i) => {
        const isActive = i < activeCount;
        const hue = 140 - (i / (SCORE_BARS - 1)) * 140; // 140=verde .. 0=vermelho
        const heightPct = 32 + (i / (SCORE_BARS - 1)) * 68; // escada crescente
        return (
          <div
            key={i}
            className="w-[3px] rounded-full transition-all ease-out"
            style={{
              height: heightPct + "%",
              backgroundColor: isActive ? `hsl(${hue}, 75%, 55%)` : "rgba(255,255,255,0.09)",
              boxShadow: isActive ? `0 0 5px hsl(${hue}, 75%, 55%)` : "none",
              transitionDuration: "420ms",
              transitionDelay: (i * 25) + "ms",
            }}
          />
        );
      })}
    </div>
  );
}

function CardRow({ label, children }) {
  return (
    <div className="flex items-baseline gap-1.5 text-[11px] font-sans">
      <span className="text-muted shrink-0">{label}:</span>
      <span className="truncate">{children}</span>
    </div>
  );
}

function AgentCard({ agent, live }) {
  const status = (live && live.status) || "idle";
  const tokens = live && (live.tokens_in || live.tokens_out)
    ? (live.tokens_in || 0) + (live.tokens_out || 0)
    : null;
  const cost = live && live.cost_usd;
  const hasCost = cost != null;
  const isFree = hasCost && cost <= 0;

  return (
    <div className="border border-line rounded-md p-3 bg-panel space-y-1.5">
      <div className="flex items-center gap-2 mb-1">
        <span className={"w-2 h-2 rounded-full " + agent.dot} />
        <span className="font-mono text-xs font-bold text-green">{agent.nome}</span>
        <span className="ml-auto">
          <StatusBadge status={status} />
        </span>
      </div>

      <CardRow label="Modelo">
        <span className="text-cyan">{(live && live.model) || "—"}</span>
      </CardRow>
      <CardRow label="Funcao">
        <span className="text-white/80">{agent.funcao}</span>
      </CardRow>
      <CardRow label="Tokens">
        <span className="text-white/80">{fmtTokens(tokens)}</span>
      </CardRow>
      <CardRow label="Custo">
        {!hasCost ? (
          <span className="text-muted">—</span>
        ) : isFree ? (
          <span className="text-green">FREE</span>
        ) : (
          <span className="text-amber">PAGO · ${cost.toFixed(6)}</span>
        )}
      </CardRow>
      <CardRow label="Score">
        {/* CTXAGENTSCORE01: pendente de CTXUNIFY01. score=undefined hoje
            -> ScoreMeter renderiza tudo apagado, honesto sem inventar numero. */}
        <div className="flex items-center gap-2">
          <ScoreMeter score={live && live.score} />
          {(live && live.score) == null && <span className="text-muted text-[10px]">sem dados</span>}
        </div>
      </CardRow>
    </div>
  );
}

// Demo isolado -- SO usado na tela de preview, para visualizar o
// ScoreMeter com numeros de exemplo. Nunca importado pelo componente
// real (AgentPanel), que so mostra score quando o dado vier de verdade.
export function ScoreMeterDemo() {
  const exemplos = [92, 74, 51, 28, 8];
  return (
    <div className="flex flex-col gap-3 p-4 border border-line rounded-md bg-panel">
      <p className="font-mono text-[11px] text-muted">ScoreMeter -- exemplos (demo, nao e dado real)</p>
      {exemplos.map((s) => (
        <div key={s} className="flex items-center gap-3">
          <ScoreMeter score={s} />
          <span className="font-mono text-xs text-white/70 w-10">{s}/100</span>
        </div>
      ))}
    </div>
  );
}

export default function AgentPanel() {
  // Estado por agente: { [agentId]: { status, model, tokens_in, tokens_out, cost_usd } }
  const [liveData, setLiveData] = useState({});
  const esRef = useRef(null);

  useEffect(() => {
    // Busca o run mais recente para se conectar automaticamente (mesmo
    // comportamento do dashboard antigo: reconecta ao ultimo run ativo).
    fetch("/api/mas/last", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const runId = j && (j.run_id || j.id || j.runId || (j.run && (j.run.id || j.run.run_id)));
        if (runId) connect(runId);
      })
      .catch(() => {});

    return () => { if (esRef.current) esRef.current.close(); };
  }, []);

  function connect(runId) {
    if (esRef.current) esRef.current.close();
    const es = new EventSource("/api/mas/events/" + encodeURIComponent(runId));
    esRef.current = es;

    es.onmessage = (msg) => {
      try {
        const ev = JSON.parse(msg.data);
        if (!ev || !ev.agent) return;

        setLiveData((prev) => {
          const cur = prev[ev.agent] || {};
          let status = cur.status || "idle";
          if (ev.type === "agent.start") status = "running";
          if (ev.type === "agent.done") status = "done";
          if (ev.type === "agent.error") status = "error";

          return {
            ...prev,
            [ev.agent]: {
              ...cur,
              status,
              model: ev.model || cur.model,
              tokens_in: ev.tokens_in != null ? ev.tokens_in : cur.tokens_in,
              tokens_out: ev.tokens_out != null ? ev.tokens_out : cur.tokens_out,
              cost_usd: ev.cost_usd != null ? ev.cost_usd : cur.cost_usd,
            },
          };
        });
      } catch (e) {}
    };
  }

  return (
    <div // CTXVITE02-FIX: grid fixo em 1 coluna, sempre. O breakpoint md: do
      // Tailwind reage a largura da JANELA, nao do container -- esse painel
      // vive numa <aside> lateral estreita (~300px) independente do tamanho
      // da tela, entao "responsivo por viewport" aqui so causava compressao.
      className="grid grid-cols-1 gap-3">
      {AGENTS.map((agent) => (
        <AgentCard key={agent.id} agent={agent} live={liveData[agent.id]} />
      ))}
    </div>
  );
}
