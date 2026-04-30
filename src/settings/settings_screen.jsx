import { useEffect, useState } from 'react';
import { useEscapeKey } from '../shared/hooks/useEscapeKey';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, update_game_data } from '../shared/store/sessionSlice';
import Back_Arrow_Button from '../shared/components/back_arrow_button';
import X_Button from '../shared/components/x_button';
import { current_audio, set_current_audio } from '../misc_info';
import { supabase } from '../supabase_client';
import { api_reset_game } from '../game/api';

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

function Change_Login_Details_Button() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/game/settings/login-details')}
      className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 active:bg-gray-700 transition"
    >
      Change Login Details
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

export default function Settings_Screen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [show_reset_confirmation, set_show_reset_confirmation] = useState(false);

  useEscapeKey(() => navigate('/game'), !show_reset_confirmation);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '24px' }}>
      <Back_Arrow_Button to="/game" />
      <X_Button to="/game" />
      <Change_Login_Details_Button />
      <Reset_Save_Button on_click={() => set_show_reset_confirmation(true)} />
      <Log_Out_Button />
      {show_reset_confirmation && (
        <Reset_Save_Confirmation_Panel
          on_confirm={async () => {
            try {
              const data = await api_reset_game();
              dispatch(update_game_data(data.game_data));
            } catch {
              console.error('Reset failed');
            }
            set_show_reset_confirmation(false);
          }}
          on_cancel={() => set_show_reset_confirmation(false)}
        />
      )}
    </div>
  );
}
