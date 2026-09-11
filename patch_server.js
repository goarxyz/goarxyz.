import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('server.ts', 'utf-8');

// Replace the game card template in server.ts
const oldCardHtml = `
      <article class="game-card" data-search="\${game.title.toLowerCase()} \${game.category.toLowerCase()}">
        <div class="game-card__media">
          <a href="/game/\${slug}/" class="game-card__image">
            <img src="\${game.thumb}" alt="\${game.title}" loading="lazy">
          </a>
          <span class="game-card__category">\${game.category}</span>
        </div>
        <div class="game-card__body">
          <h3 class="game-card__title">\${game.title}</h3>
          <a href="/game/\${slug}/" class="game-card__cta">Play now</a>
        </div>
      </article>
`;

const newCardHtml = `
      <article class="game-card \${
        (() => {
          const rand = (Math.sin(index + 1) * 10000) - Math.floor(Math.sin(index + 1) * 10000);
          if (rand < 0.15) return 'span-2x2';
          if (rand < 0.3) return 'span-2x1';
          if (rand < 0.45) return 'span-1x2';
          return '';
        })()
      }" data-search="\${game.title.toLowerCase()} \${game.category.toLowerCase()}" data-slug="\${slug}">
        <a href="/game/\${slug}/" class="game-card__link">
          <img src="\${game.thumb}" alt="\${game.title}" loading="lazy">
          <div class="game-card__info">
            <h3>\${game.title}</h3>
          </div>
        </a>
      </article>
`;

content = content.replace(oldCardHtml, newCardHtml);

// Fix the logo in server.ts
const oldLogo = `<svg viewBox="0 0 512 512" fill="none">
              <rect width="512" height="512" rx="112" fill="#15151a"/>
              <path d="M 344 124 L 184 124 C 129 124 84 169 84 224 L 84 288 C 84 343 129 388 184 388 L 328 388 C 383 388 428 343 428 288 L 428 248 L 254 248" stroke="#f7f6f2" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>
              <polygon points="254,204 354,256 254,308" fill="#ff6600"/>
              <circle cx="394" cy="144" r="16" fill="#ff6600"/>
            </svg>`;
const newLogo = `<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 350 80 L 180 80 L 80 180 L 80 332 L 180 432 L 330 432 L 430 332 L 430 256 L 280 256" fill="none" stroke="#f7f6f2" stroke-width="70" stroke-linecap="square" stroke-linejoin="miter"/>
              <polygon points="320,200 320,312 240,256" fill="#ff6600"/>
            </svg>`;
content = content.replace(oldLogo, newLogo);

// Find map where card is generated to inject 'index'
content = content.replace(/games\.map\(\(game\) => \{/g, 'games.map((game, index) => {');

writeFileSync('server.ts', content);
console.log('server.ts patched');
