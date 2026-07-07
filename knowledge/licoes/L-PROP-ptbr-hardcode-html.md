# L-PROP-ptbr-hardcode-html
PROJETO: orquestrai

_Auto-promovida por Guardian em 2026-06-29T05:14:11.267Z_

ID: L-PROP-ptbr-hardcode-html
TITULO: Hardcode de label de idioma em HTML quebra i18n
CONTEXTO: Ao realizar auditorias de frontend (grep/find) e detectar literais de idioma como "PT-BR" ou "EN-US" inseridos diretamente no código HTML/JSX.
REGRA: Nunca fixe strings de idioma no DOM. Utilize variáveis de estado ou um sistema de internacionalização (i18n) para renderizar labels dinamicamente.
EVIDENCIA: BLOCO-95 | /var/www/orquestrai/src/dashboard.html:1231 (hardcoded "PT-BR")
