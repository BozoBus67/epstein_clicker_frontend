// Chess bot roster. Derived from SCROLL_REGISTRY: every scroll with a
// non-null `chess_elo` becomes a bot. Currently the only excluded scroll is
// blurry_epstein (Shadow Clone Jutsu), which has no character flavor and
// gets `chess_elo: null`. To add or exclude a bot, edit the registry.
//
// Faces are looked up at render time via `useBotFace(bot_id)` so they pick
// up Kirk Mode automatically, and so the Epstein face (a non-scroll asset)
// fits the same API as the regular bots.
//
// IMPORTANT: the ELO numbers in scroll_registry.js are partly LIES. Stockfish's
// UCI_LimitStrength only supports 1320–3190; anything below 1320 is silently
// clamped to 1320. So every bot displayed below 1320 actually plays at 1320.
// The lower numbers are kept because they fit the character (a "6/7 Kid"
// labeled 1320 would read weirdly) and because the discovery that "the easy
// bots are all secretly the same" is funnier than fixing it.
//
// Displayed ELO  →  Actual Stockfish ELO
//   < 1320       →  1320  (clamped)
//   1320–3190    →  same  (Stockfish's native range)
//   > 3190       →  3190  (clamped, only Epstein hits this — by design)

import epstein_face from '../assets/game_screen/epstein.png';
import { useKirkifiedFace } from '../shared/kirkified_faces';
import { SCROLL_FACE_PAIRS } from '../shared/scroll_faces';
import { SCROLL_REGISTRY } from '../shared/scroll_registry';

export const EPSTEIN_BOT_ID = 'epstein';
export const EPSTEIN_BOT_ELO = 3190;  // Stockfish ceiling — final boss, plays at full max.

const regular_bots = SCROLL_REGISTRY
  .filter(s => s.chess_elo !== null)
  .map(s => ({
    id: s.id,
    name: s.display_name,
    elo: s.chess_elo,
  }));

export const EPSTEIN_BOT = {
  id: EPSTEIN_BOT_ID,
  name: 'Epstein',
  elo: EPSTEIN_BOT_ELO,
};

export const BOTS = [...regular_bots, EPSTEIN_BOT];
export const REGULAR_BOT_IDS = regular_bots.map(b => b.id);

// Face lookup hook. Branches on the Epstein boss (static import) but otherwise
// routes through the shared Kirk-Mode-aware scroll-face helper. Returns the
// same shape as `useKirkifiedFace` so callers can show the missing-kirkified
// note if they want to (chess screens currently choose silent fallback).
export function useBotFace(bot_id) {
  const pair = bot_id === EPSTEIN_BOT_ID ? null : SCROLL_FACE_PAIRS[bot_id];
  const kirkified = useKirkifiedFace(pair);
  if (bot_id === EPSTEIN_BOT_ID) return { url: epstein_face, missing_kirkified: false };
  return kirkified;
}
