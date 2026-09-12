import fs from 'fs';

let script = fs.readFileSync('script.js', 'utf8');

const oldLink = '<a href="${item.url}" target="_blank" style="display:inline-block;background:var(--brand-orange);color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">View on MyAnimeList</a>';
const newLinks = `
  <div style="display:flex;gap:12px;margin-top:16px;">
    <button class="watch-anime-btn" data-anime-data='\${JSON.stringify(item).replace(/'/g, "&#39;")}' style="background:var(--brand-orange);color:#000;padding:12px 24px;border-radius:8px;border:none;font-weight:bold;cursor:pointer;">Watch Now</button>
    <a href="\${item.url}" target="_blank" style="display:inline-block;background:var(--surface);color:var(--text);padding:12px 24px;border-radius:8px;border:1px solid var(--line);text-decoration:none;font-weight:bold;">View on MAL</a>
  </div>
`;

script = script.replace(oldLink, newLinks);

const playerLogic = `
  // --- Anime Player Logic ---
  const animePlayerModal = document.getElementById('anime-player-modal');
  const animePlayerClose = document.getElementById('anime-player-close');
  const animePlayerIframe = document.getElementById('anime-player-iframe');
  const animePlayerPlaceholder = document.getElementById('anime-player-placeholder');
  const animePlayerTitle = document.getElementById('anime-player-title');
  const animePlayerEpTitle = document.getElementById('anime-player-episode-title');
  const animePlayerEpList = document.getElementById('anime-player-episodes-list');

  if(animePlayerClose) {
    animePlayerClose.addEventListener('click', () => {
      animePlayerModal.style.display = 'none';
      animePlayerIframe.src = ''; // Stop video
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('.watch-anime-btn')) {
      const btn = e.target.closest('.watch-anime-btn');
      const itemData = JSON.parse(btn.getAttribute('data-anime-data'));
      // close the info modal
      const aModal = document.getElementById("anime-modal");
      if(aModal) {
         aModal.classList.remove("show");
         aModal.style.display = "none";
      }
      openAnimePlayer(itemData);
    }
  });

  function openAnimePlayer(anime) {
    animePlayerTitle.textContent = anime.title;
    animePlayerModal.style.display = 'flex';
    
    // Generate Episodes
    const totalEpisodes = anime.episodes || 12; // fallback
    animePlayerEpList.innerHTML = '';
    
    for (let i = 1; i <= totalEpisodes; i++) {
      const btn = document.createElement('div');
      btn.className = 'anime-episode-btn';
      if (i === 1) btn.classList.add('active');
      btn.innerHTML = \`<div class="anime-episode-number">\${i}</div><div class="anime-episode-title">Episode \${i}</div>\`;
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('.anime-episode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        animePlayerEpTitle.textContent = 'Episode ' + i;
        playEpisode(anime, i);
      });
      animePlayerEpList.appendChild(btn);
    }
    
    // Play Ep 1
    animePlayerEpTitle.textContent = 'Episode 1';
    playEpisode(anime, 1);
  }

  function playEpisode(anime, epNum) {
    // If trailer exists, use it as a dummy video. Otherwise show placeholder.
    if (anime.trailer && anime.trailer.embed_url) {
      animePlayerIframe.style.display = 'block';
      animePlayerPlaceholder.style.display = 'none';
      animePlayerIframe.src = anime.trailer.embed_url + '&autoplay=1';
    } else {
      animePlayerIframe.style.display = 'none';
      animePlayerPlaceholder.style.display = 'flex';
      animePlayerIframe.src = '';
    }
  }
`;

fs.writeFileSync('script.js', script + '\n' + playerLogic);
console.log('Appended anime player logic to script.js');
