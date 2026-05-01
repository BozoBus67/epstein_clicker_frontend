// Auction House screen. Architecture overview, modal ownership, component
// list, and conventions live in ./README.md — read that first if you're new
// to this file.
import { useState, useEffect } from 'react';
import { useEscapeKey } from '../shared/hooks';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Async_Refresh_Button, Confirm_Modal, Modal_Overlay, Page_Header } from '../shared/components';
import { useTheme } from '../shared/theme';
import { api_create_listing, api_get_listings, api_buy_listing, api_cancel_listing } from './api';
import { increment_game_data_field, update_game_data, update_premium_game_data } from '../shared/store/sessionSlice';
import { CURRENCIES, opposite_currency } from './auction_house_utils';

export default function Auction_House_Screen() {
  const theme = useTheme();
  const [listings, set_listings] = useState([]);

  // Returns the underlying promise so each caller can choose its own error UX:
  //  • The Async_Refresh_Button wraps it in its own try/catch + toast.
  //  • The mount-time call below catches and toasts directly.
  //  • on_action_done callbacks fire after backend mutations and chain off this.
  const refresh = () => api_get_listings().then(set_listings);

  useEffect(() => {
    refresh().catch(e => toast.error(e?.detail || 'Failed to load listings.', { id: 'load-listings-error' }));
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh',
      background: theme.bg, backgroundSize: theme.bg_size, backgroundPosition: theme.bg_position, color: theme.text,
    }}>
      <Auction_House_Screen_Topbar />
      <Auction_House_Screen_Body listings={listings} on_action_done={refresh} />
      <Refresh_Listings_Button on_click={refresh} />
      <Create_Listing_Manager on_action_done={refresh} />
    </div>
  );
}

function Auction_House_Screen_Topbar() {
  return <Page_Header title="Auction House" />;
}

// Renders the listings grid AND owns the "which listing is selected" state plus the
// resulting cancel/buy modal. The screen passes in the listings + a refresh callback;
// nothing about selection leaks back up.
function Auction_House_Screen_Body({ listings, on_action_done }) {
  const username = useSelector(state => state.session.session_data?.username ?? '');
  const [selected, set_selected] = useState(null);

  const is_own = selected?.seller_username === username;
  const close = () => set_selected(null);
  const finish = () => { close(); on_action_done(); };

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {listings.map((listing, i) => (
            <Auction_Slot key={listing.id ?? i} listing={listing} on_click={() => set_selected(listing)} />
          ))}
        </div>
      </div>
      <Manage_Listing_Modal listing={selected} is_own={is_own} on_close={close} on_done={finish} />
    </>
  );
}

function Auction_Slot({ listing, on_click }) {
  const [hovered, set_hovered] = useState(false);
  const theme = useTheme();

  return (
    <button
      type="button"
      onClick={on_click}
      onMouseEnter={() => set_hovered(true)}
      onMouseLeave={() => set_hovered(false)}
      style={{
        width: '200px', height: '160px', borderRadius: '10px', padding: '20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box', flexShrink: 0,
        background: theme.panel,
        border: `2px solid ${hovered ? theme.accent : theme.panel_border}`,
        color: theme.text,
        fontSize: '13px',
        cursor: 'pointer',
        gap: '8px',
        transition: 'all 0.1s ease',
        textAlign: 'center',
      }}
    >
      <span style={{ color: theme.accent, fontWeight: 'bold', fontSize: '14px' }}>
        {listing.seller_username}
      </span>
      <span>Selling: <b>{listing.amount} {listing.selling_item_type}</b></span>
      <span>Price: <b>{listing.price_item_amount} {listing.price_item_type}</b></span>
    </button>
  );
}

function Refresh_Listings_Button({ on_click }) {
  return (
    <Async_Refresh_Button
      on_click={on_click}
      success_message="Listings refreshed."
      error_message="Failed to refresh listings."
      title="Refresh listings"
      style={{ position: 'fixed', bottom: '24px', left: '24px' }}
    />
  );
}

function Add_Auction_Button({ on_click }) {
  const [hovered, set_hovered] = useState(false);
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={on_click}
      onMouseEnter={() => set_hovered(true)}
      onMouseLeave={() => set_hovered(false)}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '10px 20px',
        background: hovered ? theme.accent : 'transparent',
        color: hovered ? theme.accent_text : theme.accent,
        border: `2px solid ${theme.accent}`,
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '14px',
        cursor: 'pointer',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.1s ease',
      }}
    >
      + Add Auction
    </button>
  );
}

// Owns the Add Auction trigger button + the create-listing modal + the open/close state.
// The screen mounts <Create_Listing_Manager /> once and forgets about it. After a
// successful create, on_action_done fires so the caller can refresh the listings grid.
function Create_Listing_Manager({ on_action_done }) {
  const [show, set_show] = useState(false);
  const close = () => set_show(false);
  const finish = () => { close(); on_action_done(); };
  return (
    <>
      <Add_Auction_Button on_click={() => set_show(true)} />
      {show && <Create_Listing_Modal on_close={close} on_created={finish} />}
    </>
  );
}

function Create_Listing_Modal({ on_close, on_created }) {
  const dispatch = useDispatch();
  const game_data = useSelector(state => state.session.game_data);
  const premium_game_data = useSelector(state => state.session.premium_game_data);
  const [listing_type, set_listing_type] = useState('cookies');
  const [amount, set_amount] = useState('');
  const [price_type, set_price_type] = useState('tokens');
  const [price, set_price] = useState('');
  const [loading, set_loading] = useState(false);
  const theme = useTheme();
  useEscapeKey(on_close, !loading);

  const handle_listing_type_change = (val) => {
    set_listing_type(val);
    set_price_type(opposite_currency(val));
  };

  const handle_submit = async () => {
    if (!amount || !price) { toast.error('Please fill in all fields.'); return; }
    set_loading(true);
    try {
      const data = await api_create_listing({ listing_type, amount: Number(amount), price_type, price: Number(price) });
      if (listing_type === 'cookies') {
        dispatch(increment_game_data_field({ key: 'quantity', amount: -Number(amount) }));
      } else {
        dispatch(update_premium_game_data(data.premium_game_data));
      }
      toast.success('Listing created!');
      on_created();
    } catch (e) {
      toast.error(e?.detail || 'Something went wrong.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <Modal_Overlay>
      <h2 style={{ color: theme.accent, margin: 0 }}>New Listing</h2>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
        Selling
        <select value={listing_type} onChange={(e) => handle_listing_type_change(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', background: theme.panel_secondary, color: theme.text, border: `1px solid ${theme.panel_border}` }}>
          {CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
        Amount
        <input type="number" value={amount} onChange={(e) => set_amount(e.target.value)} placeholder="0"
          style={{ padding: '8px', borderRadius: '6px', background: theme.panel_secondary, color: theme.text, border: `1px solid ${theme.panel_border}` }} />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
        Asking for
        <select value={price_type} onChange={(e) => set_price_type(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', background: theme.panel_secondary, color: theme.text, border: `1px solid ${theme.panel_border}` }}>
          {CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
        Price
        <input type="number" value={price} onChange={(e) => set_price(e.target.value)} placeholder="0"
          style={{ padding: '8px', borderRadius: '6px', background: theme.panel_secondary, color: theme.text, border: `1px solid ${theme.panel_border}` }} />
      </label>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={on_close}
          style={{ padding: '8px 20px', borderRadius: '6px', background: theme.button_neutral_bg, color: theme.button_neutral_text, border: 'none', cursor: 'pointer' }}>
          Cancel
        </button>
        <button type="button" onClick={handle_submit} disabled={loading}
          style={{ padding: '8px 20px', borderRadius: '6px', background: theme.accent, color: theme.accent_text, border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Listing...' : 'List Auction'}
        </button>
      </div>
    </Modal_Overlay>
  );
}

// Routes between the buy and cancel modals depending on whether the selected
// listing belongs to the current user. Returns null when no listing is selected.
function Manage_Listing_Modal({ listing, is_own, on_close, on_done }) {
  if (!listing) return null;
  return is_own
    ? <Cancel_Listing_Modal listing={listing} on_close={on_close} on_cancelled={on_done} />
    : <Buy_Listing_Modal    listing={listing} on_close={on_close} on_bought={on_done} />;
}

function Buy_Listing_Modal({ listing, on_close, on_bought }) {
  const dispatch = useDispatch();
  const [loading, set_loading] = useState(false);

  const handle_buy = async () => {
    set_loading(true);
    try {
      const data = await api_buy_listing(listing.id);
      dispatch(update_game_data(data.game_data));
      dispatch(update_premium_game_data(data.premium_game_data));
      toast.success('Purchase complete!');
      on_bought();
    } catch (e) {
      toast.error(e?.detail || 'Something went wrong.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <Confirm_Modal
      title="Buy Listing?"
      info={`You'll get ${listing.amount} ${listing.selling_item_type} for ${listing.price_item_amount} ${listing.price_item_type}.`}
      on_confirm={handle_buy}
      on_cancel={on_close}
      loading={loading}
    />
  );
}

function Cancel_Listing_Modal({ listing, on_close, on_cancelled }) {
  const dispatch = useDispatch();
  const [loading, set_loading] = useState(false);

  const handle_cancel = async () => {
    set_loading(true);
    try {
      const data = await api_cancel_listing(listing.id);
      dispatch(update_game_data(data.game_data));
      dispatch(update_premium_game_data(data.premium_game_data));
      toast.success('Listing cancelled, items refunded');
      on_cancelled();
    } catch (e) {
      toast.error(e?.detail || 'Something went wrong.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <Confirm_Modal
      title="Cancel Listing?"
      info={`You'll get back ${listing.amount} ${listing.selling_item_type}.`}
      on_confirm={handle_cancel}
      on_cancel={on_close}
      loading={loading}
      danger
    />
  );
}
