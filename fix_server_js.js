import { readFileSync, writeFileSync } from 'fs';

let server = readFileSync('server.ts', 'utf-8');

// The outer string is a backtick string!
server = server.replace(/favBtn\.innerHTML = `<svg/g, 'favBtn.innerHTML = \\`<svg');
server = server.replace(/Saved`;/g, 'Saved\\`;');
server = server.replace(/Favorite`;/g, 'Favorite\\`;');

writeFileSync('server.ts', server);

console.log('Fixed outer backtick escaping');
