PROJETO: orquestrai
# L-ANCORACOMENT01 — Comentario de documentacao virou ancora falsa de insercao

CONTEXTO: O comentario do CTXPROJ2 continha o token literal </body> ("colado antes do </body>"). A insercao seguinte (CTXPROJSEL01) usou replace na 1a ocorrencia de </body> sem re-contar — e acertou o comentario. No browser a tag fechou no primeiro </script> do fragmento injetado; o codigo real virou texto morto e a tela PROJETOS regrediu ao wizard. A validacao "sintaxe OK" nao pegou porque validava a extracao propria, nao a visao do browser.

REGRA: (1) Unicidade de ancora se verifica NO MOMENTO de CADA insercao, nunca herdada de insercao anterior — o proprio patch anterior pode ter criado a 2a ocorrencia. (2) Comentarios de codigo NUNCA contem tokens estruturais do formato hospedeiro (</body>, </script> etc.) — escrever "fechamento do body". (3) Validacao de script inline em HTML simula o browser: conteudo = ate o PRIMEIRO </script> apos a tag, com assert de simbolo-chave presente.

EVIDENCIA: CTXPROJ2 caiu de 5689 p/ 3058 chars na visao do browser; window.projOpen da lista virou texto morto; regressao visivel em producao 2026-07-09; consertado por CTXFIXBODY01.
