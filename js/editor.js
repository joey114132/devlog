(function () {
  const LOCAL_API = "http://127.0.0.1:8781";
  const { composeMarkdown, parseScrum } = window.DevlogScrum;
  const gh = () => window.DevlogGitHub;

  const els = {
    status: () => document.getElementById("editor-status"),
    date: () => document.getElementById("edit-date"),
    slug: () => document.getElementById("edit-slug"),
    title: () => document.getElementById("edit-title"),
    project: () => document.getElementById("edit-project"),
    tags: () => document.getElementById("edit-tags"),
    yesterday: () => document.getElementById("scrum-yesterday"),
    today: () => document.getElementById("scrum-today"),
    share: () => document.getElementById("scrum-share"),
    body: () => document.getElementById("edit-body"),
    saveBtn: () => document.getElementById("btn-save"),
    appendBtn: () => document.getElementById("btn-append"),
    downloadBtn: () => document.getElementById("btn-download"),
    githubPanel: () => document.getElementById("github-auth"),
    githubToken: () => document.getElementById("github-token"),
    githubConnect: () => document.getElementById("btn-github-connect"),
    githubDisconnect: () => document.getElementById("btn-github-disconnect"),
  };

  let localApiOnline = false;
  let githubOnline = false;
  let saveMode = "none";
  let editingId = null;
  let uploadAvailable = false;

  function todayIso() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function getFormState() {
    return {
      meta: {
        date: els.date()?.value.trim() || todayIso(),
        project: els.project()?.value.trim() || "",
        tags: (els.tags()?.value || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
      title: els.title()?.value.trim() || "새 devlog",
      scrum: {
        yesterday: els.yesterday()?.value.trim() || "",
        today: els.today()?.value.trim() || "",
        share: els.share()?.value.trim() || "",
      },
      body: els.body()?.value.trim() || "",
    };
  }

  function postIdFromForm() {
    const date = els.date()?.value.trim();
    const slug = els.slug()?.value.trim() || "daily";
    return `${date}/${slug}`;
  }

  function setStatus(message, kind = "info") {
    const node = els.status();
    if (!node) return;
    node.textContent = message;
    node.dataset.kind = kind;
  }

  function updateSaveButtons() {
    const canSave = localApiOnline || githubOnline;
    saveMode = localApiOnline ? "local" : githubOnline ? "github" : "none";

    const save = els.saveBtn();
    const append = els.appendBtn();
    if (save) save.disabled = !canSave;
    if (append) append.disabled = !canSave;

    if (localApiOnline) {
      setStatus(
        "로컬 저장 서버 연결됨 — 저장하면 ~/devlogs에 쓰고 빌드·GitHub 동기화합니다.",
        "ok"
      );
      return;
    }

    if (githubOnline) {
      setStatus(
        "GitHub 연결됨 — 저장하면 joey114132/devlog에 바로 반영되고 사이트가 갱신됩니다.",
        "ok"
      );
      return;
    }

    const onLive =
      location.hostname.endsWith("github.io") || location.protocol === "https:";
    if (onLive) {
      setStatus(
        "GitHub 토큰을 연결하면 이 사이트에서 바로 저장·게시할 수 있습니다. (아래 연결)",
        "warn"
      );
    } else {
      setStatus(
        "저장 서버 오프라인 — scripts/serve-dev.sh 실행하거나 GitHub 토큰을 연결하세요.",
        "warn"
      );
    }
  }

  function insertAtCursor(textarea, text, insertIndex) {
    if (!textarea || !text) return textarea?.selectionStart ?? 0;
    const hasIndex = Number.isInteger(insertIndex);
    const start = hasIndex ? insertIndex : textarea.selectionStart ?? textarea.value.length;
    const end = hasIndex ? insertIndex : textarea.selectionEnd ?? start;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    let prefix = "";
    if (before.length) {
      if (!before.endsWith("\n")) prefix = "\n";
      else if (before.endsWith("\n\n")) prefix = "";
      else if (after.length && !after.startsWith("\n")) prefix = "";
    }
    let suffix = "\n";
    if (after.length && !after.startsWith("\n")) suffix = "\n\n";
    const snippet = `${prefix}${text}${suffix}`;
    textarea.value = before + snippet + after;
    const pos = before.length + snippet.length;
    textarea.setSelectionRange(pos, pos);
    textarea.focus();
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    return pos;
  }

  function getTextareaCaretIndex(textarea, clientX, clientY) {
    if (!textarea) return 0;
    const rect = textarea.getBoundingClientRect();
    const style = window.getComputedStyle(textarea);
    const mirror = document.createElement("div");
    mirror.setAttribute("aria-hidden", "true");
    mirror.style.position = "fixed";
    mirror.style.top = `${rect.top}px`;
    mirror.style.left = `${rect.left}px`;
    mirror.style.visibility = "hidden";
    mirror.style.pointerEvents = "none";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.overflow = "hidden";
    mirror.style.width = `${textarea.clientWidth}px`;
    mirror.style.height = `${textarea.clientHeight}px`;
    [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "letterSpacing",
      "lineHeight",
      "textTransform",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "boxSizing",
      "tabSize",
    ].forEach((prop) => {
      mirror.style[prop] = style[prop];
    });

    document.body.appendChild(mirror);
    mirror.scrollTop = textarea.scrollTop;

    const text = textarea.value;
    const relX = clientX - rect.left;
    const relY = clientY - rect.top + textarea.scrollTop;

    const measure = (index) => {
      const before = text.slice(0, index);
      const afterChar = text[index] ?? "\u200b";
      mirror.textContent = "";
      const spanBefore = document.createElement("span");
      spanBefore.textContent = before;
      const marker = document.createElement("span");
      marker.textContent = afterChar === "\n" ? " " : afterChar;
      mirror.appendChild(spanBefore);
      mirror.appendChild(marker);
      const mirrorRect = mirror.getBoundingClientRect();
      const markerRect = marker.getBoundingClientRect();
      return {
        top: markerRect.top - mirrorRect.top + mirror.scrollTop,
        left: markerRect.left - mirrorRect.left,
      };
    };

    let low = 0;
    let high = text.length;
    let best = text.length;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const pos = measure(mid);
      if (pos.top < relY || (pos.top === relY && pos.left < relX)) {
        best = mid + 1;
        low = mid + 1;
      } else {
        best = mid;
        high = mid - 1;
      }
    }

    mirror.remove();
    return Math.min(Math.max(best, 0), text.length);
  }

  function setTextareaCaretFromPoint(textarea, clientX, clientY) {
    const index = getTextareaCaretIndex(textarea, clientX, clientY);
    textarea.focus();
    textarea.setSelectionRange(index, index);
    return index;
  }

  function isMediaFile(file) {
    if (!file) return false;
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) return true;
    return /\.(jpe?g|png|gif|webp|svg|mp4|mov|webm|avi|mkv)$/i.test(file.name || "");
  }

  const IMAGE_MD_RE = /!\[[^\]]*\]\([^)\n]+\)/g;

  function findImageMarkdownBlocks(text) {
    const blocks = [];
    const re = new RegExp(IMAGE_MD_RE.source, "g");
    let match;
    while ((match = re.exec(text)) !== null) {
      const url = match[0].match(/\(([^)]+)\)/)?.[1]?.trim() || "";
      blocks.push({
        start: match.index,
        end: match.index + match[0].length,
        markdown: match[0],
        url,
      });
    }
    return blocks;
  }

  function removeMarkdownBlock(text, start, end) {
    let before = text.slice(0, start);
    let after = text.slice(end);
    if (after.startsWith("\r\n")) after = after.slice(2);
    else if (after.startsWith("\n")) after = after.slice(1);
    if (before.endsWith("\r\n\r\n")) before = before.slice(0, -2);
    else if (before.endsWith("\n\n")) before = before.slice(0, -1);
    return `${before}${after}`.replace(/\n{3,}/g, "\n\n");
  }

  function removeMediaAtIndex(index) {
    const body = els.body();
    if (!body) return;
    const blocks = findImageMarkdownBlocks(body.value);
    const block = blocks[index];
    if (!block) return;
    body.value = removeMarkdownBlock(body.value, block.start, block.end);
    body.dispatchEvent(new Event("input", { bubbles: true }));
    updateBodyLivePreview();
  }

  function removeMediaByMarkdown(markdown) {
    const body = els.body();
    if (!body || !markdown) return false;
    const idx = body.value.indexOf(markdown);
    if (idx !== -1) {
      body.value = removeMarkdownBlock(body.value, idx, idx + markdown.length);
      body.dispatchEvent(new Event("input", { bubbles: true }));
      updateBodyLivePreview();
      return true;
    }
    const url = markdown.match(/\(([^)]+)\)/)?.[1]?.trim();
    if (!url) return false;
    const blocks = findImageMarkdownBlocks(body.value);
    const block = blocks.find((b) => b.url === url || b.markdown.includes(url));
    if (!block) return false;
    body.value = removeMarkdownBlock(body.value, block.start, block.end);
    body.dispatchEvent(new Event("input", { bubbles: true }));
    updateBodyLivePreview();
    return true;
  }

  function attachMediaRemoveButtons(live) {
    if (!live) return;
    const blocks = findImageMarkdownBlocks(els.body()?.value || "");
    const countEl = document.getElementById("edit-body-media-count");
    if (countEl) {
      if (blocks.length) {
        countEl.hidden = false;
        countEl.textContent = `미디어 ${blocks.length}개`;
      } else {
        countEl.hidden = true;
        countEl.textContent = "";
      }
    }

    const mediaNodes = [...live.querySelectorAll("img"), ...live.querySelectorAll("video")];
    mediaNodes.forEach((node, index) => {
      const host = node.closest(".devlog-media-wrap") || node.parentElement;
      if (!host || host.querySelector(".media-remove-btn")) return;
      host.classList.add("has-media-remove");
      if (window.getComputedStyle(host).position === "static") host.style.position = "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "media-remove-btn";
      btn.setAttribute("aria-label", "본문에서 미디어 삭제");
      btn.title = "본문에서 삭제";
      btn.textContent = "삭제";
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        removeMediaAtIndex(index);
      });
      host.appendChild(btn);
    });
  }

  function bindMediaUpload() {
    const dropzone = document.getElementById("media-dropzone");
    const fileInput = document.getElementById("media-file-input");
    const pickBtn = document.getElementById("btn-media-pick");
    const hint = document.getElementById("media-dropzone-hint");
    const list = document.getElementById("media-upload-list");
    const body = els.body();
    if (!dropzone || !fileInput || !body) return;

    const syncUploadUi = () => {
      const enabled = localApiOnline && uploadAvailable;
      dropzone.classList.toggle("is-disabled", !enabled);
      dropzone.setAttribute("aria-disabled", enabled ? "false" : "true");
      if (hint) {
        hint.textContent = enabled
          ? "Prismic CDN으로 업로드합니다. 본문 textarea에 끌어다 놓으면 그 위치에 삽입됩니다."
          : localApiOnline
            ? "업로드 불가 — devlog-site/.env에 PRISMIC_TOKEN과 PRISMIC_REPOSITORY를 설정하세요."
            : "업로드는 로컬 편집 서버(scripts/serve-dev.sh) 실행 시에만 가능합니다.";
      }
    };

    const renderUploadItem = (id, name, state, detail = "", markdown = "") => {
      if (!list) return;
      list.hidden = false;
      let item = list.querySelector(`[data-upload-id="${id}"]`);
      if (!item) {
        item = document.createElement("li");
        item.className = "media-upload-item";
        item.dataset.uploadId = id;
        item.innerHTML =
          '<span class="media-upload-item__name"></span><span class="media-upload-item__status"></span><button type="button" class="media-upload-item__remove btn-ghost">삭제</button>';
        list.prepend(item);
        item.querySelector(".media-upload-item__remove")?.addEventListener("click", () => {
          const md = item.dataset.markdown || "";
          if (md && removeMediaByMarkdown(md)) {
            item.remove();
            if (!list.children.length) list.hidden = true;
            setStatus("본문에서 미디어를 삭제했습니다.", "ok");
          } else {
            setStatus("본문에서 해당 미디어를 찾지 못했습니다.", "warn");
          }
        });
      }
      item.dataset.state = state;
      if (markdown) item.dataset.markdown = markdown;
      item.querySelector(".media-upload-item__name").textContent = name;
      item.querySelector(".media-upload-item__status").textContent = detail;
      const removeBtn = item.querySelector(".media-upload-item__remove");
      if (removeBtn) removeBtn.hidden = state !== "done";
    };

    const uploadFiles = async (files, options = {}) => {
      const batch = Array.from(files || []).filter(isMediaFile);
      if (!batch.length) {
        setStatus("이미지 또는 영상 파일만 업로드할 수 있습니다.", "warn");
        return;
      }
      if (!localApiOnline || !uploadAvailable) {
        setStatus("미디어 업로드는 로컬 편집 서버 + Prismic .env 설정이 필요합니다.", "warn");
        return;
      }

      let insertAt =
        Number.isInteger(options.insertIndex) ? options.insertIndex : body.selectionStart ?? body.value.length;

      for (const file of batch) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        renderUploadItem(id, file.name, "uploading", "업로드 중…");
        try {
          const form = new FormData();
          form.append("file", file, file.name);
          const res = await fetch(`${LOCAL_API}/api/upload`, {
            method: "POST",
            body: form,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || data.hint || "upload failed");

          const uploaded = data.uploads?.[0];
          if (!uploaded?.markdown) throw new Error("empty upload response");

          insertAt = insertAtCursor(body, uploaded.markdown, insertAt);
          renderUploadItem(id, file.name, "done", "본문에 삽입됨", uploaded.markdown);
          updateBodyLivePreview();
          flashLivePreviewMedia();
        } catch (err) {
          renderUploadItem(id, file.name, "error", err.message || "실패");
          setStatus(`업로드 실패: ${err.message}`, "error");
        }
      }
    };

    pickBtn?.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      uploadFiles(fileInput.files);
      fileInput.value = "";
    });

    ["dragenter", "dragover"].forEach((type) => {
      dropzone.addEventListener(type, (event) => {
        if (dropzone.classList.contains("is-disabled")) return;
        event.preventDefault();
        event.stopPropagation();
        dropzone.classList.add("is-dragover");
      });
    });

    ["dragleave", "drop"].forEach((type) => {
      dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (type === "dragleave" && dropzone.contains(event.relatedTarget)) return;
        dropzone.classList.remove("is-dragover");
      });
    });

    dropzone.addEventListener("drop", (event) => {
      if (dropzone.classList.contains("is-disabled")) return;
      uploadFiles(event.dataTransfer?.files);
    });

    body.addEventListener("dragover", (event) => {
      if (dropzone.classList.contains("is-disabled")) return;
      if (!Array.from(event.dataTransfer?.types || []).includes("Files")) return;
      event.preventDefault();
      setTextareaCaretFromPoint(body, event.clientX, event.clientY);
      body.classList.add("is-dragover-media");
    });

    body.addEventListener("dragleave", (event) => {
      if (!body.contains(event.relatedTarget)) {
        body.classList.remove("is-dragover-media");
      }
    });

    body.addEventListener("drop", (event) => {
      body.classList.remove("is-dragover-media");
      if (dropzone.classList.contains("is-disabled")) return;
      const files = event.dataTransfer?.files;
      if (!files?.length || !Array.from(files).some(isMediaFile)) return;
      event.preventDefault();
      const insertIndex = setTextareaCaretFromPoint(body, event.clientX, event.clientY);
      uploadFiles(files, { insertIndex });
    });

    body.addEventListener("paste", (event) => {
      if (dropzone.classList.contains("is-disabled")) return;
      const files = Array.from(event.clipboardData?.files || []).filter(isMediaFile);
      if (!files.length) return;
      event.preventDefault();
      uploadFiles(files);
    });

    syncUploadUi();
    return syncUploadUi;
  }

  let syncMediaUploadUi = null;

  async function probeLocalApi() {
    try {
      const res = await fetch(`${LOCAL_API}/health`, { signal: AbortSignal.timeout(1200) });
      localApiOnline = res.ok;
      if (res.ok) {
        const data = await res.json();
        uploadAvailable = Boolean(data.upload?.prismic);
      } else {
        uploadAvailable = false;
      }
    } catch {
      localApiOnline = false;
      uploadAvailable = false;
    }
    syncMediaUploadUi?.();
  }

  async function probeGitHub() {
    if (!gh()) {
      githubOnline = false;
      return;
    }
    const result = await gh().probe();
    githubOnline = result.ok;
  }

  async function probeBackends() {
    await probeLocalApi();
    if (!localApiOnline) await probeGitHub();
    else githubOnline = false;
    updateSaveButtons();
  }

  function updateBodyLivePreview() {
    const live = document.getElementById("edit-body-live");
    if (!live || !window.marked) return;
    const body = els.body()?.value.trim() || "";
    if (!body) {
      live.innerHTML = '<p class="editor-body-live__empty">본문에 넣은 이미지·영상이 여기에 표시됩니다.</p>';
      const countEl = document.getElementById("edit-body-media-count");
      if (countEl) {
        countEl.hidden = true;
        countEl.textContent = "";
      }
      return;
    }
    live.innerHTML = marked.parse(body, { breaks: true, gfm: true });
    window.DevlogFeatures?.enhanceArticle(live);
    attachMediaRemoveButtons(live);
  }

  function flashLivePreviewMedia() {
    const live = document.getElementById("edit-body-live");
    if (!live) return;
    const target =
      live.querySelector(".devlog-media-wrap:last-of-type img, .devlog-media-wrap:last-of-type video") ||
      live.querySelector("img:last-of-type, video:last-of-type");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    target.classList.add("editor-body-live__flash");
    window.setTimeout(() => target.classList.remove("editor-body-live__flash"), 1200);
  }

  function bindLivePreview() {
    document.querySelectorAll(".editor-field, .scrum-field, #edit-body").forEach((el) => {
      el.addEventListener("input", updateBodyLivePreview);
    });
  }

  async function loadForEdit(id) {
    editingId = id;
    const [date, slug] = id.split("/");

    if (localApiOnline) {
      try {
        const res = await fetch(`${LOCAL_API}/api/raw/${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          fillFromRaw(data.content, date, slug);
          return;
        }
      } catch {
        /* fall through */
      }
    }

    if (githubOnline && gh()) {
      try {
        const raw = await gh().loadRawMarkdown(id);
        if (raw) {
          fillFromRaw(raw, date, slug);
          return;
        }
      } catch {
        /* fall through */
      }
    }

    const res = await fetch("data/posts.json");
    const data = await res.json();
    const post = (data.posts || []).find((p) => p.id === id);
    if (!post) {
      setStatus("글을 찾지 못했어요.", "error");
      return;
    }

    fillFromPost(post, date, slug);
  }

  function fillFromRaw(raw, date, slug) {
    const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    let body = raw;
    const meta = { date, project: "", tags: [] };

    if (fmMatch) {
      body = raw.slice(fmMatch[0].length);
      fmMatch[1].split("\n").forEach((line) => {
        if (!line.includes(":")) return;
        const [k, v] = line.split(":", 2);
        const key = k.trim();
        const val = v.trim();
        if (key === "project") meta.project = val;
        if (key === "tags") meta.tags = val.split(",").map((t) => t.trim()).filter(Boolean);
        if (key === "date") meta.date = val;
      });
    }

    const parsed = parseScrum(body);
    const titleMatch = parsed.body.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : slug;
    const mainBody = titleMatch ? parsed.body.replace(titleMatch[0], "").trim() : parsed.body;

    els.date().value = meta.date || date;
    els.slug().value = slug;
    els.title().value = title;
    els.project().value = meta.project || "";
    els.tags().value = (meta.tags || []).join(", ");
    els.yesterday().value = parsed.yesterday;
    els.today().value = parsed.today;
    els.share().value = parsed.share;
    els.body().value = mainBody;
    updateBodyLivePreview();
  }

  function fillFromPost(post, date, slug) {
    const parsed = parseScrum(post.markdown || "");
    const titleMatch = parsed.body.match(/^#\s+(.+)$/m);
    const mainBody = titleMatch ? parsed.body.replace(titleMatch[0], "").trim() : parsed.body;

    els.date().value = post.date || date;
    els.slug().value = slug;
    els.title().value = post.title || titleMatch?.[1] || slug;
    els.project().value = post.project || "";
    els.tags().value = (post.tags || []).join(", ");
    els.yesterday().value = parsed.yesterday;
    els.today().value = parsed.today;
    els.share().value = parsed.share;
    els.body().value = mainBody;
    updateBodyLivePreview();
  }

  function initNew() {
    const date = todayIso();
    els.date().value = date;
    els.slug().value = "daily";
    els.title().value = `${date} daily scrum`;
    els.yesterday().value = "";
    els.today().value = "";
    els.share().value = "";
    els.body().value = "";
    updateBodyLivePreview();
  }

  async function saveLocal(mode) {
    const id = postIdFromForm();
    const content = composeMarkdown(getFormState());

    setStatus(mode === "append" ? "이어쓰기 저장 중…" : "저장 중…", "info");
    try {
      const res = await fetch(`${LOCAL_API}/api/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content, mode, sync: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save failed");

      setStatus(
        `저장됨: ${data.path}${data.synced ? " · GitHub 동기화 완료" : " · GitHub 동기화 스킵"}`,
        "ok"
      );
      editingId = id;
      window.setTimeout(() => {
        window.location.href = `post.html?id=${encodeURIComponent(id)}`;
      }, 700);
    } catch (err) {
      setStatus(`저장 실패: ${err.message}`, "error");
    }
  }

  async function saveGitHub(mode) {
    const id = postIdFromForm();
    const content = composeMarkdown(getFormState());

    setStatus(mode === "append" ? "GitHub에 이어쓰기 중…" : "GitHub에 저장 중…", "info");
    try {
      await gh().savePost({ id, content, mode });
      setStatus("저장·게시 완료 — GitHub Pages가 잠시 후 갱신됩니다.", "ok");
      editingId = id;
      window.setTimeout(() => {
        window.location.href = `post.html?id=${encodeURIComponent(id)}`;
      }, 1200);
    } catch (err) {
      setStatus(`GitHub 저장 실패: ${err.message}`, "error");
      if (String(err.message).includes("Bad credentials")) {
        gh()?.clearToken();
        githubOnline = false;
        updateSaveButtons();
      }
    }
  }

  async function save(mode) {
    if (saveMode === "local") return saveLocal(mode);
    if (saveMode === "github") return saveGitHub(mode);
    setStatus("저장 방법이 없습니다. 로컬 서버를 켜거나 GitHub를 연결하세요.", "warn");
  }

  function downloadMd() {
    const id = postIdFromForm();
    const [, slug] = id.split("/");
    const content = composeMarkdown(getFormState());
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("md 파일을 다운로드했어요.", "warn");
  }

  function bindGitHubAuth() {
    const panel = els.githubPanel();
    if (!panel || !gh()) return;

    const saved = gh().getToken();
    if (saved && els.githubToken()) {
      els.githubToken().value = saved;
      panel.classList.add("is-connected");
    }

    els.githubConnect()?.addEventListener("click", async () => {
      const token = els.githubToken()?.value.trim();
      if (!token) {
        setStatus("GitHub 토큰을 입력하세요.", "warn");
        return;
      }
      gh().setToken(token);
      await probeGitHub();
      if (githubOnline) {
        panel.classList.add("is-connected");
        setStatus("GitHub 연결됨 — 이제 저장할 수 있습니다.", "ok");
        updateSaveButtons();
        if (editingId) await loadForEdit(editingId);
      } else {
        gh().clearToken();
        panel.classList.remove("is-connected");
        setStatus("토큰이 유효하지 않거나 repo 권한이 없습니다.", "error");
        updateSaveButtons();
      }
    });

    els.githubDisconnect()?.addEventListener("click", async () => {
      gh().clearToken();
      if (els.githubToken()) els.githubToken().value = "";
      panel.classList.remove("is-connected");
      githubOnline = false;
      await probeBackends();
    });
  }

  async function init() {
    window.DevlogFeatures?.initReadingProgress();
    window.DevlogFeatures?.initBackToTop();
    bindLivePreview();
    syncMediaUploadUi = bindMediaUpload();
    bindGitHubAuth();
    await probeBackends();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      document.title = "글 수정 — Joey Devlog";
      await loadForEdit(id);
    } else {
      initNew();
    }

    els.saveBtn()?.addEventListener("click", () => save("overwrite"));
    els.appendBtn()?.addEventListener("click", () => save("append"));
    els.downloadBtn()?.addEventListener("click", downloadMd);

    window.setInterval(probeBackends, 20000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
