import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'node-html-parser';

const html = readFileSync('index.html', 'utf-8');
const root = parse(html, { blockTextElements: { script: true, style: true } });

// 1. Remove Hero Spotlight and Intro Panel
const hero = root.querySelector('.hero-spotlight');
if (hero) hero.remove();
const intro = root.querySelector('.intro-panel');
if (intro) intro.remove();

// 2. Remove category sections except the main games grid
const categorySections = root.querySelectorAll('.category-showcase');
categorySections.forEach(sec => sec.remove());

// 3. Reshape all game cards in the main grid
const gamesSection = root.querySelector('.games-section');
if (gamesSection) {
  // Clear any existing section title/header
  const sectionHeader = gamesSection.querySelector('.section-header');
  if (sectionHeader) sectionHeader.remove();
  
  const grid = gamesSection.querySelector('.game-grid');
  if (grid) {
    const cards = grid.querySelectorAll('.game-card');
    cards.forEach((card, i) => {
      // Extract data
      const searchData = card.getAttribute('data-search') || '';
      const slug = card.getAttribute('data-slug') || '';
      const link = card.querySelector('a')?.getAttribute('href') || '#';
      const img = card.querySelector('img');
      const imgSrc = img?.getAttribute('src') || '';
      const imgAlt = img?.getAttribute('alt') || '';
      
      const title = card.querySelector('.game-card__title')?.textContent || imgAlt;
      
      // Determine bento size based on pseudo-random deterministic index
      let spanClass = '';
      const rand = (Math.sin(i + 1) * 10000) - Math.floor(Math.sin(i + 1) * 10000);
      if (rand < 0.15) {
        spanClass = 'span-2x2';
      } else if (rand < 0.3) {
        spanClass = 'span-2x1';
      } else if (rand < 0.45) {
        spanClass = 'span-1x2';
      }
      
      card.setAttribute('class', `game-card ${spanClass}`.trim());
      card.innerHTML = `
        <a href="${link}" class="game-card__link">
          <img src="${imgSrc}" alt="${imgAlt}" loading="lazy" />
          <div class="game-card__info">
            <h3>${title}</h3>
          </div>
        </a>
      `;
    });
  }
}

// 4. Update the Logo
const logoWrap = root.querySelector('.brand__logo-wrap');
if (logoWrap) {
  logoWrap.innerHTML = `
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 350 80 L 180 80 L 80 180 L 80 332 L 180 432 L 330 432 L 430 332 L 430 256 L 280 256" fill="none" stroke="#f7f6f2" stroke-width="70" stroke-linecap="square" stroke-linejoin="miter"/>
      <polygon points="320,200 320,312 240,256" fill="#ff6600"/>
    </svg>
  `;
}

// 5. Update header layout classes (optional, we can do this via CSS)

writeFileSync('index.html', root.toString());
console.log('index.html reshaped successfully');
