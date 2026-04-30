import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ACCOUNT_TIER_NAMES } from '../shared/constants';
import { tier_num } from '../shared/utils';
import { update_premium_game_data } from '../shared/store/sessionSlice';
import { api_buy_account_tier } from './api';

const TIER_PERKS = {
  account_tier_1: [
    'Access to settings screen',
    'Access to music player',
  ],
  account_tier_2: [
    'Everything in Plus',
    'Gain the ability to close ads',
    'Access to the trade market',
  ],
  account_tier_3: [
    'Everything in Pro',
    'Gain the ability to change your username',
    'Gain the ability to change your password',
    'Gain the ability to change your email',
  ],
  account_tier_4: [
    'Everything in Enterprise',
    'Gain the ability to adjust music volume',
    'Gain the ability to scramble music playlist',
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

function Confirm_Modal({ tier, on_confirm, on_cancel, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', padding: '32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', minWidth: '300px',
      }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Buy {ACCOUNT_TIER_NAMES[tier.id]}?</p>
        <p style={{ margin: 0, color: '#555' }}>This will cost {tier.token_price} tokens.</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={on_cancel}
            disabled={loading}
            className="bg-gray-300 text-black py-2 px-6 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={on_confirm}
            disabled={loading}
            className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-500 transition"
          >
            {loading ? 'Buying...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Tier_Card({ tier, current_tier, on_click }) {
  const perks = TIER_PERKS[tier.id] ?? [];
  const is_owned = tier_num(tier.id) <= current_tier;

  return (
    <div
      onClick={is_owned ? undefined : on_click}
      style={{
        width: '240px',
        height: '520px',
        border: `2px solid ${is_owned ? '#facc15' : '#ccc'}`,
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        gap: '12px',
        flexShrink: 0,
        background: '#ffffff',
        cursor: is_owned ? 'default' : 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        textAlign: 'left',
        opacity: 1,
        userSelect: 'none',
      }}
      className={is_owned ? '' : 'hover:scale-105 hover:shadow-xl'}
    >
      <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#111', width: '100%', textAlign: 'center' }}>
        {ACCOUNT_TIER_NAMES[tier.id]}
        {is_owned && <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>✓ Owned</span>}
      </div>
      <div style={{ fontSize: '14px', color: '#333', width: '100%', textAlign: 'center' }}>{tier.token_price} tokens</div>
      <img src={TIER_IMAGES[tier.id]} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
      <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
        <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {perks.map((perk, i) => (
            <li key={i} style={{ fontSize: '13px', color: '#222' }}>{perk}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Buy_Premium_Screen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const account_tiers = useSelector(state => state.session.account_tiers);
  const current_tier_str = useSelector(state => state.session.premium_game_data?.account_tier ?? 'account_tier_0');
  const current_tier = tier_num(current_tier_str);
  const paid_tiers = account_tiers.filter(t => t.id !== 'account_tier_0');

  const [selected, set_selected] = useState(null);
  const [loading, set_loading] = useState(false);

  useEffect(() => {
    const handle_key = (e) => {
      if (e.key === 'Escape') {
        if (selected) set_selected(null);
        else navigate('/game');
      }
    };
    window.addEventListener('keydown', handle_key);
    return () => window.removeEventListener('keydown', handle_key);
  }, [navigate, selected]);

  const handle_confirm = async () => {
    set_loading(true);
    try {
      const data = await api_buy_account_tier(selected.id);
      dispatch(update_premium_game_data(data.premium_game_data));
      toast.success(`Upgraded to ${ACCOUNT_TIER_NAMES[selected.id]}!`);
      set_selected(null);
    } catch (e) {
      toast.error(e?.message || 'Purchase failed.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <button
        onClick={() => navigate('/game')}
        style={{ position: 'fixed', top: '16px', left: '16px', border: '1px solid gray', borderRadius: '50%', width: '32px', height: '32px' }}
        className="text-gray-700 hover:text-gray-900 transition font-bold"
      >←</button>
      <button
        onClick={() => navigate('/game')}
        style={{ position: 'fixed', top: '16px', right: '16px', border: '1px solid gray', borderRadius: '50%', width: '32px', height: '32px' }}
        className="text-gray-700 hover:text-gray-900 transition font-bold"
      >✕</button>

      <div style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        gap: '24px', padding: '80px 48px', overflowX: 'auto', height: '100%',
      }}>
        {paid_tiers.map((tier) => (
          <Tier_Card
            key={tier.id}
            tier={tier}
            current_tier={current_tier}
            on_click={() => set_selected(tier)}
          />
        ))}
      </div>

      {selected && (
        <Confirm_Modal
          tier={selected}
          on_confirm={handle_confirm}
          on_cancel={() => set_selected(null)}
          loading={loading}
        />
      )}
    </div>
  );
}
