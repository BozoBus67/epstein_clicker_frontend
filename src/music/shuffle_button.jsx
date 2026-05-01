import toast from 'react-hot-toast';
import { shuffle_playlist } from './audio_state';
import { useTierGate } from '../shared/hooks';
import { useTheme } from '../shared/theme';

export default function Shuffle_Button() {
  const { gate, lock_modal } = useTierGate(4);
  const theme = useTheme();

  const handle_click = () => gate(() => {
    shuffle_playlist();
    toast.success('Playlist shuffled.');
  });

  return (
    <>
      <button
        type="button"
        onClick={handle_click}
        title="Shuffle playlist"
        className="hover:outline hover:outline-1 hover:cursor-pointer"
        style={{
          background: theme.accent,
          border: `1px solid ${theme.accent}`,
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
