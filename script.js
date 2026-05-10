const PASS_HASH = "d502cfbb7ece80155d7348b6f76b96b176415eaa08bc85c2ffe96cc42b5a5ff5";
const SESSION_KEY = "kh_auth";
const FAVORITES_KEY = "kh_favorites";

const GENRE_COLORS = {
  "健康": {
    bg: "rgba(113, 214, 173, 0.22)",
    border: "rgba(147, 255, 207, 0.34)",
    text: "#d7fff0",
    dot: "#8effc7",
    glow: "rgba(82, 214, 156, 0.22)",
  },
  "AI・技術": {
    bg: "rgba(103, 156, 255, 0.24)",
    border: "rgba(151, 187, 255, 0.34)",
    text: "#dce8ff",
    dot: "#8fb7ff",
    glow: "rgba(92, 135, 234, 0.22)",
  },
  "理学療法": {
    bg: "rgba(171, 127, 255, 0.22)",
    border: "rgba(201, 174, 255, 0.34)",
    text: "#eedfff",
    dot: "#cdaeff",
    glow: "rgba(143, 100, 221, 0.22)",
  },
  "副業・ビジネス": {
    bg: "rgba(255, 196, 94, 0.22)",
    border: "rgba(255, 219, 146, 0.34)",
    text: "#fff0cc",
    dot: "#ffd269",
    glow: "rgba(217, 160, 62, 0.2)",
  },
  "ライフスタイル": {
    bg: "rgba(255, 138, 184, 0.2)",
    border: "rgba(255, 183, 211, 0.32)",
    text: "#ffe0ec",
    dot: "#ffb2d2",
    glow: "rgba(212, 106, 154, 0.2)",
  },
  "人間関係": {
    bg: "rgba(127, 216, 255, 0.2)",
    border: "rgba(176, 230, 255, 0.34)",
    text: "#dcf5ff",
    dot: "#97e4ff",
    glow: "rgba(76, 172, 212, 0.2)",
  },
};

const GENRE_ICONS = {
  "健康": `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 21s-6.5-4.35-9-8.17C1 9.72 2.7 6 6.64 6c2.17 0 3.4 1.18 4.14 2.4C11.52 7.18 12.75 6 14.92 6 18.86 6 20.56 9.72 18.5 12.83 16 16.65 12 21 12 21Z"></path>
    </svg>`,
  "AI・技術": `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="2"></rect>
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"></path>
    </svg>`,
  "理学療法": `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 4v16M4 12h16"></path>
      <rect x="6" y="6" width="12" height="12" rx="2"></rect>
    </svg>`,
  "副業・ビジネス": `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"></path>
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>`,
  "ライフスタイル": `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M6 20c6 0 12-5 12-14-6 0-12 5-12 14Z"></path>
      <path d="M8.5 15.5c2-1.7 4-3 7-4.5"></path>
    </svg>`,
  "人間関係": `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
      <path d="M16 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
      <path d="M3.5 19c.9-2.3 3-3.5 5.5-3.5S13.6 16.7 14.5 19"></path>
      <path d="M10.5 19c.7-1.9 2.4-3 4.5-3 2 0 3.7 1.1 4.5 3"></path>
    </svg>`,
};

const GENRE_ORDER = ["ライフスタイル", "健康", "副業・ビジネス", "人間関係"];

let allArticles = [];
let currentTab = "new";
let currentSearchQuery = "";
let currentGenreSelection = "";

const contentArea = document.getElementById("contentArea");
const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const authOverlay = document.getElementById("authOverlay");
const appShell = document.getElementById("app");
const articleViewer = document.getElementById("articleViewer");
const articleFrame = document.getElementById("articleFrame");

document.addEventListener("DOMContentLoaded", async () => {
  initAuthGate();
  initViewer();
  initTabs();

  if (sessionStorage.getItem(SESSION_KEY) === "1") {
    showApp();
  }

  try {
    const data = await loadData();
    const articles = Array.isArray(data.articles) ? data.articles : [];
    allArticles = articles.slice().sort((a, b) => b.date.localeCompare(a.date));
    renderCurrentTab();
    setActiveTab(currentTab);
  } catch (error) {
    renderErrorState();
  }
});

function initAuthGate() {
  const authButton = document.getElementById("authButton");
  const passInput = document.getElementById("passInput");
  authButton.addEventListener("click", submitPassword);
  passInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      submitPassword();
    }
  });
}

function initViewer() {
  closeArticle();
}

function initTabs() {
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const nextTab = button.dataset.tab;
      if (nextTab === currentTab) {
        return;
      }
      currentTab = nextTab;
      setActiveTab(nextTab);
      renderCurrentTab();
    });
  });
}

async function submitPassword() {
  const passInput = document.getElementById("passInput");
  const errorElement = document.getElementById("passError");
  const input = passInput.value.trim();
  if (!input) {
    return;
  }
  const hash = await sha256(input);
  if (hash === PASS_HASH) {
    sessionStorage.setItem(SESSION_KEY, "1");
    passInput.value = "";
    errorElement.classList.add("hidden");
    showApp();
    return;
  }
  errorElement.classList.remove("hidden");
  passInput.value = "";
  passInput.focus();
  window.setTimeout(() => errorElement.classList.add("hidden"), 2500);
}

function showApp() {
  authOverlay.classList.add("hidden");
  appShell.classList.remove("hidden");
}

async function loadData() {
  if (window.__KH_PREVIEW_DATA__ && Array.isArray(window.__KH_PREVIEW_DATA__.articles)) {
    return window.__KH_PREVIEW_DATA__;
  }
  const response = await fetch("./data.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch data.json");
  }
  return response.json();
}

function setActiveTab(tab) {
  tabButtons.forEach(button => {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  });
  const topbar = document.querySelector(".topbar");
  if (topbar) {
    topbar.classList.toggle("topbar--minimal", tab === "new");
  }
}

function renderCurrentTab() {
  contentArea.innerHTML = "";
  contentArea.scrollTop = 0;
  if (currentTab === "new") {
    renderNewTab(allArticles);
  } else if (currentTab === "genre") {
    renderGenreTab(allArticles);
  } else if (currentTab === "search") {
    renderSearchTab(allArticles, currentSearchQuery);
  } else {
    renderFavoritesTab(getFavoriteArticles());
  }
}

function renderNewTab(articles) {
  if (articles.length) {
    contentArea.appendChild(createFeaturedArticle(articles[0]));
  }

  const section = createSectionShell("Latest notes");
  section.appendChild(createArticleGrid(articles, "article-grid article-grid--new-tab"));
  contentArea.appendChild(section);
}

function renderFavoritesTab(articles) {
  const section = createSectionShell("Favorites");
  if (!articles.length) {
    section.appendChild(createEmptyState({
      title: "まだ保存した記事がありません",
      text: "各記事の右上ボタンから、お気に入りとして静かにストックできます。",
      icon: bookmarkIcon(),
    }));
  } else {
    section.appendChild(createArticleGrid(articles));
  }
  contentArea.appendChild(section);
}

function renderGenreTab(articles) {
  const genreMap = new Map();
  articles.forEach(article => {
    if (!genreMap.has(article.genre)) {
      genreMap.set(article.genre, []);
    }
    genreMap.get(article.genre).push(article);
  });

  const entries = sortGenreEntries(Array.from(genreMap.entries()));
  if (!entries.length) {
    contentArea.appendChild(createEmptyState({
      title: "ジャンルがまだありません",
      text: "記事が追加されると、ここにジャンルカードが表示されます。",
      icon: searchIcon(),
    }));
    return;
  }

  if (!entries.some(([genre]) => genre === currentGenreSelection)) {
    currentGenreSelection = entries[0][0];
  }

  contentArea.appendChild(createGenreSelector(entries));

  const selectedEntry = entries.find(([genre]) => genre === currentGenreSelection) || entries[0];
  if (selectedEntry) {
    contentArea.appendChild(createGenreArticleSection(selectedEntry[0], selectedEntry[1]));
  }
}

function renderSearchTab(articles, query) {
  const shell = document.createElement("section");
  shell.className = "search-shell glass-panel reveal";
  shell.style.animationDelay = "90ms";
  shell.innerHTML = `
    <input id="searchInput" type="search" placeholder="タイトル・タグ・要約で検索" value="${escapeHtml(query)}" autocomplete="off" autocorrect="off" spellcheck="false">
    <div class="search-pills">
      ${buildSearchSuggestions()}
    </div>
  `;
  contentArea.appendChild(shell);

  const results = createSectionShell("Results");
  contentArea.appendChild(results);

  const runSearch = nextQuery => {
    currentSearchQuery = nextQuery;
    results.innerHTML = `<p class="section-label">Results</p>`;
    const filtered = filterArticles(articles, nextQuery);
    if (!filtered.length) {
      results.appendChild(createEmptyState({
        title: `「${nextQuery}」に一致する記事がありません`,
        text: "言葉を少し変えるか、タグやジャンル名で探してみてください。",
        icon: searchIcon(),
      }));
      return;
    }
    results.appendChild(createArticleGrid(filtered));
  };

  const searchInput = shell.querySelector("#searchInput");
  searchInput.addEventListener("input", event => runSearch(event.target.value.trim()));
  shell.querySelectorAll("[data-search-tag]").forEach(button => {
    button.addEventListener("click", () => {
      const nextValue = button.dataset.searchTag;
      searchInput.value = nextValue;
      runSearch(nextValue);
    });
  });

  runSearch(query);
}

function createHeroPanel({ eyebrow, headline, description, stats, compact = false }) {
  const panel = document.createElement("section");
  panel.className = `hero-panel glass-panel reveal${compact ? " hero-panel--compact" : ""}`;
  panel.innerHTML = `
    <p class="hero-panel__eyebrow">${eyebrow}</p>
    ${headline ? `<h2 class="hero-panel__headline">${headline}</h2>` : ""}
    <p class="hero-panel__description">${description}</p>
    <div class="hero-panel__meta">
      ${stats.map(stat => `
        <div class="meta-pill">
          <span class="meta-pill__value">${escapeHtml(stat.value)}</span>
          <span class="meta-pill__label">${escapeHtml(stat.label)}</span>
        </div>
      `).join("")}
    </div>
  `;
  return panel;
}

function createFeaturedArticle(article) {
  const element = document.createElement(article.file ? "button" : "section");
  element.className = "featured-card featured-card--compact reveal";
  element.style.animationDelay = "70ms";
  if (article.file) {
    element.type = "button";
    element.addEventListener("click", () => openArticle(article));
  }
  element.innerHTML = `
    <p class="featured-card__label">Latest feature</p>
    <div class="meta-row">
      ${buildGenrePill(article.genre)}
      <span>${escapeHtml(article.date)}</span>
      <span>${escapeHtml(String(article.readTime))} min</span>
    </div>
    <h3 class="featured-card__title">${escapeHtml(article.title)}</h3>
    <p class="featured-card__summary">${escapeHtml(article.summary)}</p>
    <div class="article-link-hint">
      <span>Open article</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M7 17 17 7"></path>
        <path d="M8 7h9v9"></path>
      </svg>
    </div>
  `;
  return element;
}

function createSectionShell(label) {
  const section = document.createElement("section");
  section.className = "section-shell cards-stack";
  section.innerHTML = `<p class="section-label">${escapeHtml(label)}</p>`;
  return section;
}

function createArticleGrid(articles, className = "article-grid") {
  const grid = document.createElement("div");
  grid.className = className;
  articles.forEach((article, index) => {
    grid.appendChild(createArticleCard(article, index + 1));
  });
  return grid;
}

function createArticleCard(article, index) {
  const element = document.createElement(article.file ? "button" : "section");
  element.className = `article-card reveal${article.file ? "" : " article-card--static"}`;
  element.style.animationDelay = `${Math.min(index, 8) * 60}ms`;
  const genreTheme = getGenreTheme(article.genre);
  element.style.borderLeftColor = genreTheme.border;
  element.style.boxShadow = `0 10px 26px rgba(4, 7, 22, 0.18), inset 1px 0 0 ${genreTheme.glow}`;
  if (article.file) {
    element.type = "button";
    element.addEventListener("click", () => openArticle(article));
  }

  const favorite = isFavorite(article);

  element.innerHTML = `
    <div class="article-card__top">
      <div class="article-card__body">
        ${buildGenrePill(article.genre)}
        <h3 class="article-card__title">${escapeHtml(article.title)}</h3>
        <p class="article-card__summary">${escapeHtml(article.summary)}</p>
      </div>
      <button class="favorite-button${favorite ? " is-active" : ""}" type="button" aria-label="${favorite ? "お気に入り解除" : "お気に入り登録"}" aria-pressed="${favorite ? "true" : "false"}">
        ${bookmarkIcon(favorite)}
      </button>
    </div>
  `;

  const favoriteButton = element.querySelector(".favorite-button");
  favoriteButton.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(article, favoriteButton);
  });

  return element;
}

function createGenreSelector(entries) {
  const section = document.createElement("section");
  section.className = "section-shell genre-selector-shell";
  section.innerHTML = `<p class="section-label">Pick a genre</p>`;

  const grid = document.createElement("div");
  grid.className = "genre-selector-grid";
  entries.forEach(([genre, items], index) => {
    grid.appendChild(createGenreSelectorCard(genre, items, index, genre === currentGenreSelection));
  });

  section.appendChild(grid);
  return section;
}

function createGenreSelectorCard(genre, items, index, isActive) {
  const button = document.createElement("button");
  button.className = `genre-selector-card glass-panel reveal${isActive ? " is-active" : ""}`;
  button.type = "button";
  button.style.animationDelay = `${Math.min(index, 6) * 60}ms`;
  const genreTheme = getGenreTheme(genre);
  button.setAttribute("aria-pressed", isActive ? "true" : "false");
  button.innerHTML = `
    <span class="genre-selector-card__icon" style="background:${genreTheme.bg}; border-color:${genreTheme.border}; color:${genreTheme.text};">${GENRE_ICONS[genre] || GENRE_ICONS["ライフスタイル"]}</span>
    <span class="genre-selector-card__title">${escapeHtml(genre)}</span>
    <span class="genre-selector-card__count" style="color:${genreTheme.text};">${items.length} articles</span>
  `;
  button.addEventListener("click", () => {
    if (currentGenreSelection === genre) {
      return;
    }
    currentGenreSelection = genre;
    renderCurrentTab();
  });
  return button;
}

function createGenreArticleSection(genre, items) {
  const section = document.createElement("section");
  section.className = "section-shell genre-articles-shell";
  section.innerHTML = `
    <div class="genre-articles-shell__header reveal">
      <p class="section-label">Articles</p>
      <h3 class="genre-articles-shell__title">${escapeHtml(genre)}</h3>
      <p class="genre-articles-shell__meta">${escapeHtml(String(items.length))} articles</p>
    </div>
  `;
  section.appendChild(createArticleGrid(items, "article-grid article-grid--selected-genre"));
  return section;
}

function sortGenreEntries(entries) {
  return entries.slice().sort(([genreA], [genreB]) => {
    const orderA = GENRE_ORDER.indexOf(genreA);
    const orderB = GENRE_ORDER.indexOf(genreB);
    const rankA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
    const rankB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return genreA.localeCompare(genreB, "ja");
  });
}

function createEmptyState({ title, text, icon }) {
  const state = document.createElement("section");
  state.className = "empty-state glass-panel reveal";
  state.innerHTML = `
    <div class="empty-state__icon">${icon}</div>
    <h3 class="empty-state__title">${escapeHtml(title)}</h3>
    <p class="empty-state__text">${escapeHtml(text)}</p>
  `;
  return state;
}

function renderErrorState() {
  contentArea.innerHTML = "";
  contentArea.appendChild(createEmptyState({
    title: "データの読み込みに失敗しました",
    text: "data.json へのアクセスを確認してください。GitHub Pages かローカルサーバー経由の表示を前提にしています。",
    icon: alertIcon(),
  }));
}

function openArticle(article) {
  if (!article.file) {
    return;
  }
  window.location.assign(article.file);
}

function closeArticle() {
  articleViewer.classList.add("hidden");
  articleViewer.setAttribute("aria-hidden", "true");
  articleFrame.src = "";
}

function getArticleId(article) {
  return article.file || `${article.title}::${article.date}`;
}

function getFavoriteIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function getFavoriteArticles() {
  const favoriteIds = getFavoriteIds();
  return allArticles.filter(article => favoriteIds.has(getArticleId(article)));
}

function isFavorite(article) {
  return getFavoriteIds().has(getArticleId(article));
}

function toggleFavorite(article, button) {
  const favoriteIds = getFavoriteIds();
  const id = getArticleId(article);
  const active = favoriteIds.has(id);
  if (active) {
    favoriteIds.delete(id);
  } else {
    favoriteIds.add(id);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favoriteIds)));
  const nextActive = !active;
  button.classList.toggle("is-active", nextActive);
  button.setAttribute("aria-pressed", String(nextActive));
  button.setAttribute("aria-label", nextActive ? "お気に入り解除" : "お気に入り登録");
  button.innerHTML = bookmarkIcon(nextActive);
  if (currentTab === "favorites") {
    renderCurrentTab();
  }
}

function filterArticles(articles, query) {
  const trimmed = query.trim();
  if (!trimmed) {
    return articles;
  }
  const lowered = trimmed.toLowerCase();
  return articles.filter(article => {
    const haystacks = [
      article.title,
      article.summary,
      article.genre,
      ...(Array.isArray(article.tags) ? article.tags : []),
    ];
    return haystacks.some(value => String(value).toLowerCase().includes(lowered));
  });
}

function summarizeGenres(articles) {
  const counts = {};
  articles.forEach(article => {
    counts[article.genre] = (counts[article.genre] || 0) + 1;
  });
  const topGenres = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  return topGenres.map(([genre, count]) => ({
    value: String(count),
    label: genre,
  }));
}

function buildSearchSuggestions() {
  const suggestions = ["睡眠", "健康", "AI", "副業", "習慣", "ライフスタイル"];
  return suggestions.map(tag => `<button class="search-pill" type="button" data-search-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join("");
}

function buildGenrePill(genre) {
  const theme = getGenreTheme(genre);
  const icon = GENRE_ICONS[genre] || GENRE_ICONS["ライフスタイル"];
  return `<span class="genre-pill" style="background:${theme.bg}; border-color:${theme.border}; color:${theme.text}; box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.02);">${icon}<span class="genre-pill__dot" style="background:${theme.dot}; color:${theme.dot};"></span><span>${escapeHtml(genre)}</span></span>`;
}

function getGenreTheme(genre) {
  return GENRE_COLORS[genre] || {
    bg: "rgba(255, 255, 255, 0.1)",
    border: "rgba(255, 255, 255, 0.2)",
    text: "#edf3ff",
    dot: "#ffffff",
    glow: "rgba(255, 255, 255, 0.14)",
  };
}

function bookmarkIcon(active = false) {
  return `
    <svg viewBox="0 0 24 24" fill="${active ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 20.3 5.7 17V5.8h12.6V17L12 20.3Z"></path>
      <path d="M9 10.5h6"></path>
    </svg>`;
}

function searchIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5"></circle>
      <path d="m16 16 5 5"></path>
    </svg>`;
}

function alertIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path>
      <path d="M12 9v4.5"></path>
      <path d="M12 17h.01"></path>
    </svg>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sha256(input) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}
