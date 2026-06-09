const DATA_URL = "data/posts.json";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

async function loadPosts() {
  const res = await fetch(DATA_URL);
  if (!res.ok) {
    throw new Error(`Failed to load ${DATA_URL}`);
  }
  const data = await res.json();
  return data.posts ?? [];
}

function renderIndex(posts, root) {
  if (!posts.length) {
    root.innerHTML = '<p class="empty">아직 올라온 글이 없어요. <code>scripts/build.py</code> 를 돌려 보세요.</p>';
    return;
  }

  root.innerHTML = posts
    .map((post) => {
      const pills = [
        post.project ? `<span class="meta-pill">${escapeHtml(post.project)}</span>` : "",
        ...post.tags.map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`),
      ].join("");

      return `
        <a class="post-card" href="post.html?id=${encodeURIComponent(post.id)}">
          <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
          <h2>${escapeHtml(post.title)}</h2>
          <p>${escapeHtml(post.excerpt)}</p>
          ${pills}
        </a>
      `;
    })
    .join("");
}

async function initIndex() {
  const root = document.getElementById("post-list");
  if (!root) return;
  try {
    const posts = await loadPosts();
    renderIndex(posts, root);
  } catch (err) {
    root.innerHTML = `<p class="empty">데이터를 불러오지 못했어요. ${escapeHtml(err.message)}</p>`;
  }
}

async function initPost() {
  const root = document.getElementById("article");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    root.innerHTML = '<p class="empty">글 id가 없어요. <a href="index.html">목록으로</a></p>';
    return;
  }

  try {
    const posts = await loadPosts();
    const post = posts.find((p) => p.id === id);
    if (!post) {
      root.innerHTML = '<p class="empty">글을 찾지 못했어요. <a href="index.html">목록으로</a></p>';
      return;
    }

    document.title = `${post.title} — Joey Devlog`;

    const pills = [
      post.project ? `<span class="meta-pill">${escapeHtml(post.project)}</span>` : "",
      ...post.tags.map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`),
    ].join("");

    root.innerHTML = `
      <a class="back-link" href="index.html">← 목록</a>
      <header class="article-header">
        <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
        <h1>${escapeHtml(post.title)}</h1>
        ${pills}
      </header>
      <div class="article-body" id="article-body"></div>
    `;

    const body = document.getElementById("article-body");
    body.innerHTML = marked.parse(post.markdown, { breaks: true, gfm: true });
  } catch (err) {
    root.innerHTML = `<p class="empty">불러오기 실패: ${escapeHtml(err.message)}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("post-list")) initIndex();
  if (document.getElementById("article")) initPost();
});
