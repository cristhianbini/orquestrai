---
projeto: orquestrai
id: L-B235
titulo: sed com console.log e parênceses escapados quebra Node silenciosamente
data: 2026-06-27
severidade: alta
tags: [sed, syntax, debug, console.log, node, mas]
contexto: BLOCO-235 -- injectar trace no for(const ag of AGENTS) em mas/agents.mjs
---

## O que aconteceu
Usei sed -i com \( \) escapados para injetar console.log dentro de mas/agents.mjs.
Resultado: parêncese desbalanceado (faltou 1 fechamento).
Node falhou ao carregar com SyntaxError: missing ) after argument list.
API devolveu 502 / upstream temporariamente indisponivel.

## Por que é perigoso
- docker restart não acusa: processo morre e nginx ve 502.
- node --check NÃO foi rodado depois do sed.
- Contar paränteses dentro de sed com \(\) é receita de erro.

## Regras
1. NUNCA injectar JS multi-paren via sed. Use Python pathlib read_text/write_text com replace literal, OU heredoc com EOF (unico ponto que a versao duplicada L-B235-sed-parenteses acrescentava; fundida aqui em 2026-07-07, CTXKBCLEAN01).
2. SEMPRE rodar node --check depois de patch em .mjs ou .js.
3. Se restart falhar: docker logs --tail 50 <container> 2>&1 | grep SyntaxError.

## Padrão correto
Python:
  s=p.read_text()
  s2=s.replace('for(const ag of AGENTS){', "for(const ag of AGENTS){ console.log(\"id=\", ag.id);", 1)
  p.write_text(s2)

## Relacionados
- L-B70 (mutation observer loop): mesma classe -- patch sem validação derruba apl.
- BLOCO-236: rollback via backup resolveu em 1 tentativa.
