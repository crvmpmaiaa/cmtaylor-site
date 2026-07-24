/* ==========================================================================
   C. M. Taylor — fold-back helper for destination pages
   When a page is shown inside the homepage's fold iframe (#destLayer), a click
   on a "Home" link should fold back to the video homepage rather than load the
   homepage inside the iframe. We tell the parent to run the reverse fold.
   When the page is opened standalone (not embedded), Home links behave normally.
   ========================================================================== */
(function () {
  "use strict";
  var embedded = false;
  try { embedded = window.frameElement && window.frameElement.id === "destLayer"; }
  catch (e) { embedded = false; } // cross-origin frame — treat as standalone
  if (!embedded) return;

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    // any link that resolves to the site homepage (index.html or root)
    if (/(^|\/)index\.html$/.test(a.pathname) || a.pathname === "/") {
      e.preventDefault();
      try { window.parent.postMessage({ cmt: "home" }, location.origin); }
      catch (err) { location.href = a.href; } // fallback: normal navigation
    }
  }, true);
})();
