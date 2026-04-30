import { supabase } from './supabase_client';

const base = () => import.meta.env.VITE_BACKEND_URL;

export async function auth_headers() {
  const { data: { session } } = await supabase.auth.getSession();
  return { 'Authorization': `Bearer ${session?.access_token}` };
}

export function make_error(res, data) {
  const err = new Error(data?.detail || 'Something went wrong.');
  err.detail = data?.detail;
  err.status = res.status;
  return err;
}

export async function get(path, headers = {}) {
  const res = await fetch(`${base()}${path}`, { headers });
  const data = await res.json();
  if (!res.ok) throw make_error(res, data);
  return data;
}

export async function post(path, body, headers = {}) {
  const res = await fetch(`${base()}${path}`, {
    method: 'POST',
    headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw make_error(res, data);
  return data;
}
