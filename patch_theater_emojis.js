import { readFileSync, writeFileSync } from 'fs';

let server = readFileSync('server.ts', 'utf-8');

const svgFav = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
const svgShare = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`;
const svgRestart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>`;
const svgFullscreen = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;

server = server.replace(/<span id="fav-icon">❤️<\/span>/g, svgFav);
server = server.replace(/<span>🔗<\/span>/g, svgShare);
server = server.replace(/<span>🔄<\/span>/g, svgRestart);
server = server.replace(/<span>⛶<\/span>/g, svgFullscreen);
server = server.replace(/<span class="hero-rating">⭐ 4\.9<\/span>/g, '<span class="hero-rating"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style="width:14px;height:14px;color:var(--accent)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> 4.9</span>');

server = server.replace(/<span>←<\/span>/g, `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`);

writeFileSync('server.ts', server);

let styles = readFileSync('styles.css', 'utf-8');
styles = styles.replace(/\.theater-btn\s*\{[^}]+\}/, `.theater-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--bone-white);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}`);

if (!styles.includes('.theater-btn:hover')) {
    styles += `
.theater-btn:hover { background: var(--bone-dim); color: var(--bg); border-color: var(--bone-dim); }
.theater-btn.is-active { background: var(--accent); color: #fff; border-color: var(--accent); }
`;
}
writeFileSync('styles.css', styles);

console.log('Theater emojis patched');
