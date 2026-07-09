PROJETO: orquestrai
APROVADA: 2026-07-09 por Bini (curadoria humana -- ciclo completo: proposta Memorialista -> pre-aprovacao Guardian -> humano)
# L-PROP-audit-cascata-scout-guardian

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-09T03:12:11.183Z. Aguardando revisao humana._

ID: L-PROP-audit-cascata-scout-guardian
TITULO: Auditoria geral rápida via cascata Scout→Auditor→Detetive→Smith→Guardian reduz falsos-positivos
CONTEXTO: Quando audit é imediato (sem patching), 6 agentes em sequência (H1/H2/H3 do Scout, análise Auditor, causa Detetive, script Smith READ-ONLY, validação Guardian) filtram hipóteses antes de Cris executar, economizando run time e evitando descobertas tardias de SyntaxError ou drift DB
REGRA: Para toda auditoria geral rápida (não-emergência), execute sequência Scout→Auditor→Detetive→Smith→Guardian antes de BLOCO na VPS; ignore paralelos, respeite ordem de enriquecimento (cada agente monta em achado anterior); Guardian aprova risco, não resultado
EVIDENCIA: mas_audit-cascata-202607xx — bloco gerado, 3 hipóteses estruturadas, 0 surpresas pós-Guardian (todas mapeadas a L- existentes)
