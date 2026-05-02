> AI-generated, proofread and edited (by human).

# Auth

Login and signup screens, and the `/me` API call used by the rest of the app to rehydrate session state.

## Components

Each screen file holds its top-level component plus a `*_Panel` sub-component that owns the form state. The screens are intentionally **not** factored into shared building blocks — there are only two of them, and the duplication (panel styling, input styling, button styling) reads more clearly when each screen is self-contained than when distributed across helpers.

- `Login_Screen` — full-page login. Submits `username_or_email` + `password` to `/login`, sets the Supabase session, dispatches Redux `login`, navigates to `/game`.
- `Sign_Up_Screen` — full-page signup. Same lifecycle but to `/signup`, with a local "passwords don't match" check.
- `Login_Panel` / `Sign_Up_Panel` — sub-components inside each screen file. Own their form fields, render the inline-styled card UI directly. Use `input_style` (a per-component local) and `on_enter` (a local Enter-to-submit handler) to keep the input markup tidy without leaving the file.

`api.js` exposes `api_login`, `api_signup`, and `api_me`. Of these, only `api_me` is publicly re-exported via `index.js` (used by `App.jsx` for session restore and by the top bar's refresh button).

## Session restore on app boot

`App.jsx::restore_session` runs once at mount. If `supabase.auth.getSession()` returns a cached session, it tries `api_me()` to validate that the JWT still works against our backend. Two outcomes:

- **`/me` succeeds** — dispatch `login`, render `Game_Shell`.
- **`/me` fails (typically 401: stale JWT)** — sign out and render `Auth_Shell`.

The sign-out branch uses `supabase.auth.signOut({ scope: 'local' })` rather than the default network sign-out. That's a deliberate choice:

- The default `signOut()` posts to Supabase's `/logout` endpoint with the current access token. If we got here, that token was *just rejected by `/me`* — Supabase will reject it too and return **403**, producing a confusing-looking error in the console for what is actually expected behavior.
- `scope: 'local'` clears the cached session client-side without making the network call. Same end state, no doomed request.

This is **not** an instance of silencing a real failure — the `/me` 401 itself stays visible in the network panel, which is correct fail-loud signal that the session expired. We're only skipping the redundant `/logout` round-trip that we already know will fail.

## Theming

The auth screens deliberately do **not** use `useTheme`. They render before the user is logged in, so there's no `premium_game_data.theme` to read. Hardcoded dark styling is intentional. If you need to tweak the look, edit each screen file directly.

---

## Legacy notes — spare-time reading only

> Skip this section unless you're curious about a quirk in this codebase's history. It documents a previous workaround we removed; nothing here is required for working on the auth files.

Earlier versions of this app were built with Preact (a React-compatible alternative). When the codebase migrated to React, leftover machinery from a Preact-era bug stuck around in `login_screen.jsx` for a while. We cleaned it up; this note explains what the bug was so future readers don't reintroduce a similar workaround thinking it's still needed.

### The bug (Preact era)

In a controlled input like `<input value={x} onChange={(e) => set_x(e.target.value)} />`, you expect the React-level state `x` to update on every keystroke. In Preact at the time, that wasn't the case — `onChange` only fired when the input lost focus. So you'd type your password, click "Login", and submit with stale (empty) state because the input's blur event hadn't fired yet.

### Why it happens

The DOM has two events that are easy to confuse:

- `input` — fires on every keystroke.
- `change` — fires on blur / commit (older HTML semantic).

React's `onChange` is famously misnamed: it's actually wired to the DOM `input` event under the hood, so it fires per keystroke. This is technically inconsistent with native HTML `onchange`, but it's the React mental model that everyone learned.

Preact, more standards-faithful, wired its `onChange` to the DOM `change` event (blur-only). Same JSX attribute name, different behavior. That's the bug.

### The original workaround (now removed)

The previous AI session that hit this bug fixed it by giving up on `onChange` entirely and registering a global `keydown` listener on `document`, plus a `useRef` to keep the listener pointing at the latest submit handler. The result was something like:

```js
const submit_ref = useRef(null);
submit_ref.current = try_login;          // ref-write during render

useEffect(() => {
  const handle = (e) => { if (e.key === 'Enter') submit_ref.current(); };
  document.addEventListener('keydown', handle);
  return () => document.removeEventListener('keydown', handle);
}, []);
```

This worked but was overkill. The real fix in Preact would have been to use `onInput` instead of `onChange`. The deeper root fix was the migration to React, where `onChange` already does what we want.

### What's there now

Both auth screens use the simple, idiomatic pattern: `onChange` on each input for state updates, `onKeyDown` on each input for Enter-to-submit. No refs, no global listeners.

### Takeaway for future readers

If you ever migrate frameworks (Preact, Solid, anything else with React-compatible JSX), audit input handlers for this exact issue: form state silently going stale because `onChange` semantics differ. The standards-compliant attribute is `onInput` if you need it.
