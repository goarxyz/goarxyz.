import { readFileSync, writeFileSync } from 'fs';

let script = readFileSync('script.js', 'utf-8');

const additionalLogic = `
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
    list.innerHTML = recent.map(g => \`
      <a href="/game/\${g.slug}/" class="recent-game-item">
        <img src="\${g.img}" alt="\${g.title}">
        <span>\${g.title}</span>
      </a>
    \`).join('');
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
      if (dataSrc && !gameIframe.src) {
        gameIframe.src = dataSrc;
      }
    });
  }
`;

// Inject right after DOMContentLoaded
script = script.replace(/document\.addEventListener\("DOMContentLoaded", \(\) => \{/, 'document.addEventListener("DOMContentLoaded", () => {\n' + additionalLogic);

writeFileSync('script.js', script);
console.log('JS updated with drawer, recent, and overlay logic');
