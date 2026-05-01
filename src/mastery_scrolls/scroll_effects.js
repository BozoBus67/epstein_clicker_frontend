const DIDDY_BUILDINGS = ['building_2', 'building_3', 'building_4'];

// Each effect: (building_key, building_cps, premium_game_data) => modified building_cps
export const SCROLL_EFFECTS = {
  mastery_scroll_6: (key, cps, pgd) =>
    DIDDY_BUILDINGS.includes(key) && (pgd.mastery_scroll_6 ?? 0) > 0
      ? cps * 2500
      : cps,
};
