(function () {
  const SECTIONS = [
    { key: "yesterday", label: "어제 한 일", heading: "### 어제 한 일" },
    { key: "today", label: "오늘 할 일", heading: "### 오늘 할 일" },
    { key: "share", label: "공유할 거", heading: "### 공유할 거" },
  ];

  const SCRUM_BLOCK_RE =
    /##\s*Daily\s*Scrum\s*\n([\s\S]*?)(?=\n---\s*\n|\n#\s+[^\n#]|\s*$)/i;

  function parseSection(body, labelPattern) {
    const re = new RegExp(
      `###\\s*${labelPattern}\\s*\\n([\\s\\S]*?)(?=\\n###\\s*|\\n---\\s*\\n|\\n#\\s+[^\\n#]|$)`,
      "i"
    );
    const match = body.match(re);
    return match ? match[1].trim() : "";
  }

  function parseScrum(markdown) {
    const block = markdown.match(SCRUM_BLOCK_RE);
    if (!block) {
      return { yesterday: "", today: "", share: "", hasScrum: false, body: markdown.trim() };
    }

    const scrumBody = block[0];
    const rest = markdown.replace(scrumBody, "").replace(/^\s*---\s*\n?/, "").trim();

    return {
      yesterday: parseSection(scrumBody, "어제\\s*한?\\s*일"),
      today: parseSection(scrumBody, "오늘\\s*할?\\s*일"),
      share: parseSection(scrumBody, "공유할?\\s*거"),
      hasScrum: true,
      body: rest,
    };
  }

  function composeScrum(scrum) {
    const parts = SECTIONS.map((s) => {
      const text = (scrum[s.key] || "").trim();
      if (!text) return "";
      return `${s.heading}\n${text}`;
    }).filter(Boolean);

    if (!parts.length) return "";
    return `## Daily Scrum\n\n${parts.join("\n\n")}`;
  }

  function composeMarkdown({ meta, title, scrum, body, includeScrum = true }) {
    const fm = ["---"];
    if (meta.date) fm.push(`date: ${meta.date}`);
    if (meta.project) fm.push(`project: ${meta.project}`);
    if (meta.tags?.length) fm.push(`tags: ${meta.tags.join(", ")}`);
    fm.push("---", "");

    const chunks = [];
    if (includeScrum) {
      const scrumBlock = composeScrum(scrum);
      if (scrumBlock) chunks.push(scrumBlock, "", "---", "");
    }
    if (title) chunks.push(`# ${title}`, "");
    if (body?.trim()) chunks.push(body.trim());

    return `${fm.join("\n")}${chunks.join("\n")}\n`;
  }

  function summarize(text, limit = 72) {
    const flat = text.replace(/\s+/g, " ").trim();
    if (!flat) return "";
    return flat.length > limit ? `${flat.slice(0, limit - 1)}…` : flat;
  }

  function renderScrumCard(scrum, { compact = false } = {}) {
    if (!scrum || (!scrum.yesterday && !scrum.today && !scrum.share)) return "";

    if (compact) {
      const bits = SECTIONS.map((s) => {
        const val = summarize(scrum[s.key], 56);
        if (!val) return "";
        return `<li><strong>${s.label}</strong> ${escapeHtml(val)}</li>`;
      })
        .filter(Boolean)
        .join("");

      return `<ul class="scrum-compact">${bits}</ul>`;
    }

    const cols = SECTIONS.map((s) => {
      const val = (scrum[s.key] || "").trim();
      if (!val) return "";
      return `
        <div class="scrum-col">
          <h3 class="scrum-label">${s.label}</h3>
          <div class="scrum-text">${formatScrumText(val)}</div>
        </div>
      `;
    })
      .filter(Boolean)
      .join("");

    return `
      <section class="scrum-board" aria-label="Daily Scrum">
        <p class="scrum-board-title">Daily Scrum</p>
        <div class="scrum-grid">${cols}</div>
      </section>
    `;
  }

  function formatScrumText(text) {
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return "";
    if (lines.every((l) => l.startsWith("- ") || l.startsWith("* "))) {
      return `<ul>${lines.map((l) => `<li>${escapeHtml(l.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`;
    }
    return lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  window.DevlogScrum = {
    SECTIONS,
    parseScrum,
    composeScrum,
    composeMarkdown,
    renderScrumCard,
    summarize,
  };
})();
