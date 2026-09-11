import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'node-html-parser';

const html = readFileSync('index.html', 'utf-8');
const root = parse(html, { blockTextElements: { script: true, style: true } });

const headings = root.querySelectorAll('.section-heading');
headings.forEach(h => h.remove());

writeFileSync('index.html', root.toString());
