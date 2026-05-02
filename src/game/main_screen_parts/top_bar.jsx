import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Async_Refresh_Button, Nav_Button } from '../../shared/components';
import { ACCOUNT_TIER_NAMES } from '../../shared/constants';
import { useTierGate } from '../../shared/hooks';
import { useTheme } from '../../shared/theme';
import { refresh_user_data } from '../../shared/utils';
import Audio_Controls from '../../music';

export default function Top_Bar({ on_gamble_click, on_roulette_click }) {
  const theme = useTheme();
  return (
    <div style={{
      width: '100%',
      height: '60px',
      background: theme.name === 'light'
        ? 'linear-gradient(to bottom, rgba(255,236,179,0.95), rgba(245,210,140,0.95))'
        : 'linear-gradient(to bottom, #1c1c30, #141422)',
      borderBottom: `2px solid ${theme.panel_border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      padding: '0 12px',
      boxSizing: 'border-box',
      flexShrink: 0,
    }}>
      <Account_Refresh_Button />
      <Account_Tier_Display />
      <Token_Display />
      <Buy_Tokens_Button />
      <Nav_Button label="Buy Premium" to="/game/buy-premium" />
      <Nav_Button label="Gamble Tokens" on_click={on_gamble_click} />
      <Nav_Button label="Roulette" on_click={on_roulette_click} />
      <Nav_Button label="Redeem Tokens" to="/game/redeem-tokens" />
      <Nav_Button label="Mastery Scrolls" to="/game/mastery-scrolls" />
      <Auction_House_Nav_Button />
      <Nav_Button label="Play Chess" to="/game/play-chess" />
      <Audio_Controls />
    </div>
  );
}

function Account_Refresh_Button() {
  const dispatch = useDispatch();
  const theme = useTheme();

  return (
    <Async_Refresh_Button
      on_click={() => refresh_user_data(dispatch)}
      success_message="Reloaded account data and attempted account migration."
      error_message="Failed to reload account data."
      size={40}
      title="Reload account data"
      style={{
        border: `2px solid ${theme.accent}`,
        background: theme.accent,
        color: theme.accent_text ?? '#000',
        fontWeight: 'bold',
        boxShadow: `0 0 12px ${theme.accent}88, 0 2px 4px rgba(0,0,0,0.4)`,
      }}
    />
  );
}

function Account_Tier_Display() {
  const tier = useSelector(state => state.session.premium_game_data?.account_tier ?? null);
  const theme = useTheme();
  if (tier === null) return null;
  const name = ACCOUNT_TIER_NAMES[tier] ?? 'Free';
  return (
    <span style={{ fontWeight: 'bold', color: theme.accent, fontSize: '14px' }}>
      Account: {name}
    </span>
  );
}

function Token_Display() {
  const tokens = useSelector(state => state.session.premium_game_data?.tokens ?? null);
  const theme = useTheme();
  if (tokens === null) return null;
  return (
    <span style={{ fontWeight: 'bold', color: theme.accent, fontSize: '14px' }}>
      Tokens: {tokens.toLocaleString()}
    </span>
  );
}

function Buy_Tokens_Button() {
  const user_id = useSelector(state => state.session.session_data?.id);
  const handle_click = () => {
    const stripe_link = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    const url = `${stripe_link}?client_reference_id=${user_id}`;
    if (window.api?.openExternal) window.api.openExternal(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  };
  return <Nav_Button label="Buy Tokens" on_click={handle_click} />;
}

function Auction_House_Nav_Button() {
  const navigate = useNavigate();
  const { gate, lock_modal } = useTierGate(2);
  return (
    <>
      <Nav_Button label="Auction House" on_click={() => gate(() => navigate('/game/auction-house'))} />
      {lock_modal}
    </>
  );
}

