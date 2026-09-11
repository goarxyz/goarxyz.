import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf-8');
let server = readFileSync('server.ts', 'utf-8');

const hamburgerBtn = `
    <button type="button" class="header-btn" id="btn-hamburger" title="Menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>
`;

const drawerHtml = `
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
`;

// Insert into index.html
if (html.includes('id="btn-pwa-install"')) {
  html = html.replace(/(<button[^>]+id="btn-pwa-install".*?<\/button>)/, '$1\n' + hamburgerBtn);
}
if (!html.includes('id="side-drawer"')) {
  html = html.replace('</body>', drawerHtml + '\n</body>');
}
writeFileSync('index.html', html);

// Insert into server.ts
if (server.includes('id="btn-pwa-install"')) {
  server = server.replace(/(<button[^>]+id="btn-pwa-install".*?<\/button>)/, '$1\n' + hamburgerBtn);
}
if (!server.includes('id="side-drawer"')) {
  server = server.replace('</body>', drawerHtml + '\n</body>');
}
writeFileSync('server.ts', server);

console.log('Drawer UI injected');
