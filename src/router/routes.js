import { HomePage } from "../pages/HomePage.js";
import { ReaderPage } from "../pages/ReaderPage.js";
import { SearchPage } from "../pages/SearchPage.js";
import { SettingsPage } from "../pages/SettingsPage.js";
import { AboutPage } from "../pages/AboutPage.js";

export const routes = {
  "/": HomePage,
  "/home": HomePage,
  "/reader": ReaderPage,
  "/search": SearchPage,
  "/settings": SettingsPage,
  "/about": AboutPage,
};
