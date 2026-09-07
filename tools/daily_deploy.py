#!/usr/bin/env python3
"""
Deploy cmtaylorstory.com once a day, and prove the newest essay made it.

Run by .github/workflows/deploy.yml. Deploys when any of these is true:

  * main has moved since the last production deploy (Craig published a change
    in the editor, or Jack shipped something);
  * the newest post on Craig's Substack is not on the live Essays page;
  * FORCE=true (the workflow's "Run" button).

Otherwise it does nothing, which costs nothing. After a deploy it waits for
Netlify to finish and then checks the live Essays page for the newest post.
A missing post or a failed build exits 1, so GitHub emails Jack. A quiet
no-op would not.

Netlify's deploy list for this site is public, so no API token is needed.
The build hook is the only secret.

Usage:  NETLIFY_BUILD_HOOK=... [FORCE=true] python3 tools/daily_deploy.py
"""
import json, os, subprocess, sys, time, urllib.request, xml.etree.ElementTree as ET

SITE   = "0253899d-1e3f-479b-bd97-524f60191a6c"
API    = f"https://api.netlify.com/api/v1/sites/{SITE}/deploys?per_page=20"
FEED   = "https://cmtaylorstory.substack.com/feed"
LIVE   = "https://cmtaylorstory.com/essays/"
UA     = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
          "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36")
WAIT_S = 10 * 60      # how long to give Netlify before calling it a failure


def get(url, attempts=3):
    req = urllib.request.Request(url, headers={"User-Agent": UA,
                                               "Cache-Control": "no-cache"})
    last = None
    for i in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception as e:                       # noqa: BLE001
            last = e
            time.sleep(3 * (i + 1))
    raise last


def newest_post():
    """(title, link) of the newest Substack post, or None if the feed is down."""
    try:
        root = ET.fromstring(get(FEED))
        item = root.find("./channel/item")
        return item.findtext("title", "").strip(), item.findtext("link", "").strip()
    except Exception as e:                           # noqa: BLE001
        print(f"Could not read the Substack feed ({e}); skipping the essay check.")
        return None


def production_deploys():
    return [d for d in json.loads(get(API)) if d.get("context") == "production"]


def head_sha():
    sha = os.environ.get("GITHUB_SHA")
    if sha:
        return sha
    return subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()


def live_has(link):
    return link in get(LIVE + f"?t={int(time.time())}").decode("utf-8", "replace")


def main():
    hook = os.environ.get("NETLIFY_BUILD_HOOK")
    if not hook:
        print("NETLIFY_BUILD_HOOK is not set. Nothing to call.")
        return 1

    before = production_deploys()
    last = next((d for d in before if d.get("state") == "ready"), None)
    last_sha = (last or {}).get("commit_ref") or ""
    head = head_sha()
    post = newest_post()

    reasons = []
    if head != last_sha:
        reasons.append(f"main moved ({last_sha[:7] or 'none'} -> {head[:7]})")
    if post and not live_has(post[1]):
        reasons.append(f"newest essay not on the live page: {post[0]!r}")
    if os.environ.get("FORCE", "").lower() == "true":
        reasons.append("forced")

    print(f"Last production deploy: {(last or {}).get('created_at', 'none')} "
          f"at {last_sha[:7] or 'none'}; main is at {head[:7]}.")
    if post:
        print(f"Newest on Substack: {post[0]!r}")
    if not reasons:
        print("Nothing to deploy: main unchanged and the newest essay is already live.")
        return 0

    print("Deploying because: " + "; ".join(reasons))
    req = urllib.request.Request(hook, data=b"{}", method="POST",
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f"Build hook returned HTTP {r.status}")

    known = {d["id"] for d in before}
    deadline = time.time() + WAIT_S
    deploy = None
    while time.time() < deadline:
        time.sleep(20)
        new = [d for d in production_deploys() if d["id"] not in known]
        if new:
            deploy = new[0]
            print(f"  deploy {deploy['id']}: {deploy['state']}")
            if deploy["state"] in ("ready", "error"):
                break
    if not deploy:
        print("Netlify never started a deploy. Is the build hook still valid?")
        return 1
    if deploy["state"] == "error":
        print(f"Netlify build failed: {deploy.get('error_message')}")
        return 1
    if deploy["state"] != "ready":
        print(f"Deploy still {deploy['state']} after {WAIT_S // 60} minutes.")
        return 1

    if post:
        time.sleep(10)                                # let the CDN settle
        if live_has(post[1]):
            print(f"Live: {post[0]!r} is on {LIVE}")
        else:
            print(f"Deployed, but {post[0]!r} is NOT on {LIVE}. "
                  "Substack may have refused the build's feed request; "
                  "check the Netlify build log.")
            return 1
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
