import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import AgentPanel, { ScoreMeterDemo } from "./components/AgentPanel.jsx";
import "./index.css";

// CTXVITE02: rota temporaria de preview, so existe enquanto o painel de
// agentes esta sendo construido isolado. "/" continua sendo o login real
// (producao) -- essa rota extra nao afeta em nada quem acessa a raiz.
function PreviewAgents() {
  return (
    <div className="min-h-screen bg-bg p-8">
      <p className="font-mono text-xs text-muted mb-4">
        [PREVIEW CTXVITE02 -- dispare um run do MAS no dashboard antigo para ver os cards reagirem]
      </p>
      <AgentPanel />
      <div className="mt-6 max-w-md"><ScoreMeterDemo /></div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {/* CTXVITE01-FIX4: dashboard.html:1393 e outros guards legados fazem
            window.location.replace('/index.html') -- navegacao de pagina
            inteira, nao roteamento interno. O router precisa reconhecer
            esse caminho tambem, senao cai em "No routes matched" (tela
            preta). Mesma tela de login em ambos os enderecos. */}
        <Route path="/index.html" element={<App />} />
        <Route path="/preview-agents" element={<PreviewAgents />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
