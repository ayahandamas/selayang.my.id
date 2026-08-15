import { getSurahListFromApi } from "../services/quranApiService.js";
import { SurahCard } from "../components/SurahCard.js";

export async function HomePage() {
  const surahs = await getSurahListFromApi();

  return `
    <section class="page">

      <h2>Daftar Surah</h2>

      <div class="surah-list">
        ${surahs.map(SurahCard).join("")}
      </div>

    </section>
  `;
}