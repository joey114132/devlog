(function () {
  const DATA_URL = "data/studies.json";

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatDate(isoDate) {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function renderTable(rows) {
    const body = rows
      .map(
        (row) => `
      <tr>
        <th scope="row">${escapeHtml(row.term)}</th>
        <td data-label="쉬운 설명">${escapeHtml(row.easy)}</td>
        <td data-label="학교/일상 비유">${escapeHtml(row.analogy)}</td>
        <td data-label="로봇에서의 역할">${escapeHtml(row.robot)}</td>
      </tr>`
      )
      .join("");

    return `
      <div class="study-table-wrap">
        <table class="study-table">
          <thead>
            <tr>
              <th scope="col">용어</th>
              <th scope="col">쉬운 설명</th>
              <th scope="col">학교/일상 비유</th>
              <th scope="col">로봇에서의 실제 역할</th>
            </tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    `;
  }

  function renderStudyCard(study) {
    const sectionCount = study.sections?.length || 0;
    const rowCount = (study.sections || []).reduce((n, s) => n + (s.rows?.length || 0), 0);
    const tags = (study.tags || [])
      .map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`)
      .join("");

    return `
      <a class="study-card post-card" href="study.html?id=${encodeURIComponent(study.id)}">
        <div class="post-card-main">
          <div class="post-card-top">
            <time datetime="${escapeHtml(study.date)}">${escapeHtml(formatDate(study.date))}</time>
            <span class="read-time">${sectionCount}개 주제 · ${rowCount}개 용어</span>
          </div>
          <h2>${escapeHtml(study.title)}</h2>
          <p>${escapeHtml(study.subtitle || study.intro || "")}</p>
          ${tags}
        </div>
      </a>
    `;
  }

  async function loadStudies() {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Failed to load ${DATA_URL}`);
    const data = await res.json();
    return data.studies ?? [];
  }

  async function initStudiesIndex() {
    const root = document.getElementById("study-list");
    if (!root) return;

    try {
      const studies = await loadStudies();
      if (!studies.length) {
        root.innerHTML = '<p class="empty">아직 정리된 공부 노트가 없어요.</p>';
        return;
      }
      root.innerHTML = `<div class="card-list">${studies.map(renderStudyCard).join("")}</div>`;
    } catch (err) {
      root.innerHTML = `<p class="empty">불러오기 실패: ${escapeHtml(err.message)}</p>`;
    }
  }

  async function initStudyDetail() {
    const root = document.getElementById("study-article");
    if (!root) return;

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      root.innerHTML = '<p class="empty">노트 id가 없어요. <a href="studies.html">목록으로</a></p>';
      return;
    }

    try {
      const studies = await loadStudies();
      const study = studies.find((s) => s.id === id);
      if (!study) {
        root.innerHTML = '<p class="empty">노트를 찾지 못했어요. <a href="studies.html">목록으로</a></p>';
        return;
      }

      document.title = `${study.title} · Joey Devlog`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = study.intro || study.subtitle || study.title;

      const tags = (study.tags || [])
        .map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`)
        .join("");

      const sections = (study.sections || [])
        .map(
          (section) => `
        <section class="study-section" id="${escapeHtml(section.id)}">
          <h2>${escapeHtml(section.title)}</h2>
          ${renderTable(section.rows || [])}
        </section>`
        )
        .join("");

      root.innerHTML = `
        <header class="article-header">
          <div class="article-meta-row">
            <time datetime="${escapeHtml(study.date)}">${escapeHtml(formatDate(study.date))}</time>
          </div>
          <h1>${escapeHtml(study.title)}</h1>
          <p class="study-intro">${escapeHtml(study.intro || "")}</p>
          <div class="article-actions">${tags}</div>
        </header>
        <div class="study-body">${sections}</div>
      `;
    } catch (err) {
      root.innerHTML = `<p class="empty">불러오기 실패: ${escapeHtml(err.message)}</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initStudiesIndex();
    initStudyDetail();
  });
})();
