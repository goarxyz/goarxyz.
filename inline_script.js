      // Service Worker registration in player
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }

      // Favorites handling in player
      const SLUG = "temple-blocks";
      const FAV_KEY = "goarxyz_favorites_v1";
      const OLD_FAV_KEY = "playgama_favorites_v1";
      const favBtn = document.getElementById("theater-fav-btn");

      const getFavs = () => {
        try {
          let raw = localStorage.getItem(FAV_KEY);
          if (!raw) {
            raw = localStorage.getItem(OLD_FAV_KEY);
            if (raw) localStorage.setItem(FAV_KEY, raw);
          }
          return raw ? JSON.parse(raw) : [];
        } catch { return []; }
      };

      const isFav = () => getFavs().includes(SLUG);

      const updateFavUI = () => {
        if (isFav()) {
          favBtn.classList.add("is-fav-active");
          favBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Saved`;
        } else {
          favBtn.classList.remove("is-fav-active");
          favBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Favorite`;
        }
      };

      favBtn.addEventListener("click", () => {
        const favs = getFavs();
        const idx = favs.indexOf(SLUG);
        if (idx > -1) {
          favs.splice(idx, 1);
        } else {
          favs.push(SLUG);
        }
        try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch {}
        updateFavUI();
      });

      updateFavUI();

      // Fullscreen
      const fsBtn = document.getElementById("theater-fullscreen-btn");
      const container = document.getElementById("frame-container");
      fsBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => {
            const iframe = document.getElementById("game-iframe");
            iframe.requestFullscreen().catch(() => {});
          });
        } else {
          document.exitFullscreen();
        }
      });

      // Reload
      document.getElementById("theater-reload-btn").addEventListener("click", () => {
        const iframe = document.getElementById("game-iframe");
        iframe.src = iframe.src;
      });

      // Play Overlay
      const gameOverlay = document.getElementById("game-brand-overlay");
      const btnPlayGame = document.getElementById("btn-play-game");
      const gameIframe = document.getElementById("game-iframe");
      
      if (gameOverlay && btnPlayGame && gameIframe) {
        btnPlayGame.addEventListener("click", () => {
          gameOverlay.classList.add("is-hidden");
          const dataSrc = gameIframe.getAttribute("data-src");
          if (dataSrc && !gameIframe.hasAttribute("src")) {
            gameIframe.setAttribute("src", dataSrc);
          }
        });
      }

      // Share Toast
      const shareBtn = document.getElementById("theater-share-btn");
      const toast = document.getElementById("toast");
      shareBtn.addEventListener("click", () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 2500);
          });
        }
      });
