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

  // What colour the page we are LEAVING is painted.
  //
  // This matters because the outgoing snapshot can contain transparent areas.
  // The homepage is a full-screen <video>, and a hardware-decoded video frame
  // is not always captured into a view-transition snapshot — leaving a hole
  // that shows the destination through it. Against the dark homepage and a
  // paper destination that reads as a white flash right before the turn, which
  // is exactly where it was reported: only ever when leaving home.
  //
  // The CSS runs in the document being navigated TO, which has no idea what
  // the previous page looked like, so the colour has to be handed to it here.
  function backdropFor(p) {
    if (p.section === 0 && p.depth === 0) return "#111114";   // homepage, ink
    if (p.section === 2 && p.depth > 1) return "#0b0b0f";     // a film page, near-black
    return "#f4f1ea";                                         // everything else, paper
  }

  function apply(fromURL) {
    var to = place(location.href);
    var from = fromURL ? place(fromURL) : to;

    document.documentElement.style.setProperty("--cmt-from-bg", backdropFor(from));

    // The destination's real colour, read off the page rather than assumed, so
    // the film pages stay dark. Falls back to the table if the root has not
    // resolved a colour for some reason.
    var here = "";
    try { here = getComputedStyle(document.documentElement).backgroundColor; }
    catch (e) { here = ""; }
    if (!here || here === "rgba(0, 0, 0, 0)" || here === "transparent") here = backdropFor(to);
    document.documentElement.style.setProperty("--cmt-to-bg", here);

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

  // Freeze any playing video into a still before the page is photographed.
  //
  // A view-transition snapshot does not reliably include a hardware-decoded
  // video frame: the homepage hero came out as a transparent hole for some
  // clips and captured fine for others, which is why the flash appeared to
  // come and go. Painting a colour behind the snapshot hid it, but only when
  // that colour happened to resemble the frame.
  //
  // So take the photograph ourselves. `pageswap` is the last moment the
  // outgoing document can be changed before it is captured, so at that point
  // each video is replaced by a canvas holding its current frame. A canvas is
  // an ordinary composited element and always captures. The page is being
  // navigated away from, so nothing here is visible to the reader — the only
  // thing that sees it is the snapshot.
  function freezeVideo(v) {
    if (!v.videoWidth || !v.videoHeight) return;      // nothing decoded yet
    var canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    try { canvas.getContext("2d").drawImage(v, 0, 0); }
    catch (e) { return; }                             // tainted or undecodable: leave it

    // Sit the still exactly where the video sat. Canvas honours object-fit the
    // same way video does, so copying the layout properties is enough to keep
    // the framing identical — anything else and the hero would visibly jump.
    var cs = getComputedStyle(v);
    canvas.style.cssText =
      "position:" + cs.position + ";inset:0;width:100%;height:100%;" +
      "object-fit:" + cs.objectFit + ";object-position:" + cs.objectPosition + ";" +
      "z-index:" + cs.zIndex + ";opacity:" + cs.opacity + ";";

    canvas.dataset.cmtFreeze = "1";
    v.parentNode.insertBefore(canvas, v);
    v.style.visibility = "hidden";
  }

  // Pressing Back can restore this page from the back/forward cache exactly as
  // it was left — including the frozen still sitting on top of a hidden video.
  // Without this the homepage would come back as a photograph of itself.
  function thaw() {
    [].slice.call(document.querySelectorAll("canvas[data-cmt-freeze]"))
      .forEach(function (c) { c.parentNode.removeChild(c); });
    [].slice.call(document.querySelectorAll("video"))
      .forEach(function (v) { v.style.visibility = ""; });
  }

  window.addEventListener("pageswap", function (e) {
    if (!e.viewTransition) return;                    // plain navigation, no snapshot
    try {
      [].slice.call(document.querySelectorAll("video")).forEach(freezeVideo);
    } catch (err) { /* never block a navigation over this */ }
  });

  window.addEventListener("pageshow", function (e) { if (e.persisted) thaw(); });
  window.addEventListener("pagereveal", thaw);

  window.addEventListener("pagereveal", function (e) {
    if (!e.viewTransition) return;                 // plain navigation, nothing to aim
    var from = null;
    try { from = navigation.activation.from && navigation.activation.from.url; }
    catch (err) { from = null; }                   // no Navigation API: default forward
    apply(from);
  });
})();
