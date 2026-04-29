import { useState, useEffect } from 'react';
import { useEscapeKey } from '../shared/hooks/useEscapeKey';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Page_Header from '../shared/components/page_header';
import { api_create_listing, api_get_listings, api_buy_listing } from './api';
import { update_game_data, update_premium_game_data } from '../shared/store/sessionSlice';
import { CURRENCIES, opposite_currency } from './auction_house_constants';

const AUCTION_SLOT_COUNT = 8;

function Auction_Slot({ index, listing, on_click }) {
  const [hovered, set_hovered] = useState(false);

  const slot_style = {
    width: '200px', height: '160px', borderRadius: '10px', padding: '20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    boxSizing: 'border-box', flexShrink: 0,
  };

  if (!listing) {
    return (
      <div style={{ ...slot_style, background: '#1e1e2e', border: '2px solid #333', color: '#555', fontSize: '14px' }}>
        Auction slot {index + 1}
      </div>
    );
  }

  return (
    <button
      onClick={on_click}
      onMouseEnter={() => set_hovered(true)}
      onMouseLeave={() => set_hovered(false)}
      style={{
        ...slot_style,
        background: hovered ? '#252538' : '#1e1e2e',
        border: `2px solid ${hovered ? '#facc15' : '#444'}`,
        color: 'white',
        fontSize: '13px',
        cursor: 'pointer',
        gap: '8px',
        transition: 'all 0.1s ease',
        textAlign: 'center',
      }}
    >
      <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '14px' }}>
        {listing.seller_username}
      </span>
      <span>Selling: <b>{listing.amount} {listing.selling_item_type}</b></span>
      <span>Price: <b>{listing.price_item_amount} {listing.price_item_type}</b></span>
    </button>
  );
}

function Buy_Listing_Modal({ listing, on_close, on_bought }) {
  const dispatch = useDispatch();
  const [loading, set_loading] = useState(false);
  useEscapeKey(on_close, !loading);

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
      set_loading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: '#1e1e2e', border: '2px solid #facc15', borderRadius: '12px',
        padding: '32px', minWidth: '320px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
      }}>
        <h2 style={{ color: '#facc15', margin: 0, textAlign: 'center' }}>Buy Listing</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={on_close} disabled={loading}
            style={{ padding: '8px 28px', borderRadius: '6px', background: '#333', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            No
          </button>
          <button onClick={handle_buy} disabled={loading}
            style={{ padding: '8px 28px', borderRadius: '6px', background: '#facc15', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? '...' : 'Yes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Add_Auction_Button({ on_click }) {
  const [hovered, set_hovered] = useState(false);
  return (
    <button
      onClick={on_click}
      onMouseEnter={() => set_hovered(true)}
      onMouseLeave={() => set_hovered(false)}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '10px 20px',
        background: hovered ? '#facc15' : 'transparent',
        color: hovered ? '#000' : '#facc15',
        border: '2px solid #facc15',
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

function Create_Listing_Modal({ on_close }) {
  const dispatch = useDispatch();
  const game_data = useSelector(state => state.session.game_data);
  const premium_game_data = useSelector(state => state.session.premium_game_data);
  const [listing_type, set_listing_type] = useState('cookies');
  const [amount, set_amount] = useState('');
  const [price_type, set_price_type] = useState('tokens');
  const [price, set_price] = useState('');
  const [loading, set_loading] = useState(false);
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
        dispatch(update_game_data({ ...game_data, quantity: game_data.quantity - Number(amount) }));
      } else {
        dispatch(update_premium_game_data(data.premium_game_data));
      }
      toast.success('Listing created!');
      on_close();
    } catch (e) {
      toast.error(e?.detail || 'Something went wrong.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: '#1e1e2e', border: '2px solid #facc15', borderRadius: '12px',
        padding: '32px', minWidth: '320px', color: 'white', display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <h2 style={{ color: '#facc15', margin: 0 }}>New Listing</h2>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
          Selling
          <select value={listing_type} onChange={(e) => handle_listing_type_change(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', background: '#0f0f1a', color: 'white', border: '1px solid #444' }}>
            {CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
          Amount
          <input type="number" value={amount} onChange={(e) => set_amount(e.target.value)} placeholder="0"
            style={{ padding: '8px', borderRadius: '6px', background: '#0f0f1a', color: 'white', border: '1px solid #444' }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
          Asking for
          <select value={price_type} onChange={(e) => set_price_type(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', background: '#0f0f1a', color: 'white', border: '1px solid #444' }}>
            {CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
          Price
          <input type="number" value={price} onChange={(e) => set_price(e.target.value)} placeholder="0"
            style={{ padding: '8px', borderRadius: '6px', background: '#0f0f1a', color: 'white', border: '1px solid #444' }} />
        </label>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={on_close}
            style={{ padding: '8px 20px', borderRadius: '6px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handle_submit} disabled={loading}
            style={{ padding: '8px 20px', borderRadius: '6px', background: '#facc15', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Listing...' : 'List Auction'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Auction_House_Screen_Body({ listings, on_select }) {
  const slots = Array.from({ length: AUCTION_SLOT_COUNT }).map((_, i) => listings[i] ?? null);
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {slots.map((listing, i) => (
          <Auction_Slot key={i} index={i} listing={listing} on_click={() => listing && on_select(listing)} />
        ))}
      </div>
    </div>
  );
}

export default function Auction_House_Screen() {
  const [show_create_modal, set_show_create_modal] = useState(false);
  const [selected_listing, set_selected_listing] = useState(null);
  const [listings, set_listings] = useState([]);

  useEffect(() => {
    api_get_listings().then(set_listings).catch(console.error);
  }, []);

  const refresh = () => api_get_listings().then(set_listings).catch(console.error);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <Page_Header title="Auction House" />
      <Auction_House_Screen_Body listings={listings} on_select={set_selected_listing} />
      <button
        onClick={refresh}
        style={{ position: 'fixed', bottom: '24px', left: '24px', border: '1px solid gray', borderRadius: '50%', width: '32px', height: '32px', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '16px' }}
      >
        ↻
      </button>
      <Add_Auction_Button on_click={() => set_show_create_modal(true)} />
      {show_create_modal && <Create_Listing_Modal on_close={() => set_show_create_modal(false)} />}
      {selected_listing && <Buy_Listing_Modal listing={selected_listing} on_close={() => set_selected_listing(null)} on_bought={() => { set_selected_listing(null); refresh(); }} />}
    </div>
  );
}
