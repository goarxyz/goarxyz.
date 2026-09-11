import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'node-html-parser';

let css = readFileSync('styles.css', 'utf-8');

// 1. REFACTOR CSS for Sidebar/Bottom Nav & Uniform Cards

// Remove old bento grid classes
css = css.replace(/\.game-card\.span-2x2\s*\{[^}]+\}/g, '');
css = css.replace(/\.game-card\.span-2x1\s*\{[^}]+\}/g, '');
css = css.replace(/\.game-card\.span-1x2\s*\{[^}]+\}/g, '');

// Update layout CSS
const newLayoutCss = `
/* Layout Architecture */
body {
  display: flex;
  flex-direction: column;
}
.app-container {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  width: 100%;
}
.sidebar {
  display: none;
  width: 240px;
  background: var(--bg);
  border-right: 1px solid var(--line);
  position: sticky;
  top: 61px;
  height: calc(100vh - 61px);
  padding: 24px 16px;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}
@media (min-width: 900px) {
  .sidebar { display: flex; }
  .bottom-nav { display: none !important; }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--bone-dim);
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.2s ease;
}
.nav-item svg { width: 24px; height: 24px; }
.nav-item:hover, .nav-item.is-active {
  background: var(--surface);
  color: var(--accent);
}

.main-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 80px; /* space for bottom nav on mobile */
}
@media (min-width: 900px) {
  .main-content { padding-bottom: 40px; }
}

/* Bottom Nav (Mobile) */
.bottom-nav {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(9, 9, 11, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--line);
  z-index: 100;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
}
.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--bone-dim);
  text-decoration: none;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
}
.bottom-nav-item svg { width: 22px; height: 22px; }
.bottom-nav-item.is-active { color: var(--accent); }

/* Game Cards (GameSnacks Style) */
.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 16px;
  padding: 0 16px;
}
@media (min-width: 600px) {
  .game-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 24px; padding: 0 24px; }
}
.game-card {
  background: transparent;
  border-radius: 0;
  overflow: visible;
  position: relative;
  transition: transform 0.2s ease;
  animation: none; /* remove pop animation for cleaner look */
}
.game-card:hover {
  transform: translateY(-4px);
}
.game-card__link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  height: 100%;
}
.game-card__img-wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  background: var(--surface);
}
.game-card__img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.game-card:hover .game-card__img-wrap img {
  transform: scale(1.05);
}
.game-card__info {
  padding: 10px 4px 0;
  text-align: left;
  background: transparent !important;
  position: static !important;
  transform: none !important;
  opacity: 1 !important;
}
.game-card__info h3 {
  color: var(--bone-white);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 2px 0;
  text-shadow: none !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.game-card__cat {
  color: var(--text-dim);
  font-family: var(--font-body);
  font-size: 0.8rem;
  text-transform: capitalize;
  margin: 0;
}

/* Remove Impulsive Play Badge */
.game-card__link::after { display: none !important; }

/* Adjust Header */
.site-header { position: sticky; top: 0; }
.header-actions { display: flex; gap: 12px; }
.header-inner { max-width: 100%; padding: 12px 24px; }

/* Refined Featured Section */
.featured-carousel-section { width: 100%; margin: 0; padding: 24px 16px; }
@media (min-width: 600px) { .featured-carousel-section { padding: 32px 24px; } }
.carousel-title { font-size: 1.25rem; margin-bottom: 16px; }
.featured-card { 
  border-radius: 24px; 
  aspect-ratio: 2 / 1; 
  flex: 0 0 85%;
  max-width: 450px;
}
@media (min-width: 768px) { .featured-card { flex: 0 0 320px; } }
`;

// Replace game-card__info rules completely
css = css.replace(/\.game-card__info\s*\{[\s\S]*?\}/g, '');
css = css.replace(/\.game-card__info h3\s*\{[\s\S]*?\}/g, '');
css = css.replace(/\.game-card:hover \.game-card__info\s*\{[\s\S]*?\}/g, '');
css = css.replace(/\.game-card\s*\{[\s\S]*?\}/, ''); // We override it below
css += newLayoutCss;

// Remove old category strip completely
css = css.replace(/\.category-strip[\s\S]*?(--\.category-strip__inner::-webkit-scrollbar\s*{\s*display:\s*none;\s*})/g, '');
css = css.replace(/\.category-link[\s\S]*?\.category-link:hover[\s\S]*?\.category-link\.is-active[\s\S]*?\}/g, '');
css = css.replace(/\.category-icon[\s\S]*?\}/g, '');

writeFileSync('styles.css', css);

// 2. REFACTOR index.html
let html = readFileSync('index.html', 'utf-8');
const root = parse(html, { blockTextElements: { script: true, style: true } });

// Remove old category strip
const catStrip = root.querySelector('.category-strip');
if (catStrip) catStrip.remove();

// Clean up header buttons (GameSnacks style is cleaner, move Favorites to sidebar)
const headerActions = root.querySelector('.header-actions');
if (headerActions) {
  headerActions.innerHTML = `
    <button type="button" class="header-btn header-btn--pwa" id="btn-pwa-install" title="Install App">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span class="desktop-only">Install</span>
    </button>
  `;
}

// Build Sidebar and Bottom Nav
const navSvgHome = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
const navSvgCat = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
const navSvgFav = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

const sidebarHtml = `
  <aside class="sidebar">
    <a href="/" class="nav-item is-active" data-nav="home">
      ${navSvgHome} Home
    </a>
    <a href="/category/action/" class="nav-item" data-nav="action">
      ${navSvgCat} Action
    </a>
    <a href="/category/puzzle/" class="nav-item" data-nav="puzzle">
      ${navSvgCat} Puzzle
    </a>
    <a href="/category/racing/" class="nav-item" data-nav="racing">
      ${navSvgCat} Racing
    </a>
    <a href="#favorites" class="nav-item" id="nav-btn-favorites" data-nav="favorites">
      ${navSvgFav} Favorites <span id="fav-count" style="margin-left:auto; background:var(--surface); padding:2px 8px; border-radius:12px; font-size:0.75rem;">0</span>
    </a>
  </aside>
`;

const bottomNavHtml = `
  <nav class="bottom-nav">
    <a href="/" class="bottom-nav-item is-active" data-nav="home">
      ${navSvgHome}
      <span>Home</span>
    </a>
    <a href="/category/puzzle/" class="bottom-nav-item" data-nav="puzzle">
      ${navSvgCat}
      <span>Categories</span>
    </a>
    <a href="#favorites" class="bottom-nav-item" id="bottom-nav-btn-favorites" data-nav="favorites">
      ${navSvgFav}
      <span>Favorites</span>
    </a>
  </nav>
`;

// Transform cards in index.html to GameSnacks style
const cards = root.querySelectorAll('.game-card');
cards.forEach(card => {
  // Remove bento classes
  card.classNames = card.classNames.replace(/span-\dx\d/g, '').trim();
  const img = card.querySelector('img');
  const title = card.querySelector('h3');
  const datasetStr = card.getAttribute('data-search') || "";
  const cat = datasetStr.split(" ").pop() || "games";
  
  const link = card.querySelector('.game-card__link');
  if (link) {
    link.innerHTML = `
      <div class="game-card__img-wrap">
        ${img ? img.toString() : ''}
      </div>
      <div class="game-card__info">
        <h3>${title ? title.text : ''}</h3>
        <p class="game-card__cat">${cat}</p>
      </div>
    `;
  }
});

// Wrap everything below header in app-container > main-content
const body = root.querySelector('body');
const header = root.querySelector('header');
const pageShell = root.querySelector('.page-shell');
const footer = root.querySelector('footer');

if (pageShell) {
  const newStructure = `
    <div class="app-container">
      ${sidebarHtml}
      <div class="main-content">
        ${pageShell.toString()}
        ${footer ? footer.toString() : ''}
      </div>
    </div>
    ${bottomNavHtml}
  `;
  pageShell.remove();
  if (footer) footer.remove();
  header.insertAdjacentHTML('afterend', newStructure);
}

// Clean up some mobile specifics in CSS
css += `
@media (max-width: 600px) {
  .desktop-only { display: none; }
  .header-btn { padding: 8px; border-radius: 50%; }
}
`;
writeFileSync('styles.css', css);
writeFileSync('index.html', root.toString());


// 3. REFACTOR server.ts
let server = readFileSync('server.ts', 'utf-8');
// Fix server.ts game-card generation to match new structure
server = server.replace(
  /let spanClass = '';\s*const rand = [^;]+;\s*if \(rand < 0\.12\) spanClass = 'span-2x2';\s*else if \(rand < 0\.28\) spanClass = 'span-2x1';\s*else if \(rand < 0\.44\) spanClass = 'span-1x2';/g,
  "// span logic removed"
);
server = server.replace(
  /<article class="game-card \$\{spanClass\}" data-slug="\$\{game\.slug\}">\s*<a href="\/game\/\$\{game\.slug\}\/" class="game-card__link">\s*<img src="\$\{game\.image\}" alt="\$\{game\.title\}" loading="lazy">\s*<div class="game-card__info">\s*<h3>\$\{game\.title\}<\/h3>\s*<\/div>\s*<\/a>\s*<\/article>/g,
  `<article class="game-card" data-slug="\${game.slug}">
              <a href="/game/\${game.slug}/" class="game-card__link">
                <div class="game-card__img-wrap">
                  <img src="\${game.image}" alt="\${game.title}" loading="lazy">
                </div>
                <div class="game-card__info">
                  <h3>\${game.title}</h3>
                  <p class="game-card__cat">\${game.category}</p>
                </div>
              </a>
            </article>`
);

// We need to fix the layout in server.ts pages (theater view and categories) to have the sidebar and bottom nav
// We'll replace the '<main class="page-shell">' part in the template rendering with the wrapper
const appWrapperOpen = `
    <div class="app-container">
      ${sidebarHtml}
      <div class="main-content">
        <main class="page-shell">`;
const appWrapperClose = `
        </main>
      </div>
    </div>
    ${bottomNavHtml}`;

server = server.replace(/<main class="page-shell">/g, appWrapperOpen);
server = server.replace(/<\/main>([\s\S]*?)<footer/g, '</main>$1</div></div>' + bottomNavHtml + '<footer');

// Let's just fix theater view wrapper directly since it might be `<main class="player-page-container">`
server = server.replace(/<main class="player-page-container">/g, `
    <div class="app-container">
      ${sidebarHtml}
      <div class="main-content">
        <main class="player-page-container">`);
server = server.replace(/<\/main>\s*<div class="toast"/g, '</main></div></div>' + bottomNavHtml + '<div class="toast"');


writeFileSync('server.ts', server);

// 4. REFACTOR script.js
let script = readFileSync('script.js', 'utf-8');
// Link fav buttons correctly since IDs changed to nav-btn-favorites and bottom-nav-btn-favorites
script = script.replace(/const favHeaderBtn = document\.getElementById\("btn-favorites"\);/g, `const favHeaderBtn = document.getElementById("nav-btn-favorites");
const bottomFavBtn = document.getElementById("bottom-nav-btn-favorites");`);
// Hook up the new bottom fav btn
script = script.replace(/favHeaderBtn\?\.addEventListener\("click", \(\) => \{/g, `
  const handleFavToggle = (btn) => {
    const isCurrentlyFav = btn.classList.contains("is-active");
    if (isCurrentlyFav) {
      favHeaderBtn?.classList.remove("is-active");
      bottomFavBtn?.classList.remove("is-active");
      applyFilter("", "all");
    } else {
      favHeaderBtn?.classList.add("is-active");
      bottomFavBtn?.classList.add("is-active");
      applyFilter("", "favorites");
      gamesSection?.scrollIntoView({ behavior: "smooth" });
    }
  };
  favHeaderBtn?.addEventListener("click", (e) => { e.preventDefault(); handleFavToggle(favHeaderBtn); });
  bottomFavBtn?.addEventListener("click", (e) => { e.preventDefault(); handleFavToggle(bottomFavBtn); });
  
  // Ignore old handler:`);
script = script.replace(/categoryPills\.forEach/g, '// categoryPills.forEach');

writeFileSync('script.js', script);

console.log('GameSnacks layout applied.');
