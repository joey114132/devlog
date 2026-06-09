# Joey Devlog

Static site for Korean dev diary entries from `~/devlogs`.

## Build

```zsh
python3 scripts/build.py
```

Reads `DEVLOG_ROOT` (default `~/devlogs`) and writes `data/posts.json`.

## Local preview

```zsh
python3 -m http.server 8780
```

Open http://127.0.0.1:8780

## GitHub Pages

1. Repo → Settings → Pages → Source: **Deploy from branch**
2. Branch: `main`, folder: `/ (root)`
3. After push, site URL: `https://joey114132.github.io/devlog/`

Re-run `scripts/build.py` whenever you add devlogs, then commit `data/posts.json`.

Or use the full sync (build + push):

```zsh
~/devlog-site/scripts/sync-github.sh
```

`/devlog` in Cursor runs this automatically after writing `~/devlogs/YYYY-MM-DD/daily.md`.
