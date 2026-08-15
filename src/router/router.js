import { routes } from "./routes.js";
import { Layout } from "../components/Layout.js";
export async function renderRoute() {


  const app = document.querySelector("#app");

  const hash = location.hash.replace("#", "") || "/";

  // Support URL seperti /reader/2
  const path = hash.startsWith("/reader/")
      ? "/reader"
      : hash;

  const Page = routes[path] || routes["/"];

  app.innerHTML = Layout(await Page());

}
