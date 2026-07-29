# Selayang.my.id Steering

## Project Vision

Selayang.my.id is a modern Quran Progressive Web App focused on simplicity, speed, accessibility, and long-term maintainability.

---

## Project Priorities

1. Correctness
2. Readability
3. Performance
4. Accessibility
5. Maintainability

---

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Progressive Web App

No framework unless explicitly approved.

---

## Coding Rules

Always produce modular code.

Never create a single large JavaScript file.

Maximum responsibility per module:

- UI
- Reader
- Search
- Audio
- Bookmark
- Settings

---

## UI Rules

Use CSS Variables.

Responsive First.

Dark Mode supported.

Touch Friendly.

Accessibility compliant.

---

## Architecture

Prefer component-based architecture.

Separate UI from Services.

Separate Services from API.

Separate API from Storage.

---

## Routing

Current implementation may use Hash Routing for compatibility.

Architecture must remain compatible with History API migration.

Do not tightly couple routing logic.

---

## APIs

Primary API:

equran.id

Fallback API:

alquran.cloud

All API calls must be isolated inside Service modules.

---

## Storage

Use LocalStorage.

Namespace:

slq:

Example

slq:theme

slq:bookmark

slq:last-read

---

## Documentation

Every module must contain documentation.

README must always be updated.

Architecture changes require updating:

docs/ARCHITECTURE.md

Roadmap changes require updating:

docs/ROADMAP.md

---

## Development Philosophy

Keep code simple.

Avoid premature optimization.

Prefer readability over cleverness.

Prefer long-term maintainability over short-term speed.

Always respect third-party licenses.

Build features incrementally following the roadmap.

Every feature should be production quality before moving to the next milestone.
