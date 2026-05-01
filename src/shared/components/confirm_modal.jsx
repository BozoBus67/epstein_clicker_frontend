import { useEscapeKey } from '../hooks';
import { useTheme } from '../theme';
import Modal_Overlay from './modal_overlay';

// "Are you sure?" confirmation modal. With no props beyond the two callbacks
// it renders a centered prompt with default title, "No"/"Yes" buttons:
//
//   <Confirm_Modal on_confirm={fn} on_cancel={fn} />
//
// Customize as needed:
//   title="Buy Listing?"        — replaces the default "Are you sure?" header
//   info="You'll get X for Y."  — optional info paragraph below the title
//   yes_label="Confirm"         — defaults to "Yes"
//   no_label="Cancel"           — defaults to "No"
//   loading={true}              — disables both buttons, shows '...' on Yes
//   danger={true}               — Yes button red instead of accent-themed
//
// Escape key triggers on_cancel (suppressed while loading).
export default function Confirm_Modal({
  title = 'Are you sure?',
  info,
  yes_label = 'Yes',
  no_label = 'No',
  on_confirm,
  on_cancel,
  loading = false,
  danger = false,
}) {
  const theme = useTheme();
  useEscapeKey(on_cancel, !loading);

  const yes_bg = danger ? '#ef4444' : theme.accent;
  const yes_color = danger ? 'white' : theme.accent_text;

  return (
    <Modal_Overlay panel_style={{ alignItems: 'center', gap: '16px' }}>
      <h2 style={{ color: theme.accent, margin: 0, textAlign: 'center' }}>{title}</h2>
      {info && (
        <p style={{ margin: 0, textAlign: 'center', color: theme.text_muted }}>{info}</p>
      )}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={on_cancel}
          disabled={loading}
          style={{ padding: '8px 28px', borderRadius: '6px', background: theme.button_neutral_bg, color: theme.button_neutral_text, border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {no_label}
        </button>
        <button
          type="button"
          onClick={on_confirm}
          disabled={loading}
          style={{ padding: '8px 28px', borderRadius: '6px', background: yes_bg, color: yes_color, border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? '...' : yes_label}
        </button>
      </div>
    </Modal_Overlay>
  );
}
