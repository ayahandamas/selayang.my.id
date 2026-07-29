# Implementation Plan: Selayang.my.id Quran Web App

## Overview

Plain HTML5/CSS3/Vanilla JS (ES2023 modules) PWA. No build step for the app itself. Vitest + fast-check
are dev-only dependencies used exclusively for the test suite. Tasks are ordered so foundational
infrastructure (scaffold, storage, parser, theme, router) is in place before feature layers (API,
components, pages) and tests are written close to the code they verify.

---

## Tasks

- [ ] 0. Documentation setup
  - [ ] 0.1 Update `README.md`
    - Write project overview, tech stack, folder structure, and how to run locally (`npx serve .`)
    - Include sections: About, Getting Started, Folder Structure, Contributing, License
    - _Steering: Documentation_

  - [ ] 0.2 Create `docs/ARCHITECTURE.md`
    - Document the high-level architecture: hash-based SPA, component hierarchy, module responsibilities, layered separation (UI → Services → API → Storage), Service Worker strategy, and LocalStorage schema
    - Reference the design document for full detail
    - _Steering: Documentation, Architecture_

  - [ ] 0.3 Create `docs/ROADMAP.md`
    - Document v0.1.0 milestone (Foundation: scaffold, PWA, homepage, Surah list) and planned future milestones (v0.2.0 Reading, v0.3.0 Audio, v0.4.0 Bookmarks, v1.0.0 Full Release)
    - _Steering: Documentation_


- [ ] 1. Project scaffold and static asset setup
  - [ ] 1.1 Create `index.html` app shell
    - Write `index.html` with `<html lang="ar" dir="ltr">`, `<head>` meta tags (charset, viewport,
      theme-color, description), links to all CSS files, `<header id="site-header">`,
      `<main id="app">`, `<footer id="site-footer">`, and a `<script type="module" src="js/main.js">`
    - Include `<link rel="manifest" href="manifest.json">` in `<head>`
    - Include a `<noscript>` fallback message
    - _Requirements: 1.1, 2.1, 13.4_

  - [ ] 1.2 Create Web App Manifest (`manifest.json`)
    - Write `manifest.json` with `name`, `short_name`, `start_url`, `display: "standalone"`,
      `theme_color`, `background_color`, and an `icons` array referencing
      `pwa/icons/icon-192.png`, `pwa/icons/icon-512.png`, `pwa/icons/icon-maskable.png`
    - _Requirements: 1.1_

  - [ ] 1.3 Create PWA icon placeholder files and `offline.html`
    - Create `pwa/icons/` directory; add placeholder 192×192, 512×512, and maskable PNG files
    - Create `offline.html` — a minimal styled page explaining content is not available offline
    - _Requirements: 1.1, 10.4_

  - [ ] 1.4 Create placeholder page scaffolds
    - Write `pages/reading.html`, `pages/bookmarks.html`, `pages/settings.html` as minimal HTML
      files (no content body — the SPA router injects all content into `#app` in `index.html`)
    - _Requirements: 13.4_

  - [ ] 1.5 Create SVG icon sprite (`assets/icons/icons.svg`)
    - Write an SVG sprite with `<symbol>` elements for: `bookmark`, `bookmark-filled`,
      `play`, `pause`, `stop`, `skip-next`, `moon`, `sun`, `hamburger`, `close`, `search`,
      `chevron-left`, `chevron-right`
    - _Requirements: 6.2, 5.4_


- [ ] 2. CSS foundation and theme system
  - [ ] 2.1 Write `css/base.css`
    - CSS reset (box-sizing, margin, padding), `@font-face` for `UthmanicHafs_v22.woff2`,
      root typography scale, `.arabic` utility class with `font-family`, `direction: rtl`,
      `text-align: right`, and `line-height` appropriate for Arabic text
    - _Requirements: 3.3, 12.1, 12.6_

  - [ ] 2.2 Write `css/themes.css`
    - Define `:root, [data-theme="light"]` and `[data-theme="dark"]` blocks with all custom
      properties listed in the design: `--color-bg`, `--color-surface`, `--color-text`,
      `--color-text-muted`, `--color-primary`, `--color-primary-alt`, `--color-border`,
      `--color-highlight`
    - Ensure light and dark text colors achieve ≥ 4.5:1 contrast ratio against their backgrounds
    - _Requirements: 8.1, 8.5_

  - [ ] 2.3 Write `css/layout.css`
    - Header grid (logo + hamburger + nav), sticky header styles, `#app` container with
      `max-width` and centred padding, footer styles; all using CSS custom properties from themes
    - _Requirements: 2.1, 2.4, 12.1_

  - [ ] 2.4 Write `css/components.css`
    - Styles for: `.surah-card`, `.ayah-item`, `.ayah-item.ayah--active`, `.audio-player`,
      `.bookmark-item`, `.search-bar`, `.continue-reading-banner`, `.surah-header`,
      `.surah-navigation`, `.settings-section`, `.error-banner`, `.loading-spinner`
    - Interactive elements must have `min-width: 44px; min-height: 44px`
    - Focus indicator: `:focus-visible { outline: 3px solid var(--color-primary); }`
    - _Requirements: 5.3, 6.2, 12.2, 12.5_

  - [ ] 2.5 Write `css/responsive.css`
    - Media queries for ≥768px (two-column Surah list, expanded nav), ≥1024px, ≥1440px
    - Nav hamburger hidden ≥768px; inline nav visible ≥768px
    - _Requirements: 2.4, 12.1_


- [ ] 3. Core utility modules
  - [ ] 3.1 Implement `js/storage.js`
    - Export key constants (`KEYS.THEME`, `KEYS.TRANSLATION`, `KEYS.RECITER`, `KEYS.BOOKMARKS`,
      `KEYS.PROGRESS`, `KEYS.SURAH_LIST`) all prefixed `slq:`
    - Export `get(key)` returning parsed JSON or `null` on any error
    - Export `set(key, value)` serializing to JSON; wrap in try/catch and dispatch
      `quran:storage-error` CustomEvent on `QuotaExceededError`
    - Export `remove(key)`
    - Include JSDoc block at top of module
    - _Requirements: 6.6, 11.2, 13.1, 13.3_

  - [ ] 3.2 Implement `js/parser.js`
    - Export `parseSurah(raw)` — validates `number`, `nameArabic`, `nameTranslit`, `nameEnglish`,
      `ayahCount`, `revelationType`; throws `ApiError { type: 'parse' }` if any required field
      missing; returns typed `Surah` object
    - Export `parseAyah(raw)` — validates `number`, `surahNumber`, `textUthmani`, `translation`,
      `audioUrl`; throws on missing fields
    - Export `printSurah(surah)` — serializes `Surah` back to plain JSON-safe object
    - Export `validateSurahResponse(obj)` — returns `true` iff all required Surah fields present
    - Include JSDoc block at top of module
    - _Requirements: 14.2, 14.3, 14.5, 14.6_

  - [ ] 3.3 Implement `js/i18n.js`
    - Export `TRANSLATIONS` constant as defined in the design
      (`'id.indonesian'`, `'en.asad'`, `'ms.basmeih'`)
    - Export `DEFAULT_TRANSLATION = 'id.indonesian'`
    - Export `getTranslationLabel(id)` returning the display label string
    - _Requirements: 4.1, 4.4_

  - [ ] 3.4 Implement `js/theme.js`
    - Export `initTheme()` — reads `slq:theme` from LocalStorage; if absent, uses
      `window.matchMedia('(prefers-color-scheme: dark)')` result; sets
      `document.documentElement.setAttribute('data-theme', value)`
    - Export `toggleTheme()` — flips between `"light"` and `"dark"`, persists to LocalStorage,
      updates `data-theme`
    - Export `getTheme()` — returns current `data-theme` value
    - _Requirements: 8.2, 8.3, 8.4_


  - [ ] 3.5 Implement `js/bookmarks.js`
    - Export `addBookmark(surahNumber, ayahNumber, surahName)` — constructs Bookmark object
      with `id: "{surahNumber}:{ayahNumber}"`, `createdAt: Date.now()`, saves to LocalStorage
    - Export `removeBookmark(id)` — removes entry with matching `id` from LocalStorage array
    - Export `getBookmarks()` — returns `Bookmark[]` from LocalStorage; returns `[]` on error
    - Export `isBookmarked(surahNumber, ayahNumber)` — returns boolean
    - _Requirements: 6.1, 6.5_

  - [ ] 3.6 Implement `js/progress.js`
    - Export `saveProgress(surahNumber, ayahNumber)` — writes
      `{ surahNumber, ayahNumber, updatedAt: Date.now() }` to `slq:progress`
    - Export `getProgress()` — returns `ReadingProgress` or `null`
    - Export `clearProgress()` — removes `slq:progress`
    - _Requirements: 7.1, 7.4_

  - [ ] 3.7 Implement `js/search.js`
    - Export `filterSurahs(surahs, query)` — pure function; returns full list when query is
      empty/whitespace; filters by case-insensitive substring match on `nameArabic`,
      `nameTranslit`, `nameEnglish`, and `String(number)` as defined in design
    - No side effects, no API calls
    - _Requirements: 9.2, 9.4, 9.5_


- [ ] 4. API module
  - [ ] 4.1 Implement `js/api.js` — Surah list fetch
    - Define `PRIMARY_BASE` and `FALLBACK_BASE` constants
    - Define `ApiError` class with `type` and `message` fields
    - Export `fetchSurahList()` — attempts `GET /surat` on equran.id; on failure retries
      `GET /surah` on alquran.cloud; passes raw data through `parseSurah()` for each item;
      caches result to `slq:surah-list` in LocalStorage on success
    - _Requirements: 14.1, 14.2, 14.4_

  - [ ] 4.2 Implement `js/api.js` — single Surah fetch with fallback and error handling
    - Export `fetchSurah(surahNumber, translationId)` — tries equran.id `GET /surat/{id}`;
      on non-2xx or network error retries alquran.cloud endpoints; handles HTTP 429 with
      15-second back-off before retry; passes Ayah list through `parseAyah()`;
      throws `ApiError { type: 'network' | 'offline' | 'parse' }` on final failure
    - `api.js` must not import any module other than `parser.js` and `storage.js`
    - _Requirements: 3.5, 14.1, 14.3, 14.4_

- [ ] 5. Service Worker (`pwa/sw.js`)
  - [ ] 5.1 Implement Service Worker install and static cache precache
    - Define `CACHE_VERSION`, `STATIC_CACHE`, `API_CACHE`, `AUDIO_CACHE` constants
    - On `install` event: precache all files listed in `PRECACHE_ASSETS` array
      (all HTML, CSS, JS, fonts, icons, `offline.html`)
    - On `activate` event: delete all caches not matching current version names
    - _Requirements: 1.2, 10.1_

  - [ ] 5.2 Implement Service Worker fetch strategies
    - Static assets (`html`, `css`, `js`, fonts, icons): cache-first; on miss fetch → cache → return
    - API requests (`equran.id/**`, `alquran.cloud/**`): network-first; on success clone → cache;
      on failure return cached response; on cache miss return `{ error: "Offline and no cached data" }`
    - Audio `.mp3` requests: cache-first
    - _Requirements: 1.4, 10.2, 10.3, 10.4, 10.5_

  - [ ] 5.3 Register Service Worker in `js/main.js` (SW registration stub)
    - Create `js/main.js` as the entry point; wrap `navigator.serviceWorker.register('pwa/sw.js')`
      in try/catch; log and silently continue on failure
    - Call `initTheme()` from `theme.js` and `initRouter()` from `router.js` here
    - _Requirements: 1.2, 1.5_


- [ ] 6. Router and shell components
  - [ ] 6.1 Implement `js/router.js`
    - Export `initRouter()` — registers routes (`#/`, `#/surah/:id`, `#/bookmarks`, `#/settings`);
      listens for `hashchange` and `DOMContentLoaded`; clears `#app`; calls matched page's
      `init(params)` function
    - Route registration must go through a `registerRoute(pattern, handler)` function so that
      swapping `window.location.hash` reads for `window.location.pathname` (History API) requires
      changes only inside `router.js`, not in page modules
    - Export a `navigate(path)` function that abstracts away whether hash or history routing is used
    - Export `getCurrentRoute()` — returns `{ path, params }` for the current hash
    - _Requirements: 2.3, 13.1_

  - [ ] 6.2 Implement `js/components/Header.js`
    - Export `Header()` returning the `<header>` element with logo text "Selayang.my.id",
      `<nav>` with links to `#/`, `#/bookmarks`, `#/settings`, a ThemeToggle button
      (`aria-label`, toggles theme on click), and a HamburgerButton
      (`aria-expanded`, `aria-controls`, visible only < 768px via CSS)
    - Wire hamburger click to toggle `.nav--open` class on `<nav>`
    - Inject into `#site-header` and export `updateActiveLink(hash)` to mark current nav item
    - _Requirements: 2.1, 2.4, 2.5, 8.2, 12.3_

  - [ ] 6.3 Implement `js/components/Footer.js`
    - Export `Footer()` returning `<footer>` with copyright text and app version
    - Inject into `#site-footer`
    - _Requirements: 2.1_


- [ ] 7. Checkpoint — scaffold and core modules
  - Ensure `index.html` loads without JS errors in browser console, CSS custom properties
    apply in both themes, `initTheme()` sets `data-theme`, `initRouter()` routes `#/` without
    crashing. Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Homepage components and Surah list
  - [ ] 8.1 Implement `js/components/SurahCard.js`
    - Export `SurahCard(surah)` returning an `<li>` / `<article>` element containing:
      Surah number, `.arabic` Arabic name, transliterated name, English name, Ayah count,
      revelation type badge
    - Wrap in an `<a href="#/surah/{surah.number}">` with `aria-label` combining Surah number
      and transliterated name
    - All six fields must be rendered as non-empty text nodes
    - _Requirements: 2.6, 12.3_

  - [ ] 8.2 Implement `js/components/SurahList.js`
    - Export `SurahList(surahs, query)` returning a `<ul>` populated with `SurahCard` per entry
    - When `surahs.length === 0`, render `<p class="no-results">No results found</p>`
    - _Requirements: 2.3, 9.3_

  - [ ] 8.3 Implement `js/components/SearchBar.js`
    - Export `SearchBar()` returning `<input type="search">` with `aria-label="Search Surahs"`,
      `placeholder`, and an `input` event listener that dispatches `quran:search-query-changed`
      CustomEvent with `{ detail: { query } }` on `document`
    - _Requirements: 9.1, 12.3_

  - [ ] 8.4 Implement `js/components/ContinueReadingBanner.js`
    - Export `ContinueReadingBanner(progress, surahName)` returning a `<section>` with a
      "Continue Reading" heading, Surah name and Ayah number, and an `<a>` linking to
      `#/surah/{surahNumber}` with a `data-ayah` attribute for scroll targeting
    - Returns `null` when `progress` is null
    - _Requirements: 7.2, 7.3_

  - [ ] 8.5 Wire up `HomePage` init function
    - Create the HomePage init in a module (e.g., `js/pages/home.js`); call `fetchSurahList()`,
      render `ContinueReadingBanner`, `SearchBar`, and `SurahList` into `#app`
    - Listen for `quran:search-query-changed` on document; call `filterSurahs`; re-render
      `SurahList` with filtered result
    - Show loading spinner while fetch is in progress; call `renderError` on ApiError
    - _Requirements: 2.2, 2.3, 7.2, 9.1, 9.4_


- [ ] 9. Reading view components
  - [ ] 9.1 Implement `js/components/SurahHeader.js`
    - Export `SurahHeader(surah)` returning a `<header>` with a `<h1>` displaying Surah number,
      `.arabic` Arabic name, transliterated name, English name, Ayah count, revelation type
    - _Requirements: 3.1, 12.4_

  - [ ] 9.2 Implement `js/components/AyahItem.js`
    - Export `AyahItem(ayah, state)` where `state = { isBookmarked, isActive }` returning an
      `<article>` / `<div>` with:
      - `.ayah-number` Ayah number badge
      - `.ayah-text-arabic.arabic` Uthmani text
      - `.ayah-text-translation` translation text
      - `.ayah-bookmark` button with `aria-label="Bookmark this Ayah"` and `aria-pressed` matching
        `isBookmarked`; on click dispatches `quran:bookmark-toggled` with `{ surahNumber, ayahNumber }`
      - `.ayah--active` class applied when `state.isActive === true`
    - All three text pieces (number, Arabic, translation) must be non-empty text nodes
    - _Requirements: 3.2, 6.2, 12.3_

  - [ ] 9.3 Implement `js/components/AyahList.js`
    - Export `AyahList(ayahs, bookmarks, activeAyahNumber)` returning a container with `AyahItem`
      per Ayah
    - Attach IntersectionObserver to each AyahItem; when an Ayah scrolls into view, call
      `saveProgress(surah.number, ayah.number)`
    - Listen for `quran:ayah-changed` on document; toggle `.ayah--active` on matching AyahItem
      (remove from previous, add to new)
    - Ayahs must appear in strictly ascending `number` order with no duplicates or gaps
    - _Requirements: 3.4, 5.3, 7.4_

  - [ ] 9.4 Implement `js/components/SurahNavigation.js`
    - Export `SurahNavigation(currentSurahNumber)` returning `<nav>` with two links:
      "Previous Surah" → `#/surah/{currentSurahNumber - 1}` (hidden if `currentSurahNumber === 1`)
      "Next Surah" → `#/surah/{currentSurahNumber + 1}` (hidden if `currentSurahNumber === 114`)
    - _Requirements: 3.7_


- [ ] 10. Audio player component
  - [ ] 10.1 Implement `js/audio.js` — `AudioController` class
    - Private fields: `#ayahs`, `#currentIndex`, `#audio` (single `HTMLAudioElement`)
    - `load(ayahs, reciterId)` — stores ayahs, selects audio URL per reciterId, resets index
    - `play()` — sets `audio.src` to current ayah URL, calls `audio.play()`, dispatches
      `quran:ayah-changed` with `{ ayahNumber: currentAyahNumber }`
    - `pause()` / `stop()` — pause and reset index respectively
    - `next()` — advance index; if at end dispatch `quran:playback-ended` and stop
    - Wire `audio.ended` handler to call `this.next()` automatically
    - Wire `audio.onerror` handler to dispatch `quran:audio-error`
    - `get currentAyahNumber()` returns 1-based Ayah number
    - _Requirements: 5.2, 5.3, 5.4, 5.7_

  - [ ] 10.2 Implement `js/components/AudioPlayer.js`
    - Export `AudioPlayer(controller, totalAyahs)` returning `<div class="audio-player">` with:
      Play, Pause, Stop, Next-Ayah buttons each with `aria-label`; a reciter `<select>` element
    - On button clicks call corresponding `controller` methods
    - Listen for `quran:audio-error` on document; display an inline error banner
    - Listen for `quran:playback-ended` on document; reset button state to show Play
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 12.3_

  - [ ] 10.3 Wire up ReadingPage init function
    - Create `js/pages/reading.js`; accept `{ id }` params from router; show loading spinner;
      call `fetchSurah(id, translationId)`; render `SurahHeader`, `AyahList`, `AudioPlayer`,
      `SurahNavigation` into `#app`; catch `ApiError` and call `renderError` with retry callback
    - On `quran:bookmark-toggled`: call `addBookmark`/`removeBookmark`; re-render affected AyahItem
    - On `quran:translation-changed`: re-fetch Surah with new translationId; re-render AyahList
    - _Requirements: 3.1, 3.5, 3.6, 4.2, 5.1_


- [ ] 11. Bookmarks page
  - [ ] 11.1 Implement `js/components/BookmarkItem.js`
    - Export `BookmarkItem(bookmark)` returning an `<li>` with Surah name, Ayah number,
      and a "Remove" button with `aria-label="Remove bookmark for {surahName} Ayah {ayahNumber}"`;
      on click dispatches `quran:bookmark-toggled` with `{ surahNumber, ayahNumber }`; also
      wraps in an `<a href="#/surah/{surahNumber}" data-ayah="{ayahNumber}">` link
    - _Requirements: 6.3, 6.4, 6.5, 12.3_

  - [ ] 11.2 Implement `js/components/BookmarkList.js`
    - Export `BookmarkList(bookmarks)` returning a `<ul>` populated with `BookmarkItem` per entry
    - Child count must equal `bookmarks.length`; each child must contain Surah name and Ayah number
    - When `bookmarks.length === 0`, render `<p>No bookmarks saved yet.</p>`
    - _Requirements: 6.3_

  - [ ] 11.3 Wire up BookmarksPage init function
    - Create `js/pages/bookmarks.js`; call `getBookmarks()`; render `BookmarkList` into `#app`
    - Listen for `quran:bookmark-toggled` on document; call `removeBookmark`; re-render list
    - _Requirements: 6.3, 6.4, 6.5_

- [ ] 12. Settings page and translation wiring
  - [ ] 12.1 Implement `js/components/SettingsPage.js` (settings page component + init)
    - Create `js/pages/settings.js`; render a settings form into `#app` with:
      - Theme toggle button (reuses `toggleTheme()`) showing current theme
      - Translation `<select>` populated from `TRANSLATIONS`; pre-selected from LocalStorage;
        on change persists to `slq:translation` and dispatches `quran:translation-changed`
      - Reciter `<select>` with at least one default option; persists to `slq:reciter`
    - _Requirements: 4.1, 4.3, 5.6, 8.2, 8.3_

  - [ ] 12.2 Restore translation and reciter preferences on app load
    - In `js/main.js`, after `initTheme()`, read `slq:translation` (default `'id.indonesian'`)
      and `slq:reciter` (default `'05'`); store in a module-level `AppState` object that
      `api.js` and `AudioController` read when building requests
    - _Requirements: 4.4_


- [ ] 13. Checkpoint — core features complete
  - Navigate to `#/`, `#/surah/1`, `#/bookmarks`, `#/settings` without JS errors; verify theme
    toggle persists across reload; verify bookmarks save and remove correctly; verify search
    filters Surah list in real time. Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Accessibility and privacy audit pass
  - [ ] 14.1 Audit ARIA roles, labels, and heading hierarchy
    - For every page (`home`, `reading`, `bookmarks`, `settings`), verify heading order is
      `h1 → h2 → h3` with no skips; add or correct `aria-label` / `role` attributes on all
      interactive elements that lack visible text; verify `aria-expanded` on hamburger button
    - _Requirements: 12.3, 12.4_

  - [ ] 14.2 Verify no third-party scripts or tracking
    - Audit `index.html` and all JS modules for any `<script src>` pointing to external CDNs,
      `fetch()` calls to non-designated domains, or `<img>` tracking pixels; remove any found
    - Add a `Content-Security-Policy` meta tag to `index.html` restricting scripts to `'self'`
      and the two designated API origins
    - _Requirements: 11.1, 11.3, 11.4_

  - [ ] 14.3 Update documentation after implementation
    - After all features are implemented, update `README.md` with any setup steps that changed
    - Update `docs/ARCHITECTURE.md` if any architectural decisions changed during implementation
    - Update `docs/ROADMAP.md` to mark v0.1.0 tasks as complete
    - _Steering: Documentation_

- [ ] 15. Test infrastructure setup
  - [ ] 15.1 Initialize npm project and install dev dependencies
    - Run `npm init -y` in project root; install `vitest`, `fast-check`, `happy-dom` as dev
      dependencies; create `vitest.config.js` with `environment: 'happy-dom'` and `globals: true`
    - _Requirements: 13.1_

  - [ ] 15.2 Create shared test fixtures
    - Create `js/__tests__/fixtures/surahs.js` exporting `SURAH_LIST` — an array of all 114
      Surah objects matching the `Surah` typedef (number, nameArabic, nameTranslit, nameEnglish,
      ayahCount, revelationType)
    - Create `js/__tests__/fixtures/ayahs.js` exporting a sample Ayah array for Surah 1 (7 Ayahs)
    - _Requirements: 13.1_


- [ ] 16. Property-based and unit tests — pure modules
  - [ ] 16.1 Write `js/__tests__/parser.test.js`
    - [ ]* 16.1.1 Write property test for API response validation (Property 16)
      - **Property 16: API response validation correctness**
      - Use `fc.record` to generate objects with and without required fields; assert
        `validateSurahResponse` returns `true` only when all 5 required fields are present
      - **Validates: Requirements 14.2**

    - [ ]* 16.1.2 Write property test for serialization round-trip (Property 17)
      - **Property 17: Serialization round-trip**
      - Use `fc.record` to generate valid raw Surah objects; assert
        `parseSurah(JSON.parse(JSON.stringify(parseSurah(raw))))` deep-equals `parseSurah(raw)`
      - **Validates: Requirements 14.5, 14.6**

    - [ ]* 16.1.3 Write unit tests for `parser.js` error paths
      - Test `parseSurah` throws `ApiError` when each required field is missing one at a time
      - Test `parseAyah` throws `ApiError` when `textUthmani` is missing
      - _Requirements: 14.3_

  - [ ] 16.2 Write `js/__tests__/search.test.js`
    - [ ]* 16.2.1 Write property test for search filter correctness (Property 4)
      - **Property 4: Search filter correctness**
      - Use `fc.string({ minLength: 1, maxLength: 20 })` as query; assert every returned Surah
        has at least one matching field
      - **Validates: Requirements 9.2**

    - [ ]* 16.2.2 Write property test for clearing search restores full list (Property 5)
      - **Property 5: Clearing search restores full list**
      - For any non-empty query, assert `filterSurahs(SURAH_LIST, '').length === 114`
      - **Validates: Requirements 9.4**

    - [ ]* 16.2.3 Write unit test for "no results" case
      - Assert `filterSurahs(SURAH_LIST, 'zzzzzzzzzz')` returns `[]`
      - _Requirements: 9.3_


  - [ ] 16.3 Write `js/__tests__/storage.test.js`
    - [ ]* 16.3.1 Write property test for theme preference round-trip (Property 12)
      - **Property 12: Theme preference round-trip (save → restore)**
      - Use `fc.constantFrom('light', 'dark')` as theme; assert `storage.get` equals saved value
      - **Validates: Requirements 8.3**

    - [ ]* 16.3.2 Write property test for translation preference round-trip (Property 13)
      - **Property 13: Translation preference round-trip**
      - Use `fc.constantFrom(...Object.keys(TRANSLATIONS))` as ID; assert round-trip equality
      - **Validates: Requirements 4.3**

    - [ ]* 16.3.3 Write unit test for `storage.js` quota exceeded error path
      - Mock `localStorage.setItem` to throw `DOMException` with name `QuotaExceededError`;
        assert `quran:storage-error` CustomEvent is dispatched
      - _Requirements: 6.6_

  - [ ] 16.4 Write `js/__tests__/bookmarks.test.js`
    - [ ]* 16.4.1 Write property test for bookmark round-trip add → read (Property 6)
      - **Property 6: Bookmark round-trip (add → read)**
      - Use `fc.integer({ min: 1, max: 114 })` for surahNumber and
        `fc.integer({ min: 1, max: 286 })` for ayahNumber; assert `getBookmarks()` contains entry
        with matching values after `addBookmark`
      - **Validates: Requirements 6.1**

    - [ ]* 16.4.2 Write property test for bookmark removal (Property 7)
      - **Property 7: Bookmark removal removes from storage**
      - For any added bookmark, assert after `removeBookmark(id)`:
        `getBookmarks()` has no entry with that `id` AND `isBookmarked` returns `false`
      - **Validates: Requirements 6.5**

  - [ ] 16.5 Write `js/__tests__/progress.test.js`
    - [ ]* 16.5.1 Write property test for reading progress round-trip (Property 10)
      - **Property 10: Reading progress round-trip (save → restore)**
      - Use `fc.integer({ min: 1, max: 114 })` and `fc.integer({ min: 1, max: 286 })`; assert
        `getProgress()` returns object with equal `surahNumber` and `ayahNumber`
      - **Validates: Requirements 7.1, 7.4**


  - [ ] 16.6 Write `js/__tests__/theme.test.js`
    - [ ]* 16.6.1 Write property test for theme toggle involution (Property 11)
      - **Property 11: Theme toggle is an involution**
      - Set `data-theme` to `fc.constantFrom('light', 'dark')`; call `toggleTheme()` twice;
        assert `data-theme` returns to initial value
      - **Validates: Requirements 8.2**

    - [ ]* 16.6.2 Write property test for theme preference round-trip (Property 12, theme module)
      - **Property 12: Theme preference round-trip (save → restore via theme.js)**
      - Call `toggleTheme()` to set a known theme; read `slq:theme` from LocalStorage; assert equal
      - **Validates: Requirements 8.3**

- [ ] 17. Property-based and unit tests — component modules
  - [ ] 17.1 Write `js/__tests__/components/SurahCard.test.js`
    - [ ]* 17.1.1 Write property test for SurahCard renders all required fields (Property 1)
      - **Property 1: Surah card renders all required fields**
      - Use `fc.record` to generate valid Surah objects; assert rendered element contains
        non-empty text for all 6 fields (number, nameArabic, nameTranslit, nameEnglish,
        ayahCount, revelationType)
      - **Validates: Requirements 2.6**

  - [ ] 17.2 Write `js/__tests__/components/AyahItem.test.js`
    - [ ]* 17.2.1 Write property test for AyahItem renders Uthmani text, number, translation (Property 2)
      - **Property 2: Ayah item renders Uthmani text, number, and translation**
      - Use `fc.record` to generate valid Ayah objects; assert rendered element contains all 3
        non-empty text pieces
      - **Validates: Requirements 3.2**

    - [ ]* 17.2.2 Write property test for bookmarked AyahItem shows visual indicator (Property 8)
      - **Property 8: Bookmarked Ayah items show visual indicator**
      - For any Ayah, call `AyahItem(ayah, { isBookmarked: true })`; assert rendered element
        contains a child with `.bookmark-active` class or `aria-pressed="true"`
      - **Validates: Requirements 6.2**

    - [ ]* 17.2.3 Write property test for accessible labels on AyahItem elements (Property 18)
      - **Property 18: Interactive elements have accessible labels**
      - For any AyahItem, assert every `button`, `a`, `input` in the DOM has non-empty
        `aria-label` or non-empty visible text content
      - **Validates: Requirements 12.3**


  - [ ] 17.3 Write `js/__tests__/components/AyahList.test.js`
    - [ ]* 17.3.1 Write property test for AyahList preserves sequential order (Property 3)
      - **Property 3: Ayah list preserves sequential order**
      - Use `fc.array(fc.record({ number: fc.integer({ min: 1, max: 286 }) }))` shuffled; assert
        rendered items appear in strictly ascending `number` order, no gaps, no duplicates
      - **Validates: Requirements 3.4**

    - [ ]* 17.3.2 Write property test for active Ayah highlight is exclusive (Property 15)
      - **Property 15: Active Ayah highlight is exclusive**
      - Render `AyahList` with sample Ayahs; dispatch `quran:ayah-changed` with Ayah number `k`;
        assert exactly one element has `.ayah--active` and it matches `number === k`
      - **Validates: Requirements 5.3**

  - [ ] 17.4 Write `js/__tests__/components/BookmarkList.test.js`
    - [ ]* 17.4.1 Write property test for BookmarkList renders all saved bookmarks (Property 9)
      - **Property 9: Bookmark list renders all saved bookmarks**
      - Use `fc.array(fc.record({ ... }), { minLength: 1, maxLength: 20 })` to generate bookmark
        arrays; assert rendered list contains exactly `bookmarks.length` children, each with
        Surah name and Ayah number present
      - **Validates: Requirements 6.3**

- [ ] 18. Integration tests
  - [ ] 18.1 Write `js/__tests__/integration/api.test.js`
    - [ ]* 18.1.1 Write unit tests for API error handling paths
      - Mock `fetch` to simulate network failure; assert `fetchSurahList` retries fallback API
      - Mock primary to return 429 with `Retry-After: 15`; assert back-off before retry
      - Mock both APIs to fail; assert `ApiError { type: 'network' }` is thrown
      - Mock malformed JSON response; assert `ApiError { type: 'parse' }` thrown
      - _Requirements: 3.5, 14.3_

  - [ ] 18.2 Write `js/__tests__/integration/translation.test.js`
    - [ ]* 18.2.1 Write property test for translation change updates all rendered Ayahs (Property 14)
      - **Property 14: Translation change updates all rendered Ayahs**
      - Render a Surah with `n` Ayahs; dispatch `quran:translation-changed` with a new ID;
        assert all `n` rendered AyahItem elements show the new translation text and none show
        the old text
      - **Validates: Requirements 4.2**


- [ ] 19. Final checkpoint — all tests pass
  - Run `npx vitest --run`; all 18 property tests and all unit/integration tests must pass.
    Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP, but all 18 property
  tests are strongly recommended to verify correctness properties before shipping.
- No build step is required for the app itself — open `index.html` directly or serve with any
  static file server (e.g., `npx serve .`).
- Vitest and fast-check are dev-only; they are never referenced by app source files.
- The `js/__tests__/fixtures/` files are not part of the app bundle — they exist only for testing.
- Each task references specific requirements for traceability; the full requirement text lives in
  `requirements.md`.
- Checkpoints (tasks 7, 13, 19) ensure incremental validation and are natural pause points for
  user review.
- Property tests each map to exactly one `fc.assert(fc.property(...))` call, tagged with a comment:
  `// Feature: quran-web-app, Property {N}: {property_text}`


## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5", "0.1", "0.2", "0.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "3.1", "3.2", "3.3"] },
    { "id": 2, "tasks": ["3.4", "3.5", "3.6", "3.7"] },
    { "id": 3, "tasks": ["4.1", "5.1", "15.1"] },
    { "id": 4, "tasks": ["4.2", "5.2", "15.2"] },
    { "id": 5, "tasks": ["5.3", "6.1"] },
    { "id": 6, "tasks": ["6.2", "6.3"] },
    { "id": 7, "tasks": ["8.1", "8.3", "8.4", "9.1", "9.2", "10.1"] },
    { "id": 8, "tasks": ["8.2", "8.5", "9.3", "9.4", "10.2", "11.1", "11.2", "12.1"] },
    { "id": 9, "tasks": ["10.3", "11.3", "12.2"] },
    { "id": 10, "tasks": ["14.1", "14.2", "14.3"] },
    { "id": 11, "tasks": ["16.1.1", "16.1.2", "16.1.3", "16.2.1", "16.2.2", "16.2.3", "16.3.1", "16.3.2", "16.3.3"] },
    { "id": 12, "tasks": ["16.4.1", "16.4.2", "16.5.1", "16.6.1", "16.6.2"] },
    { "id": 13, "tasks": ["17.1.1", "17.2.1", "17.2.2", "17.2.3", "17.3.1", "17.3.2", "17.4.1"] },
    { "id": 14, "tasks": ["18.1.1", "18.2.1"] }
  ]
}
```
