import { Navigate, Route, Routes } from 'react-router-dom';
import { Auction_House_Screen } from '../auction_house';
import { Chess_Game_Screen, Chess_Screen } from '../chess';
import { Main_Screen } from '../game';
import { Mastery_Scrolls_Screen } from '../mastery_scrolls';
import { Redeem_Tokens_Screen } from '../redeem';
import { Buy_Premium_Screen, Login_Details_Screen, Settings_Screen } from '../settings';

// Renders all routes available to a logged-IN user. App.jsx mounts this when
// `is_logged_in` is true; any URL that isn't a known game route falls through
// to the catch-all and redirects to /game.
export default function Game_Shell() {
  return (
    <Routes>
      <Route path="/game" element={<Main_Screen />} />
      <Route path="/game/settings" element={<Settings_Screen />} />
      <Route path="/game/settings/login-details" element={<Login_Details_Screen />} />
      <Route path="/game/buy-premium" element={<Buy_Premium_Screen />} />
      <Route path="/game/auction-house" element={<Auction_House_Screen />} />
      <Route path="/game/mastery-scrolls" element={<Mastery_Scrolls_Screen />} />
      <Route path="/game/redeem-tokens" element={<Redeem_Tokens_Screen />} />
      <Route path="/game/play-chess" element={<Chess_Screen />} />
      <Route path="/game/play-chess/:bot_id" element={<Chess_Game_Screen />} />
      <Route path="*" element={<Navigate to="/game" replace />} />
    </Routes>
  );
}
