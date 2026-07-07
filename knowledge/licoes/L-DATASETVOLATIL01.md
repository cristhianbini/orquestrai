ID: L-DATASETVOLATIL01
PROJETO: orquestrai
TITULO: dataset de elemento DOM morre no reload -- vinculo de estado exige localStorage
CONTEXTO: S2/CTXMASRUNLINK01 F4 -- metadata (agente, mas_run_id) setado em el.dataset era apagado por Ctrl+Shift+R; execucoes chegavam null no banco mesmo com o encanamento correto.
REGRA: Estado que precisa sobreviver a reload NUNCA vive so em dataset/atributo DOM. Persistir em localStorage com chave de match (ex: corpo do bloco) e validar match exato antes de vincular.
COMO_APLICAR: Ao vincular acao do usuario a contexto gerado antes (run MAS -> execucao), gravar {meta, body} em localStorage no momento da geracao; no consumo, so usar se body === conteudo atual (anti-mislabel).
TAGS: frontend,localstorage,dataset,estado,reload
DATA: 2026-07-07
