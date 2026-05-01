import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { increment_premium_game_data_field, update_premium_game_data_field } from '../shared/store/sessionSlice';
import { api_redeem_tokens } from './api';
import { Back_Arrow_Button, Modal_Overlay } from '../shared/components';
import { useTheme } from '../shared/theme';

export default function Redeem_Tokens_Screen() {
  const dispatch = useDispatch();
  const premium_game_data = useSelector(state => state.session.premium_game_data);
  const [show_modal, set_show_modal] = useState(false);
  const theme = useTheme();

  const handle_success = (tokens_awarded) => {
    dispatch(increment_premium_game_data_field({ key: 'tokens', amount: tokens_awarded }));
    dispatch(update_premium_game_data_field({
      key: 'redeemed',
      value: { ...premium_game_data?.redeemed, poisson: true },
    }));
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center',
      background: theme.bg, backgroundSize: theme.bg_size, backgroundPosition: theme.bg_position, color: theme.text,
    }}>
      <Redeem_Tokens_Screen_Topbar />
      {show_modal && (
        <Redeem_Modal
          on_close={() => set_show_modal(false)}
          on_success={handle_success}
        />
      )}
      <Redeem_Tokens_Screen_Body on_open_modal={() => set_show_modal(true)} />
    </div>
  );
}

function Redeem_Tokens_Screen_Topbar() {
  return <Back_Arrow_Button to="/game" />;
}

function Redeem_Tokens_Screen_Body({ on_open_modal }) {
  const theme = useTheme();
  return (
    <>
      <h1 style={{ color: theme.accent, marginBottom: '8px' }}>Redeem Tokens</h1>
      <p style={{ color: theme.text_muted, marginBottom: '24px' }}>Placeholder description text.</p>
      <button
        onClick={on_open_modal}
        style={{
          padding: '10px 28px', background: theme.accent, color: theme.accent_text,
          border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
        }}
      >
        Answer a Question
      </button>
    </>
  );
}

function Redeem_Modal({ on_close, on_success }) {
  const [answers, set_answers] = useState(['', '', '']);
  const [loading, set_loading] = useState(false);
  const theme = useTheme();

  const set_answer = (i, val) =>
    set_answers(prev => prev.map((a, idx) => idx === i ? val : a));

  const handle_submit = async () => {
    set_loading(true);
    try {
      const data = await api_redeem_tokens(answers[0], answers[1], answers[2]);
      if (data.correct) {
        if (data.already_redeemed) toast.error('Already redeemed!');
        else { on_success(data.tokens_awarded); toast.success(`+${data.tokens_awarded} tokens!`); }
      } else {
        toast.error('Incorrect — try again.');
      }
    } catch (err) {
      toast.error(err?.detail || 'Something went wrong.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <Modal_Overlay panel_style={{ width: '420px' }}>
      <h2 style={{ color: theme.accent, margin: 0, textAlign: 'center' }}>
        Name the 3 assumptions for the Poisson distribution
      </h2>

      {[0, 1, 2].map(i => (
        <input
          key={i}
          type="text"
          placeholder={`Assumption ${i + 1}`}
          value={answers[i]}
          onChange={e => set_answer(i, e.target.value)}
          style={{
            padding: '10px 12px', borderRadius: '6px', border: `1px solid ${theme.panel_border}`,
            background: theme.panel_secondary, color: theme.text, fontSize: '14px',
          }}
        />
      ))}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handle_submit}
          disabled={loading}
          style={{
            padding: '8px 24px', background: theme.accent, color: theme.accent_text,
            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Checking...' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={on_close}
          style={{
            padding: '8px 24px', background: theme.button_neutral_bg, color: theme.button_neutral_text,
            border: 'none', borderRadius: '6px', cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </Modal_Overlay>
  );
}
