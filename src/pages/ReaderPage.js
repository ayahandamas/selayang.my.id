import { getSurahByNumber, getAyahBySurah } from "../services/quranService.js";

export function ReaderPage() {

  const number = location.hash.split("/")[2];

  const surah = getSurahByNumber(number);
  const ayahs = getAyahBySurah(number);
  if (!surah) {
    return `
      <section class="page">
        <h2>📖 Reader</h2>
        <p>Surah tidak ditemukan.</p>
      </section>
    `;
  }

  return `
    <section class="page">

      <h2>${surah.name}</h2>

      <p>${surah.englishName}</p>

      <p>Surah ke-${surah.number}</p>

      <p>${surah.ayahs} Ayat</p>
<div class="ayah-list">

${ayahs.map(ayah => `

<div class="ayah-card">

<div class="ayah-number">
${ayah.number}
</div>

<div class="ayah-arabic">
${ayah.arabic}
</div>

<div class="ayah-translation">
${ayah.translation}
</div>

</div>

`).join("")}

</div>
    </section>
  `;
}
