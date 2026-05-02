import { useState } from 'react';
import { useTierGate } from '../shared/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logout, update_game_data, update_premium_game_data_field } from '../shared/store/sessionSlice';
import { Confirm_Modal, Modal_Overlay, Subscreen } from '../shared/components';
import { stop_player } from '../music/audio_state';
import { supabase } from '../shared/supabase_client';
import { useTheme } from '../shared/theme';
import { api_reset_game } from '../game';
import { api_get_my_discord, api_set_kirk_mode, api_set_theme } from './api';

export default function Settings_Screen() {
  const dispatch = useDispatch();
  const [show_reset_confirmation, set_show_reset_confirmation] = useState(false);

  const handle_reset_confirm = async () => {
    try {
      const data = await api_reset_game();
      dispatch(update_game_data(data.game_data));
      toast.success('Game reset.');
    } catch (e) {
      toast.error(e?.detail || 'Error: Reset failed.');
    }
    set_show_reset_confirmation(false);
  };

  return (
    <Subscreen back_to="/game" disabled={show_reset_confirmation}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', gap: '24px',
      }}>
        <Settings_Screen_Body on_reset_click={() => set_show_reset_confirmation(true)} />
      </div>
      {show_reset_confirmation && (
        <Reset_Save_Confirmation_Panel
          on_confirm={handle_reset_confirm}
          on_cancel={() => set_show_reset_confirmation(false)}
        />
      )}
    </Subscreen>
  );
}

function Settings_Screen_Body({ on_reset_click }) {
  return (
    <>
      <Change_Login_Details_Button />
      <Get_Discord_Button />
      <Theme_Picker />
      <Kirk_Mode_Toggle />
      <Reset_Save_Button on_click={on_reset_click} />
      <Log_Out_Button />
    </>
  );
}

// Themes available + their display labels. Order matters — radios render in
// this sequence. Locked themes (light needs State Trooper, dark needs George
// Floyd) surface a backend 403 as a toast on click; we don't filter the list
// client-side because scroll counts can change at any time and the backend is
// the source of truth for what's unlocked.
const THEMES = ['default', 'light', 'dark'];
const THEME_LABELS = { default: 'Default 🏛️', light: 'Light ☀', dark: 'Dark ☾' };

// Shared style for the regular settings buttons (Change Login Details, Get
// Discord, Reset Save). Reads from the active palette so each theme's buttons
// look themed instead of hardcoded gray.
function neutral_button_style(theme) {
  return {
    padding: '8px 24px',
    borderRadius: '8px',
    background: theme.button_neutral_bg,
    color: theme.button_neutral_text,
    border: `2px solid ${theme.panel_border}`,
    fontWeight: 'bold',
    cursor: 'pointer',
  };
}

function Theme_Picker() {
  const dispatch = useDispatch();
  const pgd = useSelector(state => state.session.premium_game_data);
  const theme = useTheme();
  const current = pgd?.theme ?? 'default';

  const set_theme = async (name) => {
    if (name === current) return;
    try {
      await api_set_theme(name);
      dispatch(update_premium_game_data_field({ key: 'theme', value: name }));
    } catch (err) {
      toast.error(err?.detail || err?.message || 'Error: Failed to set theme.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      padding: '4px',
      borderRadius: '10px',
      background: theme.panel_secondary,
      border: `2px solid ${theme.panel_border}`,
    }}>
      {THEMES.map(name => {
        const active = name === current;
        return (
          <button
            key={name}
            type="button"
            onClick={() => set_theme(name)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: active ? theme.accent : 'transparent',
              color: active ? theme.accent_text : theme.text,
              border: 'none',
              fontWeight: 'bold',
              cursor: active ? 'default' : 'pointer',
            }}
          >
            {THEME_LABELS[name]}
          </button>
        );
      })}
    </div>
  );
}

// Kirk Mode toggle. Reads pgd.kirk_mode from Redux, flips via PATCH /me/kirk_mode.
// The backend gates "enable" behind owning a Charlie Kirk scroll and surfaces
// 403 with a useful detail message — we just toast it on failure.
function Kirk_Mode_Toggle() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const enabled = useSelector(state => state.session.premium_game_data?.kirk_mode ?? false);
  const [hovered, set_hovered] = useState(false);

  const handle = async () => {
    const next = !enabled;
    try {
      await api_set_kirk_mode(next);
      dispatch(update_premium_game_data_field({ key: 'kirk_mode', value: next }));
    } catch (err) {
      toast.error(err?.detail || err?.message || 'Error: Failed to set Kirk Mode.');
    }
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => set_hovered(true)}
      onMouseLeave={() => set_hovered(false)}
    >
      <button type="button" onClick={handle} style={neutral_button_style(theme)}>
        Kirk Mode: {enabled ? 'On' : 'Off'}
      </button>
      {hovered && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
          background: theme.panel, border: `1px solid ${theme.panel_border}`, borderRadius: '6px',
          padding: '4px 10px', whiteSpace: 'nowrap', fontSize: '12px',
          color: theme.text_muted, opacity: 0.85, pointerEvents: 'none', zIndex: 10,
        }}>
          click to toggle
        </div>
      )}
    </div>
  );
}

function Change_Login_Details_Button() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { gate, lock_modal } = useTierGate(3);
  return (
    <>
      <button
        type="button"
        onClick={() => gate(() => navigate('/game/settings/login-details'))}
        style={neutral_button_style(theme)}
      >
        Change Login Details
      </button>
      {lock_modal}
    </>
  );
}

function Get_Discord_Button() {
  const theme = useTheme();
  const { gate, lock_modal } = useTierGate(5);
  const [discord, set_discord] = useState(null);

  const handle_click = async () => {
    try {
      const data = await api_get_my_discord();
      set_discord(data.discord);
    } catch (e) {
      toast.error(e?.detail || e?.message || 'Error: Failed to fetch Discord.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => gate(handle_click)}
        style={neutral_button_style(theme)}
      >
        Get My Discord
      </button>
      {lock_modal}
      {discord && <Discord_Reveal_Modal discord={discord} on_close={() => set_discord(null)} />}
    </>
  );
}

function Reset_Save_Button({ on_click }) {
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={on_click}
      style={neutral_button_style(theme)}
    >
      Reset Save
    </button>
  );
}

function Log_Out_Button() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handle_logout = async () => {
    stop_player();
    await supabase.auth.signOut();
    dispatch(logout());
    // No navigate needed — Auth_Shell's catch-all (Auth_Default_Redirect) sees
    // we're at /game/settings (not at /), so it lands on /login automatically.
    // First-time visitors arriving at / still get /signup the same way.
  };

  // Log Out stays red across all themes — "danger" should look like danger
  // regardless of palette, and a themed log-out button would lose that signal.
  return (
    <button
      type="button"
      onClick={handle_logout}
      style={{
        padding: '8px 24px',
        borderRadius: '8px',
        background: '#ef4444',
        color: 'white',
        border: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      Log Out
    </button>
  );
}

function Discord_Reveal_Modal({ discord, on_close }) {
  const theme = useTheme();
  useEscapeKey(on_close);
  return (
    <Modal_Overlay panel_style={{ alignItems: 'center', textAlign: 'center' }}>
      <h2 style={{ color: theme.accent, margin: 0 }}>My Discord</h2>
      <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{discord}</p>
      <button
        type="button"
        onClick={on_close}
        style={{
          marginTop: '8px', padding: '8px 24px', background: theme.accent,
          color: theme.accent_text, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
        }}
      >
        OK
      </button>
    </Modal_Overlay>
  );
}

function Reset_Save_Confirmation_Panel({ on_confirm, on_cancel }) {
  return <Confirm_Modal on_confirm={on_confirm} on_cancel={on_cancel} danger />;
}
