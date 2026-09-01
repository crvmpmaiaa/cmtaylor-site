#!/usr/bin/env python3
"""Generate the Books showcase (books.html) and one page per novel
(books/<slug>.html). Light, warm-paper, gallery-wall treatment – lots of white
space, colour comes from the work (the real jackets). Edit the data here.

Covers are the real book jackets pulled from Craig's original site
(cmtaylorstory.com); Floaters uses its art-edition cover.
"""
import os, html, json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mdlite import md

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Book content lives in content/books/*.json so it can be edited through the CMS
# at /admin; the shelf order, index copy and footer paintings are in
# content/books-page.json. Only content moved out — the layout, the per-book
# accent colours and the jacket treatment stay in this file.
def _load_books():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    page = json.load(open(os.path.join(root, "content", "books-page.json"), encoding="utf-8"))
    books = []
    for slug in page["order"]:
        b = json.load(open(os.path.join(root, "content", "books", slug + ".json"), encoding="utf-8"))
        b["slug"] = slug
        # back to the shapes the templates below already expect
        b["quotes"] = [(q["text"], q["source"]) for q in b.get("quotes", [])]
        # Filled in for anything the editor no longer asks Craig for, so a book
        # he adds himself still produces a complete page.
        b.setdefault("num", "%02d" % (page["order"].index(slug) + 1))
        b.setdefault("accent", "#a83000")
        b.setdefault("note", "")
        b.setdefault("meta", "")
        seo = b.setdefault("seo", {})
        seo.setdefault("desc", "%s by C. M. Taylor. %s" % (b["title"], b.get("tagline", "")))
        seo.setdefault("image", "https://cmtaylorstory.com/" + b["cover"]["src"])
        b["buy"]    = [(x["name"], x["url"]) for x in b.get("buy", [])]
        books.append(b)
    return books, page


BOOKS, BOOKS_PAGE = _load_books()

# The words at the top and foot of the Books index. They live in their own
# file, separate from books-page.json, so the editor can own them outright:
# Decap deletes any field it is not told about when an entry is saved, and the
# shelf order and flag assignments must never be within its reach.
INDEX_COPY = json.load(open(os.path.join(ROOT, "content", "books-index.json"),
                            encoding="utf-8"))


FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500&display=swap" rel="stylesheet">')

# Canonical site nav – identical on every page, explicit colours so it never
# drifts with a page's own variables. `prefix` is "" at site root, "../" in books/.
def topnav(prefix=""):
    items = [("Books", "books", "books"), ("Films", "films", "films"),
             ("Essays", "essays", "essays"), ("About", "about", "about"),
             ("Contact", "contact", "contact")]
    here = ' class="here"'
    links = "\n    ".join(
        '<a href="%s%s"%s>%s</a>' % (prefix, href, here if slug == "books" else "", label)
        for label, href, slug in items)
    # Hoisted out of the f-string: nesting the same quote inside an f-string
    # expression needs Python 3.12, and refresh-essays.sh runs the system
    # /usr/bin/python3, which is 3.9 on this machine.
    home = prefix or "./"
    return (f'<div class="top">\n'
            f'  <a class="name" href="{home}">C. M. Taylor</a>\n'
            f'  <nav>\n    {links}\n  </nav>\n</div>')

NAV_CSS = """
  .top { position: relative; z-index: 6; display: flex; justify-content: space-between; align-items: baseline;
    gap: 18px; padding: clamp(20px, 4vh, 40px) clamp(24px, 5vw, 72px) 0; }
  .top .name { font-family: "EB Garamond", Georgia, serif; letter-spacing: 0.05em;
    font-size: 1.1rem; text-decoration: none; color: #1a191f; white-space: nowrap; }
  .top nav { display: flex; flex-wrap: wrap; gap: clamp(14px, 1.8vw, 28px); }
  .top nav a { color: rgba(26,24,20,0.55); text-decoration: none; font-size: 0.7rem;
    letter-spacing: 0.18em; text-transform: uppercase; transition: color .3s ease;
    border-bottom: 2px solid transparent; padding-bottom: 4px; }
  .top nav a:hover, .top nav a.here { color: #1a191f; }
  .top nav a.here { border-bottom-color: #a83000; }
  .artfoot { position: relative; width: 100%; height: clamp(120px, 20vh, 240px);
    background-size: cover; background-position: center; display: block; }
"""

RESET = f"""
  :root {{
    /* warm paper surface – the work supplies the colour */
    --ink: #f4f1ea; --ink2: #eae4d9; --paper: #1a191f;
    --dim: #5f5a4e; --faint: #928b7a; --line: rgba(20,18,14,0.14);
    --cobalt: #0a18a0; --cerulean: #2078b0; --copper: #a83000; --gold: #9a6200;
    --fd: "EB Garamond", Georgia, serif; --fb: "Inter", -apple-system, "Helvetica Neue", sans-serif;
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  /* decorative glows use negative insets; clip (not hidden, which would
     break position:sticky) so they can't widen the layout viewport on phones */
  html {{ overflow-x: hidden; overflow-x: clip; }}
  html {{ scroll-behavior: smooth; }}
  body {{
    background: var(--ink); color: var(--paper);
    font-family: var(--fb); -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }}
  ::selection {{ background: var(--paper); color: var(--ink); }}
  a {{ color: inherit; text-decoration: none; }}
  .kicker {{ font-size: 0.7rem; letter-spacing: 0.32em; text-transform: uppercase; color: var(--dim); }}
{NAV_CSS}
  /* jacket (real book cover) */
  .jacket {{ position: relative; aspect-ratio: 2 / 3; overflow: hidden; border-radius: 2px;
    box-shadow: 0 34px 60px -34px rgba(28,24,16,0.42), 0 6px 16px -10px rgba(28,24,16,0.28);
    background: #e7e1d5; }}
  .jacket img {{ width: 100%; height: 100%; object-fit: cover; display: block; }}
"""


def jacket(b, prefix=""):
    c = b["cover"]
    src = prefix + c["src"]
    return (f'<figure class="jacket"><img src="{src}" alt="{html.escape(b["title"])} – cover" '
            f'style="object-position:{c["pos"]}"></figure>')


def tagline_dupes_quote(b):
    """True when the tagline just repeats the first press quote (e.g. Floaters'
    'A coming-of-age revenge caper.' is also its Guardian quote) – so we don't
    print it twice."""
    _n = lambda s: s.strip().rstrip(".").strip().lower()
    return any(_n(b["tagline"]) == _n(q[0]) for q in b["quotes"])


# ---------------------------------------------------------------- index -------
def build_index():
    feat = BOOKS[0]
    rest = BOOKS[1:]
    rows = []
    for i, b in enumerate(rest):
        # The featured book above sits jacket-left, so the list has to start on
        # the right to keep the left/right rhythm going all the way down.
        side = "a" if i % 2 else "b"
        q = b["quotes"][0]
        yr = f'<span class="wy">{b["year"]}</span>' if b["year"] else ""
        wtag = "" if tagline_dupes_quote(b) else f'<p class="wtag">{b["tagline"]}</p>'
        rows.append(f"""      <article class="work {side} reveal" style="--ac:{b['accent']}">
        <a class="wjacket" href="books/{b['slug']}">{jacket(b)}</a>
        <div class="wbody">
          <h3><a href="books/{b['slug']}">{html.escape(b['title'])}</a> {yr}</h3>
          {wtag}
          <blockquote class="wquote">“{html.escape(q[0])}”<cite>{html.escape(q[1])}</cite></blockquote>
          <a class="more" href="books/{b['slug']}">Read<span></span></a>
        </div>
      </article>""")
    rows_html = "\n".join(rows)
    fq = feat["quotes"][0]
    ftag = "" if tagline_dupes_quote(feat) else f'<p class="ftag">{feat["tagline"]}</p>'
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{head_meta(BOOKS_INDEX_TITLE, INDEX_DESC,
            "https://cmtaylorstory.com/books",
            "https://cmtaylorstory.com/assets/art/floaters-cover.jpg",
            ld=books_index_ld())}
<title>{BOOKS_INDEX_TITLE}</title>
{FONTS}
<style>{RESET}
  main {{ position: relative; z-index: 1; }}
  /* masthead */
  .mast {{ padding: clamp(30px,7vh,90px) clamp(22px,5vw,64px) clamp(40px,7vh,80px); max-width: 1300px; }}
  .mast .kicker {{ margin-bottom: clamp(20px,3vh,32px); }}
  .mast h1 {{ font-family: var(--fd); font-weight: 400; font-size: clamp(3.4rem, 13vw, 11rem);
    line-height: 0.9; letter-spacing: -0.01em; }}
  .mast h1 em {{ font-style: italic; color: var(--copper); }}
  .mast .lede {{ font-family: var(--fd); font-size: clamp(1.2rem,2.2vw,1.7rem); line-height: 1.5;
    color: #3a382f; max-width: 30em; margin-top: clamp(24px,4vh,44px); }}
  .mast .facts {{ margin-top: 1.8em; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--faint); }}

  /* featured book */
  .feature {{ position: relative; display: grid; grid-template-columns: minmax(0,0.85fr) minmax(0,1.15fr);
    gap: clamp(34px,6vw,90px); align-items: center;
    padding: clamp(40px,8vh,110px) clamp(22px,5vw,64px); max-width: 1300px; margin: 0 auto;
    border-top: 1px solid var(--line); }}
  .feature .fjacket {{ max-width: 320px; }} /* same size as the rest – the lead
    position already gives Floaters its prominence, and 420px read as oversized */
  .feature .fnum {{ font-family: var(--fd); font-size: 0.9rem; letter-spacing: 0.3em; color: {feat['accent']}; }}
  .feature .flabel {{ display:inline-block; font-size:0.66rem; letter-spacing:0.24em; text-transform:uppercase; color: var(--dim); }}
  .feature h2 {{ font-family: var(--fd); font-weight: 400; font-size: clamp(2.8rem,7vw,6rem); line-height: 0.98; margin: 0.35em 0 0.2em; color: {feat['accent']}; }}
  .feature h2 .fy {{ color: var(--faint); font-size: 0.32em; vertical-align: middle; margin-left: 0.5em; letter-spacing: 0.08em; }}
  .feature .ftag {{ font-family: var(--fd); font-style: italic; font-size: clamp(1.3rem,2.6vw,1.9rem); color: var(--paper); margin-bottom: 1.1em; }}
  .feature .fquote {{ font-family: var(--fd); font-size: clamp(1.4rem,2.8vw,2rem); line-height: 1.25; color: var(--paper); max-width: 18em; }}
  .feature .fquote cite {{ display:block; font-family: var(--fb); font-style: normal; font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim); margin-top: 0.9em; }}
  .feature .fnote {{ font-family: var(--fd); margin-top: 1.8em; font-size: 1.15rem;
    line-height: 1.6; color: var(--dim); max-width: 28em; }}

  .more {{ display:inline-flex; align-items:center; gap:0.7em; margin-top: 2em;
    font-size: 0.72rem; letter-spacing: 0.24em; text-transform: uppercase; color: var(--paper);
    border-bottom: 2px solid transparent; padding-bottom: 5px; transition: border-color .4s ease; }}
  .more:hover {{ border-color: var(--ac, var(--copper)); }}

  /* works list */
  .works {{ max-width: 1300px; margin: 0 auto; padding: 0 clamp(22px,5vw,64px) clamp(60px,10vh,140px); }}
  .work {{ display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.1fr); gap: clamp(30px,5vw,80px);
    align-items: center; padding: clamp(46px,8vh,100px) 0; border-top: 1px solid var(--line); }}
  .work.b {{ grid-template-columns: minmax(0,1.1fr) minmax(0,1fr); }}
  .work.b .wjacket {{ order: 2; }}
  .wjacket {{ display: block; max-width: 320px; }}
  .work.b .wjacket {{ margin-left: auto; }}
  .work .jacket {{ transition: transform .6s cubic-bezier(.2,.7,.2,1), box-shadow .6s ease; }}
  .wjacket:hover .jacket {{ transform: translateY(-8px); box-shadow: 0 46px 74px -40px rgba(28,24,16,0.5), 0 12px 24px -12px rgba(28,24,16,0.3); }}
  .wnum {{ font-family: var(--fd); font-size: 0.85rem; letter-spacing: 0.3em; color: var(--ac); }}
  .work h3 {{ font-family: var(--fd); font-weight: 400; font-size: clamp(2.2rem,4.6vw,3.6rem); line-height: 1.0; margin: 0.4em 0 0.35em; }}
  .work h3 a {{ color: var(--ac); transition: opacity .3s ease; }}
  .work h3 a:hover {{ opacity: 0.6; }}
  .work h3 .wy {{ color: var(--faint); font-size: 0.4em; letter-spacing: 0.06em; margin-left: 0.5em; }}
  .work .wtag {{ font-family: var(--fd); font-style: italic; font-size: clamp(1.15rem,2.1vw,1.5rem); color: var(--dim); max-width: 24em; margin-bottom: 1.3em; }}
  .work .wquote {{ font-family: var(--fd); font-size: clamp(1.15rem,2vw,1.45rem); line-height: 1.3; color: var(--paper); max-width: 22em; }}
  .work .wquote cite {{ display:block; font-family: var(--fb); font-style: normal; font-size: 0.66rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim); margin-top: 0.8em; }}

  /* scroll reveal */
  .reveal {{ opacity: 0; transform: translateY(38px); transition: opacity 1s cubic-bezier(.2,.7,.2,1), transform 1s cubic-bezier(.2,.7,.2,1); }}
  .reveal.in {{ opacity: 1; transform: none; }}

  footer.foot {{ border-top: 1px solid var(--line); padding: clamp(40px,7vh,80px) clamp(22px,5vw,64px);
    display: flex; justify-content: space-between; align-items: baseline; max-width: 1300px; margin: 0 auto; }}
  footer.foot .fq {{ font-family: var(--fd); font-style: italic; font-size: clamp(1.1rem,2vw,1.5rem); color: var(--dim); }}
  footer.foot a {{ font-size: 0.7rem; letter-spacing: 0.24em; text-transform: uppercase; color: var(--dim); }}
  footer.foot a:hover {{ color: var(--paper); }}

  /* The colour wash used to live here, and only here, which is what made this
     page look unlike the rest of the site. It moved into cutouts.js, which is
     no longer loaded — Craig asked for the backgrounds to come off on
     12 Aug 2026. Only the stacking contexts it relied on are kept, so the
     content still sits correctly whether or not anything is behind it. */
  .mast {{ position: relative; }}
  .mast > * {{ position: relative; z-index: 1; }}
  .feature, .work {{ position: relative; }}
  .feature > *, .work > * {{ position: relative; z-index: 1; }}



  /* mobile legibility */
  @media (max-width: 700px) {{
    /* tracked uppercase labels fall to 10-11px on a phone; give them a floor */
    .kicker,
    .mast .facts,
    .feature .flabel,
    .feature .fquote cite,
    .more,
    .work .wquote cite,
    footer.foot a {{ font-size: 0.78rem; }}
    /* standalone links need a finger-sized target, not a 14px one */
    .more {{ padding-top: 11px; padding-bottom: 11px; }}
    .top .name, .wordmark, footer.foot a {{ display: inline-block; padding-top: 11px; padding-bottom: 11px; }}
  }}
  @media (max-width: 800px) {{
    .feature, .work, .work.b {{ grid-template-columns: 1fr; }}
    .work.b .wjacket {{ order: 0; margin-left: 0; }}
    .feature .fjacket, .wjacket {{ max-width: 260px; }}
  }}
  @media (prefers-reduced-motion: reduce) {{ .reveal {{ opacity: 1; transform: none; transition: none; }} html {{ scroll-behavior: auto; }} }}
</style>
<!-- Umami: cookieless, no personal data, so no consent banner is needed.
     Loaded with defer so it never delays the page. Craig sees the numbers
     through a share link, not a login. -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="2703f31f-892a-406b-b850-ec44a79ca683"></script>
</head>
<body>

{topnav()}

<main>
  <section class="mast">
    <p class="kicker">{html.escape(INDEX_COPY.get("kicker", ""))}</p>
    <h1>{md(INDEX_COPY.get("h1", ""))}</h1>
    <p class="lede">{md(INDEX_COPY.get("lede", ""))}</p>
    <p class="facts">{html.escape(INDEX_COPY.get("facts", ""))}</p>
  </section>

  <section class="feature reveal" style="--ac:{feat['accent']}">
    <a class="fjacket" href="books/{feat['slug']}">{jacket(feat)}</a>
    <div class="fbody">
      <span class="flabel">Latest</span>
      <h2>{html.escape(feat['title'])}<span class="fy">{feat['year']}</span></h2>
      {ftag}
      <blockquote class="fquote">“{html.escape(fq[0])}”<cite>{html.escape(fq[1])}</cite></blockquote>
      <p class="fnote">{feat['note']}</p>
      <a class="more" href="books/{feat['slug']}">Read<span></span></a>
    </div>
  </section>

  <section class="works">
{rows_html}
  </section>

  <footer class="foot">
    <span class="fq">{html.escape(INDEX_COPY.get("foot", ""))}</span>
    <a href="../">← Home</a>
  </footer>
</main>

<script>
  (function () {{
    var io = new IntersectionObserver(function (es) {{
      es.forEach(function (e) {{ if (e.isIntersecting) {{ e.target.classList.add("in"); io.unobserve(e.target); }} }});
    }}, {{ threshold: 0.16 }});
    document.querySelectorAll(".reveal").forEach(function (el) {{ io.observe(el); }});
    // gentle parallax on the jackets
    var jackets = [].slice.call(document.querySelectorAll(".work .jacket"));
    var ticking = false;
    function frame() {{
      var vh = innerHeight;
      jackets.forEach(function (j) {{
        var r = j.getBoundingClientRect();
        var p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        j.style.transform = (j.parentElement.matches(":hover") ? "translateY(-8px)" : "translateY(" + (p * -18).toFixed(1) + "px)");
      }});
      ticking = false;
    }}
    addEventListener("scroll", function () {{ if (!ticking) {{ ticking = true; requestAnimationFrame(frame); }} }}, {{ passive: true }});
    frame();
  }})();
</script>
<script src="fold-child.js?v=20260901a"></script>
<script src="mobile-nav.js?v=20260729a"></script>
{artfoot("assets/art/flag-2.jpg")}
</body>
</html>
"""


# Retailer links for a book. City of O is out of print (Craig, July 2026) and
# Floaters sells direct through Northern Earth, so both are special-cased rather
# than left blank.
def buy_block(b):
    if b.get("outofprint"):
        return ('    <section class="dbuy">\n'
                '      <p class="dbuylabel">Where to buy</p>\n'
                '      <p class="dbuynone">Currently out of print.</p>\n'
                '    </section>')
    links = b.get("buy") or []
    if not links:
        return ""
    row = "\n".join(
        f'        <li><a href="{href}" target="_blank" rel="noopener">{html.escape(name)}</a></li>'
        for name, href in links)
    return ('    <section class="dbuy">\n'
            '      <p class="dbuylabel">Where to buy</p>\n'
            '      <ul>\n' + row + '\n      </ul>\n'
            '    </section>')


# Social/search head block. Lives here so a rebuild can't drop it – it used to
# be hand-added to the generated files, and regenerating silently wiped it.
def head_meta(title, desc, url, image, og_type="website", ld=None, icon_prefix=""):
    # escape only what breaks a double-quoted attribute – html.escape(quote=True)
    # would also turn apostrophes into &#x27; and litter the copy
    esc = lambda t, quote=True: (t.replace("&", "&amp;").replace("<", "&lt;")
                                  .replace(">", "&gt;").replace('"', "&quot;"))
    out = [
        f'<meta name="description" content="{esc(desc, quote=True)}">',
        f'<link rel="canonical" href="{url}">',
        f'<meta property="og:type" content="{og_type}">',
        '<meta property="og:site_name" content="C. M. Taylor">',
        '<meta property="og:locale" content="en_GB">',
        f'<meta property="og:title" content="{esc(title, quote=True)}">',
        f'<meta property="og:description" content="{esc(desc, quote=True)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{image}">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:site" content="@CMtaylorstory">',
        f'<meta name="twitter:title" content="{esc(title, quote=True)}">',
        f'<meta name="twitter:description" content="{esc(desc, quote=True)}">',
        f'<meta name="twitter:image" content="{image}">',
        '<link rel="icon" href="' + icon_prefix + 'favicon.svg" type="image/svg+xml">',
    ]
    block = "\n".join(out)
    if ld:
        block += f'\n<script type="application/ld+json">{ld}</script>'
    return block


INDEX_DESC = BOOKS_PAGE["index_desc"]

# "Books – C. M. Taylor" spent the whole title on the site name. Naming the form
# and the count earns the space: it matches how people actually search for an
# author they half-remember ("C M Taylor novels") rather than by page label.
BOOKS_INDEX_TITLE = BOOKS_PAGE["index_title"]

# --- Structured data -------------------------------------------------------
# One canonical node for Craig, addressed by @id. Every Book, Movie and page
# that mentions him points at this same @id, so Google merges them into a single
# author entity instead of six unrelated "C. M. Taylor" strings. That merge is
# what a knowledge panel is built from.
PERSON_ID = "https://cmtaylorstory.com/#person"
PERSON_NODE = {
    "@type": "Person",
    "@id": PERSON_ID,
    "name": "C. M. Taylor",
    "alternateName": "Craig Taylor",
    "url": "https://cmtaylorstory.com/",
}


def book_ld(b):
    """The per-book Book node, upgraded from the hand-written seo['ld'].

    The descriptions in BOOKS are Craig's own words, so they are parsed and
    re-emitted rather than regenerated: this only adds the machine-readable
    parts (a stable @id, the publication year, and the author @id reference).
    """
    node = json.loads(b["seo"]["ld"])
    url = "https://cmtaylorstory.com/books/%s" % b["slug"]
    node["@id"] = url + "#book"
    node["author"] = {"@id": PERSON_ID}
    if b.get("year"):
        node["datePublished"] = b["year"]
    return json.dumps({"@context": "https://schema.org",
                       "@graph": [node, PERSON_NODE]}, ensure_ascii=False)


def books_index_ld():
    """books.html: a CollectionPage whose ItemList names all six novels in order.

    An ItemList is what lets Google show the set as a group rather than picking
    one page arbitrarily, and it gives every novel a crawl path from the index
    even though the visible links are the same ones a reader clicks.
    """
    items = [{"@type": "ListItem", "position": i + 1,
              "url": "https://cmtaylorstory.com/books/%s" % b["slug"],
              "name": b["title"]}
             for i, b in enumerate(BOOKS)]
    page = {
        "@type": "CollectionPage",
        "@id": "https://cmtaylorstory.com/books",
        "url": "https://cmtaylorstory.com/books",
        "name": "Books – C. M. Taylor",
        "description": INDEX_DESC,
        "inLanguage": "en",
        "about": {"@id": PERSON_ID},
        "mainEntity": {"@type": "ItemList", "numberOfItems": len(BOOKS),
                       "itemListOrder": "https://schema.org/ItemListOrderDescending",
                       "itemListElement": items},
    }
    return json.dumps({"@context": "https://schema.org",
                       "@graph": [page, PERSON_NODE]}, ensure_ascii=False)

# Colour-field banner closing each page. Craig asked for the visible credit line
# to go (July 2026); the aria-label stays for screen readers.
BOOK_FLAGS = BOOKS_PAGE["flags"]

def artfoot(src):
    return ('<footer class="artfoot" style="background-image:url(\'%s\')" '
            'aria-label="Colour-field painting by C. M. Taylor"></footer>' % src)


# --------------------------------------------------------------- detail -------
def build_book(b):
    quotes = "\n".join(
        f'        <li><blockquote>“{html.escape(q[0])}”<cite>{html.escape(q[1])}</cite></blockquote></li>'
        for q in b["quotes"])
    blurb = "\n".join(f'        <p>{md(p)}</p>' for p in b["blurb"])
    yr = f'<span class="dy">{b["year"]}</span>' if b["year"] else ""
    meta = f'<p class="dmeta">{b["meta"]}</p>' if b["meta"] else ""
    note = f'<p class="dnote">{b["note"]}</p>' if b["note"] else ""
    # Skip the top tagline when it just repeats one of the press quotes below.
    _n = lambda s: s.strip().rstrip(".").strip().lower()
    tag_dup = any(_n(b["tagline"]) == _n(q[0]) for q in b["quotes"])
    dtag = "" if tag_dup else f'<p class="dtag">{b["tagline"]}</p>'
    buy = buy_block(b)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{head_meta(b['title'] + " – C. M. Taylor", b['seo']['desc'],
            "https://cmtaylorstory.com/books/" + b['slug'],
            b['seo']['image'], og_type="book", ld=book_ld(b), icon_prefix="../")}
<title>{html.escape(b['title'])} – C. M. Taylor</title>
{FONTS}
<style>{RESET}
  /* the cut-out backgrounds were removed at Craig's request, 12 Aug 2026;
     cutouts.js is still in the repo if they are ever wanted back */
  main {{ position: relative; z-index: 1; max-width: 720px; margin: 0 auto;
    padding: clamp(40px,7vh,90px) clamp(22px,5vw,64px) clamp(60px,10vh,120px);
    text-align: center; }}
  .dcover {{ max-width: 290px; margin: 0 auto clamp(30px,5vh,54px); }}
  .detail h1 {{ font-family: var(--fd); font-weight: 400; font-size: clamp(2.8rem,6.5vw,5rem); line-height: 0.98; letter-spacing: -0.01em; color: {b['accent']}; }}
  .detail h1 .dy {{ display: block; color: var(--faint); font-size: 0.3em;
    margin: 0.5em 0 0; letter-spacing: 0.06em; line-height: 1.2; }}
  .dtag {{ font-family: var(--fd); font-style: italic; font-size: clamp(1.3rem,2.8vw,1.9rem); line-height: 1.3; color: var(--paper); margin: 0.5em auto 1.2em; max-width: 24em; }}
  .dmeta {{ font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--faint); margin-bottom: 2.4em; }}
  .dbody {{ max-width: 34em; margin: 0 auto; }}
  .dbody p {{ font-family: var(--fd); font-size: clamp(1.12rem,1.9vw,1.32rem);
    line-height: 1.6; color: #3a382f; margin-bottom: 1.05em; }}
  .dbody em {{ font-style: italic; color: var(--paper); }}
  .dquotes {{ max-width: 34em; margin: clamp(30px,5vh,52px) auto 0; border-top: 1px solid var(--line); padding-top: clamp(26px,4vh,40px); }}
  .dquotes ul {{ list-style: none; display: flex; flex-direction: column; gap: 1.7em; }}
  .dquotes blockquote {{ font-family: var(--fd); font-style: italic; font-size: clamp(1.25rem,2.5vw,1.7rem); line-height: 1.3; color: var(--paper); }}
  .dquotes cite {{ display: block; margin-top: 0.5em; font-family: var(--fb); font-style: normal; font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim); }}
  .dnote {{ font-family: var(--fd); margin-top: 2.4em; font-size: 1.08rem; line-height: 1.6;
    color: var(--dim); max-width: 34em; margin-left: auto; margin-right: auto; }}
  .dbuy {{ max-width: 34em; margin: clamp(30px,5vh,52px) auto 0;
    border-top: 1px solid var(--line); padding-top: clamp(26px,4vh,40px); }}
  .dbuylabel {{ font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--dim); margin-bottom: 1.1em; }}
  .dbuy ul {{ list-style: none; display: flex; flex-wrap: wrap; justify-content: center;
    gap: 0.9em clamp(18px,3vw,34px); }}
  .dbuy a {{ font-family: var(--fd); font-size: 1.08rem; color: #3a382f; border-bottom: 1px solid transparent;
    padding-bottom: 2px; transition: border-color .3s ease, color .3s ease; }}
  .dbuy a:hover {{ color: {b['accent']}; border-bottom-color: {b['accent']}; }}
  .dbuynone {{ font-family: var(--fd); font-size: 1.08rem; color: var(--dim); }}
  .backrow {{ margin-top: clamp(36px,5vh,60px); }}
  .backrow a {{ font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim); }}
  .backrow a:hover {{ color: var(--paper); }}
  @media (max-width: 760px) {{ .dcover {{ max-width: 230px; }} }}

  /* mobile legibility */
  @media (max-width: 700px) {{
    .kicker,
    .dmeta,
    .dquotes cite,
    .dbuylabel {{ font-size: 0.78rem; }}
    .backrow a,
    .dbuy a {{ padding-top: 11px; padding-bottom: 11px; }}
    .top .name {{ display: inline-block; padding-top: 11px; padding-bottom: 11px; }}
    .backrow a {{ font-size: 0.78rem; }}
  }}

</style>
<!-- Umami: cookieless, no personal data, so no consent banner is needed.
     Loaded with defer so it never delays the page. Craig sees the numbers
     through a share link, not a login. -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="2703f31f-892a-406b-b850-ec44a79ca683"></script>
</head>
<body>

{topnav("../")}

<main>
  <div class="dcover">{jacket(b, "../")}</div>
  <div class="detail">
    <h1>{html.escape(b['title'])} {yr}</h1>
    {dtag}
    {meta}
    <div class="dbody">
{blurb}
    </div>
    <section class="dquotes">
      <ul>
{quotes}
      </ul>
    </section>
{buy}
    {note}
    <p class="backrow"><a href="../books">← All books</a></p>
  </div>
</main>

<script src="../fold-child.js?v=20260901a"></script>
<script src="../mobile-nav.js?v=20260729a"></script>
{artfoot("../assets/art/" + BOOK_FLAGS.get(b["slug"], "flag-1") + ".jpg")}
</body>
</html>
"""


def main():
    with open(os.path.join(ROOT, "books.html"), "w", encoding="utf-8") as f:
        f.write(build_index())
    os.makedirs(os.path.join(ROOT, "books"), exist_ok=True)
    for b in BOOKS:
        with open(os.path.join(ROOT, "books", b["slug"] + ".html"), "w", encoding="utf-8") as f:
            f.write(build_book(b))
    print("wrote books.html + %d book pages" % len(BOOKS))


if __name__ == "__main__":
    main()
