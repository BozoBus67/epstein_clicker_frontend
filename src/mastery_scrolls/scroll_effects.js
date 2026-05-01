// Stages 2 and 3 of the CPS pipeline (stage 1 — raw per-building cps from
// count × base — lives in game_utils.js::recalculate_cps).
//
//   Stage 2 (apply_building_buffs):    [{key, count, cps}] → [{key, count, cps}]
//   Stage 3 (apply_global_modifiers):  number → number
//
// Each stage uses straight if-blocks per scroll rather than a generic effects
// map — buffs aren't uniform enough to abstract (Diddy multiplies a subset of
// buildings, Shadow Clone Jutsu multiplies global cps, future scrolls might
// add flat amounts, change cookies-per-click, etc.). Just add a new branch
// in the right stage as each scroll lands.

const DIDDY_BUILDINGS = ['building_2', 'building_3', 'building_4'];

// Stage 2: take the raw per-building cps entries and return a new array with
// per-building scroll buffs applied. Doesn't sum — that happens in stage 3.
export function apply_building_buffs(entries, pgd) {
  return entries.map(entry => {
    let cps = entry.cps;

    // mastery_scroll_6 — Diddy: ×2500 on Diddy-themed buildings (2, 3, 4)
    if ((pgd.mastery_scroll_6 ?? 0) > 0 && DIDDY_BUILDINGS.includes(entry.key)) {
      cps *= 2500;
    }

    return { ...entry, cps };
  });
}

// Stage 3: take the total cps and apply global multipliers / additive bonuses
// that affect ALL cps regardless of building.
export function apply_global_modifiers(total_cps, pgd) {
  let cps = total_cps;

  // mastery_scroll_2 — Shadow Clone Jutsu: ×1000 over total cps
  if ((pgd.mastery_scroll_2 ?? 0) > 0) {
    cps *= 1000;
  }

  return cps;
}
