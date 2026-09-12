import fs from 'fs';

let js = fs.readFileSync('script.js', 'utf8');

js = js.replace(/currentSystem = sys;/g, "currentSystem = sys;\n    document.body.className = 'system-' + sys;");

fs.writeFileSync('script.js', js);
