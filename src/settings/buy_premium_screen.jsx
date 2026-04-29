import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ACCOUNT_TIER_NAMES } from '../shared/constants';

const TIER_IMAGES = Object.fromEntries(
  Array.from({ length: 6 }, (_, i) => [
    `account_tier_${i + 1}`,
    new URL(`../assets/tier_images/tier_${i + 1}.svg`, import.meta.url).href,
  ])
);

function Back_Arrow_Button({ on_click }) {
  return (
    <button
      onClick={on_click}
      style={{ position: 'fixed', top: '16px', left: '16px', border: '1px solid gray', borderRadius: '50%', width: '32px', height: '32px' }}
      className="text-gray-700 hover:text-gray-900 transition font-bold"
    >
      ←
    </button>
  );
}

function X_Button({ on_click }) {
  return (
    <button
      onClick={on_click}
      style={{ position: 'fixed', top: '16px', right: '16px', border: '1px solid gray', borderRadius: '50%', width: '32px', height: '32px' }}
      className="text-gray-700 hover:text-gray-900 transition font-bold"
    >
      ✕
    </button>
  );
}

function Tier_Card({ tier }) {
  return (
    <button
      onClick={() => {}}
      style={{
        minWidth: '220px',
        height: '340px',
        border: '1px solid #ccc',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        gap: '16px',
        flexShrink: 0,
        background: 'white',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      className="hover:scale-105 hover:shadow-xl"
    >
      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{ACCOUNT_TIER_NAMES[tier.id]}</div>
      <div style={{ fontSize: '14px', color: '#666' }}>{tier.token_price} tokens</div>
      <img src={TIER_IMAGES[tier.id]} style={{ flex: 1, width: '100%', objectFit: 'cover', borderRadius: '8px' }} />
    </button>
  );
}

export default function Buy_Premium_Screen() {
  const navigate = useNavigate();
  const account_tiers = useSelector(state => state.session.account_tiers);
  const paid_tiers = account_tiers.filter(t => t.id !== 'account_tier_0');

  useEffect(() => {
    const handle_key = (e) => {
      if (e.key === 'Escape') navigate('/game/settings');
    };
    window.addEventListener('keydown', handle_key);
    return () => window.removeEventListener('keydown', handle_key);
  }, [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Back_Arrow_Button on_click={() => navigate('/game/settings')} />
      <X_Button on_click={() => navigate('/game')} />

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '24px',
        padding: '80px 48px',
        overflowX: 'auto',
        height: '100%',
      }}>
        {paid_tiers.map((tier) => (
          <Tier_Card key={tier.id} tier={tier} />
        ))}
      </div>
    </div>
  );
}
