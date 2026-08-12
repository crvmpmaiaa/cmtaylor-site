#!/usr/bin/env python3
"""Local preview that resolves URLs the way Netlify does.

The site links to `films`, `about`, `books/floaters` — no .html — because
Netlify serves pretty URLs. Python's http.server only serves exact filenames,
so every nav link 404s locally and the site looks broken when it isn't.

This adds the two rules Netlify applies: try `<path>.html`, then
`<path>/index.html`. Nothing else, so what you see locally is what deploys.

    python3 tools/preview_server.py [port]        default 8000
"""
import os
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class PrettyURLHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        full = super().translate_path(path)
        # `books` is BOTH a page and a folder of pages. Netlify serves
        # books.html; the stdlib would redirect to the directory listing, which
        # is why the nav looked broken locally. The .html file wins.
        #
        # Strip a trailing slash before testing. This matters more than it
        # looks: the first version of this server 301'd /books -> /books/, and
        # a 301 is cached hard by the browser, so that redirect keeps firing
        # long after the bug is fixed. Serving /books/ correctly is what makes
        # the stale redirect harmless.
        bare = full.rstrip(os.sep)
        if os.path.isfile(bare + ".html"):
            return bare + ".html"
        if os.path.isdir(full):
            index = os.path.join(full, "index.html")
            if os.path.exists(index):
                return index
        if not os.path.exists(full):
            candidate = os.path.join(full, "index.html")
            if os.path.exists(candidate):
                return candidate
        return full

    def log_message(self, fmt, *args):
        # keep the console quiet; only surface the misses that matter
        if args and len(args) > 1 and str(args[1]).startswith("4"):
            sys.stderr.write("  %s %s\n" % (args[1], args[0]))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(ROOT)
    print("preview on http://localhost:%d  (pretty URLs, as Netlify serves them)" % port)
    # THREADING matters: a browser opens several connections at once and
    # holds them open with keep-alive. A single-threaded server answers the
    # first and hangs on the rest, which looks exactly like the site being
    # broken. Videos on the homepage make it certain.
    ThreadingHTTPServer(("127.0.0.1", port), PrettyURLHandler).serve_forever()
