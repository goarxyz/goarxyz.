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
  };

  const updateFavBadges = () => {
    const favs = getFavorites();
    if (favCountBadge) favCountBadge.textContent = favs.length;
  };
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
      window.applyFilter("", "all");
    } else {
      favHeaderBtn?.classList.add("is-active");
      bottomFavBtn?.classList.add("is-active");
      window.applyFilter("", "favorites");
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
          window.applyFilter("", "all");
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

  window.applyFilter = (query = "", filterMode = "all") => {
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
      window.applyFilter(q, q ? "search" : "all");
    }, 120);
  });
  
  clearBtn?.addEventListener("click", () => {
    if (input) { input.value = ""; input.focus(); }
    window.applyFilter("", "all");
    window.history.replaceState({}, "", "/");
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const normalizedQuery = input?.value.trim() || "";
    if (normalizedQuery) {
      gamesSection?.scrollIntoView({ behavior: "smooth" });
    }
    window.applyFilter(normalizedQuery, normalizedQuery ? "search" : "all");
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
    window.applyFilter(existingQuery, "search");
  }
});




  async function loadTopAnime() {
    fetchAnime('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=24');
  }

  async function searchAnime(query) {
    fetchAnime(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=24`);
  }

  async function fetchAnime(url) {
    const grid = document.getElementById("anime-grid");
    const loading = document.getElementById("anime-loading");
    if(!grid || !loading) return;
    grid.innerHTML = "";
    loading.style.display = "block";
    try {
      const res = await fetch(url);
      const { data } = await res.json();
      loading.style.display = "none";
      if(!data || data.length === 0) {
        loading.style.display = "block";
        loading.innerText = "No anime found.";
        return;
      }
      data.forEach(item => {
        const card = document.createElement("div");
        card.className = "anime-card";
        card.innerHTML = `
          <div class="anime-score"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>${item.score || 'N/A'}</div>
          <img src="${item.images.webp.large_image_url || item.images.jpg.image_url}" alt="${item.title}">
          <h3>${item.title}</h3>
          <p>${item.year ? item.year + ' • ' : ''}${item.episodes ? item.episodes + ' eps' : 'Ongoing'}</p>
        `;
        card.addEventListener("click", () => openAnimeModal(item));
        grid.appendChild(card);
      });
    } catch (err) {
      loading.innerText = "Failed to load anime.";
      console.error(err);
    }
  }

  const aModal = document.getElementById("anime-modal");
  const aModalClose = document.getElementById("anime-modal-close");
  const aModalBody = document.getElementById("anime-modal-body");
  
  aModalClose?.addEventListener("click", () => {
    aModal.classList.remove("show");
    setTimeout(() => aModal.style.display = "none", 300);
  });

  function openAnimeModal(item) {
    if(!aModal || !aModalBody) return;
    aModal.style.display = "flex";
    setTimeout(() => aModal.classList.add("show"), 10);
    
    aModalBody.innerHTML = `
      <div class="anime-modal-body">
        <img src="${item.images.webp.large_image_url || item.images.jpg.image_url}" class="anime-modal-img" alt="${item.title}">
        <div class="anime-modal-info">
          <h2>${item.title}</h2>
          <div class="anime-meta">
            <span>Score: ${item.score || 'N/A'}</span>
            <span>Status: ${item.status}</span>
            <span>Episodes: ${item.episodes || '?' }</span>
            <span>Rating: ${item.rating || 'None'}</span>
          </div>
          <p>${item.synopsis || 'No synopsis available.'}</p>
          
  <div style="display:flex;gap:12px;margin-top:16px;">
    <button class="watch-anime-btn" data-anime-data='${JSON.stringify(item).replace(/'/g, "&#39;")}' style="background:var(--brand-orange);color:#000;padding:12px 24px;border-radius:8px;border:none;font-weight:bold;cursor:pointer;">Watch Now</button>
    <a href="${item.url}" target="_blank" style="display:inline-block;background:var(--surface);color:var(--text);padding:12px 24px;border-radius:8px;border:1px solid var(--line);text-decoration:none;font-weight:bold;">View on MAL</a>
  </div>

        </div>
      </div>
    `;
  }

// YouTube Iframe API setup
  let ytPlayer;
  let isPlaying = false;
  let progressInterval;
  
  // Load YT API
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-player-container', {
      height: '0',
      width: '0',
      playerVars: { 'autoplay': 1, 'controls': 0, 'showinfo': 0, 'rel': 0, 'modestbranding': 1 },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  };

  function onPlayerStateChange(event) {
    const playBtn = document.querySelector("#player-play-pause .icon-play");
    const pauseBtn = document.querySelector("#player-play-pause .icon-pause");
    
    if (event.data == YT.PlayerState.PLAYING) {
      isPlaying = true;
      if(playBtn) playBtn.style.display = "none";
      if(pauseBtn) pauseBtn.style.display = "block";
      
      // Update duration
      const duration = ytPlayer.getDuration();
      document.getElementById("player-time-total").innerText = formatTime(duration);
      
      progressInterval = setInterval(updateProgress, 1000);
    } else {
      isPlaying = false;
      if(playBtn) playBtn.style.display = "block";
      if(pauseBtn) pauseBtn.style.display = "none";
      clearInterval(progressInterval);
    }
  }

  function updateProgress() {
    if (!ytPlayer || !ytPlayer.getCurrentTime) return;
    const current = ytPlayer.getCurrentTime();
    const duration = ytPlayer.getDuration();
    if(duration > 0) {
      const pct = (current / duration) * 100;
      document.getElementById("player-progress-fill").style.width = pct + "%";
      document.getElementById("player-time-current").innerText = formatTime(current);
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function playMusic(item) {
    musicPlayer.style.display = "flex";
    document.getElementById("player-title").innerText = item.title;
    document.getElementById("player-artist").innerText = item.artist;
    document.getElementById("player-art").src = item.thumbnail;
    
    if (ytPlayer && ytPlayer.loadVideoById) {
      ytPlayer.loadVideoById(item.id);
    }
  }

  // Player Controls
  const playPauseBtn = document.getElementById("player-play-pause");
  if(playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
      if(!ytPlayer || !ytPlayer.getPlayerState) return;
      if (isPlaying) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    });
  }
  
  const progressWrap = document.getElementById("player-progress-wrap");
  if(progressWrap) {
    progressWrap.addEventListener("click", (e) => {
      if(!ytPlayer || !ytPlayer.getDuration) return;
      const rect = progressWrap.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const duration = ytPlayer.getDuration();
      ytPlayer.seekTo(pos * duration, true);
    });
  }


  // --- Enhanced Full Streamable Anime Player Logic ---
  const animePlayerModal = document.getElementById('anime-player-modal');
  const animePlayerClose = document.getElementById('anime-player-close');
  const animePlayerIframe = document.getElementById('anime-player-iframe');
  const animePlayerPlaceholder = document.getElementById('anime-player-placeholder');
  const animePlayerLoader = document.getElementById('anime-player-loader');
  const animePlayerTitle = document.getElementById('anime-player-title');
  const animePlayerEpTitle = document.getElementById('anime-player-episode-title');
  const animePlayerEpList = document.getElementById('anime-player-episodes-list');
  const animePlayerServers = document.getElementById('anime-player-servers');
  const animeEpisodesCount = document.getElementById('anime-episodes-count');
  const animeEpSearch = document.getElementById('anime-ep-search');
  const animeBtnPrev = document.getElementById('anime-btn-prev');
  const animeBtnNext = document.getElementById('anime-btn-next');
  const animeBtnPopout = document.getElementById('anime-btn-popout');

  let currentAnime = null;
  let currentEpisode = 1;
  let totalEpisodesCount = 12;
  let activeServers = [];
  let currentServerUrl = '';

  if (animePlayerClose) {
    animePlayerClose.addEventListener('click', () => {
      animePlayerModal.style.display = 'none';
      if (animePlayerIframe) animePlayerIframe.src = '';
    });
  }

  // Prev / Next Episode Listeners
  if (animeBtnPrev) {
    animeBtnPrev.addEventListener('click', () => {
      if (currentEpisode > 1) {
        selectEpisode(currentEpisode - 1);
      }
    });
  }

  if (animeBtnNext) {
    animeBtnNext.addEventListener('click', () => {
      if (currentEpisode < totalEpisodesCount) {
        selectEpisode(currentEpisode + 1);
      }
    });
  }

  // Popout Stream / New Tab
  if (animeBtnPopout) {
    animeBtnPopout.addEventListener('click', () => {
      if (currentServerUrl) {
        window.open(currentServerUrl, '_blank', 'noopener,noreferrer');
      }
    });
  }

  // Episode Search Filter
  if (animeEpSearch) {
    animeEpSearch.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const buttons = animePlayerEpList.querySelectorAll('.anime-episode-btn');
      buttons.forEach(btn => {
        const epNum = btn.getAttribute('data-ep') || '';
        const title = btn.textContent.toLowerCase();
        if (!q || epNum === q || title.includes(q)) {
          btn.style.display = 'flex';
        } else {
          btn.style.display = 'none';
        }
      });
    });
  }

  // Handle Watch Now button clicks
  document.addEventListener('click', (e) => {
    const watchBtn = e.target.closest('.watch-anime-btn');
    if (watchBtn) {
      const itemData = JSON.parse(watchBtn.getAttribute('data-anime-data'));
      const aModal = document.getElementById("anime-modal");
      if (aModal) {
        aModal.classList.remove("show");
        aModal.style.display = "none";
      }
      openAnimePlayer(itemData);
    }
  });

  function openAnimePlayer(anime) {
    currentAnime = anime;
    currentEpisode = 1;
    totalEpisodesCount = anime.episodes || 12;
    
    const displayTitle = anime.title_english || anime.title || 'Anime';
    if (animePlayerTitle) animePlayerTitle.textContent = displayTitle;
    if (animePlayerModal) animePlayerModal.style.display = 'flex';
    
    if (animeEpisodesCount) animeEpisodesCount.textContent = totalEpisodesCount;
    if (animeEpSearch) animeEpSearch.value = '';

    renderEpisodesList(totalEpisodesCount);
    selectEpisode(1);
  }

  function renderEpisodesList(total, episodesData = []) {
    if (!animePlayerEpList) return;
    animePlayerEpList.innerHTML = '';

    for (let i = 1; i <= total; i++) {
      const epData = episodesData.find(e => e.number === i);
      const epLabel = epData && epData.title ? epData.title : `Episode ${i}`;
      
      const btn = document.createElement('div');
      btn.className = 'anime-episode-btn';
      btn.setAttribute('data-ep', i);
      if (i === currentEpisode) btn.classList.add('active');
      
      btn.innerHTML = `
        <div class="anime-episode-number">${i}</div>
        <div class="anime-episode-title">${epLabel}</div>
      `;
      
      btn.addEventListener('click', () => {
        selectEpisode(i);
      });
      animePlayerEpList.appendChild(btn);
    }
  }

  function selectEpisode(epNum) {
    currentEpisode = epNum;
    if (animePlayerEpTitle) animePlayerEpTitle.textContent = `Episode ${epNum}`;
    
    // Update active episode class
    const allBtns = animePlayerEpList.querySelectorAll('.anime-episode-btn');
    allBtns.forEach(b => {
      if (parseInt(b.getAttribute('data-ep'), 10) === epNum) {
        b.classList.add('active');
        b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        b.classList.remove('active');
      }
    });

    // Update prev/next button disabled state
    if (animeBtnPrev) animeBtnPrev.disabled = (epNum <= 1);
    if (animeBtnNext) animeBtnNext.disabled = (epNum >= totalEpisodesCount);

    loadEpisodeStream(currentAnime, epNum);
  }

  async function loadEpisodeStream(anime, epNum) {
    if (!animePlayerIframe) return;

    // Show loading state
    if (animePlayerLoader) animePlayerLoader.style.display = 'flex';
    if (animePlayerPlaceholder) animePlayerPlaceholder.style.display = 'none';
    animePlayerIframe.style.display = 'none';
    animePlayerIframe.src = '';
    if (animePlayerServers) animePlayerServers.innerHTML = '';

    const queryTitle = anime.title_english || anime.title || '';

    try {
      const res = await fetch(`/api/anime/stream?title=${encodeURIComponent(queryTitle)}&episode=${epNum}`);
      const data = await res.json();

      if (data && data.servers && data.servers.length > 0) {
        activeServers = data.servers;

        // If backend returned more accurate total episodes or titles
        if (data.totalEpisodes && data.totalEpisodes > totalEpisodesCount) {
          totalEpisodesCount = data.totalEpisodes;
          if (animeEpisodesCount) animeEpisodesCount.textContent = totalEpisodesCount;
          renderEpisodesList(totalEpisodesCount, data.episodes || []);
          const activeBtn = animePlayerEpList.querySelector(`.anime-episode-btn[data-ep="${epNum}"]`);
          if (activeBtn) activeBtn.classList.add('active');
        }

        if (data.episodeTitle && animePlayerEpTitle) {
          animePlayerEpTitle.textContent = data.episodeTitle;
        }

        // Render Server selection pills
        renderServerPills(activeServers);

        // Auto-select Server 1
        switchServer(activeServers[0]);
      } else {
        fallbackTrailerOrPlaceholder(anime);
      }
    } catch (err) {
      console.error('Stream load error:', err);
      fallbackTrailerOrPlaceholder(anime);
    } finally {
      if (animePlayerLoader) animePlayerLoader.style.display = 'none';
    }
  }

  function renderServerPills(servers) {
    if (!animePlayerServers) return;
    animePlayerServers.innerHTML = '';

    servers.forEach((srv, idx) => {
      const pill = document.createElement('button');
      pill.className = 'anime-server-pill';
      if (idx === 0) pill.classList.add('active');
      pill.textContent = srv.name;
      pill.title = `Switch to ${srv.name}`;

      pill.addEventListener('click', () => {
        animePlayerServers.querySelectorAll('.anime-server-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        switchServer(srv);
      });

      animePlayerServers.appendChild(pill);
    });
  }

  function switchServer(srv) {
    if (!srv || !srv.url) return;
    currentServerUrl = srv.url;
    animePlayerIframe.src = srv.url;
    animePlayerIframe.style.display = 'block';
    if (animePlayerPlaceholder) animePlayerPlaceholder.style.display = 'none';
  }

  function fallbackTrailerOrPlaceholder(anime) {
    if (anime && anime.trailer && anime.trailer.embed_url) {
      currentServerUrl = anime.trailer.embed_url + '&autoplay=1';
      animePlayerIframe.src = currentServerUrl;
      animePlayerIframe.style.display = 'block';
      if (animePlayerPlaceholder) animePlayerPlaceholder.style.display = 'none';
    } else {
      animePlayerIframe.style.display = 'none';
      if (animePlayerPlaceholder) animePlayerPlaceholder.style.display = 'flex';
      animePlayerIframe.src = '';
    }
  }


// --- NEW ARCHITECTURE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const views = {
    hub: document.getElementById('hub-section'),
    games: document.getElementById('games-section'),
    music: document.getElementById('music-section'),
    anime: document.getElementById('anime-section')
  };
  
  const bottomNav = document.getElementById('main-bottom-nav');
  const globalHeader = document.querySelector('.site-header, .header');
  if (globalHeader) globalHeader.style.display = 'none';

  function switchSystem(sys) {
    if (!views[sys]) sys = 'hub';
    
    // Hide all
    Object.values(views).forEach(v => {
      if(v) {
        v.classList.remove('is-active');
        v.style.display = 'none';
      }
    });
    
    // Reset nav
    document.querySelectorAll('#main-bottom-nav .bottom-nav-item').forEach(el => el.classList.remove('is-active'));
    
    if(views[sys]) {
      views[sys].classList.add('is-active');
      views[sys].style.display = 'flex';
    }
    
    if(bottomNav) bottomNav.style.display = 'flex';
    
    const btn = document.getElementById('sys-btn-' + sys);
    if(btn) btn.classList.add('is-active');

    // Update URL hash
    try {
      if (sys === 'hub') {
        if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
      } else {
        window.history.replaceState(null, '', '#' + sys);
      }
    } catch(e) {}
    
    // Auto initialize content on open
    if (sys === 'music') {
      const mGrid = document.getElementById("music-grid");
      if (mGrid && mGrid.children.length === 0 && typeof window.searchMusic === 'function') {
        window.searchMusic('trending hits');
      }
    } else if (sys === 'anime') {
      const aGrid = document.getElementById("anime-grid");
      if (aGrid && aGrid.children.length === 0 && typeof window.loadTopAnime === 'function') {
        window.loadTopAnime();
      }
    }
  }

  window.switchSystem = switchSystem;

  // Hub Portal Cards
  document.querySelectorAll('.hub-card').forEach(card => {
    card.addEventListener('click', () => {
      const sys = card.getAttribute('data-sys');
      if (sys) switchSystem(sys);
    });
  });

  // Bottom Navigation Dock
  document.querySelectorAll('#main-bottom-nav .bottom-nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const href = btn.getAttribute('href') || '';
      const sys = href.replace('#', '') || btn.id.replace('sys-btn-', '');
      switchSystem(sys);
    });
  });

  // Hash Navigation Listener
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['games', 'music', 'anime', 'hub'].includes(hash)) {
      switchSystem(hash);
    }
  });

  // Initial Route Check
  const hashOnLoad = window.location.hash.replace('#', '');
  if (['games', 'music', 'anime'].includes(hashOnLoad)) {
    switchSystem(hashOnLoad);
  } else {
    switchSystem('hub');
  }

  // --- Games System Wireup ---
  const gamesNavs = [
    { id: 'btn-games-home', mode: 'all' },
    { id: 'btn-games-action', mode: 'action' },
    { id: 'btn-games-puzzle', mode: 'puzzle' },
    { id: 'btn-games-racing', mode: 'racing' },
    { id: 'btn-games-favorites', mode: 'favorites' }
  ];

  gamesNavs.forEach(nav => {
    const el = document.getElementById(nav.id);
    if(el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#games-section .nav-item').forEach(n => n.classList.remove('is-active'));
        el.classList.add('is-active');
        if(typeof window.applyFilter === 'function') {
           window.applyFilter('', nav.mode);
        }
      });
    }
  });

  // Games Category Chips
  document.querySelectorAll('#games-category-chips .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#games-category-chips .chip-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const cat = btn.getAttribute('data-cat') || 'all';
      if (typeof window.applyFilter === 'function') {
        window.applyFilter('', cat);
      }
    });
  });

  // Games Search Input
  const gamesSearch = document.getElementById('games-search');
  if(gamesSearch) {
    gamesSearch.addEventListener('input', (e) => {
      const q = e.target.value;
      if(typeof window.applyFilter === 'function') {
        window.applyFilter(q, q ? "search" : "all");
      }
    });
  }

  // Carousel Populate Safely
  const track = document.querySelector('.carousel-track');
  if(track && track.children.length === 0) {
    const games = Array.from(document.querySelectorAll('.game-card')).slice(0, 10);
    games.forEach(g => {
       const linkEl = g.querySelector('a');
       const imgEl = g.querySelector('img');
       const titleEl = g.querySelector('h3');
       if (!linkEl || !imgEl || !titleEl) return;
       
       const href = linkEl.getAttribute('href');
       const img = imgEl.src;
       const title = titleEl.textContent;
       
       const slide = document.createElement('a');
       slide.className = 'carousel-slide';
       slide.href = href;
       slide.innerHTML = `<img src="${img}" alt="${title}" loading="lazy"> <div class="carousel-caption">${title}</div>`;
       track.appendChild(slide);
    });
  }

  // --- Music System Wireup ---
  const mSearch = document.getElementById('music-search-input');
  if(mSearch) {
    mSearch.addEventListener('keypress', (e) => {
      if(e.key === 'Enter' && mSearch.value.trim() !== '') {
        const mLoading = document.getElementById("music-loading");
        const mGrid = document.getElementById("music-grid");
        if(mLoading) mLoading.style.display = "block";
        if(mGrid) mGrid.innerHTML = "";
        window.searchMusic(mSearch.value.trim());
      }
    });
  }

  // Music Genre Chips
  document.querySelectorAll('#music-genre-chips .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#music-genre-chips .chip-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const q = btn.getAttribute('data-query');
      if (q && typeof window.searchMusic === 'function') {
        if (mSearch) mSearch.value = q;
        const mLoading = document.getElementById("music-loading");
        const mGrid = document.getElementById("music-grid");
        if(mLoading) mLoading.style.display = "block";
        if(mGrid) mGrid.innerHTML = "";
        window.searchMusic(q);
      }
    });
  });

  const btnMusicHome = document.getElementById('btn-music-home');
  const btnMusicSearch = document.getElementById('btn-music-search');
  if(btnMusicHome) {
    btnMusicHome.addEventListener('click', (e) => {
       e.preventDefault();
       document.querySelectorAll('#music-section .nav-item').forEach(n => n.classList.remove('is-active'));
       btnMusicHome.classList.add('is-active');
       window.searchMusic('trending hits');
    });
  }
  if(btnMusicSearch) {
    btnMusicSearch.addEventListener('click', (e) => {
       e.preventDefault();
       document.querySelectorAll('#music-section .nav-item').forEach(n => n.classList.remove('is-active'));
       btnMusicSearch.classList.add('is-active');
       if(mSearch) mSearch.focus();
    });
  }

  // Spotify Play/Pause Toggle
  const playPauseBtn = document.getElementById('player-play-pause');
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;
      const state = ytPlayer.getPlayerState();
      const playIcon = playPauseBtn.querySelector(".icon-play");
      const pauseIcon = playPauseBtn.querySelector(".icon-pause");
      if (state === 1) { // PLAYING
        ytPlayer.pauseVideo();
        if (playIcon) playIcon.style.display = "block";
        if (pauseIcon) pauseIcon.style.display = "none";
      } else {
        ytPlayer.playVideo();
        if (playIcon) playIcon.style.display = "none";
        if (pauseIcon) pauseIcon.style.display = "block";
      }
    });
  }

  // Spotify Seekbar Progress Click
  const progressWrap = document.getElementById('player-progress-wrap');
  if (progressWrap) {
    progressWrap.addEventListener('click', (e) => {
      if (!ytPlayer || typeof ytPlayer.getDuration !== 'function') return;
      const rect = progressWrap.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const duration = ytPlayer.getDuration() || 0;
      if (duration > 0) {
        ytPlayer.seekTo(pos * duration, true);
      }
    });
  }

  // --- Anime System Wireup ---
  const aSearch = document.getElementById('anime-search-input');
  if(aSearch) {
    aSearch.addEventListener('keypress', (e) => {
      if(e.key === 'Enter' && aSearch.value.trim() !== '') {
        const aLoading = document.getElementById("anime-loading");
        const aGrid = document.getElementById("anime-grid");
        if(aLoading) aLoading.style.display = "block";
        if(aGrid) aGrid.innerHTML = "";
        window.searchAnime(aSearch.value.trim());
      }
    });
  }

  // Anime Genre Chips
  document.querySelectorAll('#anime-genre-chips .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#anime-genre-chips .chip-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.getAttribute('data-filter');
      const query = btn.getAttribute('data-query');
      if (filter === 'top') {
        window.fetchAnime('https://api.jikan.moe/v4/top/anime?filter=airing&limit=24');
      } else if (filter === 'bypopularity') {
        window.fetchAnime('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=24');
      } else if (filter === 'movie') {
        window.fetchAnime('https://api.jikan.moe/v4/top/anime?type=movie&limit=24');
      } else if (query) {
        window.searchAnime(query);
      }
    });
  });
});

// Update Spotify Music Display Logic
window.displayMusicResults = function(data) {
  const mGrid = document.getElementById("music-grid");
  const mLoading = document.getElementById("music-loading");
  if(!mGrid) return;
  
  if (mLoading) mLoading.style.display = "none";
  mGrid.innerHTML = "";
  
  if (!data || !data.content || data.content.length === 0) {
    mGrid.innerHTML = "<p style='color:var(--text-dim)'>No tracks found.</p>";
    return;
  }
  
  data.content.forEach(item => {
    const title = item.name || item.title || "Unknown Track";
    const artist = item.artist || (item.author && item.author.name) || "Unknown Artist";
    const videoId = item.videoId || item.id;
    let thumb = item.thumbnail || "";
    if (item.thumbnails && item.thumbnails.length > 0) {
      thumb = item.thumbnails[item.thumbnails.length - 1].url;
    }
    if (!thumb) thumb = "/logo.svg";
    if (!videoId) return;

    const card = document.createElement("div");
    card.className = "spotify-card";
    card.innerHTML = `
      <div class="spotify-card-cover">
        <img src="${thumb}" alt="${title}" loading="lazy">
        <button class="spotify-play-btn" aria-label="Play ${title}">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
      </div>
      <h4>${title}</h4>
      <p>${artist}</p>
    `;
    card.addEventListener('click', () => {
      window.playSpotifyTrack(videoId, title, artist, thumb);
    });
    mGrid.appendChild(card);
  });
};

window.playSpotifyTrack = function(videoId, title, artist, thumb) {
  const mPlayer = document.getElementById('music-player');
  if(mPlayer) mPlayer.style.display = 'flex';
  
  const artEl = document.getElementById('player-art');
  const titleEl = document.getElementById('player-title');
  const artistEl = document.getElementById('player-artist');
  if (artEl) artEl.src = thumb;
  if (titleEl) titleEl.textContent = title;
  if (artistEl) artistEl.textContent = artist;
  
  if (typeof ytPlayer !== 'undefined' && ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    ytPlayer.loadVideoById(videoId);
    const playIcon = document.querySelector("#player-play-pause .icon-play");
    const pauseIcon = document.querySelector("#player-play-pause .icon-pause");
    if (playIcon) playIcon.style.display = "none";
    if (pauseIcon) pauseIcon.style.display = "block";
  }
};

window.searchMusic = async function(query) {
  const mLoading = document.getElementById("music-loading");
  if(mLoading) {
    mLoading.style.display = "block";
    mLoading.textContent = "Loading tracks...";
  }
  try {
    const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
    if(!res.ok) throw new Error("Music fetch failed");
    const data = await res.json();
    if(typeof window.displayMusicResults === 'function') {
      window.displayMusicResults({ content: data });
    }
  } catch(e) {
    console.error(e);
    if(mLoading) {
      mLoading.textContent = "Error loading music. Please try again.";
    }
  }
};
