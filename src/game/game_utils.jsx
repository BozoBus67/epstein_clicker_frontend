import { store } from '../shared/store';
import { update_game_data } from '../shared/store/sessionSlice';
import { api_save_game } from './api';

export function recalculate_cps() {
  const { game_data, buildings } = store.getState().session;
  const cps = Object.entries(game_data.buildings).reduce((total, [key, count]) => {
    return total + (buildings[key]?.cps ?? 0) * count;
  }, 0);
  store.dispatch(update_game_data({ ...game_data, cps }));
}

export function increase_cookies() {
  const game_data = store.getState().session.game_data;
  store.dispatch(update_game_data({
    ...game_data,
    quantity: game_data.quantity + game_data.cookies_per_click,
  }));
}

export function buy_building(key) {
  const { game_data, buildings } = store.getState().session;
  const cost = buildings[key]?.cost;
  if (game_data.quantity < cost) return;

  store.dispatch(update_game_data({
    ...game_data,
    quantity: game_data.quantity - cost,
    buildings: {
      ...game_data.buildings,
      [key]: game_data.buildings[key] + 1,
    },
  }));

  recalculate_cps();
}

export async function save_game_data() {
  const { game_data } = store.getState().session;
  try {
    await api_save_game(JSON.parse(JSON.stringify(game_data)));
  } catch (e) { console.error('Save error:', e); }
}
