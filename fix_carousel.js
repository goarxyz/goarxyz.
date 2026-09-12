import fs from 'fs';

let script = fs.readFileSync('script.js', 'utf8');

const carouselFix = `
// Populate Carousel
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  if(track && track.children.length === 0) {
    // get top 5 games from the grid
    const games = Array.from(document.querySelectorAll('.game-card')).slice(0, 5);
    games.forEach(g => {
       const href = g.getAttribute('href');
       const img = g.querySelector('img').src;
       const title = g.querySelector('.game-title').textContent;
       
       const slide = document.createElement('a');
       slide.className = 'carousel-slide';
       slide.href = href;
       slide.innerHTML = \`<img src="\${img}" alt="\${title}"> <div class="carousel-caption">\${title}</div>\`;
       track.appendChild(slide);
    });
  }
});
`;

fs.writeFileSync('script.js', script + '\n' + carouselFix);
console.log("Carousel fixed");
