import { shuffle_playlist } from '../../shared/audio_state';
import { useTierGate } from '../../shared/hooks';

export default function Shuffle_Button() {
  const { gate, lock_modal } = useTierGate(4);
  return (
    <>
      <button
        onClick={() => gate(shuffle_playlist)}
        title="Shuffle playlist"
        className="hover:outline hover:outline-1 hover:outline-yellow-400 hover:cursor-pointer"
        style={{
          background: '#facc15',
          border: '1px solid #facc15',
          fontSize: '16px',
          lineHeight: 1,
          padding: '4px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        🔀
      </button>
      {lock_modal}
    </>
  );
}
