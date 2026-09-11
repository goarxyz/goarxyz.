import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'node-html-parser';

// Parse original gamebow site to extract games
const origHtml = readFileSync('original_gamebow.html', 'utf-8');
const origRoot = parse(origHtml, { blockTextElements: { script: false, style: false } });

const originalCards = origRoot.querySelectorAll('.game-card');

// We want unique games, as they might be repeated in categories
const gamesMap = new Map();
originalCards.forEach(card => {
  const link = card.querySelector('a')?.getAttribute('href');
  if (!link || link.indexOf('/game/') === -1) return;
  const slugMatch = link.match(/\/game\/([^\/]+)\/?/);
  if (!slugMatch) return;
  const slug = slugMatch[1];
  
  if (!gamesMap.has(slug)) {
    const searchData = card.getAttribute('data-search') || '';
    const img = card.querySelector('img');
    const imgSrc = img?.getAttribute('src') || '';
    const title = card.querySelector('.game-card__title')?.textContent || '';
    const cat = card.querySelector('.game-card__category')?.textContent || '';
    gamesMap.set(slug, { slug, searchData, imgSrc, title, cat });
  }
});

console.log(`Found ${gamesMap.size} unique games.`);

// Now build the new grid HTML
let gridHtml = '<div class="game-grid">\n';
let i = 0;
gamesMap.forEach(game => {
  let spanClass = '';
  // Deterministic random
  const rand = (Math.sin(i + 1) * 10000) - Math.floor(Math.sin(i + 1) * 10000);
  if (rand < 0.12) {
    spanClass = 'span-2x2';
  } else if (rand < 0.28) {
    spanClass = 'span-2x1';
  } else if (rand < 0.44) {
    spanClass = 'span-1x2';
  }
  
  gridHtml += `
      <article class="game-card ${spanClass}" data-search="${game.searchData}" data-slug="${game.slug}">
        <a href="/game/${game.slug}/" class="game-card__link">
          <img src="${game.imgSrc}" alt="${game.title}" loading="lazy">
          <div class="game-card__info">
            <h3>${game.title}</h3>
          </div>
        </a>
      </article>\n`;
  i++;
});
gridHtml += '</div>';

// Parse our current index.html
const myHtml = readFileSync('index.html', 'utf-8');
const myRoot = parse(myHtml, { blockTextElements: { script: true, style: true } });

// Find where to put it: inside <main class="page-shell">, replace whatever games section exists
const pageShell = myRoot.querySelector('.page-shell');
if (pageShell) {
  // clear page shell contents except maybe the category strip if it's there (it's actually outside in <nav>)
  pageShell.innerHTML = `<section class="games-section" id="games">${gridHtml}</section>`;
}

writeFileSync('index.html', myRoot.toString());
console.log('Restored games into index.html');
