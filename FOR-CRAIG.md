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
- Stripped back to just your name and three links, per your steer.

**Books**
- Each novel has its jacket, blurb and pull-quotes, plus a **"Where to buy"** row
  of retailer links (Amazon, Waterstones, Hive, etc.), taken from your old site.
- *Floaters* is featured at the top as the art-edition.

**Films – "Slow and Spurious Films"**
- A films index plus an individual page per film (Vimeo embed, logline, year and
  runtime, and your **festival laurels** displayed). Films are stacked newest
  first, flush left, with large posters.

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

- **The Other Side of Boredom** – we have your new poster request noted but not
  the file yet; the film currently shows as a text card. Send it over and it
  drops straight in.
- **The Flags of Nalbandia** – now on the site (poster, logline, 2026 · 10 mins),
  festival-exclusive so poster-only like *Le Jazz*. You mentioned you'd write a
  bit more text for it – whenever you're ready.
- **The new Le Jazz laurel** – noted, not yet in hand.
- **Festival laurels generally** – still an inconsistent mix (black, white,
  colour). We now force them all to a uniform white silhouette, which works, but
  proper white/transparent versions would be better if festivals supplied them.
- **City of O** – marked as out of print. Say the word if that changes.
- Confirm your **X/Twitter handle** (we've used @CMtaylorstory) and any other
  socials you want linked.

## Decisions we'd love your call on

- **Book-page dividers** – worth knowing that the painting strips we thought we
  were trialling were never actually rendering (a CSS rule further down the file
  was overriding them), so what you've been looking at is the plain hairline.
  Happy to build the painting strips properly if you'd like to see them.
- **Homepage sound** – see the note in Jack's reply. Short version: browsers
  refuse to autoplay video with sound, so it can't simply be on by default, but
  we can make it remember your choice and make the button far more obvious.
- Anything on **tone, wording or structure** you'd change – this is your voice,
  so shout.
- A **buy-direct / print-on-demand** shop was flagged for down the line – worth
  planning for, or park it?

---

## Notes for us (Jack / build side)

- **Homepage videos**: dropping WalkCut (the river one) also removed the
  heaviest file at ~41 MB. The rotation is five clips pending a replacement.
  Remaining weight is fine; Walk2Cut is the largest at ~24 MB and only one
  clip loads per visit.
- **Buy links** are now actually on the book pages. The previous version of
  this document claimed they were, but they had never been wired in – the data
  sat unused in content/buy-links.md.
- **build_books.py was lossy**: running it wiped SEO meta, JSON-LD and the art
  footers, all of which had been hand-added to the generated output. It now
  emits everything, so a rebuild is safe. Worth remembering that books.html and
  books/*.html are GENERATED – edit the generator, never the output.
- Going onto Craig's **WordPress**: internal links are relative so the folder is
  portable, but canonical/sitemap URLs assume `cmtaylorstory.com/….html`. If WP
  serves clean URLs (no `.html`) we update those in one pass once the URL scheme
  is known.
- Minor code tidy-ups outstanding (a couple of duplicated CSS blocks in page
  headers) – harmless, cosmetic, to sweep later.
- Film detail pages had dead `href="#"` nav links for Books/Essays/About/
  Contact. Fixed this round.
