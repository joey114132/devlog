(function () {
  const PREFS_KEY = "devlog-prefs";
  const DEFAULT_PREFS = {
    theme: "system",
    fontSize: "md",
    lineHeight: "normal",
  };

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return { ...DEFAULT_PREFS };
      return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_PREFS };
    }
  }

  function savePrefs(prefs) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }

  function applyPrefs(prefs) {
    const root = document.documentElement;

    if (prefs.theme === "light" || prefs.theme === "dark") {
      root.dataset.theme = prefs.theme;
    } else {
      delete root.dataset.theme;
    }

    root.dataset.fontSize = prefs.fontSize;
    root.dataset.lineHeight = prefs.lineHeight;
    window.DevlogFeatures?.syncHljsTheme?.();
  }

  function bindSelect(id, key, prefs) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = prefs[key];
    el.addEventListener("change", () => {
      prefs[key] = el.value;
      savePrefs(prefs);
      applyPrefs(prefs);
    });
  }

  function setMenuOpen(open) {
    const panel = document.getElementById("prefs-panel");
    const overlay = document.getElementById("prefs-overlay");
    const toggle = document.getElementById("menu-fab");
    if (!panel || !overlay || !toggle) return;

    if (open) {
      overlay.hidden = false;
      panel.hidden = false;
      requestAnimationFrame(() => {
        document.body.classList.add("menu-open");
        toggle.setAttribute("aria-expanded", "true");
      });
      return;
    }

    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");

    const onEnd = (event) => {
      if (event.target !== panel && event.propertyName !== "transform") return;
      panel.removeEventListener("transitionend", onEnd);
      if (!document.body.classList.contains("menu-open")) {
        overlay.hidden = true;
        panel.hidden = true;
      }
    };

    panel.addEventListener("transitionend", onEnd);
    window.setTimeout(() => {
      if (!document.body.classList.contains("menu-open")) {
        overlay.hidden = true;
        panel.hidden = true;
      }
    }, 320);
  }

  function initPrefs() {
    const prefs = loadPrefs();
    applyPrefs(prefs);

    const toggle = document.getElementById("menu-fab");
    const overlay = document.getElementById("prefs-overlay");
    const closeBtn = document.getElementById("prefs-close");

    toggle?.addEventListener("click", () => {
      setMenuOpen(!document.body.classList.contains("menu-open"));
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

  applyPrefs(loadPrefs());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPrefs);
  } else {
    initPrefs();
  }
})();
