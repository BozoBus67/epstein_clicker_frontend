import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Modal_Overlay } from '../../shared/components';
import { SCROLL_NAMES } from '../../shared/constants';
import { useEscapeKey } from '../../shared/hooks';
import { SCROLL_FACES } from '../../shared/scroll_faces';
import { increment_premium_game_data_field, update_premium_game_data_field } from '../../shared/store/sessionSlice';
import { useTheme } from '../../shared/theme';
import { api_spin } from '../api';
import { SLOT_FRAME_MS, LEVER_RESET_MS } from './constants';

export default function Gamble_Modal({ on_close }) {
  const dispatch = useDispatch();
  const premium_game_data = useSelector(state => state.session.premium_game_data);
  const pending_wins_ref = useRef([]);
  const theme = useTheme();
  const [sequences, set_sequences] = useState(null);
  const [subset_indices, set_subset_indices] = useState(null);
  const [frame, set_frame] = useState(null);
  const is_spinning = frame !== null && sequences !== null;

  useEscapeKey(on_close, !is_spinning);

  const handle_pull = async () => {
    try {
      const data = await api_spin();
      dispatch(update_premium_game_data_field({ key: 'tokens', value: data.tokens_remaining }));
      pending_wins_ref.current = data.wins ?? [];
      set_sequences(data.sequences);
      set_subset_indices(data.subset_indices);
      set_frame(0);
    } catch (err) {
      toast.error(err?.detail || 'Error: Spin failed.');
    }
  };

  const apply_pending_wins = () => {
    const wins = pending_wins_ref.current;
    if (!wins.length) return;
    pending_wins_ref.current = [];
    for (const win of wins) {
      dispatch(increment_premium_game_data_field({ key: win.scroll_id, amount: win.amount }));
      toast.success(`Won ${win.amount}× ${SCROLL_NAMES[win.scroll_id] ?? win.scroll_id}!`);
    }
  };

  useEffect(() => {
    if (frame === null || !sequences) return;
    if (frame >= sequences[0].length) {
      set_frame(null);
      apply_pending_wins();
      return;
    }
    const t = setTimeout(() => set_frame(f => f + 1), SLOT_FRAME_MS);
    return () => clearTimeout(t);
  }, [frame, sequences]);

  const current_digits = sequences
    ? sequences.map(seq => seq[Math.min(frame ?? seq.length - 1, seq.length - 1)])
    : Array(5).fill(null);

  return (
    <Modal_Overlay panel_style={{
      width: '580px', height: '280px', padding: 0, gap: '20px', minWidth: 0,
      alignItems: 'center', justifyContent: 'center', position: 'relative',
    }}>
      <span style={{ color: theme.accent, fontWeight: 'bold', fontSize: '15px' }}>
        Tokens: {(premium_game_data?.tokens ?? 0).toLocaleString()}
      </span>
      <div style={{ display: 'flex', gap: '16px' }}>
        {current_digits.map((d, i) => (
          <Slot_Card key={i} face_index={d === null || subset_indices === null ? null : subset_indices[d]} />
        ))}
      </div>
      <button
        type="button"
        onClick={on_close}
        disabled={is_spinning}
        style={{ background: theme.button_neutral_bg, color: theme.button_neutral_text, border: 'none', borderRadius: '6px', padding: '8px 20px', cursor: is_spinning ? 'default' : 'pointer' }}
      >
        Close
      </button>
      <div style={{ position: 'absolute', right: 0, top: '50%' }}>
        <Lever on_pull={handle_pull} />
      </div>
    </Modal_Overlay>
  );
}

function Slot_Card({ face_index }) {
  const theme = useTheme();
  return (
    <div style={{
      width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden',
      border: `2px solid ${theme.panel_border}`, background: theme.panel_secondary,
    }}>
      {face_index !== null && (
        <img src={SCROLL_FACES[face_index]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
    </div>
  );
}

function Lever({ on_pull }) {
  const [down, set_down] = useState(false);

  const handle_click = () => {
    if (down) return;
    set_down(true);
    on_pull();
    setTimeout(() => set_down(false), LEVER_RESET_MS);
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
