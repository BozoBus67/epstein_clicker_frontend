import Error_Boundary from './error_boundary';

export default function Section({ name, fill, children }) {
  return (
    <Error_Boundary fallback={msg => <Section_Fallback label={name} message={msg} fill={fill} />}>
      {children}
    </Error_Boundary>
  );
}

function Section_Fallback({ label, message, fill }) {
  return (
    <div style={{
      ...(fill ? { flex: 1 } : { padding: '12px 16px' }),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#2a1414', borderBottom: '2px solid #ef4444',
      color: '#ffcccc', fontSize: '13px', textAlign: 'center', gap: '8px',
    }}>
      <span style={{ fontWeight: 'bold' }}>⚠️ {label} crashed:</span>
      <span style={{ color: '#aaa' }}>{message}</span>
    </div>
  );
}
