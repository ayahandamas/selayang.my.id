import { searchQuranFromApi } from "../services/quranApiService.js";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

export function SearchPage() {
  setTimeout(() => {
    const page = document.querySelector(".search-page");

    if (!page) {
      return;
    }

    const form = page.querySelector(".search-form");
    const input = page.querySelector(".search-input");
    const results = page.querySelector(".search-results");

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const keyword = input.value.trim();

      if (!keyword) {
        results.innerHTML = `
          <div class="search-empty">
            Silakan masukkan kata yang ingin dicari.
          </div>
        `;

        return;
      }

      results.innerHTML = `
        <div class="search-loading">
          🔎 Mencari "${escapeHtml(keyword)}"...
        </div>
      `;

      try {
        const matches =
          await searchQuranFromApi(keyword);

        if (!matches.length) {
          results.innerHTML = `
            <div class="search-empty">
              <h3>Tidak ditemukan</h3>
              <p>
                Tidak ada ayat yang cocok dengan
                kata "<strong>${escapeHtml(keyword)}</strong>".
              </p>
            </div>
          `;

          return;
        }

        results.innerHTML = `
          <div class="search-summary">
            Ditemukan
            <strong>${matches.length}</strong>
            hasil untuk
            "<strong>${escapeHtml(keyword)}</strong>"
          </div>

          ${matches.map((match) => `
            <article class="search-result-card">

              <div class="search-result-header">

                <div>
                  <strong>
                    ${escapeHtml(match.surah?.name || "")}
                  </strong>

                  <span>
                    Ayat ${escapeHtml(match.numberInSurah)}
                  </span>
                </div>

                <a
                  href="#/reader/${escapeHtml(match.surah?.number || "")}"
                  class="search-read-button"
                >
                  Baca
                </a>

              </div>

              <div
                class="search-arabic"
                dir="rtl"
              >
                ${escapeHtml(match.text || "")}
              </div>

              <div class="search-translation">
                ${escapeHtml(match.translation || "")}
              </div>

            </article>
          `).join("")}
        `;

      } catch (error) {
        console.error(
          "Gagal mencari Al-Qur'an:",
          error
        );

        results.innerHTML = `
          <div class="search-error">
            <h3>Pencarian gagal</h3>
            <p>
              Terjadi masalah saat mengambil
              data dari API.
            </p>
            <p>
              Silakan coba lagi.
            </p>
          </div>
        `;
      }
    });
  }, 0);

  return `
    <section class="page search-page">

      <div class="search-header">

        <h1>🔍 Cari Al-Qur'an</h1>

        <p>
          Cari kata atau kalimat dalam
          terjemahan Al-Qur'an.
        </p>

      </div>

      <form
        class="search-form"
        autocomplete="off"
      >

        <input
          type="search"
          class="search-input"
          placeholder="Contoh: sabar, rezeki, shalat..."
          aria-label="Cari Al-Qur'an"
        />

        <button
          type="submit"
          class="search-button"
        >
          🔍 Cari
        </button>

      </form>

      <div class="search-results"></div>

    </section>
  `;
}