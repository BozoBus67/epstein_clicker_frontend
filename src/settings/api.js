import { get_auth, post_auth, patch_auth } from '../shared/api_client';

export const api_update_username = (username) =>
  patch_auth('/me/username', { username });

export const api_buy_account_tier = (tier_id) =>
  post_auth('/buy_account_tier', { tier_id });

export const api_get_my_discord = () =>
  get_auth('/my_discord');

export const api_set_theme = (theme) =>
  patch_auth('/me/theme', { theme });
