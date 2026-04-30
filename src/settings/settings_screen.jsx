import { useState } from 'react';
import { useEscapeKey, useTierGate } from '../shared/hooks';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logout, update_game_data } from '../shared/store/sessionSlice';
import { Back_Arrow_Button, X_Button } from '../shared/components';
import { current_audio, set_current_audio } from '../misc_info';
import { supabase } from '../supabase_client';
import { api_reset_game } from '../game';
import { api_get_my_discord } from './api';

export default function Settings_Screen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [show_reset_confirmation, set_show_reset_confirmation] = useState(false);

  useEscapeKey(() => navigate('/game'), !show_reset_confirmation);

  const handle_reset_confirm = async () => {
    try {
      const data = await api_reset_game();
      dispatch(update_game_data(data.game_data));
    } catch {
      console.error('Reset failed');
    }
    set_show_reset_confirmation(false);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '24px' }}>
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
      <Reset_Save_Button on_click={on_reset_click} />
      <Log_Out_Button />
    </>
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
  useEscapeKey(on_close);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      <div style={{
        background: '#1e1e2e', border: '2px solid #facc15', borderRadius: '12px',
        padding: '32px', minWidth: '320px', textAlign: 'center', color: 'white',
      }}>
        <h2 style={{ color: '#facc15', marginBottom: '12px' }}>My Discord</h2>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{discord}</p>
        <button
          onClick={on_close}
          style={{
            marginTop: '20px', padding: '8px 24px', background: '#facc15',
            color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

function Reset_Save_Confirmation_Panel({ on_confirm, on_cancel }) {
  useEscapeKey(on_cancel);
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      border: '1px solid gray',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      zIndex: 100,
    }}>
      <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Are you sure?</p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={on_confirm}
          className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 active:bg-red-700 transition"
        >
          Yes
        </button>
        <button
          onClick={on_cancel}
          className="bg-gray-300 text-black py-2 px-6 rounded-lg hover:bg-gray-400 active:bg-gray-500 transition"
        >
          No
        </button>
      </div>
    </div>
  );
}
