import { post, auth_headers } from '../shared/api_client';

export const api_save_game = async (game_data) =>
  post('/save_game_data', { game_data }, await auth_headers());

export const api_reset_game = async () =>
  post('/reset_game_data', null, await auth_headers());

export const api_daily_checkin = async () =>
  post('/daily_checkin', null, await auth_headers());

export const api_spin = async () =>
  post('/spin', null, await auth_headers());
