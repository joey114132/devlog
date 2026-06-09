#!/usr/bin/env zsh
# Rebuild posts.json from ~/devlogs and push to joey114132/devlog when data changed.
set -euo pipefail

ROOT="${DEVLOG_SITE_ROOT:-$HOME/devlog-site}"
DEVLOG_ROOT="${DEVLOG_ROOT:-$HOME/devlogs}"

cd "$ROOT"

python3 scripts/build.py

# Skip push when only generated_at changed (posts content identical)
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
  echo "sync-github: posts unchanged — skip commit/push"
  exit 0
fi

if git diff --quiet -- data/posts.json 2>/dev/null; then
  echo "sync-github: no changes in data/posts.json — skip commit/push"
  exit 0
fi

git add data/posts.json
today="$(date +%Y-%m-%d)"
git commit -m "$(cat <<EOF
devlog 빌드 갱신 (${today})

~/devlogs 마크다운을 반영해 GitHub Pages용 posts.json을 업데이트한다.
EOF
)"
git push origin main
echo "sync-github: pushed to origin/main"
