import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as Constants from '../../shared/constants';
import { useTierGate } from '../../shared/hooks';
import { AD_ROTATION_MS } from '../constants';
import { ADS, AD_CLOSE_BUTTON_CORNERS, random_next_ad_index } from './main_body_utils';
import cc_bg from '../../assets/game_screen/cookie_clicker_background_art.jpg';

export default function Ads_Panel() {
  const { gate, lock_modal } = useTierGate(2);
  const kirk_mode = useSelector(state => state.session.premium_game_data?.kirk_mode ?? false);

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

  // Preload + force-decode every ad image at mount (both originals and
  // kirkified variants). Without this, each rotation has to fetch (cache
  // miss the first time) and synchronously decode the new image on the
  // main thread — visible as a brief stutter in the cps counter and any
  // other animation. With it, subsequent swaps are essentially free.
  useEffect(() => {
    for (const ad of ADS) {
      const a = new Image();
      a.src = ad.original;
      if (ad.kirkified) {
        const b = new Image();
        b.src = ad.kirkified;
      }
    }
  }, []);

  const ad = ADS[index];
  // If Kirk Mode is on AND this ad has a kirkified variant, swap to it.
  // If Kirk Mode is on but this ad has no kirkified counterpart, fall back
  // to the original AND surface a note in the ad-text caption.
  const use_kirkified = kirk_mode && !!ad.kirkified;
  const missing_kirkified = kirk_mode && !ad.kirkified;
  const img_src = use_kirkified ? ad.kirkified : ad.original;

  return (
    <div style={{
      flex: '1 1 0', height: '100%', position: 'relative', overflow: 'hidden',
      backgroundImage: `url(${cc_bg})`, backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
    }}>
      {!dismissed && (
        <>
          <img
            src={img_src}
            draggable={false}
            decoding="async"
            style={{ maxWidth: '80%', maxHeight: '65%', objectFit: 'contain', animation: 'ad-pulse 5s ease-in-out infinite' }}
          />
          <span style={{
            fontWeight: 'bold', fontSize: '15px', color: '#fff',
            background: 'rgba(0,0,0,0.65)', borderRadius: '6px', padding: '4px 12px',
            textAlign: 'center',
          }}>
            {Constants.AD_TEXT}
            {missing_kirkified && ' (this image was unable to be kirkified)'}
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
