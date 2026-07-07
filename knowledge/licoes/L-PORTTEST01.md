# L-PORTTEST01 — Testar exposição de porta DE DENTRO do host gera falso positivo
PROJETO: orquestrai

**Data:** 2026-07-07
**Contexto:** Auditoria Fable rodada 1, achado A1 (oqterm 0.0.0.0:7654).

## Erro
`bash -c "echo > /dev/tcp/$IP_PUBLICO/7654"` executado NA PRÓPRIA VPS
retornou "porta aberta" — mas a porta estava protegida pelo ufw. Tráfego
do host para o próprio IP público roteia pela interface de loopback, e o
ufw (INPUT) não filtra `lo`. O teste mediu o loopback, não a internet.

## Regra prática
Exposição de porta só se comprova com teste DE FORA da máquina
(`nc -zv -w3 <ip> <porta>` de outro host/PC local). Teste interno serve
só pra confirmar que o serviço está escutando (`ss -tlnp`), nunca que
está exposto. Antes de classificar severidade de "porta aberta", exigir
a evidência externa — o mesmo princípio da L-CTXHANDOFFVERIFY01: a
afirmação (do teste viciado) é hipótese, não verdade.
