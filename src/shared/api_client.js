// Frontend network layer. All authenticated backend calls go through the *_auth
// helpers below (get_auth, post_auth, patch_auth). Each feature folder has its
// own api.js that imports from here and exports named functions for that
// feature's endpoints — see e.g. auction_house/api.js.
//
// Cross-cutting concerns handled here, not at call sites:
//   • Auth: Supabase JWT is fetched fresh from the client on every request.
//   • Slow-request UX: any call >2.5s shows a "Waiting for backend..." toast.
//   • Errors: non-2xx responses become thrown Errors with .detail / .status.
//   • Network failures: thrown as a generic "Cannot reach server" Error.
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

// Default human-friendly messages for each status code, used only when the
// backend response has no `detail` field. Backend-provided detail always wins.
// Add cases here as we encounter status codes that surface to users without a
// useful backend message.
const STATUS_FALLBACK_MESSAGES = {
  400: 'Bad request — the data we sent was rejected.',
  401: 'Authentication failed — please log in again.',
  403: "You don't have permission to do this.",
  404: 'Resource not found.',
  408: 'Request timed out — try again.',
  409: 'Conflict — the action collided with current state.',
  422: 'The data we sent failed validation.',
  429: 'Too many requests — slow down and try again in a minute.',
  500: 'Server error — try again in a moment.',
  502: 'Server is waking up — try again in a moment.',
  503: 'Server is waking up — try again in a moment.',
  504: 'Server is waking up — try again in a moment.',
};

export function make_error(res, data) {
  const backend_detail = data?.detail;
  const fallback = STATUS_FALLBACK_MESSAGES[res.status] ?? 'Request failed.';
  const message = backend_detail || fallback;
  // Suffix the HTTP status so it's visible in any toast or error display —
  // someone fluent in HTTP can immediately tell auth (401), permission (403),
  // server error (5xx), etc. apart without opening DevTools.
  const detail = `${message} (HTTP ${res.status})`;
  const err = new Error(detail);
  err.detail = detail;
  err.status = res.status;
  err.backend_detail = backend_detail ?? null;  // raw backend message without the suffix, for tests/logging
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

// Retries are applied to GETs only — they're idempotent so re-sending is safe.
// POST/PATCH could double-charge tokens, double-create listings, etc., so they
// are NEVER retried. Caller has to retry explicitly via UI.
const RETRY_DELAY_MS = 1000;

async function with_retry(fn) {
  try {
    return await fn();
  } catch (e) {
    // Retry once on network failure or 5xx (server transient errors). 4xx
    // means "you sent something wrong" and won't get better with a retry.
    const should_retry = !e.status || e.status >= 500;
    if (!should_retry) throw e;
    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    return await fn();
  }
}

export async function get(path, headers = {}) {
  return with_retry(async () => {
    let res;
    try { res = await tracked_fetch(`${base()}${path}`, { headers }); }
    catch { throw network_error(); }
    const data = await safe_json(res);
    if (!res.ok) throw make_error(res, data);
    return data;
  });
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

export async function patch(path, body, headers = {}) {
  let res;
  try {
    res = await tracked_fetch(`${base()}${path}`, {
      method: 'PATCH',
      headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { throw network_error(); }
  const data = await safe_json(res);
  if (!res.ok) throw make_error(res, data);
  return data;
}

export async function get_auth(path) {
  return get(path, await auth_headers());
}

export async function post_auth(path, body) {
  return post(path, body, await auth_headers());
}

export async function patch_auth(path, body) {
  return patch(path, body, await auth_headers());
}
