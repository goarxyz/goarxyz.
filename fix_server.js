import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('server.ts', 'utf-8');
code = code.replace(/\\\$\{recommended\.map/g, '${recommended.map');
writeFileSync('server.ts', code);
