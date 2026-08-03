export function Header() {

  function icon(){
      return "🌙";
  }

  return `
    <header class="app-header">

      <div class="logo">
        📖 Selayang.my.id
      </div>

      <button
        id="theme-btn"
        class="theme-btn">

        ${icon()}

      </button>

    </header>
  `;
}
