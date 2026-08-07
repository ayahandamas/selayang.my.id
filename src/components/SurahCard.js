export function SurahCard(surah) {
  return `
    <article
      class="surah-card"
      onclick="location.hash='#/reader/${surah.number}'">

      <div class="surah-number">
        ${surah.number}
      </div>

      <div class="surah-info">
        <h3>${surah.name}</h3>
        <p>${surah.englishName}</p>
        <small>${surah.ayahs} Ayat</small>
      </div>

    </article>
  `;
}
