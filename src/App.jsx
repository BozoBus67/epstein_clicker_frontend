import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { login, set_account_tiers, set_buildings, set_scrolls } from './shared/store/sessionSlice';
import { get } from './shared/api_client';
import { supabase } from './shared/supabase_client';
import { Loading_Screen, Error_Boundary } from './shared/components';
import { api_me, Login_Screen, Sign_Up_Screen } from './auth';
import { Main_Screen } from './game';
import { Settings_Screen, Buy_Premium_Screen, Login_Details_Screen } from './settings';
import { Auction_House_Screen } from './auction_house';
import { Mastery_Scrolls_Screen } from './mastery_scrolls';
import { Redeem_Tokens_Screen } from './redeem';
import { Buy_Tokens_Screen } from './buy_tokens';
import { Chess_Screen } from './chess';

function Protected({ children }) {
  const is_logged_in = useSelector(state => state.session.is_logged_in);
  return is_logged_in ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const dispatch = useDispatch();
  const is_logged_in = useSelector(state => state.session.is_logged_in);
  const [checking_session, set_checking_session] = useState(true);

  useEffect(() => {
    const restore_session = async () => {
      const [{ data: { session } }, account_tiers, buildings, scrolls] = await Promise.all([
        supabase.auth.getSession(),
        get('/account_tiers'),
        get('/get_building_metadata'),
        get('/get_scroll_metadata'),
      ]);
      dispatch(set_account_tiers(account_tiers));
      dispatch(set_buildings(buildings));
      dispatch(set_scrolls(scrolls));
      if (session) {
        try {
          const data = await api_me(session.access_token);
          dispatch(login({ user: data.user, token: session.access_token }));
        } catch {
          await supabase.auth.signOut();
        }
      }
      set_checking_session(false);
    };
    restore_session();
  }, []);

  if (checking_session) return <Loading_Screen />;

  return (
    <HashRouter>
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1e1e2e', color: 'white', border: '1px solid #444' } }} />
      <Error_Boundary>
      <Routes>
        <Route path="/login" element={is_logged_in ? <Navigate to="/game" replace /> : <Login_Screen />} />
        <Route path="/signup" element={is_logged_in ? <Navigate to="/game" replace /> : <Sign_Up_Screen />} />
        <Route path="/game" element={<Protected><Main_Screen /></Protected>} />
        <Route path="/game/settings" element={<Protected><Settings_Screen /></Protected>} />
        <Route path="/game/settings/login-details" element={<Protected><Login_Details_Screen /></Protected>} />
        <Route path="/game/buy-premium" element={<Protected><Buy_Premium_Screen /></Protected>} />
        <Route path="/game/auction-house" element={<Protected><Auction_House_Screen /></Protected>} />
        <Route path="/game/mastery-scrolls" element={<Protected><Mastery_Scrolls_Screen /></Protected>} />
        <Route path="/game/redeem-tokens" element={<Protected><Redeem_Tokens_Screen /></Protected>} />
        <Route path="/game/buy-tokens" element={<Protected><Buy_Tokens_Screen /></Protected>} />
        <Route path="/game/play-chess" element={<Protected><Chess_Screen /></Protected>} />
        <Route path="*" element={<Navigate to={is_logged_in ? '/game' : '/login'} replace />} />
      </Routes>
      </Error_Boundary>
    </HashRouter>
  );
}
