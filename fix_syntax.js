import fs from 'fs';
let script = fs.readFileSync('script.js', 'utf8').split('\n');

const brokenIndex = script.findIndex(l => l.includes('const q = e.target.value.trim();'));
if (brokenIndex !== -1) {
   script.splice(brokenIndex, 3); // removes const q..., if(q)... else...
   const nextBracket = script.findIndex((l, i) => i >= brokenIndex && l.includes('}, 500);'));
   if (nextBracket !== -1) script.splice(nextBracket, 1);
   const nextParen = script.findIndex((l, i) => i >= brokenIndex && l.includes('});'));
   if (nextParen !== -1) script.splice(nextParen, 1);
}
fs.writeFileSync('script.js', script.join('\n'));
