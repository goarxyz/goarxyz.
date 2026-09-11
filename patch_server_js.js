import { readFileSync, writeFileSync } from 'fs';

let server = readFileSync('server.ts', 'utf-8');

const svgFav = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

server = server.replace(/favBtn\.innerHTML = "Saved";/g, 'favBtn.innerHTML = `' + svgFav + ' Saved`;');
server = server.replace(/favBtn\.innerHTML = "Favorite";/g, 'favBtn.innerHTML = `' + svgFav + ' Favorite`;');

// Also fix the emojis left in the info panel
server = server.replace(/<span class="hero-tag">⚡ Instant Play<\/span>/, '<span class="hero-tag">Instant Play</span>');
server = server.replace(/<span class="hero-tag">📱 Mobile & Desktop<\/span>/, '<span class="hero-tag">Mobile & Desktop</span>');
server = server.replace(/<span class="hero-tag">© Famobi HTML5<\/span>/, '<span class="hero-tag">Famobi HTML5</span>');

writeFileSync('server.ts', server);

// Also check script.js for innerHTML wipes
let script = readFileSync('script.js', 'utf-8');
script = script.replace(/heroFavBtn\.innerHTML = nowFav \? "Saved" : "Favorite";/g, 'heroFavBtn.innerHTML = nowFav ? `' + svgFav + ' Saved` : `' + svgFav + ' Favorite`;');
script = script.replace(/heroFavBtn\.innerHTML = "Saved";/g, 'heroFavBtn.innerHTML = `' + svgFav + ' Saved`;');
writeFileSync('script.js', script);

console.log('Fixed JS innerHTML toggles');
