// Mutable, non-Redux state for the music player. Lives outside the store
// because YT.Player instances are not serializable.
//
// playlist_entries is fetched from the backend (`GET /youtube_playlist`)
// once on app boot. Each entry is `[title, video_id]` and feeds straight
// into Music_Player_Panel.

import { api_get_playlist } from './api';

type Playlist_Entry = [title: string, video_id: string];

// `current_player` is a YT.Player instance once the IFrame API has loaded
// and Music_Player has mounted its hidden player div. Null in between.
export let current_player: any | null = null;
export let current_video_id: string | null = null;
export let current_volume: number = 1.0; // 0–1; we multiply by 100 when calling YT's setVolume.

export function set_current_player(p: any | null): void {
  current_player = p;
  if (current_player) current_player.setVolume(current_volume * 100);
}

export function set_current_video_id(id: string | null): void {
  current_video_id = id;
}

export function set_current_volume(v: number): void {
  current_volume = v;
  if (current_player) current_player.setVolume(v * 100);
}

export let playlist_entries: Playlist_Entry[] = [];
export let playlist_load_error: string | null = null;

const playlist_subscribers = new Set<() => void>();

export function subscribe_playlist(cb: () => void): () => void {
  playlist_subscribers.add(cb);
  return () => { playlist_subscribers.delete(cb); };
}

function notify_subscribers(): void {
  playlist_subscribers.forEach(fn => fn());
}

// Fetches the playlist and replaces playlist_entries. Called once from
// App.jsx during the bootstrap sequence. Errors set playlist_load_error
// so the panel can surface a real message instead of silently empty.
export async function load_playlist(): Promise<void> {
  try {
    const data: { video_id: string; title: string }[] = await api_get_playlist();
    playlist_entries = data.map(({ title, video_id }) => [title, video_id]);
    playlist_load_error = null;
  } catch (e: any) {
    playlist_load_error = e?.detail || 'Failed to load playlist.';
    playlist_entries = [];
  }
  notify_subscribers();
}

export function shuffle_playlist(): void {
  for (let i = playlist_entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playlist_entries[i], playlist_entries[j]] = [playlist_entries[j], playlist_entries[i]];
  }
  notify_subscribers();
}
