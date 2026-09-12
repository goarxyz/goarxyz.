import { ANIME } from "@consumet/extensions";

const hianime = new ANIME.Hianime();

(async () => {
  try {
    const results = await hianime.search("naruto");
    console.log(results.results[0]);
    const info = await hianime.fetchAnimeInfo(results.results[0].id);
    console.log(info.episodes[0]);
    const sources = await hianime.fetchEpisodeSources(info.episodes[0].id);
    console.log(sources);
  } catch (e) {
    console.error(e);
  }
})();
