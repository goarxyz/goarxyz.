import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const playerHtml = `
  <div id="anime-player-modal" class="anime-player-modal" style="display:none;">
    <div class="anime-player-content">
      <button id="anime-player-close" aria-label="Close Player">✕</button>
      
      <div class="anime-player-layout">
        <!-- Video Area -->
        <div class="anime-player-video-section">
          <div class="anime-player-video-wrapper">
            <iframe id="anime-player-iframe" src="" allowfullscreen allow="autoplay; fullscreen"></iframe>
            <div id="anime-player-placeholder" class="anime-player-placeholder" style="display:none;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <p>Stream unavailable for this title.</p>
            </div>
          </div>
          <div class="anime-player-info">
            <h2 id="anime-player-title">Anime Title</h2>
            <p id="anime-player-episode-title">Episode 1</p>
          </div>
        </div>

        <!-- Episodes Sidebar -->
        <div class="anime-player-sidebar">
          <div class="anime-player-sidebar-header">
            <h3>Episodes</h3>
          </div>
          <div id="anime-player-episodes-list" class="anime-player-episodes-list">
            <!-- Episodes injected here -->
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Insert before the closing anime-section tag
html = html.replace('</section>', playerHtml + '\n</section>');

fs.writeFileSync('index.html', html);
console.log('Added anime player modal to index.html');
