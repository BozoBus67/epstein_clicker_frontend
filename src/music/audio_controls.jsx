import Music_Player from './music_player';
import Volume_Control from './volume_control';
import Shuffle_Button from './shuffle_button';

export default function Audio_Controls() {
  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      <Music_Player />
      <Volume_Control />
      <Shuffle_Button />
    </div>
  );
}
