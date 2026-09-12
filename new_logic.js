import fs from 'fs';

let script = fs.readFileSync('script.js', 'utf8');

// I will append a new global controller block that rebinds event listeners for sys buttons
const newLogic = `
// --- NEW ARCHITECTURE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const views = {
    hub: document.getElementById('hub-section'),
    games: document.getElementById('games-section'),
    music: document.getElementById('music-section'),
    anime: document.getElementById('anime-section')
  };
  
  const bottomNav = document.getElementById('main-bottom-nav');
  const globalHeader = document.querySelector('.header');
  
  if (globalHeader) globalHeader.style.display = 'none';

  function switchSystem(sys) {
    // Hide all
    Object.values(views).forEach(v => {
      if(v) {
        v.classList.remove('is-active');
        v.style.display = 'none'; // Force hide
      }
    });
    
    // Reset nav
    document.querySelectorAll('#main-bottom-nav .bottom-nav-item').forEach(el => el.classList.remove('is-active'));
    
    if (sys === 'hub') {
      if(views.hub) { views.hub.classList.add('is-active'); views.hub.style.display = 'flex'; }
      if(bottomNav) bottomNav.style.display = 'none';
    } else {
      if(views[sys]) { views[sys].classList.add('is-active'); views[sys].style.display = 'flex'; }
      if(bottomNav) bottomNav.style.display = 'flex';
      
      const btn = document.getElementById('sys-btn-' + sys);
      if(btn) btn.classList.add('is-active');
      
      // Initialize systems on load
      if (sys === 'music') {
        const mGrid = document.getElementById("music-grid");
        if (mGrid && mGrid.children.length === 0 && typeof searchMusic === 'function') searchMusic('trending playlist');
      } else if (sys === 'anime') {
        const aGrid = document.getElementById("anime-grid");
        if (aGrid && aGrid.children.length === 0 && typeof loadTopAnime === 'function') loadTopAnime();
      }
    }
  }

  // Hub Buttons
  document.querySelectorAll('.hub-card').forEach(card => {
    card.addEventListener('click', () => {
      const sys = card.getAttribute('data-sys');
      switchSystem(sys);
    });
  });

  // Bottom Nav
  document.querySelectorAll('#main-bottom-nav .bottom-nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sys = btn.id.replace('sys-btn-', '');
      switchSystem(sys);
    });
  });

  // Start in Hub
  switchSystem('hub');
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
    // YTMusic API format
    const title = item.name || item.title || "Unknown";
    const artist = (item.artist && item.artist.name) || (item.author && item.author.name) || "Unknown Artist";
    const videoId = item.videoId;
    let thumb = "";
    if (item.thumbnails && item.thumbnails.length > 0) {
      thumb = item.thumbnails[item.thumbnails.length - 1].url;
    }
    
    if (!videoId) return;

    const card = document.createElement("div");
    card.className = "spotify-card";
    card.innerHTML = \`
      <img src="\${thumb}" alt="\${title}">
      <h4>\${title}</h4>
      <p>\${artist}</p>
    \`;
    card.addEventListener('click', () => {
      playSpotifyTrack(videoId, title, artist, thumb);
    });
    mGrid.appendChild(card);
  });
};

function playSpotifyTrack(videoId, title, artist, thumb) {
  const mPlayer = document.getElementById('music-player');
  if(mPlayer) mPlayer.style.display = 'flex';
  
  document.getElementById('player-art').src = thumb;
  document.getElementById('player-title').textContent = title;
  document.getElementById('player-artist').textContent = artist;
  
  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    ytPlayer.loadVideoById(videoId);
    document.querySelector("#player-play-pause .icon-play").style.display = "none";
    document.querySelector("#player-play-pause .icon-pause").style.display = "block";
    isPlaying = true;
  }
}

`;

fs.writeFileSync('script.js', script + '\n' + newLogic);
console.log("Appended new logic");
