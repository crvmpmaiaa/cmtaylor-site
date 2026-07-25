#!/usr/bin/env python3
"""
Fetch C. M. Taylor's 'As Best I Can' Substack feed and (re)generate essays.html.

Standalone: fetches the feed itself, parses it, writes the page. No external
deps beyond the Python standard library. Safe to run on a schedule (cron) —
this is the local proof-of-concept for the weekly auto-update. In the WordPress
build the same job is done by a feed-to-post plugin against the same feed.

Usage:  python3 build_essays.py
"""
import urllib.request, xml.etree.ElementTree as ET
import re, html, json, datetime, sys, os

FEED = "https://cmtaylorstory.substack.com/feed"
SUB  = "https://cmtaylorstory.substack.com"
OUT  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "essays.html")

# ---- one place to change the typography ------------------------------------
FONTS_LINK = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
 '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
 '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&'
 'family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&'
 'family=Inter:wght@400;500&display=swap" rel="stylesheet">')
SERIF = '"Newsreader", Georgia, serif'   # editorial serif (was Cormorant)
# ----------------------------------------------------------------------------


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (cmtaylor-site refresh)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def parse(xml_bytes):
    chan = ET.fromstring(xml_bytes).find("channel")
    posts = []
    for it in chan.findall("item"):
        title = (it.findtext("title") or "").strip()
        link  = it.findtext("link") or ""
        ce = it.findtext("{http://purl.org/rss/1.0/modules/content/}encoded") or ""
        desc = it.findtext("description") or ""
        plain = re.sub(r"\s+", " ", re.sub("<[^>]+>", "", html.unescape(desc))).strip()
        # prefer an in-body image; only fall back to an enclosure if it's an image
        m = re.search(r'<img[^>]+src="([^"]+)"', ce)
        img = m.group(1) if m else ""
        if not img:
            enc = it.find("enclosure")
            if enc is not None and "image" in (enc.get("type") or ""):
                img = enc.get("url")
        posts.append(dict(title=title, link=link, summary=plain[:180], img=img,
                          date=fmtdate(it.findtext("pubDate") or "")))
    return posts


def fmtdate(pub):
    try:
        d = datetime.datetime.strptime(pub[:25].strip(), "%a, %d %b %Y %H:%M:%S")
        return d.strftime("%-d %B %Y")
    except Exception:
        return pub


def esc(s):
    return html.escape(s or "")


def render(posts):
    feat = posts[0]
    rest = posts[1:13]
    cards = "\n".join(f'''      <a class="card" href="{esc(p['link'])}" target="_blank" rel="noopener">
        <div class="thumb"><img loading="lazy" src="{esc(p['img'])}" alt=""></div>
        <p class="date">{esc(p['date'])}</p>
        <h3>{esc(p['title'])}</h3>
        <p class="sub">{esc(p['summary'])}</p>
      </a>''' for p in rest)

    stamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Essays — C. M. Taylor</title>
{FONTS_LINK}
<!--
  ESSAYS / "As Best I Can" — auto-generated from the live Substack feed
  ({FEED}). Last refreshed: {stamp}.
  Local proof-of-concept: tools/build_essays.py, run weekly by cron. In the
  WordPress build the same job is done by a feed-to-post plugin.
-->
<style>
  :root {{
    --gold: #a86000; --ink: #1b1b1e; --paper: #f4f1ea;
    --line: #e0dacd; --muted: #6f6a5f;
  }}
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ background:var(--paper); color:var(--ink);
    font-family:"Inter",-apple-system,"Helvetica Neue",sans-serif;
    -webkit-font-smoothing:antialiased; }}
  a {{ color:inherit; }}

  .top {{ display:flex; justify-content:space-between; align-items:baseline;
    padding:clamp(20px,4vh,40px) clamp(24px,5vw,72px); border-bottom:1px solid var(--line); }}
  .top .name {{ font-family:"Cinzel",Georgia,serif; text-transform:uppercase;
    letter-spacing:0.14em; font-size:0.95rem; text-decoration:none; }}
  .top nav {{ display:flex; gap:28px; }}
  .top nav a {{ color:var(--muted); text-decoration:none; font-size:0.7rem;
    letter-spacing:0.18em; text-transform:uppercase; transition:color .3s ease; }}
  .top nav a:hover, .top nav a.here {{ color:var(--ink); }}
  .top nav a.here {{ border-bottom:2px solid var(--gold); padding-bottom:4px; }}

  header.intro {{ max-width:1180px; margin:0 auto;
    padding:clamp(56px,12vh,120px) clamp(24px,5vw,72px) clamp(40px,7vh,72px);
    display:grid; grid-template-columns:1.3fr 1fr; gap:clamp(32px,6vw,80px); align-items:end; }}
  .kicker {{ font-size:0.68rem; letter-spacing:0.24em; text-transform:uppercase;
    color:var(--gold); margin-bottom:1.4em; }}
  h1 {{ font-family:"Cinzel",Georgia,serif; text-transform:uppercase; font-weight:500;
    font-size:clamp(2.1rem,5.2vw,4rem); letter-spacing:0.06em; line-height:1.12; }}
  .intro .blurb {{ font-family:{SERIF}; font-weight:300; font-style:italic;
    font-size:clamp(1.1rem,1.5vw,1.35rem); line-height:1.5; color:#3a382f; }}
  .subscribe {{ margin-top:1.6em; display:flex; gap:12px; flex-wrap:wrap; }}
  .subscribe a {{ display:inline-block; background:var(--ink); color:var(--paper);
    text-decoration:none; font-size:0.72rem; letter-spacing:0.16em; text-transform:uppercase;
    padding:14px 26px; transition:background .3s ease; }}
  .subscribe a:hover {{ background:var(--gold); }}

  .featured {{ max-width:1180px; margin:0 auto; padding:0 clamp(24px,5vw,72px); }}
  .featured a {{ display:grid; grid-template-columns:1.15fr 1fr; gap:clamp(24px,4vw,56px);
    text-decoration:none; align-items:center; border-top:1px solid var(--line);
    border-bottom:1px solid var(--line); padding:clamp(28px,4vw,48px) 0; }}
  .featured .thumb {{ aspect-ratio:16/10; overflow:hidden; background:#e8e3d6; }}
  .featured img {{ width:100%; height:100%; object-fit:cover; display:block; transition:transform 1.2s ease; }}
  .featured a:hover img {{ transform:scale(1.03); }}
  .featured .date {{ font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase;
    color:var(--gold); margin-bottom:1em; }}
  .featured h2 {{ font-family:{SERIF}; font-style:italic; font-weight:400;
    font-size:clamp(1.9rem,3.4vw,2.9rem); line-height:1.12; margin-bottom:0.5em; }}
  .featured .sub {{ font-size:0.95rem; line-height:1.6; color:#4a473d; max-width:34em; margin-bottom:1.4em; }}
  .featured .more {{ font-size:0.7rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--ink); }}

  .grid-wrap {{ max-width:1180px; margin:0 auto;
    padding:clamp(48px,8vh,90px) clamp(24px,5vw,72px) clamp(60px,10vh,120px); }}
  .grid-head {{ display:flex; justify-content:space-between; align-items:baseline;
    margin-bottom:clamp(28px,4vh,44px); }}
  .grid-head h2 {{ font-family:"Cinzel",Georgia,serif; text-transform:uppercase;
    font-weight:500; font-size:0.95rem; letter-spacing:0.12em; }}
  .grid-head a {{ font-size:0.68rem; letter-spacing:0.16em; text-transform:uppercase;
    color:var(--muted); text-decoration:none; }}
  .grid-head a:hover {{ color:var(--gold); }}
  .grid {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr));
    gap:clamp(28px,3vw,44px); }}
  .card {{ text-decoration:none; display:block; }}
  .card .thumb {{ aspect-ratio:3/2; overflow:hidden; background:#e8e3d6; margin-bottom:1.1em; }}
  .card img {{ width:100%; height:100%; object-fit:cover; display:block; transition:transform 1s ease; }}
  .card:hover img {{ transform:scale(1.04); }}
  .card .date {{ font-size:0.64rem; letter-spacing:0.2em; text-transform:uppercase;
    color:var(--gold); margin-bottom:0.7em; }}
  .card h3 {{ font-family:{SERIF}; font-weight:500; font-size:1.35rem; line-height:1.2;
    margin-bottom:0.4em; }}
  .card .sub {{ font-size:0.82rem; line-height:1.55; color:#5a564b; }}

  footer {{ border-top:1px solid var(--line);
    padding:clamp(36px,6vh,64px) clamp(24px,5vw,72px); text-align:center; }}
  footer p {{ font-family:{SERIF}; font-style:italic; font-weight:300;
    font-size:1.3rem; color:#3a382f; margin-bottom:1.4em; }}
  footer a {{ display:inline-block; background:var(--ink); color:var(--paper); text-decoration:none;
    font-size:0.72rem; letter-spacing:0.16em; text-transform:uppercase; padding:14px 26px; }}
  footer a:hover {{ background:var(--gold); }}

  @media (max-width:820px) {{
    header.intro {{ grid-template-columns:1fr; }}
    .featured a {{ grid-template-columns:1fr; }}
  }}
</style>
</head>
<body>

<div class="top">
  <a class="name" href="index.html">C. M. Taylor</a>
  <nav>
    <a href="#">Books</a>
    <a href="films.html">Films</a>
    <a class="here" href="essays.html">Essays</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>
</div>

<header class="intro">
  <div>
    <p class="kicker">Essays · a Substack, ongoing</p>
    <h1>As Best I Can</h1>
  </div>
  <div>
    <p class="blurb">A candid view on art, writing and the reality of creation — named for the motto of the fifteenth-century Flemish painter Jan van Eyck, <em>als ich kan</em>. Notes from a working novelist, filmmaker and academic, published most weeks.</p>
    <p class="subscribe"><a href="{SUB}" target="_blank" rel="noopener">Subscribe free</a></p>
  </div>
</header>

<section class="featured">
  <a href="{esc(feat['link'])}" target="_blank" rel="noopener">
    <div class="thumb"><img src="{esc(feat['img'])}" alt=""></div>
    <div>
      <p class="date">Latest · {esc(feat['date'])}</p>
      <h2>{esc(feat['title'])}</h2>
      <p class="sub">{esc(feat['summary'])}</p>
      <span class="more">Read the essay →</span>
    </div>
  </a>
</section>

<section class="grid-wrap">
  <div class="grid-head">
    <h2>More from the archive</h2>
    <a href="{SUB}/archive" target="_blank" rel="noopener">Every essay →</a>
  </div>
  <div class="grid">
{cards}
  </div>
</section>

<footer>
  <p>“As best I can.”</p>
  <a href="{SUB}" target="_blank" rel="noopener">Subscribe on Substack</a>
</footer>

<script src="fold-child.js?v=20260725a"></script>
</body>
</html>'''


def main():
    try:
        posts = parse(fetch(FEED))
    except Exception as e:
        print(f"[refresh] FEED FETCH/PARSE FAILED: {e}", file=sys.stderr)
        return 1
    if not posts:
        print("[refresh] feed returned no posts; leaving existing page untouched", file=sys.stderr)
        return 1
    open(OUT, "w").write(render(posts))
    print(f"[refresh] wrote {OUT} — {len(posts)} posts, latest: {posts[0]['title']!r}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
