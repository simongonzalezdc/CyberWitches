#!/usr/bin/env bash
# Dist/prod smoke: build (optional), serve static, hit play.html boot markers.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${SMOKE_PORT:-8799}"
MODE="${1:-dist}" # dist | src | url

if [[ "$MODE" == "url" ]]; then
  URL="${2:?usage: smoke-dist.sh url https://.../play.html}"
else
  if [[ "$MODE" == "dist" ]]; then
    npm run build:prod
    SERVE_DIR="$ROOT/dist"
  else
    SERVE_DIR="$ROOT"
  fi
  npx --yes http-server "$SERVE_DIR" -p "$PORT" -c-1 --silent &
  PID=$!
  trap 'kill $PID 2>/dev/null || true' EXIT
  sleep 1
  URL="http://127.0.0.1:${PORT}/play.html"
fi

# Fetch HTML
code=$(curl -sS -o /tmp/cw-smoke-play.html -w "%{http_code}" "$URL")
if [[ "$code" != "200" ]]; then
  echo "FAIL: play.html HTTP $code at $URL"
  exit 1
fi
if ! grep -q 'cast-button\|id="cast-button"' /tmp/cw-smoke-play.html; then
  echo "FAIL: cast button not found in play.html"
  exit 1
fi
echo "PASS: smoke $MODE $URL"
