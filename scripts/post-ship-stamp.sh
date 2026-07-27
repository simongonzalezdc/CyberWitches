#!/usr/bin/env bash
# Print a post-ship docs stamp template for the current main tip.
set -euo pipefail
cd "$(dirname "$0")/.."
git fetch origin main --quiet 2>/dev/null || true
TIP=$(git rev-parse origin/main 2>/dev/null || git rev-parse HEAD)
SHORT=$(git rev-parse --short "$TIP")
DATE=$(date -u +%Y-%m-%d)
cat <<TEMPLATE
# Post-ship stamp template

Date (UTC): $DATE
origin/main tip: $TIP
short: $SHORT

Edit:
- guides/restoration-kernel/QUALITY_REPORT.md  → main tip + Overall PASS line
- guides/restoration-kernel/CLAIM_AUDIT.md     → main tip + Last updated + feature rows
- CHANGELOG.md (if player-visible ship)

Checklist: guides/restoration-kernel/POST_SHIP_STAMP.md

Suggested commit message:
docs(stamp): tip $SHORT after merge

TEMPLATE
