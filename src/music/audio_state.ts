// HTMLAudioElement and current song URL are not Redux-serializable so they live outside the store
export let current_audio: HTMLAudioElement | null = null;
export let current_song_url: string | null = null;
export let current_volume: number = 1.0;

export function set_current_audio(audio: HTMLAudioElement | null): void {
  current_audio = audio;
}

export function set_current_song_url(url: string | null): void {
  current_song_url = url;
}

export function set_current_volume(v: number): void {
  current_volume = v;
  if (current_audio) current_audio.volume = v;
}

// `songs` comes from music_glob.ts (full mp3 glob) on Electron builds, or
// music_glob.empty.ts (empty stub) on web builds. The swap is driven by
// VITE_INCLUDE_MUSIC in vite.renderer.config.mjs's resolve.alias.
import { songs } from './music_glob';

export let playlist_entries: [string, string][] = Object.entries(songs);

const playlist_subscribers = new Set<() => void>();

export function subscribe_playlist(cb: () => void): () => void {
  playlist_subscribers.add(cb);
  return () => { playlist_subscribers.delete(cb); };
}

export function shuffle_playlist(): void {
  for (let i = playlist_entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playlist_entries[i], playlist_entries[j]] = [playlist_entries[j], playlist_entries[i]];
  }
  playlist_subscribers.forEach(fn => fn());
}
