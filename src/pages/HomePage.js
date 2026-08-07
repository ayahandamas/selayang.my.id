import { getAllSurah } from "../services/quranService.js";
import { SurahCard } from "../components/SurahCard.js";

export function HomePage() {

  const surahs = getAllSurah();

  return `
    <section>

      <h2>Daftar Surah</h2>

      <div class="surah-list">
        ${surahs.map(SurahCard).join("")}
      </div>

    </section>
  `;
}
