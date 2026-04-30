const STORAGE_KEY = 'chess_beaten_bots';

export function get_beaten_bots() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function mark_bot_beaten(bot_id) {
  const beaten = get_beaten_bots();
  beaten.add(bot_id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...beaten]));
}
