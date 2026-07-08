---
PROJETO: orquestrai
APROVADA: 2026-07-08 (curadoria humana; 3a licao do ciclo haiku)
---
# L-PROP-bind-mount-validation-host-vs-container

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-08T19:19:19.963Z. Aguardando revisao humana._

ID: L-PROP-bind-mount-validation-host-vs-container
TITULO: Validar divergencia HOST vs CONTAINER em bind-mount antes de inspecionar KB — padrão de confiabilidade
CONTEXTO: Ao listar arquivos em /var/www/orquestrai/knowledge/licoes/, descoberta pode divergir entre execução no host (via shell direto) vs container (via docker exec), causando confusão sobre "arquivos mais recentes" reais. Observado em BLOCO-204 [3/3], confirmado por L-B194 e L-B199.
REGRA: SEMPRE comparar resultado de find no host vs resultado de find dentro do container via docker exec. Se divergirem, aguardar 10-30s (cache de bind-mount) ou confirmação de restart recente do container. Nunca confiar em uma unica fonte sem validacao cruzada.
EVIDENCIA: BLOCO-204 v1.0, seção [3/3] — implementa exatamente essa dupla validação; mas_d498d2978204 (containers uptime) é pre-requisito para descartar "container restart recente" como causa de lag.

---

**Status final:** ✅ PROPOSTA VALIDA — aguardando aprovação de CTXKBCURATOR01 para persistencia em KB.
