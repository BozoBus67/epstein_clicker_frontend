import { useState, useEffect } from 'react';
import * as Constants from '../../shared/constants';
import { useTierGate } from '../../shared/hooks';
import { useKirkifiedFace } from '../../shared/kirkified_faces';
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
  // Same Kirk-Mode-aware face logic the master-scroll cards use. When a
  // kirkified variant is missing, the helper returns the original AND sets
  // missing_kirkified so we surface the note in the ad-text caption.
  const { url: img_src, missing_kirkified } = useKirkifiedFace(ad);

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
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            background: 'rgba(0,0,0,0.65)', borderRadius: '6px', padding: '4px 12px',
            textAlign: 'center',
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>
              {Constants.AD_TEXT}
            </span>
            {missing_kirkified && (
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#ddd' }}>
                (this image was unable to be kirkified)
              </span>
            )}
          </div>
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
