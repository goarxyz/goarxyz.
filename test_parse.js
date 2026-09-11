import fs from 'fs';
import { parse } from 'node-html-parser';

const html = fs.readFileSync('index.html', 'utf-8');
const root = parse(html);
const cards = root.querySelectorAll('.game-card');

const gamesMap = new Map();
cards.forEach(card => {
  const link = card.querySelector('.game-card__link')?.getAttribute('href');
  if (link && link.includes('/game/')) {
    const slug = link.replace('/game/', '').replace('/', '');
    if (!gamesMap.has(slug)) {
      const title = card.querySelector('h3')?.text.trim() || '';
      gamesMap.set(slug, title);
    }
  }
});
console.log(`Parsed ${gamesMap.size} games. Example:`, Array.from(gamesMap.entries()).slice(0, 3));
