/* Show Craig the page he is editing, not a list of field names.
 *
 * Decap's default preview prints every field as "Label: value", which reads as
 * markup soup and tells you nothing about how the page will look. This renders
 * the film page itself, using the site's own stylesheet, so the preview pane is
 * the thing being made.
 *
 * The markup below mirrors film_page() in tools/build_films.py. If that changes
 * shape, change it here too — they are two renderers of one design, and a
 * preview that quietly drifts from the real page is worse than no preview.
 */
(function () {
  "use strict";

  // The site's own stylesheet, so the preview is typeset and coloured exactly
  // like the page. Fonts first, or the preview renders in a fallback serif and
  // looks wrong in a way that would send Craig hunting for a problem.
  CMS.registerPreviewStyle(
    "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500&display=swap"
  );
  // One generated stylesheet, with each page's CSS scoped to its own
  // wrapper. Decap applies every registered style to every preview, so
  // loading the three page stylesheets raw let them overwrite each other.
  CMS.registerPreviewStyle("/admin/preview.css?v=20260901a");
  CMS.registerPreviewStyle("/admin/preview-frame.css?v=20260901a");

  var SERIES = "Slow and Spurious Films";

  // Mirrors tools/mdlite.py. Craig writes in a rich editor, so the values are
  // markdown; without this the preview shows the raw *asterisks* rather than
  // the italics he will actually get.
  function md(t) {
    return String(t || "")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/(^|\W)\*\*([^*]+)\*\*(?!\w)/g, "$1<strong>$2</strong>")
      .replace(/(^|\W)\*([^*]+)\*(?!\w)/g, "$1<em>$2</em>");
  }

  function val(entry, name) {
    var v = entry.getIn(["data", name]);
    return v === undefined || v === null ? "" : v;
  }

  // Images are a repo path while unsaved and a blob afterwards; getAsset copes
  // with both, so a newly-uploaded poster previews without needing a save.
  function assetUrl(getAsset, path) {
    if (!path) return "";
    var url = path;
    try { url = getAsset(path).toString(); } catch (e) { /* keep the raw path */ }
    // A newly uploaded image comes back as a blob: URL and is already absolute.
    if (/^(blob:|data:|https?:)/.test(url)) return url;
    // Otherwise it is a repo path, and the preview iframe sits at /admin/, so a
    // relative path resolves to /admin/assets/... and 404s. Anchor it to the
    // site root. Film pages store "../assets/..." and index cards store
    // "assets/...", so strip either prefix before doing that.
    return "/" + url.replace(/^(\.\.\/|\.\/)+/, "").replace(/^\/+/, "");
  }

  var FilmPreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var getAsset = this.props.getAsset;

      var title = val(entry, "title") || "Untitled film";
      var year = val(entry, "year");
      var mins = val(entry, "mins");
      var vimeo = val(entry, "vimeo");
      var hero = val(entry, "hero_poster") || val(entry, "poster");
      var laurels = entry.getIn(["data", "laurels"]);

      var main = [
        h("p", { className: "series", key: "s" }, SERIES),
        h("h1", { key: "h" }, title),
        h("p", { className: "filmmeta", key: "m" },
          [year, mins ? mins + " mins" : ""].filter(Boolean).join("  ·  ")),
        h("p", { className: "logline", key: "l" }, val(entry, "logline")),
      ];

      if (val(entry, "desc")) {
        main.push(h("p", { className: "desc", key: "d" }, val(entry, "desc")));
      }

      // A film either plays here or shows its poster — the same either/or the
      // generator applies, so the preview shows which one this film will get.
      if (vimeo) {
        main.push(h("div", { className: "player", key: "p" },
          h("iframe", { src: vimeo, allowFullScreen: true, title: title })));
      } else if (hero) {
        main.push(h("div", { className: "posterhero", key: "p" },
          h("img", { src: assetUrl(getAsset, hero), alt: val(entry, "poster_alt") })));
      }

      if (val(entry, "note")) {
        main.push(h("p", { className: "note", key: "n" }, val(entry, "note")));
      }

      // The list widget starts a new entry with one blank row, which would
      // render as a broken image before Craig has chosen anything. Only show
      // laurels that actually have a picture.
      var withImages = laurels
        ? laurels.filter(function (l) { return l && l.get("src"); })
        : null;
      if (withImages && withImages.size) {
        main.push(h("div", { className: "laurels", key: "w" },
          withImages.map(function (l, i) {
            return h("img", {
              key: i,
              src: assetUrl(getAsset, l.get("src")),
              alt: l.get("alt") || "Festival laurel",
            });
          }).toArray()));
      }

      main.push(h("a", { className: "back", href: "#", key: "b" }, "← All films"));

      return h("div", { className: "cmt-preview cmt-film" }, [
        h("div", { className: "top", key: "t" }, [
          h("a", { className: "name", key: "n" }, "C. M. Taylor"),
          h("nav", { key: "v" }, ["Books", "Films", "Essays", "About", "Contact"].map(function (x) {
            return h("a", { key: x, className: x === "Films" ? "here" : undefined }, x);
          })),
        ]),
        h("main", { key: "m" }, main),
      ]);
    },
  });

  CMS.registerPreviewTemplate("films", FilmPreview);

  /* --- Books ---------------------------------------------------------------
   * Mirrors build_book() in tools/build_books.py. Same caveat as the film
   * preview: these are two renderers of one design, so a change to the book
   * page needs making in both.
   *
   * The accent colour is per book and baked into that page's CSS, so the
   * preview sets it as a custom property on the wrapper and the rules below
   * pick it up — otherwise every book would preview in Floaters' copper.
   */
  var BookPreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var getAsset = this.props.getAsset;

      var title = val(entry, "title") || "Untitled book";
      var accent = val(entry, "accent") || "#a83000";
      var cover = entry.getIn(["data", "cover", "src"]);
      var blurb = entry.getIn(["data", "blurb"]);
      var quotes = entry.getIn(["data", "quotes"]);
      var buy = entry.getIn(["data", "buy"]);

      var detail = [
        h("h1", { key: "h" }, [
          title + " ",
          h("span", { className: "dy", key: "y" }, val(entry, "year")),
        ]),
      ];
      if (val(entry, "meta")) {
        detail.push(h("p", { className: "dmeta", key: "m" }, val(entry, "meta")));
      }
      if (blurb && blurb.size) {
        detail.push(h("div", { className: "dbody", key: "b" },
          blurb.map(function (para, i) {
            // blurbs carry inline markup such as <em>, so they are inserted as
            // HTML rather than text - the same as the generator does
            return h("p", { key: i, dangerouslySetInnerHTML: { __html: md(para) } });
          }).toArray()));
      }
      var realQuotes = quotes ? quotes.filter(function (q) { return q && q.get("text"); }) : null;
      if (realQuotes && realQuotes.size) {
        detail.push(h("section", { className: "dquotes", key: "q" },
          h("ul", {}, realQuotes.map(function (q, i) {
            return h("li", { key: i }, h("blockquote", {}, [
              "\u201C" + q.get("text") + "\u201D",
              h("cite", { key: "c" }, q.get("source")),
            ]));
          }).toArray())));
      }
      var realBuy = buy ? buy.filter(function (x) { return x && x.get("name"); }) : null;
      if (realBuy && realBuy.size) {
        detail.push(h("section", { className: "dbuy", key: "s" }, [
          h("p", { className: "dbuylabel", key: "l" }, "Where to buy"),
          h("ul", { key: "u" }, realBuy.map(function (x, i) {
            return h("li", { key: i }, h("a", { href: x.get("url") }, x.get("name")));
          }).toArray()),
        ]));
      }
      if (val(entry, "note")) {
        detail.push(h("p", { className: "dnote", key: "n" }, val(entry, "note")));
      }
      detail.push(h("p", { className: "backrow", key: "r" }, h("a", {}, "\u2190 All books")));

      return h("div", { className: "cmt-preview cmt-book", style: { "--accent": accent } }, [
        h("div", { className: "top", key: "t" }, [
          h("a", { className: "name", key: "n" }, "C. M. Taylor"),
          h("nav", { key: "v" }, ["Books", "Films", "Essays", "About", "Contact"].map(function (x) {
            return h("a", { key: x, className: x === "Books" ? "here" : undefined }, x);
          })),
        ]),
        h("main", { key: "m" },
          h("div", { className: "detail", key: "d" }, [
            h("div", { className: "dcover", key: "c" },
              cover ? h("figure", { className: "jacket" },
                h("img", {
                  src: assetUrl(getAsset, cover),
                  alt: title + " \u2013 cover",
                  style: { objectPosition: entry.getIn(["data", "cover", "pos"]) || "50% 50%" },
                })) : null),
            h("div", { className: "dtext", key: "x" }, detail),
          ])),
      ]);
    },
  });

  CMS.registerPreviewTemplate("books", BookPreview);

  /* --- About ---------------------------------------------------------------
   * Mirrors tools/templates/about.html. Only the parts that are editable are
   * rendered: the kicker, heading, pull-quote, biography and press quotes. The
   * portrait and the archive of past writing are in the template and not
   * editable, so showing them here would only pad the pane with things Craig
   * cannot change.
   */
  // Mirrors bio_html() in tools/build_about.py: the biography is a set of small
  // labelled pieces now, not one block, so the preview has to reassemble it.
  function bioHtml(entry) {
    var b = entry.getIn(["data", "bio"]);
    if (!b) return "";
    var list = function (key) {
      var v = b.get(key);
      return v && v.toArray ? v.toArray() : [];
    };
    var out = ['<p class="big">' + md(b.get("opening")) + "</p>"];
    list("story").forEach(function (p) { out.push("<p>" + md(p) + "</p>"); });
    out.push("<p>" + md(b.get("teaching_intro")) + "</p>");
    out.push('<div class="courses">');
    [["MA Publishing Media", "courses_ma"],
     ["BA Media, Journalism and Publishing", "courses_ba"]].forEach(function (g) {
      var items = list(g[1]);
      if (!items.length) return;
      out.push('<p class="cgroup">' + g[0] + "</p><ul>");
      items.forEach(function (c) { out.push("<li>" + md(c) + "</li>"); });
      out.push("</ul>");
    });
    out.push("</div>");
    out.push("<p>" + md(b.get("editing")) + "</p>");
    out.push('<p class="battery">' + md(b.get("personal")) + "</p>");
    out.push("<p>" + md(b.get("substack")) + "</p>");
    return out.join("");
  }

  var AboutPreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var praise = entry.getIn(["data", "praise"]);
      var real = praise ? praise.filter(function (q) { return q && q.get("quote"); }) : null;

      var out = [
        h("section", { className: "hero", key: "h" }, [
          h("p", { className: "kicker", key: "k" }, val(entry, "kicker")),
          // the heading carries <em> for the surname, so it goes in as HTML
          h("h1", { key: "t", dangerouslySetInnerHTML: { __html: md(val(entry, "h1")) } }),
          h("p", { className: "lead", key: "l" }, val(entry, "lead")),
        ]),
        h("div", { className: "grid", key: "g" },
          h("div", { className: "bio", key: "b",
                     dangerouslySetInnerHTML: { __html: bioHtml(entry) } })),
      ];

      if (real && real.size) {
        var pintro = val(entry, "praise_intro");
        out.push(h("section", { className: "praise", key: "p" }, [
          h("h2", { key: "h2" }, "Praise"),
          pintro ? h("p", { className: "pintro", key: "pi" }, pintro) : null,
          h("ul", { key: "u" }, real.map(function (q, i) {
            return h("li", { key: i }, h("blockquote", {}, [
              q.get("quote"),
              h("cite", { key: "c" }, q.get("source")),
            ]));
          }).toArray()),
        ]));
      }

      return h("div", { className: "cmt-preview cmt-about" },
        h("main", {}, out));
    },
  });

  // File collections are keyed on the FILE name ("about"), not the
  // collection name ("pages") - registering the collection silently does
  // nothing and you get the default field list back.
  CMS.registerPreviewTemplate("about", AboutPreview);


  /* --- Contact -------------------------------------------------------------
   * Mirrors tools/templates/contact.html: the eyebrow, heading and intro
   * paragraphs, then a stand-in for the form (not editable, so it is shown
   * faded, just to give the words their context), then the thank-you message.
   */
  // Mirrors autolink() in tools/build_contact.py.
  function autolink(html) {
    return html.split(/(<a [^>]*>[\s\S]*?<\/a>)/).map(function (p) {
      if (p.indexOf("<a ") === 0) return p;
      return p.replace(/(?![^<]*>)([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g,
                       '<a href="mailto:$1">$1</a>');
    }).join("");
  }

  var ContactPreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var intro = entry.getIn(["data", "intro"]);
      var paras = intro && intro.toArray ? intro.toArray().filter(Boolean) : [];
      var body = [
        h("p", { className: "eyebrow", key: "e" }, val(entry, "eyebrow")),
        h("h1", { key: "t", dangerouslySetInnerHTML: { __html: md(val(entry, "h1")) } }),
      ];
      paras.forEach(function (p, i) {
        body.push(h("p", { className: "lede", key: "p" + i,
                           dangerouslySetInnerHTML: { __html: autolink(md(p)) } }));
      });
      body.push(h("div", { className: "contactform cmt-form-ghost", key: "f" }, [
        h("p", { className: "field", key: "1" }, [h("label", { key: "l" }, "Your name"), h("input", { type: "text", disabled: true, key: "i" })]),
        h("p", { className: "field", key: "2" }, [h("label", { key: "l" }, "Your email"), h("input", { type: "email", disabled: true, key: "i" })]),
        h("p", { className: "field", key: "3" }, [h("label", { key: "l" }, "Message"), h("textarea", { rows: 4, disabled: true, key: "i" })]),
        h("p", { className: "field", key: "4" }, h("button", { type: "button", disabled: true }, "Send")),
        h("p", { className: "cmt-note", key: "n" }, "The form cannot be changed here."),
      ]));
      body.push(h("div", { className: "sent", key: "s" }, [
        h("p", { className: "cmt-note", key: "n" }, "After someone sends a message they see:"),
        h("p", { className: "thanks", key: "t", dangerouslySetInnerHTML: { __html: md(val(entry, "thanks_title")) } }),
        h("p", { className: "lede", key: "b", dangerouslySetInnerHTML: { __html: md(val(entry, "thanks_body")) } }),
      ]));
      return h("div", { className: "cmt-preview cmt-contact" }, h("main", {}, body));
    },
  });
  CMS.registerPreviewTemplate("contact", ContactPreview);


  /* --- The three section landing pages -------------------------------------
   * Books, Films and Essays each have a page of their own whose words Craig
   * owns; the works listed beneath those words are edited in their own
   * collections, so each preview shows the header being written and a faded
   * note standing in for the list it sits above.
   */
  function ghostNote(text) {
    return h("p", { className: "cmt-note", key: "g" }, text);
  }

  var BooksPagePreview = createClass({
    render: function () {
      var entry = this.props.entry;
      return h("div", { className: "cmt-preview cmt-bookspage" }, h("main", {}, [
        h("p", { className: "kicker", key: "k" }, val(entry, "kicker")),
        h("h1", { key: "h", dangerouslySetInnerHTML: { __html: md(val(entry, "h1")) } }),
        h("p", { className: "lede", key: "l", dangerouslySetInnerHTML: { __html: md(val(entry, "lede")) } }),
        h("p", { className: "facts", key: "f" }, val(entry, "facts")),
        ghostNote("The books themselves appear here, edited under Books."),
        h("p", { className: "footline", key: "q" }, val(entry, "foot")),
      ]));
    },
  });
  CMS.registerPreviewTemplate("books-page", BooksPagePreview);

  // Mirrors intro_html() in tools/build_films.py: text between curly single
  // quotes keeps the pale slogan styling.
  function slogan(html) {
    return html.replace(/‘([^’]*)’/g, '<span class="slogan">‘$1’</span>');
  }

  var FilmsPagePreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var intro = entry.getIn(["data", "intro"]);
      var paras = intro && intro.toArray ? intro.toArray().filter(Boolean) : [];
      var body = [h("h1", { key: "h" }, val(entry, "h1"))];
      paras.forEach(function (p, i) {
        body.push(h("p", { key: "p" + i,
                           dangerouslySetInnerHTML: { __html: slogan(md(p)) } }));
      });
      return h("div", { className: "cmt-preview cmt-filmspage" }, h("main", {}, [
        h("header", { className: "intro", key: "i" }, body),
        ghostNote("The films themselves appear here, edited under Films."),
      ]));
    },
  });
  CMS.registerPreviewTemplate("films-page", FilmsPagePreview);

  var EssaysPagePreview = createClass({
    render: function () {
      var entry = this.props.entry;
      // The generator breaks the heading where Craig types a slash.
      var heading = String(val(entry, "h1")).split(/\s*\/\s*/);
      var h1 = [];
      heading.forEach(function (part, i) {
        if (i) h1.push(h("br", { key: "b" + i }));
        h1.push(part);
      });
      return h("div", { className: "cmt-preview cmt-essayspage" }, h("main", {}, [
        h("p", { className: "kicker", key: "k" }, val(entry, "kicker")),
        h("h1", { key: "h" }, h1),
        h("p", { className: "blurb", key: "l",
                 dangerouslySetInnerHTML: { __html: md(val(entry, "blurb")) } }),
        ghostNote("The essays themselves appear here, straight from your Substack."),
        h("p", { className: "footline", key: "q" }, val(entry, "foot")),
      ]));
    },
  });
  CMS.registerPreviewTemplate("essays-page", EssaysPagePreview);


  /* --- A way back to the manual ---------------------------------------------
   * Decap has no API for adding a link to its own navigation, so rather than
   * reaching into its markup — which would break the first time it changes —
   * this is our own button, fixed to the corner and owned by us.
   */
  function cornerPill(id, href, label, aria, bottom, dark) {
    if (document.getElementById(id)) return;
    var a = document.createElement("a");
    a.id = id;
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = label;
    a.setAttribute("aria-label", aria);
    var base = dark ? "#1a191f" : "#3d5a3a";
    a.style.cssText = [
      "position:fixed", "right:18px", "bottom:" + bottom + "px", "z-index:9999",
      "background:" + base, "color:#f4f1ea", "text-decoration:none",
      "font:500 12px/1 Inter,-apple-system,sans-serif",
      "letter-spacing:.12em", "text-transform:uppercase",
      "padding:12px 16px", "border-radius:999px",
      "box-shadow:0 4px 14px rgba(0,0,0,.22)",
    ].join(";");
    a.addEventListener("mouseenter", function () { a.style.background = "#a83000"; });
    a.addEventListener("mouseleave", function () { a.style.background = base; });
    document.body.appendChild(a);
  }

  /* Two pills, stacked in the corner. Craig asked how to see his visitor
   * numbers, so the answer lives where he already goes to change the site
   * rather than in an email he has to find again six months from now. The
   * stats link is a read-only Umami share URL: no login, no account, and it
   * cannot be used to change anything. */
  function addHelpButton() {
    cornerPill("cmt-stats", "https://cloud.umami.is/share/fCrKEFIXqOGpB7x4",
               "Visitor stats", "Open the visitor statistics for your site",
               62, false);
    cornerPill("cmt-help", "/admin/manual.html",
               "How to use this", "Open the guide to updating your site",
               18, true);
  }

  /* The login screen is Decap's own, and says "Decap" in large pink letters,
   * which means nothing to Craig. This puts his own site's name above it and a
   * plain link to the guide underneath — positioned over the screen rather than
   * inserted into Decap's markup, so a change on their side cannot break it. */
  function addLoginPanel() {
    if (document.getElementById("cmt-login-help")) return;
    var box = document.createElement("div");
    box.id = "cmt-login-help";
    box.innerHTML =
      '<p class="cmt-title">C. M. Taylor</p>' +
      '<p class="cmt-sub">Website editor</p>' +
      '<p class="cmt-link"><a href="/admin/manual.html" target="_blank" rel="noopener">' +
      'New to this? Read the short guide &rarr;</a></p>';
    box.style.cssText = [
      "position:fixed", "left:0", "right:0", "top:0", "bottom:0",
      "display:flex", "flex-direction:column", "align-items:center",
      "justify-content:center", "gap:0", "pointer-events:none", "z-index:9998",
      "font-family:Inter,-apple-system,sans-serif", "text-align:center",
    ].join(";");
    var st = document.createElement("style");
    // Hide Decap's own logo on the login screen. Craig has no idea what Decap
    // is, and a large pink wordmark is the most prominent thing on the page he
    // is meant to log into. Matched on the class Decap gives its logo wrapper —
    // if they rename it the logo simply comes back, which is harmless.
    st.textContent =
      '[class*="DecapLogoIcon"]{display:none !important}' +
      '#cmt-login-help .cmt-title{font-family:"EB Garamond",Georgia,serif;font-size:1.6rem;' +
      'letter-spacing:.05em;color:#1a191f;margin:0 0 2px;transform:translateY(-150px)}' +
      '#cmt-login-help .cmt-sub{font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;' +
      'color:#6c665c;margin:0;transform:translateY(-150px)}' +
      '#cmt-login-help .cmt-link{margin:0;transform:translateY(90px);pointer-events:auto}' +
      '#cmt-login-help .cmt-link a{color:#a83000;font-size:.9rem;text-decoration:none;' +
      'border-bottom:1px solid rgba(168,48,0,.35);padding-bottom:2px}' +
      '#cmt-login-help .cmt-link a:hover{border-bottom-color:#a83000}';
    document.head.appendChild(st);
    document.body.appendChild(box);
  }

  function removeLoginPanel() {
    var b = document.getElementById("cmt-login-help");
    if (b) b.parentNode.removeChild(b);
  }

  // Decap swaps the whole app in on login, so watch rather than check once.
  function syncChrome() {
    var loggedOut = !!Array.prototype.slice.call(document.querySelectorAll("button"))
      .filter(function (b) { return /login/i.test(b.textContent || ""); }).length;
    if (loggedOut) { addLoginPanel(); } else { removeLoginPanel(); }
    addHelpButton();
  }

  function start() {
    syncChrome();
    setInterval(syncChrome, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
