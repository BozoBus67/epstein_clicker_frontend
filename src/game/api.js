import { post_auth } from '../shared/api_client';

export const api_save_game = (game_data) =>
  post_auth('/save_game_data', { game_data });

export const api_reset_game = () =>
  post_auth('/reset_game_data', null);

export const api_daily_checkin = () =>
  post_auth('/daily_checkin', null);

export const api_hourly_checkin = () =>
  post_auth('/hourly_checkin', null);

export const api_fivemin_checkin = () =>
  post_auth('/fivemin_checkin', null);

export const api_spin = () =>
  post_auth('/spin', null);

export const api_roulette_spin = () =>
  post_auth('/roulette_spin', null);
