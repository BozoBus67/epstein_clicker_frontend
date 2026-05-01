// Chess bot roster. Each mastery scroll character (except the excluded ones
// that don't have a thematic chess-skill flavor) becomes a bot.
//
// IMPORTANT: the ELO numbers below are partly LIES. Stockfish's
// UCI_LimitStrength only supports 1320–3190; anything below 1320 is silently
// clamped to 1320. So every bot displayed below 1320 actually plays at 1320
// — we keep the lower numbers because they fit the character (a "6/7 Kid"
// labeled 1320 would be weird) and because the discovery that "the easy bots
// are all secretly the same" is funnier than fixing it.
//
// The map below documents the lie so a developer reading this isn't confused.
// To rebalance the bots that ACTUALLY differ in strength, edit values >= 1320.
//
// Displayed ELO  →  Actual Stockfish ELO
//   < 1320       →  1320  (clamped)
//   1320–3190    →  same  (Stockfish's native range)
//   > 3190       →  3190  (clamped, only Epstein hits this — by design)

import { SCROLL_NAMES } from '../shared/constants';
import epstein_face from '../assets/game_screen/epstein.png';

const face_modules = import.meta.glob('../assets/master_scroll_faces/*', { eager: true });
const FACES = Object.keys(face_modules).sort().map(k => face_modules[k].default);

// Scrolls that don't get a corresponding chess bot.
const EXCLUDED_SCROLL_IDS = new Set(['mastery_scroll_3']);

// Per-character displayed ELO. See top-of-file comment for the lie about sub-1320.
const BOT_ELOS = {
  mastery_scroll_24: 300,   // Tun Tun Tun Sahur     (actual: 1320)
  mastery_scroll_1:  400,   // 6/7 Kid               (actual: 1320)
  mastery_scroll_15: 500,   // iShowSpeed            (actual: 1320)
  mastery_scroll_4:  600,   // CaseOh                (actual: 1320)
  mastery_scroll_13: 700,   // George Floyd          (actual: 1320)
  mastery_scroll_12: 800,   // Freddy Fazbear        (actual: 1320)
  mastery_scroll_7:  900,   // Diddy                 (actual: 1320)
  mastery_scroll_16: 1000,  // Kai Cenat             (actual: 1320)
  mastery_scroll_9:  1100,  // Donald Trump          (actual: 1320)
  mastery_scroll_17: 1100,  // Khaby Lame            (actual: 1320)
  mastery_scroll_5:  1200,  // Charlie Kirk          (actual: 1320)
  mastery_scroll_2:  1250,  // Adolf Hitler          (actual: 1320)
  mastery_scroll_10: 1300,  // Drake                 (actual: 1320)
  mastery_scroll_20: 1400,  // Ninja                 (actual: 1400)
  mastery_scroll_22: 1500,  // State Trooper         (actual: 1500)
  mastery_scroll_19: 1600,  // MrBeast               (actual: 1600)
  mastery_scroll_8:  1700,  // Doakes                (actual: 1700)
  mastery_scroll_21: 1800,  // Roy Lee               (actual: 1800)
  mastery_scroll_14: 1900,  // Hillary Clinton       (actual: 1900)
  mastery_scroll_6:  2000,  // Dexter                (actual: 2000)
  mastery_scroll_11: 2400,  // Elon Musk             (actual: 2400)
  mastery_scroll_18: 2500,  // Mark Zuckerberg       (actual: 2500)
  mastery_scroll_25: 2800,  // Walter White          (actual: 2800)
  mastery_scroll_23: 3050,  // Stephen Hawking       (actual: 3050)
};

export const EPSTEIN_BOT_ID = 'epstein';
export const EPSTEIN_BOT_ELO = 3190;  // Stockfish ceiling — final boss, plays at full max.

const ALL_SCROLL_IDS = Object.keys(SCROLL_NAMES);
const regular_bots = ALL_SCROLL_IDS
  .filter(id => !EXCLUDED_SCROLL_IDS.has(id))
  .map(id => ({
    id,
    name: SCROLL_NAMES[id],
    face: FACES[ALL_SCROLL_IDS.indexOf(id)],
    elo: BOT_ELOS[id],
  }));

export const EPSTEIN_BOT = {
  id: EPSTEIN_BOT_ID,
  name: 'Epstein',
  face: epstein_face,
  elo: EPSTEIN_BOT_ELO,
};

export const BOTS = [...regular_bots, EPSTEIN_BOT];
export const REGULAR_BOT_IDS = regular_bots.map(b => b.id);
