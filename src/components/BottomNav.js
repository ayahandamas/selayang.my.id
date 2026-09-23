export function BottomNav() {
  const current =
    location.hash.replace("#", "").split("?")[0] || "/home";

  function active(path) {
    return current === path ? "active" : "";
  }

  return `
    <nav class="bottom-nav">

      <a class="${active("/home")}" href="#/home">
        🏠<br>Home
      </a>

      <a class="${active("/reader")}" href="#/reader">
        📖<br>Reader
      </a>

      <a class="${active("/search")}" href="#/search">
        🔍<br>Search
      </a>

      <a class="${active("/bookmarks")}" href="#/bookmarks">
        🔖<br>Bookmark
      </a>

      <a class="${active("/settings")}" href="#/settings">
        ⚙️<br>Settings
      </a>

      <a class="${active("/about")}" href="#/about">
        ℹ️<br>About
      </a>

    </nav>
  `;
}