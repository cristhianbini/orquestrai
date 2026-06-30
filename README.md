# 🎯 OrquestrAI

**Cockpit multi-IA self-hosted** — controle total sobre seus agentes de inteligência artificial, seus dados e sua infraestrutura.

> *"Seus dados. Sua infraestrutura. Seus agentes."*

[![versao](https://img.shields.io/badge/versão-v0.3.0-7c3aed?style=flat-square)](https://github.com/cristhianbini/orquestrai/releases)
[![stack](https://img.shields.io/badge/stack-Node.js%20%7C%20SQLite%20%7C%20Docker-22c55e?style=flat-square)]()
[![licença](https://img.shields.io/badge/licença-privado-ef4444?style=flat-square)]()

---

## O que é

O OrquestrAI é um cockpit de inteligência artificial **self-hosted**, desenvolvido pela [CBini Soluções em TI](https://cbini.com.br), que permite orquestrar múltiplos modelos de IA (Claude, Gemini, GPT, Groq, DeepSeek, ZAI e outros) a partir de uma única interface, sem depender de plataformas externas.

**Para quem não quer mandar segredo de empresa para ferramentas na nuvem.**

---

## ✨ Funcionalidades

| Funcionalidade | Status |
|---|---|
| Chat individual com memória persistente | ✅ v0.3.0 |
| Modo MAS (Multi-Agent System) — 8 agentes colaborando | ✅ v0.3.0 |
| Memória entre sessões e entre runs do MAS | ✅ v0.3.0 |
| Terminal web integrado à VPS | ✅ |
| Protocolo LAVE (Ler → Avaliar → Verificar → Executar) | ✅ |
| Catálogo de modelos com filtros FREE/contexto | ✅ v0.3.0 |
| Gestão de providers e chaves de API | ✅ v0.3.0 |
| Time de agentes configurável (escalação 11+15) | 🔄 v0.4 |
| RAG com base de conhecimento local | 📋 v0.5 |
| Voz on-premise (Whisper + Piper) | 📋 v0.6 |
| Multi-tenant + billing | 📋 v1.0 |

---

## 🏗️ Arquitetura
┌─────────────────────────────────────────────────────┐
│                    VPS Ubuntu 24.04                  │
│                                                      │
│  ┌──────────────┐   ┌──────────────┐                │
│  │ orquestrai   │   │ orquestrai   │                │
│  │ -proxy       │   │ -web         │                │
│  │ (nginx+SSL)  │   │ (nginx static│                │
│  │ porta 443    │   │  dashboard)  │                │
│  └──────┬───────┘   └──────────────┘                │
│         │                                            │
│  ┌──────▼───────────────────────────────────────┐   │
│  │ orquestrai-api (Node.js + Express, porta 3000)│   │
│  │  ├── /api/chat        (providers externos)    │   │
│  │  ├── /api/mas/run     (pipeline MAS)          │   │
│  │  ├── /api/conversations (memória SQLite)      │   │
│  │  ├── /api/providers   (gestão de chaves)      │   │
│  │  └── /api/blocos      (executor LAVE)         │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Dados: /var/www/orquestrai/data/*.sqlite            │
│  Knowledge: /var/www/orquestrai/knowledge/           │
└─────────────────────────────────────────────────────┘
---

## 🤖 Time de Agentes (MAS)

O OrquestrAI opera com um time fixo de agentes especializados, inspirado numa escalação de futebol:

| # | Posição | Função | Modelo padrão |
|---|---|---|---|
| 1 | **BATEDOR** | Varredura rápida e inicial | claude-haiku-4-5 |
| 2 | **AUDITOR** | Análise detalhada e revisão | llama-3.3-70b |
| 3 | **DETETIVE** | Investigação e correlação | claude-sonnet-4-5 |
| 4 | **ARQUITETO** | Arquitetura e estruturação | claude-sonnet-4-5 |
| 5 | **GUARDIÃO** | Proteção e validação LAVE | claude-haiku-4-5 |
| 6 | **MEMORIALISTA** | Registro de memórias e lições | zai-glm-4.7 |
| 7 | **RELATOR** | Relatórios e sínteses | claude-haiku-4-5 |
| 8 | **METRICO** | Métricas e monitoramento | llama-3.3-70b |
| 9 | **REVISOR** | Revisão de qualidade final | claude-opus-4-8 |
| 10 | *(vago)* | Testador | — |
| 11 | *(vago)* | Publicador | — |

> Capacidade total do elenco: **11 titulares + 15 reservas = 26 agentes**

---

## 🛡️ Protocolo LAVE

Toda execução automática passa pelo protocolo LAVE:
L — Ler:      Analisa contexto, código e instruções
A — Avaliar:  Identifica riscos, dependências, alternativas
V — Verificar: Valida consistência, segurança, impacto
E — Executar: Só após L+A+V concluídos
Nenhum comando é executado na VPS sem aprovação humana explícita.

---

## 🚀 Instalação rápida

### Pré-requisitos
- Ubuntu 24.04 LTS
- Docker + Docker Compose
- Domínio com DNS apontado para o servidor

### Deploy

```bash
git clone https://github.com/cristhianbini/orquestrai.git
cd orquestrai
cp .env.example .env
# edite .env com suas configurações
docker compose up -d
```

Acesse: `https://seu-dominio.com.br`

---

## 🔧 Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | Node.js 22 + Express 5 |
| Banco de dados | SQLite (better-sqlite3) |
| Frontend | HTML + Tailwind CSS (vanilla JS) |
| Infraestrutura | Docker Compose + nginx + Let's Encrypt |
| Versionamento | Git + SemVer (bump-version.sh) |
| Providers | Anthropic, OpenAI, Google Gemini, Groq, DeepSeek, ZAI, Cerebras, OpenRouter |

---

## 📋 Roadmap

| Release | Foco | Status |
|---|---|---|
| v0.1.x | Fundação: chat, MAS, Docker, SSL | ✅ |
| v0.2.0 | Memória persistente (individual + MAS) | ✅ |
| v0.3.0 | Catálogo de modelos, time de agentes, segurança | ✅ |
| v0.4 | Loops (paralelo, sequencial, ReAct), guardrails | 🔄 |
| v0.5 | RAG + knowledge base indexada | 📋 |
| v0.6 | JARVIS: voz on-premise (Whisper + Piper) | 📋 |
| v1.0 | GA: multi-tenant, billing, LGPD | 📋 |

---

## 🏢 Sobre

Desenvolvido por **Cristhian Bini** — [CBini Soluções em TI](https://cbini.com.br) / Createc Soluções Tecnológicas
Campo Largo, PR, Brasil

---

*OrquestrAI — Porque seus dados devem ficar com você.*
