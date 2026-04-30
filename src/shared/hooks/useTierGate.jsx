import { useState } from 'react';
import { useSelector } from 'react-redux';
import { tier_num } from '../utils';
import Tier_Locked_Modal from '../components/tier_locked_modal';

export function useTierGate(required_tier) {
  const tier = tier_num(useSelector(state => state.session.premium_game_data?.account_tier));
  const [show_lock, set_show_lock] = useState(false);

  const gate = (callback) => {
    if (tier >= required_tier) callback();
    else set_show_lock(true);
  };

  const lock_modal = show_lock
    ? <Tier_Locked_Modal required_tier={required_tier} on_close={() => set_show_lock(false)} />
    : null;

  return { gate, lock_modal };
}
