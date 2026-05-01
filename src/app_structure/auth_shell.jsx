import { Navigate, Route, Routes } from 'react-router-dom';
import { Login_Screen, Sign_Up_Screen } from '../auth';

// Renders all routes available to a logged-OUT user. App.jsx mounts this when
// `is_logged_in` is false; any URL that isn't /login or /signup falls through
// to the catch-all and redirects to /login.
export default function Auth_Shell() {
  return (
    <Routes>
      <Route path="/login" element={<Login_Screen />} />
      <Route path="/signup" element={<Sign_Up_Screen />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
