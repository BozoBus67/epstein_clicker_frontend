import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Music_Player from './music_player';
import { api_me } from '../../auth/api';
import { update_game_data, update_premium_game_data } from '../../shared/store/sessionSlice';

export async function refresh_user_data(jwt, dispatch) {
  const data = await api_me(jwt);
  dispatch(update_game_data(data.user.game_data));
  dispatch(update_premium_game_data(data.user.premium_game_data));
}

function Refresh_Button() {
  const dispatch = useDispatch();
  const jwt = useSelector(state => state.session.jwt);
  const [loading, set_loading] = useState(false);

  const handle = async () => {
    set_loading(true);
    try { await refresh_user_data(jwt, dispatch); }
    finally { set_loading(false); }
  };

  return (
    <button
      onClick={handle}
      disabled={loading}
      style={{ border: '1px solid #facc15', borderRadius: '50%', width: '28px', height: '28px', background: 'transparent', color: '#facc15', cursor: 'pointer', fontSize: '15px' }}
    >
      ↻
    </button>
  );
}

function Token_Display() {
  const tokens = useSelector(state => state.session.premium_game_data?.tokens ?? null);
  if (tokens === null) return null;
  return (
    <span style={{ fontWeight: 'bold', color: '#facc15', fontSize: '14px' }}>
      Tokens: {tokens}
    </span>
  );
}

function Nav_Button({ label, to, on_click }) {
  const navigate = useNavigate();
  const [hovered, set_hovered] = useState(false);

  return (
    <button
      onClick={on_click ?? (() => navigate(to))}
      onMouseEnter={() => set_hovered(true)}
      onMouseLeave={() => set_hovered(false)}
      style={{
        padding: '4px 12px',
        border: '1px solid #facc15',
        borderRadius: '6px',
        background: '#facc15',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '13px',
        cursor: 'pointer',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.1s ease',
      }}
    >
      {label}
    </button>
  );
}

export default function Top_Bar({ on_gamble_click }) {
  return (
    <div style={{
      width: '100%',
      height: '60px',
      background: 'linear-gradient(to bottom, #1c1c30, #141422)',
      borderBottom: '2px solid #facc15',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      padding: '0 12px',
      boxSizing: 'border-box',
      flexShrink: 0,
    }}>
      <Token_Display />
      <Refresh_Button />
      <Nav_Button label="Gamble Tokens" on_click={on_gamble_click} />
      <Nav_Button label="Mastery Scrolls" to="/game/mastery-scrolls" />
      <Nav_Button label="Auction House" to="/game/auction-house" />
      <Nav_Button label="Redeem Tokens" to="/game/redeem-tokens" />
      <Nav_Button label="Buy Tokens" to="/game/buy-tokens" />
      <Nav_Button label="Buy Premium" to="/game/buy-premium" />
      <Music_Player />
    </div>
  );
}
