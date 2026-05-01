import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Back_Arrow_Button, Modal_Overlay } from '../shared/components';
import { useEscapeKey } from '../shared/hooks';
import { increment_premium_game_data_field, update_premium_game_data_field } from '../shared/store/sessionSlice';
import { useTheme } from '../shared/theme';
import { api_redeem_promotion_oath, api_redeem_tokens } from './api';

export default function Redeem_Tokens_Screen() {
  const dispatch = useDispatch();
  const premium_game_data = useSelector(state => state.session.premium_game_data);
  const [show_poisson_modal, set_show_poisson_modal] = useState(false);
  const [show_promotion_modal, set_show_promotion_modal] = useState(false);
  const theme = useTheme();

  // Shared success handler: bump tokens, mark this offer as redeemed in pgd.
  // `redeemed_key` is the field on premium_game_data.redeemed for this
  // particular offer (currently 'poisson' or 'promotion_oath').
  const handle_success = (tokens_awarded, redeemed_key) => {
    dispatch(increment_premium_game_data_field({ key: 'tokens', amount: tokens_awarded }));
    dispatch(update_premium_game_data_field({
      key: 'redeemed',
      value: { ...premium_game_data?.redeemed, [redeemed_key]: true },
    }));
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center',
      background: theme.bg, backgroundSize: theme.bg_size, backgroundPosition: theme.bg_position, color: theme.text,
    }}>
      <Redeem_Tokens_Screen_Topbar />
      {show_poisson_modal && (
        <Redeem_Modal
          on_close={() => set_show_poisson_modal(false)}
          on_success={handle_success}
        />
      )}
      {show_promotion_modal && (
        <Promotion_Oath_Modal
          on_close={() => set_show_promotion_modal(false)}
          on_success={handle_success}
        />
      )}
      <Redeem_Tokens_Screen_Body
        on_open_poisson_modal={() => set_show_poisson_modal(true)}
        on_open_promotion_modal={() => set_show_promotion_modal(true)}
      />
    </div>
  );
}

function Redeem_Tokens_Screen_Topbar() {
  return <Back_Arrow_Button to="/game" />;
}

function Redeem_Tokens_Screen_Body({ on_open_poisson_modal, on_open_promotion_modal }) {
  const theme = useTheme();
  const button_style = {
    padding: '10px 28px', background: theme.accent, color: theme.accent_text,
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
  };
  return (
    <>
      <h1 style={{ color: theme.accent, marginBottom: '8px' }}>One time offers!</h1>
      <p style={{ color: theme.text_muted, marginBottom: '24px' }}>Placeholder description text.</p>
      <button
        type="button"
        onClick={on_open_promotion_modal}
        style={{ ...button_style, marginBottom: '12px' }}
      >
        Click me
      </button>
      <button
        type="button"
        onClick={on_open_poisson_modal}
        style={button_style}
      >
        the 3 assumptions for the poisson distributions
      </button>
    </>
  );
}

function Redeem_Modal({ on_close, on_success }) {
  const [answers, set_answers] = useState(['', '', '']);
  const [loading, set_loading] = useState(false);
  const theme = useTheme();
  useEscapeKey(on_close, !loading);

  const set_answer = (i, val) =>
    set_answers(prev => prev.map((a, idx) => idx === i ? val : a));

  const handle_submit = async () => {
    set_loading(true);
    try {
      const data = await api_redeem_tokens(answers[0], answers[1], answers[2]);
      if (data.correct) {
        if (data.already_redeemed) toast.error('Already redeemed!');
        else { on_success(data.tokens_awarded, 'poisson'); toast.success(`+${data.tokens_awarded} tokens!`); }
      } else {
        toast.error('Incorrect — try again.');
      }
    } catch (err) {
      toast.error(err?.detail || 'Error: Something went wrong.');
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

// Honour-system referral pledge: user checks the box, hits Claim, gets 25
// tokens. Claim button is always pressable — clicking without the box checked
// surfaces an inline red error rather than disabling the button, so the user
// gets feedback about WHY nothing happened.
function Promotion_Oath_Modal({ on_close, on_success }) {
  const [agreed, set_agreed] = useState(false);
  const [error, set_error] = useState('');
  const [loading, set_loading] = useState(false);
  const theme = useTheme();
  useEscapeKey(on_close, !loading);

  const handle_claim = async () => {
    if (!agreed) {
      set_error('You must agree to the terms and conditions.');
      return;
    }
    set_error('');
    set_loading(true);
    try {
      const data = await api_redeem_promotion_oath();
      if (data.already_redeemed) {
        toast.error('Already redeemed!');
      } else {
        on_success(data.tokens_awarded, 'promotion_oath');
        toast.success(`+${data.tokens_awarded} tokens!`);
      }
      on_close();
    } catch (err) {
      toast.error(err?.detail || 'Error: Something went wrong.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <Modal_Overlay panel_style={{ width: '460px' }}>
      <h2 style={{ color: theme.accent, margin: 0, textAlign: 'center' }}>
        Promote Epstein Clicker
      </h2>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', color: theme.text, fontSize: '14px', lineHeight: 1.4 }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => set_agreed(e.target.checked)}
          style={{ marginTop: '4px', flexShrink: 0 }}
        />
        <span>I solemnly swear I sent this to at least 2 other people to promote Epstein Clicker.</span>
      </label>
      {error && (
        <p style={{ color: '#f87171', margin: 0, fontSize: '14px', textAlign: 'center' }}>{error}</p>
      )}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handle_claim}
          disabled={loading}
          style={{
            padding: '8px 24px', background: theme.accent, color: theme.accent_text,
            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Claiming...' : 'Claim tokens'}
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
