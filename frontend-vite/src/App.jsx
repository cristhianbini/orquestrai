import React, { useState, useEffect, useRef } from "react";

// CTXVITE01: mesma lista de chaves que dashboard.html usa (oqAuthKeys()).
// Precisa ficar identica, senao o logout do dashboard nao limpa direito
// o que essa tela grava, ou vice-versa.
const AUTH_KEYS = ["oq_token", "token", "authToken", "jwt", "orq_jwt", "orquestrai_token", "OQ_TOKEN"];
function clearAuth() {
  try {
    AUTH_KEYS.forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
  } catch (e) {}
}

/*
 * OrquestrAI — tela de login (CTXVITE01)
 *
 * A peca de assinatura desta tela e o proprio checklist LAVE (Ler, Avaliar,
 * Verificar, Executar) -- o mesmo protocolo que guia toda operacao no
 * OrquestrAI, aqui visivel e animado em tempo real conforme o login avanca.
 * Nao e decoracao: cada etapa acende quando a etapa real do fluxo acontece.
 */

const BOOT_LINES = [
  "orquestrai-auth v0.12.0",
  "handshake com api.orquestrai...",
  "protocolo LAVE carregado",
];

// Estados possiveis de cada etapa do checklist
const STEP_LABEL = {
  L: "Ler credenciais",
  A: "Avaliar sessao",
  V: "Verificar 2FA",
  E: "Executar acesso",
};

function StepDot({ status }) {
  // pending: contorno cinza | active: pulso ciano | done: check verde | skip: risco ambar
  const base = "w-2.5 h-2.5 rounded-full border transition-all duration-300";
  if (status === "done") return <div className={base + " bg-green border-green"} />;
  if (status === "active") return <div className={base + " bg-cyan border-cyan animate-pulse"} />;
  if (status === "skip") return <div className={base + " bg-transparent border-amber"} />;
  return <div className={base + " bg-transparent border-line"} />;
}

function LaveChecklist({ steps }) {
  return (
    <div className="space-y-2.5">
      {Object.keys(STEP_LABEL).map((key) => {
        const status = steps[key];
        const textColor =
          status === "done" ? "text-green" :
          status === "active" ? "text-cyan" :
          status === "skip" ? "text-amber" : "text-muted";
        return (
          <div key={key} className="flex items-center gap-3">
            <StepDot status={status} />
            <span className="font-mono text-xs text-muted w-4">{key}</span>
            <span className={"font-sans text-sm " + textColor}>
              {STEP_LABEL[key]}
              {status === "skip" && <span className="text-xs ml-1">(nao requerido)</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  // CTXVITE01: replica o B30_LOGOUT_GUARD do index.html antigo -- ao
  // chegar aqui via logout() do dashboard (?logout=1), garante que
  // nenhum token velho sobra em nenhuma das chaves conhecidas.
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search || "");
    if (qs.has("logout")) {
      clearAuth();
      window.history.replaceState(null, "", "/index.html");
    }
  }, []);

  const [bootVisible, setBootVisible] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [need2fa, setNeed2fa] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState({ L: "pending", A: "pending", V: "pending", E: "pending" });
  const [loginDone, setLoginDone] = useState(false); // apenas para teste isolado (porta 5173)
  const codeInputRef = useRef(null);

  // Boot log entra linha a linha, tipo terminal ligando -- reforca a
  // sensacao de "sistema real" antes mesmo do formulario aparecer.
  useEffect(() => {
    if (bootVisible >= BOOT_LINES.length) return;
    const t = setTimeout(() => setBootVisible((n) => n + 1), 220);
    return () => clearTimeout(t);
  }, [bootVisible]);

  useEffect(() => {
    if (need2fa && codeInputRef.current) codeInputRef.current.focus();
  }, [need2fa]);

  function markLActiveIfIdle() {
    if (steps.L === "pending") setSteps((s) => ({ ...s, L: "active" }));
  }

  async function handleCredentialsSubmit(e) {
    e.preventDefault();
    setError("");
    setSteps((s) => ({ ...s, L: "done", A: "active" }));
    setLoading(true);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json().catch(() => ({}));

      if (r.ok && j.token) {
        // Sem 2FA configurado nesta conta: V e marcado como "nao requerido"
        setSteps((s) => ({ ...s, A: "done", V: "skip", E: "active" }));
        finishLogin(j.token, j.user);
        return;
      }

      if (j.need_totp) {
        setSteps((s) => ({ ...s, A: "done", V: "active" }));
        setNeed2fa(true);
        setLoading(false);
        return;
      }

      // Credenciais erradas: volta L pra pending, permite nova tentativa
      setSteps({ L: "pending", A: "pending", V: "pending", E: "pending" });
      setError(j.error || "Email ou senha incorretos.");
      setLoading(false);
    } catch (err) {
      setSteps({ L: "pending", A: "pending", V: "pending", E: "pending" });
      setError("Falha de conexao com o servidor.");
      setLoading(false);
    }
  }

  async function handleCodeSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, code }),
      });
      const j = await r.json().catch(() => ({}));

      if (r.ok && j.token) {
        setSteps((s) => ({ ...s, V: "done", E: "active" }));
        finishLogin(j.token, j.user);
        return;
      }

      setError(j.error || "Codigo 2FA invalido.");
      setCode("");
      setLoading(false);
    } catch (err) {
      setError("Falha de conexao com o servidor.");
      setLoading(false);
    }
  }

  function finishLogin(token, user) {
    // CTXVITE01: grava na chave principal que o dashboard le primeiro
    // (oqGetAuthToken() varre AUTH_KEYS em ordem, 'oq_token' e a 1a).
    localStorage.setItem("oq_token", token);
    if (user) localStorage.setItem("oq_user", JSON.stringify(user));
    setSteps((s) => ({ ...s, E: "done" }));
    // CTXVITE01: redirect real (/dashboard.html) so faz sentido quando esta
    // tela roda no MESMO dominio da producao -- em dev isolado (porta 5173)
    // nao existe dashboard.html nesse servidor, entao mostramos sucesso aqui
    // mesmo. Trocar para redirect real no dia do deploy (ver TODO_DEPLOY).
    // CTXVITE01: redirect real de producao (mesmo dominio -> funciona direto)
    setTimeout(() => { window.location.href = "/dashboard.html"; }, 450);
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* textura sutil de grid, so decorativa, opacidade muito baixa */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#7CFFB2 1px, transparent 1px), linear-gradient(90deg, #7CFFB2 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-3xl grid md:grid-cols-2 gap-0 border border-line rounded-lg overflow-hidden bg-panel shadow-2xl">
        {/* Lado esquerdo: boot log + logo + checklist LAVE */}
        <div className="p-8 border-b md:border-b-0 md:border-r border-line flex flex-col justify-between">
          <div>
            <div className="font-mono text-xs text-muted space-y-1 mb-8 min-h-[60px]">
              {BOOT_LINES.slice(0, bootVisible).map((line, i) => (
                <div key={i} className="fade-up">
                  <span className="text-green">$</span> {line}
                </div>
              ))}
            </div>

            <h1 className="font-mono text-2xl text-green font-bold tracking-tight">
              Orquestr<span className="text-cyan">AI</span>
            </h1>
            <p className="font-sans text-sm text-muted mt-1">
              Cockpit de auditoria e orquestracao de agentes
            </p>
          </div>

          <div className="mt-10">
            <p className="font-mono text-[11px] text-muted uppercase tracking-wider mb-4">
              Protocolo de acesso
            </p>
            <LaveChecklist steps={steps} />
          </div>
        </div>

        {/* Lado direito: formulario */}
        <div className="p-8 flex flex-col justify-center">
          {loginDone ? (
            <div className="text-center">
              <div className="text-green text-4xl mb-3">✓</div>
              <p className="font-sans text-lg text-green font-semibold">Login realizado com sucesso</p>
              <p className="font-sans text-sm text-muted mt-2">
                (teste isolado -- em producao redireciona direto pro dashboard)
              </p>
            </div>
          ) : !need2fa ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="font-sans text-xs text-muted block mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); markLActiveIfIdle(); }}
                  className="w-full bg-bg border border-line rounded px-3 py-2.5 text-sm font-sans text-green
                             focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors"
                  placeholder="voce@empresa.com"
                />
              </div>
              <div>
                <label className="font-sans text-xs text-muted block mb-1.5">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); markLActiveIfIdle(); }}
                  className="w-full bg-bg border border-line rounded px-3 py-2.5 text-sm font-sans text-green
                             focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="font-sans text-sm text-err bg-err/10 border border-err/30 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green text-bg font-sans font-semibold text-sm rounded py-2.5
                           hover:bg-green/90 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loading ? "Validando..." : "Entrar"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <p className="font-sans text-sm text-cyan mb-1">Verificacao em duas etapas</p>
                <p className="font-sans text-xs text-muted mb-4">
                  Digite o codigo de 6 digitos do seu app autenticador.
                </p>
                <input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-bg border border-line rounded px-3 py-2.5 text-lg font-mono text-center
                             tracking-[0.4em] text-cyan focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan"
                  placeholder="000000"
                />
              </div>

              {error && (
                <div className="font-sans text-sm text-err bg-err/10 border border-err/30 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-green text-bg font-sans font-semibold text-sm rounded py-2.5
                           hover:bg-green/90 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loading ? "Verificando..." : "Confirmar codigo"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
