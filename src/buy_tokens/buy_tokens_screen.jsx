import { useSelector } from 'react-redux';
import Back_Arrow_Button from '../shared/components/back_arrow_button';

const STRIPE_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

export default function Buy_Tokens_Screen() {
  const user_id = useSelector(state => state.session.session_data?.id);

  const handle_buy = () => {
    window.api.openExternal(`${STRIPE_LINK}?client_reference_id=${user_id}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <Back_Arrow_Button to="/game" />
      <h1 style={{ color: '#facc15', margin: 0 }}>Buy Tokens</h1>
      <p style={{ color: '#aaa', margin: 0 }}>$1 per token — choose quantity on the next page</p>
      <button
        onClick={handle_buy}
        style={{
          padding: '10px 32px', background: '#facc15', color: '#000',
          border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
        }}
      >
        Buy Tokens
      </button>
    </div>
  );
}
