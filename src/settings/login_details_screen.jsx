import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Subscreen } from '../shared/components';
import { supabase } from '../shared/supabase_client';
import { patch_session_data } from '../shared/store/sessionSlice';
import { useTheme } from '../shared/theme';
import { api_update_username } from './api';

export default function Login_Details_Screen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const current_username = useSelector(state => state.session.session_data?.username ?? '');
  const current_email = useSelector(state => state.session.session_data?.email ?? '');

  const [username, set_username] = useState(current_username);
  const [email, set_email] = useState(current_email);
  const [old_password, set_old_password] = useState('');
  const [password, set_password] = useState('');
  const [confirm_password, set_confirm_password] = useState('');
  const [loading, set_loading] = useState(false);

  const handle_submit = async () => {
    const username_changed = username.trim() !== current_username;
    const email_changed = email.trim() !== current_email && email.trim() !== '';
    const password_changed = password !== '';

    if (!username_changed && !email_changed && !password_changed) {
      toast.error('No changes to save.');
      return;
    }
    if (password_changed && !old_password) {
      toast.error('Enter your current password to set a new one.');
      return;
    }
    if (password_changed && password !== confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!username.trim()) {
      toast.error('Username cannot be empty.');
      return;
    }

    set_loading(true);
    try {
      if (username_changed) {
        await api_update_username(username.trim());
        dispatch(patch_session_data({ username: username.trim() }));
      }
      if (email_changed || password_changed) {
        const { error: reauth_error } = await supabase.auth.signInWithPassword({ email: current_email, password: old_password });
        if (reauth_error) throw new Error('Current password is incorrect.');
        const updates = {};
        if (email_changed) updates.email = email.trim();
        if (password_changed) updates.password = password;
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        if (email_changed) dispatch(patch_session_data({ email: email.trim() }));
      }
      toast.success('Login details updated.');
      navigate('/game/settings');
    } catch (e) {
      toast.error(e?.message || 'Error: Something went wrong.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <Subscreen back_to="/game/settings" disabled={loading}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Login_Details_Screen_Body
          username={username} set_username={set_username}
          email={email} set_email={set_email}
          old_password={old_password} set_old_password={set_old_password}
          password={password} set_password={set_password}
          confirm_password={confirm_password} set_confirm_password={set_confirm_password}
          loading={loading}
          on_submit={handle_submit}
          on_cancel={() => navigate('/game/settings')}
        />
      </div>
    </Subscreen>
  );
}

function Login_Details_Screen_Body({
  username, set_username, email, set_email,
  old_password, set_old_password, password, set_password,
  confirm_password, set_confirm_password,
  loading, on_submit, on_cancel,
}) {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '340px' }}>
      <h2 style={{ color: theme.text, margin: 0, textAlign: 'center' }}>Change Login Details</h2>
      <Field label="Username" type="text" value={username} on_change={set_username} placeholder="Username" />
      <Field label="Email" type="email" value={email} on_change={set_email} placeholder="Email" />
      <Field label="Current password" type="password" value={old_password} on_change={set_old_password} placeholder="Required to set a new password" />
      <Field label="New password" type="password" value={password} on_change={set_password} placeholder="Leave blank to keep current" />
      <Field label="Confirm new password" type="password" value={confirm_password} on_change={set_confirm_password} placeholder="" />
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={on_cancel}
          disabled={loading}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', background: theme.button_neutral_bg, color: theme.button_neutral_text, fontWeight: 'bold', fontSize: '14px', border: `1px solid ${theme.panel_border}`, cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={on_submit}
          disabled={loading}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', background: theme.accent, color: theme.accent_text, fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, type, value, on_change, placeholder }) {
  const theme = useTheme();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: theme.text, width: '100%' }}>
      {label}
      <input
        type={type}
        value={value}
        onChange={e => on_change(e.target.value)}
        placeholder={placeholder}
        style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${theme.panel_border}`, background: theme.panel_secondary, color: theme.text, fontSize: '14px', outline: 'none' }}
      />
    </label>
  );
}
