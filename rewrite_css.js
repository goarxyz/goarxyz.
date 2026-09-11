import { readFileSync, writeFileSync } from 'fs';

let css = readFileSync('styles.css', 'utf-8');

// Set max-width wider for Poki feel
css = css.replace(/--max-width: 1400px;/, '--max-width: 1440px;');
// The page shell doesn't need to be constrained differently
css = css.replace(/\.page-shell\s*\{\s*width:.*?\}/g, '.page-shell { width: min(calc(100% - 32px), var(--max-width)); margin: 0 auto; padding: 24px 0 60px; }');

// Remove any existing .game-card and .game-grid styles
// Since regex over large files can be messy, let's find the start of the grid section and truncate, then append the new ones.
const gridStartPattern = /\/\* =+ \[?goarxyz Game Cards & Grid.*$/s;
const alternativeStartPattern = /\/\* =+ \n\s*goarxyz Bento Grid.*$/s;

let newCss = css;
if (gridStartPattern.test(css)) {
    newCss = css.split(/\/\* =+ \[?goarxyz Game Cards/)[0];
} else if (alternativeStartPattern.test(css)) {
    newCss = css.split(/\/\* =+ \n\s*goarxyz Bento Grid/)[0];
} else {
    // If we can't find it easily, let's manually remove .game-card and .game-grid blocks
    newCss = css.replace(/\.game-grid\s*\{[\s\S]*?\}(?=\n\.)/g, '');
    newCss = newCss.replace(/\.game-card[\s\S]*?(?=\n\/\*)/g, '');
}

// Ensure clean end
newCss = newCss.trim();

// Append exact Poki style grid
newCss += `

/* ==========================================================================
   goarxyz Poki-Style Bento Grid
   ========================================================================== */
.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  grid-auto-rows: 130px;
  gap: 12px;
  grid-auto-flow: dense;
}

@media (min-width: 768px) {
  .game-grid {
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
    grid-auto-rows: 145px;
    gap: 16px;
  }
}

.game-card {
  position: relative;
  display: flex;
  background: var(--surface);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  z-index: 1;
}

.game-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4), 0 0 0 2px var(--accent);
  z-index: 10;
}

.game-card__link {
  width: 100%;
  height: 100%;
  display: block;
  position: relative;
}

.game-card__link img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-card__info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 12px 12px;
  background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, transparent 100%);
  color: var(--bone-white);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 800;
  text-align: center;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

.game-card__info h3 {
  margin: 0;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

.game-card:hover .game-card__info {
  opacity: 1;
  transform: translateY(0);
}

/* Variable Spanning for Bento Look */
.game-card.span-2x2 {
  grid-column: span 2;
  grid-row: span 2;
}
.game-card.span-2x1 {
  grid-column: span 2;
  grid-row: span 1;
}
.game-card.span-1x2 {
  grid-column: span 1;
  grid-row: span 2;
}

/* Minimalist Favorite Button */
.game-card__fav-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--bone-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  opacity: 0;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}
.game-card:hover .game-card__fav-btn {
  opacity: 1;
}
.game-card__fav-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: var(--accent);
  color: var(--accent);
}
.game-card__fav-btn.is-active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  opacity: 1;
}
`;

writeFileSync('styles.css', newCss);
console.log('CSS updated successfully');
