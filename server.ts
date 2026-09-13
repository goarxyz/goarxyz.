import https from "https";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { parse } from "node-html-parser";

const _filename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const _dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(_filename);

const app = express();
const PORT = 3000;

// Serve static files from the root directory
app.use(express.static(_dirname));



const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Cache for game metadata
interface GameInfo {
  title: string;
  description: string;
  image: string;
  slug: string;
  category: string;
  provider?: string;
}
const gamesMap = new Map<string, GameInfo>();
const allGamesList: GameInfo[] = [];

function initializeMetadata() {
  try {
    const html = fs.readFileSync(path.join(_dirname, "index.html"), "utf-8");
    const root = parse(html);
    const cards = root.querySelectorAll(".game-card");
    
    cards.forEach(card => {
      const link = card.querySelector(".game-card__link")?.getAttribute("href");
      if (link && link.includes("/game/")) {
        const slug = link.replace("/game/", "").replace("/", "");
        if (!gamesMap.has(slug)) {
          const title = card.querySelector("h3")?.text.trim() || "";
          const description = card.querySelector(".game-card__description")?.text.trim() || "";
          const image = card.querySelector("img")?.getAttribute("src") || "";
          const category = card.getAttribute("data-search")?.split(" ").pop() || "Games";
          const provider = card.getAttribute("data-provider") || "famobi";
          const gameInfo: GameInfo = { title, description, image, slug, category, provider };
          gamesMap.set(slug, gameInfo);
          allGamesList.push(gameInfo);
        }
      }
    });
    console.log(`Initialized metadata for ${gamesMap.size} games.`);
  } catch (err) {
    console.error("Error parsing index.html for metadata:", err);
  }
}

initializeMetadata();

// Game Page Route (Playgama Theater Design)
app.get("/game/:slug", (req, res) => {
  const { slug } = req.params;
  const game = gamesMap.get(slug);
  
  if (!game) {
    return res.status(404).send("Game not found");
  }

  // Get 6 to 8 recommended games (prefer same category or random picks)
  const sameCat = allGamesList.filter(g => g.category === game.category && g.slug !== slug);
  const otherCat = allGamesList.filter(g => g.category !== game.category && g.slug !== slug);
  const recommended = [...sameCat, ...otherCat].slice(0, 8);

  const recommendedCardsHtml = recommended.map(g => `
    <article class="game-card" style="cursor: pointer;" onclick="window.location.href='/game/${g.slug}/'">
      <div class="game-card__top">
        <a class="game-card__image" href="/game/${g.slug}/">
          <img src="${g.image}" alt="${g.title}" loading="lazy">
        </a>
        <div class="game-card__content">
          <h3><a href="/game/${g.slug}/">${g.title}</a></h3>
          <p class="game-card__description">${g.description}</p>
        </div>
      </div>
      <div class="game-card__footer">
        <div class="game-card__meta"><span>${g.category}</span></div>
        <a class="game-card__cta" href="/game/${g.slug}/">Play</a>
      </div>
    </article>
  `).join("");

  // goarxyz Game Page
  const gameHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${game.title} - Play Online on goarxyz</title>
    <meta name="description" content="Play ${game.title} online for free in your browser with zero downloads on goarxyz.">
    <meta name="theme-color" content="#ff6600">
    <meta name="background-color" content="#09090b">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="goarxyz">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="icon" type="image/svg+xml" href="/icon.svg">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="stylesheet" href="/styles.css">
    <style>
      .player-page-container {
        width: min(calc(100% - 40px), 1400px);
        margin: 0 auto;
        padding: 20px 0 60px;
      }
      .game-breadcrumbs {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--bone-dim);
        font-size: 0.88rem;
        margin-bottom: 16px;
        font-weight: 600;
      }
      .game-breadcrumbs a:hover {
        color: var(--orange-glow);
      }
      .game-theater-box {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: var(--shadow-surface);
      }
      .theater-top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        background: var(--surface-card);
        border-bottom: 1px solid var(--border-subtle);
        flex-wrap: wrap;
        gap: 12px;
      }
      .theater-title-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .theater-title {
        font-family: var(--font-display);
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--bone);
        margin: 0;
      }
      .theater-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .theater-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 14px;
        border-radius: var(--radius-pill);
        background: var(--surface-pill);
        border: 1px solid var(--border-subtle);
        color: var(--bone);
        font-family: var(--font-display);
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .theater-btn:hover {
        background: var(--surface-hover);
        border-color: var(--border-focus);
        transform: translateY(-1px);
        color: var(--orange-glow);
      }
      .theater-btn.is-fav-active {
        background: var(--orange);
        border-color: var(--orange);
        color: #ffffff;
      }
      .game-frame-container {
        position: relative;
        width: 100%;
        padding-top: 56.25%; /* 16:9 ratio */
        background: #000000;
      }
      .game-frame-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
      .game-info-panel {
        padding: 24px 28px;
        background: var(--surface-card);
      }
      .game-info-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .game-info-panel h2 {
        font-family: var(--font-display);
        font-size: 1.5rem;
        font-weight: 800;
        margin: 0;
        color: var(--bone);
      }
      .game-info-panel p {
        color: var(--bone-dim);
        font-size: 1.02rem;
        line-height: 1.65;
        margin: 0 0 16px;
        max-width: 80ch;
      }
      .recommendations-section {
        margin-top: 48px;
      }
      .recommendations-title {
        font-family: var(--font-display);
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--bone);
        margin: 0 0 20px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      /* Toast */
      .toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--orange);
        color: #fff;
        padding: 10px 20px;
        border-radius: var(--radius-pill);
        font-weight: 700;
        font-size: 0.9rem;
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 1000;
      }
      .toast.show {
        opacity: 1;
        transform: translateY(0);
      }
    </style>
</head>
<body>
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="/" aria-label="goarxyz Home">
          <span class="brand__name">goar<span class="brand__name-xyz">xyz</span></span>
          <span class="brand-icons-inline">
            <svg class="brand-inline-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><circle cx="15" cy="13" r="1" fill="currentColor"></circle><circle cx="18" cy="11" r="1" fill="currentColor"></circle></svg>
            <svg class="brand-inline-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3" fill="currentColor"></circle><circle cx="18" cy="16" r="3" fill="currentColor"></circle></svg>
            <svg class="brand-inline-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7" fill="currentColor"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </span>
        </a>

        <div class="header-center">
          <form class="search-form" action="/#games" method="get" role="search">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="search" name="q" placeholder="Search 630+ games..." aria-label="Search games" autocomplete="off">
            <button type="submit" class="search-submit-btn">Search</button>
          </form>
        </div>

        <div class="header-actions">
          <a href="/" class="header-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Back to Games
          </a>
        </div>
      </div>
    </header>

    
    <div class="app-container">
      
  <aside class="sidebar">
    <a href="/" class="nav-item is-active" data-nav="home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Home
    </a>
    <a href="/category/action/" class="nav-item" data-nav="action">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Action
    </a>
    <a href="/category/puzzle/" class="nav-item" data-nav="puzzle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Puzzle
    </a>
    <a href="/category/racing/" class="nav-item" data-nav="racing">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Racing
    </a>
    <a href="#favorites" class="nav-item" id="nav-btn-favorites" data-nav="favorites">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Favorites <span id="fav-count" style="margin-left:auto; background:var(--surface); padding:2px 8px; border-radius:12px; font-size:0.75rem;">0</span>
    </a>
  </aside>

      <div class="main-content">
        <main class="player-page-container">
      <div class="game-breadcrumbs">
        <a href="/">Home</a>
        <span>/</span>
        <a href="/category/${game.category.toLowerCase().replace(/\s+/g, '-')}/">${game.category}</a>
        <span>/</span>
        <span>${game.title}</span>
      </div>

      <div class="game-theater-box" id="theater-box">
        <div class="theater-top-bar">
          <div class="theater-title-wrap">
            <h1 class="theater-title">${game.title}</h1>
            <span class="hero-rating"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style="width:14px;height:14px;color:var(--accent)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> 4.9</span>
            <span class="catalog-stats-pill">${game.category}</span>
          </div>

          <div class="theater-actions">
            <button type="button" class="theater-btn" id="theater-fav-btn" title="Save to favorites">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Favorite
            </button>
            <button type="button" class="theater-btn" id="theater-share-btn" title="Share game link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Share
            </button>
            <button type="button" class="theater-btn" id="theater-reload-btn" title="Reload game">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg> Restart
            </button>
            <button type="button" class="theater-btn" id="theater-fullscreen-btn" title="Fullscreen mode">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg> Fullscreen
            </button>
          </div>
        </div>

        <div class="game-frame-container" id="frame-container">
          
          <div id="game-brand-overlay" class="game-brand-overlay">
            <div class="overlay-brand">
              <img src="${game.image}" alt="${game.title}" class="overlay-game-icon">
              <h2>${game.title}</h2>
            </div>
            <button id="btn-play-game" class="btn-play-overlay">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              PLAY NOW
            </button>
          </div>

          <iframe id="game-iframe" data-src="https://play.famobi.com/${game.slug}/?customer=A1000" allow="autoplay; fullscreen; gamepad" allowfullscreen></iframe>
        </div>

        <div class="game-info-panel">
          <div class="game-info-header">
            <h2>About ${game.title}</h2>
            <div class="hero-meta">
              <span class="hero-tag">Instant Play</span>
              <span class="hero-tag">Mobile & Desktop</span>
              <span class="hero-tag">goarxyz HTML5 Engine</span>
            </div>
          </div>
          <p>${game.description}</p>
        </div>
      </div>

      <section class="recommendations-section">
        <h2 class="recommendations-title">
          More Games You'll Love
        </h2>
        
      <div class="game-grid">
        ${recommended.map((game, index) => {
          // span logic removed

          return `
            <article class="game-card" data-slug="${game.slug}">
              <a href="/game/${game.slug}/" class="game-card__link">
                <div class="game-card__img-wrap">
                  <img src="${game.image}" alt="${game.title}" loading="lazy" onerror="const c = this.closest('.game-card'); if(c) { c.style.display='none'; c.remove(); }">
                </div>
                <div class="game-card__info">
                  <h3>${game.title}</h3>
                  <p class="game-card__cat">${game.category}</p>
                </div>
              </a>
            </article>`;
        }).join("")}
      </div>
  
      </section>
    </main></div></div>
  
<nav class="bottom-nav" id="main-bottom-nav">
  <a href="/#games" class="bottom-nav-item is-active" id="sys-btn-games">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><path d="M15 13h.01"></path><path d="M18 11h.01"></path></svg>
    <span>Games</span>
  </a>
  <a href="/#music" class="bottom-nav-item" id="sys-btn-music">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
    <span>Music</span>
  </a>
  <a href="/#anime" class="bottom-nav-item" id="sys-btn-anime">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
    <span>Anime</span>
  </a>
</nav>

<div class="toast" id="toast">Link copied to clipboard!</div>

    </div></div>
  
<nav class="bottom-nav" id="main-bottom-nav">
  <a href="/#games" class="bottom-nav-item is-active" id="sys-btn-games">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><path d="M15 13h.01"></path><path d="M18 11h.01"></path></svg>
    <span>Games</span>
  </a>
  <a href="/#music" class="bottom-nav-item" id="sys-btn-music">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
    <span>Music</span>
  </a>
  <a href="/#anime" class="bottom-nav-item" id="sys-btn-anime">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
    <span>Anime</span>
  </a>
</nav>

<footer class="site-footer">
      <div class="site-footer__inner">
        <div class="site-footer__left">
          <p>© 2026 goarxyz. All rights reserved. The Sovereign Entertainment Hub.</p>
        </div>
        <div class="site-footer__links">
          <a href="/">Home</a>
          <a href="/category/puzzle/">Puzzle</a>
          <a href="/category/arcade/">Arcade</a>
          <a href="/category/racing/">Racing</a>
        </div>
      </div>
    </footer>

    <script>
      // Service Worker registration in player
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }

      // Favorites handling in player
      const SLUG = "${slug}";
      const FAV_KEY = "goarxyz_favorites_v1";
      const OLD_FAV_KEY = "playgama_favorites_v1";
      const favBtn = document.getElementById("theater-fav-btn");

      const getFavs = () => {
        try {
          let raw = localStorage.getItem(FAV_KEY);
          if (!raw) {
            raw = localStorage.getItem(OLD_FAV_KEY);
            if (raw) localStorage.setItem(FAV_KEY, raw);
          }
          return raw ? JSON.parse(raw) : [];
        } catch { return []; }
      };

      const isFav = () => getFavs().includes(SLUG);

      const updateFavUI = () => {
        if (isFav()) {
          favBtn.classList.add("is-fav-active");
          favBtn.innerHTML = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Saved\`;
        } else {
          favBtn.classList.remove("is-fav-active");
          favBtn.innerHTML = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Favorite\`;
        }
      };

      favBtn.addEventListener("click", () => {
        const favs = getFavs();
        const idx = favs.indexOf(SLUG);
        if (idx > -1) {
          favs.splice(idx, 1);
        } else {
          favs.push(SLUG);
        }
        try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch {}
        updateFavUI();
      });

      updateFavUI();

      // Fullscreen
      const fsBtn = document.getElementById("theater-fullscreen-btn");
      const container = document.getElementById("frame-container");
      fsBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => {
            const iframe = document.getElementById("game-iframe");
            iframe.requestFullscreen().catch(() => {});
          });
        } else {
          document.exitFullscreen();
        }
      });

      // Reload
      document.getElementById("theater-reload-btn").addEventListener("click", () => {
        const iframe = document.getElementById("game-iframe");
        iframe.src = iframe.src;
      });

      // Play Overlay
      const gameOverlay = document.getElementById("game-brand-overlay");
      const btnPlayGame = document.getElementById("btn-play-game");
      const gameIframe = document.getElementById("game-iframe");
      
      if (gameOverlay && btnPlayGame && gameIframe) {
        btnPlayGame.addEventListener("click", () => {
          gameOverlay.classList.add("is-hidden");
          const dataSrc = gameIframe.getAttribute("data-src");
          if (dataSrc && !gameIframe.hasAttribute("src")) {
            gameIframe.setAttribute("src", dataSrc);
          }
        });
      }

      // Share Toast
      const shareBtn = document.getElementById("theater-share-btn");
      const toast = document.getElementById("toast");
      shareBtn.addEventListener("click", () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 2500);
          });
        }
      });
    </script>

<div id="side-drawer" class="side-drawer">
  <div class="side-drawer-overlay"></div>
  <div class="side-drawer-content">
    <div class="side-drawer-header">
      <div class="brand">
        <span class="brand__name">goar<span class="brand__name-xyz">xyz</span></span>
        <span class="brand-icons-inline">
          <svg class="brand-inline-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><circle cx="15" cy="13" r="1" fill="currentColor"></circle><circle cx="18" cy="11" r="1" fill="currentColor"></circle></svg>
          <svg class="brand-inline-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3" fill="currentColor"></circle><circle cx="18" cy="16" r="3" fill="currentColor"></circle></svg>
          <svg class="brand-inline-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7" fill="currentColor"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
        </span>
      </div>
      <button id="btn-close-drawer" class="btn-close-drawer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="side-drawer-body">
      <div class="drawer-nav">
        <a href="/" class="drawer-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Home
        </a>
        <a href="/category/action/" class="drawer-nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Categories
        </a>
        <a href="/#favorites" class="drawer-nav-item drawer-btn-favorites">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          Favorites
        </a>
      </div>
      <div class="drawer-section">
        <h3 class="drawer-section-title">Recently Played</h3>
        <div id="drawer-recent-list" class="drawer-recent-list">
          <!-- Populated by JS -->
        </div>
      </div>
    </div>
  </div>
</div>

</body>
</html>`;

  res.send(gameHtml);
});

// Category Route
app.get("/category/:slug", (req, res) => {
  res.sendFile(path.join(_dirname, "index.html"));
});

// Privacy, Terms, etc.
app.get(["/privacy", "/terms", "/imprint", "/delete-account"], (req, res) => {
  res.sendFile(path.join(_dirname, "index.html"));
});

// Root
app.get("/", (req, res) => {
  res.sendFile(path.join(_dirname, "index.html"));
});


import YTMusic from 'ytmusic-api';
import { HttpClient, GogoanimeProvider } from "anime-sdk";

const ytmusic = new YTMusic();
ytmusic.initialize();

const animeHttpClient = new HttpClient();
class CustomGogoanime extends GogoanimeProvider {
  public searchAnime(query: string) {
    return this.searchRaw(query);
  }
  public getUnits(id: string) {
    return this.fetchContentUnitsRaw(id);
  }
}
const gogoanime = new CustomGogoanime(animeHttpClient);

app.get('/api/music/search', async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) return res.json([]);
    const results = await ytmusic.search(q);
    // Filter to only songs and videos
    const playable = results.filter(r => r.type === 'SONG' || r.type === 'VIDEO').map(r => ({
      id: r.videoId,
      title: r.name,
      artist: r.artist?.name || 'Unknown Artist',
      thumbnail: r.thumbnails?.[r.thumbnails.length - 1]?.url || ''
    }));
    res.json(playable);
  } catch (err) {
    console.error('Music search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Full Streamable Anime API Endpoint
app.get('/api/anime/stream', async (req, res) => {
  const title = (req.query.title as string || '').trim();
  const episode = Math.max(1, parseInt(req.query.episode as string || '1', 10));

  if (!title) {
    return res.status(400).json({ error: 'Anime title is required' });
  }

  const servers: Array<{ name: string; url: string; type: string }> = [];
  let episodeTitle = `Episode ${episode}`;
  let totalEpisodes = 12;
  let episodesList: Array<{ number: number; title: string }> = [];

  try {
    // 1. Search anime provider with timeout
    const searchPromise = gogoanime.searchAnime(title);
    const timeoutPromise = new Promise<any[]>((_, reject) =>
      setTimeout(() => reject(new Error('Search timeout')), 3500)
    );
    const searchRes = await Promise.race([searchPromise, timeoutPromise]).catch(() => []);

    if (searchRes && searchRes.length > 0) {
      const lower = title.toLowerCase();
      // Match closest title
      const matched = searchRes.find((s: any) => s.title.toLowerCase() === lower)
        || searchRes.find((s: any) => s.title.toLowerCase().startsWith(lower))
        || searchRes[0];

      if (matched) {
        const units = await gogoanime.getUnits(matched.id).catch(() => []);
        if (units && units.length > 0) {
          totalEpisodes = units.length;
          episodesList = units.map((u: any) => ({
            number: u.number,
            title: u.title
          }));

          const epUnit = units.find((u: any) => u.number === episode) || units[0];
          if (epUnit) {
            episodeTitle = epUnit.title || `Episode ${episode}`;
            const epPageUrl = "https://anineko.to" + (epUnit.id.startsWith("/") ? epUnit.id : "/" + epUnit.id);
            const pageRes = await fetch(epPageUrl, {
              headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
            }).catch(() => null);

            if (pageRes && pageRes.ok) {
              const html = await pageRes.text();
              const extracted = [...html.matchAll(/data-video="([^"]+)"/g)].map(m => m[1]);

              const seenHosts = new Set<string>();
              extracted.forEach((rawUrl) => {
                try {
                  const parsed = new URL(rawUrl.startsWith("//") ? "https:" + rawUrl : rawUrl);
                  const host = parsed.hostname.toLowerCase();
                  if (seenHosts.has(host)) return;
                  seenHosts.add(host);

                  let label = "Server Direct";
                  if (host.includes("playmogo")) label = "Server 1 (Fast HD)";
                  else if (host.includes("otakuhg")) label = "Server 2 (Mirror HD)";
                  else if (host.includes("otakuvid")) label = "Server 3 (Stream HD)";
                  else if (host.includes("bibiemb")) label = "Server 4 (Cloud)";
                  else if (host.includes("vivibebe")) label = "Server 5 (Direct)";

                  servers.push({
                    name: label,
                    url: rawUrl.startsWith("//") ? "https:" + rawUrl : rawUrl,
                    type: "embed"
                  });
                } catch(e) {}
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error in anime stream provider:', err);
  }

  // 2. Add Multi-Source fallbacks
  servers.push({
    name: "Server 6 (Multi-HD)",
    url: `https://multiembed.mov/?video_id=${encodeURIComponent(title)}&s=1&e=${episode}`,
    type: "embed"
  });

  servers.push({
    name: "Server 7 (Alt Stream)",
    url: `https://vidsrc.xyz/embed/tv?imdb=${encodeURIComponent(title)}&season=1&episode=${episode}`,
    type: "embed"
  });

  // 3. Add Global Stream fallback
  try {
    const ytQuery = `${title} Episode ${episode} English Sub full`;
    const ytResults = await Promise.race([
      ytmusic.search(ytQuery),
      new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('YT timeout')), 2500))
    ]).catch(() => []);

    const topVideo = ytResults?.find((r: any) => r.type === 'VIDEO' || r.type === 'SONG');
    if (topVideo && topVideo.videoId) {
      servers.push({
        name: "Server 8 (Global HD)",
        url: `https://www.youtube.com/embed/${topVideo.videoId}?autoplay=1`,
        type: "youtube"
      });
    }
  } catch(e) {}

  res.json({
    success: true,
    title,
    episode,
    episodeTitle,
    totalEpisodes,
    episodes: episodesList,
    servers
  });
});

// Enterprise Customer Telemetry & Analytics Event Pipeline (CDP / BigQuery compatible)
interface TelemetryEvent {
  id: string;
  eventName: string;
  userPseudoId: string;
  sessionId: string;
  timestamp: number;
  consentGranted: boolean;
  page: string;
  properties: Record<string, any>;
  ipAnonymized: string;
}

interface CustomerProfile {
  userPseudoId: string;
  visitCount: number;
  firstSeen: number;
  lastSeen: number;
  isReturning: boolean;
  referrer: string;
  trafficChannel: string;
  utmCampaign?: string;
  utmSource?: string;
  categoryAffinity: {
    games: number;
    music: number;
    anime: number;
  };
  deviceType: string;
  screenResolution: string;
  language: string;
  favoriteItems: string[];
}

const customerTelemetryStore: TelemetryEvent[] = [];
const customerProfiles = new Map<string, CustomerProfile>();
const MAX_STORED_EVENTS = 1000;

app.post("/api/analytics/collect", express.json(), (req, res) => {
  try {
    const { eventName, userPseudoId, sessionId, consentGranted, page, properties } = req.body;
    if (!eventName) {
      return res.status(400).json({ error: "eventName is required" });
    }

    const rawIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "0.0.0.0";
    // Anonymize IP (BigQuery & GDPR standard: mask last octet)
    const ipAnonymized = rawIp.split(",")[0].trim().replace(/\.\d+$/, ".0");

    const uid = String(userPseudoId || "anon");
    const props = typeof properties === "object" && properties !== null ? properties : {};

    const eventRecord: TelemetryEvent = {
      id: "evt_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
      eventName: String(eventName),
      userPseudoId: uid,
      sessionId: String(sessionId || "sess_default"),
      timestamp: Date.now(),
      consentGranted: Boolean(consentGranted),
      page: String(page || "/"),
      properties: props,
      ipAnonymized
    };

    customerTelemetryStore.unshift(eventRecord);
    if (customerTelemetryStore.length > MAX_STORED_EVENTS) {
      customerTelemetryStore.pop();
    }

    // Update Customer Profile & Habit Tracking
    if (uid !== "anon") {
      let profile = customerProfiles.get(uid);
      const now = Date.now();
      if (!profile) {
        // Derive traffic channel from referrer or UTM
        const ref = String(props.referrer || "");
        let channel = "Direct";
        if (props.utm_source || props.utm_campaign) {
          channel = "Paid / Campaign (" + (props.utm_source || "campaign") + ")";
        } else if (ref.includes("google.") || ref.includes("bing.") || ref.includes("duckduckgo.")) {
          channel = "Organic Search";
        } else if (ref.includes("facebook.") || ref.includes("t.co") || ref.includes("twitter.") || ref.includes("instagram.") || ref.includes("tiktok.")) {
          channel = "Social Media";
        } else if (ref) {
          channel = "Referral";
        }

        profile = {
          userPseudoId: uid,
          visitCount: Number(props.visitCount) || 1,
          firstSeen: now,
          lastSeen: now,
          isReturning: Boolean(props.isReturning) || (Number(props.visitCount) > 1),
          referrer: ref || "Direct / Bookmark",
          trafficChannel: channel,
          utmCampaign: props.utm_campaign ? String(props.utm_campaign) : undefined,
          utmSource: props.utm_source ? String(props.utm_source) : undefined,
          categoryAffinity: { games: 0, music: 0, anime: 0 },
          deviceType: String(props.deviceType || "desktop"),
          screenResolution: String(props.screenResolution || "unknown"),
          language: String(props.language || "en"),
          favoriteItems: []
        };
      } else {
        profile.lastSeen = now;
        profile.visitCount = Math.max(profile.visitCount, Number(props.visitCount) || (profile.visitCount + 1));
        profile.isReturning = true;
      }

      // Track habit counters based on event
      if (eventName.includes("game") || String(props.content_type) === "game") {
        profile.categoryAffinity.games += 1;
      }
      if (eventName.includes("music") || String(props.content_type) === "music") {
        profile.categoryAffinity.music += 1;
      }
      if (eventName.includes("anime") || String(props.content_type) === "anime") {
        profile.categoryAffinity.anime += 1;
      }
      if (props.favorite_slug && !profile.favoriteItems.includes(String(props.favorite_slug))) {
        profile.favoriteItems.push(String(props.favorite_slug));
      }

      customerProfiles.set(uid, profile);
    }

    res.json({ success: true, eventId: eventRecord.id, queued: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to log telemetry event" });
  }
});

// Customer Intelligence & Returning Users Summary (for Ad Campaign optimization & UI Insights)
app.get("/api/analytics/customer-insights", (req, res) => {
  const allProfiles = Array.from(customerProfiles.values());
  const totalProfiles = allProfiles.length;
  const returningCount = allProfiles.filter(p => p.isReturning || p.visitCount > 1).length;
  const newCount = Math.max(0, totalProfiles - returningCount);
  const returningPercentage = totalProfiles > 0 ? Math.round((returningCount / totalProfiles) * 100) : 0;

  // Traffic Channel breakdown
  const channelBreakdown: Record<string, number> = {};
  allProfiles.forEach(p => {
    channelBreakdown[p.trafficChannel] = (channelBreakdown[p.trafficChannel] || 0) + 1;
  });

  // Category Affinity totals
  const totalAffinities = { games: 0, music: 0, anime: 0 };
  allProfiles.forEach(p => {
    totalAffinities.games += p.categoryAffinity.games;
    totalAffinities.music += p.categoryAffinity.music;
    totalAffinities.anime += p.categoryAffinity.anime;
  });

  // Audience Segments ready for Google Ads / Meta Ads Lookalikes
  const audienceSegments = {
    highFrequencyGamers: allProfiles.filter(p => p.categoryAffinity.games >= 3).length,
    audioLovers: allProfiles.filter(p => p.categoryAffinity.music >= 3).length,
    animeBingers: allProfiles.filter(p => p.categoryAffinity.anime >= 3).length,
    multiPlatformEnthusiasts: allProfiles.filter(p => p.categoryAffinity.games > 0 && p.categoryAffinity.music > 0 && p.categoryAffinity.anime > 0).length
  };

  res.json({
    totalTrackedCustomers: totalProfiles,
    newVisitors: newCount,
    returningVisitors: returningCount,
    returningRatioPercent: returningPercentage,
    acquisitionChannels: channelBreakdown,
    categoryAffinities: totalAffinities,
    audienceSegments,
    recentProfiles: allProfiles.slice(-15)
  });
});

// Analytics Summary for administrative verification and Looker Studio export
app.get("/api/analytics/summary", (req, res) => {
  const totalEvents = customerTelemetryStore.length;
  const eventCounts: Record<string, number> = {};
  const activeSessions = new Set<string>();

  customerTelemetryStore.forEach((e) => {
    eventCounts[e.eventName] = (eventCounts[e.eventName] || 0) + 1;
    if (e.sessionId) activeSessions.add(e.sessionId);
  });

  res.json({
    totalEvents,
    uniqueSessions: activeSessions.size,
    eventDistribution: eventCounts,
    recentEvents: customerTelemetryStore.slice(0, 20)
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
