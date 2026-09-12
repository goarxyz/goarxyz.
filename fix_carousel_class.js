import fs from 'fs';
let script = fs.readFileSync('script.js', 'utf8');

script = script.replace(/querySelector\('\.game-title'\)/g, 'querySelector(\'h3\')');

fs.writeFileSync('script.js', script);
console.log("Fixed carousel class selector");
