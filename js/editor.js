(function () {
  const API_BASE = "http://127.0.0.1:8781";
  const { composeMarkdown, parseScrum } = window.DevlogScrum;

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
    preview: () => document.getElementById("edit-preview"),
    saveBtn: () => document.getElementById("btn-save"),
    appendBtn: () => document.getElementById("btn-append"),
    downloadBtn: () => document.getElementById("btn-download"),
  };

  let apiOnline = false;
  let editingId = null;

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

  async function probeApi() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1200) });
      apiOnline = res.ok;
    } catch {
      apiOnline = false;
    }

    const save = els.saveBtn();
    const append = els.appendBtn();
    if (save) save.disabled = !apiOnline;
    if (append) append.disabled = !apiOnline;

    setStatus(
      apiOnline
        ? "로컬 저장 서버 연결됨 — 저장하면 ~/devlogs에 쓰고 빌드·GitHub 동기화합니다."
        : "저장 서버 오프라인 — scripts/serve-dev.sh 실행 후 저장하거나, 다운로드로 md를 받으세요.",
      apiOnline ? "ok" : "warn"
    );
  }

  function updatePreview() {
    const preview = els.preview();
    if (!preview || !window.marked) return;
    const md = composeMarkdown(getFormState());
    preview.innerHTML = marked.parse(md, { breaks: true, gfm: true });
    preview.querySelectorAll("pre code").forEach((block) => {
      if (window.hljs) window.hljs.highlightElement(block);
    });
  }

  function bindLivePreview() {
    document.querySelectorAll(".editor-field, .scrum-field, #edit-body").forEach((el) => {
      el.addEventListener("input", updatePreview);
    });
    document.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("is-active", b === btn));
        document.getElementById("panel-write")?.classList.toggle("is-hidden", tab !== "write");
        document.getElementById("panel-preview")?.classList.toggle("is-hidden", tab !== "preview");
        if (tab === "preview") updatePreview();
      });
    });
  }

  async function loadForEdit(id) {
    editingId = id;
    const [date, slug] = id.split("/");

    if (apiOnline) {
      try {
        const res = await fetch(`${API_BASE}/api/raw/${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          fillFromRaw(data.content, date, slug);
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
      fmMatch[1].splitlines().forEach((line) => {
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
    updatePreview();
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
    updatePreview();
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
    updatePreview();
  }

  async function saveToApi(mode) {
    if (!apiOnline) return;
    const id = postIdFromForm();
    const content = composeMarkdown(getFormState());

    setStatus(mode === "append" ? "이어쓰기 저장 중…" : "저장 중…", "info");
    try {
      const res = await fetch(`${API_BASE}/api/save`, {
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
    setStatus("md 파일을 다운로드했어요. ~/devlogs/날짜/ 에 넣고 scripts/sync-github.sh 를 실행하세요.", "warn");
  }

  async function init() {
    bindLivePreview();
    await probeApi();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      document.title = "글 수정 — Joey Devlog";
      await loadForEdit(id);
    } else {
      initNew();
    }

    els.saveBtn()?.addEventListener("click", () => saveToApi("overwrite"));
    els.appendBtn()?.addEventListener("click", () => saveToApi("append"));
    els.downloadBtn()?.addEventListener("click", downloadMd);

    window.setInterval(probeApi, 15000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
