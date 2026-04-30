import Music_Player from '../../game/main_screen_parts/music_player';
import Volume_Control from '../../game/main_screen_parts/volume_control';
import Shuffle_Button from '../../game/main_screen_parts/shuffle_button';

export default function Audio_Controls() {
  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      <Music_Player />
      <Volume_Control />
      <Shuffle_Button />
    </div>
  );
}
