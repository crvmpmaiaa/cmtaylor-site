/* ==========================================================================
   C. M. Taylor — in-book navigation router (runs on every page inside the book)
   Every interior/detail page is shown inside the homepage shell's book. We
   intercept internal link clicks and tell the parent shell how to move:
     • a link to the homepage        → reverse video-peel back to the homepage
     • a link to another SECTION      → flip the current page over to it
       (books / films / essays / about / contact)
     • a link to an individual book/film (a detail page) → plain swap, no turn
   Opened standalone (not inside the book), links behave normally.
   ========================================================================== */
(function () {
  "use strict";
  var SECTIONS = { "books": 1, "films": 1, "essays": 1, "about": 1, "contact": 1 };

  var embedded = false;
  try { embedded = window.frameElement && /^destLayer/.test(window.frameElement.id); }
  catch (e) { embedded = false; } // cross-origin frame — treat as standalone
  if (!embedded) return;          // standalone: plain navigation

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    if (a.hasAttribute("download")) return;
    if (a.target && a.target !== "" && a.target !== "_self") return;   // _blank etc.
    var raw = a.getAttribute("href");
    if (!raw || raw.charAt(0) === "#") return;                          // in-page anchor
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;                        // external → open normally
    if (!/\.html$/.test(url.pathname)) return;                         // only page navigations

    var base = url.pathname.split("/").pop().replace(/\.html$/, "");
    // "Section" means a page sitting alongside index.html, not a detail page in
    // books/ or films/. Derive the site root from the shell rather than assuming
    // the domain root: on GitHub Pages the site is served from /cmtaylor-site/,
    // where a hard-coded "/" + base + ".html" never matched, so every section
    // link fell through to the plain-swap branch and lost its page-turn.
    var siteRoot = "/";
    try { siteRoot = window.parent.location.pathname.replace(/[^/]*$/, ""); }
    catch (err2) { siteRoot = "/"; }
    var atRoot = url.pathname === siteRoot + base + ".html";

    var msg;
    if (/(^|\/)index$/.test(base) || base === "index") msg = { cmt: "home" };
    else if (SECTIONS[base] && atRoot) msg = { cmt: "flip", href: url.pathname };  // section → section
    else msg = { cmt: "nav", href: url.pathname };                                 // detail page → plain swap

    e.preventDefault();
    try { window.parent.postMessage(msg, location.origin); }
    catch (err) { location.href = a.href; }                            // fallback: plain nav
  }, true);
})();
