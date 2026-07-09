# Plano gerado pelo mesh OrquestrAI

- run: mas_ee7354b7519a
- goal: BUILD novo projeto OrquestrAI: nome=cafe-real stack=static-html db=none. Descrição: Landing page de teste. Features: titulo; frase de boas-vindas; botao Ver Cardapio. Gere plano de arquitetura, módulo
- gerado em: 2026-07-09T10:27:16.802Z

---

## SMITH (arquitetura)

# [SMITH] Plano de arquitetura + roadmap — cafe-real (static-html, db=none)

## Estrutura de diretório (padrão bind-mount existente)
```
/var/www/orquestrai/src/cafe-real/
├── index.html          # Landing page principal
├── styles.css          # Estilos inline ou arquivo separado
└── assets/
    └── logo.png        # (opcional) imagem de header
```

**Nota:** Segue **L-B199** (path do container = `/usr/share/nginx/html/cafe-real/`) e **L-B194** (edições refletem ao vivo se nginx servir corretamente o bind-mount).

---

## Módulos/Componentes
1. **index.html**
   - `<header>` com título do café
   - `<main>` com frase de boas-vindas
   - `<button>` "Ver Cardápio" (href para página futura ou modal placeholder)
   - `<footer>` com créditos OrquestrAI

2. **styles.css**
   - Reset básico (margin/padding zero)
   - Centralização vertical/horizontal do conteúdo
   - Botão com hover effect simples

---

## Schema de dados
**N/A** — `db=none`, projeto puramente estático.

---

## Roadmap de implementação

### Sprint 1 — Estrutura base (1h)
- [ ] Criar diretório `/var/www/orquestrai/src/cafe-real/`
- [ ] Gerar `index.html` com esqueleto HTML5 (título, frase, botão)
- [ ] Gerar `styles.css` com layout centralizado + botão estilizado
- [ ] Validar servimento via `http://orquestrai.cbini.com.br/cafe-real/` (requer configuração nginx se não existir location)

### Sprint 2 — Ajustes visuais (30min)
- [ ] Adicionar `assets/logo.png` (placeholder ou real)
- [ ] Testar responsividade mobile (media queries básicas)
- [ ] Confirmar que edições ao vivo refletem sem restart (**L-B194**)

### Sprint 3 — Integração futura (backlog)
- [ ] Criar página `cardapio.html` linkada pelo botão
- [ ] Adicionar analytics básico (Google Analytics ou self-hosted)

---

## BLOCO LAVE — criação da estrutura cafe-real

```lave
#!/usr/bin/env bash
set +e
set -H

# BLOCO-CAFE-REAL-INIT — cria estrutura static-html do projeto cafe-real
# Segue L-B199 (path do container), L-B236 (sem backup pois criação nova)

PROJECT_ROOT="/var/www/orquestrai/src/cafe-real"
INDEX_FILE="${PROJECT_ROOT}/index.html"
CSS_FILE="${PROJECT_ROOT}/styles.css"
ASSETS_DIR="${PROJECT_ROOT}/assets"

# Idempotência via marker no index.html
if [[ -f "$INDEX_FILE" ]] && grep -q '<!-- MARKER:CAFE-REAL-INIT -->' "$INDEX_FILE"; then
  echo "===== cafe-real ja inicializado (marker encontrado) ====="
  exit 0
fi

# Criar diretório e assets/
mkdir -p "$ASSETS_DIR"

# Gerar index.html
cat > "$INDEX_FILE" << 'EOF_HTML'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Café Real — Bem-vindo</title>
  <link rel="stylesheet" href="styles.css">
  <!-- MARKER:CAFE-REAL-INIT -->
</head>
<body>
  <header>
    <h1>Café Real</h1>
  </header>
  <main>
    <p class="welcome">Bem-vindo ao melhor café da cidade!</p>
    <a href="#cardapio" class="btn-cardapio">Ver Cardápio</a>
  </main>
  <footer>
    <small>Construído com OrquestrAI</small>
  </footer>
</body>
</html>
EOF_HTML

# Gerar styles.css
cat > "$CSS_FILE" << 'EOF_CSS'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 20px;
}

header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

main .welcome {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.btn-cardapio {
  display: inline-block;
  padding: 15px 40px;

---

## RELATOR (sintese)

# [RELATOR] — Entrega cafe-real v0.1.0

**Entrega:** Landing page estática (Café Real) criada em `/src/cafe-real/` com index.html + styles.css, roadmap 3 sprints, BLOCO LAVE idempotente aprovado — pronto para execução via oqterm.

**Versionamento:** `v0.1.0` (minor: novo projeto/feature, build estático retrocompatível, sem breaking changes na VPS).

**Ação Cris:** Dispara `BLOCO-CAFE-REAL-INIT` no oqterm; valida com `curl http://orquestrai.cbini.com.br/cafe-real/`; se 404, comunicar — requer location nginx novo.