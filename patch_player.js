import { readFileSync, writeFileSync } from 'fs';

let server = readFileSync('server.ts', 'utf-8');

const overlayHtml = `
          <div id="game-brand-overlay" class="game-brand-overlay">
            <div class="overlay-brand">
              <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" class="overlay-logo">
                <path d="M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256" fill="none" stroke="#f7f6f2" stroke-width="85" stroke-linecap="square" stroke-linejoin="miter"></path>
                <polygon points="280,200 280,312 180,256" fill="#ff6600"></polygon>
              </svg>
              <h2>\${game.title}</h2>
            </div>
            <button id="btn-play-game" class="btn-play-overlay">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              PLAY NOW
            </button>
          </div>
`;

server = server.replace(
  /<iframe id="game-iframe"[^>]+><\/iframe>/,
  '<iframe id="game-iframe" data-src="$&"></iframe>'
);

server = server.replace(
  /<iframe id="game-iframe" data-src="(<iframe [^>]+><\/iframe>)"><\/iframe>/,
  overlayHtml + '\n          $1'
);

writeFileSync('server.ts', server);
console.log('Player overlay added');
