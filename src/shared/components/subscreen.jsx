import { useNavigate } from 'react-router-dom';
import { useEscapeKey } from '../hooks';
import { useTheme } from '../theme';
import Back_Arrow_Button from './back_arrow_button';
import Page_Header from './page_header';

// Standard frame for any screen nested under the main game screen. Bundles
// the two exit triggers users expect on a subscreen:
//
//   - Back-arrow button (top-left)
//   - Escape key
//
// Both route to `back_to`. Pass `disabled={true}` to skip the escape handler
// — useful while a request is in flight or a confirm modal is open (the
// screen handles escape for the modal first; once the modal closes,
// `disabled` flips back to false and Subscreen resumes its esc-to-back).
//
// Pass `title` to render a top header bar (back arrow + centered title).
// Omit `title` to leave just the floating back arrow — useful for screens
// like Settings that center their own body content vertically.
//
// `<Subscreen>` also renders the full-viewport themed container, so callers
// can drop the boilerplate `<div style={{display:'flex', height:'100vh', ...}}>`
// wrapper that every screen used to copy-paste.
//
// Historical note (see ./README.md): a top-right X button used to live here
// alongside the back arrow, intended for nested-2-deep flows where esc/back
// went up one level and X jumped to home. No flow ever needed that, so X was
// dropped. If a deeper flow appears later, resurrect `x_button.jsx` from git
// history (last in commit 3457f88) and add an opt-in `home_to` prop here.
export default function Subscreen({ title, back_to = '/game', disabled = false, children }) {
  const navigate = useNavigate();
  const theme = useTheme();
  useEscapeKey(() => navigate(back_to), !disabled);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden',
      background: theme.bg, backgroundSize: theme.bg_size, backgroundPosition: theme.bg_position, color: theme.text,
    }}>
      {title
        ? <Page_Header title={title} back_to={back_to} />
        : <Back_Arrow_Button to={back_to} />
      }
      {children}
    </div>
  );
}
