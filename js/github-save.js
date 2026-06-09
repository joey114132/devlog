(function () {
  const TOKEN_KEY = "devlog-github-token";
  const CONFIG = {
    owner: "joey114132",
    repo: "devlog",
    branch: "main",
    contentDir: "content",
    postsPath: "data/posts.json",
  };

  const API = "https://api.github.com";

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token.trim());
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  function authHeaders() {
    const token = getToken();
    if (!token) return null;
    const value = token.startsWith("github_pat_") || token.startsWith("ghp_")
      ? token.startsWith("github_pat_")
        ? `Bearer ${token}`
        : `token ${token}`
      : `Bearer ${token}`;
    return {
      Accept: "application/vnd.github+json",
      Authorization: value,
    };
  }

  async function ghFetch(path, options = {}) {
    const headers = authHeaders();
    if (!headers) throw new Error("GitHub 토큰이 없습니다");

    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!res.ok) {
      const msg = data?.message || res.statusText || "GitHub API error";
      throw new Error(msg);
    }
    return data;
  }

  function apiPath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }

  async function getRepoFile(path) {
    try {
      const data = await ghFetch(
        `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${apiPath(path)}?ref=${CONFIG.branch}`
      );
      if (!data || data.type !== "file") return null;
      const content = data.content ? atob(data.content.replace(/\n/g, "")) : "";
      return { content, sha: data.sha, path };
    } catch (err) {
      if (String(err.message).includes("Not Found")) return null;
      throw err;
    }
  }

  async function putRepoFile(path, content, message, sha) {
    const body = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: CONFIG.branch,
    };
    if (sha) body.sha = sha;

    return ghFetch(`/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${apiPath(path)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function probe() {
    const token = getToken();
    if (!token) return { ok: false, reason: "no-token" };
    try {
      await ghFetch("/user");
      await ghFetch(`/repos/${CONFIG.owner}/${CONFIG.repo}`);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err.message };
    }
  }

  function contentPath(id) {
    return `${CONFIG.contentDir}/${id}.md`;
  }

  async function loadRawMarkdown(id) {
    const file = await getRepoFile(contentPath(id));
    if (file) return file.content;
    return null;
  }

  async function savePost({ id, content, mode }) {
    const mdPath = contentPath(id);
    let final = content.endsWith("\n") ? content : `${content}\n`;

    const existingFile = await getRepoFile(mdPath);
    if (mode === "append" && existingFile?.content) {
      final = `${existingFile.content.trim()}\n\n---\n\n${content.trim()}\n`;
    }

    const postsFile = await getRepoFile(CONFIG.postsPath);
    if (!postsFile) throw new Error("data/posts.json을 찾을 수 없습니다");

    const payload = JSON.parse(postsFile.content);
    const post = window.DevlogPostBuild.postFromMarkdown(final, id);
    const nextPayload = window.DevlogPostBuild.upsertPost(payload, post);
    const postsJson = `${JSON.stringify(nextPayload, null, 2)}\n`;

    const date = id.split("/")[0];
    await putRepoFile(
      mdPath,
      final,
      `devlog: ${id} 마크다운 저장 (${date})`,
      existingFile?.sha
    );
    await putRepoFile(
      CONFIG.postsPath,
      postsJson,
      `devlog: ${id} 사이트 반영 (${date})`,
      postsFile.sha
    );

    return { id, path: mdPath, synced: true };
  }

  window.DevlogGitHub = {
    TOKEN_KEY,
    CONFIG,
    getToken,
    setToken,
    clearToken,
    probe,
    loadRawMarkdown,
    savePost,
  };
})();
