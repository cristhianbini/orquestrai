# L-PROP-HTMLINJECT-IDEMPOTENTE

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-10T17:51:47.521Z. Aguardando revisao humana._

ID: L-PROP-HTMLINJECT-IDEMPOTENTE
TITULO: Injecao de secoes HTML em arquivos estaticos: pattern idempotente com marker + backup
CONTEXTO: Projeto café-real precisava adicionar seção "Sobre" ao index.html sem quebrar estrutura existente e sem risco de re-injecao em runs posteriores. Situacao comum em projetos estaticos que crescem por patches incrementais.
REGRA: (1) SEMPRE fazer backup com timestamp antes de regex/sed/python que altere HTML; (2) SEMPRE injetar marker unico ('<!-- LABEL_INJECTED -->') apos conteudo novo; (3) SEMPRE verificar presenca de marker no inicio do bloco com grep -q para evitar re-aplicacao; (4) SEMPRE usar Python com re.sub em vez de sed para regex com parenteses ou aspas (L-B235); (5) SEMPRE injetar antes de tags fechantes conhecidas (</footer>, </html>) nao antes de abertas; (6) SEMPRE testar grep -c apos patch para confirmar presenca do novo conteudo.
EVIDENCIA: mas_cafe-real-sobre-patch, BLOCO-sobre-inject gerado por Smith, aprovado Guardian com checagens obrigatorias 1-2, backup em .bak-$TIMESTAMP, marker SOBRE_SECTION_INJECTED preveniu re-injecao, css e link html ambos validaveis por grep post-exec.
