import { readFileSync, writeFileSync } from 'fs';
let script = readFileSync('script.js', 'utf-8');

// The file has a major syntax error where a block was left dangling.
// I will just use regex to replace from `// Ignore old handler:` down to `});\n\n  // Scroll to Top Button`
const fixRegex = /\/\/ Ignore old handler:[\s\S]*?(?=\/\/ Scroll to Top Button)/;
script = script.replace(fixRegex, '');

// Verify if there are hanging brackets at the end
if (script.endsWith('});\n});\n')) {
  script = script.replace(/}\);\n}\);\n$/, '});\n');
}

writeFileSync('script.js', script);
