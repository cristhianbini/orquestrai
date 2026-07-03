#!/usr/bin/env python3
# R6-13.5.3 — remove a camada MORTA .masx-card, preserva o caminho VIVO b124g5Apply.
# Contexto: masxSet/masxResetAll operavam em .masx-card (container #masx-cards removido
# em R6-13.5.x) MAS masxSet tambem chama b124g5Apply(), que anima os cards reais
# .oq46y-card. So o "tail" .masx-card e morto. PIPE e fluxo SSE ficam intactos.
# Licoes aplicadas: L-002 (backup antes de alterar), L-003 (syntax check pre-commit).
import re, shutil, subprocess, sys, tempfile, os, datetime, pathlib

SRC="src/dashboard.html"
STAMP=datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
BKP=f"_arquivados/dashboard.html.PRE-R6-13.5.3.{STAMP}"
src=pathlib.Path(SRC).read_text(encoding="utf-8")

edits=[]
edits.append(("masxCard",
'    function masxCard(ag){ return document.querySelector(\'.masx-card[data-ag="\'+ag+\'"]\'); }\n',
''))
edits.append(("masxSet",
"""    function masxSet(ag, state, msg){
      b124g5Apply(ag,state);
      var c=masxCard(ag); if(!c) return;
      c.classList.remove('idle','working','ready','error');
      c.classList.add(state);
      if(state==='error' && msg){ var m=c.querySelector('.meta'); if(m) m.textContent=String(msg).slice(0,80); }
    }""",
"""    // R6-13.5.3: masxSet reduzido ao caminho VIVO (b124g5Apply anima .oq46y-card).
    // Tail .masx-card removido — container #masx-cards ja saiu em R6-13.5.x, era morto.
    // Param 'msg' mantido so p/ compat de assinatura nos call-sites; nao usado hoje.
    function masxSet(ag, state, msg){
      b124g5Apply(ag,state);
    }"""))
edits.append(("masxResetAll",
"""    function masxResetAll(){
      ['scout','auditor','smith','guardian','rel'].forEach(function(a){ masxSet(a,'idle'); var c=masxCard(a); if(c){ var m=c.querySelector('.meta'); if(m){ var def={scout:'varredura',auditor:'anomalias',smith:'patch',guardian:'validar',rel:'resumo'}; m.textContent=def[a]||''; } } });
    }""",
"""    function masxResetAll(){
      // R6-13.5.3: tail .masx-card (def/meta) removido; reset vivo via masxSet->b124g5Apply.
      ['scout','auditor','smith','guardian','rel'].forEach(function(a){ masxSet(a,'idle'); });
    }"""))

out=src
for name,old,new in edits:
    c=out.count(old)
    if c!=1:
        print(f"ABORT: ancora '{name}' bateu {c}x (esperado 1). NADA alterado."); sys.exit(1)
    out=out.replace(old,new)

if "masxCard(" in out:
    print("ABORT: ainda ha chamada a masxCard() apos edicao. Revisar."); sys.exit(1)

def check(html):
    blocks=re.findall(r"<script\b[^>]*>(.*?)</script>", html, re.S|re.I)
    fails=[]
    for i,b in enumerate(blocks):
        if not b.strip(): continue
        with tempfile.NamedTemporaryFile("w",suffix=".js",delete=False,encoding="utf-8") as f:
            f.write(b); tmp=f.name
        r=subprocess.run(["node","--check",tmp],capture_output=True,text=True); os.unlink(tmp)
        if r.returncode!=0:
            fails.append((i,(r.stderr.strip().splitlines() or ["erro"])[0]))
    return len(blocks),fails

nb,fb=check(src); na,fa=check(out)
print(f"blocos <script>: antes={nb} depois={na}")
newfails=[f for f in fa if f not in fb]
if newfails:
    print("ABORT: node --check falhou (NOVO) apos edicao:")
    for i,e in newfails: print(f"  bloco #{i}: {e}")
    sys.exit(1)

shutil.copy2(SRC,BKP)
pathlib.Path(SRC).write_text(out,encoding="utf-8")
print(f"OK: {SRC} atualizado. Backup: {BKP}")
print("linhas:", len(src.splitlines()), "->", len(out.splitlines()))
