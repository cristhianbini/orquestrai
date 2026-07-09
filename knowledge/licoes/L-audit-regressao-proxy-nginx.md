PROJETO: orquestrai
APROVADA: 2026-07-09 por Bini (curadoria humana -- ciclo completo: proposta Memorialista -> pre-aprovacao Guardian -> humano)
# L-PROP-audit-regressao-proxy-nginx

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-09T03:28:15.030Z. Aguardando revisao humana._

ID: L-PROP-audit-regressao-proxy-nginx
TITULO: Proxy nginx pode regredir para porta errada sem CI-CD detectando — teste grep periódico essencial
CONTEXTO: L-CTXUNIFY01 registrou fix crítico (proxy_pass 8080→3000), mas rollback acidental via git revert ou edição manual em proxy.conf nao e detectado automaticamente. BLOCO-64 confirma risco.
REGRA: Apos cada fix de proxy_pass em /etc/nginx/conf.d/proxy.conf, registrar hash SHA256 do arquivo + adicionar grep -n 'proxy_pass.*8080' a auditoria recorrente. Se linha encontrada, escalar CRITICO (502 iminente).
EVIDENCIA: Run mas_dd033e807c19 (auditoria geral) redescobrindo anomalia; L-CTXUNIFY01 achado 1 comprova que 102+ requisiçoes retornaram 502 enquanto regra de proxy estava errada.
