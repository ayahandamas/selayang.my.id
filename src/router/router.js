import { routes } from "./routes.js";
import { Layout } from "../components/Layout.js";
export async function renderRoute() {


  const app = document.querySelector("#app");

  const hash = location.hash.replace("#", "") || "/";

  const [rawPath, queryString] = hash.split("?");

  const pathName = rawPath || "/";

  if (pathName === "/reader" && queryString) {
    const params = new URLSearchParams(queryString);

    const surah = params.get("surah");
    const ayah = params.get("ayah");

    if (surah && ayah) {
      sessionStorage.setItem(
        "selayangReaderTarget",
        JSON.stringify({
          surah: Number(surah),
          ayah: Number(ayah),
        })
      );
    }
  }

  // Support URL seperti /reader/2
  const path = pathName.startsWith("/reader/")
      ? "/reader"
      : pathName;

  const Page = routes[path] || routes["/"];

  app.innerHTML = Layout(await Page());

}
