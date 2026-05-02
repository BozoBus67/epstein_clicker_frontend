import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Modal_Overlay } from '../../shared/components';
import { useEscapeKey } from '../../shared/hooks';
import { SCROLL_FACE_BY_SLUG } from '../../shared/scroll_faces';
import { SCROLL_BY_ID } from '../../shared/scroll_registry';
import { increment_premium_game_data_field, update_premium_game_data_field } from '../../shared/store/sessionSlice';
import { useTheme } from '../../shared/theme';
import { api_roulette_spin } from '../api';
import { ROULETTE_SPIN_MS, ROULETTE_FULL_SPINS } from './constants';
import { SCROLL_IDS, SEGMENT_DEG, WHEEL_SIZE, WHEEL_RADIUS, FACE_RADIUS, FACE_SIZE } from './roulette_utils';

export default function Roulette_Modal({ on_close }) {
  const dispatch = useDispatch();
  const premium_game_data = useSelector(state => state.session.premium_game_data);
  const pending_win_ref = useRef(null);
  const [rotation, set_rotation] = useState(0);
  const [is_spinning, set_is_spinning] = useState(false);
  const theme = useTheme();

  useEscapeKey(on_close, !is_spinning);

  const handle_spin = async () => {
    if (is_spinning) return;
    try {
      const data = await api_roulette_spin();
      dispatch(update_premium_game_data_field({ key: 'tokens', value: data.tokens_remaining }));
      const winning_index = SCROLL_IDS.indexOf(data.scroll_id);
      if (winning_index === -1) {
        toast.error(`Error: Unknown scroll: ${data.scroll_id}`);
        return;
      }
      pending_win_ref.current = data.scroll_id;
      const target_offset = (360 - winning_index * SEGMENT_DEG) % 360;
      const current_full_turns = Math.floor(rotation / 360);
      const target = (current_full_turns + ROULETTE_FULL_SPINS + 1) * 360 + target_offset;
      set_is_spinning(true);
      set_rotation(target);
    } catch (err) {
      toast.error(err?.detail || 'Error: Spin failed.');
    }
  };

  const handle_transition_end = () => {
    if (!is_spinning) return;
    set_is_spinning(false);
    const scroll_id = pending_win_ref.current;
    if (!scroll_id) return;
    pending_win_ref.current = null;
    dispatch(increment_premium_game_data_field({ key: scroll_id, amount: 1 }));
    toast.success(`Won 1× ${SCROLL_BY_ID[scroll_id]?.display_name ?? scroll_id}!`);
  };

  return (
    <Modal_Overlay panel_style={{ padding: '24px 32px', alignItems: 'center', gap: '18px' }}>
      <span style={{ color: theme.accent, fontWeight: 'bold', fontSize: '15px' }}>
        Tokens: {(premium_game_data?.tokens ?? 0).toLocaleString()}
      </span>
      <Wheel rotation={rotation} on_transition_end={handle_transition_end} />
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={handle_spin}
          disabled={is_spinning}
          style={{
            background: is_spinning ? theme.text_muted : theme.accent, color: theme.accent_text,
            border: 'none', borderRadius: '6px', padding: '10px 28px',
            fontWeight: 'bold', cursor: is_spinning ? 'default' : 'pointer',
          }}
        >
          {is_spinning ? 'Spinning…' : 'Spin'}
        </button>
        <button
          type="button"
          onClick={on_close}
          disabled={is_spinning}
          style={{
            background: theme.button_neutral_bg, color: theme.button_neutral_text, border: 'none',
            borderRadius: '6px', padding: '10px 28px',
            cursor: is_spinning ? 'default' : 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </Modal_Overlay>
  );
}

function Wheel({ rotation, on_transition_end }) {
  return (
    <div style={{ position: 'relative', width: WHEEL_SIZE, height: WHEEL_SIZE }}>
      <svg
        viewBox={`-${WHEEL_RADIUS} -${WHEEL_RADIUS} ${WHEEL_SIZE} ${WHEEL_SIZE}`}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
          transition: `transform ${ROULETTE_SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.4, 1)`,
        }}
        onTransitionEnd={on_transition_end}
      >
        <circle cx={0} cy={0} r={WHEEL_RADIUS - 1} fill="#0f0f1a" stroke="#facc15" strokeWidth={2} />
        {SCROLL_IDS.map((id, i) => (
          <Segment key={id} index={i} face={SCROLL_FACE_BY_SLUG[id]} />
        ))}
        <circle cx={0} cy={0} r={22} fill="#facc15" stroke="#000" strokeWidth={2} />
      </svg>
      <Pointer />
    </div>
  );
}

function Segment({ index, face }) {
  const half = SEGMENT_DEG / 2;
  const a0 = ((index * SEGMENT_DEG) - 90 - half) * (Math.PI / 180);
  const a1 = ((index * SEGMENT_DEG) - 90 + half) * (Math.PI / 180);
  const r = WHEEL_RADIUS - 2;
  const x0 = Math.cos(a0) * r;
  const y0 = Math.sin(a0) * r;
  const x1 = Math.cos(a1) * r;
  const y1 = Math.sin(a1) * r;
  const fill = index % 2 === 0 ? '#7f1d1d' : '#1a1a1a';

  const a_mid = ((index * SEGMENT_DEG) - 90) * (Math.PI / 180);
  const fx = Math.cos(a_mid) * FACE_RADIUS;
  const fy = Math.sin(a_mid) * FACE_RADIUS;
  const face_rotation = index * SEGMENT_DEG;

  return (
    <g>
      <path
        d={`M 0 0 L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`}
        fill={fill}
        stroke="#facc15"
        strokeWidth={1}
      />
      <g transform={`rotate(${face_rotation} ${fx} ${fy})`}>
        <clipPath id={`clip_${index}`}>
          <circle cx={fx} cy={fy} r={FACE_SIZE / 2} />
        </clipPath>
        <image
          href={face}
          x={fx - FACE_SIZE / 2}
          y={fy - FACE_SIZE / 2}
          width={FACE_SIZE}
          height={FACE_SIZE}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#clip_${index})`}
        />
        <circle cx={fx} cy={fy} r={FACE_SIZE / 2} fill="none" stroke="#facc15" strokeWidth={1.5} />
      </g>
    </g>
  );
}

function Pointer() {
  return (
    <div style={{
      position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
      width: 0, height: 0,
      borderLeft: '14px solid transparent',
      borderRight: '14px solid transparent',
      borderTop: '24px solid #ef4444',
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
      zIndex: 2,
    }} />
  );
}
