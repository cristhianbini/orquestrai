import React from "react";
import ReactDOM from "react-dom/client";
import AgentPanel from "./components/AgentPanel.jsx";
import "./index.css";

// CTXVITE02: entrypoint isolado para montar o AgentPanel dentro do
// dashboard.html legado, sem virar SPA completa -- "React island".
function mount(elementId) {
  const el = document.getElementById(elementId);
  if (!el) { console.error("[AgentPanel Island] elemento nao encontrado:", elementId); return; }
  ReactDOM.createRoot(el).render(<AgentPanel />);
}

window.OrquestrAIAgentPanel = { mount };
