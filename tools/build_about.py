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
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "content", "about.json")
TPL  = os.path.join(ROOT, "tools", "templates", "about.html")

# matches the indentation the hand-written page used, so the output is identical
PRAISE_ITEM = '      <li><blockquote>%s<cite>%s</cite></blockquote></li>'


def md(text):
    """The small amount of markdown the biography uses, turned back into HTML.

    Craig writes in a rich editor and never types a tag; this converts what it
    saves back into the markup the page has always used. Deliberately tiny —
    it only handles the inline marks the biography actually contains.
    """
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text or "")
    s = re.sub(r"(?<!\w)\*([^*]+)\*(?!\w)", r"<em>\1</em>", s)
    return s


def bio_html(b):
    """Rebuild the biography from its parts, in the page's own order and
    indentation, so the output is unchanged from the hand-written version.

    The biography used to be one block of HTML in a single field, which meant
    Craig editing his own life story around visible <p> tags. It is now a set
    of small labelled pieces; this puts them back together.
    """
    L = ['<p class="big">%s</p>' % md(b["opening"])]
    L += ['      <p>%s</p>' % md(p) for p in b["story"]]
    L += ['      <p>%s</p>' % md(b["teaching_intro"])]
    # Craig groups the courses by degree in his own copy, so the page does too.
    L += ['      <div class="courses">']
    for label, key in (("MA Publishing Media", "courses_ma"),
                       ("BA Media, Journalism and Publishing", "courses_ba")):
        if not b.get(key):
            continue
        L += ['        <p class="cgroup">%s</p>' % label, '        <ul>']
        L += ['          <li>%s</li>' % md(c) for c in b[key]]
        L += ['        </ul>']
    L += ['      </div>']
    L += ['      <p>%s</p>' % md(b["editing"])]
    L += ['      <p class="battery">%s</p>' % md(b["personal"])]
    L += ['      <p>%s</p>' % md(b["substack"])]
    return "\n".join(L)


def main():
    d = json.load(open(DATA, encoding="utf-8"))
    t = open(TPL, encoding="utf-8").read()

    praise = "    <ul>\n" + "\n".join(
        PRAISE_ITEM % (p["quote"], p["source"]) for p in d["praise"]) + "\n    </ul>"

    intro = ('    <p class="pintro">%s</p>\n' % md(d["praise_intro"])) if d.get("praise_intro") else ""

    out = (t.replace("{{H1}}", md(d["h1"]))
            .replace("{{PRAISE_INTRO}}", intro)
            .replace("{{KICKER}}", d["kicker"])
            .replace("{{LEAD}}", d["lead"])
            .replace("{{BIO}}", bio_html(d["bio"]))
            .replace("{{PRAISE}}", praise))
    open(os.path.join(ROOT, "about.html"), "w", encoding="utf-8").write(out)
    print("wrote about.html")


if __name__ == "__main__":
    main()
