import { getSurahListFromApi } from "../services/quranApiService.js";
import { SurahCard } from "../components/SurahCard.js";

export async function HomePage() {
  try {
    const surahs = await getSurahListFromApi();

    return `
      <section class="page home-page">

        <header class="home-header">

          <div>
            <p class="home-eyebrow">
              📖 Al-Qur'an Digital
            </p>

            <h1>
              Daftar Surah
            </h1>

            <p class="home-subtitle">
              Baca Al-Qur'an dengan teks Arab,
              terjemahan Indonesia, dan audio.
            </p>
          </div>

          <div class="home-surah-count">
            <strong>${surahs.length}</strong>
            <span>Surah</span>
          </div>

        </header>

        <div class="surah-list">
          ${surahs.map(SurahCard).join("")}
        </div>

      </section>
    `;

  } catch (error) {
    console.error(
      "Gagal mengambil daftar surah:",
      error
    );

    return `
      <section class="page home-page">

        <div class="home-error">

          <h2>Daftar Surah tidak dapat dimuat</h2>

          <p>
            Terjadi masalah saat mengambil
            data dari API Al-Qur'an.
          </p>

          <button
            class="home-retry-button"
            onclick="location.reload()"
          >
            Coba Lagi
          </button>

        </div>

      </section>
    `;
  }
}