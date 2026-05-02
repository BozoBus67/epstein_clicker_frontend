> ⚠️ AI-generated, not yet proofread by a human. Treat as tech debt.

# Shared components

Reusable building blocks pulled in across screens. Most are obvious from the filename; this README only documents the few that have non-obvious conventions or load-bearing history.

## `Subscreen`

The standard wrapper for any screen nested under `/game`. Renders the themed full-viewport container, the `Page_Header` (back arrow + title), and wires `useEscapeKey` to navigate back. Pass `disabled={true}` while a request is in-flight or a confirm modal is open to suppress the escape handler.

```jsx
<Subscreen title="Mastery Scrolls" back_to="/game" disabled={loading}>
  {/* body */}
</Subscreen>
```

A few screens stay manual instead of using `Subscreen`:

- Screens that need to escape-close a modal first and only then exit — they wire their own `useEscapeKey(modal_close, modal_open)` and pass `disabled={modal_open}` to `Subscreen` so the two handlers compose without fighting.

## The dropped X button

There used to be a top-right `X_Button` rendered alongside the back arrow on some screens. The convention was: **back arrow + esc = up one level, X = jump to home**. Genuinely useful in apps with 2+ levels of nested screens.

In practice, nothing in this app ever nested deep enough to need the distinction — every screen with both buttons had them route to the same place, which is just visual noise. So `X_Button` was removed.

**If a deeper nested flow ever appears** (e.g. `/game/foo/bar/baz` where each level should be backable independently AND there should be a "jump home" shortcut), resurrect the component:

```bash
git show 3457f88:vite_part_react/src/shared/components/x_button.jsx
```

That commit is the last living copy. The styling matches the current `Back_Arrow_Button`. Re-add it as an opt-in prop on `Subscreen` (e.g. `show_home_button` or `home_to`) rather than as a separate top-level component, so the convention is enforced by the wrapper.

## `Page_Header`

Just the back-arrow-plus-title row used inside `Subscreen`. Exposed standalone in case some future screen needs the header look without `Subscreen`'s container/escape behavior. If nothing actually uses it standalone, fold it into `Subscreen` and delete this component.

## `Async_Refresh_Button` / `Refresh_Button`

`Refresh_Button` is the visual; `Async_Refresh_Button` wraps it with promise-lifecycle plumbing (disables itself in-flight, surfaces success/error toasts). Both default to a subtle outline style; pass `style` at the call site for prominence (the top-bar account refresh uses an accent-filled variant with a glow halo).
