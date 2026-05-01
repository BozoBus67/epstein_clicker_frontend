import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Page_Header } from '../shared/components';
import { SCROLL_NAMES, SCROLL_DESCRIPTIONS } from '../shared/constants';
import { SCROLL_FACES } from '../shared/scroll_faces';
import { useTheme } from '../shared/theme';
import { TOOLTIP_W, get_tier, get_next_tier, get_tooltip_style } from './utils';

export default function Mastery_Scrolls_Screen() {
  const premium_game_data = useSelector(state => state.session.premium_game_data);
  const scrolls = useSelector(state => state.session.scrolls);
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh',
      background: theme.bg, backgroundSize: theme.bg_size, backgroundPosition: theme.bg_position, color: theme.text,
    }}>
      <Mastery_Scrolls_Screen_Topbar />
      <Mastery_Scrolls_Screen_Body premium_game_data={premium_game_data} scrolls={scrolls} />
    </div>
  );
}

function Mastery_Scrolls_Screen_Topbar() {
  return <Page_Header title="Mastery Scrolls" />;
}

function Mastery_Scrolls_Screen_Body({ premium_game_data, scrolls }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {Object.entries(scrolls).map(([id], i) => (
          <Scroll_Panel key={id} scroll_id={id} count={premium_game_data?.[id] ?? 0} image={SCROLL_FACES[i]} />
        ))}
      </div>
    </div>
  );
}

function Scroll_Panel({ scroll_id, count, image }) {
  const display_name = SCROLL_NAMES[scroll_id];
  const description = SCROLL_DESCRIPTIONS[scroll_id];
  const tier = get_tier(count);
  const next = get_next_tier(count);
  const theme = useTheme();
  const tier_color = tier > 0 ? theme.accent : theme.text_muted;
  const [tooltip_pos, set_tooltip_pos] = useState(null);
  const card_ref = useRef(null);

  return (
    <div
      ref={card_ref}
      onMouseEnter={() => set_tooltip_pos(get_tooltip_style(card_ref.current.getBoundingClientRect()))}
      onMouseLeave={() => set_tooltip_pos(null)}
      style={{
        width: '180px', borderRadius: '10px', overflow: 'visible',
        background: theme.panel, border: '2px solid #000',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', height: '180px', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
        <img src={image} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      </div>
      <div style={{
        padding: '10px 12px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '4px', textAlign: 'center', color: theme.text,
      }}>
        <span style={{ color: theme.accent, fontWeight: 'bold', fontSize: '13px', lineHeight: 1.2 }}>{display_name}</span>
        <span style={{ fontSize: '12px' }}>Owned: <b>{count}</b></span>
        <span style={{ fontSize: '12px', color: tier_color }}>{tier > 0 ? `Tier ${tier}` : 'No tier'}</span>
        {next
          ? <span style={{ fontSize: '11px', color: theme.text_muted }}>{count}/{next.needed} → Tier {next.tier}</span>
          : <span style={{ fontSize: '11px', color: theme.accent }}>Max Tier</span>
        }
      </div>
      {tooltip_pos && (
        <div style={{
          position: 'fixed', top: tooltip_pos.top, left: tooltip_pos.left,
          background: theme.panel, border: `1px solid ${theme.panel_border}`, borderRadius: '6px',
          padding: '8px 12px', width: `${TOOLTIP_W}px`, textAlign: 'center',
          color: theme.text, fontSize: '12px', pointerEvents: 'none', zIndex: 9999,
        }}>
          {description}
        </div>
      )}
    </div>
  );
}
