/* ==========================================================================
   C. M. Taylor — the page turn
   --------------------------------------------------------------------------
   The turn is done with ordinary CSS transforms on the real page, in two
   halves: the page you are leaving slides off, then the page you arrive at
   slides in from the opposite side. Nothing here depends on the browser
   photographing the page.

   That is the whole point. This was built on cross-document View Transitions
   first, and they looked right for a few navigations and then began flashing
   the destination full-screen — because the entire transition is painted over
   the LIVE destination document, so any failure to produce a snapshot reveals
   it. Snapshot reliability degrades as a session accumulates compositor work,
   which is why it only started after a few clicks, and every layer we could
   paint was itself downstream of a snapshot succeeding.

   Real DOM cannot fail that way: there is no snapshot to miss, whatever shows
   behind a moving page is that page's own root colour, and it behaves the same
   in every browser rather than only in Chrome.

   Direction follows the nav — Books · Films · Essays · About · Contact, with
   the homepage before them:
     • click something to the LEFT of where you are  → going back
     • click something to the RIGHT of where you are → going on
   A detail page counts as its section, with depth breaking the tie, so opening
   a novel goes on and returning to its index goes back.
   ========================================================================== */
(function () {
  "use strict";

  var HALF = 360;                      // ms per half; 2 x 360 = the old 0.72s
  var EASE = "cubic-bezier(.66, 0, .34, 1)";
  var KEY = "cmt-turn-dir";            // direction handed to the next page
  var BG = "cmt-turn-bg";              // and the colour it was painted
  var ORDER = ["", "books", "films", "essays", "about", "contact"];

  // Where the site is rooted. It cannot come from location.pathname: on
  // /films/le-jazz that would make "/films/" look like the root, strip the
  // section folder and leave the page with no section at all. This script
  // always sits at the site root, so its own URL is the reliable anchor
  // whatever depth the page is at, and whatever folder the site is served from
  // (GitHub Pages serves it from /cmtaylor-site/).
  var SITE_ROOT = (function () {
    try {
      var me = document.currentScript && document.currentScript.src;
      if (me) return new URL(me).pathname.replace(/[^/]*$/, "");
    } catch (e) {}
    return "/";
  })();

  function reduced() {
    try { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  }

  // A page's position: its section, and how deep it sits inside it.
  function place(url) {
    var path;
    try { path = new URL(url, location.href).pathname; }
    catch (e) { return { section: 0, depth: 0 }; }
    if (path.indexOf(SITE_ROOT) === 0) path = path.slice(SITE_ROOT.length);
    var parts = path.replace(/^\/+/, "").split("/").filter(Boolean)
                    .map(function (p) { return p.replace(/\.html$/, ""); });
    if (parts[0] === "index") parts = [];
    var i = ORDER.indexOf(parts[0] || "");
    return { section: i === -1 ? 0 : i, depth: parts.length };
  }

  function goingBack(fromURL, toURL) {
    var a = place(fromURL), b = place(toURL);
    return a.section !== b.section ? a.section > b.section : a.depth > b.depth;
  }

  function clear(el) {
    el.style.transition = "";
    el.style.transform = "";
    el.style.willChange = "";
  }

  // ---- arriving -----------------------------------------------------------
  // Slide the page in from the side it is travelling from. This runs on the
  // real body, over the root background, which every page now sets explicitly
  // — so there is never a bare frame to see behind it.
  function arrive() {
    var dir = null, was = null;
    try {
      dir = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY);
      was = sessionStorage.getItem(BG);  sessionStorage.removeItem(BG);
    } catch (e) {}
    if (!dir || reduced() || !document.body) return;

    var root = document.documentElement, body = document.body;

    // Hold the previous page's colour behind the arriving page.
    //
    // This is the whole flash, and it took a long time to see. While the page
    // is off-screen the viewport shows the bare root background — and the root
    // here belongs to the page arriving, which is paper. So the gap between one
    // page leaving and the next sliding in was a full-screen near-white frame,
    // over and over. Painting it in the colour of the page being left means the
    // turn happens against that page's own backdrop, the way it would if both
    // pages were in one document.
    if (was) root.style.backgroundColor = was;

    body.style.transform = "translateX(" + (dir === "back" ? "-100%" : "100%") + ")";
    body.style.willChange = "transform";
    // Two frames, so the start position is committed before the move begins;
    // one is not always enough and the page would simply appear in place.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        body.style.transition = "transform " + HALF + "ms " + EASE;
        body.style.transform = "translateX(0)";
        setTimeout(function () {
          clear(body);
          root.style.backgroundColor = "";   // back to the page's own colour
        }, HALF + 60);
      });
    });
  }

  // ---- leaving ------------------------------------------------------------
  function leave(href, back) {
    // Hand the next page both the direction and this page's colour, so it can
    // run the turn against the backdrop of the page being left rather than
    // against its own.
    try {
      sessionStorage.setItem(KEY, back ? "back" : "forward");
      var c = getComputedStyle(document.documentElement).backgroundColor;
      if (!c || c === "rgba(0, 0, 0, 0)" || c === "transparent") {
        c = getComputedStyle(document.body).backgroundColor;
      }
      sessionStorage.setItem(BG, c);
    } catch (e) {}
    if (reduced() || !document.body) { location.href = href; return; }

    var body = document.body, done = false;
    function go() { if (!done) { done = true; location.href = href; } }

    body.style.willChange = "transform";
    body.style.transition = "transform " + HALF + "ms " + EASE;
    // committed on the next frame so the transition actually runs
    requestAnimationFrame(function () {
      body.style.transform = "translateX(" + (back ? "100%" : "-100%") + ")";
    });

    body.addEventListener("transitionend", function h(ev) {
      if (ev.target === body && ev.propertyName === "transform") {
        body.removeEventListener("transitionend", h);
        go();
      }
    });
    // Backstop: a dropped transitionend must never strand the reader on a page
    // that has slid away.
    setTimeout(go, HALF + 160);
  }

  function internalPage(a) {
    if (!a || a.hasAttribute("download")) return null;
    if (a.target && a.target !== "" && a.target !== "_self") return null;
    var raw = a.getAttribute("href");
    if (!raw || raw.charAt(0) === "#") return null;
    var url;
    try { url = new URL(a.href, location.href); } catch (e) { return null; }
    if (url.origin !== location.origin) return null;
    if (url.pathname === location.pathname) return null;        // already here
    // assets (.jpg, .mp4, .pdf) are downloads or direct views, not page turns
    var last = url.pathname.split("/").pop();
    if (/\.(?!html$)[a-z0-9]+$/i.test(last)) return null;
    return url;
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;  // new tab/window
    var a = e.target.closest ? e.target.closest("a") : null;
    var url = internalPage(a);
    if (!url) return;
    e.preventDefault();
    leave(a.href, goingBack(location.href, url.href));
  });

  // A page restored from the back/forward cache comes back exactly as it was
  // left — mid-slide, off-screen — so put it back where it belongs.
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && document.body) clear(document.body);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrive);
  } else {
    arrive();
  }
})();
