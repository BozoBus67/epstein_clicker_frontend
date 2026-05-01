import { useEffect, useState } from 'react';

const STUCK_THRESHOLD_MS = 15_000;

export default function Loading_Screen() {
  // After STUCK_THRESHOLD_MS, surface a "still loading? refresh" affordance so
  // the user isn't pinned to this screen forever if a bootstrap fetch hangs.
  // The free-tier Render cold-start can take ~60s, so we don't auto-fail —
  // just give the user an explicit out.
  const [stuck, set_stuck] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => set_stuck(true), STUCK_THRESHOLD_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#1a1a2e',
      color: '#facc15',
      fontWeight: 'bold',
      fontSize: '18px',
      letterSpacing: '0.05em',
      gap: '12px',
      textAlign: 'center',
      padding: '0 24px',
    }}>
      <div>Restoring your session...</div>
      <div style={{ fontSize: '13px', fontWeight: 'normal', color: '#aaa', letterSpacing: 0, maxWidth: '480px', lineHeight: 1.4 }}>
        Validating your login and pulling your save data from the backend.
      </div>
      {stuck && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 'normal', color: '#aaa', letterSpacing: 0, maxWidth: '480px', lineHeight: 1.4 }}>
            Taking a while? The backend (Render) may be waking up from idle — that can take up to a minute on the free tier. If it doesn't load, try refreshing.
          </div>
          <button
            type="button"
            onClick={() => location.reload()}
            style={{
              padding: '8px 24px', background: '#facc15', color: '#000',
              border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
