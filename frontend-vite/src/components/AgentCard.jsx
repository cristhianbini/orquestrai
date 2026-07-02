// AgentCard.jsx — R6-08
// Extraido do AgentPanel (antes tudo inline). Card de um agente: status,
// modelo, tokens, custo, score. Visual identico ao anterior (spotlight,
// ScoreMeter, badges) -- so reorganizado em arquivo proprio, reutilizavel.

import React from 'react';

const STATUS_STYLE = {
  idle:    { label: 'aguardando', badge: 'text-muted border border-line' },
  running: { label: 'executando', badge: 'text-cyan border border-cyan/50 bg-cyan/10 animate-pulse' },
  done:    { label: 'concluido',  badge: 'text-green border border-green/40 bg-green/10' },
  error:   { label: 'erro',       badge: 'text-white border border-err bg-err/80 animate-pulse font-bold' },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] || STATUS_STYLE.idle;
  return <span className={'text-[10px] px-2 py-0.5 rounded-full shrink-0 ' + style.badge}>{style.label}</span>;
}

function fmtTokens(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

const SCORE_BARS = 10;
// Medidor tipo equalizador: barras acendem (verde->vermelho por posicao) ate
// o ponto do score. score=null -> tudo apagado (honesto, sem inventar numero).
function ScoreMeter({ score }) {
  const activeCount = score == null ? 0 : Math.round((Math.max(0, Math.min(100, score)) / 100) * SCORE_BARS);
  return (
    <div className="flex items-end gap-[3px] h-4" title={score == null ? 'sem dados ainda' : score + '/100'}>
      {Array.from({ length: SCORE_BARS }).map((_, i) => {
        const isActive = i < activeCount;
        const hue = 140 - (i / (SCORE_BARS - 1)) * 140;
        const heightPct = 32 + (i / (SCORE_BARS - 1)) * 68;
        return (
          <div key={i} className="w-[3px] rounded-full transition-all ease-out"
            style={{
              height: heightPct + '%',
              backgroundColor: isActive ? `hsl(${hue}, 75%, 55%)` : 'rgba(255,255,255,0.09)',
              boxShadow: isActive ? `0 0 5px hsl(${hue}, 75%, 55%)` : 'none',
              transitionDuration: '420ms', transitionDelay: (i * 25) + 'ms',
            }} />
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

export default function AgentCard({ agent, live }) {
  const status = (live && live.status) || 'idle';
  const tokens = live && (live.tokens_in || live.tokens_out)
    ? (live.tokens_in || 0) + (live.tokens_out || 0) : null;
  const cost = live && live.cost_usd;
  const hasCost = cost != null;
  const isFree = hasCost && cost <= 0;

  const spotlight =
    status === 'running' ? 'border-cyan shadow-[0_0_22px_rgba(56,189,248,0.65)] scale-[1.035] animate-agent-pulse-cyan' :
    status === 'error'   ? 'border-err shadow-[0_0_22px_rgba(248,113,113,0.65)] animate-agent-pulse-err' :
    'border-line';

  return (
    <div className={'border rounded-md p-3 bg-panel space-y-1.5 transition-all duration-500 ' + spotlight}>
      <div className="flex items-center gap-2 mb-1">
        <span className={'w-2 h-2 rounded-full ' + agent.dot} />
        <span className="font-mono text-xs font-bold text-green">{agent.nome}</span>
        <span className="ml-auto"><StatusBadge status={status} /></span>
      </div>
      <CardRow label="Modelo"><span className="text-cyan">{(live && live.model) || '—'}</span></CardRow>
      <CardRow label="Funcao"><span className="text-white/80">{agent.funcao}</span></CardRow>
      <CardRow label="Tokens"><span className="text-white/80">{fmtTokens(tokens)}</span></CardRow>
      <CardRow label="Custo">
        {!hasCost ? <span className="text-muted">—</span>
          : isFree ? <span className="text-green">FREE</span>
          : <span className="text-amber">PAGO · ${cost.toFixed(6)}</span>}
      </CardRow>
      <CardRow label="Score">
        <div className="flex items-center gap-2">
          <ScoreMeter score={live && live.score} />
          {(live && live.score) == null && <span className="text-muted text-[10px]">sem dados</span>}
        </div>
      </CardRow>
    </div>
  );
}
