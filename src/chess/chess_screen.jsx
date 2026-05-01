// Chess bot select screen. Architecture overview, ELO mechanics, and engine
// lifecycle live in ./README.md — read that first if you're new to this file.
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Back_Arrow_Button } from '../shared/components';
import { useTheme } from '../shared/theme';
import { BOTS, REGULAR_BOT_IDS, EPSTEIN_BOT_ID } from './constants';

export default function Chess_Screen() {
  const theme = useTheme();
  const beaten_list = useSelector(s => s.session.premium_game_data?.chess_beaten_bots ?? []);
  const beaten = new Set(beaten_list);
  const epstein_unlocked = REGULAR_BOT_IDS.every(id => beaten.has(id));

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh',
      background: theme.bg, backgroundSize: theme.bg_size, backgroundPosition: theme.bg_position, color: theme.text,
    }}>
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
          const locked = bot.id === EPSTEIN_BOT_ID && !epstein_unlocked;
          return (
            <Bot_Card
              key={bot.id}
              bot={bot}
              locked={locked}
              beaten={beaten.has(bot.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function Bot_Card({ bot, locked, beaten }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const handle_click = locked ? undefined : () => navigate(`/game/play-chess/${bot.id}`);

  return (
    <div
      onClick={handle_click}
      style={{
        width: '180px', borderRadius: '10px', overflow: 'hidden',
        background: theme.panel,
        border: `2px solid ${beaten ? theme.accent : theme.panel_border}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        cursor: locked ? 'default' : 'pointer',
        transition: 'transform 0.15s, border-color 0.15s',
        position: 'relative',
      }}
      className={locked ? '' : 'hover:scale-105'}
    >
      <Bot_Card_Image face={bot.face} locked={locked} />
      <Bot_Card_Footer bot={bot} locked={locked} beaten={beaten} />
    </div>
  );
}

function Bot_Card_Image({ face, locked }) {
  return (
    <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative' }}>
      <img
        src={face}
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
  );
}

function Bot_Card_Footer({ bot, locked, beaten }) {
  const theme = useTheme();
  return (
    <div style={{
      padding: '10px 12px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '4px', textAlign: 'center', color: theme.text,
    }}>
      <span style={{ color: theme.accent, fontWeight: 'bold', fontSize: '14px', lineHeight: 1.2 }}>
        {locked ? '???' : bot.name}
      </span>
      <span style={{ fontSize: '13px', color: theme.text_muted }}>
        ELO: <b style={{ color: theme.text }}>{locked ? '???' : bot.elo}</b>
      </span>
      {beaten && !locked && (
        <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 'bold' }}>✓ Beaten</span>
      )}
    </div>
  );
}
