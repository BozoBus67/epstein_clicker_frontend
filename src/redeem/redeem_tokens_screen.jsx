import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { update_premium_game_data } from '../shared/store/sessionSlice';
import { api_redeem_tokens } from './api';
import Back_Arrow_Button from '../shared/components/back_arrow_button';

function Redeem_Modal({ on_close, on_success }) {
  const [answers, set_answers] = useState(['', '', '']);
  const [loading, set_loading] = useState(false);

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
      set_result({ error: err?.detail || 'Something went wrong.' });
    } finally {
      set_loading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: '#1e1e2e', border: '2px solid #facc15', borderRadius: '12px',
        padding: '32px', width: '420px', display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <h2 style={{ color: '#facc15', margin: 0, textAlign: 'center' }}>
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
              padding: '10px 12px', borderRadius: '6px', border: '1px solid #444',
              background: '#0f0f1a', color: 'white', fontSize: '14px',
            }}
          />
        ))}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handle_submit}
            disabled={loading}
            style={{
              padding: '8px 24px', background: '#facc15', color: '#000',
              border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Checking...' : 'Submit'}
          </button>
          <button
            onClick={on_close}
            style={{
              padding: '8px 24px', background: '#333', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Redeem_Tokens_Screen() {
  const dispatch = useDispatch();
  const premium_game_data = useSelector(state => state.session.premium_game_data);
  const [show_modal, set_show_modal] = useState(false);

  const handle_success = (tokens_awarded) => {
    dispatch(update_premium_game_data({
      ...premium_game_data,
      tokens: (premium_game_data?.tokens ?? 0) + tokens_awarded,
      redeemed: { ...premium_game_data?.redeemed, poisson: true },
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Back_Arrow_Button to="/game" />

      {show_modal && (
        <Redeem_Modal
          on_close={() => set_show_modal(false)}
          on_success={handle_success}
        />
      )}

      <h1 style={{ color: '#facc15', marginBottom: '8px' }}>Redeem Tokens</h1>
      <p style={{ color: '#aaa', marginBottom: '24px' }}>Placeholder description text.</p>

      <button
        onClick={() => set_show_modal(true)}
        style={{
          padding: '10px 28px', background: '#facc15', color: '#000',
          border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
        }}
      >
        Answer a Question
      </button>
    </div>
  );
}
