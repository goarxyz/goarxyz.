import fs from 'fs';
let script = fs.readFileSync('script.js', 'utf8');

// Fix `\``
script = script.replace(/\\`/g, '`');

// Fix `\${`
script = script.replace(/\\\${/g, '${');

fs.writeFileSync('script.js', script);
