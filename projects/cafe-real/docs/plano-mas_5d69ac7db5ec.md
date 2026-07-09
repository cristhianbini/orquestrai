# Plano gerado pelo mesh OrquestrAI

- run: mas_5d69ac7db5ec
- goal: BUILD novo projeto OrquestrAI: nome=cafe-real stack=static-html db=none. Descrição: Landing page de teste do CTXPROJRUN02, disparada direto via terminal para depuracao. Features: titulo; frase de boas
- gerado em: 2026-07-09T10:11:21.043Z

---

## SMITH (arquitetura)

# PLANO DE ARQUITETURA: cafe-real

## 1. Visão Geral
- **Nome**: cafe-real
- **Stack**: HTML estático puro + CSS + JS vanilla
- **DB**: nenhum
- **Propósito**: Landing page de teste do CTXPROJRUN02, disparada via terminal

## 2. Estrutura de Diretórios
```
/var/www/orquestrai/
└── projects/
    └── cafe-real/
        ├── public/              # servido pelo NGINX
        │   ├── index.html       # página principal
        │   ├── cardapio.html    # placeholder
        │   └── assets/
        │       └── style.css    # estilos básicos
        └── README.md            # instruções de deploy
```

## 3. Módulos

### 3.1 index.html
- Título "Café Real"
- Frase de boas-vindas
- Botão "Ver Cardápio" → link para `/cafe-real/cardapio.html`

### 3.2 cardapio.html
- Página placeholder (futura expansão)

### 3.3 assets/style.css
- Reset básico
- Centralização de conteúdo
- Estilo do botão

### 3.4 NGINX config
- Location `/cafe-real/` → alias para bind-mount
- Path DO CONTAINER: `/usr/share/nginx/html/cafe-real/` (L-B199)

## 4. Schema DB
**N/A** — projeto sem banco de dados.

## 5. Roadmap

### Sprint 0: Preparação (READ-ONLY audit)
- [ ] Verificar estrutura existente de `projects/`
- [ ] Confirmar bind-mount atual do container orquestrai-web
- [ ] Listar configurações NGINX atuais

### Sprint 1: Criação de Estrutura
- [ ] Criar diretório `projects/cafe-real/public/`
- [ ] Criar subdiretório `assets/`
- [ ] Criar README.md com instruções

### Sprint 2: Conteúdo Estático
- [ ] Escrever `index.html` (título + boas-vindas + botão)
- [ ] Escrever `cardapio.html` (placeholder)
- [ ] Escrever `style.css` (estilos básicos)

### Sprint 3: Configuração NGINX
- [ ] Backup de `nginx/conf.d/orquestrai.conf` (L-B236)
- [ ] Adicionar location `/cafe-real/` com alias correto (path do container, L-B199)
- [ ] Validar com `nginx -t`

### Sprint 4: Docker Volume
- [ ] Adicionar volume no `docker-compose.yml`:
  ```yaml
  volumes:
    - ./projects/cafe-real/public:/usr/share/nginx/html/cafe-real:ro
  ```
- [ ] Aplicar com `docker compose up -d` (L-B194)

### Sprint 5: Validação
- [ ] Teste local: `curl http://localhost/cafe-real/`
- [ ] Teste produção: `curl http://orquestrai.cbini.com.br/cafe-real/`
- [ ] Validar HTML com `tidy -e`

### Sprint 6: Documentação
- [ ] Atualizar KB com lição BLOCO-cafe-real-setup
- [ ] Registrar processo no README.md do projeto

---

## 6. Riscos e Mitigações

| Risco | Mitigação | Lição KB |
|-------|-----------|----------|
| Path errado no nginx alias | Usar path DO CONTAINER (`/usr/share/nginx/html/...`) | L-B199 |
| Bind-mount não reflete edições | `docker compose up -d` após adicionar volume | L-B194 |
| Quebra de configuração NGINX | Backup .bak antes de editar + `nginx -t` | L-B236 |
| Sed com sintaxe problemática | Usar Python para patches destrutivos | L-B235 |

---

## 7. Checklist de Execução (READ-ONLY primeiro)

```lave
#!/usr/bin/env bash
set +e; set -H

# Auditoria inicial da estrutura de projetos
cd /var/www/orquestrai

echo "===== ESTRUTURA ATUAL DE PROJECTS ====="
ls -la projects/ 2>/dev/null || echo "Diretório projects/ não existe"

echo ""
echo "===== BIND-MOUNTS DO CONTAINER WEB ====="
docker inspect orquestrai-web --format '{{range .Mounts}}{{.Source}} -> {{.Destination}} ({{.Mode}}){{"\n"}}{{end}}'

echo ""
echo "===== LOCATIONS NGINX ATUAIS ====="
docker exec orquestrai-proxy grep -n "location.*{" /etc/nginx/conf.d/*.conf | head -20

echo ""
echo "===== VOLUMES NO DOCKER-COMPOSE ====="
grep -A5 "orquestrai-web:" docker-compose.yml | grep -A3 "volumes:"

echo "===== fim BLOCO-cafe-real-audit ====="
```

---

## RELATOR (sintese)

# [RELATOR] — cafe-real v0.1.0

**Entrega:** Plano completo (arquitetura, 6 sprints, roadmap) para landing page estática `cafe-real` disparável via terminal, pronto para execução pelo Ferreiro a partir de Sprint 1.

**Versão:** `v0.1.0` (patch=0 porque é novo projeto, sem breaking changes; minor=1 porque é primeira feature completa; major=0 porque é POC isolado, não toca core do OrquestrAI).

**Próximo passo:** Scout executa BLOCO-cafe-real-audit (read-only) para confirmar estrutura host antes de Ferreiro criar diretórios.