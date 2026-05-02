// Chess bot roster. Derived from SCROLL_REGISTRY: every scroll with a
// non-null `chess_elo` becomes a bot. Currently the only excluded scroll is
// blurry_epstein (Shadow Clone Jutsu) — no character flavor, no chess skin.
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
import { SCROLL_REGISTRY } from '../shared/scroll_registry';
import { SCROLL_FACE_BY_SLUG } from '../shared/scroll_faces';

export const EPSTEIN_BOT_ID = 'epstein';
export const EPSTEIN_BOT_ELO = 3190;  // Stockfish ceiling — final boss, plays at full max.

const regular_bots = SCROLL_REGISTRY
  .filter(s => s.chess_elo !== null)
  .map(s => ({
    id: s.id,
    name: s.display_name,
    face: SCROLL_FACE_BY_SLUG[s.id],
    elo: s.chess_elo,
  }));

export const EPSTEIN_BOT = {
  id: EPSTEIN_BOT_ID,
  name: 'Epstein',
  face: epstein_face,
  elo: EPSTEIN_BOT_ELO,
};

export const BOTS = [...regular_bots, EPSTEIN_BOT];
export const REGULAR_BOT_IDS = regular_bots.map(b => b.id);
