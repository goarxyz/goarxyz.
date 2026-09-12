import fs from 'fs';
let script = fs.readFileSync('script.js', 'utf8').split('\n');

// find the start
let start = -1;
let end = -1;
for (let i = 0; i < script.length; i++) {
  if (script[i].includes('const hubSection = document.getElementById("hub-section");')) {
    start = i - 1; // get the DOMContentLoaded line
  }
  if (start !== -1 && script[i].includes('// --- Anime API (Jikan) ---')) {
    end = i;
    break;
  }
}

if(start !== -1 && end !== -1) {
  script.splice(start, end - start);
  fs.writeFileSync('script.js', script.join('\n'));
  console.log("Removed old switching logic");
} else {
  console.log("Could not find boundaries", start, end);
}
