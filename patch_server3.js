import { readFileSync, writeFileSync } from 'fs';

let server = readFileSync('server.ts', 'utf-8');
server = server.replace(/\$\{games\.map/g, '\\${recommended.map');

writeFileSync('server.ts', server);
console.log('server.ts updated');
