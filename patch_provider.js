import { readFileSync, writeFileSync } from 'fs';

let server = readFileSync('server.ts', 'utf-8');

// 1. Update GameInfo interface
server = server.replace(
  /category: string;\n}/,
  'category: string;\n  provider?: string;\n}'
);

// 2. Parse provider from card
server = server.replace(
  /const category = ([^\n]+)\n\s+const gameInfo: GameInfo = { ([^}]+) };/,
  'const category = $1\n          const provider = card.getAttribute("data-provider") || "famobi";\n          const gameInfo: GameInfo = { $2, provider };'
);

// 3. Update iframe src logic
server = server.replace(
  /<iframe id="game-iframe" src="https:\/\/play\.famobi\.com\/\$\{slug\}\/\?customer=A1000"([^>]+)><\/iframe>/,
  '<iframe id="game-iframe" src="${game.provider === \'gamesnacks\' ? `https://gamesnacks.com/embed/games/${game.slug}` : `https://play.famobi.com/${game.slug}/?customer=A1000`}"$1></iframe>'
);

writeFileSync('server.ts', server);
console.log('server.ts patched for providers');
