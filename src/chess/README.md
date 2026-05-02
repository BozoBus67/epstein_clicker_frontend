> AI-generated, proofread and edited (by human).

# Chess

Single-player chess against a roster of themed bots, all running in-browser via Stockfish.

## Components

Defined across `chess_screen.jsx` and `chess_game_screen.jsx`, in render order:

- `Chess_Screen` — bot-select page. Shows the roster as cards; tracks which have been beaten. Final boss (Epstein) is locked until every regular bot is beaten.
- `Chess_Screen_Body` — listings grid wrapper.
- `Bot_Card` — one card per bot. Composes the two presentational sub-components below.
- `Bot_Card_Image` — the face image area at the top of a card, with a lock overlay when the bot is gated.
- `Bot_Card_Footer` — the text area below the image (name, ELO, "✓ Beaten" indicator).
- `Chess_Game_Screen` — the actual play screen. Owns the game's `Chess` instance, the `Engine` instance, and the game-state machine (turn, outcome, thinking).
- `Bot_Header` — opponent face + name + ELO + status line ("thinking…", "you won!", etc.).
- `Outcome_Banner` — appears below the board when the game ends. Shows result and a Play Again button.

## How the chess engine works

`engine.js` wraps **Stockfish 18 lite-single** (a WebAssembly build) in a Web Worker. Communication is over the UCI protocol (Universal Chess Interface) — Stockfish reads and writes plain text commands like `go movetime 800` and emits replies like `bestmove e2e4`.

Lifecycle in a typical game:

1. `Chess_Game_Screen` mounts → constructs `new Engine()` → spawns the worker.
2. `engine.init(bot.elo)` runs the UCI handshake (`uci` → `uciok`), enables `UCI_LimitStrength`, sets `UCI_Elo`, and waits for `readyok`.
3. User makes a move → `engine.best_move(fen)` is called → engine returns a UCI move string like `e7e5` (or `e7e8q` for promotion).
4. Component unmounts → `engine.terminate()` kills the worker.

The component holds the running engine in `engine_ref` and the init promise in `init_promise_ref` so subsequent calls to `best_move` wait for init even if the user moves before init completes.

## ELO ranges — note the lie

Stockfish's `UCI_LimitStrength` only supports ELOs from **1320 to 3190**. Asking for a 400-ELO bot doesn't actually weaken Stockfish — it gets clamped to 1320 and you fight a real chess engine.

We **intentionally** lie about the displayed ELO for bots below 1320. The "6/7 Kid" displayed at 400 ELO actually plays at 1320, same as Drake displayed at 1300. Every bot in the 300–1300 displayed range is, mechanically, the same engine. We keep it this way because:

- The character names fit better with low numbers ("CaseOh, ELO 1320" reads weirdly).
- The discovery that all the early bots are secretly the same is funnier than a fix.

Each scroll's `chess_elo` field in `shared/scroll_registry.js` is the displayed ELO. To rebalance bots that genuinely differ in strength, edit values in the **1320–3190** range. Below 1320 is purely cosmetic — you can change those numbers, but the gameplay stays identical.

ELO bands at a glance:

- **300–1300 (displayed)** → 1320 actual. Cosmetic difference only.
- **1320–3190** → Stockfish at honest UCI strength. Each step matters.
- **3190** → Stockfish ceiling. Reserved for Epstein, the final boss.

## Bot roster

Bots are derived from `shared/scroll_registry.js` — every scroll with a non-null `chess_elo` becomes a bot. Currently the only excluded scroll is `blurry_epstein` (display name "Shadow Clone Jutsu"), which has no character flavor and gets `chess_elo: null`. To add or exclude a bot, edit the registry, not `chess/constants.js`.

Each bot's face image is looked up by slug via `SCROLL_FACE_BY_SLUG[scroll.id]` — the slug equals the image filename basename in `assets/master_scroll_faces/`.

Epstein is a special hardcoded extra bot — locked until every regular bot is beaten, then becomes the final boss at the Stockfish ceiling.

## Beat tracking

Beaten bots are stored **per-account** in `premium_game_data.chess_beaten_bots` (an array of bot IDs). Progress syncs across devices and persists across browsers.

When a player checkmates the engine, the frontend `POST /chess/mark_bot_beaten` with the bot's `id`. The backend appends to the array (idempotent — re-beating an already-beaten bot is a no-op) and returns the updated list. The frontend dispatches the new list into Redux. The bot-select screen reads the list directly from Redux state.

The endpoint validates that `bot_id` is a real scroll slug or the special `"epstein"` boss before writing — junk IDs get a 400.
