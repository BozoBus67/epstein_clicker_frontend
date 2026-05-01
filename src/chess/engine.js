// Stockfish 18 lite-single — single-threaded WASM build, UCI protocol over a Web Worker.
//
// Stockfish's UCI_LimitStrength supports ELOs from 1320 to 3190. Anything
// outside that range is silently clamped — so a "400 ELO" bot is actually a
// 1320 ELO Stockfish instance with the displayed number being a lie. This is
// intentional; see ./constants.js for the displayed-to-actual ELO map and
// the rationale.

// Stockfish lives in /public/ (not /src/assets/) because the worker self-
// locates its companion .wasm relative to its own URL. Vite's content-
// hashing assigns different hashes to .js and .wasm, breaking that lookup.
// Files in /public/ are copied to dist/ with their names intact.
const STOCKFISH_URL = `${import.meta.env.BASE_URL}stockfish/stockfish-18-lite-single.js`;
const ELO_MIN = 1320;
const ELO_MAX = 3190;

export class Engine {
  constructor() {
    this.worker = new Worker(STOCKFISH_URL);
    this.handlers = new Set();
    this.worker.onmessage = (e) => {
      const line = typeof e.data === 'string' ? e.data : '';
      if (import.meta.env.DEV) console.log('[sf]', line);
      this.handlers.forEach(h => h(line));
    };
    this.worker.onerror = (e) => {
      // Worker-level errors (e.g. WASM load failure) are logged to console for
      // debugging. They don't currently propagate to the consuming component —
      // chess_game_screen uses init failures + best_move rejections to drive
      // its engine_error state, which covers the practical failure modes. If
      // we ever see worker.onerror firing in the wild without a matching
      // best_move rejection, expose it via a callback in this constructor.
      console.error('[sf] worker error', e.message ?? e);
    };
  }

  send(cmd) { this.worker.postMessage(cmd); }

  on_message(handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  wait_for(predicate) {
    return new Promise(resolve => {
      const off = this.on_message(line => {
        if (predicate(line)) { off(); resolve(line); }
      });
    });
  }

  async init(target_elo) {
    const elo = Math.max(ELO_MIN, Math.min(ELO_MAX, target_elo));
    this.send('uci');
    await this.wait_for(line => line === 'uciok');
    this.send('setoption name UCI_LimitStrength value true');
    this.send(`setoption name UCI_Elo value ${elo}`);
    this.send('isready');
    await this.wait_for(line => line === 'readyok');
  }

  async best_move(fen, time_ms = 800) {
    this.send(`position fen ${fen}`);
    this.send(`go movetime ${time_ms}`);
    const line = await this.wait_for(l => l.startsWith('bestmove'));
    return line.split(' ')[1];
  }

  terminate() { this.worker.terminate(); }
}
