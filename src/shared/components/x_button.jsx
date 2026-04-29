import { useNavigate } from 'react-router-dom';

export default function X_Button({ to }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      style={{ position: 'fixed', top: '16px', right: '16px', border: '1px solid gray', borderRadius: '50%', width: '32px', height: '32px' }}
      className="text-gray-700 hover:text-gray-900 transition font-bold"
    >
      ✕
    </button>
  );
}
