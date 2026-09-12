import fs from 'fs';
let script = fs.readFileSync('script.js', 'utf8');

script = script.replace(/const videoId = item\.videoId;/g, 'const videoId = item.videoId || item.id;');
script = script.replace(/let thumb = "";/g, 'let thumb = item.thumbnail || "";');
script = script.replace(/const artist = .*/g, 'const artist = item.artist || (item.author && item.author.name) || "Unknown";');

fs.writeFileSync('script.js', script);
console.log("Fixed music display parser");
