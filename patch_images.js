import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf-8');
let server = readFileSync('server.ts', 'utf-8');

html = html.replace(/<img src="([^"]+)" alt="([^"]+)" loading="lazy">/g, '<img src="$1" alt="$2" loading="lazy" onerror="this.src=\'data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' viewBox=\\\'0 0 512 512\\\' fill=\\\'none\\\' stroke=\\\'%23ff6600\\\' stroke-width=\\\'40\\\'><polygon points=\\\'280,200 280,312 180,256\\\' fill=\\\'%23ff6600\\\' stroke=\\\'none\\\'></polygon><path d=\\\'M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256\\\'></path></svg>\'; this.onerror=null; this.style.objectFit=\'contain\'; this.style.padding=\'24px\';">');

server = server.replace(/<img src="(\$\{g\.img\}|\$\{game\.image\})" alt="([^"]+)" loading="lazy">/g, '<img src="$1" alt="$2" loading="lazy" onerror="this.src=\'data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' viewBox=\\\'0 0 512 512\\\' fill=\\\'none\\\' stroke=\\\'%23ff6600\\\' stroke-width=\\\'40\\\'><polygon points=\\\'280,200 280,312 180,256\\\' fill=\\\'%23ff6600\\\' stroke=\\\'none\\\'></polygon><path d=\\\'M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256\\\'></path></svg>\'; this.onerror=null; this.style.objectFit=\'contain\'; this.style.padding=\'24px\';">');

// Featured card image replace
server = server.replace(/<img src="\$\{g\.img\}" alt="\$\{g\.title\}" loading="lazy">/g, '<img src="${g.img}" alt="${g.title}" loading="lazy" onerror="this.src=\'data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' viewBox=\\\'0 0 512 512\\\' fill=\\\'none\\\' stroke=\\\'%23ff6600\\\' stroke-width=\\\'40\\\'><polygon points=\\\'280,200 280,312 180,256\\\' fill=\\\'%23ff6600\\\' stroke=\\\'none\\\'></polygon><path d=\\\'M 370 80 L 190 80 L 80 190 L 80 322 L 190 432 L 340 432 L 430 342 L 430 256 L 310 256\\\'></path></svg>\'; this.onerror=null; this.style.objectFit=\'contain\'; this.style.padding=\'24px\';">');

writeFileSync('index.html', html);
writeFileSync('server.ts', server);

console.log('onerror attribute added to all images');
