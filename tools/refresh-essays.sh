#!/bin/bash
# Weekly refresh of the Essays page from Craig's Substack feed.
# Proof-of-concept for the auto-update feature. Logs each run to refresh.log.
DIR="$(cd "$(dirname "$0")" && pwd)"
STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
{
  echo "----- $STAMP -----"
  /usr/bin/python3 "$DIR/build_essays.py"
  echo "exit: $?"
} >> "$DIR/refresh.log" 2>&1
