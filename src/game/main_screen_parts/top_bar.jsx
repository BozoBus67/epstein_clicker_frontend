import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Async_Refresh_Button, Modal_Overlay, Nav_Button } from '../../shared/components';
import { ACCOUNT_TIER_NAMES } from '../../shared/constants';
import { useEscapeKey, useTierGate } from '../../shared/hooks';
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
      size={34}
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
  const [show_modal, set_show_modal] = useState(false);
  return (
    <>
      <Nav_Button label="Buy Tokens" on_click={() => set_show_modal(true)} />
      {show_modal && <Buy_Tokens_Confirm_Modal on_close={() => set_show_modal(false)} />}
    </>
  );
}

// Honour-system disclaimer gate before kicking the user out to Stripe. Mirrors
// the Promotion_Oath_Modal pattern in redeem/redeem_tokens_screen.jsx — the
// "Buy tokens" button is always pressable; clicking without the box checked
// surfaces an inline red error rather than being disabled, so the user knows
// WHY nothing happened.
function Buy_Tokens_Confirm_Modal({ on_close }) {
  const user_id = useSelector(state => state.session.session_data?.id);
  const theme = useTheme();
  const [agreed, set_agreed] = useState(false);
  const [error, set_error] = useState('');
  useEscapeKey(on_close);

  const handle_buy = () => {
    if (!agreed) {
      set_error('You must agree to the terms and conditions.');
      return;
    }
    const stripe_link = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    const url = `${stripe_link}?client_reference_id=${user_id}`;
    if (window.api?.openExternal) window.api.openExternal(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
    on_close();
  };

  return (
    <Modal_Overlay panel_style={{ width: '480px' }}>
      <h2 style={{ color: theme.accent, margin: 0, textAlign: 'center' }}>Buy Tokens</h2>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', color: theme.text, fontSize: '14px', lineHeight: 1.4 }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => set_agreed(e.target.checked)}
          style={{ marginTop: '4px', flexShrink: 0 }}
        />
        <span>
          I admit that I am about to spend real money to buy fictional tokens on a random crud app called literally Epstein Clicker. I make bad financial decisions and the creator of this game is not responsible if I go bankrupt.
        </span>
      </label>
      {error && (
        <p style={{ color: '#f87171', margin: 0, fontSize: '14px', textAlign: 'center' }}>{error}</p>
      )}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handle_buy}
          style={{
            padding: '8px 24px', background: theme.accent, color: theme.accent_text,
            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
          }}
        >
          Buy Tokens
        </button>
        <button
          type="button"
          onClick={on_close}
          style={{
            padding: '8px 24px', background: theme.button_neutral_bg, color: theme.button_neutral_text,
            border: 'none', borderRadius: '6px', cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </Modal_Overlay>
  );
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

