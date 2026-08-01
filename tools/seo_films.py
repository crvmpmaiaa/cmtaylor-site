#!/usr/bin/env python3
"""Upgrade the structured data on the hand-maintained Films pages.

films.html and films/*.html are written by hand (unlike books.html, which comes
out of build_books.py), so this is a one-shot upgrade rather than a generator:
it rewrites only the <script type="application/ld+json"> block on each page and
leaves every other byte alone.

What it adds:
  • a stable @id per film, and a director reference to the one canonical Person
    @id, so Google merges Craig's films, novels and about page into a single
    author entity instead of five unrelated "C. M. Taylor" strings
  • dateCreated and ISO-8601 duration, read out of the page's own "2025 · 13 mins"
    line so the markup can never drift from what a reader sees
  • a CollectionPage + ItemList on films.html naming all five films in order

Safe to re-run: it is idempotent, and it verifies the year/runtime it scraped
against the page before writing anything.
"""
import re, json, os, glob, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://cmtaylorstory.com"

PERSON_ID = SITE + "/#person"
PERSON_NODE = {
    "@type": "Person",
    "@id": PERSON_ID,
    "name": "C. M. Taylor",
    "alternateName": "Craig Taylor",
    "url": SITE + "/",
}

LD_RE = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)
# the visible credit line, e.g. "2025 &nbsp;·&nbsp; 13 mins"
META_RE = re.compile(r"(20\d\d)\s*(?:&nbsp;|\s)*·(?:&nbsp;|\s)*\s*(\d+)\s*mins", re.I)

# Screen order on films.html, newest first. Kept explicit rather than globbed so
# the ItemList order matches what a visitor scrolls past.
ORDER = [
    "the-flags-of-nalbandia",
    "le-jazz",
    "analogue-digital-dead-alive",
    "the-library-of-unwritten-books",
    "the-other-side-of-boredom",
]


def movie_node(doc):
    """Pull the Movie out of a page's JSON-LD, whichever shape it is in.

    A first run finds a bare Movie object; every run after that finds the
    @graph this script itself wrote. Handling both is what makes re-running
    safe — the earlier version assumed the bare shape and died on its own
    output.
    """
    for node in doc.get("@graph", [doc]):
        if node.get("@type") == "Movie":
            return node
    return None


def film_page(slug):
    path = os.path.join(ROOT, "films", slug + ".html")
    src = open(path, encoding="utf-8").read()

    blocks = LD_RE.findall(src)
    if len(blocks) != 1:
        sys.exit("%s: expected exactly 1 JSON-LD block, found %d" % (path, len(blocks)))
    node = movie_node(json.loads(blocks[0]))
    if node is None:
        sys.exit("%s: no Movie node in the page's JSON-LD" % path)

    url = "%s/films/%s" % (SITE, slug)
    node["@id"] = url + "#film"
    node["url"] = url
    node["director"] = {"@id": PERSON_ID}
    node["author"] = {"@id": PERSON_ID}
    node["productionCompany"] = {"@type": "Organization", "name": "Slow and Spurious Films"}

    m = META_RE.search(src)
    if not m:
        sys.exit("%s: could not read the year/runtime credit line" % path)
    year, mins = m.group(1), int(m.group(2))
    node["dateCreated"] = year
    node["duration"] = "PT%dM" % mins

    payload = json.dumps({"@context": "https://schema.org",
                          "@graph": [node, PERSON_NODE]}, ensure_ascii=False)
    out = LD_RE.sub(lambda _: '<script type="application/ld+json">%s</script>' % payload,
                    src, count=1)
    open(path, "w", encoding="utf-8").write(out)
    return {"slug": slug, "name": node["name"], "url": url, "year": year, "mins": mins}


def films_index(films):
    path = os.path.join(ROOT, "films.html")
    src = open(path, encoding="utf-8").read()

    items = [{"@type": "ListItem", "position": i + 1, "url": f["url"], "name": f["name"]}
             for i, f in enumerate(films)]
    page = {
        "@type": "CollectionPage",
        "@id": SITE + "/films",
        "url": SITE + "/films",
        "name": "Slow and Spurious Films – The Short Films of C. M. Taylor",
        "description": ("The films of C. M. Taylor, made under the name Slow and Spurious "
                        "Films – award-winning, zero-budget experimental short films."),
        "inLanguage": "en",
        "about": {"@id": PERSON_ID},
        "mainEntity": {"@type": "ItemList", "numberOfItems": len(films),
                       "itemListOrder": "https://schema.org/ItemListOrderDescending",
                       "itemListElement": items},
    }
    payload = json.dumps({"@context": "https://schema.org",
                          "@graph": [page, PERSON_NODE]}, ensure_ascii=False)
    tag = '<script type="application/ld+json">%s</script>' % payload

    if LD_RE.search(src):
        src = LD_RE.sub(lambda _: tag, src, count=1)
    else:
        # no block yet: sit it directly before </head>, where the other meta lives
        if "</head>" not in src:
            sys.exit("films.html: no </head> to insert before")
        src = src.replace("</head>", tag + "\n</head>", 1)
    open(path, "w", encoding="utf-8").write(src)


if __name__ == "__main__":
    films = [film_page(s) for s in ORDER]
    films_index(films)
    print("updated films.html + %d film pages" % len(films))
    for f in films:
        print("  %-32s %s · %d mins" % (f["slug"], f["year"], f["mins"]))
