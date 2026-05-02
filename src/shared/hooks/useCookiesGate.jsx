import { useState } from 'react';
import { useSelector } from 'react-redux';
import Cookies_Locked_Modal from '../components/cookies_locked_modal';

// Soft gate that requires the user to have at least `min` cookies (game_data.quantity)
// before running a callback. Mirrors `useTierGate` in shape: returns
// `{ gate, lock_modal }`. Render the modal alongside the gated buttons.
//
// Used to push fresh accounts to actually click the cookie a few times before
// they can hit the top-bar nav buttons. A determined user can hack their state
// to bypass it, but 1000 is low enough that the legit path is faster than
// reverse-engineering the Redux store.
export function useCookiesGate(min) {
  const quantity = useSelector(state => state.session.game_data?.quantity ?? 0);
  const [show_lock, set_show_lock] = useState(false);

  const gate = (callback) => {
    if (quantity >= min) callback();
    else set_show_lock(true);
  };

  const lock_modal = show_lock
    ? <Cookies_Locked_Modal min={min} have={quantity} on_close={() => set_show_lock(false)} />
    : null;

  return { gate, lock_modal };
}
