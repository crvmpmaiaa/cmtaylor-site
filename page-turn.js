/* ==========================================================================
   C. M. Taylor — the page turn
   --------------------------------------------------------------------------
   One movement: the page you land on slides in. That is the whole thing.

   It is deliberately this small. Earlier versions animated the outgoing page
   away as well, which meant a moment with no page on screen at all — and
   whatever filled that moment (the bare root background, or under View
   Transitions the live destination) read as a flash, or as a second, blacker
   turn before the real one. There is no gap here because the browser keeps the
   old page on screen until this one paints, and this one slides in over its
   own background.

   Nothing is intercepted: links navigate normally, so nothing can delay or
   swallow a click, and the back button and refresh behave exactly as they
   would on a plain site.

   Direction follows the nav — Books · Films · Essays · About · Contact, with
   the homepage before them. Coming from the left of where you land, the page
   arrives from the right; coming from the right, it arrives from the left.
   ========================================================================== */
(function () {
  "use strict";

  var MS = 520;
  var EASE = "cubic-bezier(.33, 0, .2, 1)";
  var ORDER = ["", "books", "films", "essays", "about", "contact"];

  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch (e) {}

  // Where the site is rooted. Not derivable from location.pathname: on
  // /films/le-jazz that would treat "/films/" as the root and leave the page
  // with no section. This script always sits at the site root, so its own URL
  // is the reliable anchor at any depth, and in any folder the site is served
  // from (GitHub Pages serves it from /cmtaylor-site/).
  var ROOT = (function () {
    try {
      var me = document.currentScript && document.currentScript.src;
      if (me) return new URL(me).pathname.replace(/[^/]*$/, "");
    } catch (e) {}
    return "/";
  })();

  function place(path) {
    if (path.indexOf(ROOT) === 0) path = path.slice(ROOT.length);
    var parts = path.replace(/^\/+/, "").split("/").filter(Boolean)
                    .map(function (p) { return p.replace(/\.html$/, ""); });
    if (parts[0] === "index") parts = [];
    var i = ORDER.indexOf(parts[0] || "");
    return { section: i === -1 ? 0 : i, depth: parts.length };
  }

  // Only turn when arriving from another page on this site. A direct visit, a
  // refresh, or a link in from elsewhere just shows the page.
  var from;
  try {
    if (!document.referrer) return;
    var ref = new URL(document.referrer);
    if (ref.origin !== location.origin) return;
    if (ref.pathname === location.pathname) return;      // refresh
    from = place(ref.pathname);
  } catch (e) { return; }

  var to = place(location.pathname);
  var back = from.section !== to.section
    ? from.section > to.section      // left along the nav is back
    : from.depth > to.depth;         // within a section, up out of a page is back

  // The colour the page we came from was painted. While this page is sliding
  // in, its own content is off to one side and the bare root background shows
  // behind it — and that root is paper. Arriving from the dark homepage, that
  // is a full-screen near-white frame: the flash. Holding the previous page's
  // colour for the length of the slide means the page arrives over the backdrop
  // it is leaving, instead of over a blank one.
  function backdropFor(p) {
    if (p.section === 0 && p.depth === 0) return "#111114";   // homepage, ink
    if (p.section === 2 && p.depth > 1) return "#0b0b0f";     // a film page
    return "#f4f1ea";                                          // everything else
  }

  function run() {
    var body = document.body, root = document.documentElement;
    if (!body) return;
    root.style.backgroundColor = backdropFor(from);
    body.style.transform = "translateX(" + (back ? "-100%" : "100%") + ")";
    body.style.willChange = "transform";
    // Two frames: the start position has to be committed before the move
    // begins, or the page simply appears in place.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        body.style.transition = "transform " + MS + "ms " + EASE;
        body.style.transform = "translateX(0)";
        setTimeout(function () {
          body.style.transition = "";
          body.style.transform = "";
          body.style.willChange = "";
          root.style.backgroundColor = "";   // back to this page's own colour
        }, MS + 60);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
