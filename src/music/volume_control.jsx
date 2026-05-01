import { useState } from 'react';
import { useEscapeKey, useOutsideClick, useTierGate } from '../shared/hooks';
import { useTheme } from '../shared/theme';
import { current_volume, set_current_volume } from './audio_state';

export default function Volume_Control() {
  const { gate, lock_modal } = useTierGate(4);
  const [open, set_open] = useState(false);
  const [value, set_value] = useState(() => current_volume);

  const close = () => set_open(false);
  useOutsideClick('.volume-control-container', close, open);
  useEscapeKey(close, open);

  const handle_change = (v) => {
    set_value(v);
    set_current_volume(v);
  };

  return (
    <div className="volume-control-container" style={{ position: 'relative' }}>
      <Volume_Button on_click={() => gate(() => set_open(!open))} value={value} />
      {open && <Volume_Panel value={value} on_change={handle_change} />}
      {lock_modal}
    </div>
  );
}

function Volume_Button({ on_click, value }) {
  const icon = value === 0 ? '🔇' : value < 0.5 ? '🔉' : '🔊';
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={on_click}
      className="hover:outline hover:outline-1 hover:cursor-pointer"
      style={{
        background: theme.accent,
        border: `1px solid ${theme.accent}`,
        fontSize: '16px',
        lineHeight: 1,
        padding: '4px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
    >
      {icon}
    </button>
  );
}

function Volume_Panel({ value, on_change }) {
  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: '24px',
      width: '240px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '12px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span style={{ fontSize: '12px', color: '#111', fontWeight: 'bold', minWidth: '32px' }}>{Math.round(value * 100)}%</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => on_change(parseFloat(e.target.value))}
        style={{ flex: 1 }}
      />
    </div>
  );
}
