#!/usr/bin/env python3
"""Tiny static dev server for the C. M. Taylor site.

Identical to `python3 -m http.server` EXCEPT it sends no-cache headers, so the
browser can never run a stale cached script/stylesheet. During this redesign we
kept hitting "dead nav / black screen" bugs that were actually just the browser
executing an old cached fold-child.js/fold.js – this makes that impossible.

    python3 serve.py [port]   (default 8765)
"""
import os, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def translate_path(self, path):
        """Serve /films for films.html, the way the real hosts do.

        GitHub Pages (verified against the live site) and WordPress both resolve
        extensionless paths, and the site's internal links are extensionless to
        match. Without this the local preview would 404 on every link while
        production worked.

        The subtlety is /books and /films: each is BOTH a page (books.html) and
        a directory of detail pages (books/). GitHub Pages serves the page and
        does not redirect, so the .html has to win here too — otherwise the
        stock handler redirects to /books/ and shows a directory listing, and
        local preview disagrees with production on the two busiest pages.
        """
        local = super().translate_path(path)
        candidate = local.rstrip("/") + ".html"
        if not path.endswith("/") and os.path.isfile(candidate):
            if not os.path.exists(local) or os.path.isdir(local):
                return candidate
        return local


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
