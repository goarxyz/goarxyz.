// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

document.addEventListener("DOMContentLoaded", () => {

  // DRAWER LOGIC
  const drawerBtn = document.getElementById('btn-hamburger');
  const drawer = document.getElementById('side-drawer');
  const drawerCloseBtn = document.getElementById('btn-close-drawer');
  const drawerOverlay = document.querySelector('.side-drawer-overlay');

  if (drawer && drawerBtn && drawerCloseBtn && drawerOverlay) {
    const openDrawer = () => drawer.classList.add('is-open');
    const closeDrawer = () => drawer.classList.remove('is-open');
    drawerBtn.addEventListener('click', openDrawer);
    drawerCloseBtn.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);
    
    // Connect drawer favorite button
    const drawerFavBtn = document.querySelector('.drawer-btn-favorites');
    if (drawerFavBtn) {
      drawerFavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeDrawer();
        const favsBtn = document.getElementById('nav-btn-favorites') || document.getElementById('bottom-nav-btn-favorites');
        if(favsBtn && !favsBtn.classList.contains('is-active')) {
          favsBtn.click();
        } else if (favsBtn) {
          // Already in favorites, scroll to it
          const gamesSection = document.querySelector(".games-section");
          gamesSection?.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }

  // RECENTLY PLAYED LOGIC
  const RECENT_KEY = "goarxyz_recent_v1";
  const getRecent = () => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
  };
  const saveRecent = (game) => {
    const recent = getRecent();
    const filtered = recent.filter(g => g.slug !== game.slug);
    filtered.unshift(game);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 10))); } catch (e) {}
  };
  
  const renderRecent = () => {
    const list = document.getElementById('drawer-recent-list');
    if (!list) return;
    const recent = getRecent();
    if (recent.length === 0) {
      list.innerHTML = '<span style="color:var(--text-dim);font-size:0.85rem;">No games played yet.</span>';
      return;
    }
    list.innerHTML = recent.map(g => `
      <a href="/game/${g.slug}/" class="recent-game-item">
        <img src="${g.img}" alt="${g.title}">
        <span>${g.title}</span>
      </a>
    `).join('');
  };
  renderRecent();

  // Track game clicks for Recently Played
  const allGameCards = document.querySelectorAll('.game-card[data-slug]');
  allGameCards.forEach(card => {
    card.addEventListener('click', () => {
      const slug = card.dataset.slug;
      const title = card.querySelector('h3')?.textContent || 'Game';
      const img = card.querySelector('img')?.src || '';
      saveRecent({ slug, title, img });
    });
  });

  // BRANDED GAME OVERLAY LOGIC
  const gameOverlay = document.getElementById('game-brand-overlay');
  const btnPlayGame = document.getElementById('btn-play-game');
  const gameIframe = document.getElementById('game-iframe');
  
  if (gameOverlay && btnPlayGame && gameIframe) {
    btnPlayGame.addEventListener('click', () => {
      gameOverlay.classList.add('is-hidden');
      const dataSrc = gameIframe.getAttribute('data-src');
      if (dataSrc && !gameIframe.hasAttribute("src")) {
        gameIframe.setAttribute("src", dataSrc);
      }
    });
  }

  const trackEvent = (eventName, params = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  };

  const form = document.querySelector(".search-form");
  const input = document.getElementById("search-input") || form?.querySelector('input[name="q"]');
  const clearBtn = document.getElementById("search-clear");
  const randomBtn = document.getElementById("btn-random-game");
  const pwaBtn = document.getElementById("btn-pwa-install");
  
  const favHeaderBtn = document.getElementById("nav-btn-favorites");
  const bottomFavBtn = document.getElementById("bottom-nav-btn-favorites");
  const favCountBadge = document.getElementById("fav-count");
  const heroFavBtn = document.getElementById("hero-fav-btn");
  
  const cards = Array.from(document.querySelectorAll(".game-card[data-search]"));
  const categorySections = Array.from(document.querySelectorAll(".category-showcase[data-category-section]"));
  const gamesSection = document.querySelector(".games-section");
  const emptyState = document.getElementById("empty-state");

  // LocalStorage Helpers
  const FAV_KEY = "goarxyz_favorites_v1";
  const OLD_FAV_KEY = "playgama_favorites_v1";
  const getFavorites = () => {
    try {
      let raw = localStorage.getItem(FAV_KEY);
      if (!raw) {
        raw = localStorage.getItem(OLD_FAV_KEY);
        if (raw) localStorage.setItem(FAV_KEY, raw);
      }
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };
  const saveFavorites = (favs) => {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {}
    updateFavBadges();

  // Stagger Animations for Game Cards
  const observer = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${delay}ms`;
        delay += 30; // 30ms stagger
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px 50px 0px', threshold: 0.1 });

  cards.forEach(card => {
    observer.observe(card);
  });

  };
  const updateFavBadges = () => {
    const favs = getFavorites();
    if (favCountBadge) favCountBadge.textContent = favs.length;
  };
  updateFavBadges();

  // PWA Button
  if (pwaBtn) {
    pwaBtn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          trackEvent("pwa_installed");
        }
        deferredPrompt = null;
      } else {
        trackEvent("pwa_install_click");
        alert("To install, use your browser's 'Add to Home Screen' option.");
      }
    });
  }

  // Favorites logic
  const handleFavToggle = (btn) => {
    const isCurrentlyFav = btn.classList.contains("is-active");
    if (isCurrentlyFav) {
      favHeaderBtn?.classList.remove("is-active");
      bottomFavBtn?.classList.remove("is-active");
      applyFilter("", "all");
    } else {
      favHeaderBtn?.classList.add("is-active");
      bottomFavBtn?.classList.add("is-active");
      applyFilter("", "favorites");
      gamesSection?.scrollIntoView({ behavior: "smooth" });
    }
  };
  favHeaderBtn?.addEventListener("click", (e) => { e.preventDefault(); handleFavToggle(favHeaderBtn); });
  bottomFavBtn?.addEventListener("click", (e) => { e.preventDefault(); handleFavToggle(bottomFavBtn); });

  const navItems = Array.from(document.querySelectorAll(".nav-item, .bottom-nav-item"));
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      const cat = item.dataset.nav;
      if (cat === "favorites") return;
      if (cat === "home") {
        if(window.location.pathname === "/") {
          e.preventDefault();
          navItems.forEach(p => p.classList.remove("is-active"));
          navItems.filter(p => p.dataset.nav === "home").forEach(p => p.classList.add("is-active"));
          favHeaderBtn?.classList.remove("is-active");
          bottomFavBtn?.classList.remove("is-active");
          if (input) input.value = "";
          applyFilter("", "all");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    });
  });

  // Game Cards Heart toggle
  cards.forEach((card) => {
    const link = card.querySelector(".game-card__link");
    const title = card.querySelector("h3")?.textContent || "Game";
    const slug = card.dataset.slug;
    if (!slug) return;

    link?.addEventListener("click", () => {
      trackEvent("select_content", { content_type: "game", item_id: slug });
    });

    // Add heart icon to cards dynamically
    const favIcon = document.createElement("button");
    favIcon.className = "game-card__fav-btn";
    favIcon.innerHTML = "❤️";
    favIcon.setAttribute("aria-label", "Favorite");
    favIcon.title = "Save to Favorites";
    
    // Position it at top right
    const imgWrap = card.querySelector('.game-card__img-wrap');
    if (imgWrap) imgWrap.appendChild(favIcon);

    const checkFav = () => {
      const isFav = getFavorites().includes(slug);
      favIcon.classList.toggle("is-active", isFav);
      favIcon.style.opacity = isFav ? "1" : "";
    };
    checkFav();

    favIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const favs = getFavorites();
      const idx = favs.indexOf(slug);
      if (idx > -1) {
        favs.splice(idx, 1);
        trackEvent("remove_from_favorites", { item_id: slug });
      } else {
        favs.push(slug);
        trackEvent("add_to_favorites", { item_id: slug });
      }
      saveFavorites(favs);
      checkFav();
    });
  });

  const applyFilter = (query = "", filterMode = "all") => {
    const normalizedQuery = query.trim().toLowerCase();
    const favs = getFavorites();
    let visibleCount = 0;
    
    if (clearBtn) clearBtn.classList.toggle("is-active", Boolean(normalizedQuery));

    cards.forEach((card) => {
      let matches = true;
      if (normalizedQuery) {
        matches = (card.dataset.search || "").includes(normalizedQuery);
      } else if (filterMode === "favorites") {
        matches = favs.includes(card.dataset.slug || "");
      }
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (visibleCount === 0 && emptyState) {
      emptyState.hidden = false;
      if (filterMode === "favorites") {
        emptyState.innerHTML = `<h3>No favorite games saved yet</h3><p>Click the ❤️ heart icon on any game card to add it to your personal favorites!</p>`;
      } else {
        emptyState.innerHTML = `<h3>No games match "${normalizedQuery}"</h3><p>Try searching for a different game name, keyword, or explore our categories.</p>`;
      }
    } else if (emptyState) {
      emptyState.hidden = true;
    }
  };

  // Live Search
  let searchTimeout = null;
  input?.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const q = input.value;
      applyFilter(q, q ? "search" : "all");
    }, 120);
  });
  
  clearBtn?.addEventListener("click", () => {
    if (input) { input.value = ""; input.focus(); }
    applyFilter("", "all");
    window.history.replaceState({}, "", "/");
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const normalizedQuery = input?.value.trim() || "";
    if (normalizedQuery) {
      gamesSection?.scrollIntoView({ behavior: "smooth" });
    }
    applyFilter(normalizedQuery, normalizedQuery ? "search" : "all");
  });

  // Random Game
  randomBtn?.addEventListener("click", () => {
    const allCards = Array.from(document.querySelectorAll(".game-card[data-search]"));
    if (allCards.length === 0) return;
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    const link = randomCard.querySelector("a")?.getAttribute("href");
    if (link) window.location.href = link;
  });

  // Search Suggestions (simplified logic)
  const suggestionsBox = document.getElementById("search-suggestions");
  let selectedSuggestionIndex = -1;
  if (input && suggestionsBox && cards.length > 0) {
    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.remove("is-active");
      }
    });

    input.addEventListener("focus", () => {
      if (input.value.trim().length > 0 && suggestionsBox.children.length > 0) {
        suggestionsBox.classList.add("is-active");
      }
    });

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        suggestionsBox.classList.remove("is-active");
        suggestionsBox.innerHTML = "";
        return;
      }
      const tokens = q.split(/\s+/).filter(Boolean);
      const matches = cards.filter(card => {
        const text = card.dataset.search?.toLowerCase() || "";
        return tokens.every(t => text.includes(t));
      }).slice(0, 6);

      if (matches.length > 0) {
        suggestionsBox.innerHTML = matches.map((card, i) => {
          const imgUrl = card.querySelector("img")?.src || "";
          const title = card.querySelector("h3")?.textContent || "";
          const slug = card.dataset.slug;
          return `<li class="search-suggestion-item" data-index="${i}" data-slug="${slug}">
              <img src="${imgUrl}" class="search-suggestion-img" alt="">
              <div class="search-suggestion-info">
                <span class="search-suggestion-title">${title}</span>
              </div>
            </li>`;
        }).join("");
        suggestionsBox.classList.add("is-active");
        selectedSuggestionIndex = -1;
      } else {
        suggestionsBox.classList.remove("is-active");
        suggestionsBox.innerHTML = "";
      }
    });

    suggestionsBox.addEventListener("click", (e) => {
      const item = e.target.closest(".search-suggestion-item");
      if (item) window.location.href = "/game/" + item.dataset.slug + "/";
    });
  }

  // Scroll to Top
  const scrollTopBtn = document.getElementById("scroll-to-top");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) scrollTopBtn.classList.add("is-visible");
      else scrollTopBtn.classList.remove("is-visible");
    });
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // URL Params initialization
  const params = new URLSearchParams(window.location.search);
  const existingQuery = params.get("q");
  if (existingQuery && input) {
    input.value = existingQuery;
    applyFilter(existingQuery, "search");
  }
});
