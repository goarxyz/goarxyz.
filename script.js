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

    link?.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = card.dataset.search ? card.dataset.search.split(" ")[1] : "Instant Play";
      if (typeof window.openGameTheaterModal === "function") {
        window.openGameTheaterModal(slug, title, cat);
      } else {
        window.location.href = `/game/${slug}/`;
      }
      trackEvent("select_content", { content_type: "game", item_id: slug });
    });

    // Add heart icon to cards dynamically
    const favIcon = document.createElement("button");
    favIcon.className = "game-card__fav-btn";
    favIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
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
        emptyState.innerHTML = `<h3>No favorite games saved yet</h3><p>Click the heart icon on any game card to add it to your personal favorites!</p>`;
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

  const musicNavGenres = [
    { id: 'btn-music-home', query: 'trending hits', title: 'Trending Hits' },
    { id: 'btn-music-pop', query: 'Pop hits top tracks', title: 'Pop' },
    { id: 'btn-music-hiphop', query: 'Hip Hop top hits rap', title: 'Hip-Hop' },
    { id: 'btn-music-rock', query: 'Rock classics alternative', title: 'Rock' },
    { id: 'btn-music-electronic', query: 'Electronic dance edm', title: 'Electronic' },
    { id: 'btn-music-lofi', query: 'lofi chill beats study relax', title: 'Lo-Fi' },
    { id: 'btn-music-rnb', query: 'R&B soul chill vibes', title: 'R&B' },
    { id: 'btn-music-indie', query: 'Indie alternative tracks', title: 'Indie' }
  ];

  musicNavGenres.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#music-section .nav-item').forEach(n => n.classList.remove('is-active'));
        el.classList.add('is-active');
        const titleEl = document.getElementById('music-section-title');
        if (titleEl) titleEl.textContent = `${item.title} Tracks`;
        if (typeof window.searchMusic === 'function') {
          window.searchMusic(item.query);
        }
      });
    }
  });

  // Music Featured Track Buttons
  document.querySelectorAll('.featured-play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query') || 'trending hits';
      if (typeof window.searchMusic === 'function') {
        window.searchMusic(q);
      }
    });
  });

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

  // Anime Sidebar Genre Nav Items
  const animeNavItems = [
    { id: 'btn-anime-home', type: 'filter', val: 'top', title: 'Top Airing' },
    { id: 'btn-anime-top', type: 'filter', val: 'top', title: 'Top Airing' },
    { id: 'btn-anime-popular', type: 'filter', val: 'bypopularity', title: 'Popular' },
    { id: 'btn-anime-action', type: 'query', val: 'Action', title: 'Action' },
    { id: 'btn-anime-adventure', type: 'query', val: 'Adventure', title: 'Adventure' },
    { id: 'btn-anime-scifi', type: 'query', val: 'Sci-Fi', title: 'Sci-Fi' },
    { id: 'btn-anime-fantasy', type: 'query', val: 'Fantasy', title: 'Fantasy' },
    { id: 'btn-anime-movies', type: 'filter', val: 'movie', title: 'Movies' }
  ];

  animeNavItems.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#anime-section .nav-item').forEach(n => n.classList.remove('is-active'));
        el.classList.add('is-active');
        const titleEl = document.getElementById('anime-section-title');
        if (titleEl) titleEl.textContent = `${item.title} Catalog`;
        if (item.type === 'filter') {
          if (item.val === 'top') window.fetchAnime('https://api.jikan.moe/v4/top/anime?filter=airing&limit=24');
          else if (item.val === 'bypopularity') window.fetchAnime('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=24');
          else if (item.val === 'movie') window.fetchAnime('https://api.jikan.moe/v4/top/anime?type=movie&limit=24');
        } else if (item.type === 'query') {
          window.searchAnime(item.val);
        }
      });
    }
  });

  // Anime Featured Premiere Buttons
  document.querySelectorAll('.featured-anime-play').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-anime-title') || 'Jujutsu Kaisen';
      if (typeof window.searchAnime === 'function') {
        window.searchAnime(title);
      }
    });
  });

  // Hub Omni Search Input
  const hubSearch = document.getElementById('hub-omni-search');
  if (hubSearch) {
    hubSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && hubSearch.value.trim() !== '') {
        const query = hubSearch.value.trim();
        switchSystem('games');
        const gamesSearch = document.getElementById('games-search');
        if (gamesSearch) gamesSearch.value = query;
        if (typeof window.applyFilter === 'function') {
          window.applyFilter(query, 'search');
        }
      }
    });
  }

  // Hub Quick Pills
  document.querySelectorAll('.hub-quick-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const sys = pill.getAttribute('data-sys') || 'games';
      const cat = pill.getAttribute('data-cat');
      const genre = pill.getAttribute('data-genre');
      const filter = pill.getAttribute('data-filter');

      switchSystem(sys);

      if (sys === 'games' && cat) {
        const chip = document.querySelector(`#games-category-chips .chip-btn[data-cat="${cat}"]`);
        if (chip) chip.click();
        else if (typeof window.applyFilter === 'function') window.applyFilter('', cat);
      } else if (sys === 'music' && genre) {
        const chip = document.querySelector(`#music-genre-chips .chip-btn[data-query*="${genre}"]`);
        if (chip) chip.click();
        else if (typeof window.searchMusic === 'function') window.searchMusic(genre);
      } else if (sys === 'anime') {
        if (filter) {
          const chip = document.querySelector(`#anime-genre-chips .chip-btn[data-filter="${filter}"]`);
          if (chip) chip.click();
        } else if (genre) {
          const chip = document.querySelector(`#anime-genre-chips .chip-btn[data-query="${genre}"]`);
          if (chip) chip.click();
        }
      }
    });
  });

  // Hub Spotlight Items
  document.querySelectorAll('.hub-spotlight-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-hub-jump');
      const slug = item.getAttribute('data-slug');
      const query = item.getAttribute('data-query');
      const animeTitle = item.getAttribute('data-anime-title');

      if (target === 'game') {
        switchSystem('games');
        if (slug) {
          const gameCard = document.querySelector(`.game-card[data-slug="${slug}"]`);
          if (gameCard) {
            gameCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            gameCard.classList.add('spotlight-flash');
            setTimeout(() => gameCard.classList.remove('spotlight-flash'), 2000);
          }
        }
      } else if (target === 'music') {
        switchSystem('music');
        if (query && typeof window.searchMusic === 'function') {
          window.searchMusic(query);
        }
      } else if (target === 'anime') {
        switchSystem('anime');
        if (animeTitle && typeof window.searchAnime === 'function') {
          window.searchAnime(animeTitle);
        }
      }
    });
  });

  // LEGAL POLICIES AND COOKIE CONSENT ENGINE
  const legalModal = document.getElementById('legal-policy-modal');
  const legalModalBody = document.getElementById('legal-modal-body-content');
  const closeLegalModalBtn = document.getElementById('btn-close-legal-modal');
  const cookiePrefsModal = document.getElementById('cookie-preferences-modal');
  const closeCookiePrefsBtn = document.getElementById('btn-close-cookie-prefs');
  const cookieConsentBar = document.getElementById('cookie-consent-bar');

  const policies = {
    privacy: {
      title: "Privacy Policy",
      content: `
        <h3>goarxyz Privacy Policy</h3>
        <p class="policy-updated">Last updated: September 2026</p>
        <p>At <strong>goarxyz</strong>, your privacy and digital autonomy are fundamental values. This Privacy Policy details how goarxyz manages session telemetry, media preferences, and analytics.</p>
        
        <h4>1. Information We Collect</h4>
        <p>goarxyz is designed as a client-first entertainment platform. We do not require personal registration, account creation, or payment details. Data collected is strictly categorized as:</p>
        <ul>
          <li><strong>Client-Side Local State:</strong> Favorited games, volume levels, recent media, and theme preferences stored directly in your browser's <code>localStorage</code>. This data never leaves your device.</li>
          <li><strong>Aggregated Telemetry:</strong> Anonymized diagnostic signals (load speed, browser runtime, general geographical region) collected via Google Tag Manager to maintain streaming stability and game performance.</li>
          <li><strong>Server Logs:</strong> Transient network requests necessary to deliver media proxies and streaming endpoints, automatically purged.</li>
        </ul>

        <h4>2. Use of Information</h4>
        <p>We use operational data solely to:</p>
        <ul>
          <li>Deliver rapid, uninterrupted gameplay and high-fidelity media playback.</li>
          <li>Ensure multi-server failover for video and audio content.</li>
          <li>Diagnose latency bottlenecks and enhance progressive web app (PWA) caching.</li>
        </ul>

        <h4>3. Zero Data Brokerage</h4>
        <p>goarxyz never sells, leases, or trades user data or browsing activity to third-party data brokers, marketers, or advertisers.</p>

        <h4>4. Your Rights and Controls</h4>
        <p>You may purge your local favorites and playback cache at any time through your browser settings or customize your telemetry preferences in the Cookie Settings panel below.</p>
      `
    },
    terms: {
      title: "Terms of Service",
      content: `
        <h3>goarxyz Terms of Service</h3>
        <p class="policy-updated">Last updated: September 2026</p>
        <p>Welcome to <strong>goarxyz</strong>. By accessing or using the goarxyz entertainment portal, you agree to comply with and be bound by these Terms of Service.</p>

        <h4>1. Platform Usage</h4>
        <p>goarxyz is provided for personal, non-commercial entertainment and informational enjoyment. Users agree not to misuse platform infrastructure, reverse engineer proxy mechanisms, or bypass rate limits.</p>

        <h4>2. Content and Catalog Indexing</h4>
        <p>goarxyz aggregates, curates, and interfaces with publicly accessible digital media streams and open web game engines. All respective game assets, audio compositions, and video productions remain the intellectual property of their original creators.</p>

        <h4>3. Disclaimer of Warranties</h4>
        <p>The platform is provided on an "AS IS" and "AS AVAILABLE" basis. While goarxyz implements rigorous multi-server redundancy, we make no express warranties regarding uninterrupted uptime or third-party host availability.</p>

        <h4>4. Modifications to Terms</h4>
        <p>goarxyz reserves the right to revise these terms periodically to reflect compliance updates and feature expansions. Continued usage of goarxyz constitutes acceptance of updated terms.</p>
      `
    },
    cookies: {
      title: "Cookie &amp; Storage Policy",
      content: `
        <h3>goarxyz Cookie Policy</h3>
        <p class="policy-updated">Last updated: September 2026</p>
        <p>This Cookie Policy explains how <strong>goarxyz</strong> utilizes cookies, browser web storage (<code>localStorage</code>), and Google Tag Manager (GTM) telemetry.</p>

        <h4>1. What are Cookies and Local Storage?</h4>
        <p>Cookies and local web storage are small data files placed on your browser or device that permit web applications to remember your state across visits and sessions.</p>

        <h4>2. Categories of Storage We Use</h4>
        <ul>
          <li><strong>Essential Storage:</strong> Required for the core operation of goarxyz. Stores your favorited titles, recent play histories, and PWA offline assets.</li>
          <li><strong>Performance &amp; Telemetry (GTM):</strong> With your consent, we deploy Google Tag Manager to collect anonymous performance telemetry (playback initialization latency, failed stream failovers, and page performance).</li>
          <li><strong>Functional Preferences:</strong> Remembers your preferred video servers, player volume, and active genre filters.</li>
        </ul>

        <h4>3. Managing Your Choices</h4>
        <p>You have full control over your telemetry preferences. You can adjust your consent anytime using the "Cookie Settings" button in the footer.</p>
      `
    }
  };

  const openLegalModal = (policyKey) => {
    if (!policies[policyKey] || !legalModal || !legalModalBody) return;
    legalModalBody.innerHTML = policies[policyKey].content;
    legalModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const closeLegalModal = () => {
    if (legalModal) legalModal.style.display = 'none';
    document.body.style.overflow = '';
  };

  document.getElementById('btn-open-privacy')?.addEventListener('click', (e) => { e.preventDefault(); openLegalModal('privacy'); });
  document.getElementById('btn-open-terms')?.addEventListener('click', (e) => { e.preventDefault(); openLegalModal('terms'); });
  document.getElementById('btn-open-cookies')?.addEventListener('click', (e) => { e.preventDefault(); openLegalModal('cookies'); });
  document.getElementById('link-bar-cookie-policy')?.addEventListener('click', (e) => { e.preventDefault(); openLegalModal('cookies'); });
  closeLegalModalBtn?.addEventListener('click', closeLegalModal);
  legalModal?.addEventListener('click', (e) => { if (e.target === legalModal) closeLegalModal(); });

  // GOOGLE CONSENT MODE V2 & CMP CONTROLLER
  const GOOGLE_CONSENT_KEY = 'goarxyz_google_consent_v2';
  
  // Persistent Customer ID & Session tracking (BigQuery / CDP standard)
  const getCustomerIds = () => {
    let pseudoId = localStorage.getItem('goarxyz_customer_uid');
    if (!pseudoId) {
      pseudoId = 'cuid_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      try { localStorage.setItem('goarxyz_customer_uid', pseudoId); } catch(e) {}
    }
    let sessId = sessionStorage.getItem('goarxyz_sess_id');
    if (!sessId) {
      sessId = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      try { sessionStorage.setItem('goarxyz_sess_id', sessId); } catch(e) {}
    }
    return { pseudoId, sessId };
  };

  const getGoogleConsent = () => {
    try { return JSON.parse(localStorage.getItem(GOOGLE_CONSENT_KEY)); } catch { return null; }
  };

  const applyGoogleConsent = (consentObj) => {
    try { localStorage.setItem(GOOGLE_CONSENT_KEY, JSON.stringify(consentObj)); } catch (e) {}

    // Dispatch official Google Consent Mode v2 signals
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'ad_storage': consentObj.ad_storage,
        'ad_user_data': consentObj.ad_user_data,
        'ad_personalization': consentObj.ad_personalization,
        'analytics_storage': consentObj.analytics_storage,
        'personalization_storage': consentObj.personalization_storage,
        'functionality_storage': 'granted',
        'security_storage': 'granted'
      });
    }

    // Push standard GTM consent event to dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'consent_update',
      consent_status: consentObj.status,
      consent_timestamp: consentObj.timestamp
    });

    // Log consent change to customer database telemetry
    trackEvent('user_consent_decision', {
      consent_status: consentObj.status,
      analytics: consentObj.analytics_storage,
      ads: consentObj.ad_storage,
      personalization: consentObj.personalization_storage
    });
  };

  const openCookiePrefs = () => {
    const current = getGoogleConsent() || {
      analytics_storage: 'granted',
      personalization_storage: 'granted',
      ad_storage: 'granted'
    };
    const aToggle = document.getElementById('pref-analytics-toggle');
    const pToggle = document.getElementById('pref-personalization-toggle');
    const adToggle = document.getElementById('pref-ads-toggle');
    if (aToggle) aToggle.checked = current.analytics_storage === 'granted';
    if (pToggle) pToggle.checked = current.personalization_storage === 'granted';
    if (adToggle) adToggle.checked = current.ad_storage === 'granted';
    if (cookiePrefsModal) cookiePrefsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const closeCookiePrefs = () => {
    if (cookiePrefsModal) cookiePrefsModal.style.display = 'none';
    document.body.style.overflow = '';
  };

  document.getElementById('btn-open-consent-settings')?.addEventListener('click', (e) => { e.preventDefault(); openCookiePrefs(); });
  document.getElementById('cookie-manage-prefs')?.addEventListener('click', openCookiePrefs);
  closeCookiePrefsBtn?.addEventListener('click', closeCookiePrefs);
  cookiePrefsModal?.addEventListener('click', (e) => { if (e.target === cookiePrefsModal) closeCookiePrefs(); });

  // Accept All Action (Google Standard)
  const handleAcceptAll = () => {
    applyGoogleConsent({
      status: 'all',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
      personalization_storage: 'granted',
      timestamp: Date.now()
    });
    if (cookieConsentBar) cookieConsentBar.style.display = 'none';
    closeCookiePrefs();
  };

  // Reject All Action (Google Standard)
  const handleRejectAll = () => {
    applyGoogleConsent({
      status: 'essential_only',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      personalization_storage: 'denied',
      timestamp: Date.now()
    });
    if (cookieConsentBar) cookieConsentBar.style.display = 'none';
    closeCookiePrefs();
  };

  document.getElementById('cookie-accept-all')?.addEventListener('click', handleAcceptAll);
  document.getElementById('cookie-dialog-accept-all')?.addEventListener('click', handleAcceptAll);

  document.getElementById('cookie-reject-all')?.addEventListener('click', handleRejectAll);
  document.getElementById('cookie-dialog-reject-all')?.addEventListener('click', handleRejectAll);

  // Confirm Granular Choices from Dialog
  document.getElementById('btn-save-cookie-prefs')?.addEventListener('click', () => {
    const aToggle = document.getElementById('pref-analytics-toggle');
    const pToggle = document.getElementById('pref-personalization-toggle');
    const adToggle = document.getElementById('pref-ads-toggle');

    const allowAnalytics = aToggle ? aToggle.checked : false;
    const allowPersonalization = pToggle ? pToggle.checked : false;
    const allowAds = adToggle ? adToggle.checked : false;

    applyGoogleConsent({
      status: 'custom',
      ad_storage: allowAds ? 'granted' : 'denied',
      ad_user_data: allowAds ? 'granted' : 'denied',
      ad_personalization: allowAds ? 'granted' : 'denied',
      analytics_storage: allowAnalytics ? 'granted' : 'denied',
      personalization_storage: allowPersonalization ? 'granted' : 'denied',
      timestamp: Date.now()
    });
    closeCookiePrefs();
    if (cookieConsentBar) cookieConsentBar.style.display = 'none';
  });

  // Footer / Banner Policy Links
  document.getElementById('link-bar-privacy-policy')?.addEventListener('click', (e) => { e.preventDefault(); openLegalModal('privacy'); });
  document.getElementById('link-bar-cookie-policy')?.addEventListener('click', (e) => { e.preventDefault(); openLegalModal('cookies'); });

  // Show Google CMP Banner if user has not yet consented
  const existingGoogleConsent = getGoogleConsent();
  if (!existingGoogleConsent && cookieConsentBar) {
    setTimeout(() => {
      cookieConsentBar.style.display = 'block';
    }, 700);
  }

  // ENTERPRISE TELEMETRY PIPELINE (Google Tag Manager + First-Party Customer Database)
  window.trackEvent = function(eventName, eventParams = {}) {
    const consent = getGoogleConsent();
    const isAnalyticsGranted = !consent || consent.analytics_storage === 'granted';

    // 1. Google Tag Manager / GA4 DataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      brand: 'goarxyz',
      ...eventParams
    });

    // 2. First-Party Customer Database Telemetry Pipeline (/api/analytics/collect)
    const { pseudoId, sessId } = getCustomerIds();
    const payload = {
      eventName,
      userPseudoId: pseudoId,
      sessionId: sessId,
      consentGranted: isAnalyticsGranted,
      page: window.location.pathname + window.location.hash,
      properties: eventParams
    };

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/collect', blob);
      } else {
        fetch('/api/analytics/collect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      }
    } catch(e) {}
  };
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

/* ==========================================================================
   goarxyz In-App Game Theater Iframe Modal Controller
   ========================================================================== */
let activeGameSession = null;

window.openGameTheaterModal = function(slug, title, category = "Instant Play") {
  const modal = document.getElementById("goarxyz-game-modal");
  const iframe = document.getElementById("goarxyz-inapp-game-frame");
  const loader = document.getElementById("game-modal-loader");
  const titleEl = document.getElementById("game-modal-title");
  const badgeEl = document.getElementById("game-modal-badge");
  const favBtn = document.getElementById("btn-game-modal-fav");

  if (!modal || !iframe) return;

  if (titleEl) titleEl.textContent = title || slug;
  if (badgeEl) badgeEl.textContent = category.toUpperCase();

  activeGameSession = {
    slug,
    title,
    category,
    startTime: Date.now()
  };

  // Update favorite status on the modal button
  const isFav = (typeof getFavorites === 'function' && getFavorites().includes(slug));
  if (favBtn) {
    favBtn.classList.toggle("is-active", isFav);
    const span = favBtn.querySelector("span");
    if (span) span.textContent = isFav ? "Favorited" : "Favorite";
  }

  // Show loader and set iframe URL
  if (loader) loader.classList.remove("is-hidden");
  iframe.onload = () => {
    if (loader) loader.classList.add("is-hidden");
  };
  iframe.src = `https://play.famobi.com/${slug}/?customer=A1000`;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Dispatch telemetry
  if (typeof window.trackEvent === 'function') {
    window.trackEvent("inapp_game_start", {
      item_id: slug,
      item_name: title,
      content_type: "game",
      category: category
    });
  }
};

window.closeGameTheaterModal = function() {
  const modal = document.getElementById("goarxyz-game-modal");
  const iframe = document.getElementById("goarxyz-inapp-game-frame");
  if (!modal) return;

  if (activeGameSession && typeof window.trackEvent === 'function') {
    const durationSeconds = Math.round((Date.now() - activeGameSession.startTime) / 1000);
    window.trackEvent("inapp_game_complete", {
      item_id: activeGameSession.slug,
      item_name: activeGameSession.title,
      duration_seconds: durationSeconds
    });
  }

  activeGameSession = null;
  if (iframe) iframe.src = "about:blank";
  modal.style.display = "none";
  document.body.style.overflow = "";
};

// Wire modal buttons
document.getElementById("btn-game-modal-close")?.addEventListener("click", window.closeGameTheaterModal);
document.getElementById("game-modal-backdrop")?.addEventListener("click", window.closeGameTheaterModal);

document.getElementById("btn-game-modal-reload")?.addEventListener("click", () => {
  const iframe = document.getElementById("goarxyz-inapp-game-frame");
  const loader = document.getElementById("game-modal-loader");
  if (iframe && iframe.src && iframe.src !== "about:blank") {
    if (loader) loader.classList.remove("is-hidden");
    iframe.src = iframe.src;
  }
});

document.getElementById("btn-game-modal-fullscreen")?.addEventListener("click", () => {
  const frameWrap = document.getElementById("game-modal-frame-wrap");
  if (!frameWrap) return;
  if (!document.fullscreenElement) {
    frameWrap.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
});

document.getElementById("btn-game-modal-fav")?.addEventListener("click", (e) => {
  e.preventDefault();
  if (!activeGameSession || typeof getFavorites !== 'function' || typeof saveFavorites !== 'function') return;
  const favs = getFavorites();
  const slug = activeGameSession.slug;
  const idx = favs.indexOf(slug);
  const favBtn = document.getElementById("btn-game-modal-fav");
  if (idx > -1) {
    favs.splice(idx, 1);
    favBtn?.classList.remove("is-active");
    if (favBtn?.querySelector("span")) favBtn.querySelector("span").textContent = "Favorite";
    window.trackEvent?.("remove_from_favorites", { item_id: slug });
  } else {
    favs.push(slug);
    favBtn?.classList.add("is-active");
    if (favBtn?.querySelector("span")) favBtn.querySelector("span").textContent = "Favorited";
    window.trackEvent?.("add_to_favorites", { item_id: slug });
  }
  saveFavorites(favs);
});

// Close game modal on Escape
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const gameModal = document.getElementById("goarxyz-game-modal");
    if (gameModal && gameModal.style.display !== "none") {
      window.closeGameTheaterModal();
    }
    const settingsModal = document.getElementById("platform-settings-modal");
    if (settingsModal && settingsModal.style.display !== "none") {
      window.closePlatformSettingsModal?.();
    }
  }
});

/* ==========================================================================
   Hub Live Media Showcase Video Controller
   ========================================================================== */
function initMediaShowcase() {
  const clips = [
    { videoId: "clip-game-video", playBtnId: "btn-play-game-clip", soundBtnId: "btn-sound-game-clip", type: "game" },
    { videoId: "clip-music-video", playBtnId: "btn-play-music-clip", soundBtnId: "btn-sound-music-clip", type: "music" },
    { videoId: "clip-anime-video", playBtnId: "btn-play-anime-clip", soundBtnId: "btn-sound-anime-clip", type: "anime" }
  ];

  const updatePlayBtnIcon = (btn, isPlaying) => {
    if (!btn) return;
    if (isPlaying) {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
      btn.setAttribute("aria-label", "Pause video preview");
    } else {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      btn.setAttribute("aria-label", "Play video preview");
    }
  };

  const updateSoundBtnIcon = (btn, isMuted) => {
    if (!btn) return;
    if (isMuted) {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
      btn.title = "Unmute audio";
    } else {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
      btn.title = "Mute audio";
    }
  };

  clips.forEach(({ videoId, playBtnId, soundBtnId, type }) => {
    const video = document.getElementById(videoId);
    const playBtn = document.getElementById(playBtnId);
    const soundBtn = document.getElementById(soundBtnId);

    if (!video) return;

    playBtn?.addEventListener("click", () => {
      if (video.paused) {
        // Pause all other showcase videos
        clips.forEach(other => {
          if (other.videoId !== videoId) {
            const ov = document.getElementById(other.videoId);
            const ob = document.getElementById(other.playBtnId);
            if (ov && !ov.paused) {
              ov.pause();
              updatePlayBtnIcon(ob, false);
            }
          }
        });

        video.play().then(() => {
          updatePlayBtnIcon(playBtn, true);
          window.trackEvent?.("showcase_clip_play", { clip_type: type });
        }).catch(() => {});
      } else {
        video.pause();
        updatePlayBtnIcon(playBtn, false);
      }
    });

    soundBtn?.addEventListener("click", () => {
      video.muted = !video.muted;
      updateSoundBtnIcon(soundBtn, video.muted);
    });

    video.addEventListener("play", () => updatePlayBtnIcon(playBtn, true));
    video.addEventListener("pause", () => updatePlayBtnIcon(playBtn, false));
  });

  // Wire CTA buttons to switch system views
  document.getElementById("btn-showcase-games")?.addEventListener("click", () => {
    if (typeof window.switchSystem === "function") {
      window.switchSystem("games");
    } else {
      window.location.hash = "#games";
    }
  });

  document.getElementById("btn-showcase-music")?.addEventListener("click", () => {
    if (typeof window.switchSystem === "function") {
      window.switchSystem("music");
    } else {
      window.location.hash = "#music";
    }
  });

  document.getElementById("btn-showcase-anime")?.addEventListener("click", () => {
    if (typeof window.switchSystem === "function") {
      window.switchSystem("anime");
    } else {
      window.location.hash = "#anime";
    }
  });
}

/* ==========================================================================
   Platform Settings & Customer Insights Diagnostics Controller
   ========================================================================== */
window.openPlatformSettingsModal = async function() {
  const modal = document.getElementById("platform-settings-modal");
  if (!modal) return;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Load customer pseudo-ID
  let pseudoId = "cuid_anon";
  try {
    pseudoId = localStorage.getItem("goarxyz_customer_uid") || (typeof getCustomerIds === "function" ? getCustomerIds().pseudoId : "cuid_anon");
  } catch(e) {}

  const idEl = document.getElementById("diag-customer-id");
  if (idEl) idEl.textContent = pseudoId.length > 18 ? pseudoId.substring(0, 18) + "..." : pseudoId;

  // Fetch real-time live customer insights
  try {
    const res = await fetch("/api/analytics/customer-insights");
    if (res.ok) {
      const data = await res.json();
      const statusEl = document.getElementById("diag-visitor-status");
      const channelEl = document.getElementById("diag-traffic-channel");
      const affinityEl = document.getElementById("diag-top-affinity");

      if (statusEl) {
        statusEl.textContent = `${data.returningVisitors > 0 ? "Returning Visitor" : "Active New Visitor"} (${data.totalVisitsRecorded || 1} visits)`;
      }
      if (channelEl) {
        const topChannel = Object.entries(data.trafficChannels || {}).sort((a, b) => b[1] - a[1])[0];
        channelEl.textContent = topChannel ? `${topChannel[0]} (${topChannel[1]})` : "Direct / Organic";
      }
      if (affinityEl) {
        const topCat = Object.entries(data.categoryAffinity || {}).sort((a, b) => b[1] - a[1])[0];
        affinityEl.textContent = topCat ? `${topCat[0]} (${topCat[1]} events)` : "Games & Music";
      }
    }
  } catch(e) {
    console.warn("Could not load customer insights", e);
  }

  window.trackEvent?.("open_platform_settings", { pseudoId });
};

window.closePlatformSettingsModal = function() {
  const modal = document.getElementById("platform-settings-modal");
  if (!modal) return;
  modal.style.display = "none";
  document.body.style.overflow = "";
};

// Wire settings buttons
document.getElementById("btn-close-settings-modal")?.addEventListener("click", window.closePlatformSettingsModal);
document.getElementById("platform-settings-modal")?.addEventListener("click", (e) => {
  if (e.target.id === "platform-settings-modal") {
    window.closePlatformSettingsModal();
  }
});

document.getElementById("btn-open-platform-settings")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.openPlatformSettingsModal();
});

document.getElementById("btn-settings-open-cmp")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.closePlatformSettingsModal();
  const cmpModal = document.getElementById("cookie-preferences-modal");
  if (cmpModal) {
    cmpModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
});

document.getElementById("btn-copy-customer-id")?.addEventListener("click", () => {
  try {
    const pseudoId = localStorage.getItem("goarxyz_customer_uid") || "cuid_anon";
    navigator.clipboard.writeText(pseudoId);
    const btn = document.getElementById("btn-copy-customer-id");
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = orig; }, 1500);
    }
  } catch(e) {}
});

document.getElementById("btn-clear-game-cache")?.addEventListener("click", async () => {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const k of keys) await caches.delete(k);
    }
    const btn = document.getElementById("btn-clear-game-cache");
    if (btn) {
      btn.textContent = "Cache Cleared!";
      setTimeout(() => { btn.textContent = "Clear Cache"; }, 1500);
    }
  } catch(e) {}
});

document.getElementById("btn-reset-favorites")?.addEventListener("click", () => {
  if (confirm("Reset all saved favorites for games, music, and anime on goarxyz?")) {
    try {
      localStorage.removeItem("goarxyz_favorites");
      localStorage.removeItem("favoriteGames");
    } catch(e) {}
    const btn = document.getElementById("btn-reset-favorites");
    if (btn) {
      btn.textContent = "Reset Done!";
      setTimeout(() => { btn.textContent = "Reset Favorites"; }, 1500);
    }
  }
});

// Initialize on DOMContentLoaded or immediately if ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMediaShowcase);
} else {
  initMediaShowcase();
}
