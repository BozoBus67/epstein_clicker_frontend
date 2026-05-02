// Single source of truth for mastery-scroll mechanics.
//
// Each scroll has a stable slug `id` (lowercase, snake_cased, never reused
// once shipped). The slug equals the image-asset filename basename in
// `assets/master_scroll_faces/` — that's how scroll_faces.js wires images.
//
// User-facing strings (display_name, description) live in `constants.js`
// so the whole "swappable text layer" lives in one place — see the comment
// at the top of that file. This file owns mechanics only: the slug list
// and chess metadata.
//
// Adding a scroll = (1) drop the image into master_scroll_faces, (2) add
// one entry here, (3) add display_name + description in constants.js,
// (4) add the slug to backend/data/scrolls.py + premium_game_data.py.
// Reordering this array changes nothing in the database — the slug is
// the only stable identity.
//
// `chess_elo: null` excludes the scroll from the chess bot roster (currently
// just blurry_epstein / Shadow Clone Jutsu, which has no character flavor).
// Displayed ELOs below 1320 are cosmetic only — Stockfish silently clamps
// to its UCI_LimitStrength floor of 1320. See chess/README.md.

import { SCROLL_DESCRIPTIONS, SCROLL_DISPLAY_NAMES } from './constants';

const SCROLL_MECHANICS = [
  { id: '6_7_kid',             chess_elo: 400  },
  { id: 'adolf_hitler',        chess_elo: 1250 },
  { id: 'blurry_epstein',      chess_elo: null },
  { id: 'caseoh',              chess_elo: 600  },
  { id: 'charlie_kirk',        chess_elo: 1200 },
  { id: 'dexter',              chess_elo: 2000 },
  { id: 'diddy',               chess_elo: 900  },
  { id: 'doakes',              chess_elo: 1700 },
  { id: 'donald_trump',        chess_elo: 1100 },
  { id: 'drake',               chess_elo: 1300 },
  { id: 'elon_musk',           chess_elo: 2400 },
  { id: 'freddy_fazbear',      chess_elo: 800  },
  { id: 'george_floyd',        chess_elo: 700  },
  { id: 'hillary_clinton',     chess_elo: 1900 },
  { id: 'ishowspeed',          chess_elo: 500  },
  { id: 'kai_cenat',           chess_elo: 1000 },
  { id: 'khaby_lame',          chess_elo: 1100 },
  { id: 'mark_zuckerberg',     chess_elo: 2500 },
  { id: 'mr_beast',            chess_elo: 1600 },
  { id: 'ninja_from_fortnite', chess_elo: 1400 },
  { id: 'roy_lee',             chess_elo: 1800 },
  { id: 'state_trooper_cop',   chess_elo: 1500 },
  { id: 'stephen_hawking',     chess_elo: 3050 },
  { id: 'tung_tung_tung_sahur', chess_elo: 300 },
  { id: 'walter_white',        chess_elo: 2800 },
];

export const SCROLL_REGISTRY = SCROLL_MECHANICS.map(s => ({
  id: s.id,
  chess_elo: s.chess_elo,
  display_name: SCROLL_DISPLAY_NAMES[s.id],
  description: SCROLL_DESCRIPTIONS[s.id],
}));

export const SCROLL_BY_ID = Object.fromEntries(SCROLL_REGISTRY.map(s => [s.id, s]));
export const SCROLL_IDS = SCROLL_REGISTRY.map(s => s.id);
