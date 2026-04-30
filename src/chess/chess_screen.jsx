import { Back_Arrow_Button } from '../shared/components';
import { BOTS } from './constants';

export default function Chess_Screen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <Back_Arrow_Button to="/game" />
      <Chess_Screen_Body bots={BOTS} />
    </div>
  );
}

function Chess_Screen_Body({ bots }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '64px 40px 24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
        {bots.map(bot => <Bot_Card key={bot.scroll_id} bot={bot} />)}
      </div>
    </div>
  );
}

function Bot_Card({ bot }) {
  return (
    <div style={{
      width: '180px', borderRadius: '10px', overflow: 'hidden',
      background: '#1e1e2e', border: '2px solid #444',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s',
    }}
    className="hover:scale-105 hover:border-yellow-400">
      <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
        <img src={bot.face} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      </div>
      <div style={{
        padding: '10px 12px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '4px', textAlign: 'center', color: 'white',
      }}>
        <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '14px', lineHeight: 1.2 }}>{bot.name}</span>
        <span style={{ fontSize: '13px', color: '#aaa' }}>ELO: <b style={{ color: 'white' }}>{bot.elo}</b></span>
      </div>
    </div>
  );
}
