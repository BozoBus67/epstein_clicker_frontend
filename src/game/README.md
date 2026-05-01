> ⚠️ AI-generated, not yet proofread by a human. Treat as tech debt.

# Game

The main clicker screen and everything that runs on it: the cookie click loop, the rotating ad panel, building purchases, the slot machine and roulette modals, and the assorted background timers (auto-save, daily/hourly/5-minute check-ins, CPS tick).

## `game_data` vs `premium_game_data`

Each user row has two JSONB columns. The split isn't cosmetic — it's a deliberate ownership boundary that determines who is allowed to write what.

**`game_data`** — the grindable state. Everything the player accumulates through normal play sits here:

- `quantity` (current cookies)
- `cps` (cookies per second, derived from buildings)
- `cookies_per_click`
- `buildings` (a dict of how many of each building they own)

This changes constantly (every second from the CPS tick, every cookie click, every building purchase). The frontend is allowed to own the working copy in Redux and persist the whole object to `/save_game_data` periodically. **"Reset Game"** wipes only this column.

**`premium_game_data`** — everything tied to real money, external systems, or anti-cheat-sensitive counters:

- `tokens` (bought with real money via Stripe, or won from `/spin`)
- `account_tier` (bought with tokens)
- `mastery_scroll_1`..`mastery_scroll_25` (won from gambling)
- `chess_beaten_bots`
- `login_streak` / `last_login_date` / `hourly_streak` / `last_hourly_claim` / `fivemin_streak` / `last_5min_claim`
- `redeemed` (one-time-redeem flags)
- `theme` (gated behind owning the George Floyd scroll)

The frontend is **not** allowed to own this. Every field above is written exclusively by the specific backend endpoint that owns it: `/spin` increments scrolls, `/buy_account_tier` deducts tokens and bumps the tier, `/daily_checkin` updates the streak fields, the Stripe webhook adds tokens, etc. The client just reflects what the server says.

## Save scope: only `game_data`

The auto-save loop in `main_screen.jsx` (and the `Cmd/Ctrl+S` shortcut) calls `save_game_data()`, which posts **only `game_data`** to `/save_game_data`. `premium_game_data` is deliberately never sent.

Why: if the client were allowed to PUT the whole `premium_game_data` object every minute, a request that's in flight on the server (e.g. `/spin` is mid-way through awarding a mastery scroll) would race against the next auto-save (the client's `pgd` snapshot doesn't know about the new scroll yet). The auto-save would land last and silently revert the win. Real money is involved (tokens come from Stripe), so this would be much worse than a normal save bug.

The fix is structural: the client never persists `premium_game_data` at all. Mutations to it always go through a *specific* endpoint that reads + writes the field server-side, then returns the updated `premium_game_data` in its response, which the frontend mirrors into Redux. This keeps all `pgd` writes serialized through the backend.

**Practical implication for this folder:** if you find yourself wanting to write a `pgd` field from a click handler in here, don't add it to `save_game_data` — instead, add (or call) a backend endpoint that owns that field, and dispatch the returned `premium_game_data` into Redux from the response.

> **Caveat.** "All `pgd` writes go through the backend" is the *frontend* ownership boundary — and that one is rock-solid (no client code persists `pgd`). It does **not** mean the backend itself is race-free. The backend currently does naive read-modify-write on the JSONB columns, so two workers handling concurrent requests (e.g. a Stripe webhook crediting tokens while `/spin` is spending tokens) can still clobber each other. See `backend/README.md` for the open work on this.

## Folder layout

- `main_screen.jsx` — the page entry point. Owns the daily/hourly/5-minute check-in effects, the auto-save loop, the CPS tick, the keyboard `Cmd/Ctrl+S` shortcut, and the modal-trigger state for slot machine + roulette.
- `main_screen_parts/` — sub-components rendered by `Main_Screen`.
- `gambling/` — the slot machine modal, the roulette modal, and their shared utilities (constants, scroll-face image set, roulette wheel geometry).
- `buildings/` — the purchasable buildings column.
- `api.js` — backend endpoints used by anything in this folder (save, reset, daily/hourly/5min checkins, slot spin, roulette spin).
- `constants.js` — game-loop timings (save interval, CPS tick) and ad rotation. Gambling-specific timings live in `gambling/constants.js`.
- `game_utils.js` — pure helpers (`recalculate_cps`, `increase_cookies`, `buy_building`, `save_game_data`).

## main_screen_parts

- `top_bar.jsx` — the yellow nav strip across the top with all the page-link buttons (Buy Tokens, Gamble, Roulette, Mastery Scrolls, Auction House, Play Chess) plus the Refresh button and Audio_Controls.
- `main_body.jsx` — three-column flex wrapper. Composes the three panels below.
- `cookie_click_panel.jsx` — left panel. Epstein-head clicker, animated counter, particle effects on click.
- `ads_panel.jsx` — middle panel. Rotates clickbait images, shows a tier-gated close-X in a random corner.
- `buildings_panel.jsx` — right panel. Renders one `Building_Row` per available building.
- `main_body_utils.js` — ad-rotation data + helpers (the image glob, the corner-position table, the next-index picker).

## Background timers in `Main_Screen`

Five `useEffect`s run while the player is on this page:

1. **Refs sync** — keeps `game_data_ref` pointing at the latest `game_data`. Lets the CPS tick read fresh state without re-creating the interval each tick.
2. **Auto-save** — `save_game_data()` every minute via `SAVE_INTERVAL_MS`, with a "Game saved!" toast.
3. **Cmd/Ctrl + S** — keyboard shortcut for manual save.
4. **Daily check-in** — fires on mount and on tab visibility regain. Awards daily streak rewards via `/daily_checkin`.
5. **Hourly + 5-min check-ins** — same pattern but via `/hourly_checkin` and `/fivemin_checkin`, with intervals of `HOURLY_CHECKIN_MS` / `FIVEMIN_CHECKIN_MS`.
6. **CPS tick** — every second (`CPS_TICK_MS`), increments `quantity` by `cps`. Reads via `game_data_ref` to avoid re-binding on every state change.

The CPS tick is the only effect that reads through a ref. The reason: re-creating the interval every time `game_data` changes would cause a fraction-of-a-second drift each tick. The ref pattern keeps a stable single interval that always sees current state.

## Modals

Slot machine and roulette are full-screen modals mounted as siblings of the top bar. The triggers (top bar buttons) live in `top_bar.jsx`; `Main_Screen` owns the `show_*` open/close state. Modals self-contain their game logic and dispatch results back via Redux.

See `gambling/` for the modal implementations.
