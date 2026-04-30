import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { increase_cookies } from '../game_utils';
import { Building_Row } from '../buildings/buildings_components';
import * as Constants from '../../shared/constants';
import { useTierGate } from '../../shared/hooks/useTierGate';

const ad_modules = import.meta.glob('../../assets/clickbait_faces/*.png', { eager: true });
const ADS = Object.values(ad_modules).map(m => m.default);
import epstein from '../../assets/game_screen/epstein.png';
import temple from '../../assets/game_screen/epstein_island_temple_extended_sky.jpg';
import cc_bg from '../../assets/game_screen/cookie_clicker_background_art.jpg';

function Epstein_Head({ on_click }) {
  return (
    <button
      onClick={on_click}
      className="cursor-pointer transition-transform duration-100 hover:scale-[1.02] active:scale-[0.98]"
      style={{ width: '280px', height: '280px', borderRadius: '50%', overflow: 'hidden', display: 'block' }}
    >
      <img src={epstein} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
    </button>
  );
}

function Left_Part_Of_Screen() {
  const quantity = useSelector(state => state.session.game_data?.quantity ?? 0);
  const cps = useSelector(state => state.session.game_data?.cps ?? 0);
  const username = useSelector(state => state.session.session_data?.username ?? '');
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
            <p style={{ margin: 0, fontWeight: 'bold' }}>{Constants.QUANTITY_NAME}: {quantity}</p>
            <p style={{ margin: 0 }}>{Constants.QUANTITY_NAME} per second: {cps}</p>
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

const CORNERS = [
  { top: '8px', left: '8px' },
  { top: '8px', right: '8px' },
  { bottom: '8px', left: '8px' },
  { bottom: '8px', right: '8px' },
];

function random_next_index(current) {
  let next;
  do { next = Math.floor(Math.random() * ADS.length); } while (next === current);
  return next;
}

function Middle_Part_Of_Screen() {
  const { gate, lock_modal } = useTierGate(2);

  const [index, set_index] = useState(() => Math.floor(Math.random() * ADS.length));
  const [corner, set_corner] = useState(() => Math.floor(Math.random() * 4));
  const [dismissed, set_dismissed] = useState(false);

  const advance = () => {
    set_index(i => random_next_index(i));
    set_corner(Math.floor(Math.random() * 4));
    set_dismissed(false);
  };

  useEffect(() => {
    const interval = setInterval(advance, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      flex: '1 1 0', height: '100%', position: 'relative', overflow: 'hidden',
      backgroundImage: `url(${cc_bg})`, backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
    }}>
      {!dismissed && (
        <>
          <img
            key={index}
            src={ADS[index]}
            draggable={false}
            style={{ maxWidth: '80%', maxHeight: '65%', objectFit: 'contain', animation: 'ad-pulse 5s ease-in-out infinite' }}
          />
          <span style={{
            fontWeight: 'bold', fontSize: '15px', color: '#fff',
            background: 'rgba(0,0,0,0.65)', borderRadius: '6px', padding: '4px 12px',
            textAlign: 'center',
          }}>
            {Constants.AD_TEXT}
          </span>
        </>
      )}
      {!dismissed && (
        <button
          onClick={() => gate(() => set_dismissed(true))}
          style={{
            position: 'absolute', ...CORNERS[corner],
            background: 'rgba(0,0,0,0.6)', border: '1px solid #fff',
            color: '#fff', borderRadius: '4px', width: '24px', height: '24px',
            cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0,
          }}
        >
          ✕
        </button>
      )}
      {lock_modal}
    </div>
  );
}

function Right_Part_Of_Screen() {
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

export default function Main_Body() {
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Left_Part_Of_Screen />
      <Middle_Part_Of_Screen />
      <Right_Part_Of_Screen />
    </div>
  );
}
