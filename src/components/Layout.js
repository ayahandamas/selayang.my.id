import { Header } from "./Header.js";
import { BottomNav } from "./BottomNav.js";
import { Footer } from "./Footer.js";

export function Layout(content) {
  return `
    ${Header()}

    <main class="page-content">
      ${content}
    </main>

    ${BottomNav()}

    ${Footer()}
  `;
}
