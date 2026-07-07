---
tipo: licao-automatica
bloco: BLOCO-51
title: "Auto: Backup apenas se ainda não existir um backup muito recente (último 60s) ou se for forçado,"
sha256: 985819f29712b7656a5221bdc5ae19e8d52d9c01ab8ac39e1bf2ab1b36abfe07
created: 2026-06-27T02:31:08.625Z
---

# BLOCO-51 - Backup apenas se ainda não existir um backup muito recente (último 60s) ou se for forçado,

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
set +e; set -H
FILE="/var/www/orquestrai/dashboard.html"
BACKUP="$FILE.bak-LAVE-clearbtn-$(date +%s)"

# Backup apenas se ainda não existir um backup muito recente (último 60s) ou se for forçado, 
# aqui faremos direto pelo protocolo LAVE.
cp -a "$FILE" "$BACKUP"

python3 << 'PYTHON_SCRIPT'
file_path = '/var/www/orquestrai/dashboard.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Idempotência: verifica se botão já existe
if 'id="btn-limpar-terminal"' in content:
    print("Botão de limpar já existe. Nenhuma alteração feita.")
    exit(0)

btn_html = '''
<button id="btn-limpar-terminal" onclick="limparTerminal()" 
    style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; 
           background-color: #dc2626; color: #ffffff; border: none; padding: 10px 15px; 
           border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; 
           box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: background 0.2s;"
    onmouseover="this.style.backgroundColor='#b91c1c'" 
    onmouseout="this.style.backgroundColor='#dc2626'">
    🧹 Limpar
</button>
'''

script_js = '''
<script>
function limparTerminal() {
    // Lista de IDs/Classes comuns para área de output de logs/terminal
    const selectors = [
        '#output', '#logs', '#terminal', '#terminal-output', 
        '.lave-output', '#console-output'
    ];
    
    let cleared = false;
    selectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) {
            el.innerHTML = '';
            console.log('OrquestrAI: Limpo elemento ' + sel);
            cleared = true;
        }
    });

    if (!cleared) {
        // Fallback: Remove todos os elementos <pre> que geralmente contêm código/blocos anteriores
        // assume que a estrutura LAVE adiciona blocos pre/blocos específicos
        const blocks = document.querySelectorAll('pre.lave-block, .bash-block, pre:not([class*="language-"])');
        if (blocks.length > 0) {
            blocks.forEach(b => b.remove());
            console.log('OrquestrAI: Limpeza alternativa via remoção de blocos <pre>.');
        } else {
            alert('OrquestrAI: Container de output não identificado automaticamente para limpeza.');
        }
    }
}
</script>
'''

# Injeta antes do fechamento do body
if '</body>' in content:
    new_content = content.replace('</body>', btn_html + '\n' + script_js + '\n</body>')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Botão 'Limpar' adicionado ao dashboard.")
else:
    print("Erro: Tag </body> não encontrada no arquivo.")
PYTHON_SCRIPT
~~~
