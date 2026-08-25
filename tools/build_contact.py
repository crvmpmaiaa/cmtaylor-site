#!/usr/bin/env python3
"""Generate contact.html from content/contact.json and tools/templates/contact.html.

Craig edits the words at the top of the page and the thank-you message; the
form itself, its labels, the privacy line and the SEO stay in the template,
because the form is wired to Netlify and none of the rest is text he would
sit down and reword.

Email addresses in the intro are typed bare and linked here - he should not
have to learn link syntax to put his agent's address on the page. The page
CSS is read from content/_styles/_contact.css so it has one home (About's
stylesheet ended up duplicated in its template and drifted).

Verify after any change here:
    python3 tools/build_contact.py && git diff --stat contact.html
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_about import md   # the same tiny markdown the About page uses

DATA  = os.path.join(ROOT, "content", "contact.json")
TPL   = os.path.join(ROOT, "tools", "templates", "contact.html")
STYLE = os.path.join(ROOT, "content", "_styles", "_contact.css")

EMAIL = re.compile(r"(?<![\w@/:\"])([\w.+-]+@[\w-]+(?:\.[\w-]+)+)(?![\w@\"])")


def autolink(html):
    """Turn a bare email address into a mailto link, leaving any that are
    already inside a link alone (md() may have produced one)."""
    parts = re.split(r"(<a [^>]*>.*?</a>)", html)
    return "".join(p if p.startswith("<a ") else
                   EMAIL.sub(r'<a href="mailto:\1">\1</a>', p) for p in parts)


def intro_html(paras):
    return "\n".join('  <p class="lede">%s</p>' % autolink(md(p))
                     for p in (paras or []) if p and p.strip())


def main():
    d = json.load(open(DATA, encoding="utf-8"))
    t = open(TPL, encoding="utf-8").read()
    out = (t.replace("{{STYLE}}", open(STYLE, encoding="utf-8").read())
            .replace("{{EYEBROW}}", d.get("eyebrow") or "Contact")
            .replace("{{H1}}", md(d.get("h1") or "Get in touch"))
            .replace("{{INTRO}}", intro_html(d.get("intro")))
            .replace("{{THANKS_TITLE}}", md(d.get("thanks_title") or "Thank you."))
            .replace("{{THANKS_BODY}}", md(d.get("thanks_body") or "")))
    open(os.path.join(ROOT, "contact.html"), "w", encoding="utf-8").write(out)
    print("wrote contact.html")


if __name__ == "__main__":
    main()
