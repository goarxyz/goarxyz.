import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

// The new bottom nav starts with <nav class="bottom-nav" id="main-bottom-nav" style="display:none;">
// and ends with </nav>

// Then there's stuff down to </body></html>. The old music player starts with <div id="music-player" class="music-player" style="display: none;">
// I'll replace everything from that old music player to the end of body.

const oldPlayerStart = '<div id="music-player" class="music-player" style="display: none;">';
const idx = html.indexOf(oldPlayerStart);

if(idx !== -1) {
  html = html.substring(0, idx) + '</body></html>';
  fs.writeFileSync('index.html', html);
  console.log("Cleaned up old music player from bottom");
}
