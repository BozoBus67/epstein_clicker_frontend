import { useState } from 'react';
import { useEscapeKey, useTierGate } from '../shared/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logout, update_game_data, update_premium_game_data_field } from '../shared/store/sessionSlice';
import { Back_Arrow_Button, Confirm_Modal, Modal_Overlay, X_Button } from '../shared/components';
import { current_audio, set_current_audio } from '../music/audio_state';
import { supabase } from '../shared/supabase_client';
import { useTheme } from '../shared/theme';
import { api_reset_game } from '../game';
import { api_get_my_discord, api_set_theme } from './api';

export default function Settings_Screen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [show_reset_confirmation, set_show_reset_confirmation] = useState(false);

  useEscapeKey(() => navigate('/game'), !show_reset_confirmation);

  const handle_reset_confirm = async () => {
    try {
      const data = await api_reset_game();
      dispatch(update_game_data(data.game_data));
      toast.success('Game reset.');
    } catch (e) {
      toast.error(e?.detail || 'Reset failed.');
    }
    set_show_reset_confirmation(false);
  };

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center',
      flexDirection: 'column', gap: '24px',
      background: theme.bg, backgroundSize: theme.bg_size, backgroundPosition: theme.bg_position,
      color: theme.text,
    }}>
      <Settings_Screen_Topbar />
      <Settings_Screen_Body on_reset_click={() => set_show_reset_confirmation(true)} />
      {show_reset_confirmation && (
        <Reset_Save_Confirmation_Panel
          on_confirm={handle_reset_confirm}
          on_cancel={() => set_show_reset_confirmation(false)}
        />
      )}
    </div>
  );
}

function Settings_Screen_Topbar() {
  return (
    <>
      <Back_Arrow_Button to="/game" />
      <X_Button to="/game" />
    </>
  );
}

function Settings_Screen_Body({ on_reset_click }) {
  return (
    <>
      <Change_Login_Details_Button />
      <Get_Discord_Button />
      <Theme_Toggle_Button />
      <Reset_Save_Button on_click={on_reset_click} />
      <Log_Out_Button />
    </>
  );
}

function Theme_Toggle_Button() {
  const dispatch = useDispatch();
  const pgd = useSelector(state => state.session.premium_game_data);
  const theme = useTheme();
  const current = pgd?.theme ?? 'light';
  const next = current === 'light' ? 'dark' : 'light';

  const handle = async () => {
    try {
      await api_set_theme(next);
      dispatch(update_premium_game_data_field({ key: 'theme', value: next }));
    } catch (err) {
      toast.error(err?.detail || err?.message || 'Failed to set theme');
    }
  };

  return (
    <button
      onClick={handle}
      style={{
        padding: '8px 24px', borderRadius: '8px',
        background: theme.accent, color: theme.accent_text,
        border: `2px solid ${theme.panel_border}`, fontWeight: 'bold', cursor: 'pointer',
      }}
    >
      Theme: {current === 'light' ? 'Light ☀' : 'Dark ☾'} (click to toggle)
    </button>
  );
}

function Change_Login_Details_Button() {
  const navigate = useNavigate();
  const { gate, lock_modal } = useTierGate(3);
  return (
    <>
      <button
        onClick={() => gate(() => navigate('/game/settings/login-details'))}
        className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 active:bg-gray-700 transition"
      >
        Change Login Details
      </button>
      {lock_modal}
    </>
  );
}

function Get_Discord_Button() {
  const { gate, lock_modal } = useTierGate(5);
  const [discord, set_discord] = useState(null);

  const handle_click = async () => {
    try {
      const data = await api_get_my_discord();
      set_discord(data.discord);
    } catch (e) {
      toast.error(e?.detail || e?.message || 'Failed to fetch Discord');
    }
  };

  return (
    <>
      <button
        onClick={() => gate(handle_click)}
        className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 active:bg-gray-700 transition"
      >
        Get My Discord
      </button>
      {lock_modal}
      {discord && <Discord_Reveal_Modal discord={discord} on_close={() => set_discord(null)} />}
    </>
  );
}

function Reset_Save_Button({ on_click }) {
  return (
    <button
      onClick={on_click}
      className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 active:bg-gray-700 transition"
    >
      Reset Save
    </button>
  );
}

function Log_Out_Button() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handle_logout = async () => {
    if (current_audio) {
      current_audio.pause();
      set_current_audio(null);
    }
    await supabase.auth.signOut();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <button
      onClick={handle_logout}
      className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 active:bg-red-700 transition"
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
