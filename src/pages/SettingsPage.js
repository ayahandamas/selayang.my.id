export function SettingsPage() {
  setTimeout(() => {
    const page = document.querySelector(".settings-page");

    if (!page) {
      return;
    }

    const themeSelect = page.querySelector(".settings-theme");
    const fontSizeSelect = page.querySelector(".settings-font-size");

    const savedTheme =
      localStorage.getItem("quran-theme") || "light";

    const savedFontSize =
      localStorage.getItem("quran-font-size") || "medium";

    themeSelect.value = savedTheme;
    fontSizeSelect.value = savedFontSize;

    themeSelect.addEventListener("change", () => {
      localStorage.setItem(
        "quran-theme",
        themeSelect.value
      );

      document.documentElement.dataset.theme =
        themeSelect.value;
    });

    fontSizeSelect.addEventListener("change", () => {
      localStorage.setItem(
        "quran-font-size",
        fontSizeSelect.value
      );

      document.documentElement.dataset.fontSize =
        fontSizeSelect.value;
    });

    document.documentElement.dataset.theme = savedTheme;
    document.documentElement.dataset.fontSize =
      savedFontSize;
  }, 0);

  return `
    <section class="page settings-page">

      <header class="settings-header">

        <p class="settings-eyebrow">
          ⚙️ Pengaturan
        </p>

        <h1>Settings</h1>

        <p>
          Atur tampilan dan kenyamanan membaca
          Al-Qur'an sesuai kebutuhan Anda.
        </p>

      </header>

      <div class="settings-list">

        <section class="settings-card">

          <div class="settings-card-info">

            <h2>🌙 Tampilan</h2>

            <p>
              Pilih mode terang atau gelap.
            </p>

          </div>

          <select
            class="settings-theme"
            aria-label="Pilih tampilan"
          >
            <option value="light">
              Terang
            </option>

            <option value="dark">
              Gelap
            </option>
          </select>

        </section>

        <section class="settings-card">

          <div class="settings-card-info">

            <h2>🔤 Ukuran Teks Arab</h2>

            <p>
              Atur ukuran teks Arab saat membaca.
            </p>

          </div>

          <select
            class="settings-font-size"
            aria-label="Pilih ukuran teks Arab"
          >
            <option value="small">
              Kecil
            </option>

            <option value="medium">
              Sedang
            </option>

            <option value="large">
              Besar
            </option>
          </select>

        </section>

      </div>

    </section>
  `;
}
