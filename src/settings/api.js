import { auth_headers, post, get, tracked_fetch } from '../shared/api_client';

export async function api_update_username(username) {
  const headers = await auth_headers();
  const res = await tracked_fetch(`${import.meta.env.VITE_BACKEND_URL}/me/username`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || 'Something went wrong.');
  return data;
}

export async function api_buy_account_tier(tier_id) {
  return post('/buy_account_tier', { tier_id }, await auth_headers());
}

export async function api_get_my_discord() {
  return get('/my_discord', await auth_headers());
}
