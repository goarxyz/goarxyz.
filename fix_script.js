import { readFileSync, writeFileSync } from 'fs';

let script = readFileSync('script.js', 'utf-8');

// Strip out everything between "// Favorites Header Button" and "// Scroll to Top Button"
const startStr = "// Favorites Header Button";
const endStr = "// Scroll to Top Button";
const startIndex = script.indexOf(startStr);
const endIndex = script.indexOf(endStr);

if (startIndex > -1 && endIndex > -1) {
  const replacement = `// Navigation & Favorites
  const handleFavToggle = (btn) => {
    const isCurrentlyFav = btn.classList.contains("is-active");
    if (isCurrentlyFav) {
      favHeaderBtn?.classList.remove("is-active");
      bottomFavBtn?.classList.remove("is-active");
      applyFilter("", "all");
    } else {
      favHeaderBtn?.classList.add("is-active");
      bottomFavBtn?.classList.add("is-active");
      applyFilter("", "favorites");
      gamesSection?.scrollIntoView({ behavior: "smooth" });
    }
  };
  favHeaderBtn?.addEventListener("click", (e) => { e.preventDefault(); handleFavToggle(favHeaderBtn); });
  bottomFavBtn?.addEventListener("click", (e) => { e.preventDefault(); handleFavToggle(bottomFavBtn); });
  
  const navItems = Array.from(document.querySelectorAll(".nav-item, .bottom-nav-item"));
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      const cat = item.dataset.nav;
      if (cat === "favorites") return; // Handled above
      if (cat === "home") {
        if(window.location.pathname === "/") {
          e.preventDefault();
          navItems.forEach(p => p.classList.remove("is-active"));
          navItems.filter(p => p.dataset.nav === "home").forEach(p => p.classList.add("is-active"));
          favHeaderBtn?.classList.remove("is-active");
          bottomFavBtn?.classList.remove("is-active");
          if (input) input.value = "";
          applyFilter("", "all");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        // Just let it navigate to /category/:cat/ natively
      }
    });
  });

  `;
  
  script = script.slice(0, startIndex) + replacement + script.slice(endIndex);
  writeFileSync('script.js', script);
  console.log("script.js fixed");
}
