import { useState } from 'react';
import { useTheme } from '../theme';

// Reusable refresh icon button (↻). Defaults to a subtle look (text-color icon,
// panel-border outline, transparent fill). Pass `style` to position the button
// or override colors at the call site (e.g. accent border for prominence).
//
// Hover: scales up by ~8% to match the settings/back-arrow buttons. Disable
// the effect by passing `hover_scale={1}`.
export default function Refresh_Button({
  on_click,
  disabled = false,
  size = 32,
  title = 'Refresh',
  hover_scale = 1.08,
  style = {},
}) {
  const theme = useTheme();
  const [hovered, set_hovered] = useState(false);
  return (
    <button
      type="button"
      onClick={on_click}
      disabled={disabled}
      title={title}
      onMouseEnter={() => set_hovered(true)}
      onMouseLeave={() => set_hovered(false)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${theme.panel_border}`,
        background: 'transparent',
        color: theme.text,
        cursor: disabled ? 'default' : 'pointer',
        fontSize: Math.round(size * 0.5),
        padding: 0,
        transform: hovered && !disabled ? `scale(${hover_scale})` : 'scale(1)',
        transition: 'transform 0.1s ease',
        ...style,
      }}
    >
      ↻
    </button>
  );
}
