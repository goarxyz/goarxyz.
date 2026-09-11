import { readFileSync, writeFileSync } from 'fs';

let script = readFileSync('script.js', 'utf-8');

const staggerLogic = `
  // Stagger Animations for Game Cards
  const observer = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = \`\${delay}ms\`;
        delay += 30; // 30ms stagger
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px 50px 0px', threshold: 0.1 });

  cards.forEach(card => {
    observer.observe(card);
  });
`;

script = script.replace(/updateFavBadges\(\);/, 'updateFavBadges();\n' + staggerLogic);

writeFileSync('script.js', script);
console.log('Stagger logic added');
