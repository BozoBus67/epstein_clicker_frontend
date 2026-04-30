// Stockfish 18 lite-single — single-threaded WASM build, UCI protocol over a Web Worker.
// ELO range supported by Stockfish: 1320–3190. Values outside get clamped.

const STOCKFISH_URL = `${import.meta.env.BASE_URL}stockfish/stockfish-18-lite-single.js`;
const ELO_MIN = 1320;
const ELO_MAX = 3190;

export class Engine {
  constructor() {
    this.worker = new Worker(STOCKFISH_URL);
    this.handlers = new Set();
    this.worker.onmessage = (e) => {
      const line = typeof e.data === 'string' ? e.data : '';
      this.handlers.forEach(h => h(line));
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
