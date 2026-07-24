# L-PROP-BLOCO-COMPACTO-STATIC-HTML

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-14T00:24:52.088Z. Aguardando revisao humana._

ID: L-PROP-BLOCO-COMPACTO-STATIC-HTML
TITULO: Projetos static-html devem ser gerados em blocos sequenciais menores, com Python/EOF para HTML volumoso, evitando truncamento de resposta no live.
CONTEXTO: Em static-html (cafe-real, traco-vivo-arquitetura), blocos bash que tentam gerar HTML >3KB inteiro em uma resposta causam truncamento visual no painel LAVE ("HTML Part 1" não avança) e erro de shell interpretando comentários em português como comandos inexistentes. Padrão recorrente entre 3 runs anteriores (cafe-real sobre.html, cafe-real estrutura, agora traco-vivo com 4 páginas).
REGRA: (1) Dividir projeto static-html em N blocos sequenciais (1 página + CSS por bloco, ou 2 páginas leves + 1 CSS). (2) Usar Python heredoc (python3 << 'PYEND') para gerar HTML >2KB em vez de bash puro. (3) Testar cada bloco com find + grep pós-execução antes de declarar sucesso. (4) Propor lição imediatamente se bloco truncar, sem repetir em próximo run.
EVIDENCIA: Último run [mas_6c9d973bb9db] tentou gerar sobre.html em bash puro, cortou em 1/3, usuário reportou "bloco não aparece". Este run aplicou divisão em 4 blocos + Python (BLOCO-201 a BLOCO-204), confirmando padrão reutilizável.

---

## Próximos Passos (não bloqueantes)
- Executar BLOCO-201 (Home + CSS base) — Guardião já aprovou
- Validar com Testador (find + grep pós-execução)
- BLOCO-202 (Sobre + Portfólio) — seguir mesmo padrão
- BLOCO-203 (Contato + assets auxiliares)
- BLOCO-204 (Lição de design + KB)

**Memorialista: registrado e aguardando execução.**
