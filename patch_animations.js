import { readFileSync, writeFileSync } from 'fs';

let css = readFileSync('styles.css', 'utf-8');

css = css.replace(/animation: none; \/\* remove pop animation for cleaner look \*\//, 'opacity: 0; animation: fadeUpIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;');

if (!css.includes('@keyframes fadeUpIn')) {
  css += `
@keyframes fadeUpIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
}

// Stagger logic in JS instead of CSS to make it work dynamically, or just add a CSS child-nth delay logic.
// For performance with 600+ nodes, child-nth is bad. We can just let them all fade in or do it via JS.
// Actually, I can just use a simple animation without delay, it still looks good and cohesive.

writeFileSync('styles.css', css);
console.log('Animations updated');
