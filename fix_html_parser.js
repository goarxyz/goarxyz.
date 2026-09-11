import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'node-html-parser';

let css = readFileSync('styles.css', 'utf-8');

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

// 2. REFACTOR index.html
let html = readFileSync('index.html', 'utf-8');
const root = parse(html, { blockTextElements: { script: true, style: true } });

// Remove old category strip
const catStrip = root.querySelector('.category-strip');
if (catStrip) catStrip.remove();

// Clean up header buttons
const headerActions = root.querySelector('.header-actions');
if (headerActions) {
  headerActions.innerHTML = `
    <button type="button" class="header-btn header-btn--pwa" id="btn-pwa-install" title="Install App">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span class="desktop-only">Install</span>
    </button>
  `;
}

// Transform cards in index.html to GameSnacks style
const cards = root.querySelectorAll('.game-card');
cards.forEach(card => {
  // Remove bento classes correctly
  card.classList.remove('span-2x2', 'span-2x1', 'span-1x2');
  
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

console.log('index, server, script patched.');
