import { useSelector } from 'react-redux';
import Page_Header from '../shared/components/page_header';
import { SCROLL_TIERS } from './mastery_scroll_constants';
import { SCROLL_NAMES } from '../shared/constants';

function get_tier(count) {
  for (const { min, tier } of SCROLL_TIERS) {
    if (count >= min) return tier;
  }
  return 0;
}

function Scroll_Panel({ scroll_id, count }) {
  const display_name = SCROLL_NAMES[scroll_id];
  const tier = get_tier(count);

  return (
    <div style={{
      width: '200px', height: '160px', borderRadius: '10px', padding: '20px',
      background: '#1e1e2e', border: '2px solid #444',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '8px', boxSizing: 'border-box', flexShrink: 0, color: 'white', textAlign: 'center',
    }}>
      <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '14px' }}>{display_name}</span>
      <span style={{ fontSize: '13px' }}>Owned: <b>{count}</b></span>
      <span style={{ fontSize: '13px', color: tier > 0 ? '#facc15' : '#555' }}>
        {tier > 0 ? `Tier ${tier}` : 'No tier'}
      </span>
    </div>
  );
}

function Mastery_Scrolls_Screen_Body({ premium_game_data, scrolls }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {Object.entries(scrolls).map(([id]) => (
          <Scroll_Panel key={id} scroll_id={id} count={premium_game_data?.[id] ?? 0} />
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
