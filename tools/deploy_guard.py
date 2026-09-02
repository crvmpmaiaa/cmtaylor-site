#!/usr/bin/env python3
"""Decide whether today's deploy should happen. Used by .github/workflows/deploy.yml.

Writes DEPLOY=yes|no to $GITHUB_ENV. Exits 0 for "deploy" and "nothing new";
exits 1 when the month's deploy budget is spent, so the failed run is emailed.

Budget is counted from Netlify's deploy log for the current usage period,
which starts on the 20th of the month, Pacific time. Run locally with
NETLIFY_AUTH_TOKEN set to see the numbers without deploying:

    python3 tools/deploy_guard.py --dry-run
"""
import json
import os
import subprocess
import sys
import urllib.request
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

API = "https://api.netlify.com/api/v1"
CREDITS_PER_DEPLOY = 15
PLAN_CREDITS = 300
PERIOD_DAY = 20
PACIFIC = ZoneInfo("America/Los_Angeles")


def period_start(now):
    """Start of the current Netlify usage period, as an aware datetime."""
    today = now.astimezone(PACIFIC).date()
    if today.day >= PERIOD_DAY:
        start = today.replace(day=PERIOD_DAY)
    else:
        first_of_month = today.replace(day=1)
        start = (first_of_month - timedelta(days=1)).replace(day=PERIOD_DAY)
    return datetime(start.year, start.month, start.day, tzinfo=PACIFIC)


def production_deploys(site_id, token, since):
    req = urllib.request.Request(
        f"{API}/sites/{site_id}/deploys?per_page=100",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        deploys = json.load(r)
    out = []
    for d in deploys:
        if d.get("context") != "production":
            continue
        created = datetime.fromisoformat(d["created_at"].replace("Z", "+00:00"))
        if created >= since and d.get("state") not in ("error", "skipped", "cancelled"):
            out.append(d)
    return out


def head_sha():
    return subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()


def main():
    dry = "--dry-run" in sys.argv
    token = os.environ["NETLIFY_AUTH_TOKEN"]
    site_id = os.environ.get("NETLIFY_SITE_ID", "0253899d-1e3f-479b-bd97-524f60191a6c")
    budget = int(os.environ.get("DEPLOY_BUDGET", "14"))
    force = os.environ.get("FORCE", "false").lower() == "true"

    now = datetime.now(tz=PACIFIC)
    since = period_start(now)
    deploys = production_deploys(site_id, token, since)
    used = len(deploys)
    spent = used * CREDITS_PER_DEPLOY
    last_sha = deploys[0].get("commit_ref") if deploys else None
    head = head_sha()

    print(f"Usage period started {since.date()} (Pacific)")
    print(f"Production deploys this period: {used} of {budget} budgeted "
          f"(~{spent} of {PLAN_CREDITS} credits on deploys alone)")
    print(f"Last deployed commit: {last_sha}")
    print(f"Current main:         {head}")

    decision = "no"
    if used >= budget:
        print(f"\nBUDGET SPENT: {used} deploys already this period, budget is {budget}. "
              f"Not deploying. Raise DEPLOY_BUDGET only if the Netlify balance allows it.")
        write_env(decision, dry)
        sys.exit(1)
    if last_sha != head:
        print("\nmain has changed since the last deploy. Deploying.")
        decision = "yes"
    elif force:
        print("\nNo new commits, but a refresh was asked for (essays). Deploying.")
        decision = "yes"
    else:
        print("\nNothing new since the last deploy. Not deploying.")
    print(f"Deploys left after this run: {budget - used - (1 if decision == 'yes' else 0)}")
    write_env(decision, dry)


def write_env(decision, dry):
    if dry:
        print(f"(dry run) DEPLOY={decision}")
        return
    path = os.environ.get("GITHUB_ENV")
    if path:
        with open(path, "a") as f:
            f.write(f"DEPLOY={decision}\n")


if __name__ == "__main__":
    main()
