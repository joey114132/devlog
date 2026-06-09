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
    preview: () => document.getElementById("edit-preview"),
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

  async function probeLocalApi() {
    try {
      const res = await fetch(`${LOCAL_API}/health`, { signal: AbortSignal.timeout(1200) });
      localApiOnline = res.ok;
    } catch {
      localApiOnline = false;
    }
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
    bindLivePreview();
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
