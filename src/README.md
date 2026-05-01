# Frontend conventions

Codebase-wide rules for the Vite/React frontend. Per-feature READMEs in each folder document architecture; this file documents conventions that apply everywhere.

## Fail loud and early

Don't silently swallow problems. Don't paper over unexpected state with overly-permissive defaults, empty `catch` blocks, optional chaining used as a "just hope it's there" shortcut, or fallback values that mask the real shape mismatch. 

Failing loud doesn't always mean throwing — a toast popup, a `console.error`, or an explicit `throw` are all valid depending on context. The point is that the failure is *visible* the moment it happens, to whoever can act on it (user, developer, or oncall). When in doubt, surface it; we'd rather see a noisy bug we can fix than a quiet bug we can't find.

## Code

- **Component file structure** — for each feature folder containing a screen, define the screen's components in *one file* per top-level screen, top-down by JSX hierarchy (screen first, sub-components in render order, modals last). Co-locate state with the thing that triggers it.
- **Hook order in components** — external data sources (`useSelector`, `useTheme`, custom hooks) → local state (`useState`, `useReducer`) → refs (`useRef`) → derived values and handlers → effects (`useEffect`) → JSX. Loose, not strict — `useState` initial values can depend on selectors, in which case the selector goes first.
- **Import order** — `react` → external libs (alphabetical) → `../shared/*` (alphabetical) → `./*` (alphabetical). One blank line not required between groups.
- **`type="button"` on every `<button>`** — HTML's default is `type="submit"`, which means any button inside a `<form>` ancestor would trigger form submission (and a page reload) on click — including "Cancel" buttons that you'd never expect to submit anything. We don't currently use `<form>` elements, so this is purely defensive against future refactors that might introduce one.
- **Inline styles + Tailwind** — both are accepted. The codebase favors inline `style={{}}` for component-specific styling and Tailwind classes for layout primitives. Pick what's already used in the file you're editing.
- **No dense one-liners** — chained method calls with 3+ steps, nested arrow functions, and inline destructuring puzzles like `[, u]` are discouraged. Spell things out as named intermediates when an expression starts taking a re-read to parse.

## API & errors

- **Backend-translated error messages** — the backend maps Supabase/internal exceptions to user-friendly `detail` strings with appropriate HTTP status codes. The frontend displays `err.detail` directly. Don't re-translate errors on the frontend.
- **`*_auth` helpers in `shared/api_client.js`** — `get_auth`, `post_auth`, `patch_auth` wrap the basic verbs with auto-injected Supabase JWTs. Use them for any authenticated endpoint. Fall back to `get`/`post`/`patch` only for public endpoints (e.g., `/login`, `/get_listings`).
- **Per-feature `api.js`** — each folder that talks to the backend has its own `api.js` exposing named functions (`api_buy_listing`, etc.). Internal-only api functions live there; only what's needed cross-folder gets re-exported via `index.js`.

## Documentation

- **Per-feature `README.md`** — every feature folder gets one if it's non-trivial (auction_house, chess, etc.). The README documents architecture, modal ownership, data flow, anything a new reader needs that isn't obvious from the code itself.
- **No "File map" sections** — folder listings show what files exist; restating it in prose drifts and adds noise.
- **High-level comments only in source files** — the file-top comment explains the *why* and points at the README for architecture. Short inline comments explain the *why* of specific code, not the *what*. If a comment grows past ~5 lines, move it to the README.
- **Markdown over ASCII art** — bullet lists, headings, and code spans render in both raw text and Markdown viewers. Tables look like garbled pipes when not rendered; avoid them.

## Theming

- **`useTheme()` from `shared/theme.js`** — components that should respond to the user's light/dark preference read colors from the returned palette. Add a new themed property by adding the key to *both* the light and dark palettes; missing keys silently produce `undefined` styles.
- **Auth screens deliberately don't theme** — pre-login means no `premium_game_data.theme` to read. Hardcoded dark styling is intentional there.

## State management

- **Redux for cross-component server-backed state** — `session.session_data`, `session.game_data`, `session.premium_game_data` are mirrored from the backend. Updates dispatch through `update_*` reducers in `shared/store/sessionSlice.js`.
- **`useState` for local form/UI state** — anything that doesn't need to persist or be shared across components.
- **localStorage only via Supabase auth** — the Supabase client owns the session token in localStorage. Don't use localStorage directly for app data; round-trip through the backend so it persists per-account, not per-browser.
- **Field-granular reducers** — when updating one field on `game_data` or `premium_game_data`, prefer `update_*_field({ key, value })` or `increment_*_field({ key, amount })` over the whole-object `update_*_data` reducers. The whole-object pattern (spread + override) is race-prone for async updates. See `shared/store/README.md` for the full story.

## Testing

Tests use [vitest](https://vitest.dev/) — Vite's native test runner — with `@testing-library/react` for component tests. Run:

- `npm test` — watch mode (default; reruns affected tests as you edit).
- `npm test -- run` — one-shot CI-style run.
- `npx vitest list` — show every test file vitest discovered.
- `npx vitest --ui` — visual dashboard (requires `@vitest/ui`).

Convention: tests live colocated next to source as `*.test.js` / `*.test.jsx`. The "index" of tests is the auto-discovered set — there's no manual manifest by design.

What's tested in Tier 1 (today): reducers, pure utility functions, and core shared components (`Confirm_Modal`). Tier 2 (later) adds screen-level component tests + game logic tests as need arises.
