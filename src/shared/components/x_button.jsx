import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme';

export default function X_Button({ to }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [hovered, set_hovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      onMouseEnter={() => set_hovered(true)}
      onMouseLeave={() => set_hovered(false)}
      title="Close"
      style={{
        position: 'fixed', top: '16px', right: '16px',
        border: `2px solid ${theme.accent}`, borderRadius: '50%',
        width: '44px', height: '44px',
        background: theme.accent,
        color: theme.accent_text ?? '#000',
        fontSize: '20px', fontWeight: 'bold', lineHeight: 1, padding: 0,
        cursor: 'pointer',
        boxShadow: `0 0 10px ${theme.accent}88, 0 2px 4px rgba(0,0,0,0.4)`,
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.1s ease',
      }}
    >
      ✕
    </button>
  );
}
