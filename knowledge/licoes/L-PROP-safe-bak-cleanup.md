# L-PROP-safe-bak-cleanup

_Auto-promovida por Guardian em 2026-06-27T06:34:11.209Z_

ID: L-PROP-safe-bak-cleanup
TITULO: Política de retenção e validação prévia para remoção de arquivos .bak
CONTEXTO: Identificação de arquivos .bak-* antigos em /var/www e /tmp ocupando espaço em disco, decorrentes do padrão de backup-antes-patch (L-B236) sem política de expurgo definida.
REGRA: KB não possui política de retenção automática baseada em tempo. Toda tentativa de limpeza deve ser precedida de auditoria READ-ONLY comparando o hash (SHA256) do backup com o arquivo original. Backups idênticos ao atual são redundantes (candidatos a remoção segura), enquanto backups de estados antigos ou órfãos exigem aprovação manual explícita.
EVIDENCIA: Rejeição do BLOCO-237 pelo Guardian: "Nenhuma lição da KB autoriza remover .bak sem aprovação explícita caso-a-caso."
