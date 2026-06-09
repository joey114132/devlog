#!/usr/bin/env zsh
# Rebuild posts.json from ~/devlogs and push to joey114132/devlog when data changed.
set -euo pipefail

ROOT="${DEVLOG_SITE_ROOT:-$HOME/devlog-site}"
DEVLOG_ROOT="${DEVLOG_ROOT:-$HOME/devlogs}"
CONTENT_DIR="$ROOT/content"

cd "$ROOT"

# Mirror local markdown into repo content/ for GitHub web saves round-trip.
if [[ -d "$DEVLOG_ROOT" ]]; then
  mkdir -p "$CONTENT_DIR"
  while IFS= read -r -d '' md; do
    rel="${md#"$DEVLOG_ROOT"/}"
    dest="$CONTENT_DIR/$rel"
    mkdir -p "$(dirname "$dest")"
    cp -f "$md" "$dest"
  done < <(find "$DEVLOG_ROOT" -type f -name '*.md' -print0)
fi

python3 scripts/build.py

posts_unchanged=0
if python3 - <<'PY'
import json
import subprocess
import sys
from pathlib import Path

path = Path("data/posts.json")
if not path.exists():
    sys.exit(1)

current = json.loads(path.read_text(encoding="utf-8"))
try:
    previous = json.loads(
        subprocess.check_output(["git", "show", "HEAD:data/posts.json"], stderr=subprocess.DEVNULL)
    )
except subprocess.CalledProcessError:
    sys.exit(1)

sys.exit(0 if current.get("posts") == previous.get("posts") else 1)
PY
then
  posts_unchanged=1
fi

content_dirty=0
if ! git diff --quiet -- content 2>/dev/null; then
  content_dirty=1
fi
if [[ -n "$(git ls-files --others --exclude-standard content 2>/dev/null)" ]]; then
  content_dirty=1
fi

if [[ "$posts_unchanged" -eq 1 && "$content_dirty" -eq 0 ]] && git diff --quiet -- data/posts.json 2>/dev/null; then
  echo "sync-github: posts unchanged — skip commit/push"
  exit 0
fi

if git diff --quiet -- data/posts.json content 2>/dev/null && [[ "$content_dirty" -eq 0 ]]; then
  echo "sync-github: no changes in data/posts.json or content/ — skip commit/push"
  exit 0
fi

git add data/posts.json content
today="$(date +%Y-%m-%d)"
git commit -m "$(cat <<EOF
devlog 빌드 갱신 (${today})

~/devlogs 마크다운을 반영해 GitHub Pages용 posts.json을 업데이트한다.
EOF
)"
git push origin main
echo "sync-github: pushed to origin/main"
