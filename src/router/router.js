import { routes } from "./routes.js";

export function renderRoute() {
  const app = document.querySelector("#app");

  const hash = location.hash.replace("#", "") || "/";

  const Page = routes[hash] || routes["/"];

  app.innerHTML = Page();
}
