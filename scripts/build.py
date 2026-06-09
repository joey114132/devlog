#!/usr/bin/env python3
"""Sync markdown devlogs from ~/devlogs into data/posts.json for the static site."""

from __future__ import annotations

import json
import os
import re
from datetime import datetime
from pathlib import Path

DEVLOG_ROOT = Path(os.environ.get("DEVLOG_ROOT", Path.home() / "devlogs"))
SITE_ROOT = Path(__file__).resolve().parent.parent
OUT = SITE_ROOT / "data" / "posts.json"
FEED_OUT = SITE_ROOT / "feed.xml"
SITE_URL = os.environ.get("DEVLOG_SITE_URL", "https://joey114132.github.io/devlog")

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
TITLE_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)
SCRUM_BLOCK_RE = re.compile(
    r"##\s*Daily\s*Scrum\s*\n([\s\S]*?)(?=\n---\s*\n|\n#\s+[^\n#]|\s*$)",
    re.IGNORECASE,
)
SCRUM_SECTION_RES = {
    "yesterday": re.compile(
        r"###\s*어제\s*한?\s*일\s*\n([\s\S]*?)(?=\n###\s*|\n---\s*\n|\n#\s+[^\n#]|$)",
        re.IGNORECASE,
    ),
    "today": re.compile(
        r"###\s*오늘\s*할?\s*일\s*\n([\s\S]*?)(?=\n###\s*|\n---\s*\n|\n#\s+[^\n#]|$)",
        re.IGNORECASE,
    ),
    "share": re.compile(
        r"###\s*공유할?\s*거\s*\n([\s\S]*?)(?=\n###\s*|\n---\s*\n|\n#\s+[^\n#]|$)",
        re.IGNORECASE,
    ),
}


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


def reading_minutes(body: str, wpm: int = 220) -> int:
    words = len(re.findall(r"\S+", body))
    return max(1, round(words / wpm))


def extract_scrum(body: str) -> dict[str, str]:
    block = SCRUM_BLOCK_RE.search(body)
    if not block:
        return {"yesterday": "", "today": "", "share": ""}

    scrum_text = block.group(0)
    result: dict[str, str] = {}
    for key, pattern in SCRUM_SECTION_RES.items():
        match = pattern.search(scrum_text)
        result[key] = match.group(1).strip() if match else ""
    return result


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

        scrum = extract_scrum(body)
        posts.append(
            {
                "id": post_id,
                "date": date,
                "title": title,
                "slug": slug,
                "project": meta.get("project", ""),
                "tags": [t.strip() for t in meta.get("tags", "").strip("[]").split(",") if t.strip()],
                "scrum": scrum,
                "excerpt": excerpt(body),
                "reading_minutes": reading_minutes(body),
                "markdown": body.strip(),
            }
        )

    posts.sort(key=lambda p: (p["date"], p["id"]), reverse=True)
    return posts


def collect_tags(posts: list[dict]) -> list[str]:
    tags: set[str] = set()
    for post in posts:
        tags.update(post.get("tags") or [])
        if post.get("project"):
            tags.add(post["project"])
    return sorted(tags, key=str.casefold)


def write_feed(posts: list[dict]) -> None:
    updated = datetime.now().astimezone().strftime("%a, %d %b %Y %H:%M:%S %z")
    items = []
    for post in posts[:30]:
        link = f"{SITE_URL}/post.html?id={post['id']}"
        title = escape_xml(post["title"])
        desc = escape_xml(post["excerpt"])
        pub = f"{post['date']}T09:00:00+09:00"
        items.append(
            f"""    <item>
      <title>{title}</title>
      <link>{link}</link>
      <guid isPermaLink="true">{link}</guid>
      <pubDate>{pub}</pubDate>
      <description>{desc}</description>
    </item>"""
        )

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Joey Devlog</title>
    <link>{SITE_URL}/</link>
    <description>Joey의 개발 다이어리 — Cursor 세션, 하네스, 프로젝트 작업 기록</description>
    <language>ko</language>
    <lastBuildDate>{updated}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
"""
    FEED_OUT.write_text(xml, encoding="utf-8")


def escape_xml(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def main() -> None:
    posts = collect_posts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "source": str(DEVLOG_ROOT),
        "site_url": SITE_URL,
        "count": len(posts),
        "tags": collect_tags(posts),
        "posts": posts,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_feed(posts)
    print(f"Wrote {len(posts)} posts to {OUT}")
    print(f"Wrote RSS feed to {FEED_OUT}")


if __name__ == "__main__":
    main()
