import fs from 'fs';

let css = fs.readFileSync('styles.css', 'utf8');

// Ensure any old fixed site-header or banners are hidden
const extraRules = `
/* ==========================================================================
   COMPLETE REDESIGN: goarxyz UNIFIED ENTERTAINMENT SYSTEM
   ========================================================================== */

/* 1. Universal Layout & Theme */
:root {
  --bg-main: #000000 !important;
  --bg-secondary: #0c0c0e !important;
  --bg-tertiary: #141416 !important;
  --surface: #18181b !important;
  --surface-hover: #222226 !important;
  --surface-active: #27272a !important;
  --brand-orange: #ff6600 !important;
  --brand-orange-hover: #ff771a !important;
  --brand-orange-dim: rgba(255, 102, 0, 0.15) !important;
  --bone-white: #ffffff !important;
  --text: #ffffff !important;
  --text-dim: #94949e !important;
  --text-muted: #62626e !important;
  --line: #222226 !important;
  --line-strong: #33333a !important;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-full: 9999px;
}

/* Ensure no top header or banner can ever display */
.site-header,
.header,
.top-banner,
.banner {
  display: none !important;
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
}

html, body {
  background-color: var(--bg-main) !important;
  color: var(--text) !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  margin: 0 !important;
  padding: 0 !important;
  height: 100vh !important;
  width: 100vw !important;
  overflow: hidden !important;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-main);
}

/* 2. Systems Architecture (Device-Like Single Views) */
.system-view {
  display: none;
  flex: 1;
  height: calc(100vh - 64px);
  width: 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.system-view.is-active {
  display: flex;
  flex-direction: column;
  opacity: 1;
  position: relative;
  z-index: 10;
}

/* 3. The Central Hub (Launchpad) */
#hub-section {
  overflow-y: auto;
  align-items: center;
  justify-content: flex-start;
  padding: 48px 24px 100px;
  background: radial-gradient(circle at 50% 15%, rgba(255, 102, 0, 0.12) 0%, transparent 60%), #000000;
}

.hub-inner {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hub-hero {
  text-align: center;
  margin-bottom: 48px;
}

.hub-logo {
  width: 110px;
  height: 110px;
  object-fit: contain;
  margin: 0 auto 20px;
  filter: drop-shadow(0 0 24px rgba(255, 102, 0, 0.25));
  animation: floatLogo 4s ease-in-out infinite;
}

@keyframes floatLogo {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.hub-hero h1 {
  font-size: 3.25rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin: 0 0 8px;
  color: var(--bone-white);
  line-height: 1.1;
}

.hub-hero p {
  font-size: 1.15rem;
  color: var(--text-dim);
  margin: 0;
  font-weight: 500;
}

.hub-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
}

.hub-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.hub-card:hover {
  background: var(--surface-hover);
  border-color: var(--brand-orange);
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 102, 0, 0.15);
}

.hub-card-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  background: var(--brand-orange-dim);
  color: var(--brand-orange);
  border: 1px solid rgba(255, 102, 0, 0.3);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hub-card-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: var(--brand-orange);
  transition: all 0.25s ease;
}

.hub-card:hover .hub-card-icon {
  background: var(--brand-orange);
  color: #000000;
  transform: scale(1.08);
}

.hub-card-icon svg {
  width: 28px;
  height: 28px;
}

.hub-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--bone-white);
}

.hub-card p {
  font-size: 0.95rem;
  color: var(--text-dim);
  margin: 0 0 24px;
  line-height: 1.45;
  flex: 1;
}

.hub-card-cta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--brand-orange);
}

.hub-card-cta svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.hub-card:hover .hub-card-cta svg {
  transform: translateX(4px);
}

/* 4. Desktop Sidebar & In-System Layout */
.system-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.system-sidebar {
  width: 260px;
  min-width: 260px;
  background: var(--bg-main);
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  height: 100%;
  box-sizing: border-box;
}

.system-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px 24px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 20px;
}

.system-brand img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.system-brand h2 {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--bone-white);
}

.system-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.system-nav .nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  color: var(--text-dim);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.system-nav .nav-item svg {
  width: 20px;
  height: 20px;
  opacity: 0.75;
}

.system-nav .nav-item:hover {
  color: var(--bone-white);
  background: var(--surface);
}

.system-nav .nav-item.is-active {
  color: #000000;
  background: var(--brand-orange);
  font-weight: 700;
}

.system-nav .nav-item.is-active svg {
  opacity: 1;
}

/* 5. In-System Main Content Area */
.system-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  overflow-y: auto;
  position: relative;
}

.system-header {
  padding: 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 0;
  background: rgba(12, 12, 14, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--line);
  z-index: 50;
}

.system-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.system-search {
  flex: 1;
  max-width: 520px;
  position: relative;
  display: flex;
  align-items: center;
}

.system-search-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  pointer-events: none;
}

.system-search input {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 10px 16px 10px 42px;
  border-radius: var(--radius-full);
  color: var(--bone-white);
  font-size: 0.92rem;
  transition: all 0.2s ease;
  outline: none;
}

.system-search input:focus {
  border-color: var(--brand-orange);
  box-shadow: 0 0 0 2px var(--brand-orange-dim);
  background: #1f1f23;
}

.system-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.system-chips::-webkit-scrollbar {
  display: none;
}

.chip-btn {
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--text-dim);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.chip-btn:hover {
  background: var(--surface-hover);
  color: var(--bone-white);
  border-color: var(--line-strong);
}

.chip-btn.is-active {
  background: var(--bone-white);
  color: #000000;
  border-color: var(--bone-white);
  font-weight: 700;
}

.system-content {
  padding: 28px 32px 100px;
  flex: 1;
}

/* 6. Playgama-Style Games Grid & Carousel */
.featured-carousel-section {
  margin-bottom: 36px;
}

.carousel-header {
  margin-bottom: 16px;
}

.carousel-title {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--bone-white);
}

.carousel-track-container {
  overflow-x: auto;
  border-radius: var(--radius-md);
  scrollbar-width: thin;
}

.carousel-track {
  display: flex;
  gap: 16px;
  padding-bottom: 8px;
}

.carousel-slide {
  flex: 0 0 240px;
  height: 135px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
  border: 1px solid var(--line);
  background: var(--surface);
  transition: transform 0.2s ease, border-color 0.2s ease;
  text-decoration: none;
}

.carousel-slide:hover {
  transform: translateY(-4px);
  border-color: var(--brand-orange);
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%);
  color: var(--bone-white);
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 7. Spotify-Style Music System */
.music-layout .system-main {
  background: linear-gradient(180deg, rgba(255, 102, 0, 0.16) 0%, rgba(12, 12, 14, 0.95) 260px, var(--bg-secondary) 100%);
}

.spotify-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.spotify-card {
  background: var(--surface);
  padding: 14px;
  border-radius: var(--radius-sm);
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid transparent;
}

.spotify-card:hover {
  background: #202024;
  border-color: var(--line);
  transform: translateY(-4px);
}

.spotify-card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  background: #27272a;
}

.spotify-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spotify-play-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--brand-orange);
  color: #000000;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0,0,0,0.6);
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.spotify-play-btn svg {
  width: 20px;
  height: 20px;
  margin-left: 2px;
}

.spotify-card:hover .spotify-play-btn {
  opacity: 1;
  transform: translateY(0);
}

.spotify-card h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--bone-white);
}

.spotify-card p {
  color: var(--text-dim);
  font-size: 0.82rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Spotify Bottom Player Bar */
.music-player-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 72px;
  background: #09090b;
  border-top: 1px solid var(--line);
  position: fixed;
  bottom: 64px;
  left: 0;
  width: 100%;
  z-index: 100;
  box-sizing: border-box;
}

.music-player-left {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 28%;
  min-width: 180px;
}

.music-player-left img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
  background: #18181b;
}

.music-player-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.music-player-info #player-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--bone-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-player-info #player-artist {
  font-size: 0.75rem;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-player-center {
  flex: 1;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.music-player-controls {
  display: flex;
  align-items: center;
  gap: 18px;
}

.player-btn-secondary {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.player-btn-secondary:hover {
  color: var(--bone-white);
}

.player-btn-secondary svg {
  width: 18px;
  height: 18px;
}

.btn-play-pause {
  background: var(--bone-white);
  color: #000000;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.btn-play-pause:hover {
  transform: scale(1.08);
  background: var(--brand-orange);
}

.btn-play-pause svg {
  width: 18px;
  height: 18px;
}

.player-progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.player-progress-container span {
  font-size: 0.72rem;
  color: var(--text-muted);
  min-width: 36px;
  font-variant-numeric: tabular-nums;
}

.progress-wrap {
  flex: 1;
  height: 4px;
  background: #27272a;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--bone-white);
  border-radius: 2px;
  width: 0%;
}

.progress-wrap:hover .progress-fill {
  background: var(--brand-orange);
}

.music-player-right {
  width: 28%;
  display: flex;
  justify-content: flex-end;
}

/* 8. Kitsune-Style Anime System */
.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.anime-card {
  background: var(--surface);
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--line);
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
}

.anime-card:hover {
  transform: translateY(-6px);
  border-color: var(--brand-orange);
  box-shadow: 0 16px 32px rgba(0,0,0,0.5);
}

.anime-card-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #202024;
}

.anime-card-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.anime-card:hover .anime-card-poster img {
  transform: scale(1.05);
}

.anime-card-score {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.8);
  border: 1px solid rgba(255, 102, 0, 0.4);
  color: var(--brand-orange);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  backdrop-filter: blur(8px);
}

.anime-card-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.anime-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--bone-white);
  margin: 0 0 6px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.anime-card-meta {
  font-size: 0.78rem;
  color: var(--text-dim);
  margin-top: auto;
  display: flex;
  justify-content: space-between;
}

/* 9. Universal Bottom Dock Navigation */
#main-bottom-nav {
  display: flex !important;
  justify-content: center;
  align-items: center;
  background: rgba(8, 8, 10, 0.96) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-top: 1px solid var(--line) !important;
  height: 64px !important;
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  width: 100% !important;
  z-index: 1000 !important;
  box-sizing: border-box !important;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 20px;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  min-width: 72px;
}

.bottom-nav-item svg {
  width: 22px;
  height: 22px;
  transition: transform 0.15s ease;
}

.bottom-nav-item:hover {
  color: var(--bone-white);
}

.bottom-nav-item.is-active {
  color: var(--brand-orange) !important;
}

.bottom-nav-item.is-active svg {
  transform: translateY(-2px);
}

/* 10. Responsive Breakpoints */
@media (max-width: 960px) {
  .hub-cards {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
  .system-sidebar {
    display: none;
  }
  .system-header {
    padding: 16px 20px;
  }
  .system-content {
    padding: 20px 20px 100px;
  }
  .music-player-left {
    width: auto;
    max-width: 60%;
  }
  .music-player-right {
    display: none;
  }
}
`;

// Append or update extraRules
fs.writeFileSync('styles.css', css + '\n' + extraRules);
console.log('Successfully updated styles.css with full redesign!');
