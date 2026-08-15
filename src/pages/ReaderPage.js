import {
  getSurahListFromApi,
  getSurahAyahsFromApi
} from "../services/quranApiService.js";

export async function ReaderPage() {

  const number = location.hash.split("/")[2];

  try {

    const surahs = await getSurahListFromApi();

    const surah = surahs.find(
      s => s.number === Number(number)
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

    return `
      <section class="page reader-page">

        <h2>${surah.name}</h2>

        <p>${surah.englishName}</p>

        <p>Surah ke-${surah.number}</p>

        <p>${surah.numberOfAyahs} Ayat</p>

        <div class="ayah-list">

          ${arabic.ayahs.map((ayah, index) => {

            let arabicText = ayah.text;

            /*
             * Al-Fatihah:
             * Bismillah tetap menjadi bagian ayat 1.
             *
             * Surah lainnya:
             * Bismillah dihapus dari awal ayat pertama.
             */

            if (
              Number(number) !== 1 &&
              ayah.numberInSurah === 1
            ) {

              const bismillah =
                "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

              if (arabicText.startsWith(bismillah)) {
                arabicText = arabicText
                  .slice(bismillah.length)
                  .trim();
              }
            }

            return `
              <article class="ayah-card">

                <div class="ayah-number">
                  ${ayah.numberInSurah}
                </div>

                <div class="ayah-content">

                  <p class="ayah-arabic">
                    ${arabicText}
                  </p>

                  <p class="ayah-indonesia">
                    ${indonesia.ayahs[index].text}
                  </p>

                </div>

              </article>
            `;

          }).join("")}

        </div>

      </section>
    `;

  } catch (error) {

    console.error(error);

    return `
      <section class="page">
        <h2>📖 Reader</h2>
        <p>Gagal mengambil data Al-Qur'an dari API.</p>
      </section>
    `;
  }
}
