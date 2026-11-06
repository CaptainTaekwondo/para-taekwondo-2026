"""فحص الموقع قبل النشر.

الاستخدام (من جذر المشروع):
  python .claude/skills/pre-publish/check_site.py [--bump] [--out DIR]

  --bump  يغيّر رقم ?v= في index.html و card.html لتاريخ النهارده.
  --out   مجلد السكرين شوت (الافتراضي مجلد مؤقت، ومساره بيطبع في الآخر).

الكود 0 = كله سليم، 1 = فيه مشاكل.
"""
import argparse, datetime, functools, http.server, pathlib, re, subprocess, sys, tempfile, threading

ROOT = pathlib.Path(__file__).resolve().parents[3]
PAGES = ["index.html", "card.html"]
AR = re.compile(r"[؀-ۿ]")
# نصوص عربية مقصود تفضل عربي في النسخة الإنجليزية (زي زر اللغة)
ALLOW = {"عربي", "العربية", "التبديل إلى العربية"}

problems = []


def bump():
    v = datetime.date.today().strftime("%Y%m%d")
    for p in PAGES:
        f = ROOT / p
        s = f.read_text(encoding="utf-8")
        n = re.sub(r"\?v=\d{8}", "?v=" + v, s)
        f.write_text(n, encoding="utf-8", newline="")
        print(f"[bump] {p}: ?v={v} ({len(re.findall(r'[?]v=\d{8}', s))} مكان)")


def js_syntax():
    for f in sorted(ROOT.glob("*.js")):
        r = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True, encoding="utf-8")
        if r.returncode:
            problems.append(f"خطأ syntax في {f.name}:\n{r.stderr.strip()}")
    print("[js] node --check خلص")


def dup_keys():
    src = (ROOT / "i18n.js").read_text(encoding="utf-8")
    body = src.split("const EN = {", 1)[1].split("\n  };", 1)[0]
    keys = re.findall(r'"((?:[^"\\]|\\.)*)"\s*:', body)
    seen = {}
    for k in keys:
        nk = re.sub(r"\s+", " ", k).strip()
        seen[nk] = seen.get(nk, 0) + 1
    for k, c in seen.items():
        if c > 1:
            problems.append(f"مفتاح مكرر في i18n.js ({c} مرات): {k}")
    print(f"[i18n] {len(keys)} مفتاح")


COLLECT = """() => {
  const out = [], AR = /[\\u0600-\\u06FF]/;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    const p = n.parentNode;
    if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.nodeName)) continue;
    const t = n.nodeValue.replace(/\\s+/g, " ").trim();
    if (t && AR.test(t)) out.push(["text", p.nodeName.toLowerCase() + (p.id ? "#" + p.id : ""), t]);
  }
  for (const el of document.querySelectorAll("*"))
    for (const a of ["alt", "aria-label", "title", "placeholder"]) {
      const v = el.getAttribute(a);
      if (v && AR.test(v)) out.push([a, el.tagName.toLowerCase(), v.trim()]);
    }
  return out;
}"""


def browser(out):
    from playwright.sync_api import sync_playwright

    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_port}/"

    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")
        for page_name in PAGES:
            for lang in ("ar", "en"):
                ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                                    locale="ar-EG" if lang == "ar" else "en-US")
                ctx.add_init_script(f"try{{localStorage.setItem('lang','{lang}')}}catch(e){{}}")
                pg = ctx.new_page()
                errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
                pg.goto(base + page_name, wait_until="networkidle")
                # نزول تدريجي علشان الصور اللي بتتحمل وقت الظهور (lazy) تظهر في السكرين شوت
                pg.evaluate("""async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
                  window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, 0); }""")
                pg.wait_for_load_state("networkidle")
                pg.wait_for_timeout(600)
                for e in errs:
                    problems.append(f"خطأ console في {page_name} ({lang}): {e}")
                if lang == "en" and page_name == "index.html":
                    left = [x for x in pg.evaluate(COLLECT) if x[2] not in ALLOW]
                    seen = set()
                    for kind, where, t in left:
                        if t in seen:
                            continue
                        seen.add(t)
                        problems.append(f"نص من غير ترجمة [{kind} في {where}]: {t}")
                # الصفحة أطول من اللي Chrome يصوره مرة واحدة، فبنقسمها أجزاء
                h = pg.evaluate("document.documentElement.scrollHeight")
                for i, y in enumerate(range(0, h, 3000), 1):
                    shot = out / f"{page_name.split('.')[0]}-{lang}-{i:02d}.png"
                    pg.screenshot(path=str(shot), full_page=True,
                                  clip={"x": 0, "y": y, "width": 390, "height": min(3000, h - y)})
                ctx.close()
        b.close()
    srv.shutdown()
    print(f"[browser] السكرين شوت في: {out}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bump", action="store_true")
    ap.add_argument("--out")
    a = ap.parse_args()
    out = pathlib.Path(a.out) if a.out else pathlib.Path(tempfile.mkdtemp(prefix="pre-publish-"))
    out.mkdir(parents=True, exist_ok=True)
    if a.bump:
        bump()
    js_syntax()
    dup_keys()
    browser(out)
    print()
    if problems:
        print(f"== {len(problems)} مشكلة ==")
        for x in problems:
            print("- " + x)
        sys.exit(1)
    print("== كله سليم ==")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
