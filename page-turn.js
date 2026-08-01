/* ==========================================================================
   C. M. Taylor — which way does the page turn?
   --------------------------------------------------------------------------
   The nav reads left to right: Books · Films · Essays · About · Contact, with
   the homepage sitting before all of them. Turning should follow that order,
   the way pages in a book do:

     • click something to the LEFT of where you are  → you are going back,
       so the current page slides away to the RIGHT
     • click something to the RIGHT of where you are → you are going on,
       so the current page slides away to the LEFT

   A detail page counts as its section (books/floaters is "books"), so leaving
   a novel for Films still turns forward.

   For a cross-document view transition, BOTH snapshots are styled by the
   document being navigated TO. So the incoming page is what has to decide the
   direction, and `pagereveal` is the one moment it can do that before the
   animation starts. navigation.activation.from tells it where the reader came
   from. Everything here is a no-op in browsers without the API — they simply
   navigate, which is the correct fallback.
   ========================================================================== */
(function () {
  "use strict";

  // Screen order. Home is 0 so that leaving it always turns forward, and
  // returning to it always turns back.
  var ORDER = ["", "books", "films", "essays", "about", "contact"];

  // Where the site is rooted. It cannot be derived from location.pathname:
  // on /films/le-jazz that would make "/films/" look like the root, strip the
  // section folder, and leave the page with no section at all — which had every
  // detail page turning the wrong way. This script always sits at the site root
  // (pages reference it as page-turn.js or ../page-turn.js), so its own URL is
  // the one reliable anchor, whatever depth the page is at and whatever folder
  // the site is served from.
  var SITE_ROOT = (function () {
    try {
      var me = document.currentScript && document.currentScript.src;
      if (me) return new URL(me).pathname.replace(/[^/]*$/, "");
    } catch (e) {}
    return "/";
  })();

  // A page's position: which section it belongs to, and how deep it sits
  // inside it. Depth is what separates /books from /books/floaters.
  function place(url) {
    var path;
    try { path = new URL(url, location.href).pathname; }
    catch (e) { return { section: 0, depth: 0 }; }

    // Strip the directory the site is served from (GitHub Pages serves it from
    // /cmtaylor-site/), then take the first remaining segment: "books/floaters"
    // and "books" are both the Books section.
    if (path.indexOf(SITE_ROOT) === 0) path = path.slice(SITE_ROOT.length);
    var parts = path.replace(/^\/+/, "").split("/").filter(Boolean)
                    .map(function (p) { return p.replace(/\.html$/, ""); });
    if (parts[0] === "index") parts = [];

    var i = ORDER.indexOf(parts[0] || "");
    return {
      section: i === -1 ? 0 : i,   // unknown page: treat as home rather than guess
      depth: parts.length,
    };
  }

  function apply(fromURL) {
    var to = place(location.href);
    var from = fromURL ? place(fromURL) : to;

    var back;
    if (from.section !== to.section) {
      // Different sections: follow the nav order, left is back.
      back = from.section > to.section;
    } else {
      // Same section, so the nav order says nothing. Depth decides: coming up
      // out of a novel to the Books index is going back, and opening a novel
      // from that index is going on. Equal depth (a link to the page you are
      // already on) keeps the forward default.
      back = from.depth > to.depth;
    }
    document.documentElement.dataset.turn = back ? "back" : "forward";
  }

  window.addEventListener("pagereveal", function (e) {
    if (!e.viewTransition) return;                 // plain navigation, nothing to aim
    var from = null;
    try { from = navigation.activation.from && navigation.activation.from.url; }
    catch (err) { from = null; }                   // no Navigation API: default forward
    apply(from);
  });
})();
