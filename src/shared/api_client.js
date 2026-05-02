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

// FastAPI returns 422 validation errors as `detail: [{type, loc, msg, input}, ...]`.
// React-hot-toast and any other JSX consumer that gets handed that array directly
// crashes with "Objects are not valid as a React child (#31)". Normalize the
// array into a human-readable string at the boundary so every downstream call
// site can assume `err.detail` is a string.
function normalize_detail(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map(d => {
        const where = Array.isArray(d?.loc) ? d.loc.join('.') : '';
        const msg = d?.msg ?? 'validation error';
        return where ? `${msg} (${where})` : msg;
      })
      .join('; ');
  }
  // Some backend wraps a single error object instead of an array. Same shape, single entry.
  if (detail && typeof detail === 'object') {
    return detail.msg ?? JSON.stringify(detail);
  }
  return String(detail);
}

// Two paths here, deliberately distinguished — see the README's "Error
// messages and logs" principle.
//
//  - Backend returned a `detail` → it's a deliberate user-readable message
//    about a business rule (e.g. "Buy the previous tier first"). NOT a
//    system error. Display it verbatim, no "Error:" prefix, no HTTP suffix.
//
//  - No `detail` (or network failure) → genuinely unexpected. Prefix with
//    "Error:" so users (and we) can tell something actually went wrong vs.
//    being told no by the backend on purpose. Suffix the HTTP status too —
//    someone fluent in HTTP can immediately tell auth (401), permission
//    (403), server error (5xx) apart without opening DevTools.
export function make_error(res, data) {
  const raw_detail = data?.detail;
  if (raw_detail) {
    const backend_detail = normalize_detail(raw_detail);
    const err = new Error(backend_detail);
    err.detail = backend_detail;
    err.status = res.status;
    err.backend_detail = backend_detail;
    return err;
  }
  const fallback = STATUS_FALLBACK_MESSAGES[res.status] ?? 'Request failed.';
  const detail = `Error: ${fallback} (HTTP ${res.status})`;
  const err = new Error(detail);
  err.detail = detail;
  err.status = res.status;
  err.backend_detail = null;
  return err;
}

function network_error() {
  const err = new Error('Error: Cannot reach server. Check your connection or try again.');
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
