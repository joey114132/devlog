(function () {
  const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const TITLE_RE = /^#\s+(.+)$/m;
  const { parseScrum } = window.DevlogScrum;

  function parseFrontmatter(text) {
    const match = text.match(FRONTMATTER_RE);
    if (!match) return { meta: {}, body: text };
    const meta = {};
    match[1].split("\n").forEach((line) => {
      if (!line.includes(":")) return;
      const idx = line.indexOf(":");
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      meta[key] = val;
    });
    return { meta, body: text.slice(match[0].length) };
  }

  function parseTags(raw) {
    if (!raw) return [];
    const cleaned = raw.replace(/^\[|\]$/g, "");
    return cleaned
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function extractTitle(body, slug) {
    const m = body.match(TITLE_RE);
    if (m) return m[1].trim();
    return slug.replace(/-/g, " ");
  }

  function readingMinutes(body, wpm = 220) {
    const words = (body.match(/\S+/g) || []).length;
    return Math.max(1, Math.round(words / wpm));
  }

  function excerpt(body, limit = 140) {
    const lines = [];
    for (const line of body.split("\n")) {
      const stripped = line.trim();
      if (!stripped || stripped.startsWith("#") || stripped === "---") continue;
      lines.push(stripped);
      if (lines.join(" ").length >= limit) break;
    }
    let text = lines.join(" ");
    if (text.length > limit) return `${text.slice(0, limit - 1).trim()}…`;
    return text;
  }

  function postFromMarkdown(raw, id) {
    const [dateFolder, slug] = id.split("/");
    const { meta, body } = parseFrontmatter(raw);
    const scrum = parseScrum(body);
    const date = meta.date || dateFolder;

    return {
      id,
      date,
      title: extractTitle(body, slug),
      slug,
      project: meta.project || "",
      tags: parseTags(meta.tags),
      scrum: {
        yesterday: scrum.yesterday,
        today: scrum.today,
        share: scrum.share,
      },
      excerpt: excerpt(body),
      reading_minutes: readingMinutes(body),
      markdown: body.trim(),
    };
  }

  function collectTags(posts) {
    const tags = new Set();
    posts.forEach((post) => {
      (post.tags || []).forEach((t) => tags.add(t));
      if (post.project) tags.add(post.project);
    });
    return [...tags].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  function upsertPost(payload, post) {
    const posts = [...(payload.posts || [])];
    const idx = posts.findIndex((p) => p.id === post.id);
    if (idx >= 0) posts[idx] = post;
    else posts.push(post);
    posts.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.id < b.id ? 1 : -1;
    });
    return {
      ...payload,
      generated_at: new Date().toISOString().slice(0, 19) + "+09:00",
      count: posts.length,
      tags: collectTags(posts),
      posts,
    };
  }

  window.DevlogPostBuild = {
    postFromMarkdown,
    upsertPost,
    collectTags,
  };
})();
