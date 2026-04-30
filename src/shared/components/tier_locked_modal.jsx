import { ACCOUNT_TIER_NAMES } from '../constants';
import { useEscapeKey } from '../hooks/useEscapeKey';

export default function Tier_Locked_Modal({ required_tier, on_close }) {
  useEscapeKey(on_close);
  const tier_name = ACCOUNT_TIER_NAMES[`account_tier_${required_tier}`];
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      <div style={{
        background: '#1e1e2e', border: '2px solid #facc15', borderRadius: '12px',
        padding: '32px', minWidth: '320px', textAlign: 'center', color: 'white',
      }}>
        <h2 style={{ color: '#facc15', marginBottom: '12px' }}>🔒 Locked</h2>
        <p style={{ margin: 0 }}>You must be {tier_name} tier or higher for this.</p>
        <button
          onClick={on_close}
          style={{
            marginTop: '20px', padding: '8px 24px', background: '#facc15',
            color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
