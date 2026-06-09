#!/usr/bin/env python3
"""Local-only API to save devlog markdown to ~/devlogs and rebuild the site."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

DEVLOG_ROOT = Path(os.environ.get("DEVLOG_ROOT", Path.home() / "devlogs"))
SITE_ROOT = Path(__file__).resolve().parent.parent
BUILD = SITE_ROOT / "scripts" / "build.py"
SYNC = SITE_ROOT / "scripts" / "sync-github.sh"
PORT = int(os.environ.get("DEVLOG_EDITOR_PORT", "8781"))
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def safe_post_path(post_id: str) -> Path | None:
    parts = post_id.split("/")
    if len(parts) != 2:
        return None
    date_folder, slug = parts
    if not DATE_RE.fullmatch(date_folder) or not SLUG_RE.fullmatch(slug):
        return None
    target = (DEVLOG_ROOT / date_folder / f"{slug}.md").resolve()
    root = DEVLOG_ROOT.resolve()
    if root not in target.parents:
        return None
    return target


class Handler(BaseHTTPRequestHandler):
    server_version = "DevlogEditor/1.0"

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _cors(self) -> None:
        origin = self.headers.get("Origin", "*")
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Vary", "Origin")

    def _json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/health":
            self._json(200, {"ok": True, "devlog_root": str(DEVLOG_ROOT)})
            return

        if path.startswith("/api/raw/"):
            post_id = path.removeprefix("/api/raw/")
            target = safe_post_path(post_id)
            if not target:
                self._json(400, {"error": "invalid id"})
                return
            if not target.is_file():
                self._json(404, {"error": "not found"})
                return
            self._json(200, {"id": post_id, "content": target.read_text(encoding="utf-8")})
            return

        self._json(404, {"error": "not found"})

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path != "/api/save":
            self._json(404, {"error": "not found"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        try:
            data = json.loads(self.rfile.read(length).decode("utf-8"))
        except json.JSONDecodeError:
            self._json(400, {"error": "invalid json"})
            return

        post_id = str(data.get("id", "")).strip()
        content = str(data.get("content", ""))
        mode = str(data.get("mode", "overwrite"))
        sync = bool(data.get("sync", True))

        if not content.strip():
            self._json(400, {"error": "empty content"})
            return

        target = safe_post_path(post_id)
        if not target:
            self._json(400, {"error": "invalid id"})
            return

        target.parent.mkdir(parents=True, exist_ok=True)

        if mode == "append" and target.is_file():
            existing = target.read_text(encoding="utf-8").rstrip()
            final = f"{existing}\n\n---\n\n{content.strip()}\n"
        else:
            final = content if content.endswith("\n") else f"{content}\n"

        target.write_text(final, encoding="utf-8")

        try:
            subprocess.run([sys.executable, str(BUILD)], check=True, cwd=SITE_ROOT)
        except subprocess.CalledProcessError as exc:
            self._json(500, {"error": "build failed", "detail": str(exc)})
            return

        pushed = False
        if sync and SYNC.is_file():
            try:
                subprocess.run(["zsh", str(SYNC)], check=True, cwd=SITE_ROOT)
                pushed = True
            except subprocess.CalledProcessError:
                pushed = False

        self._json(
            200,
            {
                "ok": True,
                "path": str(target),
                "mode": mode,
                "synced": pushed,
            },
        )


def main() -> None:
    host = "127.0.0.1"
    httpd = ThreadingHTTPServer((host, PORT), Handler)
    print(f"Devlog editor API on http://{host}:{PORT}  (root: {DEVLOG_ROOT})")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
