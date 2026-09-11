import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf-8');
// Fix game cards to include data-category so the server knows
html = html.replace(/data-search="([^"]+)" data-slug/g, (match, p1) => {
  // Try to extract category from the search data (the last word)
  // Or we can just let it fallback to "Games" for now, Poki doesn't show category explicitly usually.
  return match;
});

let server = readFileSync('server.ts', 'utf-8');
// Fix server parsing
server = server.replace(/\.game-card__image/g, '.game-card__link');
server = server.replace(/const category = .*?;/, 'const category = card.getAttribute("data-search")?.split(" ").pop() || "Games";');

// Fix recommended games layout on server.ts
// In the game page template in server.ts
server = server.replace(/<div class="game-grid">([\s\S]*?)<\/div>/, (match) => {
  return `
      <div class="game-grid">
        \${games.map((game, index) => {
          let spanClass = '';
          const rand = (Math.sin(index + 1) * 10000) - Math.floor(Math.sin(index + 1) * 10000);
          if (rand < 0.12) spanClass = 'span-2x2';
          else if (rand < 0.28) spanClass = 'span-2x1';
          else if (rand < 0.44) spanClass = 'span-1x2';

          return \`
            <article class="game-card \${spanClass}" data-slug="\${game.slug}">
              <a href="/game/\${game.slug}/" class="game-card__link">
                <img src="\${game.image}" alt="\${game.title}" loading="lazy">
                <div class="game-card__info">
                  <h3>\${game.title}</h3>
                </div>
              </a>
            </article>\`;
        }).join("")}
      </div>
  `;
});

// Fix thumbnail extraction in server.ts: card.querySelector("img")
// It's correct.

writeFileSync('server.ts', server);
console.log('server.ts updated');
