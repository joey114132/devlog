#!/usr/bin/env python3
"""Sync markdown devlogs from ~/devlogs into data/posts.json for the static site."""

from __future__ import annotations

import json
import os
import re
from datetime import datetime
from pathlib import Path

DEVLOG_ROOT = Path(os.environ.get("DEVLOG_ROOT", Path.home() / "devlogs"))
OUT = Path(__file__).resolve().parent.parent / "data" / "posts.json"

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
TITLE_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    meta: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip()
    body = text[match.end() :]
    return meta, body


def extract_title(body: str, slug: str) -> str:
    m = TITLE_RE.search(body)
    if m:
        return m.group(1).strip()
    return slug.replace("-", " ")


def excerpt(body: str, limit: int = 140) -> str:
    lines = []
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped == "---":
            continue
        lines.append(stripped)
        if len(" ".join(lines)) >= limit:
            break
    text = " ".join(lines)
    if len(text) > limit:
        return text[: limit - 1].rstrip() + "…"
    return text


def collect_posts() -> list[dict]:
    posts: list[dict] = []
    if not DEVLOG_ROOT.is_dir():
        return posts

    for md_path in sorted(DEVLOG_ROOT.rglob("*.md")):
        rel = md_path.relative_to(DEVLOG_ROOT)
        parts = rel.parts
        if len(parts) < 2:
            continue
        date_folder, filename = parts[0], parts[-1]
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date_folder):
            continue

        slug = md_path.stem
        post_id = f"{date_folder}/{slug}"
        raw = md_path.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(raw)
        date = meta.get("date", date_folder)
        title = extract_title(body, slug)

        posts.append(
            {
                "id": post_id,
                "date": date,
                "title": title,
                "slug": slug,
                "project": meta.get("project", ""),
                "tags": [t.strip() for t in meta.get("tags", "").strip("[]").split(",") if t.strip()],
                "excerpt": excerpt(body),
                "markdown": body.strip(),
            }
        )

    posts.sort(key=lambda p: (p["date"], p["id"]), reverse=True)
    return posts


def main() -> None:
    posts = collect_posts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "source": str(DEVLOG_ROOT),
        "count": len(posts),
        "posts": posts,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(posts)} posts to {OUT}")


if __name__ == "__main__":
    main()
