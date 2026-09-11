import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'node-html-parser';

const html = readFileSync('index.html', 'utf-8');
const root = parse(html, { blockTextElements: { script: true, style: true } });

const gamesSection = root.querySelector('.games-section');

// Add GameSnacks games to the main grid
const newGames = [
  { title: 'Stack Bounce', slug: 'stackbounce', cat: 'arcade', img: 'https://gamesnacks.com/games/stackbounce/cover.jpg', prov: 'gamesnacks' },
  { title: 'Chess Classic', slug: 'chessclassic', cat: 'puzzle', img: 'https://gamesnacks.com/games/chessclassic/cover.jpg', prov: 'gamesnacks' },
  { title: 'Armored Assault Strike', slug: '2fr3rldr11rpg', cat: 'action', img: 'https://gamesnacks.com/games/2fr3rldr11rpg/cover.jpg', prov: 'gamesnacks' },
  { title: 'Endless Truck', slug: '15droj2u412tg', cat: 'racing', img: 'https://gamesnacks.com/games/15droj2u412tg/cover.jpg', prov: 'gamesnacks' }
];

let addedHtml = '';
newGames.forEach(g => {
  addedHtml += `
      <article class="game-card span-2x2" data-search="${g.title.toLowerCase()} ${g.slug} ${g.cat}" data-slug="${g.slug}" data-provider="${g.prov}">
        <a href="/game/${g.slug}/" class="game-card__link">
          <img src="${g.img}" alt="${g.title}" loading="lazy">
          <div class="game-card__info">
            <h3>${g.title}</h3>
          </div>
        </a>
      </article>`;
});

const gameGrid = gamesSection.querySelector('.game-grid');
if (gameGrid) {
  gameGrid.innerHTML = addedHtml + gameGrid.innerHTML;
}

// Add Featured Carousel Section above Games Section
const carouselHtml = `
<section class="featured-carousel-section" id="featured">
  <div class="carousel-header">
    <h2 class="carousel-title">Featured Games</h2>
  </div>
  <div class="carousel-track-container">
    <div class="carousel-track">
      ${newGames.map(g => `
        <article class="featured-card" data-slug="${g.slug}" onclick="window.location.href='/game/${g.slug}/'">
          <img src="${g.img}" alt="${g.title}" loading="lazy">
          <div class="featured-card__info">
            <h3>${g.title}</h3>
            <span class="featured-card__play">▶ PLAY</span>
          </div>
        </article>
      `).join('')}
    </div>
  </div>
</section>
`;

gamesSection.insertAdjacentHTML('beforebegin', carouselHtml);

// Add scroll to top button
const body = root.querySelector('body');
body.insertAdjacentHTML('beforeend', '<button id="scroll-to-top" class="scroll-top-btn" aria-label="Scroll to top" title="Scroll to top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg></button>');

// Add search suggestions container in the form
const searchForm = root.querySelector('.search-form');
searchForm.insertAdjacentHTML('beforeend', '<ul id="search-suggestions" class="search-suggestions-list"></ul>');

writeFileSync('index.html', root.toString());
console.log('index.html patched with new sections');
