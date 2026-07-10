#!/usr/bin/env python3
# [CTXAUDIT01 2026-07-10] Dossie de auditoria READ-ONLY da infra OrquestrAI.
# Gera TXT em auditoria/ para analise por modelo avancado (auditoria externa).
# SEGURANCA: nunca exporta VALORES de .env/segredos -- so nomes de variaveis.
import os, subprocess, datetime, glob, collections

BASE = "/var/www/orquestrai"
TS = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
OUTF = f"{BASE}/auditoria/dossie-{TS}.txt"
os.makedirs(f"{BASE}/auditoria", exist_ok=True)
out = open(OUTF, "w", encoding="utf-8", errors="replace")

def run(cmd, timeout=20):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return (r.stdout or "") + (("\n[stderr] " + r.stderr) if r.stderr.strip() else "")
    except Exception as e:
        return f"[erro: {e}]"

def sec(title, body):
    out.write(f"\n{'='*70}\n== {title}\n{'='*70}\n{body}\n")

sec("META", f"gerado em {TS}\nbase: {BASE}\nproposito: auditoria externa read-only")
sec("SISTEMA", run("uname -a") + run("df -h / /var") + run("free -h") + run("uptime"))
sec("DOCKER: containers", run("docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"))
sec("DOCKER: mounts REAIS por container (inspect, nao compose)",
    "".join(f"\n--- {c} ---\n" + run(f"docker inspect {c} --format '{{{{range .Mounts}}}}{{{{.Source}}}} -> {{{{.Destination}}}} (ro={{{{.RW}}}}){{{{\"\\n\"}}}}{{{{end}}}}'")
            for c in ["orquestrai-proxy","orquestrai-api","orquestrai-web"]))
sec("DOCKER-COMPOSE (arquivo)", run(f"cat {BASE}/docker-compose.yml"))
sec("ALERTA: mounts duplicados p/ mesmo destino no compose",
    run(f"grep -oE ':[^:]+:(ro|rw)?$|:[^:]+$' {BASE}/docker-compose.yml | sort | uniq -d") or "(nenhum)")
dups = collections.defaultdict(list)
for f in glob.glob(f"{BASE}/**/*.*js", recursive=True):
    if "node_modules" in f or "/.git/" in f or ".bak" in f: continue
    dups[os.path.basename(f)].append(f)
sec("ALERTA: arquivos com MESMO NOME-BASE (principio anti-duplicata)",
    "\n".join(f"{k}:\n  " + "\n  ".join(v) for k,v in dups.items() if len(v)>1) or "(nenhum)")
sec("NGINX: proxy.conf", run(f"cat {BASE}/nginx/proxy.conf"))
sec("NGINX: limits.conf", run(f"cat {BASE}/nginx/limits.conf"))
sec("API: rotas definidas (todos os *Routes + server.js raiz)",
    run(f"grep -nE 'router\\.(get|post|patch|delete|put)|app\\.(get|post|patch|delete|use)' {BASE}/server.js " +
        " ".join(glob.glob(f"{BASE}/api/*Routes.cjs"))))
sec("API: cobertura de auth (linhas com authMiddleware)",
    run(f"grep -rn 'authMiddleware' {BASE}/server.js {BASE}/api/*.cjs | grep -v node_modules"))
sec("PORTAS abertas no host", run("ss -tlnp"))
env_names = run(f"cut -d= -f1 {BASE}/.env 2>/dev/null")
sec("ENV: NOMES das variaveis (VALORES OMITIDOS de proposito)", env_names or "(sem .env)")
sec("GIT: ultimos 25 commits", run(f"cd {BASE} && git log --oneline -25"))
sec("GIT: status", run(f"cd {BASE} && git status --short | grep -v '.bak' | head -30"))
sec("KNOWLEDGE: estrutura", run(f"ls -la {BASE}/knowledge/ {BASE}/knowledge/metas/ 2>/dev/null"))
sec("KNOWLEDGE: licoes (20 mais recentes)", run(f"ls -t {BASE}/knowledge/licoes/ | head -20"))
sec("KNOWLEDGE: roadmap.md (se existir)", run(f"cat {BASE}/knowledge/roadmap.md 2>/dev/null | head -100") or "(nao existe)")
sec("PROJECTS: estrutura (2 niveis)", run(f"find {BASE}/projects -maxdepth 2 | head -40"))
sec("SYSTEMD: servicos custom (oq/orquestr)", run("systemctl list-units --type=service | grep -iE 'oq|orquestr' ; ls /etc/systemd/system/ | grep -iE 'oq|orquestr'"))
sec("SEGURANCA: processos escutando fora do docker", run("ss -tlnp | grep -v docker"))
out.close()
print(f"OK dossie gerado: {OUTF}")
print(run(f"wc -l {OUTF}"))
print("LEMBRETE: valores de .env NAO estao no dossie (so nomes). Seguro de anexar.")
