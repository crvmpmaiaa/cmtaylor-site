#!/usr/bin/env python3
"""Generate about.html from content/about.json and tools/templates/about.html.

Only the prose is data. The page shell — layout, the photo treatment, the
archive of past writing and events — stays in the template, because none of it
is text Craig would sit down and reword.

The biography is one block of HTML rather than a list of paragraphs. It mixes
paragraphs, a course list and a couple of styled asides, and splitting that into
fields would either lose the structure or invent a dozen of them. A single block
keeps it honest and lossless; the fields he is most likely to touch — the
pull-quote and the press quotes — are separate.

Verify after any change here:
    python3 tools/build_about.py && git diff --stat about.html
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "content", "about.json")
TPL  = os.path.join(ROOT, "tools", "templates", "about.html")

# matches the indentation the hand-written page used, so the output is identical
PRAISE_ITEM = '      <li><blockquote>%s<cite>%s</cite></blockquote></li>'


def main():
    d = json.load(open(DATA, encoding="utf-8"))
    t = open(TPL, encoding="utf-8").read()

    praise = "    <ul>\n" + "\n".join(
        PRAISE_ITEM % (p["quote"], p["source"]) for p in d["praise"]) + "\n    </ul>"

    out = (t.replace("{{H1}}", d["h1"])
            .replace("{{KICKER}}", d["kicker"])
            .replace("{{LEAD}}", d["lead"])
            .replace("{{BIO}}", d["bio_html"])
            .replace("{{PRAISE}}", praise))
    open(os.path.join(ROOT, "about.html"), "w", encoding="utf-8").write(out)
    print("wrote about.html")


if __name__ == "__main__":
    main()
