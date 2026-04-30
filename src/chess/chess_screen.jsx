import { useNavigate } from 'react-router-dom';
import { Back_Arrow_Button } from '../shared/components';
import { BOTS, REGULAR_BOT_IDS, EPSTEIN_BOT_ID } from './constants';
import { get_beaten_bots } from './storage';

export default function Chess_Screen() {
  const beaten = get_beaten_bots();
  const epstein_unlocked = REGULAR_BOT_IDS.every(id => beaten.has(id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <Back_Arrow_Button to="/game" />
      <Chess_Screen_Body bots={BOTS} beaten={beaten} epstein_unlocked={epstein_unlocked} />
    </div>
  );
}

function Chess_Screen_Body({ bots, beaten, epstein_unlocked }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '64px 40px 24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
        {bots.map(bot => {
          const locked = bot.scroll_id === EPSTEIN_BOT_ID && !epstein_unlocked;
          return (
            <Bot_Card
              key={bot.scroll_id}
              bot={bot}
              locked={locked}
              beaten={beaten.has(bot.scroll_id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function Bot_Card({ bot, locked, beaten }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={locked ? undefined : () => navigate(`/game/play-chess/${bot.scroll_id}`)}
      style={{
        width: '180px', borderRadius: '10px', overflow: 'hidden',
        background: '#1e1e2e',
        border: `2px solid ${beaten ? '#facc15' : '#444'}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        cursor: locked ? 'default' : 'pointer',
        transition: 'transform 0.15s, border-color 0.15s',
        position: 'relative',
      }}
    className={locked ? '' : 'hover:scale-105 hover:border-yellow-400'}>
      <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={bot.face}
          draggable={false}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
            filter: locked ? 'grayscale(1) brightness(0.4)' : 'none',
          }}
        />
        {locked && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '60px',
          }}>🔒</div>
        )}
      </div>
      <div style={{
        padding: '10px 12px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '4px', textAlign: 'center', color: 'white',
      }}>
        <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '14px', lineHeight: 1.2 }}>
          {locked ? '???' : bot.name}
        </span>
        <span style={{ fontSize: '13px', color: '#aaa' }}>
          {locked ? <>ELO: <b style={{ color: 'white' }}>???</b></> : <>ELO: <b style={{ color: 'white' }}>{bot.elo}</b></>}
        </span>
        {beaten && !locked && (
          <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 'bold' }}>✓ Beaten</span>
        )}
      </div>
    </div>
  );
}
