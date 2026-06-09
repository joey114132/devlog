const PREFS_KEY = "devlog-prefs";
const DEFAULT_PREFS = {
  theme: "system",
  fontSize: "md",
  lineHeight: "normal",
};

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function applyPrefs(prefs) {
  const root = document.documentElement;

  if (prefs.theme === "light" || prefs.theme === "dark") {
    root.dataset.theme = prefs.theme;
  } else {
    delete root.dataset.theme;
  }

  root.dataset.fontSize = prefs.fontSize;
  root.dataset.lineHeight = prefs.lineHeight;
}

function bindSelect(id, key, prefs, onChange) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = prefs[key];
  el.addEventListener("change", () => {
    prefs[key] = el.value;
    savePrefs(prefs);
    applyPrefs(prefs);
    onChange?.(prefs);
  });
}

function setMenuOpen(open) {
  const panel = document.getElementById("prefs-panel");
  const overlay = document.getElementById("prefs-overlay");
  const toggle = document.querySelector(".menu-toggle");
  if (!panel || !overlay || !toggle) return;

  panel.hidden = !open;
  overlay.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
}

export function initPrefs() {
  const prefs = loadPrefs();
  applyPrefs(prefs);

  const toggle = document.querySelector(".menu-toggle");
  const overlay = document.getElementById("prefs-overlay");
  const closeBtn = document.getElementById("prefs-close");

  toggle?.addEventListener("click", () => {
    const panel = document.getElementById("prefs-panel");
    setMenuOpen(Boolean(panel?.hidden));
  });

  overlay?.addEventListener("click", () => setMenuOpen(false));
  closeBtn?.addEventListener("click", () => setMenuOpen(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  bindSelect("pref-theme", "theme", prefs);
  bindSelect("pref-font-size", "fontSize", prefs);
  bindSelect("pref-line-height", "lineHeight", prefs);

  document.getElementById("pref-reset")?.addEventListener("click", () => {
    const next = { ...DEFAULT_PREFS };
    savePrefs(next);
    applyPrefs(next);
    document.getElementById("pref-theme").value = next.theme;
    document.getElementById("pref-font-size").value = next.fontSize;
    document.getElementById("pref-line-height").value = next.lineHeight;
  });
}

// Apply theme early when loaded as module (before paint on fast connections)
applyPrefs(loadPrefs());
