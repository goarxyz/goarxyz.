import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { parse } from "node-html-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from the root directory
app.use(express.static(__dirname));

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
    const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");
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
          <div class="brand__logo-wrap">
            <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256" fill="none" stroke="#f7f6f2" stroke-width="85" stroke-linecap="square" stroke-linejoin="miter"></path>
      <polygon points="280,200 280,312 180,256" fill="#ff6600"></polygon>
    </svg>
          </div>
          <span class="brand__name">goar<span class="brand__name-xyz">xyz</span><span class="brand__name-dot"></span></span>
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
              <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" class="overlay-logo">
                <path d="M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256" fill="none" stroke="#f7f6f2" stroke-width="85" stroke-linecap="square" stroke-linejoin="miter"></path>
                <polygon points="280,200 280,312 180,256" fill="#ff6600"></polygon>
              </svg>
              <h2>${game.title}</h2>
            </div>
            <button id="btn-play-game" class="btn-play-overlay">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              PLAY NOW
            </button>
          </div>

          <iframe id="game-iframe" data-src="${game.provider === 'gamesnacks' ? `https://gamesnacks.com/embed/games/${game.slug}` : `https://play.famobi.com/${game.slug}/?customer=A1000`}" allow="autoplay; fullscreen; gamepad" allowfullscreen></iframe>
        </div>

        <div class="game-info-panel">
          <div class="game-info-header">
            <h2>About ${game.title}</h2>
            <div class="hero-meta">
              <span class="hero-tag">Instant Play</span>
              <span class="hero-tag">Mobile & Desktop</span>
              <span class="hero-tag">Famobi HTML5</span>
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
                  <img src="${game.image}" alt="${game.title}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 512 512\' fill=\'none\' stroke=\'%23ff6600\' stroke-width=\'40\'><polygon points=\'280,200 280,312 180,256\' fill=\'%23ff6600\' stroke=\'none\'></polygon><path d=\'M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256\'></path></svg>'; this.onerror=null; this.style.objectFit='contain'; this.style.padding='24px';">
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
  <nav class="bottom-nav">
    <a href="/" class="bottom-nav-item is-active" data-nav="home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      <span>Home</span>
    </a>
    <a href="/category/puzzle/" class="bottom-nav-item" data-nav="puzzle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      <span>Categories</span>
    </a>
    <a href="#favorites" class="bottom-nav-item" id="bottom-nav-btn-favorites" data-nav="favorites">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      <span>Favorites</span>
    </a>
  </nav>
<div class="toast" id="toast">Link copied to clipboard!</div>

    </div></div>
  <nav class="bottom-nav">
    <a href="/" class="bottom-nav-item is-active" data-nav="home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      <span>Home</span>
    </a>
    <a href="/category/puzzle/" class="bottom-nav-item" data-nav="puzzle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      <span>Categories</span>
    </a>
    <a href="#favorites" class="bottom-nav-item" id="bottom-nav-btn-favorites" data-nav="favorites">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      <span>Favorites</span>
    </a>
  </nav>
<footer class="site-footer">
      <div class="site-footer__inner">
        <div class="site-footer__left">
          <p>© goarxyz / Famobi HTML5 Games. All rights reserved.</p>
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
        <div class="brand__logo-wrap">
          <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256" fill="none" stroke="#f7f6f2" stroke-width="85" stroke-linecap="square" stroke-linejoin="miter"></path>
            <polygon points="280,200 280,312 180,256" fill="#ff6600"></polygon>
          </svg>
        </div>
        <span class="brand__name">goar<span class="brand__name-xyz">xyz</span></span>
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
  res.sendFile(path.join(__dirname, "index.html"));
});

// Privacy, Terms, etc.
app.get(["/privacy", "/terms", "/imprint", "/delete-account"], (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
