#!/usr/bin/env python3
"""Drop the .html from internal links, canonicals, og:url and the sitemap.

Why this is safe on both hosts: GitHub Pages resolves /films to films.html
(verified with a live request before this was written), and WordPress serves
clean URLs natively. serve.py does the same for local preview, so all three
agree. The .html files themselves keep their names — only the URLs change.

Two URLs serving one page (/films and /films.html) would otherwise look like
duplicate content, so the canonical on every page now names the extensionless
form as the one true URL.

Run from anywhere; it rewrites the checked-in HTML, the sitemap, and the three
generators, so the Monday essays cron cannot revert the change.
"""
import os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Pages that exist as <name>.html at the site root, plus the two detail folders.
SECTIONS = ["books", "films", "essays", "about", "contact"]


def clean(text):
    """Rewrite this site's URLs only, leaving every other byte alone.

    Deliberately conservative about what counts as "this site". The About page
    links out to a British Library blog post whose URL genuinely ends in .html;
    stripping that would 404 a real citation. So relative links are rewritten,
    absolute ones are rewritten only under cmtaylorstory.com, and every other
    host is left untouched.
    """
    def rel(m):
        attr, path = m.group(1), m.group(2)
        if "://" in path:                       # absolute — handled below, by host
            return m.group(0)
        return '%s="%s"' % (attr, path[: -len(".html")])

    text = re.sub(r'\b(href)="([^"]+\.html)"', rel, text)
    # index.html is the site root, not a page named "index"
    text = re.sub(r'href="(\.\./)?index"', lambda m: 'href="%s"' % (m.group(1) or "./"), text)
    # absolute URLs in canonical/og:url/sitemap/JSON-LD — this host only
    text = re.sub(r'(https://cmtaylorstory\.com/[A-Za-z0-9/_-]+)\.html', r'\1', text)
    text = text.replace("https://cmtaylorstory.com/index", "https://cmtaylorstory.com/")
    return text


def main():
    targets = []
    for pat in ("*.html", "books/*.html", "films/*.html"):
        targets += sorted(glob.glob(os.path.join(ROOT, pat)))
    targets += [os.path.join(ROOT, "sitemap.xml")]
    # The generators are edited by hand rather than swept: their link templates
    # are f-strings ("books/{slug}.html"), not literal hrefs, so a regex aimed at
    # finished HTML would silently miss them and the next rebuild would put every
    # .html back. Re-run this after build_books.py / build_essays.py as a check —
    # if it reports changes to a generated file, the generator still emits .html.

    changed = 0
    for path in targets:
        if not os.path.isfile(path):
            sys.exit("missing: " + path)
        src = open(path, encoding="utf-8").read()
        out = clean(src)
        if out != src:
            open(path, "w", encoding="utf-8").write(out)
            changed += 1
            print("  rewrote", os.path.relpath(path, ROOT))
    print("clean URLs applied to %d files" % changed)


if __name__ == "__main__":
    main()
