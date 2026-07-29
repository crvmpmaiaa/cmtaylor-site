# C. M. Taylor site – first look, for Craig

A walkthrough of what we've built so far, what we still need from you, and a few
things to get your steer on. Nothing here is final – it's a draft to react to.

---

## What's in the build

**Identity & look**
- Typeset in EB Garamond (the serif) and Inter, with a palette pulled straight
  from your own flag paintings – cobalt, cerulean, copper, gold.
- Your paintings do real work across the site: the **book jackets are cut from
  them**, they run as **art footers** on every sub-page, and the **favicon** (the
  little browser-tab icon) is the four flag colours.

**Homepage**
- A full-screen **cinematic video hero** that plays your footage, cycling to a
  different clip on each visit. Muted by default with an opt-in **sound toggle**.
- A "**fold**" page-turn transition between sections (the page peels/turns like a
  page rather than a hard cut).
- Tagline under your name: *"Funny writing · Odd films."*

**Books**
- Each novel has its jacket, blurb and pull-quotes, plus a **"Where to buy"** row
  of retailer links (Amazon, Waterstones, Hive, etc.), taken from your old site.
- *Floaters* is featured at the top as the art-edition.

**Films – "A Slow and Spurious Film"**
- A films index plus an individual page per film (Vimeo embed, logline, and your
  **festival laurels** displayed).

**About**
- Your new bio, the press quotes, the teaching detail, and a tidy
  **"Selected writing, interviews & events"** archive that preserves *all* the
  past-work links from your old About and Teaching pages.

**Essays – the automatic Substack page** ⭐
- The Essays page ("**As Best I Can**") is generated **automatically from your
  live Substack feed** – when you publish on Substack, the post appears here on
  its own, no manual updating. (On WordPress this is handled by a feed-to-post
  plugin.) There's a prominent *Subscribe free* call to action.

**Under the hood**
- Full **SEO**: page titles/descriptions, **structured data** so Google can build
  your author "knowledge panel" and show book/film rich results, a sitemap, and
  proper **social-share cards** (nice link previews when the site is shared).
- Performance passes (crisp-but-lighter images, lazy-loading).

---

## What we still need from you

- **The Morning Run** has no poster/thumbnail image yet (the other three films
  do). Could you send one?
- **The "flags" film** isn't on the site – we don't have it. If it's to go in,
  we need the Vimeo link, a logline, a poster and any festival laurels.
- **Buy links for *City of O* and *Floaters*** – your old site had none for these.
  Where should people buy them? (And *City of O*'s ISBN if it has one.)
- **Festival laurels** – the ones we have are an inconsistent mix (some black,
  some white, some full colour), so a few don't read cleanly on the dark film
  pages (we've put them on light chips as a stopgap). If festivals supplied
  **white / transparent versions**, send those and they'll sit perfectly.
- Confirm the **full list of films** is the four we have (Analogue Digital Dead
  Alive, Le Jazz, The Library of Unwritten Books, The Morning Run) + the flags one.
- Confirm your **X/Twitter handle** (we've used @CMtaylorstory) and any other
  socials you want linked.
- *Analogue Digital Dead Alive* – do you still want that one **password-gated**?

## Decisions we'd love your call on

- **Book-page dividers** – we're trialling slim strips of one of your paintings
  as the rules between books. Keep, or go back to a plain hairline?
- **Film-grain / "whitenoise" texture** over the sub-pages – keep it, make it
  stronger/subtler, or drop it?
- The homepage **tagline** – happy with "Funny writing · Odd films"?
- Anything on **tone, wording or structure** you'd change – this is your voice,
  so shout.
- A **buy-direct / print-on-demand** shop was flagged for down the line – worth
  planning for, or park it?

---

## Notes for us (Jack / build side)

- **Homepage videos are heavy** (WalkCut ~41 MB; genuinely high-bitrate 1080p,
  not over-compressed – a quality re-encode saved nothing). Only one plays per
  visit. If load speed matters, options are: compress harder (a small quality
  trade-off on Craig's footage – his call), serve 720p, or show a poster frame
  first and load the video after. Left untouched for now.
- Going onto Craig's **WordPress**: internal links are relative so the folder is
  portable, but canonical/sitemap URLs assume `cmtaylorstory.com/….html`. If WP
  serves clean URLs (no `.html`) we update those in one pass once the URL scheme
  is known.
- Minor code tidy-ups outstanding (a couple of duplicated CSS blocks in page
  headers) – harmless, cosmetic, to sweep later.
