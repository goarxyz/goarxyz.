import fs from 'fs';

let js = fs.readFileSync('script.js', 'utf8');

// Find where // --- NEW ARCHITECTURE LOGIC --- starts
const marker = "// --- NEW ARCHITECTURE LOGIC ---";
const idx = js.indexOf(marker);

if (idx === -1) {
  console.error("Marker not found in script.js");
  process.exit(1);
}

const baseJs = js.substring(0, idx);

const newArchitecture = `// --- NEW ARCHITECTURE LOGIC ---
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
       slide.innerHTML = \`<img src="\${img}" alt="\${title}" loading="lazy"> <div class="carousel-caption">\${title}</div>\`;
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
    card.innerHTML = \`
      <div class="spotify-card-cover">
        <img src="\${thumb}" alt="\${title}" loading="lazy">
        <button class="spotify-play-btn" aria-label="Play \${title}">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
      </div>
      <h4>\${title}</h4>
      <p>\${artist}</p>
    \`;
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
    const res = await fetch(\`/api/music/search?q=\${encodeURIComponent(query)}\`);
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
`;

fs.writeFileSync('script.js', baseJs + newArchitecture);
console.log('Successfully updated script.js architecture!');
