import subprocess, sys, re, datetime

TZ_OFFSET = "-03:00"
now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
MARK = f"ATUALIZADO: {now} {TZ_OFFSET} (auto, git pre-commit)"

staged = subprocess.run(["git","diff","--cached","--name-only","--diff-filter=ACM"],
                         capture_output=True, text=True).stdout.splitlines()

JS_EXT = (".js",".cjs",".mjs")
HTML_EXT = (".html",".htm")

touched = []
for f in staged:
    try:
        with open(f, "r", encoding="utf-8") as fh:
            content = fh.read()
    except Exception:
        continue

    if f.endswith(JS_EXT):
        pat = re.compile(r"^// ATUALIZADO: .*\(auto, git pre-commit\)\n", re.MULTILINE)
        line = f"// {MARK}\n"
        if pat.search(content):
            content = pat.sub(line, content, count=1)
        else:
            content = line + content
    elif f.endswith(HTML_EXT):
        pat = re.compile(r"^<!-- ATUALIZADO: .*\(auto, git pre-commit\) -->\n", re.MULTILINE)
        line = f"<!-- {MARK} -->\n"
        if pat.search(content):
            content = pat.sub(line, content, count=1)
        else:
            content = line + content
    else:
        continue

    with open(f, "w", encoding="utf-8") as fh:
        fh.write(content)
    touched.append(f)

if touched:
    subprocess.run(["git","add"] + touched)
    print("headers atualizados:", ", ".join(touched))
