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
  CMS.registerPreviewStyle("/content/_styles/the-other-side-of-boredom.css");
  CMS.registerPreviewStyle("/admin/preview-frame.css");

  var SERIES = "Slow and Spurious Films";

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

      return h("div", { className: "cmt-preview" }, [
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
})();
