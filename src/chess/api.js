import { post_auth } from '../shared/api_client';

export const api_mark_chess_bot_beaten = (bot_id) =>
  post_auth('/chess/mark_bot_beaten', { bot_id });
