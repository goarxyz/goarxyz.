import fs from 'fs';

let ts = fs.readFileSync('server.ts', 'utf8');

const bottomNavRegex = /<nav class="bottom-nav">[\s\S]*?<\/nav>/;
const newBottomNav = `
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
`;
ts = ts.replace(bottomNavRegex, newBottomNav);

// server.ts has a second bottom-nav block
ts = ts.replace(bottomNavRegex, newBottomNav);

fs.writeFileSync('server.ts', ts);
console.log('Modified server.ts');
