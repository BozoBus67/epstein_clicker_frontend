import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import jeffery_epstein_blurry from '../assets/game_screen/jeffery_epstein_blurry.png';
import { login } from '../shared/store/sessionSlice';
import { supabase } from '../shared/supabase_client';
import { api_signup } from './api';

export default function Sign_Up_Screen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [error, set_error] = useState('');
  const [loading, set_loading] = useState(false);

  const try_sign_up = async ({ username, email, password, confirm_password }) => {
    set_error('');

    if (!username || !email || !password || !confirm_password) {
      set_error('Please fill in all fields.');
      return;
    }
    if (password !== confirm_password) {
      set_error('Passwords do not match.');
      return;
    }

    set_loading(true);

    try {
      const data = await api_signup(email, username, password);
      await supabase.auth.setSession({ access_token: data.jwt, refresh_token: data.refresh_token });
      dispatch(login({ user: data.user }));
      navigate('/game');
    } catch (err) {
      set_error(err?.detail || 'Error: An unknown error occurred — please try again.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: `url(${jeffery_epstein_blurry})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Sign_Up_Panel
        on_submit={try_sign_up}
        error={error}
        loading={loading}
        go_to_login={() => navigate('/login')}
      />
    </div>
  );
}

function Sign_Up_Panel({ on_submit, error, loading, go_to_login }) {
  const [username, set_username] = useState('');
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [confirm_password, set_confirm_password] = useState('');

  const submit = () => on_submit({ username, email, password, confirm_password });

  const input_style = { display: 'block', padding: '8px 10px', background: 'rgba(255,255,255,0.1)', color: '#e0e0f0', border: '1px solid rgba(255,255,255,0.25)' };
  const on_enter = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div style={{
      width: '384px', padding: '32px', borderRadius: '12px',
      background: 'rgba(9, 14, 28, 0.88)',
      border: '1px solid rgba(250, 204, 21, 0.5)',
      backdropFilter: 'blur(12px)',
      color: '#e0e0f0',
    }}>
      <h2 style={{ margin: '0 0 20px', color: '#facc15', fontSize: '32px', fontWeight: 'bold', textAlign: 'center' }}>Sign Up</h2>

      <input
        type="text"
        placeholder="Username"
        className="w-full mb-2 rounded-lg"
        style={input_style}
        value={username}
        onChange={(e) => set_username(e.target.value)}
        onKeyDown={on_enter}
      />

      <input
        type="text"
        placeholder="Email"
        className="w-full mb-2 rounded-lg"
        style={input_style}
        value={email}
        onChange={(e) => set_email(e.target.value)}
        onKeyDown={on_enter}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-2 rounded-lg"
        style={input_style}
        value={password}
        onChange={(e) => set_password(e.target.value)}
        onKeyDown={on_enter}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full mb-4 rounded-lg"
        style={input_style}
        value={confirm_password}
        onChange={(e) => set_confirm_password(e.target.value)}
        onKeyDown={on_enter}
      />

      {error && (
        <p style={{ color: '#f87171', marginBottom: '8px', fontSize: '14px' }}>{error}</p>
      )}

      <button
        type="button"
        className="w-full rounded-lg transition"
        style={{ padding: '8px', background: '#facc15', color: '#000', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
        onClick={submit}
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>

      <button
        type="button"
        className="w-full rounded-lg transition hover:underline"
        style={{ padding: '8px', background: 'transparent', color: '#facc15', border: 'none', cursor: 'pointer', marginTop: '4px' }}
        onClick={go_to_login}
      >
        I already have an account
      </button>
    </div>
  );
}
