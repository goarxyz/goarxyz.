import { readFileSync, writeFileSync } from 'fs';

let css = readFileSync('styles.css', 'utf-8');

const additionalCss = `

/* MISSING IMAGE FALLBACKS */
.game-card__img-wrap img {
  text-indent: -9999px; /* Hide alt text */
  background: var(--surface) url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="48" height="48" fill="none" stroke="%23ff6600" stroke-width="40" stroke-linecap="square"><path d="M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256"></path><polygon points="280,200 280,312 180,256" fill="%23ff6600" stroke="none"></polygon></svg>') no-repeat center center;
}

/* SIDE DRAWER (Transparent Glassmorphic) */
.side-drawer {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  pointer-events: none;
  visibility: hidden;
}
.side-drawer.is-open {
  pointer-events: auto;
  visibility: visible;
}
.side-drawer-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.side-drawer.is-open .side-drawer-overlay {
  opacity: 1;
}
.side-drawer-content {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 80%;
  max-width: 320px;
  background: rgba(9, 9, 11, 0.7);
  backdrop-filter: blur(24px);
  border-right: 1px solid var(--line);
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  flex-direction: column;
}
.side-drawer.is-open .side-drawer-content {
  transform: translateX(0);
}
.side-drawer-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
}
.btn-close-drawer {
  background: none;
  border: none;
  color: var(--bone-dim);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
}
.btn-close-drawer:hover {
  background: var(--surface);
  color: var(--bone-white);
}
.btn-close-drawer svg { width: 24px; height: 24px; }
.side-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.drawer-nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  color: var(--bone-white);
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: var(--radius-md);
  transition: background 0.2s;
}
.drawer-nav-item svg { width: 22px; height: 22px; color: var(--accent); }
.drawer-nav-item:hover {
  background: var(--surface);
}
.drawer-section-title {
  font-family: var(--font-display);
  font-size: 0.9rem;
  color: var(--bone-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}
.drawer-recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.recent-game-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--bone-white);
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}
.recent-game-item:hover {
  background: var(--surface);
}
.recent-game-item img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  background: var(--surface);
}
.recent-game-item span {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
}

/* BRANDED GAME OVERLAY */
.game-brand-overlay {
  position: absolute;
  inset: 0;
  background: rgba(9, 9, 11, 0.85);
  backdrop-filter: blur(20px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease, visibility 0.5s;
}
.game-brand-overlay.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.overlay-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
  animation: floatOverlay 3s ease-in-out infinite;
}
.overlay-logo {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 0 20px rgba(255, 102, 0, 0.4));
}
.overlay-brand h2 {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--bone-white);
  font-weight: 900;
  margin: 0;
  text-shadow: 0 4px 12px rgba(0,0,0,0.5);
}
.btn-play-overlay {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 16px 40px;
  border-radius: 30px;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(255, 102, 0, 0.4);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s;
}
.btn-play-overlay svg { width: 24px; height: 24px; }
.btn-play-overlay:hover {
  transform: scale(1.05) translateY(-4px);
  box-shadow: 0 12px 32px rgba(255, 102, 0, 0.6);
}
@keyframes floatOverlay {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

`;

writeFileSync('styles.css', css + additionalCss);
console.log('CSS updated with drawer and overlay');
