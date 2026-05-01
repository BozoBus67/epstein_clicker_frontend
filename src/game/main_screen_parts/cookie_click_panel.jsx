import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as Constants from '../../shared/constants';
import { useAnimatedQuantity } from '../../shared/hooks';
import { increase_cookies } from '../game_utils';
import epstein from '../../assets/game_screen/epstein.png';
import temple from '../../assets/game_screen/epstein_island_temple_extended_sky.jpg';

export default function Cookie_Click_Panel() {
  const quantity = useSelector(state => state.session.game_data?.quantity ?? 0);
  const cps = useSelector(state => state.session.game_data?.cps ?? 0);
  const username = useSelector(state => state.session.session_data?.username ?? '');
  const displayed_quantity = useAnimatedQuantity(quantity, cps);

  const [particles, set_particles] = useState([]);
  const panel_ref = useRef(null);

  const handle_click = (e) => {
    increase_cookies();
    const rect = panel_ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const new_particles = Array.from({ length: 3 }, () => ({
      id: Math.random(),
      x,
      y,
      dx: (Math.random() - 0.5) * 140,
    }));
    set_particles(p => [...p, ...new_particles]);
  };

  const remove_particle = (id) => set_particles(p => p.filter(p => p.id !== id));

  return (
    <div ref={panel_ref} style={{ flex: '1 1 0', height: '100%', position: 'relative', background: '#fff', borderRight: '2px solid #facc15' }}>
      <img src={temple} draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', textAlign: 'center', width: '100%', paddingTop: '10px' }}>
        <div style={{ position: 'absolute', top: '110px', left: '50%', transform: 'translateX(-50%)', zIndex: 0 }}>
          <Epstein_Head on_click={handle_click} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 'bold', fontSize: '26px', background: 'rgba(0,0,0,0.6)', borderRadius: '6px', padding: '4px 10px', display: 'inline-block' }}>{username}'s {Constants.BAKERY_SUBSTITUDE_NAME}</p>
          <div style={{ background: 'rgba(0,0,0,0.6)', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{Constants.QUANTITY_NAME}: {displayed_quantity.toLocaleString()}</p>
            <p style={{ margin: 0 }}>{Constants.QUANTITY_NAME} per second: {cps.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {particles.map(p => (
        <div
          key={p.id}
          onAnimationEnd={() => remove_particle(p.id)}
          style={{
            position: 'absolute', left: p.x - 20, top: p.y - 20,
            width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
            pointerEvents: 'none', zIndex: 20,
            '--dx': `${p.dx}px`,
            animation: 'epstein-particle 0.8s ease-out forwards',
          }}
        >
          <img src={epstein} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        </div>
      ))}
    </div>
  );
}

function Epstein_Head({ on_click }) {
  return (
    <button
      type="button"
      onClick={on_click}
      className="cursor-pointer transition-transform duration-100 hover:scale-[1.02] active:scale-[0.98]"
      style={{ width: '280px', height: '280px', borderRadius: '50%', overflow: 'hidden', display: 'block' }}
    >
      <img src={epstein} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
    </button>
  );
}
