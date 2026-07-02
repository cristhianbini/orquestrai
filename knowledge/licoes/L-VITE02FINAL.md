# L-VITE02FINAL — React island: 3 causas encadeadas ate funcionar de verdade

**Data:** 2026-07-01
**Contexto:** CTXVITE02

## Cronologia de bugs (cada um escondia o proximo)
1. Container errado: montei dentro de #masx-cards, que script legado
   (paintAg(), boot() unico disparo) reescrevia via innerHTML= antes do
   React montar -- elemento nunca existia de verdade.
2. Fix: mover para elemento IRMAO, fora do container reescrito.
3. Novo erro apareceu: 'process is not defined' -- build.lib do Vite nao
   injeta o define automatico de process.env.NODE_ENV que builds de app
   tem, deixando referencia crua no bundle.
4. Fix: define explicito no vite.island.config.js.
5. Ainda undefined apos fix -- causa era cache do navegador (Ctrl+Shift+R
   nao bastou, precisou 'Esvaziar cache e recarregar de modo forcado').
6. Painel finalmente montou mas cards vieram COMPRIMIDOS -- grid-cols-2
   md:grid-cols-3 reage a largura da JANELA, nao do container (aside
   lateral estreita, sempre ~300px independente do viewport).
7. Fix final: grid-cols-1 fixo, sem breakpoint responsivo.

## Regra permanente
"Nao funcionou" pode ter varias causas empilhadas -- cada fix pode revelar
o proximo problema, nao assumir que o primeiro fix resolve tudo. Sempre
verificar com dado real (typeof, innerHTML.length, offsetHeight) antes de
declarar sucesso. Grid responsivo por viewport (md:/lg:) so funciona
quando o container acompanha a largura da tela -- dentro de sidebars/
paineis de largura fixa, usar colunas fixas.
