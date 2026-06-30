---
tipo: bloco-lave
id: BLOCO-36
title: "CI/CD pipeline"
sha256: b7a6bf15f413c70f60fbef090fc8f006a7a02170439a1712656c0c09ca4d496a
created: 2026-06-23T03:25:30.402Z
---

# BLOCO-36 - CI/CD pipeline

## Script
~~~bash
# CI/CD pipeline
npm run test:auth -- --algo=sha256

# Critério de aprovação:
# - ✅ Todas as requisições com token válido (SHA-256) retornam 200
# - ✅ Requisições com token inválido/expirado retornam 401/403
# - ✅ Backward compatibility: tokens legados (SHA-1) recusados com erro 403
# - ❌ Build FALHA se qualquer teste acima não passar
~~~
