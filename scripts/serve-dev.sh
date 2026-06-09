#!/usr/bin/env zsh
# Start static site + local editor save API for writing devlogs from the browser.
set -euo pipefail

ROOT="${DEVLOG_SITE_ROOT:-$HOME/devlog-site}"
STATIC_PORT="${DEVLOG_STATIC_PORT:-8780}"
EDITOR_PORT="${DEVLOG_EDITOR_PORT:-8781}"

cd "$ROOT"

cleanup() {
  kill ${STATIC_PID:-} ${EDITOR_PID:-} 2>/dev/null || true
}
trap cleanup EXIT INT TERM

python3 scripts/editor-server.py &
EDITOR_PID=$!

python3 -m http.server "$STATIC_PORT" &
STATIC_PID=$!

echo "Static site:  http://127.0.0.1:${STATIC_PORT}/"
echo "Editor page:  http://127.0.0.1:${STATIC_PORT}/edit.html"
echo "Save API:     http://127.0.0.1:${EDITOR_PORT}/health"
echo "Press Ctrl+C to stop."

wait
