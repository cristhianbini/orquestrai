PROJETO: orquestrai
# L-BUSYBOXVERBS01 — busybox wget so fala GET/POST; outros verbos exigem node fetch

CONTEXTO: Teste do DELETE /api/projects/:slug via docker exec + wget --method=DELETE nao rodou: busybox wget imprimiu o HELP DE USO ("-Y on/off Use proxy") em vez de resposta HTTP — a flag --method nao existe no busybox. O endpoint foi commitado sem nenhuma prova real. Mesma familia da L-BUSYBOXLOCALHOST01 (limitacoes silenciosas do busybox em container Alpine).

REGRA: Teste de endpoint dentro do container Alpine: GET/POST simples podem usar wget com 127.0.0.1; QUALQUER outro verbo (DELETE/PUT/PATCH) ou header custom usa node -e com fetch. Sinal de alarme: saida que parece help/usage em vez de status HTTP = o comando nem executou — nunca interpretar como "passou".

EVIDENCIA: sessao 2026-07-09 — dois testes do CTXPROJDEL01 devolveram texto de usage; reexecutados com node fetch em seguida.
