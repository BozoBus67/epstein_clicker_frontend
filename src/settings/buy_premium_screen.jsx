import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ACCOUNT_TIER_NAMES } from '../shared/constants';
import { tier_num } from '../shared/utils';
import { update_premium_game_data } from '../shared/store/sessionSlice';
import { api_buy_account_tier } from './api';
import { Back_Arrow_Button, Confirm_Modal, X_Button } from '../shared/components';
import { useTheme } from '../shared/theme';

const TIER_PERKS = {
  account_tier_1: [
    'Access to settings screen',
    'Access to music player',
  ],
  account_tier_2: [
    'Everything in Plus',
    'Gain the ability to close ads',
    'Access to the auction house',
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
    'Get my Discord',
  ],
  account_tier_6: [
    'Everything in Luxurious',
    'Enter the hall of fame of stupid people',
  ],
  account_tier_7: [
    'Why would you ever buy this',
  ],
  account_tier_8: [
    'Why would you ever buy this',
  ],
  account_tier_9: [
    'Why would you ever buy this',
  ],
};

const TIER_IMAGES = Object.fromEntries(
  Array.from({ length: 9 }, (_, i) => [
    `account_tier_${i + 1}`,
    new URL(`../assets/tier_images/tier_${i + 1}.svg`, import.meta.url).href,
  ])
);

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

  const theme = useTheme();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden',
      background: theme.bg, backgroundSize: theme.bg_size, backgroundPosition: theme.bg_position,
      color: theme.text,
    }}>
      <Buy_Premium_Screen_Topbar />
      <Buy_Premium_Screen_Body
        tiers={paid_tiers}
        current_tier={current_tier}
        on_select={set_selected}
      />
      {selected && (
        <Tier_Confirm_Modal
          tier={selected}
          on_confirm={handle_confirm}
          on_cancel={() => set_selected(null)}
          loading={loading}
        />
      )}
    </div>
  );
}

function Buy_Premium_Screen_Topbar() {
  return (
    <>
      <Back_Arrow_Button to="/game" />
      <X_Button to="/game" />
    </>
  );
}

function Buy_Premium_Screen_Body({ tiers, current_tier, on_select }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'row', alignItems: 'center',
      gap: '24px', padding: '80px 48px', overflowX: 'auto', height: '100%',
    }}>
      {tiers.map((tier) => (
        <Tier_Card
          key={tier.id}
          tier={tier}
          current_tier={current_tier}
          on_click={() => on_select(tier)}
        />
      ))}
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

function Tier_Confirm_Modal({ tier, on_confirm, on_cancel, loading }) {
  return (
    <Confirm_Modal
      title={`Buy ${ACCOUNT_TIER_NAMES[tier.id]}?`}
      info={`This will cost ${tier.token_price} tokens.`}
      yes_label="Confirm"
      no_label="Cancel"
      on_confirm={on_confirm}
      on_cancel={on_cancel}
      loading={loading}
    />
  );
}
