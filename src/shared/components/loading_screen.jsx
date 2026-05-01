export default function Loading_Screen() {
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
      <div>Loading...</div>
      <div style={{ fontSize: '13px', fontWeight: 'normal', color: '#aaa', letterSpacing: 0 }}>
        (this could take a while if this is your first time visiting, or you cleared cache)
      </div>
    </div>
  );
}
