#!/usr/bin/env bash
# Dist/prod smoke: build (optional), serve static, hit play.html boot markers.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${SMOKE_PORT:-8799}"
MODE="${1:-dist}" # dist | src | url
TMP_HTML="$(mktemp -t cw-smoke-play.XXXXXX.html)"
trap 'rm -f "$TMP_HTML"; kill "${PID:-}" 2>/dev/null || true' EXIT

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
  URL="http://127.0.0.1:${PORT}/play.html"
  # Poll until server answers (avoid flaky fixed sleep)
  ready=0
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    if curl -sf -o /dev/null "$URL"; then
      ready=1
      break
    fi
    sleep 0.2
  done
  if [[ "$ready" != "1" ]]; then
    echo "FAIL: server did not become ready at $URL"
    exit 1
  fi
fi

code=$(curl -sS -o "$TMP_HTML" -w "%{http_code}" "$URL")
if [[ "$code" != "200" ]]; then
  echo "FAIL: play.html HTTP $code at $URL"
  exit 1
fi
if ! grep -q 'cast-button' "$TMP_HTML"; then
  echo "FAIL: cast button not found in play.html"
  exit 1
fi
echo "PASS: smoke $MODE $URL"
