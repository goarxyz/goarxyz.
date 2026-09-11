import { readFileSync, writeFileSync } from 'fs';

let script = readFileSync('script.js', 'utf-8');

script = script.replace(/if \(dataSrc && !gameIframe\.src\) \{[\s\S]*?\}/, 'if (dataSrc && !gameIframe.hasAttribute("src")) {\n        gameIframe.setAttribute("src", dataSrc);\n      }');

writeFileSync('script.js', script);
console.log('Fixed iframe JS');
