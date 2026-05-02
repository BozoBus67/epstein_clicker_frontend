// Single source of truth for mastery scrolls.
//
// Each scroll has a stable slug `id` (lowercase, snake_cased, never reused once
// shipped). The slug equals the image-asset filename basename in
// `assets/master_scroll_faces/` — that's how scroll_faces.js wires images.
//
// Adding a scroll = (1) drop the image into master_scroll_faces, (2) add one
// entry to this array, (3) add the slug to backend/data/scrolls.py +
// backend/data/premium_game_data.py. No positional shifts, no migrations.
// Reordering this array, renaming display_name, or rewriting description
// changes nothing in the database — the slug is the only stable identity.
//
// `chess_elo: null` excludes the scroll from the chess bot roster (currently
// just blurry_epstein / Shadow Clone Jutsu, which has no character flavor).
// Displayed ELOs below 1320 are cosmetic only — Stockfish silently clamps
// to its UCI_LimitStrength floor of 1320. See chess/README.md.

import { QUANTITY_NAME } from './constants';

export const SCROLL_REGISTRY = [
  { id: '6_7_kid',             display_name: '6/7 Kid',            description: 'Not yet implemented',                                                              chess_elo: 400  },
  { id: 'adolf_hitler',        display_name: 'Adolf Hitler',       description: 'Not yet implemented',                                                              chess_elo: 1250 },
  { id: 'blurry_epstein',      display_name: 'Shadow Clone Jutsu', description: `${QUANTITY_NAME} per second multiplied by 1000`,                                   chess_elo: null },
  { id: 'caseoh',              display_name: 'CaseOh',             description: 'Not yet implemented',                                                              chess_elo: 600  },
  { id: 'charlie_kirk',        display_name: 'Charlie Kirk',       description: 'Unlocks Kirk Mode (toggle in settings) — kirkifies all clickbait ads',             chess_elo: 1200 },
  { id: 'dexter',              display_name: 'Dexter',             description: 'Not yet implemented',                                                              chess_elo: 2000 },
  { id: 'diddy',               display_name: 'Diddy',              description: 'Diddy Factory, Baby Oil Factory, and Mega Diddy Factory production ×2500',         chess_elo: 900  },
  { id: 'doakes',              display_name: 'Doakes',             description: 'Not yet implemented',                                                              chess_elo: 1700 },
  { id: 'donald_trump',        display_name: 'Donald Trump',       description: 'Not yet implemented',                                                              chess_elo: 1100 },
  { id: 'drake',               display_name: 'Drake',              description: 'Not yet implemented',                                                              chess_elo: 1300 },
  { id: 'elon_musk',           display_name: 'Elon Musk',          description: 'Not yet implemented',                                                              chess_elo: 2400 },
  { id: 'freddy_fazbear',      display_name: 'Freddy Fazbear',     description: 'Not yet implemented',                                                              chess_elo: 800  },
  { id: 'george_floyd',        display_name: 'George Floyd',       description: 'Unlocks dark mode',                                                                chess_elo: 700  },
  { id: 'hillary_clinton',     display_name: 'Hillary Clinton',    description: 'Not yet implemented',                                                              chess_elo: 1900 },
  { id: 'ishowspeed',          display_name: 'iShowSpeed',         description: 'Not yet implemented',                                                              chess_elo: 500  },
  { id: 'kai_cenat',           display_name: 'Kai Cenat',          description: 'Not yet implemented',                                                              chess_elo: 1000 },
  { id: 'khaby_lame',          display_name: 'Khaby Lame',         description: 'Not yet implemented',                                                              chess_elo: 1100 },
  { id: 'mark_zuckerberg',     display_name: 'Mark Zuckerberg',    description: 'Not yet implemented',                                                              chess_elo: 2500 },
  { id: 'mr_beast',            display_name: 'MrBeast',            description: 'Not yet implemented',                                                              chess_elo: 1600 },
  { id: 'ninja_from_fortnite', display_name: 'Ninja',              description: 'Not yet implemented',                                                              chess_elo: 1400 },
  { id: 'roy_lee',             display_name: 'Roy Lee',            description: 'Not yet implemented',                                                              chess_elo: 1800 },
  { id: 'state_trooper_cop',   display_name: 'State Trooper',      description: 'Unlocks light mode',                                                               chess_elo: 1500 },
  { id: 'stephen_hawking',     display_name: 'Stephen Hawking',    description: 'Not yet implemented',                                                              chess_elo: 3050 },
  { id: 'tun_tun_tun_sahur',   display_name: 'Tun Tun Tun Sahur',  description: 'Not yet implemented',                                                              chess_elo: 300  },
  { id: 'walter_white',        display_name: 'Walter White',       description: 'Not yet implemented',                                                              chess_elo: 2800 },
];

export const SCROLL_BY_ID = Object.fromEntries(SCROLL_REGISTRY.map(s => [s.id, s]));
export const SCROLL_IDS = SCROLL_REGISTRY.map(s => s.id);
