#!/usr/bin/env zsh
# Rebuild posts.json from ~/devlogs and push to joey114132/devlog when data changed.
set -euo pipefail

ROOT="${DEVLOG_SITE_ROOT:-$HOME/devlog-site}"
DEVLOG_ROOT="${DEVLOG_ROOT:-$HOME/devlogs}"

cd "$ROOT"

python3 scripts/build.py

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
