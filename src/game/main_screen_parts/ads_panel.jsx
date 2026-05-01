import { useState, useEffect } from 'react';
import * as Constants from '../../shared/constants';
import { useTierGate } from '../../shared/hooks';
import { AD_ROTATION_MS } from '../constants';
import { ADS, AD_CLOSE_BUTTON_CORNERS, random_next_ad_index } from './main_body_utils';
import cc_bg from '../../assets/game_screen/cookie_clicker_background_art.jpg';

export default function Ads_Panel() {
  const { gate, lock_modal } = useTierGate(2);

  const [index, set_index] = useState(() => Math.floor(Math.random() * ADS.length));
  const [corner, set_corner] = useState(() => Math.floor(Math.random() * AD_CLOSE_BUTTON_CORNERS.length));
  const [dismissed, set_dismissed] = useState(false);

  const advance = () => {
    set_index(i => random_next_ad_index(i));
    set_corner(Math.floor(Math.random() * AD_CLOSE_BUTTON_CORNERS.length));
    set_dismissed(false);
  };

  useEffect(() => {
    const interval = setInterval(advance, AD_ROTATION_MS);
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
          type="button"
          onClick={() => gate(() => set_dismissed(true))}
          style={{
            position: 'absolute', ...AD_CLOSE_BUTTON_CORNERS[corner],
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
