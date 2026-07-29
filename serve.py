#!/usr/bin/env python3
"""Tiny static dev server for the C. M. Taylor site.

Identical to `python3 -m http.server` EXCEPT it sends no-cache headers, so the
browser can never run a stale cached script/stylesheet. During this redesign we
kept hitting "dead nav / black screen" bugs that were actually just the browser
executing an old cached fold-child.js/fold.js – this makes that impossible.

    python3 serve.py [port]   (default 8765)
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
