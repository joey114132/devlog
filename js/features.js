(function () {
  function slugify(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\w\u3131-\uD79D\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function monthLabel(isoDate) {
    const [y, m] = isoDate.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    });
  }

  function initHero(posts) {
    const root = document.getElementById("site-hero");
    if (!root || !posts.length) return;

    const latest = posts[0];
    const projects = new Set(posts.map((p) => p.project).filter(Boolean));

    root.innerHTML = `
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="hero-eyebrow">Editorial dev diary</p>
          <p class="hero-lead">개발 세션과 하네스 작업을 말하듯 남기는 기록입니다.</p>
        </div>
        <dl class="hero-stats">
          <div><dt>글</dt><dd>${posts.length}</dd></div>
          <div><dt>프로젝트</dt><dd>${projects.size || "—"}</dd></div>
          <div><dt>최근</dt><dd>${latest.date}</dd></div>
        </dl>
      </div>
    `;
  }

  function initTodayScrum(posts) {
    const root = document.getElementById("today-scrum");
    if (!root || !window.DevlogScrum) return;

    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const todayPosts = posts.filter((p) => p.date === todayIso);
    const todayPost =
      todayPosts.find(
        (p) => p.scrum?.yesterday || p.scrum?.today || p.scrum?.share
      ) ||
      todayPosts[0] ||
      posts[0];

    const shell = root.closest(".index-shell");

    const hasScrum =
      todayPost?.scrum &&
      (todayPost.scrum.yesterday || todayPost.scrum.today || todayPost.scrum.share);
    const card = hasScrum
      ? window.DevlogScrum.renderScrumCard(todayPost.scrum, { compact: false })
      : "";

    if (!card) {
      root.hidden = true;
      root.innerHTML = "";
      shell?.classList.add("index-shell--solo");
      return;
    }

    root.hidden = false;
    shell?.classList.remove("index-shell--solo");

    root.innerHTML = `
      <p class="today-scrum-label">오늘 스크럼</p>
      ${card.replace('class="scrum-board scrum-board--side"', 'class="scrum-board scrum-board--side scrum-board--panel"')}
      <a class="today-scrum-link" href="post.html?id=${encodeURIComponent(todayPost.id)}">전체 글 보기</a>
      <a class="today-scrum-link" href="edit.html?id=${encodeURIComponent(todayPost.id)}">스크럼 수정</a>
    `;
  }

  function initIndexTools(posts, onChange) {
    const search = document.getElementById("post-search");
    const chips = document.getElementById("tag-filters");
    const count = document.getElementById("result-count");
    if (!search || !chips) return;

    const tags = [];
    posts.forEach((post) => {
      if (post.project) tags.push(post.project);
      (post.tags || []).forEach((tag) => tags.push(tag));
    });
    const unique = [...new Set(tags)].sort((a, b) => a.localeCompare(b, "ko"));

    let activeTag = "";

    chips.innerHTML =
      `<button type="button" class="filter-chip is-active" data-tag="">전체</button>` +
      unique
        .map(
          (tag) =>
            `<button type="button" class="filter-chip" data-tag="${tag.replace(/"/g, "&quot;")}">${tag}</button>`
        )
        .join("");

    function apply() {
      const q = search.value.trim().toLowerCase();
      const filtered = posts.filter((post) => {
        const hay = [post.title, post.excerpt, post.project, ...(post.tags || [])]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !q || hay.includes(q);
        const matchesTag =
          !activeTag ||
          post.project === activeTag ||
          (post.tags || []).includes(activeTag);
        return matchesQuery && matchesTag;
      });
      if (count) {
        count.textContent =
          filtered.length === posts.length
            ? `총 ${posts.length}개`
            : `${filtered.length} / ${posts.length}개`;
      }
      onChange(filtered);
    }

    search.addEventListener("input", apply);
    chips.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-chip");
      if (!btn) return;
      activeTag = btn.dataset.tag || "";
      chips.querySelectorAll(".filter-chip").forEach((el) => {
        el.classList.toggle("is-active", el === btn);
      });
      apply();
    });

    apply();
  }

  function isDarkTheme() {
    const theme = document.documentElement.dataset.theme;
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function syncHljsTheme() {
    const link = document.getElementById("hljs-theme");
    if (!link) return;
    const dark = isDarkTheme();
    link.href = dark
      ? "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css"
      : "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css";
  }

  function syncTopBarOffset() {
    const shell = document.getElementById("site-top");
    if (!shell) return;
    const h = shell.offsetHeight;
    document.documentElement.style.setProperty("--top-bar-h", `${h}px`);
    document.documentElement.style.setProperty("--sticky-offset", `${h}px`);
  }

  function initReadingProgress() {
    const bar = document.getElementById("reading-progress");
    if (!bar) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    };

    syncTopBarOffset();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncTopBarOffset, { passive: true });
    if (document.fonts?.ready) {
      document.fonts.ready.then(syncTopBarOffset).catch(() => {});
    }
    onScroll();
  }

  function buildToc(bodyEl) {
    const nav = document.getElementById("article-toc");
    if (!nav || !bodyEl) return;

    const headings = [...bodyEl.querySelectorAll("h2, h3")];
    if (headings.length < 2) {
      nav.hidden = true;
      return;
    }

    const items = headings.map((heading, index) => {
      const id = heading.id || `section-${index}-${slugify(heading.textContent || "section")}`;
      heading.id = id;
      const level = heading.tagName === "H3" ? "toc-h3" : "toc-h2";
      return `<a class="${level}" href="#${id}">${heading.textContent}</a>`;
    });

    nav.innerHTML = `
      <p class="toc-title">목차</p>
      <nav class="toc-links" aria-label="목차">${items.join("")}</nav>
    `;
    nav.hidden = false;

    const links = nav.querySelectorAll(".toc-links a");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
  }

  function initCopyLink(postId) {
    const btn = document.getElementById("copy-link");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      const url = new URL(window.location.href);
      url.searchParams.set("id", postId);
      try {
        await navigator.clipboard.writeText(url.toString());
        btn.textContent = "복사됨!";
        btn.classList.add("is-success");
        window.setTimeout(() => {
          btn.textContent = "링크 복사";
          btn.classList.remove("is-success");
        }, 1800);
      } catch {
        btn.textContent = "복사 실패";
      }
    });
  }

  function initBackToTop() {
    const btn = document.getElementById("back-to-top");
    if (!btn || btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    const showAfter = () => Math.max(280, window.innerHeight * 0.35);

    const onScroll = () => {
      btn.classList.toggle("is-visible", window.scrollY > showAfter());
    };

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  function normalizePrismicMediaUrl(src) {
    if (!src || !/images\.prismic\.io/i.test(src)) return src;
    const base = src.split("?")[0];
    if (/\.gif(\?|$)/i.test(src)) return base;
    return src;
  }

  function enhanceMedia(bodyEl) {
    if (!bodyEl) return;

    bodyEl.querySelectorAll("img").forEach((img) => {
      if (img.src) img.src = normalizePrismicMediaUrl(img.src);
      img.loading = img.loading || "lazy";
      img.decoding = img.decoding || "async";
      img.classList.add("devlog-media", "devlog-media--image");

      const caption = img.getAttribute("alt")?.trim();
      if (caption && !img.closest("figure")) {
        const figure = document.createElement("figure");
        figure.className = "devlog-media-wrap";
        const parent = img.parentElement;
        if (parent?.tagName === "P" && parent.childElementCount === 1) {
          parent.replaceWith(figure);
        } else {
          img.parentNode?.insertBefore(figure, img);
        }
        figure.appendChild(img);
        const figcaption = document.createElement("figcaption");
        figcaption.textContent = caption;
        figure.appendChild(figcaption);
      }
    });

    bodyEl.querySelectorAll("video").forEach((video) => {
      video.classList.add("devlog-media", "devlog-media--video");
      video.controls = true;
      video.playsInline = true;
      if (!video.hasAttribute("preload")) video.setAttribute("preload", "metadata");
      video.querySelectorAll("source[src]").forEach((source) => {
        source.src = normalizePrismicMediaUrl(source.src);
      });
      if (video.src) video.src = normalizePrismicMediaUrl(video.src);
    });
  }

  function enhanceArticle(bodyEl) {
    if (!bodyEl) return;
    enhanceMedia(bodyEl);
    bodyEl.querySelectorAll("pre code").forEach((block) => {
      if (window.hljs) window.hljs.highlightElement(block);
    });
    buildToc(bodyEl);
  }

  function setPageMeta(post) {
    if (!post) return;
    document.title = `${post.title} — Joey Devlog`;

    const desc = post.excerpt || "";
    const setMeta = (sel, content) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute("content", content);
    };

    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', post.title);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[name="twitter:title"]', post.title);
    setMeta('meta[name="twitter:description"]', desc);
  }

  window.DevlogFeatures = {
    monthLabel,
    initHero,
    initTodayScrum,
    initIndexTools,
    initReadingProgress,
    syncTopBarOffset,
    syncHljsTheme,
    initCopyLink,
    initBackToTop,
    enhanceArticle,
    setPageMeta,
  };

  syncHljsTheme();
})();
