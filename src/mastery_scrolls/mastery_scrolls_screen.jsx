import { useSelector } from 'react-redux';
import { useState, useRef } from 'react';
import Page_Header from '../shared/components/page_header';
import { SCROLL_NAMES, SCROLL_TIERS, SCROLL_DESCRIPTIONS } from '../shared/constants';

const face_modules = import.meta.glob('../assets/master_scroll_faces/*', { eager: true });
const FACES = Object.keys(face_modules).sort().map(k => face_modules[k].default);

function get_tier(count) {
  for (const { min, tier } of SCROLL_TIERS) {
    if (count >= min) return tier;
  }
  return 0;
}

function get_next_tier(count) {
  const sorted = [...SCROLL_TIERS].sort((a, b) => a.min - b.min);
  for (const { min, tier } of sorted) {
    if (count < min) return { needed: min, tier };
  }
  return null;
}

const TOOLTIP_W = 200;
const TOOLTIP_H = 50;
const GAP = 8;

function get_tooltip_style(rect) {
  const { top, bottom, left, right } = rect;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;

  if (top >= TOOLTIP_H + GAP)
    return { top: top - TOOLTIP_H - GAP, left: cx - TOOLTIP_W / 2 };
  if (bottom + TOOLTIP_H + GAP <= vh)
    return { top: bottom + GAP, left: cx - TOOLTIP_W / 2 };
  if (right + TOOLTIP_W + GAP <= vw)
    return { top: cy - TOOLTIP_H / 2, left: right + GAP };
  return { top: cy - TOOLTIP_H / 2, left: left - TOOLTIP_W - GAP };
}

function Scroll_Panel({ scroll_id, count, image }) {
  const display_name = SCROLL_NAMES[scroll_id];
  const description = SCROLL_DESCRIPTIONS[scroll_id];
  const tier = get_tier(count);
  const next = get_next_tier(count);
  const tier_color = tier > 0 ? '#facc15' : '#555';
  const [tooltip_pos, set_tooltip_pos] = useState(null);
  const card_ref = useRef(null);

  return (
    <div
      ref={card_ref}
      onMouseEnter={() => set_tooltip_pos(get_tooltip_style(card_ref.current.getBoundingClientRect()))}
      onMouseLeave={() => set_tooltip_pos(null)}
      style={{
        width: '180px', borderRadius: '10px', overflow: 'visible',
        background: '#1e1e2e', border: '2px solid #444',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', height: '180px', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
        <img src={image} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      </div>
      <div style={{
        padding: '10px 12px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '4px', textAlign: 'center', color: 'white',
      }}>
        <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '13px', lineHeight: 1.2 }}>{display_name}</span>
        <span style={{ fontSize: '12px' }}>Owned: <b>{count}</b></span>
        <span style={{ fontSize: '12px', color: tier_color }}>{tier > 0 ? `Tier ${tier}` : 'No tier'}</span>
        {next
          ? <span style={{ fontSize: '11px', color: '#888' }}>{count}/{next.needed} → Tier {next.tier}</span>
          : <span style={{ fontSize: '11px', color: '#facc15' }}>Max Tier</span>
        }
      </div>
      {tooltip_pos && (
        <div style={{
          position: 'fixed', top: tooltip_pos.top, left: tooltip_pos.left,
          background: 'rgba(0,0,0,0.9)', border: '1px solid #facc15', borderRadius: '6px',
          padding: '8px 12px', width: `${TOOLTIP_W}px`, textAlign: 'center',
          color: 'white', fontSize: '12px', pointerEvents: 'none', zIndex: 9999,
        }}>
          {description}
        </div>
      )}
    </div>
  );
}

function Mastery_Scrolls_Screen_Body({ premium_game_data, scrolls }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {Object.entries(scrolls).map(([id], i) => (
          <Scroll_Panel key={id} scroll_id={id} count={premium_game_data?.[id] ?? 0} image={FACES[i]} />
        ))}
      </div>
    </div>
  );
}

export default function Mastery_Scrolls_Screen() {
  const premium_game_data = useSelector(state => state.session.premium_game_data);
  const scrolls = useSelector(state => state.session.scrolls);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <Page_Header title="Mastery Scrolls" />
      <Mastery_Scrolls_Screen_Body premium_game_data={premium_game_data} scrolls={scrolls} />
    </div>
  );
}
