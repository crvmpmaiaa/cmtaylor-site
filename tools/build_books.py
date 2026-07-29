#!/usr/bin/env python3
"""Generate the Books showcase (books.html) and one page per novel
(books/<slug>.html). Light, warm-paper, gallery-wall treatment – lots of white
space, colour comes from the work (the real jackets). Edit the data here.

Covers are the real book jackets pulled from Craig's original site
(cmtaylorstory.com); Floaters uses its art-edition cover.
"""
import os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BOOKS = [
    dict(slug="floaters", num="01", title="Floaters", year="2026",
         accent="#c0531a",
         cover=dict(type="image", src="assets/art/floaters-cover.jpg", pos="50% 50%"),
         tagline="A coming-of-age revenge caper.",
         blurb=[
             "Set against the UK’s sewage crisis, <em>Floaters</em> is a coming-of-age revenge caper – funny, filthy and quietly furious about the state of the nation’s rivers.",
             "Published in a 215-copy art edition – one for every mile of the Thames – with half of all profits going to Surfers Against Sewage.",
         ],
         quotes=[("A coming-of-age revenge caper.", "The Guardian")],
         meta="Art edition · 215 copies · 2026",
         buy=[("Northern Earth", "https://northernearth.co.uk/product/floaters/")],
         seo=dict(
             desc="Floaters by C. M. Taylor – a funny, filthy coming-of-age revenge caper set against the UK's sewage crisis. A limited art edition; 50% of profits to Surfers Against Sewage.",
             image='https://cmtaylorstory.com/assets/art/floaters-cover.jpg',
             ld='{"@context": "https://schema.org", "@type": "Book", "name": "Floaters", "author": {"@type": "Person", "name": "C. M. Taylor"}, "url": "https://cmtaylorstory.com/books/floaters.html", "image": "https://cmtaylorstory.com/assets/art/floaters-cover.jpg", "inLanguage": "en", "description": "Floaters by C. M. Taylor – a funny, filthy coming-of-age revenge caper set against the UK\'s sewage crisis. A limited art edition; 50% of profits to Surfers Against Sewage."}'),
         note="Sometimes cleaning up means getting dirty first."),

    dict(slug="staying-on", num="02", title="Staying On", year="2018",
         accent="#9a6200",
         cover=dict(type="image", src="assets/covers/staying-on.jpg", pos="50% 50%"),
         tagline="A broken family under an expat sun that never quite warms the bones.",
         blurb=[
             "A geriatric coming-of-age story about Tony and Laney, an old married couple locked in a silent war about going home to England, or staying on in their expat life. They’re stuck – until their self-possessed daughter-in-law turns up to budge them along, and to solve her own long-buried issues.",
             "Every keystroke of <em>Staying On</em> was recorded for the British Library’s Keystroke Project (2014–2018) and preserved in the national collection – a record of a novel’s making that no other living novelist holds.",
         ],
         quotes=[
             ("A melancholy and moving family drama.", "Sunday Mirror"),
             ("Told with humour and enormous compassion… a beguiling story about broken people who have all the feelings and none of the words. Utterly captivating.", "Damien Owens, author of Dead Cat Bounce"),
             ("A trademark sweet-and-sour Mike Leigh film in novel form.", "Matthew Hirtes"),
         ],
         meta="Duckworth · 2018",
         buy=[("Amazon", "https://www.amazon.co.uk/Staying-C-M-Taylor/dp/0715653377"),
              ("Waterstones", "https://www.waterstones.com/book/staying-on/c-m-taylor/9780715653371"),
              ("Blackwell's", "https://blackwells.co.uk/bookshop/product/Staying-On-by-C-M-Taylor-author/9780715653371"),
              ("WHSmith", "https://www.whsmith.co.uk/products/staying-on/9780715653371")],
         seo=dict(
             desc='Staying On (Duckworth, 2018) by C. M. Taylor – a geriatric coming-of-age novel about an old married couple at war over going home to England or staying on abroad.',
             image='https://cmtaylorstory.com/assets/covers/staying-on.jpg',
             ld='{"@context": "https://schema.org", "@type": "Book", "name": "Staying On", "author": {"@type": "Person", "name": "C. M. Taylor"}, "url": "https://cmtaylorstory.com/books/staying-on.html", "image": "https://cmtaylorstory.com/assets/covers/staying-on.jpg", "inLanguage": "en", "description": "Staying On (Duckworth, 2018) by C. M. Taylor – a geriatric coming-of-age novel about an old married couple at war over going home to England or staying on abroad.", "isbn": "9780715653371", "publisher": {"@type": "Organization", "name": "Duckworth"}, "datePublished": "2018"}'),
         note=""),

    dict(slug="premiership-psycho", num="03", title="Premiership Psycho", year="2011",
         accent="#b23a00",
         cover=dict(type="image", src="assets/covers/premiership-psycho.jpg", pos="50% 50%"),
         tagline="American Psycho for the hundred-grand-a-week generation.",
         blurb=[
             "Kev King has the world at his feet – top-flight football, where brands are all, lifestyle is god, and there is nothing and no one that money can’t buy.",
             "Relegated, benched and paranoid about his girlfriend’s rising profile, Kev fights his way back to the top and leaves a trail of destruction behind him. A compelling, hilarious and horrible insight into celebrity culture, and a savage satire of contemporary football.",
         ],
         quotes=[
             ("American Psycho for the hundred-grand-a-week generation.", "FourFourTwo"),
             ("If you get it, you’ll love it… Either way, you’ll have a hoot.", "The Guardian"),
             ("As with all good satire, this dystopian vision inspires laughter and loathing in equal measure.", "Independent on Sunday"),
         ],
         meta="Corsair · 2011",
         buy=[("Amazon", "https://www.amazon.co.uk/Premiership-Psycho-C-M-Taylor/dp/1849015945"),
              ("Hive", "https://www.hive.co.uk/Product/C-M-Taylor/Premiership-Psycho/7065128"),
              ("Little, Brown", "https://www.littlebrown.co.uk/books/detail.page?isbn=9781849015943")],
         seo=dict(
             desc='Premiership Psycho (Corsair, 2011) by C. M. Taylor – a savage satire of Premier League football, brands and excess.',
             image='https://cmtaylorstory.com/assets/covers/premiership-psycho.jpg',
             ld='{"@context": "https://schema.org", "@type": "Book", "name": "Premiership Psycho", "author": {"@type": "Person", "name": "C. M. Taylor"}, "url": "https://cmtaylorstory.com/books/premiership-psycho.html", "image": "https://cmtaylorstory.com/assets/covers/premiership-psycho.jpg", "inLanguage": "en", "description": "Premiership Psycho (Corsair, 2011) by C. M. Taylor – a savage satire of Premier League football, brands and excess.", "isbn": "9781849015943", "publisher": {"@type": "Organization", "name": "Corsair"}, "datePublished": "2011"}'),
         note=""),

    dict(slug="group-of-death", num="04", title="Group of Death", year="2012",
         accent="#7a1f22",
         cover=dict(type="image", src="assets/covers/group-of-death.jpg", pos="50% 50%"),
         tagline="Football is the cruellest game – the Premiership Psycho returns.",
         blurb=[
             "The sequel to <em>Premiership Psycho</em>. Legendary footballer and England captain Kev King takes no prisoners – on the pitch or off it. But Kev’s got a temper, a bad one, and now he’s unjustly accused, losing his place in the squad, hurt and publicly betrayed.",
             "Short of offers, he signs for a two-bit side in the Caucasus and pushes deeper and deeper into the country’s political intrigue. Can he really swap nations and make the Euros – and keep his temper long enough to clear his name? A darkly hilarious tale of football, vengeance, winning and losing.",
         ],
         quotes=[
             ("Very good writing. Bring on the film.", "Plan B"),
         ],
         meta="Corsair · 2012 · sequel to Premiership Psycho",
         buy=[("Amazon (ebook)", "https://www.amazon.co.uk/Group-Death-C-M-Taylor-ebook/dp/B0085869K4"),
              ("Little, Brown", "https://www.littlebrown.co.uk/books/detail.page?isbn=9781472102089")],
         seo=dict(
             desc='Group of Death (Corsair, 2012) by C. M. Taylor – the sequel to Premiership Psycho. Football is the cruellest game.',
             image='https://cmtaylorstory.com/assets/covers/group-of-death.jpg',
             ld='{"@context": "https://schema.org", "@type": "Book", "name": "Group of Death", "author": {"@type": "Person", "name": "C. M. Taylor"}, "url": "https://cmtaylorstory.com/books/group-of-death.html", "image": "https://cmtaylorstory.com/assets/covers/group-of-death.jpg", "inLanguage": "en", "description": "Group of Death (Corsair, 2012) by C. M. Taylor – the sequel to Premiership Psycho. Football is the cruellest game.", "isbn": "9781472102089", "publisher": {"@type": "Organization", "name": "Corsair"}, "datePublished": "2012"}'),
         note=""),

    dict(slug="light", title="Light", num="05", year="2005 (republished 2021)",
         accent="#2078b0",
         cover=dict(type="image", src="assets/covers/light.jpg", pos="50% 50%"),
         tagline="Strange, luminous and hard to shelve.",
         blurb=[
             "Beautifully written, touching, irreverent and surprising, <em>Light</em> is a compelling exploration of the tangled lives of a group of young artists and friends in the 1990s.",
             "Set against the backdrop of the decade’s e-commerce boom, tragic and riotous by turns and packed with complex relationships, humour and heartbreak – a book for anyone who ever struggled to find their place in the world. Reissued in a new edition, illustrated with the author’s own primitivist drawings.",
         ],
         quotes=[
             ("Before you know it you’ve read 100 pages in a sitting. Extremely compelling and delightfully unusual.", "Time Out, London"),
         ],
         meta="Novel · reissued edition",
         buy=[("Amazon", "https://www.amazon.co.uk/dp/1838043047"),
              ("Hive", "https://www.hive.co.uk/Product/C-M-Taylor/Light/25711607"),
              ("Barnes & Noble", "https://www.barnesandnoble.com/w/light-kim-taylor/1005924570?ean=9781838043049")],
         seo=dict(
             desc='Light by C. M. Taylor – a compelling exploration of the tangled lives of a group of young artists and friends in the 1990s. Republished in a new edition.',
             image='https://cmtaylorstory.com/assets/covers/light.jpg',
             ld='{"@context": "https://schema.org", "@type": "Book", "name": "Light", "author": {"@type": "Person", "name": "C. M. Taylor"}, "url": "https://cmtaylorstory.com/books/light.html", "image": "https://cmtaylorstory.com/assets/covers/light.jpg", "inLanguage": "en", "description": "Light by C. M. Taylor – a compelling exploration of the tangled lives of a group of young artists and friends in the 1990s. Republished in a new edition.", "isbn": "9781838043049", "datePublished": "2005"}'),
         note=""),

    dict(slug="city-of-o", title="City of O", num="06", year="2005 (republished 2020)",
         accent="#0a18a0",
         cover=dict(type="image", src="assets/covers/city-of-o.jpg", pos="50% 50%"),
         tagline="A dystopian satire of breathtaking originality.",
         blurb=[
             "A unique dystopia, a remarkable psychological fantasy, an absurdist satire. Arriving orphaned in the City of O, traumatised Juan enters a corrupting world of whimsical plastic surgery, bespoke narcotics and berserk tech-sex.",
             "He ascends the social hierarchy, gaining money and power until the city thrills to his every move – but he’s falling apart, and perhaps only a picaresque troupe of troubadours adventuring comically across the desert to find him can help. First published in 2005 as <em>Grief</em>, under the name Ed Lark, and nominated for the British Science Fiction Association’s Best Book of the Year; republished in a new edition in 2020 as <em>City of O</em>.",
         ],
         quotes=[
             ("A magnificent novel… a satire of quite astonishing originality.", "British Science Fiction Association"),
             ("Surreal, absurd and frequently hilarious.", "The Mechanics’ Institute Review"),
         ],
         meta="2020 · first published 2005 as Grief",
         buy=[], outofprint=True,
         seo=dict(
             desc='City of O by C. M. Taylor – a unique dystopia and absurdist satire of breathtaking originality, republished in a new edition.',
             image='https://cmtaylorstory.com/assets/covers/city-of-o.jpg',
             ld='{"@context": "https://schema.org", "@type": "Book", "name": "City of O", "author": {"@type": "Person", "name": "C. M. Taylor"}, "url": "https://cmtaylorstory.com/books/city-of-o.html", "image": "https://cmtaylorstory.com/assets/covers/city-of-o.jpg", "inLanguage": "en", "description": "City of O by C. M. Taylor – a unique dystopia and absurdist satire of breathtaking originality, republished in a new edition."}'),
         note=""),
]

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500&display=swap" rel="stylesheet">')

# Canonical site nav – identical on every page, explicit colours so it never
# drifts with a page's own variables. `prefix` is "" at site root, "../" in books/.
def topnav(prefix=""):
    items = [("Books", "books.html", "books"), ("Films", "films.html", "films"),
             ("Essays", "essays.html", "essays"), ("About", "about.html", "about"),
             ("Contact", "contact.html", "contact")]
    here = ' class="here"'
    links = "\n    ".join(
        '<a href="%s%s"%s>%s</a>' % (prefix, href, here if slug == "books" else "", label)
        for label, href, slug in items)
    return (f'<div class="top">\n'
            f'  <a class="name" href="{prefix}index.html">C. M. Taylor</a>\n'
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
        <a class="wjacket" href="books/{b['slug']}.html">{jacket(b)}</a>
        <div class="wbody">
          <h3><a href="books/{b['slug']}.html">{html.escape(b['title'])}</a> {yr}</h3>
          {wtag}
          <blockquote class="wquote">“{html.escape(q[0])}”<cite>{html.escape(q[1])}</cite></blockquote>
          <a class="more" href="books/{b['slug']}.html">Read<span></span></a>
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
{head_meta("Books – C. M. Taylor", INDEX_DESC,
            "https://cmtaylorstory.com/books.html",
            "https://cmtaylorstory.com/assets/art/floaters-cover.jpg")}
<title>Books – C. M. Taylor</title>
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
  .feature .fnote {{ margin-top: 1.8em; font-size: 0.92rem; line-height: 1.6; color: var(--dim); max-width: 28em; }}

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

  /* ── colour: gentle washes from the flag palette (deep, not neon) ── */
  .mast {{ position: relative; }}
  .mast > * {{ position: relative; z-index: 1; }}
  .mast::before {{ content:""; position:absolute; z-index:0; inset:-24% -14% -34% -14%; pointer-events:none;
    background:
      radial-gradient(38% 46% at 12% 28%, rgba(10,24,160,0.13), transparent 70%),
      radial-gradient(42% 52% at 86% 14%, rgba(168,48,0,0.12), transparent 70%),
      radial-gradient(46% 58% at 62% 98%, rgba(154,98,0,0.10), transparent 72%);
    filter: blur(8px); }}

  .feature, .work {{ position: relative; }}
  .feature > *, .work > * {{ position: relative; z-index: 1; }}
  .feature::before, .work::before {{ content:""; position:absolute; z-index:0; top:50%;
    width: min(58vw, 660px); aspect-ratio: 1; border-radius: 50%; transform: translateY(-50%);
    background: radial-gradient(circle, var(--ac) 0%, transparent 62%); opacity: 0.10;
    filter: blur(30px); left: -14%; pointer-events:none; }}
  .work.b::before {{ left: auto; right: -14%; }}

  @media (max-width: 800px) {{
    .feature, .work, .work.b {{ grid-template-columns: 1fr; }}
    .work.b .wjacket {{ order: 0; margin-left: 0; }}
    .feature .fjacket, .wjacket {{ max-width: 260px; }}
  }}
  @media (prefers-reduced-motion: reduce) {{ .reveal {{ opacity: 1; transform: none; transition: none; }} html {{ scroll-behavior: auto; }} }}
</style>
</head>
<body>

{topnav()}

<main>
  <section class="mast">
    <p class="kicker">Fiction · Six novels</p>
    <h1>The <em>Novels</em></h1>
    <p class="lede">Sharp comedy and quiet fury – satire, speculative fiction and sweet-and-sour family drama. Two optioned for the screen; one recorded, keystroke by keystroke, for the British Library.</p>
    <p class="facts">2005 – 2026 · C. M. Taylor</p>
  </section>

  <section class="feature reveal" style="--ac:{feat['accent']}">
    <a class="fjacket" href="books/{feat['slug']}.html">{jacket(feat)}</a>
    <div class="fbody">
      <span class="flabel">Latest</span>
      <h2>{html.escape(feat['title'])}<span class="fy">{feat['year']}</span></h2>
      {ftag}
      <blockquote class="fquote">“{html.escape(fq[0])}”<cite>{html.escape(fq[1])}</cite></blockquote>
      <p class="fnote">{feat['note']}</p>
      <a class="more" href="books/{feat['slug']}.html">Read<span></span></a>
    </div>
  </section>

  <section class="works">
{rows_html}
  </section>

  <footer class="foot">
    <span class="fq">“You’ll have a hoot.” – The Guardian</span>
    <a href="index.html">← Home</a>
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
<script src="fold-child.js?v=20260727a"></script>
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
def head_meta(title, desc, url, image, og_type="website", ld=None):
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
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
    ]
    block = "\n".join(out)
    if ld:
        block += f'\n<script type="application/ld+json">{ld}</script>'
    return block


INDEX_DESC = ("The novels of C. M. Taylor – Floaters, Staying On, Premiership Psycho, "
              "Group of Death, Light and City of O – with where to buy each.")

# Colour-field banner closing each page. Craig asked for the visible credit line
# to go (July 2026); the aria-label stays for screen readers.
BOOK_FLAGS = {"floaters": "flag-2", "staying-on": "flag-2",
              "premiership-psycho": "flag-1", "group-of-death": "flag-3",
              "light": "flag-4", "city-of-o": "flag-1"}

def artfoot(src):
    return ('<footer class="artfoot" style="background-image:url(\'%s\')" '
            'aria-label="Colour-field painting by C. M. Taylor"></footer>' % src)


# --------------------------------------------------------------- detail -------
def build_book(b):
    quotes = "\n".join(
        f'        <li><blockquote>“{html.escape(q[0])}”<cite>{html.escape(q[1])}</cite></blockquote></li>'
        for q in b["quotes"])
    blurb = "\n".join(f'        <p>{p}</p>' for p in b["blurb"])
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
            "https://cmtaylorstory.com/books/" + b['slug'] + ".html",
            b['seo']['image'], og_type="book", ld=b['seo']['ld'])}
<title>{html.escape(b['title'])} – C. M. Taylor</title>
{FONTS}
<style>{RESET}
  .atmos {{ position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(52% 58% at 82% 8%, {b['accent']}, transparent 60%),
      radial-gradient(48% 54% at 6% 94%, {b['accent']}, transparent 58%);
    opacity: 0.12; filter: blur(26px); }}
  main {{ position: relative; z-index: 1; max-width: 720px; margin: 0 auto;
    padding: clamp(40px,7vh,90px) clamp(22px,5vw,64px) clamp(60px,10vh,120px);
    text-align: center; }}
  .dcover {{ max-width: 290px; margin: 0 auto clamp(30px,5vh,54px); }}
  .detail h1 {{ font-family: var(--fd); font-weight: 400; font-size: clamp(2.8rem,6.5vw,5rem); line-height: 0.98; letter-spacing: -0.01em; color: {b['accent']}; }}
  .detail h1 .dy {{ color: var(--faint); font-size: 0.34em; vertical-align: middle; margin-left: 0.5em; letter-spacing: 0.06em; }}
  .dtag {{ font-family: var(--fd); font-style: italic; font-size: clamp(1.3rem,2.8vw,1.9rem); line-height: 1.3; color: var(--paper); margin: 0.5em auto 1.2em; max-width: 24em; }}
  .dmeta {{ font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--faint); margin-bottom: 2.4em; }}
  .dbody {{ max-width: 34em; margin: 0 auto; }}
  .dbody p {{ font-size: 1.05rem; line-height: 1.7; color: #3a382f; margin-bottom: 1.15em; }}
  .dbody em {{ font-style: italic; color: var(--paper); }}
  .dquotes {{ max-width: 34em; margin: clamp(30px,5vh,52px) auto 0; border-top: 1px solid var(--line); padding-top: clamp(26px,4vh,40px); }}
  .dquotes ul {{ list-style: none; display: flex; flex-direction: column; gap: 1.7em; }}
  .dquotes blockquote {{ font-family: var(--fd); font-style: italic; font-size: clamp(1.25rem,2.5vw,1.7rem); line-height: 1.3; color: var(--paper); }}
  .dquotes cite {{ display: block; margin-top: 0.5em; font-family: var(--fb); font-style: normal; font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim); }}
  .dnote {{ margin-top: 2.4em; font-size: 0.92rem; line-height: 1.6; color: var(--dim); max-width: 34em; margin-left: auto; margin-right: auto; }}
  .dbuy {{ max-width: 34em; margin: clamp(30px,5vh,52px) auto 0;
    border-top: 1px solid var(--line); padding-top: clamp(26px,4vh,40px); }}
  .dbuylabel {{ font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--dim); margin-bottom: 1.1em; }}
  .dbuy ul {{ list-style: none; display: flex; flex-wrap: wrap; justify-content: center;
    gap: 0.9em clamp(18px,3vw,34px); }}
  .dbuy a {{ font-size: 0.95rem; color: #3a382f; border-bottom: 1px solid transparent;
    padding-bottom: 2px; transition: border-color .3s ease, color .3s ease; }}
  .dbuy a:hover {{ color: {b['accent']}; border-bottom-color: {b['accent']}; }}
  .dbuynone {{ font-size: 0.95rem; color: var(--dim); }}
  .backrow {{ margin-top: clamp(36px,5vh,60px); }}
  .backrow a {{ font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim); }}
  .backrow a:hover {{ color: var(--paper); }}
  @media (max-width: 760px) {{ .dcover {{ max-width: 230px; }} }}
</style>
</head>
<body>
<div class="atmos" aria-hidden="true"></div>

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
    <p class="backrow"><a href="../books.html">← All books</a></p>
  </div>
</main>

<script src="../fold-child.js?v=20260727a"></script>
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
