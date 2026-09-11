import { readFileSync, writeFileSync } from 'fs';

const oldLogoHTML = /<svg viewBox="0 0 512 512" fill="none" xmlns="http:\/\/www\.w3\.org\/2000\/svg">.*?<\/svg>/s;
const newLogoHTML = `<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256" fill="none" stroke="#f7f6f2" stroke-width="85" stroke-linecap="square" stroke-linejoin="miter"></path>
      <polygon points="280,200 280,312 180,256" fill="#ff6600"></polygon>
    </svg>`;

let indexContent = readFileSync('index.html', 'utf-8');
indexContent = indexContent.replace(oldLogoHTML, newLogoHTML);
writeFileSync('index.html', indexContent);

let serverContent = readFileSync('server.ts', 'utf-8');
serverContent = serverContent.replace(oldLogoHTML, newLogoHTML);
writeFileSync('server.ts', serverContent);

console.log('Logo updated');
