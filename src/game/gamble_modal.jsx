import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { update_premium_game_data } from '../shared/store/sessionSlice';
import { api_spin } from './api';
import { useEscapeKey } from '../shared/hooks/useEscapeKey';

const SLOT_IMAGE_COUNT = 10;
const SLOT_IMAGES = Object.fromEntries(
  Array.from({ length: SLOT_IMAGE_COUNT }, (_, i) => [i, new URL(`../assets/slot_images/slot_${i}.png`, import.meta.url).href])
);

function Lever({ on_pull }) {
  const [down, set_down] = useState(false);

  const handle_click = () => {
    if (down) return;
    set_down(true);
    on_pull();
    setTimeout(() => set_down(false), 2000);
  };

  return (
    <div onClick={handle_click} style={{ cursor: down ? 'default' : 'pointer', userSelect: 'none', position: 'relative', width: 0, height: 0 }}>
      <div style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#555', top: -7, left: -7 }} />
      <div style={{
        position: 'absolute', bottom: 0, left: -4,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transformOrigin: 'bottom center',
        transform: `rotate(${down ? 150 : 30}deg)`,
        transition: down ? 'transform 0.15s ease-in' : 'transform 0.4s ease-out',
      }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: down ? '#ef4444' : '#facc15', border: '3px solid #fff' }} />
        <div style={{ width: 8, height: 80, background: '#888', borderRadius: 4 }} />
      </div>
    </div>
  );
}

function Slot_Card({ digit }) {
  return (
    <div style={{
      width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden',
      border: '2px solid #444', background: '#0f0f1a',
    }}>
      {digit !== null && (
        <img src={SLOT_IMAGES[digit]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
    </div>
  );
}

export default function Gamble_Modal({ on_close }) {
  const dispatch = useDispatch();
  const premium_game_data = useSelector(state => state.session.premium_game_data);
  const pgd_ref = useRef(premium_game_data);
  const pending_win_ref = useRef(null);
  const [sequences, set_sequences] = useState(null);
  const [frame, set_frame] = useState(null);
  const is_spinning = frame !== null && sequences !== null;

  useEscapeKey(on_close, !is_spinning);

  useEffect(() => { pgd_ref.current = premium_game_data; }, [premium_game_data]);

  const handle_pull = async () => {
    try {
      const data = await api_spin();
      dispatch(update_premium_game_data({ ...pgd_ref.current, tokens: data.tokens_remaining }));
      pending_win_ref.current = data.win ?? null;
      set_sequences(data.sequences);
      set_frame(0);
    } catch (err) {
      toast.error(err?.detail || 'Spin failed.');
    }
  };

  const apply_pending_win = () => {
    const win = pending_win_ref.current;
    if (!win) return;
    pending_win_ref.current = null;
    const pgd = pgd_ref.current;
    dispatch(update_premium_game_data({ ...pgd, [win.scroll_id]: (pgd[win.scroll_id] ?? 0) + win.amount }));
    toast.success(`Won ${win.amount}x ${win.scroll_id.replace(/_/g, ' ')}!`);
  };

  useEffect(() => {
    if (frame === null || !sequences) return;
    if (frame >= sequences[0].length) {
      set_frame(null);
      apply_pending_win();
      return;
    }
    const t = setTimeout(() => set_frame(f => f + 1), 200);
    return () => clearTimeout(t);
  }, [frame, sequences]);

  const current_digits = sequences
    ? sequences.map(seq => seq[Math.min(frame ?? seq.length - 1, seq.length - 1)])
    : Array(5).fill(null);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          background: '#1e1e2e', border: '2px solid #facc15', borderRadius: '12px',
          width: '580px', height: '280px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '20px',
        }}>
          <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '15px' }}>
            Tokens: {premium_game_data?.tokens ?? 0}
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            {current_digits.map((d, i) => <Slot_Card key={i} digit={d} />)}
          </div>
          <button
            onClick={on_close}
            disabled={is_spinning}
            style={{ background: '#333', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 20px', cursor: is_spinning ? 'default' : 'pointer' }}
          >
            Close
          </button>
        </div>
        <div style={{ position: 'absolute', right: 0, top: '50%' }}>
          <Lever on_pull={handle_pull} />
        </div>
      </div>
    </div>
  );
}
