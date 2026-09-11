import { readFileSync, writeFileSync } from 'fs';

let server = readFileSync('server.ts', 'utf-8');

// The current iframe tag looks like this:
// <iframe id="game-iframe" src="${...}" allow="autoplay; fullscreen; gamepad" allowfullscreen></iframe>
// We need to change src to data-src

server = server.replace(
  /<iframe id="game-iframe" src="([^"]+)"/,
  '<iframe id="game-iframe" data-src="$1"'
);

writeFileSync('server.ts', server);
console.log('Iframe src changed to data-src');
