import {
  getSurahListFromApi,
  getSurahAyahsFromApi
} from "../services/quranApiService.js";

let currentAudio = null;
let currentButton = null;

export async function ReaderPage() {
  const number = Number(location.hash.split("/")[2]);

  try {
    const surahs = await getSurahListFromApi();

    const surah = surahs.find(
      (s) => s.number === number
    );

    if (!surah) {
      return `
        <section class="page">
          <h2>📖 Reader</h2>
          <p>Surah tidak ditemukan.</p>
        </section>
      `;
    }

    const editions = await getSurahAyahsFromApi(number);

    const arabic = editions[0];
    const indonesia = editions[1];
    const audio = editions[2];

    const html = `
      <section class="page reader-page">

        <header class="reader-header">
          <h2>${surah.name}</h2>
          <p>${surah.englishName}</p>
          <p>Surah ke-${surah.number} · ${surah.numberOfAyahs} Ayat</p>
        </header>

        <div class="ayah-list">

          ${arabic.ayahs.map((ayah, index) => {

            const translation =
              indonesia?.ayahs?.[index]?.text || "";

            const audioUrl =
              audio?.ayahs?.[index]?.audio || "";

            return `
              <article class="ayah-card">

                <div class="ayah-number">
                  ${ayah.numberInSurah}
                </div>

                <div class="ayah-content">

                  <div class="ayah-arabic" dir="rtl">
                    ${ayah.text}
                  </div>

                  <p class="ayah-indonesia">
                    ${translation}
                  </p>

                  ${
                    audioUrl
                      ? `
                        <button
                          class="ayah-audio-button"
                          type="button"
                          data-audio="${audioUrl}"
                          aria-label="Putar audio ayat ${ayah.numberInSurah}"
                        >
                          ▶️ Putar Ayat
                        </button>
                      `
                      : `
                        <span class="ayah-audio-unavailable">
                          Audio tidak tersedia
                        </span>
                      `
                  }

                </div>

              </article>
            `;
          }).join("")}

        </div>

        <nav class="reader-navigation">

          ${
            number > 1
              ? `
                <a
                  href="#/reader/${number - 1}"
                  class="reader-nav-button"
                >
                  ← Surah Sebelumnya
                </a>
              `
              : `
                <span class="reader-nav-button disabled">
                  ← Surah Sebelumnya
                </span>
              `
          }

          <a
            href="#/"
            class="reader-nav-button reader-nav-home"
          >
            📖 Daftar Surah
          </a>

          ${
            number < 114
              ? `
                <a
                  href="#/reader/${number + 1}"
                  class="reader-nav-button"
                >
                  Surah Berikutnya →
                </a>
              `
              : `
                <span class="reader-nav-button disabled">
                  Surah Berikutnya →
                </span>
              `
          }

        </nav>

      </section>
    `;

    /*
     * Pasang event audio setelah HTML Reader
     * selesai dimasukkan ke DOM.
     */
    setTimeout(() => {

      const buttons = document.querySelectorAll(
        ".ayah-audio-button"
      );

      buttons.forEach((button) => {

        button.addEventListener("click", () => {

          const audioUrl = button.dataset.audio;

          if (!audioUrl) {
            return;
          }

          /*
           * Jika tombol yang sama sedang dimainkan:
           * pause.
           */
          if (
            currentAudio &&
            currentButton === button
          ) {

            if (!currentAudio.paused) {
              currentAudio.pause();
              button.textContent = "▶️ Putar Ayat";
            } else {
              currentAudio.play();
              button.textContent = "⏸️ Pause";
            }

            return;
          }

          /*
           * Hentikan audio sebelumnya.
           */
          if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
          }

          if (currentButton) {
            currentButton.textContent = "▶️ Putar Ayat";
          }

          /*
           * Buat audio baru.
           */
          const newAudio = new Audio(audioUrl);

          currentAudio = newAudio;
          currentButton = button;

          button.textContent = "⏸️ Pause";

          newAudio.play().catch((error) => {

            console.error(
              "Gagal memutar audio:",
              error
            );

            button.textContent = "▶️ Putar Ayat";
            currentAudio = null;
            currentButton = null;
          });

          /*
           * Kembalikan tombol setelah audio selesai.
           */
          newAudio.addEventListener(
            "ended",
            () => {

              button.textContent = "▶️ Putar Ayat";

              if (currentAudio === newAudio) {
                currentAudio = null;
                currentButton = null;
              }

            }
          );

        });

      });

    }, 0);

    return html;

  } catch (error) {

    console.error(error);

    return `
      <section class="page">
        <h2>📖 Reader</h2>
        <p>Gagal memuat surah.</p>
        <p>Silakan coba lagi.</p>
      </section>
    `;
  }
}
