import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import Auth_Shell from './app_structure/auth_shell';
import Game_Shell from './app_structure/game_shell';
import { api_me } from './auth';
import { init_yt_player, load_playlist } from './music/audio_state';
import { get } from './shared/api_client';
import { Error_Boundary, Loading_Screen } from './shared/components';
import { login, set_account_tiers, set_buildings, set_scrolls } from './shared/store/sessionSlice';
import { supabase } from './shared/supabase_client';
import { useTheme } from './shared/theme';
import { notify_migration } from './shared/utils';

export default function App() {
  const dispatch = useDispatch();
  const is_logged_in = useSelector(state => state.session.is_logged_in);
  const [checking_session, set_checking_session] = useState(true);

  useEffect(() => {
    restore_session(dispatch).finally(() => set_checking_session(false));
    // Fire-and-forget: builds the persistent YT.Player iframe under <body>.
    // Lives independently of any screen so audio survives navigation.
    init_yt_player();
  }, []);

  if (checking_session) return <Loading_Screen />;

  return (
    <HashRouter>
      <Themed_Toaster />
      <Error_Boundary>
        {is_logged_in ? <Game_Shell /> : <Auth_Shell />}
      </Error_Boundary>
    </HashRouter>
  );
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
    await supabase.auth.signOut();
  }
}
