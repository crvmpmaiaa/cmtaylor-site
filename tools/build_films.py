#!/usr/bin/env python3
"""Generate the Films index (films.html) and one page per film (films/<slug>.html)
from content/films.json.

Why this exists: the film pages were hand-written HTML, so adding a film meant
editing markup. With the content in a data file, Craig can add a film through a
CMS — title, year, runtime, logline, description, poster, Vimeo link, laurels —
and the pages build themselves.

WHAT IS EDITABLE AND WHAT IS NOT
    Content fields are data: titles, copy, posters, laurels, links.
    Presentation is not. Each film keeps its own `style` block verbatim, because
    the laurel sizing is hand-tuned per page — Bangkok's laurel is a tall
    near-square where the others are wide wreaths, so it is sized by width
    while the rest are sized by height. Flattening those into one shared rule
    would quietly make several laurels the wrong size. CSS stays a developer
    concern; the CMS never exposes it.

This generator was written by extracting the existing pages into
content/films.json and then diffing its output back against them until the only
differences were deliberate ones. Rerun that diff after changing this file:

    python3 tools/build_films.py && git diff --stat films.html films/

Anything unexpected in that diff means the generator has dropped something —
which is exactly how this repo has lost work twice before.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILMS_DIR = os.path.join(ROOT, "content", "films")
PAGE_FILE = os.path.join(ROOT, "content", "films-page.json")
STYLE_DIR = os.path.join(ROOT, "content", "_styles")
SITE = "https://cmtaylorstory.com"
# The imprint line above every film title. Identical on all of them, so it
# lives here rather than being retyped into each content file.
SERIES = "Slow and Spurious Films"

PERSON_ID = SITE + "/#person"
PERSON_NODE = {
    "@type": "Person",
    "@id": PERSON_ID,
    "name": "C. M. Taylor",
    "alternateName": "Craig Taylor",
    "url": SITE + "/",
}

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;'
         '1,400;1,500&family=Inter:wght@400;500&display=swap" rel="stylesheet">')


def esc(t):
    """Escape for a double-quoted attribute, leaving apostrophes alone so the
    copy is not littered with &#x27;."""
    return (t or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def head(title, desc, url, image, og_type, ld, style, prefix=""):
    return "\n".join([
        '<!doctype html>', '<html lang="en">', '<head>',
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="description" content="%s">' % esc(desc),
        '<link rel="canonical" href="%s">' % url,
        '<meta property="og:type" content="%s">' % og_type,
        '<meta property="og:site_name" content="C. M. Taylor">',
        '<meta property="og:locale" content="en_GB">',
        '<meta property="og:title" content="%s">' % esc(title),
        '<meta property="og:description" content="%s">' % esc(desc),
        '<meta property="og:url" content="%s">' % url,
        '<meta property="og:image" content="%s">' % image,
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:site" content="@CMtaylorstory">',
        '<meta name="twitter:title" content="%s">' % esc(title),
        '<meta name="twitter:description" content="%s">' % esc(desc),
        '<meta name="twitter:image" content="%s">' % image,
        '<link rel="icon" href="%sfavicon.svg" type="image/svg+xml">' % prefix,
        '<script type="application/ld+json">%s</script>' % ld,
        '<title>%s</title>' % title,
        FONTS,
        '<style>%s</style>' % style,
        '</head>',
    ])


def topnav(here, prefix):
    items = [("Books", "books"), ("Films", "films"), ("Essays", "essays"),
             ("About", "about"), ("Contact", "contact")]
    links = "\n    ".join(
        '<a%s href="%s%s">%s</a>' % (' class="here"' if slug == here else "", prefix, slug, label)
        for label, slug in items)
    return ('<div class="top">\n'
            '  <a class="name" href="%s">C. M. Taylor</a>\n'
            '  <nav>\n    %s\n  </nav>\n</div>' % (prefix or "./", links))


def film_ld(f):
    url = "%s/films/%s" % (SITE, f["slug"])
    node = {
        "@type": "Movie",
        "name": f["title"],
        "director": {"@id": PERSON_ID},
        "author": {"@id": PERSON_ID},
        "url": url,
        "@id": url + "#film",
        "image": f["seo_image"],
        "description": f["ld_description"],
        "inLanguage": "en",
        "productionCompany": {"@type": "Organization", "name": "Slow and Spurious Films"},
        "dateCreated": f["year"],
        "duration": "PT%dM" % f["mins"],
    }
    return json.dumps({"@context": "https://schema.org", "@graph": [node, PERSON_NODE]},
                      ensure_ascii=False)


def film_page(f):
    body = ['  <p class="series">%s</p>' % f["series"],
            '  <h1>%s</h1>' % f["title"],
            '  <p class="filmmeta">%s</p>' % f["meta_raw"],
            '  <p class="logline">%s</p>' % f["logline"]]
    if f.get("desc"):
        body.append('  <p class="desc">%s</p>' % f["desc"])
    if f.get("vimeo"):
        body.append('  <div class="player"><iframe src="%s" allow="autoplay; fullscreen; picture-in-picture" '
                    'allowfullscreen title="%s"></iframe></div>' % (f["vimeo"], esc(f["vimeo_title"])))
    elif f.get("poster"):
        # decoding="async" matches the hand-written pages: the poster is the
        # largest thing on a film page and must not block first paint.
        body.append('  <div class="posterhero"><img decoding="async" src="%s" alt="%s"></div>'
                    % (f["poster"], esc(f["poster_alt"])))
    if f.get("note"):
        body.append('  <p class="note">%s</p>' % f["note"])
    if f.get("laurels_raw"):
        body.append('  <div class="laurels">%s</div>' % f["laurels_raw"])
    body.append('  <a class="back" href="../films">&larr; All films</a>')

    return "\n".join([
        head("%s – C. M. Taylor" % f["title"], f["seo_desc"],
             "%s/films/%s" % (SITE, f["slug"]), f["seo_image"],
             f["og_type"], film_ld(f), f["style"], prefix="../"),
        "<body>",
        topnav("films", "../"),
        "<main>",
        "\n".join(body),
        "</main>",
        '<script src="../fold-child.js?v=20260725a"></script>',
        '<footer class="artfoot" style="background-image:url(\'%s\')" '
        'aria-label="Colour-field painting by C. M. Taylor"></footer>' % f["artfoot"],
        '<script src="../mobile-nav.js?v=20260729a"></script>',
        "</body>", "</html>", "",
    ])


def index_ld(films):
    items = [{"@type": "ListItem", "position": i + 1,
              "url": "%s/films/%s" % (SITE, f["slug"]), "name": f["title"]}
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
    return json.dumps({"@context": "https://schema.org", "@graph": [page, PERSON_NODE]},
                      ensure_ascii=False)


def index_page(d, films):
    p = d["page"]
    cards = []
    for f in films:
        lazy = ' loading="lazy"' if f["index_lazy"] else ""
        card = ['  <a class="film" href="films/%s">' % f["slug"],
                '    <div class="posterwrap"><img%s decoding="async" src="%s" alt="%s"></div>'
                % (lazy, f["index_poster"], esc(f["index_poster_alt"])),
                '    <h2>%s</h2>' % f["index_title"],
                '    <p class="meta">%s</p>' % f["index_meta"]]
        if f.get("index_logline"):
            card.append('    <p class="logline">%s</p>' % f["index_logline"])
        if f.get("index_badge"):
            card.append('    <p class="badge">%s</p>' % f["index_badge"])
        card.append('  </a>')
        cards.append("\n".join(card))

    return "\n".join([
        head(p["title_tag"], p["seo_desc"], SITE + "/films", p["seo_image"],
             "website", index_ld(films), p["style"]),
        "<body>",
        topnav("films", ""),
        '<header class="intro">',
        '  <h1>%s</h1>' % p["h1"],
        "  " + p["intro_html"],
        "</header>",
        '<main class="films">',
        "",
        "\n\n".join(cards),
        "",
        "</main>",
        '<script src="fold-child.js?v=20260727a"></script>',
        '<footer class="artfoot" style="background-image:url(\'%s\')" '
        'aria-label="Colour-field painting by C. M. Taylor"></footer>' % p["artfoot"],
        '<script src="mobile-nav.js?v=20260729a"></script>',
        "</body>", "</html>", "",
    ])


def load():
    """Content files hold content only. Everything a reader never types —
    the meta line, the SEO image, the iframe title — is derived here, and the
    per-page CSS is read from content/_styles/ where a CMS cannot reach it."""
    page = json.load(open(PAGE_FILE, encoding="utf-8"))
    films = []
    for slug in page["order"]:
        f = json.load(open(os.path.join(FILMS_DIR, slug + ".json"), encoding="utf-8"))
        f["slug"] = slug
        # Everything the editor no longer asks Craig for is worked out here, so
        # a film he adds himself produces a complete page — alt text, share
        # description, the badge on the Films index, all of it.
        f.setdefault("poster_alt", "%s poster" % f["title"])
        f.setdefault("badge", "Watch the film" if f.get("vimeo") else "On the festival circuit")
        f.setdefault("seo_desc", "%s – a short film by C. M. Taylor (Slow and Spurious Films). %s"
                                 % (f["title"], f.get("logline", "")))
        f.setdefault("og_type", "video.other")
        f.setdefault("index_lazy", True)
        f.setdefault("index_logline", "")
        f.setdefault("hero_poster", "" if f.get("vimeo") else f["poster"])
        f.setdefault("note", "")
        f.setdefault("desc", "")
        # the footer painting cycles through the four flags rather than asking
        f.setdefault("artfoot", "flag-%d" % (page["order"].index(slug) % 4 + 1))
        f["meta_raw"]     = "%s &nbsp;·&nbsp; %d mins" % (f["year"], f["mins"])
        f["seo_image"]    = SITE + "/" + f["poster"]
        f["ld_description"] = f["seo_desc"]
        f["vimeo_title"]  = f.get("vimeo_title") or f["title"]
        f["index_title"]  = f["title"]
        f["index_meta"]   = f["meta_raw"]
        f["index_poster"] = f["poster"]
        f["index_poster_alt"] = f["poster_alt"]
        f["index_badge"]  = f.get("badge") or None
        f["index_logline"] = f.get("index_logline") or f["logline"]
        f["poster"] = f.get("hero_poster") or ""      # hero only when there is no video
        f["artfoot"] = "../assets/art/%s.jpg" % f["artfoot"]
        # Films with hand-tuned laurel sizing have their own stylesheet; anything
        # else — including a film Craig adds himself — uses the default. Without
        # this the build simply failed on a new film, which he would have hit
        # the first time he tried.
        css = os.path.join(STYLE_DIR, slug + ".css")
        if not os.path.exists(css):
            css = os.path.join(STYLE_DIR, "_film.css")
        f["style"] = open(css, encoding="utf-8").read()
        f["series"] = SERIES
        f["laurels_raw"] = laurels_html(f.get("laurels"))
        films.append(f)
    page["style"] = open(os.path.join(STYLE_DIR, "_index.css"), encoding="utf-8").read()
    page["artfoot"] = "assets/art/%s.jpg" % re.search(r"(flag-\d)", page["artfoot"]).group(1) \
                      if not page["artfoot"].startswith("assets/") else page["artfoot"]
    return {"page": page, "films": films}


def laurels_html(items):
    if not items:
        return None
    out = []
    for l in items:
        attrs = ""
        if l.get("cls"):  attrs += ' class="%s"' % l["cls"]
        if l.get("lazy"): attrs += ' loading="lazy"'
        out.append('<img%s decoding="async" src="%s" alt="%s">' % (attrs, l["src"], esc(l["alt"])))
    return "".join(out)


def main():
    d = load()
    films = d["films"]

    for f in films:
        path = os.path.join(ROOT, "films", f["slug"] + ".html")
        open(path, "w", encoding="utf-8").write(film_page(f))
    open(os.path.join(ROOT, "films.html"), "w", encoding="utf-8").write(index_page(d, films))
    print("wrote films.html + %d film pages" % len(films))


if __name__ == "__main__":
    main()
