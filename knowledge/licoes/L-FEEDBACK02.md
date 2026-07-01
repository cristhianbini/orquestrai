# L-FEEDBACK02 — Patch Python sem write() nao salva nada

**Data:** 2026-07-01

## Erro
Script 3a (botoes cardHTML) fez c.replace() e print('sucesso') mas
esqueceu open(path,'w').write(c). A variavel foi alterada so em memoria;
processo terminou e a mudanca se perdeu. Log mostrou falso sucesso.

## Regra permanente
Todo patch Python DEVE terminar com open(path,'w').write(c) explicito.
Nunca confiar so no print de sucesso -- sempre fazer grep de confirmacao
no arquivo (nao so no log do script) apos qualquer patch.
