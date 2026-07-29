# Design Document — Selayang.my.id Quran Web App

## Overview

Selayang.my.id is a mobile-first Progressive Web App (PWA) that lets users read, understand, and listen
to the Quran without advertisements or tracking. The entire stack is plain HTML5, CSS3, and Vanilla
JavaScript (ES2023 modules) — no frameworks, no build step, no TypeScript.

The application is a Single-Page Application (SPA) driven by hash-based routing. All data the user
generates (bookmarks, reading progress, preferences) lives exclusively in the browser's LocalStorage.
Quran text, translations, and per-Ayah audio are fetched from the **equran.id v2 API** (primary) with
**alquran.cloud v1** as a fallback. A Service Worker provides offline access to previously loaded content.

**Key design goals:**

- Zero external JavaScript dependencies at runtime (Font Awesome loaded as SVG sprites, not CDN JS)
- Fully offline-capable after first visit to each Surah
- < 3 s initial load on 4G (no render-blocking resources)
- Privacy-first: no analytics, no third-party scripts, no cookies
- WCAG AA accessibility on all interactive elements

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────┐   hash change   ┌──────────────────────────┐  │
│  │  router  │────────────────▶│  Page Components         │  │
│  │ (js/router.js)             │  (pages/*.html + js/)    │  │
│  └──────────┘                 └──────────┬───────────────┘  │
│                                          │                  │
│  ┌──────────┐  read/write  ┌─────────────▼──────────────┐  │
│  │ storage  │◀────────────▶│  Feature Modules           │  │
│  │(js/storage.js)          │  api / audio / search /    │  │
│  └──────────┘              │  bookmarks / progress /    │  │
│                            │  theme / i18n              │  │
│  ┌──────────┐              └──────────┬─────────────────┘  │
│  │  theme   │                         │ fetch              │
│  │(js/theme.js)                        ▼                   │
│  └──────────┘              ┌───────────────────────────┐   │
│                            │  js/api.js (fetch layer)  │   │
│  ┌──────────────────────┐  └──────────┬────────────────┘   │
│  │  Service Worker      │             │                     │
│  │  (pwa/sw.js)         │◀────────────┘ intercept          │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
         │ fetch (pass-through or cached)
         ▼
  ┌──────────────────────────────┐
  │  equran.id API v2            │  (primary)
  │  alquran.cloud v1            │  (fallback)
  └──────────────────────────────┘
```

### Routing Approach (Hash-Based SPA)

The app uses `window.location.hash` for client-side routing — no server configuration required. A central
`router.js` module listens for `hashchange` events and maps route patterns to page initializer functions.

```
#/              → Home (Surah list)
#/surah/:id     → Reading view for Surah {id}
#/bookmarks     → Bookmarks page
#/settings      → Settings page (theme, translation, reciter)
```

On initial load and on every `hashchange`, the router clears the `#app` mount node and calls the matched
page's `init(params)` function, which renders components into `#app`.

**Rationale:** Hash routing requires no server-side rewrites, works offline via the Service Worker, and
is compatible with all browsers that support ES modules.

---

## Components and Interfaces

### Component Hierarchy

```
App Shell (index.html)
├── Header                        (js/components/Header.js)
│   ├── Logo / App Name
│   ├── HamburgerButton
│   └── NavMenu
│       ├── NavLink (Home)
│       ├── NavLink (Bookmarks)
│       ├── NavLink (Settings)
│       └── ThemeToggle
│
├── #app mount point              (controlled by router.js)
│   │
│   ├── HomePage
│   │   ├── ContinueReadingBanner (js/components/ContinueReadingBanner.js)
│   │   ├── SearchBar             (js/components/SearchBar.js)
│   │   └── SurahList             (js/components/SurahList.js)
│   │       └── SurahCard × 114   (js/components/SurahCard.js)
│   │
│   ├── ReadingPage
│   │   ├── SurahHeader           (js/components/SurahHeader.js)
│   │   ├── AyahList              (js/components/AyahList.js)
│   │   │   └── AyahItem × n      (js/components/AyahItem.js)
│   │   ├── AudioPlayer           (js/components/AudioPlayer.js)
│   │   └── SurahNavigation       (js/components/SurahNavigation.js)
│   │
│   ├── BookmarksPage
│   │   └── BookmarkList          (js/components/BookmarkList.js)
│   │       └── BookmarkItem × n  (js/components/BookmarkItem.js)
│   │
│   └── SettingsPage              (js/components/SettingsPage.js)
│
└── Footer                        (js/components/Footer.js)
```

### Module Responsibilities

| Module | Path | Responsibility |
|--------|------|---------------|
| `api.js` | `js/api.js` | Centralizes all fetch calls to equran.id and alquran.cloud. Parses raw JSON into typed app objects. Validates responses. Exports: `fetchSurahList()`, `fetchSurah(id)`, `fetchTranslation(id, edition)`. |
| `storage.js` | `js/storage.js` | Thin wrapper around `localStorage`. Provides `get(key)`, `set(key, value)`, `remove(key)` with JSON serialization. Exports key constants. |
| `router.js` | `js/router.js` | Hash-based SPA router. Registers routes, listens for `hashchange`, calls page init functions. Exports `navigate(hash)`. |
| `theme.js` | `js/theme.js` | Reads/writes theme preference to LocalStorage. Applies `data-theme` attribute to `<html>`. Detects `prefers-color-scheme`. Exports `initTheme()`, `toggleTheme()`. |
| `audio.js` | `js/audio.js` | Manages `HTMLAudioElement` lifecycle. Tracks current Ayah index during playback. Emits `ayah-changed` custom events for highlight sync. Exports `AudioController` class. |
| `search.js` | `js/search.js` | Pure client-side filter over the pre-loaded 114 Surah list. Exports `filterSurahs(list, query)` — no API calls. |
| `bookmarks.js` | `js/bookmarks.js` | CRUD operations for bookmarks in LocalStorage. Exports `addBookmark()`, `removeBookmark()`, `getBookmarks()`, `isBookmarked()`. |
| `progress.js` | `js/progress.js` | Saves and restores reading progress (surahNumber, ayahNumber) in LocalStorage. Exports `saveProgress()`, `getProgress()`, `clearProgress()`. |
| `i18n.js` | `js/i18n.js` | Holds translation edition identifiers and display names. Maps UI locale strings. Exports `TRANSLATIONS` constant and `getTranslationLabel(id)`. |
| `parser.js` | `js/parser.js` | Deserializes raw API JSON into typed app objects (`Surah`, `Ayah`). Validates required fields. Exports `parseSurah(raw)`, `parseAyah(raw)`, `printSurah(surah)`. |

### Component Interfaces

Each component is a plain function that accepts a data object and returns a DOM element (or injects into
a container). No framework bindings — components communicate via custom DOM events.

```js
/**
 * @param {Surah} surah
 * @returns {HTMLElement}
 */
function SurahCard(surah) { ... }

/**
 * @param {Ayah} ayah
 * @param {{ isBookmarked: boolean, isActive: boolean }} state
 * @returns {HTMLElement}
 */
function AyahItem(ayah, state) { ... }

/**
 * @param {AudioController} controller
 * @param {number} totalAyahs
 * @returns {HTMLElement}
 */
function AudioPlayer(controller, totalAyahs) { ... }

/**
 * @param {Surah[]} surahs
 * @param {string} query
 * @returns {HTMLElement}
 */
function SurahList(surahs, query) { ... }

/**
 * @param {Bookmark[]} bookmarks
 * @returns {HTMLElement}
 */
function BookmarkList(bookmarks) { ... }
```

**Event bus pattern:** Components dispatch named CustomEvents on `document` for cross-component
communication (e.g., `quran:ayah-changed`, `quran:bookmark-toggled`, `quran:translation-changed`).
Sibling components listen and re-render affected DOM nodes rather than full page re-render.

---

## Data Models

### Surah

```js
/**
 * @typedef {Object} Surah
 * @property {number}  number           - Surah number 1–114
 * @property {string}  nameArabic       - Arabic name (e.g., "الفاتحة")
 * @property {string}  nameTranslit     - Transliterated name (e.g., "Al-Fatihah")
 * @property {string}  nameEnglish      - English meaning (e.g., "The Opening")
 * @property {number}  ayahCount        - Total number of Ayahs
 * @property {string}  revelationType   - "Meccan" | "Medinan"
 * @property {string}  [audioUrl]       - Full Surah audio URL for default reciter
 */
```

### Ayah

```js
/**
 * @typedef {Object} Ayah
 * @property {number}  number           - Ayah number within the Surah
 * @property {number}  surahNumber      - Parent Surah number
 * @property {string}  textUthmani      - Arabic Uthmani text
 * @property {string}  translation      - Translated text in active language
 * @property {string}  audioUrl         - Per-Ayah MP3 URL for active reciter
 */
```

### Bookmark

```js
/**
 * @typedef {Object} Bookmark
 * @property {string}  id               - Unique ID: "{surahNumber}:{ayahNumber}"
 * @property {number}  surahNumber      - Surah number
 * @property {number}  ayahNumber       - Ayah number within the Surah
 * @property {string}  surahName        - Cached Surah transliterated name
 * @property {number}  createdAt        - Unix timestamp (ms)
 */
```

### ReadingProgress

```js
/**
 * @typedef {Object} ReadingProgress
 * @property {number}  surahNumber      - Last read Surah number
 * @property {number}  ayahNumber       - Last read Ayah number
 * @property {number}  updatedAt        - Unix timestamp (ms)
 */
```

### AppState

```js
/**
 * @typedef {Object} AppState
 * @property {string}  theme            - "light" | "dark"
 * @property {string}  translationId    - Active translation edition ID
 * @property {string}  reciterId        - Active reciter ID
 */
```

### LocalStorage Schema

| Key | Type | Description |
|-----|------|-------------|
| `slq:theme` | `"light" \| "dark"` | Active color scheme |
| `slq:translation` | `string` | Active translation edition ID (e.g., `"id.indonesian"`) |
| `slq:reciter` | `string` | Active reciter ID (e.g., `"misyari-rasyid"`) |
| `slq:bookmarks` | `Bookmark[]` (JSON) | Array of all bookmarks |
| `slq:progress` | `ReadingProgress` (JSON) | Last reading position |
| `slq:surah-list` | `Surah[]` (JSON) | Cached Surah list (all 114, refreshed on online launch) |

The `slq:` namespace prefix prevents collisions with other apps on the same origin.

---

## Folder / File Structure

```
selayang.my.id/
│
├── index.html                    # App shell: Header, #app mount, Footer, SW registration
├── manifest.json                 # Web App Manifest (name, icons, display: standalone)
│
├── css/
│   ├── base.css                  # CSS reset, root custom properties, typography
│   ├── layout.css                # Header, nav, #app container, footer grid
│   ├── components.css            # SurahCard, AyahItem, AudioPlayer, BookmarkItem styles
│   ├── themes.css                # [data-theme="light"] and [data-theme="dark"] variables
│   └── responsive.css            # Media queries (≥768px, ≥1024px, ≥1440px breakpoints)
│
├── js/
│   ├── main.js                   # Entry point: initTheme, initSW, initRouter
│   ├── router.js                 # Hash-based SPA router
│   ├── api.js                    # All fetch calls; equran.id primary, alquran.cloud fallback
│   ├── parser.js                 # Deserialize raw API JSON → typed objects; serialize back
│   ├── storage.js                # LocalStorage wrapper with key constants
│   ├── theme.js                  # Theme init, toggle, persist
│   ├── audio.js                  # AudioController class: play/pause/stop/skip, ayah sync
│   ├── search.js                 # filterSurahs(list, query) pure function
│   ├── bookmarks.js              # Bookmark CRUD over LocalStorage
│   ├── progress.js               # Reading progress save/restore
│   ├── i18n.js                   # Translation edition map and display labels
│   └── components/
│       ├── Header.js             # Header + HamburgerButton + NavMenu
│       ├── Footer.js             # Footer
│       ├── SurahCard.js          # Single Surah list item
│       ├── SurahList.js          # Renders SurahCard list from array
│       ├── SearchBar.js          # Search input with live filter dispatch
│       ├── ContinueReadingBanner.js  # Resume reading prompt
│       ├── SurahHeader.js        # Surah title in reading view
│       ├── AyahItem.js           # Single Ayah (Arabic + translation + bookmark icon)
│       ├── AyahList.js           # Renders AyahItem list + IntersectionObserver for progress
│       ├── AudioPlayer.js        # Play/pause/stop/skip controls + reciter selector
│       ├── SurahNavigation.js    # Prev/Next Surah buttons
│       ├── BookmarkList.js       # Bookmarks page list
│       └── BookmarkItem.js       # Single bookmark entry with remove action
│
├── pages/
│   ├── reading.html              # Minimal page scaffold for reading view (link-only)
│   ├── bookmarks.html            # Minimal page scaffold for bookmarks
│   └── settings.html             # Minimal page scaffold for settings
│
├── assets/
│   ├── fonts/
│   │   └── UthmanicHafs_v22.woff2   # Uthmani Arabic font (self-hosted)
│   └── icons/
│       └── icons.svg             # SVG sprite for UI icons
│
└── pwa/
    ├── sw.js                     # Service Worker (cache strategies)
    └── icons/                    # PWA icons (192×192, 512×512, maskable)
        ├── icon-192.png
        ├── icon-512.png
        └── icon-maskable.png
```

---

## API Integration Design

### Primary API: equran.id v2

The equran.id v2 API is the preferred source. It is Malaysian/Indonesian focused, includes Kemenag
translations, per-Ayah MP3 audio from 6 reciters, and requires no API key.
([Documentation](https://equran.id/apidev/v2))

Base URL: `https://equran.id/api/v2`

| Purpose | Endpoint | Response key path |
|---------|----------|-------------------|
| List all 114 Surahs | `GET /surat` | `data[]` → `Surah` |
| Full Surah with Ayahs + audio | `GET /surat/{1–114}` | `data.ayat[]` → `Ayah[]` |
| Tafsir (optional) | `GET /tafsir/{1–114}` | `data.tafsir[]` |

The `GET /surat/{id}` response for each Ayah includes an `audioUrl` map keyed by reciter ID. The
default reciter is `"05"` (Misyari Rasyid Al-Afasy). Audio URLs point to a CDN-hosted MP3 file.

### Fallback API: alquran.cloud v1

Used when equran.id is unreachable. Supports more translation editions including Malay.
([Documentation](https://alquran.cloud))

Base URL: `https://api.alquran.cloud/v1`

| Purpose | Endpoint |
|---------|----------|
| List all Surahs | `GET /surah` |
| Surah text (Uthmani) | `GET /surah/{1–114}/quran-uthmani` |
| Indonesian translation | `GET /surah/{1–114}/id.indonesian` |
| English translation | `GET /surah/{1–114}/en.asad` |
| Per-Ayah audio (Alafasy) | `GET /surah/{1–114}/ar.alafasy` |

Audio CDN pattern (alquran.cloud): `https://cdn.islamic.network/quran/audio/128/ar.alafasy/{ayah_global_number}.mp3`

### Translation Edition Map

```js
// js/i18n.js
export const TRANSLATIONS = {
  'id.indonesian': { label: 'Indonesian (Kemenag)', lang: 'id' },
  'en.asad':       { label: 'English (Muhammad Asad)', lang: 'en' },
  'ms.basmeih':    { label: 'Melayu (Basmeih)', lang: 'ms' },
};
export const DEFAULT_TRANSLATION = 'id.indonesian';
```

### API Module Design (`js/api.js`)

```js
const PRIMARY_BASE   = 'https://equran.id/api/v2';
const FALLBACK_BASE  = 'https://api.alquran.cloud/v1';

/**
 * Fetch the list of all 114 Surahs.
 * @returns {Promise<Surah[]>}
 */
export async function fetchSurahList() { ... }

/**
 * Fetch a single Surah with all Ayahs, translations, and audio URLs.
 * @param {number} surahNumber - 1–114
 * @param {string} translationId - edition ID
 * @returns {Promise<{ surah: Surah, ayahs: Ayah[] }>}
 */
export async function fetchSurah(surahNumber, translationId) { ... }
```

The module attempts the primary API; on network failure or non-2xx response it retries with the
fallback. Responses are passed through `parser.js` before being returned.

---

## Theme System

The app uses CSS custom properties scoped by a `data-theme` attribute on `<html>`.

```css
/* css/themes.css */
:root,
[data-theme="light"] {
  --color-bg:          #f9f6f0;
  --color-surface:     #ffffff;
  --color-text:        #1a1a1a;         /* contrast ≥ 4.5:1 on --color-bg */
  --color-text-muted:  #555555;
  --color-primary:     #1d6a40;
  --color-primary-alt: #155231;
  --color-border:      #e0d8cc;
  --color-highlight:   #fffbcc;         /* active ayah during audio */
}

[data-theme="dark"] {
  --color-bg:          #0f1117;
  --color-surface:     #1c1f26;
  --color-text:        #e8e4dc;         /* contrast ≥ 4.5:1 on --color-bg */
  --color-text-muted:  #9e9e9e;
  --color-primary:     #4caf82;
  --color-primary-alt: #3d9970;
  --color-border:      #2e3340;
  --color-highlight:   #2a3020;
}
```

`theme.js` reads from LocalStorage (`slq:theme`), falls back to `window.matchMedia('(prefers-color-scheme: dark)').matches`,
and sets `document.documentElement.setAttribute('data-theme', value)`. Toggling flips between `"light"`
and `"dark"` and persists the choice.

---

## Audio Playback Design

The `AudioController` class in `js/audio.js` wraps a single `HTMLAudioElement` instance.

```js
class AudioController {
  /** @type {Ayah[]} */   #ayahs = [];
  /** @type {number} */   #currentIndex = 0;
  /** @type {HTMLAudioElement} */ #audio;

  /**
   * Load a Surah's Ayah list into the controller.
   * @param {Ayah[]} ayahs
   * @param {string} reciterId
   */
  load(ayahs, reciterId) { ... }

  play()  { ... }  // play current Ayah
  pause() { ... }
  stop()  { ... }  // resets to index 0
  next()  { ... }  // advance to next Ayah, or stop at end

  /** @returns {number} current Ayah number (1-based) */
  get currentAyahNumber() { ... }
}
```

**Highlight sync:** On each `play()` call the controller dispatches
`document.dispatchEvent(new CustomEvent('quran:ayah-changed', { detail: { ayahNumber } }))`.
`AyahList.js` listens and toggles the `.ayah--active` CSS class on the matching `AyahItem` element.

**Playback flow:**
1. User presses Play → `controller.play()` loads `ayahs[0].audioUrl` into `audio.src` and calls `audio.play()`
2. On `audio.ended` → `controller.next()` is called automatically
3. If `currentIndex >= ayahs.length` → stop, dispatch `quran:playback-ended`

**Audio URL pattern (equran.id v2):**
Each Ayah object from the API includes an `audioUrl` object with keys per reciter:
```json
{ "audioUrl": { "01": "https://...alafasy/001001.mp3", "05": "https://...misyari/001001.mp3" } }
```
`AudioController.load()` selects the URL for the active `reciterId` when building the internal list.

---

## Search Design

Search is a pure client-side filter. The full Surah list (114 entries) is loaded into memory on app start
and cached in LocalStorage. No API calls are made during search.

```js
// js/search.js
/**
 * Filter Surah list by query. Matches Arabic name, transliterated name, English name, or Surah number.
 * @param {Surah[]} surahs
 * @param {string} query - case-insensitive substring match
 * @returns {Surah[]}
 */
export function filterSurahs(surahs, query) {
  if (!query.trim()) return surahs;
  const q = query.toLowerCase();
  return surahs.filter(s =>
    s.nameArabic.includes(q) ||
    s.nameTranslit.toLowerCase().includes(q) ||
    s.nameEnglish.toLowerCase().includes(q) ||
    String(s.number).includes(q)
  );
}
```

**UI flow:**
- `SearchBar.js` renders an `<input type="search">` that dispatches `quran:search-query-changed` on every
  `input` event.
- `HomePage` listens for the event, calls `filterSurahs`, and re-renders `SurahList` with the filtered array.
- If `filteredSurahs.length === 0`, `SurahList` displays a "No results found" message.

---

## Service Worker Caching Strategy

The Service Worker (`pwa/sw.js`) uses different strategies for different resource types:

**Cache-first (static assets):**
- HTML, CSS, JS modules, fonts, icons
- `install` event precaches all files listed in `PRECACHE_ASSETS`
- `fetch` event: check cache → return; else fetch network → cache and return

**Network-first with cache fallback (API requests):**
- All `https://equran.id/api/**` and `https://api.alquran.cloud/v1/**` requests
- `fetch` event: attempt network → if success, clone and cache response → return
- If network fails (offline or timeout), check cache → return cached response if available
- If cache miss, return fallback error JSON: `{ error: "Offline and no cached data" }`

**Cache-first (audio MP3 files):**
- All `.mp3` requests (CDN audio URLs)
- Once cached, served instantly from cache on subsequent plays

**Cache naming:**
```js
const CACHE_VERSION = 'v1';
const STATIC_CACHE   = `slq-static-${CACHE_VERSION}`;
const API_CACHE      = `slq-api-${CACHE_VERSION}`;
const AUDIO_CACHE    = `slq-audio-${CACHE_VERSION}`;
```

On Service Worker activation, old cache versions are deleted.

**Offline page:**
If the user navigates offline to a route with no cached data, the SW returns a minimal cached offline
HTML page (`/offline.html`) that explains the content is unavailable offline.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a
system — essentially, a formal statement about what the system should do. Properties serve as the
bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Surah card renders all required fields

*For any* valid `Surah` object, calling `SurahCard(surah)` must produce a DOM element that contains the
Surah number, Arabic name, transliterated name, English name, Ayah count, and revelation type — all
six fields must be present and non-empty in the rendered output.

**Validates: Requirements 2.6**

---

### Property 2: Ayah item renders Uthmani text, number, and translation

*For any* valid `Ayah` object, calling `AyahItem(ayah, state)` must produce a DOM element that contains
the Uthmani Arabic text, the Ayah number, and the translation text — all non-empty and in the correct
script direction.

**Validates: Requirements 3.2**

---

### Property 3: Ayah list preserves sequential order

*For any* valid array of `Ayah` objects with consecutive `number` values, the rendered `AyahList`
element must present items in strictly ascending Ayah number order with no gaps or duplicates.

**Validates: Requirements 3.4**

---

### Property 4: Search filter correctness

*For any* query string `q` and the full list of 114 Surahs, `filterSurahs(surahs, q)` must return only
Surahs where at least one of `nameArabic`, `nameTranslit`, `nameEnglish`, or `String(number)` contains
`q` (case-insensitive), and must exclude all Surahs where none of these fields match.

**Validates: Requirements 9.2**

---

### Property 5: Clearing search restores full list

*For any* non-empty query string, calling `filterSurahs(surahs, '')` always returns all 114 Surahs
unmodified regardless of the previous query.

**Validates: Requirements 9.4**

---

### Property 6: Bookmark round-trip (add → read)

*For any* valid `(surahNumber, ayahNumber)` pair within range 1–114 and 1–286, calling `addBookmark`
then `getBookmarks` must return an array that contains a bookmark entry where `surahNumber` and
`ayahNumber` equal the values that were passed in.

**Validates: Requirements 6.1**

---

### Property 7: Bookmark removal removes from storage

*For any* bookmark that has been added, calling `removeBookmark(id)` must result in `getBookmarks`
returning an array that contains no entry with that `id`, and `isBookmarked(surahNumber, ayahNumber)`
must return `false` for the removed entry.

**Validates: Requirements 6.5**

---

### Property 8: Bookmarked Ayah items show visual indicator

*For any* `Ayah` object where `isBookmarked` is `true` in the state argument, `AyahItem(ayah, { isBookmarked: true })` must produce an element that contains a child element with the bookmark-active class or `aria-pressed="true"` attribute.

**Validates: Requirements 6.2**

---

### Property 9: Bookmark list renders all saved bookmarks

*For any* non-empty array of `Bookmark` objects, `BookmarkList(bookmarks)` must produce a list element
containing exactly the same number of children as the input array, with each child containing the
corresponding Surah name and Ayah number.

**Validates: Requirements 6.3**

---

### Property 10: Reading progress round-trip (save → restore)

*For any* valid `(surahNumber, ayahNumber)` pair, calling `saveProgress(surahNumber, ayahNumber)` then
`getProgress()` must return an object with `surahNumber` and `ayahNumber` equal to those that were saved.

**Validates: Requirements 7.1, 7.4**

---

### Property 11: Theme toggle is an involution

*For any* current theme value (`"light"` or `"dark"`), calling `toggleTheme()` twice must leave
`document.documentElement.getAttribute('data-theme')` equal to its initial value (toggling is its own
inverse).

**Validates: Requirements 8.2**

---

### Property 12: Theme preference round-trip (save → restore)

*For any* valid theme value (`"light"` or `"dark"`), saving it to LocalStorage via `storage.set` then
reading it back via `storage.get` must return an equal string value.

**Validates: Requirements 8.3**

---

### Property 13: Translation preference round-trip

*For any* valid translation ID from the `TRANSLATIONS` constant, saving it and reading it back from
LocalStorage must return an equal string value.

**Validates: Requirements 4.3**

---

### Property 14: Translation change updates all rendered Ayahs

*For any* rendered Surah with `n` Ayahs and any valid translation ID, dispatching
`quran:translation-changed` must cause all `n` rendered `AyahItem` elements to display the translation
text corresponding to the new translation ID and no Ayah should show text from the previous translation.

**Validates: Requirements 4.2**

---

### Property 15: Active Ayah highlight is exclusive

*For any* Ayah number `k` in a rendered `AyahList`, when `quran:ayah-changed` is dispatched with
`{ ayahNumber: k }`, exactly one `AyahItem` must have the `.ayah--active` class (the one with `number === k`)
and all others must not have it.

**Validates: Requirements 5.3**

---

### Property 16: API response validation correctness

*For any* JavaScript object, `validateSurahResponse(obj)` must return `true` if and only if the object
contains all required fields (`number`, `nameArabic`, `nameTranslit`, `ayahCount`, `revelationType`);
for any object missing any of these fields, it must return `false`.

**Validates: Requirements 14.2**

---

### Property 17: Serialization round-trip

*For any* valid `Surah` or `Ayah` object produced by `parser.js`, calling
`parseSurah(JSON.parse(JSON.stringify(obj)))` must return an object that is deeply equal to the
original — i.e., parsing → printing → parsing is an identity transformation under the application's
data model.

**Validates: Requirements 14.5, 14.6**

---

### Property 18: Interactive elements have accessible labels

*For any* component rendered by any function in `js/components/`, every interactive element (button,
anchor, input) in the produced DOM must have either a non-empty `aria-label` attribute or non-empty
visible text content, ensuring screen-reader discoverability.

**Validates: Requirements 12.3**

---

## Error Handling

### API Errors

- **Network failure:** `api.js` catches fetch rejections and retries with the fallback API. If both fail,
  it throws a typed `ApiError` with `{ type: 'network', message }`.
- **Non-2xx response:** Treated as failure — fallback attempted. HTTP 429 (rate-limit) triggers a
  15-second back-off before retry.
- **Malformed response:** `parser.js` validates required fields; if validation fails, it throws
  `ApiError { type: 'parse', message }`.
- **Caller handling:** Page initializers catch `ApiError` and call `renderError(container, message, retryFn)`
  to display a user-facing error with a Retry button that re-invokes the page init.

### LocalStorage Errors

- `storage.set()` wraps `localStorage.setItem` in a try/catch. If `QuotaExceededError` is thrown, it
  dispatches `quran:storage-error` with the error message. Components listen and render a toast
  notification informing the user that the action could not be saved.
- `storage.get()` returns `null` on any parse or read error (safe default).

### Service Worker Errors

- If `navigator.serviceWorker.register()` rejects (unsupported browser, HTTPS requirement not met),
  `main.js` catches the error, logs it to console, and continues — the app works in online-only mode.
- API cache misses while offline return the static offline JSON `{ error: "Offline and no cached data" }`;
  `api.js` converts this into an `ApiError { type: 'offline' }` for uniform handling.

### Audio Errors

- `HTMLAudioElement.onerror` dispatches `quran:audio-error`. `AudioPlayer.js` listens and displays an
  error banner within the player UI. Playback is stopped; the user can manually retry.

---

## Testing Strategy

### Dual Testing Approach

The project uses two complementary testing layers:

- **Unit / example tests**: Verify specific behaviors, edge cases, and error paths
- **Property-based tests**: Verify universal properties hold across a wide range of generated inputs

Both layers are necessary: unit tests catch concrete bugs in specific scenarios; property tests verify
general correctness without enumerating every case.

### Testing Tools

- **Test runner**: [Vitest](https://vitest.dev/) (runs in Node.js, no browser required for pure logic tests)
- **Property-based testing library**: [fast-check](https://fast-check.io/) — a well-maintained TypeScript/JavaScript PBT library
- **DOM testing** (component tests): [happy-dom](https://github.com/capricorn86/happy-dom) as Vitest's jsdom environment

Install:
```bash
npm install --save-dev vitest fast-check happy-dom
```

Configuration (`vitest.config.js`):
```js
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});
```

### Property-Based Test Configuration

- Each property test runs a **minimum of 100 iterations** (fast-check default is 100, kept at default)
- Each test is tagged with a comment referencing the design property:
  `// Feature: quran-web-app, Property {N}: {property_text}`
- Each correctness property maps to **one** `fc.assert(fc.property(...))` call

### Test File Structure

```
js/
└── __tests__/
    ├── parser.test.js          # Properties 16, 17
    ├── search.test.js          # Properties 4, 5
    ├── storage.test.js         # Properties 12, 13
    ├── bookmarks.test.js       # Properties 6, 7
    ├── progress.test.js        # Property 10
    ├── theme.test.js           # Properties 11, 12
    ├── components/
    │   ├── SurahCard.test.js   # Property 1
    │   ├── AyahItem.test.js    # Properties 2, 8, 18
    │   ├── AyahList.test.js    # Properties 3, 15
    │   ├── BookmarkList.test.js # Property 9
    │   └── AudioPlayer.test.js # Property 15 (integration of audio events)
    └── integration/
        ├── api.test.js         # Properties 4 (via mocked fetch), 16, 17; Example tests for API errors
        └── translation.test.js # Properties 13, 14
```

### Property-Based Test Examples

```js
// Feature: quran-web-app, Property 4: Search filter correctness
import fc from 'fast-check';
import { filterSurahs } from '../search.js';
import { SURAH_LIST } from '../fixtures/surahs.js'; // the 114 static Surahs

test('Property 4: filterSurahs returns only matching surahs', () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1, maxLength: 20 }),
    (query) => {
      const result = filterSurahs(SURAH_LIST, query);
      const q = query.toLowerCase();
      return result.every(s =>
        s.nameArabic.includes(q) ||
        s.nameTranslit.toLowerCase().includes(q) ||
        s.nameEnglish.toLowerCase().includes(q) ||
        String(s.number).includes(q)
      );
    }
  ));
});

// Feature: quran-web-app, Property 17: Serialization round-trip
import fc from 'fast-check';
import { parseSurah } from '../parser.js';

test('Property 17: parseSurah round-trip', () => {
  fc.assert(fc.property(
    fc.record({
      number: fc.integer({ min: 1, max: 114 }),
      nameArabic: fc.string({ minLength: 1 }),
      nameTranslit: fc.string({ minLength: 1 }),
      nameEnglish: fc.string({ minLength: 1 }),
      ayahCount: fc.integer({ min: 1, max: 286 }),
      revelationType: fc.constantFrom('Meccan', 'Medinan'),
    }),
    (raw) => {
      const parsed = parseSurah(raw);
      const reparsed = parseSurah(JSON.parse(JSON.stringify(parsed)));
      return JSON.stringify(parsed) === JSON.stringify(reparsed);
    }
  ));
});
```

### Unit Test Focus

Unit tests cover:
- API error handling (network failure, malformed response, 429 back-off)
- LocalStorage quota exceeded error path
- Service Worker registration failure graceful degradation
- Audio `onerror` handler displaying error banner
- "No results found" message on empty search results
- ContinueReadingBanner appears when progress exists in LocalStorage
- Theme restored from LocalStorage on load; `prefers-color-scheme` used as fallback
- Surah navigation controls: Surah 1 has no "Previous", Surah 114 has no "Next" (boundary edge cases)
- Ayah playback stops automatically after the last Ayah

### Integration Tests

Integration tests (with mocked `fetch` and `cacheStorage`) cover:
- Service Worker caches Surah API response on first visit
- Service Worker serves cached Surah response when offline
- Service Worker returns offline error JSON when cache miss and offline

---
