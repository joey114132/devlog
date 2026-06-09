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

function readingLabel(minutes) {
  if (!minutes) return "";
  return `${minutes}분 읽기`;
}

function stripDuplicateTitle(markdown, title) {
  if (!title || !markdown) return markdown;
  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i += 1;
  const match = lines[i]?.match(/^#\s+(.+)$/);
  if (!match || match[1].trim() !== title.trim()) return markdown;
  lines.splice(i, 1);
  while (lines[i]?.trim() === "") lines.splice(i, 1);
  return lines.join("\n");
}

function renderPills(post) {
  return [
    post.project ? `<span class="meta-pill">${escapeHtml(post.project)}</span>` : "",
    ...(post.tags || []).map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`),
  ].join("");
}

function renderScrum(post, compact = false) {
  return window.DevlogScrum?.renderScrumCard(post.scrum, { compact }) || "";
}

function renderPostCard(post) {
  const read = readingLabel(post.reading_minutes);
  const scrum = renderScrum(post, true);
  const hasScrum = Boolean(scrum);
  return `
    <a class="post-card${hasScrum ? " post-card--with-scrum" : ""}" href="post.html?id=${encodeURIComponent(post.id)}" data-date="${escapeHtml(post.date)}">
      <div class="post-card-main">
        <div class="post-card-top">
          <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
          ${read ? `<span class="read-time">${escapeHtml(read)}</span>` : ""}
        </div>
        <h2>${escapeHtml(post.title)}</h2>
        <p>${escapeHtml(post.excerpt)}</p>
        ${renderPills(post)}
      </div>
      ${scrum}
    </a>
  `;
}

function groupByMonth(posts) {
  const groups = new Map();
  posts.forEach((post) => {
    const key = post.date.slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(post);
  });
  return [...groups.entries()];
}

function renderIndex(posts, root) {
  if (!posts.length) {
    root.innerHTML =
      '<p class="empty">조건에 맞는 글이 없어요. 검색어나 필터를 바꿔 보세요.</p>';
    return;
  }

  const monthLabel = window.DevlogFeatures?.monthLabel || ((d) => d);
  root.innerHTML = groupByMonth(posts)
    .map(([monthKey, monthPosts]) => {
      const label = monthLabel(`${monthKey}-01`);
      const cards = monthPosts.map(renderPostCard).join("");
      return `
        <section class="month-group">
          <h2 class="month-heading"><span>${escapeHtml(label)}</span></h2>
          <div class="card-list">${cards}</div>
        </section>
      `;
    })
    .join("");
}

async function loadPosts() {
  const res = await fetch(DATA_URL);
  if (!res.ok) {
    throw new Error(`Failed to load ${DATA_URL}`);
  }
  const data = await res.json();
  return data.posts ?? [];
}

async function initIndex() {
  const root = document.getElementById("post-list");
  if (!root) return;

  try {
    const posts = await loadPosts();
    window.DevlogFeatures?.initHero(posts);
    window.DevlogFeatures?.initTodayScrum(posts);
    window.DevlogFeatures?.initIndexTools(posts, (filtered) => renderIndex(filtered, root));
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

    window.DevlogFeatures?.setPageMeta(post);

    const read = readingLabel(post.reading_minutes);
    const scrum = renderScrum(post, false);
    const hasScrum = Boolean(scrum);
    root.innerHTML = `
      <div class="article-layout${hasScrum ? " article-layout--with-scrum" : ""}">
        <div class="article-main">
          <header class="article-header">
            <div class="article-meta-row">
              <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
              ${read ? `<span class="read-time">${escapeHtml(read)}</span>` : ""}
            </div>
            <h1>${escapeHtml(post.title)}</h1>
            <div class="article-actions">
              ${renderPills(post)}
              <a class="edit-link-btn" href="edit.html?id=${encodeURIComponent(post.id)}">수정</a>
              <button type="button" class="copy-link-btn" id="copy-link">링크 복사</button>
            </div>
          </header>
          <aside id="article-toc" class="article-toc" hidden aria-label="목차"></aside>
          <div class="article-body" id="article-body"></div>
        </div>
        ${hasScrum ? `<aside class="article-scrum">${scrum}</aside>` : ""}
      </div>
    `;

    const body = document.getElementById("article-body");
    const bodyMarkdown = stripDuplicateTitle(post.markdown, post.title);
    body.innerHTML = marked.parse(bodyMarkdown, { breaks: true, gfm: true });
    window.DevlogFeatures?.enhanceArticle(body);
    window.DevlogFeatures?.initCopyLink(post.id);
  } catch (err) {
    root.innerHTML = `<p class="empty">불러오기 실패: ${escapeHtml(err.message)}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.DevlogFeatures?.initReadingProgress();
  window.DevlogFeatures?.initBackToTop();
  if (document.getElementById("post-list")) initIndex();
  if (document.getElementById("article")) initPost();
});
