/* Mobile navigation for the interior pages.

   On a phone the five-item nav bar (Books / Films / Essays / About / Contact)
   is too much furniture, so below 700px it collapses to a three-line button
   that drops the links down.

   Self-contained on purpose: every page on this site carries its own inline
   CSS, so putting the markup, styling and behaviour in one file keeps the
   mobile nav from having to be maintained in sixteen places. It reads the
   page's own colours off the computed background so it works on both the light
   paper pages and the dark film pages.

   To remove: delete this file and the <script src="mobile-nav.js"> tags. */
(function () {
  var BREAKPOINT = 700;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    // the header row differs slightly between pages (.top on most, header.bar
    // on About), so find whichever wrapper actually holds the nav
    var nav = document.querySelector(".top nav, .bar nav, header nav");
    if (!nav) return;
    var bar = nav.parentElement;
    var links = [].slice.call(nav.querySelectorAll("a"));
    if (!links.length) return;

    // Page colours: the film pages are dark, the rest are warm paper. Read the
    // body background rather than hard-coding, so the panel always matches.
    var bg = getComputedStyle(document.body).backgroundColor;
    var rgb = (bg.match(/\d+/g) || [244, 241, 234]).map(Number);
    var lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    var dark = lum < 0.5;
    var ink = dark ? "246,244,239" : "26,25,31";
    // opaque: at 0.97 the page's own headings ghosted through the panel
    var panelBg = dark ? "#0b0b0f" : "#f4f1ea";

    var css = document.createElement("style");
    css.textContent = [
      "@media (max-width:" + BREAKPOINT + "px){",
      "  .m-nav-toggle{display:flex;align-items:center;justify-content:center;",
      "    width:44px;height:44px;margin:-10px -10px -10px 0;padding:0;",
      "    background:none;border:0;cursor:pointer;color:rgb(" + ink + ");",
      "    -webkit-tap-highlight-color:transparent;}",
      "  .m-nav-toggle span{display:block;position:relative;width:22px;height:1.5px;",
      "    background:currentColor;transition:background .2s ease;}",
      "  .m-nav-toggle span::before,.m-nav-toggle span::after{content:'';position:absolute;",
      "    left:0;width:22px;height:1.5px;background:currentColor;",
      "    transition:transform .28s cubic-bezier(.2,.7,.2,1),top .28s ease;}",
      "  .m-nav-toggle span::before{top:-7px;} .m-nav-toggle span::after{top:7px;}",
      "  .m-nav-open .m-nav-toggle span{background:transparent;}",
      "  .m-nav-open .m-nav-toggle span::before{top:0;transform:rotate(45deg);}",
      "  .m-nav-open .m-nav-toggle span::after{top:0;transform:rotate(-45deg);}",
      // the original inline links are replaced by the panel on small screens
      "  .top nav,.bar nav,header nav{display:none!important;}",
      "  .m-nav-panel{position:absolute;left:0;right:0;z-index:80;",
      "    background:" + panelBg + ";backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);",
      "    border-top:1px solid rgba(" + ink + ",0.12);border-bottom:1px solid rgba(" + ink + ",0.12);",
      // reads as floating over the page rather than merging with the line it covers
      "    box-shadow:0 20px 40px -22px rgba(0,0,0,0.5);",
      "    display:flex;flex-direction:column;padding:6px 0;",
      "    opacity:0;visibility:hidden;transform:translateY(-6px);",
      "    transition:opacity .26s ease,transform .26s ease,visibility .26s;}",
      "  .m-nav-open .m-nav-panel{opacity:1;visibility:visible;transform:none;}",
      "  .m-nav-panel a{display:block;padding:15px clamp(22px,5vw,64px);",
      "    font-size:0.78rem;letter-spacing:0.2em;text-transform:uppercase;",
      "    color:rgba(" + ink + ",0.62);text-decoration:none;}",
      "  .m-nav-panel a.here{color:rgb(" + ink + ");}",
      "}",
      "@media (min-width:" + (BREAKPOINT + 1) + "px){",
      "  .m-nav-toggle,.m-nav-panel{display:none!important;}",
      "}",
      "@media (prefers-reduced-motion:reduce){",
      "  .m-nav-panel{transition:none;} .m-nav-toggle span::before,.m-nav-toggle span::after{transition:none;}",
      "}"
    ].join("\n");
    document.head.appendChild(css);

    var btn = document.createElement("button");
    btn.className = "m-nav-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "Menu");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "mNavPanel");
    btn.innerHTML = "<span></span>";
    bar.appendChild(btn);

    var panel = document.createElement("nav");
    panel.className = "m-nav-panel";
    panel.id = "mNavPanel";
    panel.setAttribute("aria-label", "Site");
    links.forEach(function (a) {
      var c = document.createElement("a");
      c.href = a.getAttribute("href");
      c.textContent = a.textContent.trim();
      if (a.classList.contains("here")) c.className = "here";
      panel.appendChild(c);
    });
    // sits directly under the header row
    bar.parentNode.insertBefore(panel, bar.nextSibling);

    function place() {
      var r = bar.getBoundingClientRect();
      panel.style.top = (r.bottom + window.pageYOffset) + "px";
    }

    function setOpen(open) {
      document.documentElement.classList.toggle("m-nav-open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (open) place();
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!document.documentElement.classList.contains("m-nav-open"));
    });
    // tapping a link navigates; tapping anywhere else, or Escape, just closes
    panel.addEventListener("click", function (e) { e.stopPropagation(); });
    document.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > BREAKPOINT) setOpen(false); else place();
    });
    window.addEventListener("scroll", function () {
      if (document.documentElement.classList.contains("m-nav-open")) place();
    }, { passive: true });
  });
})();
