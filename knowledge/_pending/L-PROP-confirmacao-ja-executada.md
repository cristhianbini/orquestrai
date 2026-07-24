# L-PROP-confirmacao-ja-executada

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-14T08:36:53.725Z. Aguardando revisao humana._

ID: L-PROP-confirmacao-ja-executada
TITULO: Usuario confirma achado anterior em stdout; nao repita exec de reconhecimento
CONTEXTO: Run mas_584df79dd9fd (substituição em sabordaterra): usuario relatou "confirmei: a frase aparece só 1x em sabordaterra (linha 542)". Scout reiniciou busca com find+grep ao inves de extrair do contexto prévio. Padrão: quando humano relata CONFIRMACAO EM STDOUT ANTERIOR, agentes analiticos devem validar contexto antes de ordem de recon.
REGRA: (1) Leia contexto do chat antes de propor Scout/exec. (2) Se usuario diz "confirmei X em stdout", extraia path/evidencia do bloco anterior. (3) Auditor valida idempotencia (ja aplicado? foi cafe-real?). (4) Smith monta patch direto. Economiza recon redundante e reduz latencia.
EVIDENCIA: run mas_584df79dd9fd: usuario relata confirmacao mas bloco proposto traz find+grep desnecessarios; BLOCO-217 (Smith) assume path ja conhecida, economizando ~2 exec-reads no Scout.
