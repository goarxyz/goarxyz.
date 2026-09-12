import fs from 'fs';

let js = fs.readFileSync('script.js', 'utf8');

const systemLogic = `
// --- HUB & SYSTEMS LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
  const hubSection = document.getElementById("hub-section");
  const gamesSection = document.getElementById("games");
  const musicSection = document.getElementById("music-section");
  const animeSection = document.getElementById("anime-section");
  const heroSection = document.querySelector('.hero');
  const mainBottomNav = document.getElementById("main-bottom-nav");
  const systemSubNav = document.getElementById("system-sub-nav");
  const sidebar = document.querySelector('.sidebar');
  const bottomNavOld = document.querySelector('.bottom-nav:not(#main-bottom-nav)');

  if (bottomNavOld) bottomNavOld.style.display = 'none'; // hide old bottom nav if exists

  // Initial State from hash or default to Hub
  let currentSystem = 'hub';

  function switchSystem(sys) {
    currentSystem = sys;
    window.location.hash = sys === 'hub' ? '' : sys;

    // Hide all
    if(hubSection) hubSection.style.display = "none";
    if(gamesSection) gamesSection.style.display = "none";
    if(musicSection) musicSection.style.display = "none";
    if(animeSection) animeSection.style.display = "none";
    if(heroSection) heroSection.style.display = "none";
    if(mainBottomNav) mainBottomNav.style.display = "flex";
    if(sidebar) sidebar.style.display = "none";

    // Sub-nav templates
    const gamesSubNav = \`
      <button id="nav-sub-home" class="nav-toggle active">Home</button>
      <button id="nav-sub-categories" class="nav-toggle">Categories</button>
      <button id="nav-sub-favorites" class="nav-toggle">Favorites</button>
    \`;
    const musicSubNav = \`<button class="nav-toggle active">Discover</button>\`;
    const animeSubNav = \`<button class="nav-toggle active">Trending</button>\`;

    // Update bottom nav active state
    document.querySelectorAll('#main-bottom-nav .bottom-nav-item').forEach(el => el.classList.remove('is-active'));

    if (sys === 'games') {
      if(gamesSection) gamesSection.style.display = "block";
      if(heroSection) heroSection.style.display = "block";
      if(sidebar && window.innerWidth > 768) sidebar.style.display = "flex";
      document.getElementById("sys-btn-games")?.classList.add('is-active');
      if(systemSubNav) {
        systemSubNav.innerHTML = gamesSubNav;
        setupGamesSubNav();
      }
    } else if (sys === 'music') {
      if(musicSection) musicSection.style.display = "block";
      document.getElementById("sys-btn-music")?.classList.add('is-active');
      if(systemSubNav) systemSubNav.innerHTML = musicSubNav;
      
      const mGrid = document.getElementById("music-grid");
      if (mGrid && mGrid.children.length === 0 && typeof searchMusic === 'function') searchMusic('lofi hip hop');
    } else if (sys === 'anime') {
      if(animeSection) animeSection.style.display = "block";
      document.getElementById("sys-btn-anime")?.classList.add('is-active');
      if(systemSubNav) systemSubNav.innerHTML = animeSubNav;
      
      const aGrid = document.getElementById("anime-grid");
      if (aGrid && aGrid.children.length === 0) loadTopAnime();
    } else {
      // Hub
      if(hubSection) hubSection.style.display = "flex";
      if(mainBottomNav) mainBottomNav.style.display = "none";
      if(systemSubNav) systemSubNav.innerHTML = "";
    }
  }

  // Handle Hub clicks
  document.querySelectorAll('.hub-card').forEach(card => {
    card.addEventListener('click', () => {
      switchSystem(card.dataset.sys);
    });
  });

  // Handle Bottom Nav clicks
  document.querySelectorAll('#main-bottom-nav .bottom-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sys = item.getAttribute('href').replace('#', '').replace('/', '');
      switchSystem(sys);
    });
  });

  function setupGamesSubNav() {
    const btnHome = document.getElementById("nav-sub-home");
    const btnCat = document.getElementById("nav-sub-categories");
    const btnFav = document.getElementById("nav-sub-favorites");
    
    // Quick routing mapping to existing functions
    btnHome?.addEventListener('click', () => {
      window.location.href = "/#games";
    });
    btnCat?.addEventListener('click', () => {
      window.location.href = "/category/action/#games";
    });
    btnFav?.addEventListener('click', () => {
      // trigger existing applyFilter logic
      document.querySelectorAll('#system-sub-nav .nav-toggle').forEach(b=>b.classList.remove('active'));
      btnFav.classList.add('active');
      if (typeof applyFilter === 'function') applyFilter('favorites', 'nav');
    });
  }

  // Initial Check
  let hash = window.location.hash.replace('#', '');
  if (['games', 'music', 'anime'].includes(hash)) {
    switchSystem(hash);
  } else if (window.location.pathname !== '/') {
    // if we are on a game page, default to games system
    switchSystem('games');
  } else {
    switchSystem('hub');
  }

  // ANIME API LOGIC
  const animeSearchInput = document.getElementById("anime-search-input");
  let animeSearchTimeout = null;
  animeSearchInput?.addEventListener("input", (e) => {
    clearTimeout(animeSearchTimeout);
    animeSearchTimeout = setTimeout(() => {
      const q = e.target.value.trim();
      if (q) searchAnime(q);
      else loadTopAnime();
    }, 500);
  });

  async function loadTopAnime() {
    fetchAnime('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=24');
  }

  async function searchAnime(query) {
    fetchAnime(\`https://api.jikan.moe/v4/anime?q=\${encodeURIComponent(query)}&limit=24\`);
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
        card.innerHTML = \`
          <div class="anime-score"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>\${item.score || 'N/A'}</div>
          <img src="\${item.images.webp.large_image_url || item.images.jpg.image_url}" alt="\${item.title}">
          <h3>\${item.title}</h3>
          <p>\${item.year ? item.year + ' • ' : ''}\${item.episodes ? item.episodes + ' eps' : 'Ongoing'}</p>
        \`;
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
    
    aModalBody.innerHTML = \`
      <div class="anime-modal-body">
        <img src="\${item.images.webp.large_image_url || item.images.jpg.image_url}" class="anime-modal-img" alt="\${item.title}">
        <div class="anime-modal-info">
          <h2>\${item.title}</h2>
          <div class="anime-meta">
            <span>Score: \${item.score || 'N/A'}</span>
            <span>Status: \${item.status}</span>
            <span>Episodes: \${item.episodes || '?' }</span>
            <span>Rating: \${item.rating || 'None'}</span>
          </div>
          <p>\${item.synopsis || 'No synopsis available.'}</p>
          <a href="\${item.url}" target="_blank" style="display:inline-block;background:var(--brand-orange);color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">View on MyAnimeList</a>
        </div>
      </div>
    \`;
  }
});
`;

// Remove the old music player toggle logic from script.js
// It's the block starting with `// --- Music Player Logic ---` down to `// YouTube Iframe API setup`
const startIdx = js.indexOf('// --- Music Player Logic ---');
if (startIdx !== -1) {
  // Let's find the start of YouTube Iframe API setup
  const endIdx = js.indexOf('// YouTube Iframe API setup', startIdx);
  if (endIdx !== -1) {
    js = js.slice(0, startIdx) + systemLogic + '\n' + js.slice(endIdx);
  } else {
    js = js + '\n' + systemLogic;
  }
} else {
    // just append it
    js = js + '\n' + systemLogic;
}

fs.writeFileSync('script.js', js);
console.log('Updated script.js');
