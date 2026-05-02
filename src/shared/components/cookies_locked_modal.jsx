import { QUANTITY_NAME } from '../constants';
import { useEscapeKey } from '../hooks/useEscapeKey';
import Modal_Overlay from './modal_overlay';
import { useTheme } from '../theme';

export default function Cookies_Locked_Modal({ min, have, on_close }) {
  const theme = useTheme();
  useEscapeKey(on_close);
  return (
    <Modal_Overlay panel_style={{ alignItems: 'center', textAlign: 'center', minWidth: '320px' }}>
      <h2 style={{ color: theme.accent, margin: 0 }}>🔒 Locked</h2>
      <p style={{ margin: 0 }}>
        You need at least {min.toLocaleString()} {QUANTITY_NAME} to use this. You have {have.toLocaleString()}.
      </p>
      <button
        type="button"
        onClick={on_close}
        style={{
          marginTop: '8px', padding: '8px 24px', background: theme.accent,
          color: theme.accent_text, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
        }}
      >
        OK
      </button>
    </Modal_Overlay>
  );
}
