import { store } from '../shared/store';
import {
  increment_game_data_field,
  update_game_data_field,
} from '../shared/store/sessionSlice';
import { api_save_game } from './api';
import { SCROLL_EFFECTS } from '../mastery_scrolls/scroll_effects';

export function recalculate_cps() {
  const { game_data, buildings, premium_game_data } = store.getState().session;
  const pgd = premium_game_data ?? {};
  const cps = Object.entries(game_data.buildings).reduce((total, [key, count]) => {
    let building_cps = (buildings[key]?.cps ?? 0) * count;
    for (const effect of Object.values(SCROLL_EFFECTS)) {
      building_cps = effect(key, building_cps, pgd);
    }
    return total + building_cps;
  }, 0);
  store.dispatch(update_game_data_field({ key: 'cps', value: cps }));
}

export function increase_cookies() {
  const { game_data } = store.getState().session;
  store.dispatch(increment_game_data_field({
    key: 'quantity',
    amount: game_data.cookies_per_click,
  }));
}

export function buy_building(key) {
  const { game_data, buildings } = store.getState().session;
  const cost = buildings[key]?.cost;
  if (game_data.quantity < cost) return;

  store.dispatch(increment_game_data_field({ key: 'quantity', amount: -cost }));
  store.dispatch(update_game_data_field({
    key: 'buildings',
    value: { ...game_data.buildings, [key]: game_data.buildings[key] + 1 },
  }));

  recalculate_cps();
}

// Throws on failure — the caller decides how to surface the error to the user.
// This is intentional: a save fail is something the user must know about,
// because continuing to play after a failed save risks losing progress.
export async function save_game_data() {
  const { game_data } = store.getState().session;
  await api_save_game(JSON.parse(JSON.stringify(game_data)));
}
