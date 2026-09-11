import { readFileSync, writeFileSync } from 'fs';

// 1. UPDATE CSS
let css = readFileSync('styles.css', 'utf-8');

const playBadgeCss = `
/* Impulsive Play Badge */
.game-card__link::after {
  content: "▶ PLAY";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  background: var(--accent);
  color: #fff;
  padding: 8px 20px;
  border-radius: 30px;
  font-weight: 900;
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(255, 102, 0, 0.4);
  pointer-events: none;
  z-index: 20;
}
.game-card:hover .game-card__link::after {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

@keyframes bentoPop {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.game-card {
  animation: bentoPop 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
`;

css += playBadgeCss;

// Make category strip sticky
css = css.replace(/\.category-strip\s*\{[^}]+\}/, `.category-strip {
  background: rgba(9, 9, 11, 0.92);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 61px;
  z-index: 90;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}`);

// Improve header btn visuals
css = css.replace(/\.header-btn\s*\{[^}]+\}/, `.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 20px;
  background: var(--surface);
  color: var(--bone-white);
  border: 1px solid var(--line);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}`);

css += `
.header-btn svg { width: 16px; height: 16px; }
.header-btn:hover { background: var(--bone-dim); color: var(--bg); border-color: var(--bone-dim); transform: translateY(-2px); }
.header-btn.is-active { background: var(--accent); border-color: var(--accent); color: #fff; }
`;

writeFileSync('styles.css', css);


// 2. UPDATE HTML (Header Buttons)
let html = readFileSync('index.html', 'utf-8');
const pwaBtnStr = `<button type="button" class="header-btn header-btn--pwa" id="btn-pwa-install" title="Install goarxyz App">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Install
          </button>`;
const randomBtnStr = `<button type="button" class="header-btn" id="btn-random-game" title="Play a random game">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle><circle cx="8.5" cy="15.5" r="1.5"></circle></svg> Random
          </button>`;
const favBtnStr = `<button type="button" class="header-btn header-btn--fav" id="btn-favorites" title="Show favorited games">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Favorites <span class="fav-count-badge" id="fav-count">0</span>
          </button>`;

html = html.replace(/<button type="button" class="header-btn header-btn--pwa"[\s\S]*?<\/button>/, pwaBtnStr);
html = html.replace(/<button type="button" class="header-btn" id="btn-random-game"[\s\S]*?<\/button>/, randomBtnStr);
html = html.replace(/<button type="button" class="header-btn header-btn--fav"[\s\S]*?<\/button>/, favBtnStr);

writeFileSync('index.html', html);


// 3. UPDATE SERVER.TS HTML Template (Header Buttons & Play Badge)
let server = readFileSync('server.ts', 'utf-8');
server = server.replace(/<button type="button" class="header-btn header-btn--pwa"[\s\S]*?<\/button>/, pwaBtnStr);
server = server.replace(/<button type="button" class="header-btn" id="btn-random-game"[\s\S]*?<\/button>/, randomBtnStr);
server = server.replace(/<button type="button" class="header-btn header-btn--fav"[\s\S]*?<\/button>/, favBtnStr);
writeFileSync('server.ts', server);

console.log("Updated styles and HTML for impulsive layout.");
