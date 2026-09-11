import { readFileSync, writeFileSync } from 'fs';

let script = readFileSync('script.js', 'utf-8');

const scrollLogic = `
  // Scroll to Top Button
  const scrollTopBtn = document.getElementById("scroll-to-top");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add("is-visible");
      } else {
        scrollTopBtn.classList.remove("is-visible");
      }
    });
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Search Suggestions
  const suggestionsBox = document.getElementById("search-suggestions");
  let selectedSuggestionIndex = -1;

  if (input && suggestionsBox && cards.length > 0) {
    // Hide when clicking outside
    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.remove("is-active");
      }
    });

    input.addEventListener("focus", () => {
      if (input.value.trim().length > 0 && suggestionsBox.children.length > 0) {
        suggestionsBox.classList.add("is-active");
      }
    });

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        suggestionsBox.classList.remove("is-active");
        suggestionsBox.innerHTML = "";
        return;
      }
      
      const tokens = q.split(/\s+/).filter(Boolean);
      // Find matches (limit 5)
      const matches = cards.filter(card => {
        const text = card.dataset.search?.toLowerCase() || "";
        return tokens.every(t => text.includes(t));
      }).slice(0, 6);

      if (matches.length > 0) {
        suggestionsBox.innerHTML = matches.map((card, i) => {
          const imgUrl = card.querySelector("img")?.src || "";
          const title = card.querySelector("h3")?.textContent || "";
          const slug = card.dataset.slug;
          const searchData = card.dataset.search || "";
          const parts = searchData.split(" ");
          const cat = parts[parts.length - 1] || "Games";
          
          return \`
            <li class="search-suggestion-item" data-index="\${i}" data-slug="\${slug}">
              <img src="\${imgUrl}" class="search-suggestion-img" alt="">
              <div class="search-suggestion-info">
                <span class="search-suggestion-title">\${title}</span>
                <span class="search-suggestion-cat">\${cat}</span>
              </div>
            </li>\`;
        }).join("");
        suggestionsBox.classList.add("is-active");
        selectedSuggestionIndex = -1;
      } else {
        suggestionsBox.classList.remove("is-active");
        suggestionsBox.innerHTML = "";
      }
    });

    suggestionsBox.addEventListener("click", (e) => {
      const item = e.target.closest(".search-suggestion-item");
      if (item) {
        window.location.href = "/game/" + item.dataset.slug + "/";
      }
    });

    input.addEventListener("keydown", (e) => {
      const items = suggestionsBox.querySelectorAll(".search-suggestion-item");
      if (!suggestionsBox.classList.contains("is-active") || items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
        updateSelection(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
        updateSelection(items);
      } else if (e.key === "Enter" && selectedSuggestionIndex > -1) {
        e.preventDefault();
        items[selectedSuggestionIndex].click();
      }
    });

    function updateSelection(items) {
      items.forEach((item, i) => {
        item.classList.toggle("is-selected", i === selectedSuggestionIndex);
      });
    }
  }
`;

// Insert logic at the end of DOMContentLoaded
script = script.replace(/}\);(\s*)$/m, scrollLogic + '\n});$1');
writeFileSync('script.js', script);
console.log('script.js patched');
