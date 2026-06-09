#!/usr/bin/env python3
"""Local-only API to save devlog markdown to ~/devlogs and rebuild the site."""

from __future__ import annotations

import cgi
import json
import mimetypes
import os
import re
import subprocess
import sys
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

DEVLOG_ROOT = Path(os.environ.get("DEVLOG_ROOT", Path.home() / "devlogs"))
SITE_ROOT = Path(__file__).resolve().parent.parent
BUILD = SITE_ROOT / "scripts" / "build.py"
SYNC = SITE_ROOT / "scripts" / "sync-github.sh"
PORT = int(os.environ.get("DEVLOG_EDITOR_PORT", "8781"))
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
PRISMIC_ASSET_API = "https://asset-api.prismic.io/assets"
MAX_UPLOAD_BYTES = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".mp4",
    ".mov",
    ".webm",
    ".avi",
    ".mkv",
}


def load_dotenv() -> None:
    env_path = SITE_ROOT / ".env"
    if not env_path.is_file():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


load_dotenv()


def prismic_config() -> dict:
    token = os.environ.get("PRISMIC_TOKEN", "").strip()
    repo = os.environ.get("PRISMIC_REPOSITORY", "").strip()
    return {
        "configured": bool(token and repo),
        "repository": repo if token and repo else "",
    }


def safe_filename(name: str) -> str:
    base = Path(name or "upload").name
    base = re.sub(r"[^\w.\-]+", "-", base).strip("-")
    return base or "upload.bin"


def asset_kind(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext in {".mp4", ".mov", ".webm", ".avi", ".mkv"}:
        return "video"
    return "image"


def markdown_for_asset(url: str, filename: str) -> str:
    alt = Path(filename).stem.replace("-", " ").replace("_", " ") or "image"
    ext = Path(filename).suffix.lower()
    base = url.split("?")[0]
    if asset_kind(filename) == "video":
        return f'<video controls src="{url}"></video>'
    if ext == ".gif":
        return f"![{alt}]({base})"
    if "?" in url:
        return f"![{alt}]({url})"
    return f"![{alt}]({url}?auto=format,compress)"


def upload_to_prismic(file_bytes: bytes, filename: str, content_type: str) -> str:
    token = os.environ.get("PRISMIC_TOKEN", "").strip()
    repo = os.environ.get("PRISMIC_REPOSITORY", "").strip()
    if not token or not repo:
        raise ValueError("Prismic credentials missing in .env")

    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise ValueError(f"file too large (max {MAX_UPLOAD_BYTES // (1024 * 1024)}MB)")

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"unsupported file type: {ext or 'unknown'}")

    if not content_type:
        content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"

    boundary = f"----DevlogUpload{uuid.uuid4().hex}"
    disposition = f'form-data; name="file"; filename="{filename}"'
    body = b"".join(
        [
            f"--{boundary}\r\n".encode(),
            f"Content-Disposition: {disposition}\r\n".encode(),
            f"Content-Type: {content_type}\r\n\r\n".encode(),
            file_bytes,
            b"\r\n",
            f"--{boundary}--\r\n".encode(),
        ]
    )

    req = Request(
        PRISMIC_ASSET_API,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "repository": repo,
            "Accept": "application/json",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )

    try:
        with urlopen(req, timeout=120) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise ValueError(f"Prismic upload failed ({exc.code}): {detail[:240]}") from exc
    except URLError as exc:
        raise ValueError(f"Prismic upload failed: {exc.reason}") from exc

    url = payload.get("url") or payload.get("asset", {}).get("url")
    if not url:
        raise ValueError("Prismic response missing url")
    return str(url)


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
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
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
            cfg = prismic_config()
            self._json(
                200,
                {
                    "ok": True,
                    "devlog_root": str(DEVLOG_ROOT),
                    "upload": {
                        "prismic": cfg["configured"],
                        "repository": cfg["repository"],
                    },
                },
            )
            return

        if path == "/api/upload/config":
            cfg = prismic_config()
            self._json(
                200,
                {
                    "ok": cfg["configured"],
                    "repository": cfg["repository"],
                    "maxMb": MAX_UPLOAD_BYTES // (1024 * 1024),
                    "extensions": sorted(ALLOWED_EXTENSIONS),
                },
            )
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
        if path == "/api/upload":
            self._handle_upload()
            return

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

    def _handle_upload(self) -> None:
        cfg = prismic_config()
        if not cfg["configured"]:
            self._json(
                503,
                {
                    "error": "Prismic not configured",
                    "hint": "Add PRISMIC_TOKEN and PRISMIC_REPOSITORY to devlog-site/.env",
                },
            )
            return

        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            self._json(400, {"error": "expected multipart/form-data"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0 or length > MAX_UPLOAD_BYTES + 4096:
            self._json(400, {"error": "invalid upload size"})
            return

        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": content_type,
                "CONTENT_LENGTH": str(length),
            },
        )

        items = form["file"] if "file" in form else []
        if not isinstance(items, list):
            items = [items]

        uploads: list[dict] = []
        errors: list[str] = []

        for item in items:
            if not getattr(item, "file", None) or not getattr(item, "filename", None):
                continue
            raw_name = safe_filename(item.filename)
            data = item.file.read()
            if not data:
                errors.append(f"{raw_name}: empty file")
                continue
            try:
                url = upload_to_prismic(data, raw_name, item.type or "")
                uploads.append(
                    {
                        "filename": raw_name,
                        "url": url,
                        "kind": asset_kind(raw_name),
                        "markdown": markdown_for_asset(url, raw_name),
                    }
                )
            except ValueError as exc:
                errors.append(f"{raw_name}: {exc}")

        if not uploads:
            self._json(400, {"error": errors[0] if errors else "no files uploaded"})
            return

        self._json(200, {"ok": True, "uploads": uploads, "errors": errors})


def main() -> None:
    host = "127.0.0.1"
    httpd = ThreadingHTTPServer((host, PORT), Handler)
    print(f"Devlog editor API on http://{host}:{PORT}  (root: {DEVLOG_ROOT})")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
