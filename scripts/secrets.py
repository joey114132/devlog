#!/usr/bin/env python3
"""Redact and scan for accidental secrets before devlog publish."""

from __future__ import annotations

import re
import sys
from pathlib import Path

# (regex, replacement) — gather-context와 build가 같은 규칙을 씀
REDACT_RULES: list[tuple[re.Pattern[str], str]] = [
  (re.compile(r"ghp_[A-Za-z0-9_]+"), "[REDACTED]"),
  (re.compile(r"github_pat_[A-Za-z0-9_]+"), "[REDACTED]"),
  (re.compile(r"GHTOKEN[A-Za-z0-9_]*"), "GHTOKEN[REDACTED]"),
  (re.compile(r"API_KEY=[^\s'\"]+"), "API_KEY=[REDACTED]"),
  (re.compile(r"UNDERSTAND_ACCESS_TOKEN=[^\s'\"]+"), "UNDERSTAND_ACCESS_TOKEN=[REDACTED]"),
  (re.compile(r"sam3-dashboard-\d+"), "sam3-dashboard-[REDACTED]"),
  (re.compile(r"\?token=[^\s\"'<>]+"), "?token=[REDACTED]"),
  (re.compile(r"sk-[A-Za-z0-9_-]{20,}"), "sk-[REDACTED]"),
  (re.compile(r"AKIA[0-9A-Z]{16}"), "AKIA[REDACTED]"),
  (re.compile(r"xox[baprs]-[A-Za-z0-9-]{10,}"), "xox[REDACTED]"),
  (re.compile(r"-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----"), "[REDACTED_PRIVATE_KEY]"),
]

# 빌드/커밋 전 차단용 — REDACT보다 보수적으로 매칭
SCAN_RULES: list[tuple[str, re.Pattern[str]]] = [
  ("GitHub PAT (ghp_)", re.compile(r"ghp_[A-Za-z0-9_]{20,}")),
  ("GitHub fine-grained PAT", re.compile(r"github_pat_[A-Za-z0-9_]{20,}")),
  ("OpenAI-style key", re.compile(r"sk-[A-Za-z0-9_-]{20,}")),
  ("AWS access key", re.compile(r"AKIA[0-9A-Z]{16}")),
  ("Slack token", re.compile(r"xox[baprs]-[A-Za-z0-9-]{10,}")),
  ("Understand dashboard token", re.compile(r"sam3-dashboard-\d+")),
  ("URL access token", re.compile(r"\?token=[A-Za-z0-9._-]{8,}")),
  ("Bearer token", re.compile(r"Bearer [A-Za-z0-9._-]{24,}")),
  ("Private key block", re.compile(r"-----BEGIN [A-Z ]+ PRIVATE KEY-----")),
]


def redact_text(text: str) -> str:
  out = text
  for pattern, repl in REDACT_RULES:
    out = pattern.sub(repl, out)
  return out


def find_secrets(text: str, *, path: str = "<text>") -> list[str]:
  hits: list[str] = []
  for label, pattern in SCAN_RULES:
    for match in pattern.finditer(text):
      snippet = match.group(0)
      if len(snippet) > 48:
        snippet = snippet[:24] + "…"
      hits.append(f"{path}: {label} ({snippet})")
  return hits


def scan_paths(paths: list[Path]) -> list[str]:
  issues: list[str] = []
  for path in paths:
    if not path.is_file():
      continue
    # 내부 증거 파일(_context 등)은 publish 대상이 아님
    if path.name.startswith("_"):
      continue
    try:
      text = path.read_text(encoding="utf-8")
    except OSError as exc:
      issues.append(f"{path}: read failed ({exc})")
      continue
    issues.extend(find_secrets(text, path=str(path)))
  return issues


def main(argv: list[str] | None = None) -> int:
  args = argv if argv is not None else sys.argv[1:]
  if not args:
    print("usage: secrets.py redact | check <file>...", file=sys.stderr)
    return 2

  cmd = args[0]
  if cmd == "redact":
    print(redact_text(sys.stdin.read()), end="")
    return 0

  if cmd == "check":
    paths = [Path(p) for p in args[1:]]
    issues = scan_paths(paths)
    if issues:
      print("secrets check failed:", file=sys.stderr)
      for line in issues:
        print(f"  - {line}", file=sys.stderr)
      return 1
    print("secrets check: ok")
    return 0

  print(f"unknown command: {cmd}", file=sys.stderr)
  return 2


if __name__ == "__main__":
  raise SystemExit(main())
