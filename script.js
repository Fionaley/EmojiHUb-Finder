/* =========================================================
  EmojiHub Explorer
  - Uses EmojiHub API (no authentication)
  - Requirements covered:
    ✅ fetch() + async/await
    ✅ cards/grid output
    ✅ search bar + dropdown + buttons
    ✅ loading state + spinner
    ✅ error handling (no results, invalid input, failed API call)
    ✅ input validation (empty, invalid chars, trim)
    ✅ disable button while loading
    ✅ responsive design (CSS)
    ✅ code organization (API funcs, DOM funcs, utils)
    ✅ comments included
========================================================= */

/* -------------------------
   Constants / DOM references
-------------------------- */
const API_BASE = "https://emojihub.yurace.pro/api";

const modeSelect = document.getElementById("modeSelect");
const searchField = document.getElementById("searchField");
const searchInput = document.getElementById("searchInput");
const categoryField = document.getElementById("categoryField");
const categorySelect = document.getElementById("categorySelect");
const groupField = document.getElementById("groupField");
const groupSelect = document.getElementById("groupSelect");

const fetchBtn = document.getElementById("fetchBtn");
const clearBtn = document.getElementById("clearBtn");

const loadingEl = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const resultsGrid = document.getElementById("resultsGrid");

const themeToggle = document.getElementById("themeToggle");
const favoritesBtn = document.getElementById('favoritesBtn');
const favCountEl = document.getElementById('favCount');
let showingFavorites = false;

/* -------------------------
   Utilities
-------------------------- */

/** Trim whitespace and normalize user input */
function cleanText(text) {
  return (text || "").trim();
}

/** Basic invalid character check:
    allows letters, numbers, spaces, hyphen, apostrophe */
function isValidQuery(text) {
  const allowed = /^[a-z0-9\s\-']{1,40}$/i;
  return allowed.test(text);
}

/** Toggle loading UI + disable button while loading */
function setLoading(isLoading) {
  loadingEl.classList.toggle("hidden", !isLoading);
  fetchBtn.disabled = isLoading;
  clearBtn.disabled = isLoading;
  modeSelect.disabled = isLoading;
  searchInput.disabled = isLoading;
  categorySelect.disabled = isLoading;
  groupSelect.disabled = isLoading;
}

/** Show error message in the error container */
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

/** Hide error container */
function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

/** Clear results container */
function clearResults() {
  resultsGrid.innerHTML = "";
}
/* Sample Emoji JSON (used fields)
{
  "name": "grinning cat face",
  "category": "smileys and people",
  "group": "cat face",
  "htmlCode": ["&#128568;"],
  "unicode": ["U+1F638"]
}
*/

/* -------------------------
   API functions (Fetch)
-------------------------- */

/** API call helper with proper error handling */
async function apiGet(path) {
  // API call explanation: fetch() to EmojiHub endpoints
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    // Failed API call (server/network/404/etc.)
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
/** Get all emojis (used for precise client-side filtering) */
async function getAllEmojis() {
  return apiGet("/all");
}

/** Get categories for dropdown */
async function getCategories() {
  return apiGet("/categories");
}

/** Get groups for dropdown */
async function getGroups() {
  return apiGet("/groups");
}

/** Get one random emoji */
async function getRandomEmoji() {
  return apiGet("/random");
}

/** Search emojis by name (q=...) */
async function searchEmojisByName(query) {
  const encoded = encodeURIComponent(query);
  return apiGet(`/search?q=${encoded}`);
}

/** Get emojis by category */
async function getEmojisByCategory(category) {
  const encoded = encodeURIComponent(category);
  return apiGet(`/all/category/${encoded}`);
}

/** Get emojis by group */
async function getEmojisByGroup(group) {
  const encoded = encodeURIComponent(group);
  return apiGet(`/all/group/${encoded}`);
}

/* -------------------------
   DOM rendering functions
-------------------------- */

/** Convert htmlCode (e.g., "&#129303;") to visible emoji */
function emojiFromHtmlCode(htmlCodeArray) {
  return (htmlCodeArray && htmlCodeArray[0]) ? htmlCodeArray[0] : "❓";
}

/** Create one emoji card element */
function createEmojiCard(item) {
  // DOM manipulation comments: create elements & inject values
  const card = document.createElement("article");
  card.className = "emoji-card";

  const big = document.createElement("div");
  big.className = "big-emoji";
  big.innerHTML = emojiFromHtmlCode(item.htmlCode);

  const title = document.createElement("h3");
  title.className = "title";
  title.textContent = item.name || "Unknown emoji";

  const meta1 = document.createElement("p");
  meta1.className = "meta";
  meta1.textContent = `Category: ${item.category || "—"}`;

  const meta2 = document.createElement("p");
  meta2.className = "meta";
  meta2.textContent = `Group: ${item.group || "—"}`;

  const meta3 = document.createElement("p");
  meta3.className = "meta";
  const unicode = (item.unicode && item.unicode[0]) ? item.unicode[0] : "—";
  meta3.textContent = `Unicode: ${unicode}`;

  // Favorite button
  const favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  favBtn.type = 'button';
  favBtn.title = 'Add to favorites';
  favBtn.innerHTML = '☆';

  // Reflect favorite state
  if (isFavorited(item)) {
    favBtn.classList.add('active');
    favBtn.innerHTML = '★';
    favBtn.title = 'Remove from favorites';
  }

  favBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent opening modal
    toggleFavorite(item, favBtn);
  });

  card.append(favBtn, big, title, meta1, meta2, meta3);
  // Open modal with a larger view when card is clicked
  card.addEventListener("click", () => showModal(item));
  return card;
}

/* -------------------------
   Favorites (localStorage)
-------------------------- */
const FAV_KEY = 'emojihub_favs';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveFavorites(list) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
}

function getId(item) {
  if (!item) return null;
  if (item.unicode && item.unicode[0]) return item.unicode[0];
  return item.name || JSON.stringify(item);
}

function isFavorited(item) {
  const id = getId(item);
  if (!id) return false;
  const list = loadFavorites();
  return list.some(i => getId(i) === id);
}

function updateFavCount() {
  const list = loadFavorites();
  if (favCountEl) favCountEl.textContent = String(list.length || 0);
}

function showFavorites() {
  clearError();
  clearResults();
  showingFavorites = true;
  const list = loadFavorites();
  if (!list || list.length === 0) {
    showError('No favorites saved yet. Click the star on any card to save.');
    updateFavCount();
    return;
  }
  updateFavCount();
  renderEmojiCards(list);
}

function toggleFavorite(item, btnEl) {
  const list = loadFavorites();
  const id = getId(item);
  const idx = list.findIndex(i => getId(i) === id);

  if (idx >= 0) {
    // remove
    list.splice(idx, 1);
    saveFavorites(list);
    if (btnEl) { btnEl.classList.remove('active'); btnEl.innerHTML = '☆'; btnEl.title = 'Add to favorites'; }
    // if current view is favorites, re-render
    if (showingFavorites) renderEmojiCards(list);
    return;
  }

  // add minimal info to favorites
  const toSave = {
    name: item.name,
    category: item.category,
    group: item.group,
    htmlCode: item.htmlCode,
    unicode: item.unicode
  };
  list.unshift(toSave);
  saveFavorites(list);
  if (btnEl) { btnEl.classList.add('active'); btnEl.innerHTML = '★'; btnEl.title = 'Remove from favorites'; }
  updateFavCount();
}

/** Render multiple emojis as cards */
function renderEmojiCards(list) {
  clearResults();
  const fragment = document.createDocumentFragment();

  list.forEach(item => {
    fragment.appendChild(createEmojiCard(item));
  });

  resultsGrid.appendChild(fragment);
}

/** Populate a dropdown (select) with items */
function fillSelect(selectEl, items, placeholder) {
  selectEl.innerHTML = "";
  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  selectEl.appendChild(first);

  items.forEach(val => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val;
    selectEl.appendChild(opt);
  });
}

/* -------------------------
   App logic
-------------------------- */

/** Show/hide fields based on mode */
function updateModeUI() {
  const mode = modeSelect.value;

  // Hide all optional fields first
  searchField.classList.add("hidden");
  categoryField.classList.add("hidden");
  groupField.classList.add("hidden");

  if (mode === "search") searchField.classList.remove("hidden");
  if (mode === "category") categoryField.classList.remove("hidden");
  if (mode === "group") groupField.classList.remove("hidden");

  clearError();
}

/** Validate inputs by mode and return a {ok, message} result */
function validateByMode() {
  const mode = modeSelect.value;

  if (mode === "search") {
    const q = cleanText(searchInput.value);
    searchInput.value = q; // auto-trim whitespace

    if (!q) return { ok: false, message: "Invalid input: search field is empty." };
    if (!isValidQuery(q)) return { ok: false, message: "Invalid input: use letters/numbers/spaces only (hyphen/apostrophe ok)." };
  }

  if (mode === "category") {
    if (!categorySelect.value) return { ok: false, message: "No results: please select a category first." };
  }

  if (mode === "group") {
    if (!groupSelect.value) return { ok: false, message: "No results: please select a group first." };
  }

  return { ok: true, message: "" };
}

/** Main fetch handler (one function, no duplicated code) */
async function handleFetch() {
  clearError();
  clearResults();
  showingFavorites = false;

  // Input validation requirement
  const check = validateByMode();
  if (!check.ok) {
    showError(check.message);
    return;
  }

  setLoading(true);

  try {
    const mode = modeSelect.value;
    let data;

    // Decide which endpoint to call
    if (mode === "random") {
      const one = await getRandomEmoji();
      data = [one]; // normalize to array for renderer
    } else if (mode === "search") {
      const q = cleanText(searchInput.value);
      data = await searchEmojisByName(q);
    } else if (mode === "category") {
      data = await getEmojisByCategory(categorySelect.value);
      // keep UI clean: show first 24 only
      data = data.slice(0, 24);
    } else if (mode === "group") {
      data = await getEmojisByGroup(groupSelect.value);
      data = data.slice(0, 24);
    }

    // No results found requirement
    if (!data || data.length === 0) {
      showError("No results found. Try another keyword/category/group.");
      return;
    }

    renderEmojiCards(data);
  } catch (err) {
    // Failed API call requirement
    showError("Failed API call. Please check your connection or try again.");
    console.error(err);
  } finally {
    setLoading(false);
  }
}

/** Clear handler */
function handleClear() {
  clearError();
  clearResults();
  searchInput.value = "";
  categorySelect.value = "";
  groupSelect.value = "";
}

/* -------------------------
   Dark mode toggle
-------------------------- */
function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggle.textContent = "☀️ Light";
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeToggle.textContent = "🌙 Dark";
  }
}

function toggleTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  if (isLight) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "🌙 Dark";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "☀️ Light";
  }
}

/* -------------------------
   Init (load dropdown data)
-------------------------- */
async function init() {
  initTheme();
  updateModeUI();
  setLoading(true);

  try {
    // Load categories/groups for dropdowns (API calls)
    const [cats, groups] = await Promise.all([getCategories(), getGroups()]);
    fillSelect(categorySelect, cats, "Select a category");
    fillSelect(groupSelect, groups, "Select a group");
    updateFavCount();
  } catch (err) {
    showError("Failed API call while loading categories/groups.");
    console.error(err);
  } finally {
    setLoading(false);
  }
}

/* -------------------------
   Event listeners
-------------------------- */
modeSelect.addEventListener("change", updateModeUI);
fetchBtn.addEventListener("click", handleFetch);
clearBtn.addEventListener("click", handleClear);
themeToggle.addEventListener("click", toggleTheme);
if (favoritesBtn) favoritesBtn.addEventListener('click', showFavorites);

// Enter key triggers fetch when in search mode
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && modeSelect.value === "search" && !fetchBtn.disabled) {
    handleFetch();
  }
});

// Start app
init();

/* -------------------------
   Modal: show enlarged emoji
-------------------------- */
const emojiModal = document.getElementById("emojiModal");
const modalEmoji = document.getElementById("modalEmoji");
const modalName = document.getElementById("modalName");
const modalUnicode = document.getElementById("modalUnicode");
const modalClose = document.getElementById("modalClose");
const modalCopy = document.getElementById("modalCopy");

function showModal(item) {
  if (!item) return;
  // item.htmlCode is an array of HTML entities, item.unicode contains codes
  modalEmoji.innerHTML = emojiFromHtmlCode(item.htmlCode) || "❓";
  modalName.textContent = item.name || "Unknown emoji";
  modalUnicode.textContent = `Unicode: ${((item.unicode && item.unicode[0]) || "—")}`;
  emojiModal.classList.remove("hidden");
  emojiModal.setAttribute("aria-hidden", "false");
}

function hideModal() {
  emojiModal.classList.add("hidden");
  emojiModal.setAttribute("aria-hidden", "true");
}

/** Copy text to clipboard with fallback */
async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // fall through to legacy method
  }

  // Fallback: use textarea + execCommand
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (err) {
    return false;
  }
}

// Close handlers
modalClose.addEventListener("click", hideModal);
emojiModal.addEventListener("click", (e) => {
  if (e.target === emojiModal) hideModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !emojiModal.classList.contains("hidden")) hideModal();
});

// Copy button behavior: copy the visible emoji character (textContent)
if (modalCopy) {
  modalCopy.addEventListener('click', async () => {
    const toCopy = (modalEmoji && modalEmoji.textContent) ? modalEmoji.textContent.trim() : '';
    const ok = await copyToClipboard(toCopy);
    const original = modalCopy.textContent;
    if (ok) {
      modalCopy.textContent = 'Copied!';
      modalCopy.classList.add('copied');
      setTimeout(() => {
        modalCopy.textContent = original;
        modalCopy.classList.remove('copied');
      }, 1500);
    } else {
      modalCopy.textContent = 'Failed';
      setTimeout(() => { modalCopy.textContent = original; }, 1500);
    }
  });

  // Also allow clicking the big emoji to copy quickly
  modalEmoji.addEventListener('click', async () => {
    const toCopy = (modalEmoji && modalEmoji.textContent) ? modalEmoji.textContent.trim() : '';
    const ok = await copyToClipboard(toCopy);
    const original = modalCopy.textContent;
    if (ok) {
      modalCopy.textContent = 'Copied!';
      modalCopy.classList.add('copied');
      setTimeout(() => {
        modalCopy.textContent = original;
        modalCopy.classList.remove('copied');
      }, 1200);
    }
  });
}
