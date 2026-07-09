PROJETO: orquestrai
# L-BASHHIST01 — Expansao de historico do bash mata patch inline com '!'

CONTEXTO: Patch CTXPROJCOUNT01 via node -e inline com "!pb.querySelector" em aspas duplas: o bash interativo tentou expansao de historico (event not found) e o patch NUNCA chegou ao arquivo — apesar de o terminal exibir mensagens sugerindo sucesso. O arquivo e a verdade; a saida do terminal pode ser miragem em paste multi-linha.

REGRA: Patch NUNCA via node -e inline no shell interativo. Sempre: arquivo via heredoc com delimitador single-quote ('EOF', imune a expansao) + node /tmp/patch.js + assert de unicidade + validacao visao-do-browser. Complementa L-B298 (set +H) e reafirma a regra da casa "patch sempre via arquivo com assert". Apos qualquer patch, confirmar por grep no ARQUIVO, nao pela mensagem do terminal.

EVIDENCIA: sessao 2026-07-09 — "-bash: !pb.querySelector: event not found"; grep posterior confirmou CTXPROJCOUNT01 ausente do arquivo.
