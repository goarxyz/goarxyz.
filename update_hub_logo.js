import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

// The hub hero has an old SVG. Let's make sure it's gone and replaced with the logo image.
if (html.includes('<div class="brand__logo-wrap hub-logo">')) {
   // Actually, in modify_shell.js I already replaced the entire hub-hero!
}

