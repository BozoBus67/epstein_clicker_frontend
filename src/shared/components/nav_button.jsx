import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme';

// Yellow-pill nav button used in the top bar and anywhere else we want a
// primary navigation action. Provide either `to` (router path) for a navigate,
// or `on_click` for a custom handler — the latter wins if both are passed.
export default function Nav_Button({ label, to, on_click }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [hovered, set_hovered] = useState(false);

  return (
    <button
      type="button"
      onClick={on_click ?? (() => navigate(to))}
      onMouseEnter={() => set_hovered(true)}
      onMouseLeave={() => set_hovered(false)}
      style={{
        padding: '4px 12px',
        border: `1px solid ${theme.accent}`,
        borderRadius: '6px',
        background: theme.accent,
        color: theme.accent_text,
        fontWeight: 'bold',
        fontSize: '13px',
        cursor: 'pointer',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.1s ease',
      }}
    >
      {label}
    </button>
  );
}
