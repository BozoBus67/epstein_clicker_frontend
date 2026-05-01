# Game

The main clicker screen and everything that runs on it: the cookie click loop, the rotating ad panel, building purchases, the slot machine and roulette modals, and the assorted background timers (auto-save, daily/hourly/5-minute check-ins, CPS tick).

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
