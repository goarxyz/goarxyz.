import { readFileSync, writeFileSync } from 'fs';

let css = readFileSync('styles.css', 'utf-8');

const regex = /\/\* SKELETON LOADING \*\/[\s\S]*?(?=\/\* SCROLL TO TOP BUTTON \*\/)/;
css = css.replace(regex, '');

writeFileSync('styles.css', css);
console.log('Skeleton loading styles removed');
