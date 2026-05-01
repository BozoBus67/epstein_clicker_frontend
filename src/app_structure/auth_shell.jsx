import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Login_Screen, Sign_Up_Screen } from '../auth';

// Renders all routes available to a logged-OUT user. App.jsx mounts this when
// `is_logged_in` is false; any URL that isn't /login or /signup falls through
// to the catch-all (Auth_Default_Redirect), which picks /signup vs /login
// based on where the user came from — see the comment on that component.
export default function Auth_Shell() {
  return (
    <Routes>
      <Route path="/login" element={<Login_Screen />} />
      <Route path="/signup" element={<Sign_Up_Screen />} />
      <Route path="*" element={<Auth_Default_Redirect />} />
    </Routes>
  );
}

// Picks the right default landing screen based on the URL we landed at:
//
//   - `/` (root) → first-time visitor opening the app fresh → /signup, since
//     signup is the natural default for a brand-new user.
//   - anything else (typically `/game/...` after a logout) → /login, since the
//     user clearly already has an account.
//
// This is what makes "logout from /game/settings goes to /login" work: when
// dispatch(logout) flips is_logged_in to false, Auth_Shell mounts at the
// current URL (`/game/settings`), the catch-all fires, and we end up here
// with that URL, so we route to /login. No explicit navigate in the logout
// handler is needed.
function Auth_Default_Redirect() {
  const { pathname } = useLocation();
  const came_from_root = pathname === '/' || pathname === '';
  return <Navigate to={came_from_root ? '/signup' : '/login'} replace />;
}
