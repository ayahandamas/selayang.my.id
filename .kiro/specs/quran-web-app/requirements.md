# Requirements Document

## Introduction

Selayang.my.id is a modern Quran web application built as a Progressive Web App (PWA). The application provides Muslims with a fast, lightweight, and privacy-first experience for reading, understanding, and listening to the Quran. Version v0.1.0 establishes the foundational architecture and homepage, supporting Arabic Uthmani text, multiple translations (Indonesian, Malay, English), audio recitation, bookmarks, resume reading, dark/light themes, and offline access — all without advertisements or user tracking.

The application is built entirely with HTML5, CSS3, and Vanilla JavaScript using a mobile-first, modular, component-based architecture. Data is persisted in LocalStorage and a Service Worker enables offline capability.

---

## Glossary

- **App**: The Selayang.my.id Quran web application as a whole.
- **PWA**: Progressive Web App — a web application that uses Service Worker and Web App Manifest to behave like a native app.
- **Service_Worker**: A browser background script that intercepts network requests and manages caching for offline support.
- **Surah**: A chapter of the Quran; there are 114 surahs in total.
- **Ayah**: A verse within a Surah.
- **Uthmani_Text**: The standard Arabic script for the Quran as codified in the Uthmani mushaf.
- **Translation**: A rendering of the Quran text into another language (Indonesian, Malay, or English).
- **Reciter**: An audio recitation track of the Quran by a named reciter.
- **Bookmark**: A saved reference to a specific Ayah, stored in LocalStorage.
- **Reading_Progress**: The last Surah and Ayah the user was reading, stored in LocalStorage.
- **Theme**: The visual color scheme of the App; either Light or Dark.
- **API**: The external REST API used to fetch Quran text, translations, and audio data.
- **Cache**: Browser-side storage managed by the Service_Worker for offline access.
- **LocalStorage**: Browser-native key-value storage used to persist user preferences and bookmarks.
- **Manifest**: The Web App Manifest JSON file that enables PWA installation.
- **Module**: A self-contained JavaScript file with a single responsibility, exported as an ES module.
- **Component**: A reusable UI rendering function that produces a DOM structure.

---

## Requirements

### Requirement 1: Application Foundation and PWA Setup

**User Story:** As a user, I want to install the App on my device and use it like a native app, so that I can access the Quran quickly without opening a browser tab.

#### Acceptance Criteria

1. THE App SHALL include a Web App Manifest (`manifest.json`) with a name, short name, start URL, display mode, theme color, background color, and at least one icon.
2. THE App SHALL register a Service_Worker on first load to enable offline capability.
3. WHEN the user visits the App on a supported browser, THE App SHALL display a prompt or meet browser criteria to allow installation as a PWA.
4. WHEN the App is loaded without a network connection, THE Service_Worker SHALL serve cached assets so the App remains usable.
5. IF the Service_Worker registration fails, THEN THE App SHALL continue to function in online mode without crashing.

---

### Requirement 2: Homepage and Navigation Shell

**User Story:** As a user, I want a clear and welcoming homepage, so that I can orient myself and navigate to any feature of the App.

#### Acceptance Criteria

1. THE App SHALL render a homepage that includes a header, navigation menu, main content area, and footer.
2. THE App SHALL display the application name "Selayang.my.id" and a tagline describing its purpose on the homepage.
3. WHEN the user loads the App for the first time, THE App SHALL display the list of all 114 Surahs on the homepage.
4. THE App SHALL include a responsive navigation menu that collapses into a hamburger icon on screens narrower than 768px.
5. WHEN the user taps the hamburger icon, THE App SHALL expand or collapse the navigation menu.
6. THE App SHALL display Surah entries with Surah number, Arabic name, transliterated name, English name, number of Ayahs, and revelation type (Meccan/Medinan).

---

### Requirement 3: Surah Reading View

**User Story:** As a user, I want to read any Surah with Arabic text and a translation side by side, so that I can understand the meaning of the Quran.

#### Acceptance Criteria

1. WHEN the user selects a Surah, THE App SHALL fetch the Surah's Ayahs from the API and display them.
2. THE App SHALL display each Ayah with the Uthmani_Text in Arabic script, the Ayah number, and the selected Translation below or beside the Arabic text.
3. THE App SHALL render Arabic text in a right-to-left direction using an appropriate Quranic Arabic font.
4. WHEN the API request succeeds, THE App SHALL display all Ayahs of the selected Surah in sequential order.
5. IF the API request fails, THEN THE App SHALL display a descriptive error message and provide a retry option.
6. WHILE a Surah is loading, THE App SHALL display a loading indicator to inform the user that content is being fetched.
7. THE App SHALL display navigation controls to move to the previous Surah and the next Surah from within the reading view.

---

### Requirement 4: Translation Selection

**User Story:** As a user, I want to choose a translation in my preferred language, so that I can read the Quran in a language I understand.

#### Acceptance Criteria

1. THE App SHALL support at least three translations: Indonesian (Kemenag), English (Sahih International), and Malay (where licensing permits).
2. WHEN the user selects a translation, THE App SHALL update the displayed translation for all visible Ayahs without reloading the page.
3. THE App SHALL persist the user's selected translation in LocalStorage so the same translation is active on the next visit.
4. WHEN the App loads, THE App SHALL restore the previously selected translation from LocalStorage; if no selection is stored, THE App SHALL default to the Indonesian translation.

---

### Requirement 5: Audio Recitation

**User Story:** As a user, I want to listen to audio recitation of each Ayah or the whole Surah, so that I can follow along and improve my pronunciation.

#### Acceptance Criteria

1. THE App SHALL provide an audio player within the reading view to play recitation of the current Surah.
2. WHEN the user presses Play, THE App SHALL fetch and play the audio track for the current Surah from the selected Reciter.
3. WHEN an Ayah is being recited, THE App SHALL highlight the corresponding Ayah text on screen.
4. THE App SHALL provide playback controls: play, pause, stop, and skip to the next Ayah.
5. IF the audio resource cannot be fetched, THEN THE App SHALL display an error message indicating that audio is unavailable.
6. THE App SHALL support at least one default Reciter for audio playback.
7. WHEN playback reaches the final Ayah of a Surah, THE App SHALL stop playback automatically.

---

### Requirement 6: Bookmarks

**User Story:** As a user, I want to bookmark specific Ayahs, so that I can quickly return to important verses later.

#### Acceptance Criteria

1. WHEN the user activates the bookmark action on an Ayah, THE App SHALL save that Ayah's Surah number and Ayah number to LocalStorage.
2. THE App SHALL visually indicate bookmarked Ayahs within the reading view using a distinct icon or highlight.
3. THE App SHALL provide a dedicated bookmarks page that lists all saved bookmarks with their Surah name and Ayah number.
4. WHEN the user selects a bookmark from the bookmarks page, THE App SHALL navigate to that Surah and scroll to the bookmarked Ayah.
5. WHEN the user removes a bookmark, THE App SHALL delete the corresponding entry from LocalStorage and remove the visual indicator immediately.
6. IF LocalStorage is full or unavailable, THEN THE App SHALL display an error message and not silently discard the bookmark.

---

### Requirement 7: Resume Reading (Reading Progress)

**User Story:** As a user, I want the App to remember where I left off, so that I can continue reading from the same place on my next visit.

#### Acceptance Criteria

1. WHEN the user navigates away from a Surah reading view, THE App SHALL save the current Surah number and Ayah number as the Reading_Progress in LocalStorage.
2. WHEN the App loads and a Reading_Progress entry exists in LocalStorage, THE App SHALL display a "Continue Reading" prompt on the homepage with the Surah name and Ayah number.
3. WHEN the user activates the "Continue Reading" prompt, THE App SHALL navigate to the saved Surah and scroll to the saved Ayah position.
4. THE App SHALL update the Reading_Progress in LocalStorage each time the user scrolls past a new Ayah while reading.

---

### Requirement 8: Dark and Light Theme

**User Story:** As a user, I want to switch between dark and light themes, so that I can read comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL support a Light theme and a Dark theme with sufficient color contrast (minimum WCAG AA 4.5:1 ratio for body text).
2. WHEN the user activates the theme toggle, THE App SHALL switch between Light and Dark themes without reloading the page.
3. THE App SHALL persist the user's selected theme in LocalStorage so the theme is preserved on subsequent visits.
4. WHEN the App loads, THE App SHALL restore the theme from LocalStorage; if no preference is stored, THE App SHALL apply the theme that matches the user's operating system preference (`prefers-color-scheme`).
5. THE App SHALL apply the active theme to all pages and components consistently.

---

### Requirement 9: Search

**User Story:** As a user, I want to search for a Surah by name or number, so that I can navigate to the Surah I want without scrolling through all 114.

#### Acceptance Criteria

1. THE App SHALL provide a search input field on the Surah list page that filters Surahs in real time as the user types.
2. WHEN the user types in the search field, THE App SHALL display only Surahs whose Arabic name, transliterated name, English name, or Surah number match the query.
3. WHEN the search query matches no Surahs, THE App SHALL display a "No results found" message.
4. WHEN the user clears the search field, THE App SHALL restore the full list of 114 Surahs.
5. THE App SHALL perform all Surah search operations locally without making additional API requests.

---

### Requirement 10: Offline Support

**User Story:** As a user, I want to continue reading previously visited Surahs without an internet connection, so that I can access the Quran anywhere.

#### Acceptance Criteria

1. THE Service_Worker SHALL cache all static assets (HTML, CSS, JavaScript, fonts, icons) on first install.
2. WHEN a user visits a Surah for the first time, THE Service_Worker SHALL cache the API response for that Surah's text and translation.
3. WHEN the user requests a cached Surah while offline, THE Service_Worker SHALL serve the cached data without contacting the API.
4. IF a requested Surah has not been previously cached, THEN THE App SHALL display a message informing the user that the content is not available offline.
5. WHEN the App goes back online after being offline, THE Service_Worker SHALL refresh stale cached resources in the background.

---

### Requirement 11: Privacy and No Advertisements

**User Story:** As a user, I want an application that does not track my activity or show advertisements, so that I can use the Quran privately and without distraction.

#### Acceptance Criteria

1. THE App SHALL NOT include any third-party analytics scripts, tracking pixels, or advertisement networks.
2. THE App SHALL store all user data (bookmarks, progress, preferences) exclusively in the user's own LocalStorage on the user's device.
3. THE App SHALL NOT transmit user-identifiable data to any external server beyond the API requests necessary to fetch Quran content.
4. THE App SHALL fetch Quran content only from the designated API endpoints and SHALL NOT load resources from unauthorized third-party domains.

---

### Requirement 12: Responsive and Accessible Design

**User Story:** As a user, I want the App to work well on any device and be accessible, so that I can read on my phone, tablet, or desktop without difficulty.

#### Acceptance Criteria

1. THE App SHALL use a mobile-first CSS layout that adapts correctly to screen widths from 320px to 2560px.
2. THE App SHALL render all interactive elements (buttons, links, inputs) with a minimum touch target size of 44×44 CSS pixels.
3. THE App SHALL include appropriate ARIA roles and labels on interactive elements so screen readers can describe them.
4. THE App SHALL maintain a logical heading hierarchy (`h1` → `h2` → `h3`) on every page.
5. WHEN a user navigates using a keyboard only, THE App SHALL display a visible focus indicator on the active element.
6. THE App SHALL load and display the initial page content within 3 seconds on a 4G mobile connection.

---

### Requirement 13: Modular JavaScript Architecture

**User Story:** As a developer, I want the codebase to be organized into well-defined modules, so that I can maintain and extend the application easily.

#### Acceptance Criteria

1. THE App SHALL organize all JavaScript into ES2023 modules where each file has a single, documented responsibility.
2. THE App SHALL use camelCase naming for all variables and functions, and PascalCase for component constructors.
3. THE App SHALL include a JSDoc comment block at the top of every module describing its purpose, inputs, and outputs.
4. THE App SHALL follow a clean folder structure: `css/` for stylesheets, `js/` for modules, `assets/` for fonts and icons, and `pages/` for HTML page files.
5. THE App SHALL implement UI rendering through Component functions that return or inject DOM elements, keeping business logic separate from presentation.

---

### Requirement 14: API Integration

**User Story:** As a developer, I want the App to integrate with a Quran REST API, so that Surah text, translations, and audio data are always up-to-date and correctly licensed.

#### Acceptance Criteria

1. THE App SHALL fetch all Quran text, translation, and audio data from a single designated REST API (e.g., alquran.cloud or equran.id).
2. WHEN an API response is received, THE App SHALL validate that the response contains the expected fields before rendering.
3. IF an API response contains unexpected or malformed data, THEN THE App SHALL log the error to the browser console and display a user-facing error message.
4. THE App SHALL implement a dedicated API module (`js/api.js`) that centralizes all fetch calls and abstracts endpoint URLs from the rest of the codebase.
5. THE App SHALL use a parser to deserialize API JSON responses into typed application objects, and THE Pretty_Printer SHALL serialize those objects back into valid JSON where needed.
6. FOR ALL valid API response objects, parsing then printing then parsing SHALL produce an equivalent object (round-trip property).
