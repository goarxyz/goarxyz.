import { readFileSync, writeFileSync } from 'fs';

// 1. Clean index.html
let html = readFileSync('index.html', 'utf-8');
// Remove category icons
html = html.replace(/<span class="category-icon">.*?<\/span>\s*/g, '');
// Replace emojis in header buttons
html = html.replace(/<span>⚡<\/span>\s*/g, '');
html = html.replace(/<span>🎲<\/span>\s*/g, '');
html = html.replace(/<span>❤️<\/span>\s*/g, '');
writeFileSync('index.html', html);

// 2. Clean server.ts
let server = readFileSync('server.ts', 'utf-8');
// Remove category icons
server = server.replace(/<span class="category-icon">.*?<\/span>\s*/g, '');
// Replace emojis in header buttons
server = server.replace(/<span>⚡<\/span>\s*/g, '');
server = server.replace(/<span>🎲<\/span>\s*/g, '');
server = server.replace(/<span>❤️<\/span>\s*/g, '');
server = server.replace(/<span>❤️<\/span>\s*/g, '');
writeFileSync('server.ts', server);

// 3. Clean script.js
let script = readFileSync('script.js', 'utf-8');
script = script.replace(/favBtn\.innerHTML = "❤️";/g, 'favBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;');
script = script.replace(/heroFavBtn\.innerHTML = nowFav \? "<span>❤️<\/span> Saved" : "<span>❤️<\/span> Favorite";/g, 'heroFavBtn.innerHTML = nowFav ? "Saved" : "Favorite";');
script = script.replace(/heroFavBtn\.innerHTML = "<span>❤️<\/span> Saved";/g, 'heroFavBtn.innerHTML = "Saved";');
script = script.replace(/installBtn\.innerHTML = "<span>✓<\/span> Installed";/g, 'installBtn.innerHTML = "Installed";');
writeFileSync('script.js', script);

console.log('Emojis removed');
