import { readFileSync, writeFileSync } from 'fs';

let css = readFileSync('styles.css', 'utf-8');

// Use regex to remove .game-card__media and .game-card__body blocks if they exist
css = css.replace(/\.game-card__media\s*\{[^}]+\}/g, '');
css = css.replace(/\.game-card__body\s*\{[^}]+\}/g, '');
css = css.replace(/\.game-card__title\s*\{[^}]+\}/g, '');
css = css.replace(/\.game-card__cta\s*\{[^}]+\}/g, '');

writeFileSync('styles.css', css);
console.log('CSS cleaned');
