# L-VITE03 — Incidente de login: 3 causas encadeadas, resolvido em producao

**Data:** 2026-07-01
**Contexto:** CTXVITE01, apos "siga proxima sprint" pular a limpeza pendente

## Cronologia do erro
1. Sessao anterior deixou pendente uma limpeza no App.jsx (usuario escolheu
   nao rodar, escolha valida). O patch cirurgico anterior tinha corrigido
   so o redirect, mas manteve localStorage.setItem so em 'oq_token'.
2. dashboard.html:1393 tem um guard ANTIGO e SEPARADO que checa
   especificamente localStorage.getItem('token') (chave literal), diferente
   do oqGetAuthToken() que varre 7 chaves. Login via React so gravava
   'oq_token' -> esse guard especifico falhava -> chutava de volta ao login.
3. Ao corrigir #2 (gravar em todas as chaves), o guard de LOGOUT
   (window.location.replace('/index.html')) revelou um 3o bug: o router
   React so conhecia a rota "/", nao "/index.html" -- tela preta,
   "No routes matched".
4. Bonus: no meio da correcao, rodei build 2x sem fazer o deploy (copiar
   dist/ pra src/) entre eles -- usuario testou a versao ANTIGA duas vezes
   achando que era a corrigida.

## Como foi resolvido
- Emergencial: pegar token via curl direto na API, injetar manualmente
  no localStorage do navegador (contornando a tela quebrada).
- Definitivo: AUTH_KEYS.forEach gravando em todas as chaves + rota
  "/index.html" adicionada ao router + confirmacao de hash JS identico
  entre dist/ e src/ antes de pedir novo teste.

## Regra permanente
1. Ao migrar guard/redirect de HTML legado para SPA React, mapear TODOS
   os pontos que fazem window.location.replace/href para arquivos .html
   especificos -- cada um precisa de rota correspondente no router, ou
   cair em "No routes matched" (tela preta silenciosa).
2. NUNCA pedir para o usuario testar apos rodar so 'npm run build' --
   build sozinho nao afeta producao. Sempre incluir o deploy (cp dist/
   para src/) no MESMO bloco, e confirmar hash do arquivo JS identico
   entre dist/ e src/ antes de pedir teste.
3. Quando usuario escolhe pular uma limpeza de codigo "so cosmetica",
   documentar isso de forma bem visivel (nao so em nota de rodape) --
   o proximo patch que assumir que a limpeza ja rodou vai falhar com
   assert count==0, que e seguro mas pode mascarar urgencia real.
