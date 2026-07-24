# L-PROP-VALIDATE-SLUG-GREP-FIRST

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-14T08:17:59.075Z. Aguardando revisao humana._

ID: L-PROP-VALIDATE-SLUG-GREP-FIRST
TITULO: Validar projeto-alvo + busca global antes de editar HTML em multi-projeto
CONTEXTO: Run de edição editorial em ambiente com multiplos projetos (cafe-real, sabordaterra, etc). Risco L-CHATSLUG01: comando executado no diretório errado, deixando frase antiga viva num projeto e nova frase em outro. Contexto anterior do chat referia-se a cafe-real; objetivo atual refere-se a sabordaterra. IA quase aplicou patch no projeto errado.
REGRA: ANTES de qualquer sed/python/grep de substituição: (1) confirmar projeto-alvo com ls -1 /var/www/orquestrai/projects | grep <slug>; (2) busca global grep -Rn "<frase-alvo>" /var/www/orquestrai/projects/<slug>; (3) SE frase nao encontrada EM <slug> mas EXISTIR em <outro-projeto>, PARE e relata confusao de slug (L-CHATSLUG01); (4) SO ENTAO execute patch. Idempotencia: usar marker ou backup+hash para evitar re-aplicacao.
EVIDENCIA: mas_<run-id-atual> — Smith preparou bloco SMITH-RECON-sabordaterra com validacoes obrigatorias antes de substituicao. Guardian blocou ate confirmacao. Testador propoe 3 assercoes read-only. Nenhum bloco de escrita foi lanccado.

---

## Síntese para Próximo Chat

**Decisão editorial aprovada:** "Cafeteria artesanal no coração das montanhas de Minas Gerais."

**Blocos aguardando execução:**
1. `BLOCO-SMITH-RECON-sabordaterra` (read-only) — confirmará localização do HTML e existência da frase
2. BLOCO-SMITH-PATCH-IDEMPOTENTE (pendente) — substituirá a frase com backup + marker

**Critérios de sucesso pós-execução:**
- Frase antiga desaparece de `sabordaterra`
- Frase nova aparece exatamente 1 vez no HTML principal
- Projeto `cafe-real` não é tocado (evitar L-CHATSLUG01)
- Backup criado com timestamp

**Handoff para próximo chat:**
- [x] Decisão editorial tomada
- [x] Plano validado por 7 agentes
- [ ] Bloco RECON executado
- [ ] Bloco PATCH executado
- [ ] Teste visual (navegador)

---
