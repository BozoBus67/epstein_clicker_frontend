import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Back_Arrow_Button, Audio_Controls } from '../shared/components';
import { BOTS } from './constants';
import { mark_bot_beaten } from './storage';
import { Engine } from './engine';

export default function Chess_Game_Screen() {
  const { bot_id } = useParams();
  const navigate = useNavigate();
  const bot = BOTS.find(b => b.scroll_id === bot_id);

  const chess_ref = useRef(new Chess());
  const engine_ref = useRef(null);
  const init_promise_ref = useRef(null);
  const thinking_ref = useRef(false);
  const [position, set_position] = useState(chess_ref.current.fen());
  const [outcome, set_outcome] = useState(null); // null | 'win' | 'loss' | 'draw'
  const [engine_ready, set_engine_ready] = useState(false);
  const [engine_error, set_engine_error] = useState(null);

  useEffect(() => {
    if (!bot) return;
    const engine = new Engine();
    engine_ref.current = engine;
    init_promise_ref.current = engine.init(bot.elo)
      .then(() => set_engine_ready(true))
      .catch(e => set_engine_error(e?.message ?? String(e)));
    return () => { engine.terminate(); };
  }, [bot]);

  if (!bot) {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        Unknown bot. <button onClick={() => navigate('/game/play-chess')}>Back</button>
      </div>
    );
  }

  const check_outcome = () => {
    const chess = chess_ref.current;
    if (chess.isCheckmate()) {
      const won = chess.turn() === 'b';
      set_outcome(won ? 'win' : 'loss');
      if (won) mark_bot_beaten(bot.scroll_id);
    } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
      set_outcome('draw');
    }
  };

  const make_engine_move = async () => {
    if (thinking_ref.current || engine_error) return;
    const chess = chess_ref.current;
    if (chess.isGameOver()) return;
    thinking_ref.current = true;
    try {
      await init_promise_ref.current;
      const move = await engine_ref.current.best_move(chess.fen());
      const from = move.slice(0, 2);
      const to = move.slice(2, 4);
      const promotion = move.length > 4 ? move[4] : undefined;
      chess.move({ from, to, promotion });
      set_position(chess.fen());
      check_outcome();
    } catch (e) {
      console.error('engine move failed', e);
    } finally {
      thinking_ref.current = false;
    }
  };

  const apply_user_move = (from, to, promotion) => {
    const chess = chess_ref.current;
    if (outcome || thinking_ref.current) return false;
    console.log('[chess] applying', { from, to, promotion, fen: chess.fen(), turn: chess.turn() });
    let move;
    try {
      move = chess.move({ from, to, promotion });
    } catch (e) {
      console.error('[chess] move failed:', e.message);
      return false;
    }
    if (!move) return false;
    set_position(chess.fen());
    check_outcome();
    if (!chess.isGameOver()) make_engine_move();
    return true;
  };

  const on_drop = (sourceSquare, targetSquare) => {
    console.log('[chess] on_drop', { sourceSquare, targetSquare });
    return apply_user_move(sourceSquare, targetSquare, 'q');
  };

  const on_promotion_piece_select = (piece, from, to) => {
    console.log('[chess] on_promotion_piece_select', { piece, from, to });
    if (!piece) return false;
    const ok = apply_user_move(from, to, piece[1].toLowerCase());
    console.log('[chess] apply result', ok);
    return ok;
  };

  const reset = () => {
    chess_ref.current = new Chess();
    set_position(chess_ref.current.fen());
    set_outcome(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', alignItems: 'center', padding: '12px 16px 16px', gap: '12px' }}>
      <Back_Arrow_Button to="/game/play-chess" />
      <div style={{ position: 'fixed', top: '16px', right: '16px' }}>
        <Audio_Controls />
      </div>
      <Bot_Header bot={bot} engine_ready={engine_ready} engine_error={engine_error} thinking={thinking_ref.current} outcome={outcome} />
      <div style={{ width: 'min(60vh, 85vw)', maxWidth: '480px' }}>
        <Chessboard
          position={position}
          onPieceDrop={on_drop}
          onPromotionPieceSelect={on_promotion_piece_select}
          boardOrientation="white"
          arePiecesDraggable={!outcome}
        />
      </div>
      {outcome && <Outcome_Banner outcome={outcome} on_reset={reset} />}
    </div>
  );
}

function Bot_Header({ bot, engine_ready, engine_error, thinking, outcome }) {
  const status =
    outcome === 'win'  ? 'You won!' :
    outcome === 'loss' ? 'You lost.' :
    outcome === 'draw' ? 'Draw.' :
    engine_error       ? `Engine error: ${engine_error}` :
    thinking           ? `${bot.name} is thinking…` :
    !engine_ready      ? 'Engine loading… (you can move)' :
                         'Your move (white).';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
      <img src={bot.face} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '3px solid #facc15' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: '#facc15', fontWeight: 'bold' }}>{bot.name} <span style={{ color: '#aaa', fontWeight: 'normal' }}>(ELO {bot.elo})</span></span>
        <span style={{ fontSize: '13px', color: '#aaa' }}>{status}</span>
      </div>
    </div>
  );
}

function Outcome_Banner({ outcome, on_reset }) {
  const text = outcome === 'win' ? '🏆 Victory' : outcome === 'loss' ? '💀 Defeat' : '🤝 Draw';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'white' }}>
      <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#facc15' }}>{text}</div>
      <button
        onClick={on_reset}
        style={{ padding: '8px 24px', background: '#facc15', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Play again
      </button>
    </div>
  );
}
