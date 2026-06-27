// Part 2 — quiet, dreamy night-shelf design.
// Shares authentication and favorites with previous designs (same storage keys).

const PASS_HASH = "d502cfbb7ece80155d7348b6f76b96b176415eaa08bc85c2ffe96cc42b5a5ff5";
const SESSION_KEY = "kh_auth";
const FAVORITES_KEY = "kh_favorites";

const GENRE_COLORS = {
  "健康":           { bg: "rgba(168, 210, 191, 0.16)", border: "rgba(168, 210, 191, 0.36)", text: "#cfeadc", dot: "#a8d2bf", glow: "rgba(168, 210, 191, 0.16)" },
  "AI・技術":       { bg: "rgba(158, 193, 222, 0.16)", border: "rgba(158, 193, 222, 0.36)", text: "#d4e3f1", dot: "#9ec1de", glow: "rgba(158, 193, 222, 0.16)" },
  "理学療法":       { bg: "rgba(143, 188, 201, 0.16)", border: "rgba(143, 188, 201, 0.36)", text: "#d7e8ee", dot: "#8fbcc9", glow: "rgba(143, 188, 201, 0.16)" },
  "副業・ビジネス": { bg: "rgba(234, 215, 162, 0.16)", border: "rgba(234, 215, 162, 0.36)", text: "#ecdfb6", dot: "#ead7a2", glow: "rgba(234, 215, 162, 0.16)" },
  "ライフスタイル": { bg: "rgba(233, 178, 154, 0.16)", border: "rgba(233, 178, 154, 0.36)", text: "#ecc7b3", dot: "#e9b29a", glow: "rgba(233, 178, 154, 0.16)" },
  "coffee":         { bg: "rgba(184, 144, 106, 0.16)", border: "rgba(184, 144, 106, 0.36)", text: "#dfc4a9", dot: "#b8906a", glow: "rgba(184, 144, 106, 0.16)" },
  "人間関係":       { bg: "rgba(217, 167, 182, 0.16)", border: "rgba(217, 167, 182, 0.36)", text: "#ebc4cf", dot: "#d9a7b6", glow: "rgba(217, 167, 182, 0.16)" },
};

const GENRE_ICONS = {
  "健康": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-4.35-9-8.17C1 9.72 2.7 6 6.64 6c2.17 0 3.4 1.18 4.14 2.4C11.52 7.18 12.75 6 14.92 6 18.86 6 20.56 9.72 18.5 12.83 16 16.65 12 21 12 21Z"/></svg>`,
  "AI・技術": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>`,
  "理学療法": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v16M4 12h16"/><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`,
  "副業・ビジネス": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  "ライフスタイル": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 20c6 0 12-5 12-14-6 0-12 5-12 14Z"/><path d="M8.5 15.5c2-1.7 4-3 7-4.5"/></svg>`,
  "coffee": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 5c0-1 1-1 1-2M12 5c0-1 1-1 1-2"/></svg>`,
  "人間関係": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="10" r="3"/><path d="M3.5 19c.9-2.3 3-3.5 5.5-3.5S13.6 16.7 14.5 19"/><path d="M10.5 19c.7-1.9 2.4-3 4.5-3 2 0 3.7 1.1 4.5 3"/></svg>`,
};

const GENRE_ORDER = ["ライフスタイル", "coffee", "健康", "理学療法", "副業・ビジネス", "人間関係", "AI・技術"];
const PINNED_GENRES = ["理学療法"];

let allArticles = [];
let currentTab = "new";
let currentSearchQuery = "";
let currentGenreSelection = "";

const contentArea = document.getElementById("contentArea");
const tabButtons = Array.from(document.querySelectorAll(".dock__btn"));
const authOverlay = document.getElementById("authOverlay");
const appShell = document.getElementById("app");

document.addEventListener("DOMContentLoaded", async () => {
  initAuthGate();
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

// ---------- Auth ----------
function initAuthGate() {
  const authButton = document.getElementById("authButton");
  const passInput = document.getElementById("passInput");
  authButton.addEventListener("click", submitPassword);
  passInput.addEventListener("keydown", event => {
    if (event.key === "Enter") submitPassword();
  });
}

async function submitPassword() {
  const passInput = document.getElementById("passInput");
  const errorElement = document.getElementById("passError");
  const input = passInput.value.trim();
  if (!input) return;
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

// ---------- Data ----------
async function loadData() {
  if (window.__KH_PREVIEW_DATA__ && Array.isArray(window.__KH_PREVIEW_DATA__.articles)) {
    return window.__KH_PREVIEW_DATA__;
  }
  const response = await fetch("../../data.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch data.json");
  return response.json();
}

// ---------- Tabs ----------
function initTabs() {
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const nextTab = button.dataset.tab;
      if (nextTab === currentTab) return;
      currentTab = nextTab;
      setActiveTab(nextTab);
      renderCurrentTab();
    });
  });
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
  if (currentTab === "new")        renderNewTab(allArticles);
  else if (currentTab === "genre") renderGenreTab(allArticles);
  else if (currentTab === "search") renderSearchTab(allArticles, currentSearchQuery);
  else                              renderFavoritesTab(getFavoriteArticles());
}

// ---------- New tab ----------
function renderNewTab(articles) {
  if (articles.length) {
    contentArea.appendChild(createFeaturedArticle(articles[0]));
  }
  const section = createSectionShell("Latest notes");
  section.appendChild(createArticleGrid(articles.slice(1)));
  contentArea.appendChild(section);
}

// ---------- Favorites tab ----------
function renderFavoritesTab(articles) {
  const section = createSectionShell("Favorites");
  if (!articles.length) {
    section.appendChild(createEmptyState({
      title: "まだ保存した記事がありません",
      text: "各記事の右上ボタンから、お気に入りとして静かに残せます。",
      icon: bookmarkIcon(),
    }));
  } else {
    section.appendChild(createArticleGrid(articles));
  }
  contentArea.appendChild(section);
}

// ---------- Genre tab ----------
function renderGenreTab(articles) {
  const genreMap = new Map();
  articles.forEach(article => {
    if (!genreMap.has(article.genre)) genreMap.set(article.genre, []);
    genreMap.get(article.genre).push(article);
  });

  const genreNames = Array.from(new Set([...PINNED_GENRES, ...genreMap.keys()]));
  const entries = sortGenreEntries(genreNames.map(genre => [genre, genreMap.get(genre) || []]));
  if (!entries.length) {
    contentArea.appendChild(createEmptyState({
      title: "ジャンルがまだありません",
      text: "記事が追加されると、ここに棚が並びます。",
      icon: searchIcon(),
    }));
    return;
  }

  if (!entries.some(([genre]) => genre === currentGenreSelection)) {
    currentGenreSelection = entries[0][0];
  }

  contentArea.appendChild(createGenreTileGrid(entries));

  const selectedEntry = entries.find(([genre]) => genre === currentGenreSelection) || entries[0];
  if (selectedEntry) {
    contentArea.appendChild(createGenreArticleSection(selectedEntry[0], selectedEntry[1]));
  }
}

function createGenreTileGrid(entries) {
  const grid = document.createElement("div");
  grid.className = "genre-tile-grid";
  entries.forEach(([genre, items], index) => {
    grid.appendChild(createGenreTile(genre, items, index, genre === currentGenreSelection));
  });
  return grid;
}

function createGenreTile(genre, items, index, isActive) {
  const theme = getGenreTheme(genre);
  const button = document.createElement("button");
  button.type = "button";
  button.className = `genre-tile reveal${isActive ? " is-active" : ""}`;
  button.style.animationDelay = `${Math.min(index, 8) * 60}ms`;
  button.setAttribute("aria-pressed", isActive ? "true" : "false");
  button.innerHTML = `
    <span class="genre-tile__icon" style="background:${theme.bg}; color:${theme.text}; border-color:${theme.border};">
      ${GENRE_ICONS[genre] || GENRE_ICONS["ライフスタイル"]}
    </span>
    <span class="genre-tile__label">${escapeHtml(genre)}</span>
    <span class="genre-tile__count">${items.length}</span>
  `;
  button.addEventListener("click", () => {
    if (currentGenreSelection === genre) return;
    currentGenreSelection = genre;
    renderCurrentTab();
  });
  return button;
}

function createGenreArticleSection(genre, items) {
  const section = document.createElement("section");
  section.className = "section-shell";
  section.innerHTML = `
    <div class="genre-articles-header reveal">
      <p class="section-label">— articles —</p>
      <h3 class="genre-articles-header__title">${escapeHtml(genre)}</h3>
      <p class="genre-articles-header__meta">${escapeHtml(String(items.length))} stories</p>
    </div>
  `;
  if (!items.length) {
    section.appendChild(createEmptyState({
      title: `${genre}の記事はまだありません`,
      text: "今後このジャンルで公開した記事が、ここに掲載されます。",
      icon: GENRE_ICONS[genre] || searchIcon(),
    }));
    return section;
  }
  section.appendChild(createArticleGrid(items));
  return section;
}

// ---------- Search tab ----------
function renderSearchTab(articles, query) {
  const shell = document.createElement("section");
  shell.className = "search-shell reveal";
  shell.innerHTML = `
    <input id="searchInput" type="search" placeholder="探したい言葉を入力" value="${escapeHtml(query)}" autocomplete="off" autocorrect="off" spellcheck="false">
    <div class="search-pills">${buildSearchSuggestions()}</div>
  `;
  contentArea.appendChild(shell);

  const results = document.createElement("section");
  results.className = "section-shell";
  contentArea.appendChild(results);

  const runSearch = nextQuery => {
    currentSearchQuery = nextQuery;
    results.innerHTML = `<p class="section-label">— results —</p>`;
    const filtered = filterArticles(articles, nextQuery);
    if (!filtered.length) {
      results.appendChild(createEmptyState({
        title: nextQuery ? `「${nextQuery}」は見つかりませんでした` : "言葉を入れてみてください",
        text: "別の言葉、タグ、ジャンル名で探してみてください。",
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

// ---------- Sections ----------
function createSectionShell(label) {
  const section = document.createElement("section");
  section.className = "section-shell";
  section.innerHTML = `<p class="section-label">— ${escapeHtml(label)} —</p>`;
  return section;
}

// ---------- Cards ----------
function createFeaturedArticle(article) {
  const element = document.createElement(article.file ? "button" : "section");
  element.className = "featured-card reveal";
  if (article.file) {
    element.type = "button";
    element.addEventListener("click", () => openArticle(article));
  }
  element.innerHTML = `
    <p class="featured-card__label">— tonight&apos;s feature —</p>
    <h3 class="featured-card__title">${escapeHtml(article.title)}</h3>
    <p class="featured-card__summary">${escapeHtml(article.summary)}</p>
    <div class="meta-row">
      ${buildGenrePill(article.genre)}
      <span>${escapeHtml(article.date)}</span>
      <span>${escapeHtml(String(article.readTime))} min</span>
    </div>
    <span class="article-link-hint">
      <span>read</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M7 17 17 7"/><path d="M8 7h9v9"/>
      </svg>
    </span>
  `;
  return element;
}

function createArticleGrid(articles) {
  const grid = document.createElement("div");
  grid.className = "article-grid";
  articles.forEach((article, index) => {
    grid.appendChild(createArticleCard(article, index + 1));
  });
  return grid;
}

function createArticleCard(article, index) {
  const element = document.createElement(article.file ? "button" : "section");
  element.className = `article-card reveal${article.file ? "" : " article-card--static"}`;
  element.style.animationDelay = `${Math.min(index, 8) * 50}ms`;
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
      <button class="favorite-button${favorite ? " is-active" : ""}" type="button"
              aria-label="${favorite ? "お気に入り解除" : "お気に入り登録"}"
              aria-pressed="${favorite ? "true" : "false"}">
        ${bookmarkIcon(favorite)}
      </button>
    </div>
    <p class="article-card__meta">${escapeHtml(article.date)} · ${escapeHtml(String(article.readTime))} min</p>
  `;

  const favoriteButton = element.querySelector(".favorite-button");
  favoriteButton.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(article, favoriteButton);
  });

  return element;
}

function sortGenreEntries(entries) {
  return entries.slice().sort(([genreA], [genreB]) => {
    const orderA = GENRE_ORDER.indexOf(genreA);
    const orderB = GENRE_ORDER.indexOf(genreB);
    const rankA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
    const rankB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;
    if (rankA !== rankB) return rankA - rankB;
    return genreA.localeCompare(genreB, "ja");
  });
}

function createEmptyState({ title, text, icon }) {
  const state = document.createElement("section");
  state.className = "empty-state reveal";
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
    title: "夜の書庫を開けませんでした",
    text: "data.json へのアクセスを確認してください。",
    icon: alertIcon(),
  }));
}

// ---------- Article opening ----------
function openArticle(article) {
  if (!article.file) return;
  window.location.assign("../../" + article.file);
}

// ---------- Favorites ----------
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
  if (active) favoriteIds.delete(id);
  else favoriteIds.add(id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favoriteIds)));
  const nextActive = !active;
  button.classList.toggle("is-active", nextActive);
  button.setAttribute("aria-pressed", String(nextActive));
  button.setAttribute("aria-label", nextActive ? "お気に入り解除" : "お気に入り登録");
  button.innerHTML = bookmarkIcon(nextActive);
  if (currentTab === "favorites") renderCurrentTab();
}

// ---------- Helpers ----------
function filterArticles(articles, query) {
  const trimmed = query.trim();
  if (!trimmed) return articles;
  const lowered = trimmed.toLowerCase();
  return articles.filter(article => {
    const haystacks = [
      article.title, article.summary, article.genre,
      ...(Array.isArray(article.tags) ? article.tags : []),
    ];
    return haystacks.some(value => String(value).toLowerCase().includes(lowered));
  });
}

function buildSearchSuggestions() {
  const suggestions = ["睡眠", "健康", "AI", "副業", "習慣", "夜"];
  return suggestions
    .map(tag => `<button class="search-pill" type="button" data-search-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`)
    .join("");
}

function buildGenrePill(genre) {
  const theme = getGenreTheme(genre);
  return `<span class="genre-pill" style="background:${theme.bg}; border-color:${theme.border}; color:${theme.text};">
    <span class="genre-pill__dot" style="background:${theme.dot};"></span>
    <span>${escapeHtml(genre)}</span>
  </span>`;
}

function getGenreTheme(genre) {
  return GENRE_COLORS[genre] || {
    bg: "rgba(255, 255, 255, 0.06)",
    border: "rgba(255, 255, 255, 0.16)",
    text: "rgba(238, 232, 214, 0.92)",
    dot: "#f5e9c6",
    glow: "rgba(255, 255, 255, 0.08)",
  };
}

function bookmarkIcon(active = false) {
  return `<svg viewBox="0 0 24 24" fill="${active ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg>`;
}

function searchIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg>`;
}

function alertIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4.5"/><path d="M12 17h.01"/></svg>`;
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
