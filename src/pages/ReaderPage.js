import {
  getSurahListFromApi,
  getSurahAyahsFromApi
} from "../services/quranApiService.js";

let currentAudio = null;
let currentButton = null;

const BISMILLAH =
  "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

const BISMILLAH_REGEX =
  /^\s*بِسْمِ\s+[ٱا]للَّهِ\s+[ٱا]لرَّحْمَٰنِ\s+[ٱا]لرَّحِيمِ\s*/u;

function removeBismillah(text) {
  return text.replace(BISMILLAH_REGEX, "").trim();
}

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (currentButton) {
    currentButton.textContent = "🔊";
    currentButton.classList.remove("playing");
    currentButton = null;
  }
}

function createAudioButton(audioUrl) {
  if (!audioUrl) {
    return null;
  }

  const button = document.createElement("button");

  button.type = "button";
  button.className = "ayah-audio-button";
  button.textContent = "🔊";
  button.title = "Putar ayat";
  button.setAttribute("aria-label", "Putar audio ayat");

  button.addEventListener("click", () => {
    if (!audioUrl) {
      return;
    }

    /*
     * Jika tombol yang sama sedang aktif:
     * toggle pause / play.
     */
    if (currentAudio && currentButton === button) {
      if (currentAudio.paused) {
        currentAudio.play().catch((error) => {
          console.error("Audio tidak dapat diputar:", error);
        });

        button.textContent = "⏸";
        button.classList.add("playing");
      } else {
        currentAudio.pause();

        button.textContent = "🔊";
        button.classList.remove("playing");
      }

      return;
    }

    /*
     * Hentikan audio sebelumnya.
     */
    stopCurrentAudio();

    const audio = new Audio(audioUrl);

    currentAudio = audio;
    currentButton = button;

    button.textContent = "⏸";
    button.classList.add("playing");

    audio.addEventListener("ended", () => {
      if (currentAudio === audio) {
        button.textContent = "🔊";
        button.classList.remove("playing");

        currentAudio = null;
        currentButton = null;
      }
    });

    audio.addEventListener("error", () => {
      console.error("Gagal memuat audio ayat.");

      if (currentAudio === audio) {
        button.textContent = "🔊";
        button.classList.remove("playing");

        currentAudio = null;
        currentButton = null;
      }
    });

    audio.play().catch((error) => {
      console.error("Audio tidak dapat diputar:", error);

      if (currentAudio === audio) {
        button.textContent = "🔊";
        button.classList.remove("playing");

        currentAudio = null;
        currentButton = null;
      }
    });
  });

  return button;
}

export async function ReaderPage() {
  /*
   * Router menggunakan URL:
   * #/reader/1
   * #/reader/2
   * dst.
   */
  const hash = window.location.hash || "#/reader/1";

  const match = hash.match(/^#\/reader\/(\d+)$/);

  const surahNumber = match
    ? Number(match[1])
    : 1;

  stopCurrentAudio();

  try {
    /*
     * Ambil daftar surah.
     */
    const surahs = await getSurahListFromApi();

    const surah = surahs.find(
      (item) => Number(item.number) === surahNumber
    );

    if (!surah) {
      return `
        <section class="page reader-page">
          <div class="reader-error">
            <h2>Surah tidak ditemukan</h2>
            <p>Nomor surah tidak valid.</p>
          </div>
        </section>
      `;
    }

    /*
     * Ambil:
     * 0 = Arabic Uthmani
     * 1 = Indonesian translation
     * 2 = Alafasy audio
     */
    const editions =
      await getSurahAyahsFromApi(surahNumber);

    const arabicEdition = editions?.[0];
    const translationEdition = editions?.[1];
    const audioEdition = editions?.[2];

    const arabicAyahs =
      arabicEdition?.ayahs || [];

    const translationAyahs =
      translationEdition?.ayahs || [];

    const audioAyahs =
      audioEdition?.ayahs || [];

    if (!arabicAyahs.length) {
      throw new Error("Data ayat tidak ditemukan.");
    }

    const isFatihah = surahNumber === 1;
    const isTaubah = surahNumber === 9;

    /*
     * Bismillah:
     *
     * Al-Fatihah:
     * tetap mengikuti teks ayat pertama.
     *
     * Surah selain Al-Fatihah dan At-Taubah:
     * tampilkan sebagai header tersendiri.
     *
     * At-Taubah:
     * tidak menampilkan Bismillah.
     */
    const showBismillahHeader =
      !isFatihah && !isTaubah;

    const bismillahHeader =
      showBismillahHeader
        ? `
          <div
            class="ayah-arabic bismillah"
            dir="rtl"
            aria-label="Bismillah"
          >
            ${BISMILLAH}
          </div>
        `
        : "";

    /*
     * Buat HTML utama.
     *
     * Audio dan ayat akan dimasukkan
     * setelah content ini dirender oleh Layout.
     */
    const html = `
      <section class="page reader-page">

        <header class="reader-header">

          <div class="reader-title">
            <h1>${surah.name}</h1>

            <div class="reader-subtitle">
              ${surah.englishName || ""}
            </div>

            <div class="reader-meta">
              Surah ${surah.number}
              • ${surah.numberOfAyahs} Ayat
            </div>
          </div>

        </header>

        ${bismillahHeader}

        <div class="ayah-list">
        </div>

        <nav class="reader-navigation">

          ${
            surahNumber > 1
              ? `
                <a
                  href="#/reader/${surahNumber - 1}"
                  class="reader-nav-button"
                >
                  ← Surah Sebelumnya
                </a>
              `
              : `
                <span
                  class="reader-nav-button disabled"
                >
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
            surahNumber < 114
              ? `
                <a
                  href="#/reader/${surahNumber + 1}"
                  class="reader-nav-button"
                >
                  Surah Berikutnya →
                </a>
              `
              : `
                <span
                  class="reader-nav-button disabled"
                >
                  Surah Berikutnya →
                </span>
              `
          }

        </nav>

      </section>
    `;

    /*
     * Setelah Layout memasukkan HTML ke DOM,
     * kita perlu membangun ayat dan tombol audio.
     */
    setTimeout(() => {
      const page =
        document.querySelector(".reader-page");

      if (!page) {
        return;
      }

      const ayahList =
        page.querySelector(".ayah-list");

      if (!ayahList) {
        return;
      }

      arabicAyahs.forEach((ayah, index) => {
        const translation =
          translationAyahs[index];

        const audio =
          audioAyahs[index];

        let arabicText =
          ayah.text || "";

        /*
         * Untuk surah selain Al-Fatihah:
         * Bismillah dari API pada ayat pertama
         * dihapus karena sudah ditampilkan
         * sebagai header.
         */
        if (
          !isFatihah &&
          ayah.numberInSurah === 1
        ) {
          arabicText =
            removeBismillah(arabicText);
        }

        const card =
          document.createElement("article");

        card.className = "ayah-card";

        const topRow =
          document.createElement("div");

        topRow.className =
          "ayah-top-row";

        const ayahNumber =
          document.createElement("div");

        ayahNumber.className =
          "ayah-number";

        ayahNumber.textContent =
          ayah.numberInSurah;

        const audioButton =
          createAudioButton(audio?.audio);

        topRow.appendChild(ayahNumber);

        if (audioButton) {
          topRow.appendChild(audioButton);
        }

        const content =
          document.createElement("div");

        content.className =
          "ayah-content";

        const arabic =
          document.createElement("div");

        arabic.className =
          "ayah-arabic";

        arabic.setAttribute(
          "dir",
          "rtl"
        );

        arabic.textContent =
          arabicText;

        const indonesia =
          document.createElement("p");

        indonesia.className =
          "ayah-indonesia";

        indonesia.textContent =
          translation?.text ||
          "Terjemahan tidak tersedia.";

        content.appendChild(arabic);
        content.appendChild(indonesia);

        card.appendChild(topRow);
        card.appendChild(content);

        ayahList.appendChild(card);
      });
    }, 0);

    return html;

  } catch (error) {
    console.error(
      "Gagal memuat Reader:",
      error
    );

    return `
      <section class="page reader-page">

        <div class="reader-error">

          <h2>
            Gagal memuat Al-Qur'an
          </h2>

          <p>
            Terjadi masalah saat mengambil
            data ayat.
          </p>

          <p>
            Silakan refresh halaman dan coba lagi.
          </p>

        </div>

      </section>
    `;
  }
}