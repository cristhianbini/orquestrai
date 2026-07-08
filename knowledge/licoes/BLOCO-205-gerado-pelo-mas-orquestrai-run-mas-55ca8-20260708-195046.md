---
tipo: licao-automatica
bloco: BLOCO-205
title: "Auto: Gerado pelo MAS (OrquestrAI) -- run mas_55ca822c7301 -- revise antes de executar"
sha256: 661c97ebd3566b4aeef831967b28fe5ab4e217d4e6a58ecb46901f4cfe9fa3cf
created: 2026-07-08T19:50:46.109Z
---

# BLOCO-205 - Gerado pelo MAS (OrquestrAI) -- run mas_55ca822c7301 -- revise antes de executar

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
# Gerado pelo MAS (OrquestrAI) -- run mas_55ca822c7301 -- revise antes de executar
name raiz: -oP extrai só o valor; head -1 garante o PRIMEIRO match,
que no topo do arquivo é o name do projeto, não de subdependência.
services reais via awk — grep -A/-oP falha em YAML aninhado (BLOCO-204).
runtime real: prefixo dos containers ativos = COMPOSE_PROJECT_NAME,
a fonte mais "verdadeira" (pode divergir do branding).
~~~
