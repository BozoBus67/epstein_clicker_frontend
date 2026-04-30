import toast from 'react-hot-toast';
import { supabase } from './supabase_client';

const base = () => import.meta.env.VITE_BACKEND_URL;
const SLOW_THRESHOLD_MS = 2500;
const SLOW_TOAST_ID = 'backend-slow';

let slow_count = 0;

function show_slow_toast() {
  if (slow_count === 0) toast.loading('Waiting for backend...', { id: SLOW_TOAST_ID });
  slow_count++;
}

function hide_slow_toast() {
  slow_count--;
  if (slow_count <= 0) {
    slow_count = 0;
    toast.dismiss(SLOW_TOAST_ID);
  }
}

export async function tracked_fetch(url, options) {
  let registered = false;
  const timer = setTimeout(() => { show_slow_toast(); registered = true; }, SLOW_THRESHOLD_MS);
  try {
    return await fetch(url, options);
  } finally {
    clearTimeout(timer);
    if (registered) hide_slow_toast();
  }
}

export async function auth_headers() {
  const { data: { session } } = await supabase.auth.getSession();
  return { 'Authorization': `Bearer ${session?.access_token}` };
}

export function make_error(res, data) {
  let detail = data?.detail;
  if (!detail) {
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      detail = 'Server is waking up — try again in a moment.';
    } else {
      detail = `Request failed (${res.status})`;
    }
  }
  const err = new Error(detail);
  err.detail = detail;
  err.status = res.status;
  return err;
}

function network_error() {
  const err = new Error('Cannot reach server. Check your connection or try again.');
  err.detail = err.message;
  return err;
}

async function safe_json(res) {
  try { return await res.json(); }
  catch { return null; }
}

export async function get(path, headers = {}) {
  let res;
  try { res = await tracked_fetch(`${base()}${path}`, { headers }); }
  catch { throw network_error(); }
  const data = await safe_json(res);
  if (!res.ok) throw make_error(res, data);
  return data;
}

export async function post(path, body, headers = {}) {
  let res;
  try {
    res = await tracked_fetch(`${base()}${path}`, {
      method: 'POST',
      headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { throw network_error(); }
  const data = await safe_json(res);
  if (!res.ok) throw make_error(res, data);
  return data;
}
