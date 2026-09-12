import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// The goal is to replace everything from <div class="app-container"> up to <section class="games-section" id="games">
const startTag = '<div class="app-container">';
const endTag = '<section class="games-section" id="games">';

const startIdx = html.indexOf(startTag);
const endIdx = html.indexOf(endTag);

if (startIdx !== -1 && endIdx !== -1) {
  const newShell = `
<div class="app-container">
  <!-- HUB -->
  <div id="hub-section" class="system-view is-active">
    <div class="hub-hero">
      <img src="logo.png" alt="goarxyz" class="hub-logo" style="width: 150px; height: 150px; object-fit: contain; margin-bottom: 2rem;">
      <h1>goar<span style="color:var(--brand-orange)">xyz</span></h1>
      <p>The Ultimate Entertainment Hub</p>
    </div>
    <div class="hub-cards">
      <div class="hub-card" data-sys="games">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><path d="M15 13h.01"></path><path d="M18 11h.01"></path></svg>
        <h3>Games</h3>
      </div>
      <div class="hub-card" data-sys="music">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
        <h3>Music</h3>
      </div>
      <div class="hub-card" data-sys="anime">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
        <h3>Anime</h3>
      </div>
    </div>
  </div>

  <!-- GAMES SYSTEM -->
  <div id="games-section" class="system-view">
    <div class="system-layout">
      <aside class="system-sidebar">
        <div class="system-brand">
          <img src="logo.png" alt="goarxyz Games">
          <h2>goar<span style="color:var(--brand-orange)">xyz</span> Games</h2>
        </div>
        <nav class="system-nav">
          <a href="#" class="nav-item is-active" id="btn-games-home">Home</a>
          <a href="#" class="nav-item" id="btn-games-action">Action</a>
          <a href="#" class="nav-item" id="btn-games-puzzle">Puzzle</a>
          <a href="#" class="nav-item" id="btn-games-racing">Racing</a>
          <a href="#" class="nav-item" id="btn-games-favorites">Favorites</a>
        </nav>
      </aside>
      <main class="system-main">
        <header class="system-header">
          <div class="system-search">
             <input type="text" id="games-search" placeholder="Search games...">
          </div>
        </header>
        <div class="system-content">
          <section class="featured-carousel-section" id="featured">
            <div class="carousel-header">
              <h2 class="carousel-title">Featured Games</h2>
            </div>
            <div class="carousel-track-container">
              <div class="carousel-track">
                <!-- Carousel content will be injected or handled by existing JS -->
              </div>
            </div>
          </section>
          `;

  html = html.substring(0, startIdx) + newShell + endTag + html.substring(endIdx + endTag.length);
  fs.writeFileSync('index.html', html);
  console.log("Updated HTML Shell");
} else {
  console.log("Could not find start/end tags");
}
