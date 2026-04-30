import { useState, useEffect } from 'react';
import { current_volume, set_current_volume } from '../../misc_info';

function Volume_Panel({ value, on_change }) {
  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: '8px',
      width: '180px',
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

function Volume_Button({ on_click, value }) {
  const icon = value === 0 ? '🔇' : value < 0.5 ? '🔉' : '🔊';
  return (
    <button
      onClick={on_click}
      className="hover:outline hover:outline-1 hover:outline-yellow-400 hover:cursor-pointer"
      style={{
        background: '#facc15',
        border: '1px solid #facc15',
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

export default function Volume_Control() {
  const [open, set_open] = useState(false);
  const [value, set_value] = useState(() => current_volume);

  useEffect(() => {
    if (!open) return;
    const handle_click_outside = (e) => {
      if (!e.target.closest('.volume-control-container')) set_open(false);
    };
    const handle_esc = (e) => {
      if (e.key === 'Escape') set_open(false);
    };
    document.addEventListener('mousedown', handle_click_outside);
    document.addEventListener('keydown', handle_esc);
    return () => {
      document.removeEventListener('mousedown', handle_click_outside);
      document.removeEventListener('keydown', handle_esc);
    };
  }, [open]);

  const handle_change = (v) => {
    set_value(v);
    set_current_volume(v);
  };

  return (
    <div className="volume-control-container" style={{ position: 'relative' }}>
      <Volume_Button on_click={() => set_open(!open)} value={value} />
      {open && <Volume_Panel value={value} on_change={handle_change} />}
    </div>
  );
}
