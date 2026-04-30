import { SCROLL_NAMES } from '../shared/constants';

const face_modules = import.meta.glob('../assets/master_scroll_faces/*', { eager: true });
const FACES = Object.keys(face_modules).sort().map(k => face_modules[k].default);

// Rough thematic ELOs — easy to tweak per-character
const BOT_ELOS = {
  mastery_scroll_1:  400,   // 6/7 Kid
  mastery_scroll_2:  1500,  // Shadow Clone Jutsu
  mastery_scroll_3:  600,   // CaseOh
  mastery_scroll_4:  1200,  // Charlie Kirk
  mastery_scroll_5:  2000,  // Dexter
  mastery_scroll_6:  900,   // Diddy
  mastery_scroll_7:  1700,  // Doakes
  mastery_scroll_8:  1100,  // Donald Trump
  mastery_scroll_9:  1300,  // Drake
  mastery_scroll_10: 2400,  // Elon Musk
  mastery_scroll_11: 800,   // Freddy Fazbear
  mastery_scroll_12: 700,   // George Floyd
  mastery_scroll_13: 1900,  // Hillary Clinton
  mastery_scroll_14: 500,   // iShowSpeed
  mastery_scroll_15: 1000,  // Kai Cenat
  mastery_scroll_16: 1100,  // Khaby Lame
  mastery_scroll_17: 2500,  // Mark Zuckerberg
  mastery_scroll_18: 1600,  // MrBeast
  mastery_scroll_19: 1400,  // Ninja
  mastery_scroll_20: 1800,  // Roy Lee
  mastery_scroll_21: 1500,  // State Trooper
  mastery_scroll_22: 3200,  // Stephen Hawking
  mastery_scroll_23: 300,   // Tun Tun Tun Sahur
  mastery_scroll_24: 2800,  // Walter White
};

export const BOTS = Object.entries(SCROLL_NAMES).map(([id, name], i) => ({
  scroll_id: id,
  name,
  face: FACES[i],
  elo: BOT_ELOS[id],
}));
