import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// The games section currently just ends and then has <nav class="bottom-nav">
// We need to close the system-content, system-main, system-layout, system-view for games.
// Then append Music system and Anime system before the main-bottom-nav.

const bottomNavString = '<nav class="bottom-nav" id="main-bottom-nav" style="display:none;">';
const splitIdx = html.indexOf(bottomNavString);

if (splitIdx !== -1) {
  const musicAndAnimeHtml = `
        </div> <!-- End system-content for games -->
      </main> <!-- End system-main for games -->
    </div> <!-- End system-layout for games -->
  </div> <!-- End games-section -->

  <!-- MUSIC SYSTEM -->
  <div id="music-section" class="system-view">
    <div class="system-layout music-layout">
      <aside class="system-sidebar">
        <div class="system-brand">
          <img src="logo.png" alt="goarxyz Music">
          <h2>goar<span style="color:var(--brand-orange)">xyz</span> Music</h2>
        </div>
        <nav class="system-nav">
          <a href="#" class="nav-item is-active" id="btn-music-home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg> Home
          </a>
          <a href="#" class="nav-item" id="btn-music-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Search
          </a>
        </nav>
      </aside>
      <main class="system-main">
        <header class="system-header">
          <div class="system-search">
             <input type="text" id="music-search-input" placeholder="What do you want to listen to?">
          </div>
        </header>
        <div class="system-content music-content">
          <div id="music-loading" style="display:none; text-align:center; padding:40px; color:var(--text-dim);">Loading tracks...</div>
          <div id="music-grid" class="spotify-grid"></div>
        </div>
      </main>
    </div>
    <!-- Music Player Bottom Bar -->
    <div id="music-player" class="music-player-bar" style="display:none;">
      <div class="music-player-left">
        <img id="player-art" src="" alt="Album Art">
        <div class="music-player-info">
          <div id="player-title">Title</div>
          <div id="player-artist">Artist</div>
        </div>
      </div>
      <div class="music-player-center">
        <button id="player-play-pause" class="btn-play-pause">
          <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        </button>
        <div class="player-progress-container">
          <span id="player-time-current">0:00</span>
          <div id="player-progress-wrap" class="progress-wrap">
            <div id="player-progress-fill" class="progress-fill"></div>
          </div>
          <span id="player-time-total">0:00</span>
        </div>
      </div>
      <div class="music-player-right">
        <!-- Volume / YT Container -->
        <div id="yt-player-container"></div>
      </div>
    </div>
  </div> <!-- End music-section -->

  <!-- ANIME SYSTEM -->
  <div id="anime-section" class="system-view">
    <div class="system-layout anime-layout">
      <aside class="system-sidebar">
        <div class="system-brand">
          <img src="logo.png" alt="goarxyz Anime">
          <h2>goar<span style="color:var(--brand-orange)">xyz</span> Anime</h2>
        </div>
        <nav class="system-nav">
          <a href="#" class="nav-item is-active" id="btn-anime-home">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg> Discover
          </a>
        </nav>
      </aside>
      <main class="system-main">
        <header class="system-header">
          <div class="system-search">
             <input type="text" id="anime-search-input" placeholder="Search anime...">
          </div>
        </header>
        <div class="system-content anime-content">
          <div id="anime-loading" style="display:none; text-align:center; padding:40px; color:var(--text-dim);">Loading anime...</div>
          <div id="anime-grid" class="kitsune-grid"></div>
        </div>
      </main>
    </div>
    
    <div id="anime-modal" class="anime-modal" style="display:none;">
      <div class="anime-modal-content">
        <button id="anime-modal-close">✕</button>
        <div id="anime-modal-body"></div>
      </div>
    </div>
    
    <div id="anime-player-modal" class="anime-player-modal" style="display:none;">
      <div class="anime-player-content">
        <button id="anime-player-close" aria-label="Close Player">✕</button>
        <div class="anime-player-layout">
          <div class="anime-player-video-section">
            <div class="anime-player-video-wrapper">
              <iframe id="anime-player-iframe" src="" allowfullscreen allow="autoplay; fullscreen"></iframe>
              <div id="anime-player-placeholder" class="anime-player-placeholder" style="display:none;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
                <p>Stream unavailable for this title.</p>
              </div>
            </div>
            <div class="anime-player-info">
              <h2 id="anime-player-title">Anime Title</h2>
              <p id="anime-player-episode-title">Episode 1</p>
            </div>
          </div>
          <div class="anime-player-sidebar">
            <div class="anime-player-sidebar-header">
              <h3>Episodes</h3>
            </div>
            <div id="anime-player-episodes-list" class="anime-player-episodes-list"></div>
          </div>
        </div>
      </div>
    </div>
  </div> <!-- End anime-section -->

  `;
  
  html = html.substring(0, splitIdx) + musicAndAnimeHtml + bottomNavString + html.substring(splitIdx + bottomNavString.length);
  fs.writeFileSync('index.html', html);
  console.log("Appended music and anime systems");
} else {
  console.log("Could not find bottom nav string");
}
