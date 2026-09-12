import fs from 'fs';

let css = fs.readFileSync('styles.css', 'utf8');

// Update global variables
const oldRoot = ':root {';
const newRoot = `:root {
  --bg-main: #000000;
  --bg-secondary: #121212;
  --surface: #181818;
  --brand-orange: #ff6600;
  --bone-white: #ffffff;
  --text: #ffffff;
  --text-dim: #a1a1aa;
  --line: #27272a;
`;

if (css.includes('--bg-main')) {
  // Let's just append an override at the bottom instead of parsing
}

const newCss = `
/* System Views Framework */
html, body {
  background-color: var(--bg-main) !important;
  color: var(--text) !important;
  overflow: hidden; /* App-like feel, scroll inside systems */
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.system-view {
  display: none;
  flex: 1;
  height: calc(100vh - 60px); /* 60px for bottom nav */
  overflow: hidden;
}

.system-view.is-active {
  display: flex;
  flex-direction: column;
}

.system-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.system-sidebar {
  width: 250px;
  background: var(--bg-main);
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.system-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2rem;
}

.system-brand img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.system-brand h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.system-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.system-nav .nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 1rem;
  color: var(--text-dim);
  text-decoration: none;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
}

.system-nav .nav-item svg {
  width: 20px;
  height: 20px;
}

.system-nav .nav-item:hover, .system-nav .nav-item.is-active {
  color: var(--text);
  background: var(--surface);
}

.system-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  overflow-y: auto;
}

.system-header {
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(12px);
  z-index: 10;
}

.system-search {
  flex: 1;
  max-width: 400px;
}

.system-search input {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 0.75rem 1rem;
  border-radius: 24px;
  color: var(--text);
  font-size: 0.95rem;
}

.system-content {
  padding: 0 2rem 2rem;
  flex: 1;
}

/* Hub */
.hub-hero img {
  max-width: 200px;
  margin-bottom: 20px;
}

/* Spotify-like Music System */
.music-layout .system-main {
  background: linear-gradient(180deg, rgba(255,102,0,0.15) 0%, var(--bg-secondary) 300px);
}

.spotify-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.spotify-card {
  background: var(--surface);
  padding: 1rem;
  border-radius: 8px;
  transition: background 0.3s;
  cursor: pointer;
  position: relative;
}

.spotify-card:hover {
  background: #282828;
}

.spotify-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}

.spotify-card h4 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-card p {
  color: var(--text-dim);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Music Player Bar (Spotify style) */
.music-player-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 80px;
  background: #000;
  border-top: 1px solid var(--line);
  position: absolute;
  bottom: 60px; /* Above bottom nav */
  left: 0;
  width: 100%;
  z-index: 100;
}

.music-player-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 30%;
}

.music-player-left img {
  width: 56px;
  height: 56px;
  border-radius: 4px;
}

.music-player-info {
  display: flex;
  flex-direction: column;
}

.music-player-info #player-title {
  font-size: 0.9rem;
  font-weight: 600;
}

.music-player-info #player-artist {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.music-player-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.btn-play-pause {
  background: var(--bone-white);
  color: #000;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-play-pause svg {
  width: 16px;
  height: 16px;
}

.player-progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 500px;
}

.player-progress-container span {
  font-size: 0.75rem;
  color: var(--text-dim);
  min-width: 40px;
}

.progress-wrap {
  flex: 1;
  height: 4px;
  background: var(--surface);
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
  width: 30%;
}

/* Global Bottom Nav */
#main-bottom-nav {
  display: flex !important; /* Force show for now */
  justify-content: space-around;
  align-items: center;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--line);
  height: 60px;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1000;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.7rem;
  font-weight: 500;
  flex: 1;
}

.bottom-nav-item svg {
  width: 24px;
  height: 24px;
}

.bottom-nav-item.is-active, .bottom-nav-item:hover {
  color: var(--brand-orange);
}

/* Hide old header */
.header { display: none !important; }

/* Responsive Overrides */
@media (max-width: 768px) {
  .system-sidebar { display: none; }
  .system-content { padding: 0 1rem 1rem; }
  .system-header { padding: 1rem; }
  
  .music-player-left { width: auto; max-width: 50%; }
  .music-player-right { display: none; }
  .music-player-center { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); width: auto; flex-direction: row; }
  .player-progress-container { display: none; }
  
  #main-bottom-nav { padding-bottom: env(safe-area-inset-bottom); height: calc(60px + env(safe-area-inset-bottom)); }
}
`;

fs.writeFileSync('styles.css', css + '\n' + newCss);
console.log("Appended new system CSS");
