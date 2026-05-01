import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import Auth_Shell from './app_structure/auth_shell';
import Game_Shell from './app_structure/game_shell';
import { api_me } from './auth';
import { init_yt_player, load_playlist } from './music/audio_state';
import { get, post_auth } from './shared/api_client';
import { Error_Boundary, Loading_Screen } from './shared/components';
import { login, set_account_tiers, set_buildings, set_scrolls } from './shared/store/sessionSlice';
import { supabase } from './shared/supabase_client';
import { useTheme } from './shared/theme';
import { notify_migration } from './shared/utils';

const ACTIVE_PING_INTERVAL_MS = 60_000;

export default function App() {
  const dispatch = useDispatch();
  const is_logged_in = useSelector(state => state.session.is_logged_in);
  use_active_ping(is_logged_in);
  const [checking_session, set_checking_session] = useState(true);

  useEffect(() => {
    restore_session(dispatch).finally(() => set_checking_session(false));
    // Fire-and-forget: builds the persistent YT.Player iframe under <body>.
    // Lives independently of any screen so audio survives navigation.
    init_yt_player();
  }, []);

  if (checking_session) return <Loading_Screen />;

  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Themed_Toaster />
      <Error_Boundary>
        {is_logged_in ? <Game_Shell /> : <Auth_Shell />}
      </Error_Boundary>
    </HashRouter>
  );
}

// Pings /active_ping once a minute while the user is logged in AND the window
// is BOTH visible and focused. Counting these in PostHog × the interval gives
// us total active time per user.
//
// Two gates, not one: visibilityState catches background tabs / minimized
// windows; document.hasFocus() catches the "user alt-tabbed to another app"
// case where the tab is still technically visible but the window isn't the
// foreground one. Skipping either keeps the metric honest.
//
// Errors are swallowed deliberately: the ping fires every 60s, so a transient
// network blip would otherwise spam the user with toasts. This is a deliberate
// exception to fail-loud — analogous to backend/services/analytics.py, where
// PostHog capture() is also silent on failure. Same trade-off, same reason.
// If we adopt Sentry (or similar) later, route ping failures there so we
// catch systemic outages without bothering the user.
function use_active_ping(is_logged_in) {
  useEffect(() => {
    if (!is_logged_in) return;
    let cancelled = false;
    const is_active = () => document.visibilityState === 'visible' && document.hasFocus();
    const ping = () => {
      if (cancelled) return;
      if (!is_active()) return;
      post_auth('/active_ping').catch(() => {});
    };
    ping();
    const id = setInterval(ping, ACTIVE_PING_INTERVAL_MS);
    // Fire immediately when the window becomes active again (e.g. user alt-tabs
    // back), so we don't lose up to 60s of activity to interval drift.
    const on_regain = () => { if (is_active()) ping(); };
    document.addEventListener('visibilitychange', on_regain);
    window.addEventListener('focus', on_regain);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', on_regain);
      window.removeEventListener('focus', on_regain);
    };
  }, [is_logged_in]);
}

// The global toast rendering host. One mount, persists across navigation.
// Themed so toasts match the active light/dark palette. See react-hot-toast
// docs for what `toastOptions` accepts.
function Themed_Toaster() {
  const theme = useTheme();
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: theme.panel,
          color: theme.text,
          border: `1px solid ${theme.panel_border}`,
        },
      }}
    />
  );
}

// Bootstrap the app's Redux state on mount: fetch the metadata that the
// frontend needs in memory regardless of auth (account tiers, building defs,
// scroll defs), then attempt to restore the user's session via /me. Silent
// failure on /me means we sign the user out — they'll see the auth shell.
async function restore_session(dispatch) {
  const [{ data: { session } }, account_tiers, buildings, scrolls] = await Promise.all([
    supabase.auth.getSession(),
    get('/account_tiers'),
    get('/get_building_metadata'),
    get('/get_scroll_metadata'),
    load_playlist(),
  ]);
  dispatch(set_account_tiers(account_tiers));
  dispatch(set_buildings(buildings));
  dispatch(set_scrolls(scrolls));
  if (!session) return;
  try {
    const data = await api_me();
    dispatch(login({ user: data.user }));
    notify_migration(data.migration_info);
  } catch {
    // Local-scope so we don't make a doomed /logout call. See auth/README.md.
    await supabase.auth.signOut({ scope: 'local' });
  }
}
