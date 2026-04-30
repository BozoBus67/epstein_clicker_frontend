import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ACCOUNT_TIER_NAMES } from '../shared/constants';

const TIER_PERKS = {
  account_tier_1: [
    '5 extra gamble slots per day',
    'Access to exclusive Plus badge',
    'Priority support',
    'Placeholder perk 4',
    'Placeholder perk 5',
  ],
  account_tier_2: [
    'Everything in Plus',
    '15 extra gamble slots per day',
    '2× token rewards',
    'Access to Pro badge',
    'Placeholder perk 5',
    'Placeholder perk 6',
  ],
  account_tier_3: [
    'Everything in Pro',
    'Unlimited gamble slots',
    '5× token rewards',
    'Enterprise badge',
    'Custom island name',
    'Placeholder perk 6',
    'Placeholder perk 7',
  ],
  account_tier_4: [
    'Everything in Enterprise',
    '10× token rewards',
    'Premium badge',
    'Exclusive skin pack',
    'Placeholder perk 5',
  ],
  account_tier_5: [
    'Everything in Premium',
    '25× token rewards',
    'Luxurious badge',
    'Gold card border',
    'Placeholder perk 5',
    'Placeholder perk 6',
  ],
  account_tier_6: [
    'Everything in Luxurious',
    '50× token rewards',
    'Jewish badge',
    'Offshore account UI skin',
    'Placeholder perk 5',
    'Placeholder perk 6',
    'Placeholder perk 7',
  ],
  account_tier_7: [
    'Everything in Jewish',
    '100× token rewards',
    'Jewish+ badge',
    'Placeholder perk 4',
    'Placeholder perk 5',
    'Placeholder perk 6',
  ],
  account_tier_8: [
    'Everything in Jewish+',
    '250× token rewards',
    'Jewish++ badge',
    'Placeholder perk 4',
    'Placeholder perk 5',
    'Placeholder perk 6',
    'Placeholder perk 7',
  ],
  account_tier_9: [
    'Everything in Jewish++',
    '1000× token rewards',
    'Jewish+++ badge',
    'Placeholder perk 4',
    'Placeholder perk 5',
    'Placeholder perk 6',
    'Placeholder perk 7',
    'Placeholder perk 8',
  ],
};

const TIER_IMAGES = Object.fromEntries(
  Array.from({ length: 9 }, (_, i) => [
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
  const perks = TIER_PERKS[tier.id] ?? [];
  return (
    <button
      onClick={() => {}}
      style={{
        minWidth: '240px',
        height: '520px',
        border: '1px solid #ccc',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        gap: '12px',
        flexShrink: 0,
        background: 'white',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        textAlign: 'left',
      }}
      className="hover:scale-105 hover:shadow-xl"
    >
      <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#111', width: '100%', textAlign: 'center' }}>{ACCOUNT_TIER_NAMES[tier.id]}</div>
      <div style={{ fontSize: '14px', color: '#333', width: '100%', textAlign: 'center' }}>{tier.token_price} tokens</div>
      <img src={TIER_IMAGES[tier.id]} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
      <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
        <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {perks.map((perk, i) => (
            <li key={i} style={{ fontSize: '13px', color: '#222' }}>{perk}</li>
          ))}
        </ul>
      </div>
    </button>
  );
}

export default function Buy_Premium_Screen() {
  const navigate = useNavigate();
  const account_tiers = useSelector(state => state.session.account_tiers);
  const paid_tiers = account_tiers.filter(t => t.id !== 'account_tier_0');

  useEffect(() => {
    const handle_key = (e) => {
      if (e.key === 'Escape') navigate('/game');
    };
    window.addEventListener('keydown', handle_key);
    return () => window.removeEventListener('keydown', handle_key);
  }, [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Back_Arrow_Button on_click={() => navigate('/game')} />
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
