import { useTheme } from '../theme';

// Reusable refresh icon button (↻). Defaults to a subtle look (text-color icon,
// panel-border outline, transparent fill). Pass `style` to position the button
// or override colors at the call site (e.g. accent border for prominence).
export default function Refresh_Button({
  on_click,
  disabled = false,
  size = 32,
  title = 'Refresh',
  style = {},
}) {
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={on_click}
      disabled={disabled}
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${theme.panel_border}`,
        background: 'transparent',
        color: theme.text,
        cursor: disabled ? 'default' : 'pointer',
        fontSize: Math.round(size * 0.5),
        ...style,
      }}
    >
      ↻
    </button>
  );
}
