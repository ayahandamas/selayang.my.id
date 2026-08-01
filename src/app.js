import { renderRoute } from "./router/router.js";

export function App() {
  renderRoute();

  window.addEventListener("hashchange", renderRoute);
}
