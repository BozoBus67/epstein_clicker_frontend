import { useTheme } from '../theme';

// Modal shell: full-screen dim backdrop + a centered themed card. Pass any
// content as `children`; pass `panel_style` to override the inner card's
// default styling (e.g. `width: 420px` for wider modals, `alignItems: center`
// for vertically-stacked content).
//
// Used by every "are you sure?" / form / reveal modal in the app. Click-to-
// dismiss is NOT built in — modals usually want explicit Cancel buttons and
// a useEscapeKey hook for keyboard dismissal, both of which the caller wires.
export default function Modal_Overlay({ children, panel_style }) {
  const theme = useTheme();
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: theme.panel,
        border: `2px solid ${theme.panel_border}`,
        borderRadius: '12px',
        padding: '32px',
        minWidth: '320px',
        color: theme.text,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        ...panel_style,
      }}>
        {children}
      </div>
    </div>
  );
}
