import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace nav-toggles
html = html.replace(/<div class="nav-toggles"[^>]*>[\s\S]*?<\/div><\/div>/, `<div class="nav-toggles" id="system-sub-nav"></div></div>`);

// 2. Add hub section right after <div class="app-container">
const hubHtml = `
<div id="hub-section" class="hub-section">
  <div class="hub-inner">
    <div class="hub-hero">
      <div class="brand__logo-wrap hub-logo">
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <path d="M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256" fill="none" stroke="#f7f6f2" stroke-width="85" stroke-linecap="square" stroke-linejoin="miter"></path>
          <polygon points="280,200 280,312 180,256" fill="#ff6600"></polygon>
        </svg>
      </div>
      <h1>goar<span style="color:#ff6600;">xyz</span></h1>
      <p>The Ultimate Entertainment Hub</p>
    </div>
    <div class="hub-cards">
      <div class="hub-card" data-sys="games">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><path d="M15 13h.01"></path><path d="M18 11h.01"></path></svg>
        <h3>Games</h3>
        <p>630+ Instant Web Games</p>
      </div>
      <div class="hub-card" data-sys="music">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
        <h3>Music</h3>
        <p>Ad-Free Global Streaming</p>
      </div>
      <div class="hub-card" data-sys="anime">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
        <h3>Anime</h3>
        <p>Kitsune Anime Tracker</p>
      </div>
    </div>
  </div>
</div>
`;
html = html.replace('<div class="app-container">', '<div class="app-container">' + hubHtml);

// 3. Hide games and sidebars initially by modifying their container/styles (or we handle in CSS/JS)
// Add anime section right before music-player ends
const animeHtml = `
<section id="anime-section" class="anime-section" style="display: none;">
  <div class="anime-header">
    <h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:28px;height:28px;margin-right:12px;vertical-align:middle;color:var(--brand-orange)"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>Kitsune Web</h2>
    <div class="anime-search-wrap">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" id="anime-search-input" placeholder="Search for anime..." autocomplete="off">
    </div>
  </div>
  <div id="anime-loading" style="display:none; text-align:center; padding:40px; color:#a1a1aa;">Loading...</div>
  <div id="anime-grid" class="anime-grid"></div>
  <div id="anime-modal" class="anime-modal" style="display:none;">
    <div class="anime-modal-content">
      <button id="anime-modal-close">✕</button>
      <div id="anime-modal-body"></div>
    </div>
  </div>
</section>
`;
html = html.replace('</section>', '</section>' + animeHtml);

// 4. Replace bottom-nav
const bottomNavRegex = /<nav class="bottom-nav">[\s\S]*?<\/nav>/;
const newBottomNav = `
<nav class="bottom-nav" id="main-bottom-nav" style="display:none;">
  <a href="#games" class="bottom-nav-item" id="sys-btn-games">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><path d="M15 13h.01"></path><path d="M18 11h.01"></path></svg>
    <span>Games</span>
  </a>
  <a href="#music" class="bottom-nav-item" id="sys-btn-music">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
    <span>Music</span>
  </a>
  <a href="#anime" class="bottom-nav-item" id="sys-btn-anime">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
    <span>Anime</span>
  </a>
</nav>
`;
html = html.replace(bottomNavRegex, newBottomNav);

fs.writeFileSync('index.html', html);
console.log('Modified index.html');
