import { useNavigate } from 'react-router-dom';

export default function Back_Arrow_Button({ to }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      style={{
        position: 'fixed', top: '16px', left: '16px',
        border: '2px solid #000', borderRadius: '50%', width: '32px', height: '32px',
        background: '#fff', color: '#000', fontWeight: 'bold',
        boxShadow: '0 0 0 2px rgba(255,255,255,0.6)', cursor: 'pointer',
      }}
    >
      ←
    </button>
  );
}
