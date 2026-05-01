import { useSelector } from 'react-redux';
import { Building_Row } from '../buildings/buildings_components';
import cc_bg from '../../assets/game_screen/cookie_clicker_background_art.jpg';

export default function Buildings_Panel() {
  const buildings = useSelector(state => state.session.buildings);
  return (
    <div style={{ flex: '1 1 0', height: '100%', position: 'relative', background: '#000', borderLeft: '2px solid #facc15' }}>
      <img src={cc_bg} draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', height: '100%', paddingBottom: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {Object.keys(buildings).map(name => (
          <Building_Row key={name} name={name} />
        ))}
      </div>
    </div>
  );
}
