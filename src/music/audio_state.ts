// Mutable, non-Redux state for the music player. Lives outside the store
// because YT.Player instances are not serializable.
//
// The YT.Player is created exactly once at app boot by Music_Player_Host
// (mounted from App.jsx) and lives for the lifetime of the app. The
// Music_Player UI in the top bar mounts/unmounts as the user navigates
// between screens, but the player itself persists, so audio doesn't
// stop on navigation.

import { api_get_playlist } from './api';

type Playlist_Entry = [title: string, video_id: string];

export let current_player: any | null = null;
export let current_video_id: string | null = null;
export let current_volume: number = 1.0; // 0–1; we * 100 when calling YT's setVolume.
export let yt_api_error: string | null = null;

export let playlist_entries: Playlist_Entry[] = [];
export let playlist_load_error: string | null = null;

const subscribers = new Set<() => void>();

export function subscribe(cb: () => void): () => void {
  subscribers.add(cb);
  return () => { subscribers.delete(cb); };
}

function notify(): void {
  subscribers.forEach(fn => fn());
}

// --- Playlist ---

// Fetches once at app boot from App.jsx. Errors set playlist_load_error
// so the panel can surface a real message instead of silently empty.
// Sorted alphabetically by title on load so the order is stable across
// sessions. Manual shuffling stays available via the tier-gated
// Shuffle_Button.
export async function load_playlist(): Promise<void> {
  try {
    const data: { video_id: string; title: string }[] = await api_get_playlist();
    playlist_entries = data
      .map(({ title, video_id }) => [title, video_id] as Playlist_Entry)
      .sort(([a], [b]) => a.localeCompare(b));
    playlist_load_error = null;
  } catch (e: any) {
    playlist_load_error = e?.detail || 'Failed to load playlist.';
    playlist_entries = [];
  }
  notify();
}

function shuffle_in_place<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function shuffle_playlist(): void {
  shuffle_in_place(playlist_entries);
  notify();
}

// --- YouTube IFrame Player ---

let yt_api_promise: Promise<any> | null = null;
function load_yt_api(): Promise<any> {
  if (yt_api_promise) return yt_api_promise;
  yt_api_promise = new Promise((resolve, reject) => {
    const W = window as any;
    if (W.YT && W.YT.Player) {
      resolve(W.YT);
      return;
    }
    const prev = W.onYouTubeIframeAPIReady;
    W.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      resolve(W.YT);
    };
    // The <script> tag is async (set in index.html). If it's blocked
    // (adblocker, network), surface that instead of hanging silently.
    setTimeout(() => {
      if (!W.YT || !W.YT.Player) {
        reject(new Error('YouTube IFrame API failed to load (adblocker or network).'));
      }
    }, 10000);
  });
  return yt_api_promise;
}

// Called once at app boot from App.jsx. Creates its own mount div under
// <body> so the iframe is detached from React's render tree — survives
// any component unmount. Same pattern as the previous HTMLAudioElement
// version, except YT requires a DOM node where Audio() didn't.
let init_started = false;
export async function init_yt_player(): Promise<void> {
  if (init_started) return;
  init_started = true;
  try {
    const YT = await load_yt_api();
    const mount = document.createElement('div');
    mount.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    document.body.appendChild(mount);
    current_player = new YT.Player(mount, {
      height: '0',
      width: '0',
      playerVars: { controls: 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1 },
      events: {
        onReady: () => {
          current_player.setVolume(current_volume * 100);
          notify();
        },
        onStateChange: (e: any) => {
          if (e.data === YT.PlayerState.ENDED) play_next();
          // Notify on every state change so the UI re-renders to reflect
          // play/pause-button state correctly without polling.
          notify();
        },
        onError: (e: any) => {
          // Codes 100/101/150 = video unavailable / embedding disabled.
          // Skip to the next song so a single bad entry doesn't dead-end.
          console.warn('[yt-player] error code', e.data, '— skipping to next');
          play_next();
        },
      },
    });
  } catch (e: any) {
    yt_api_error = e?.message || 'YouTube API failed to load.';
    notify();
  }
}

export function play_video(video_id: string): void {
  if (!current_player) return;
  current_player.loadVideoById(video_id);
  current_player.setVolume(current_volume * 100);
  current_video_id = video_id;
  notify();
}

export function play_next(): void {
  if (playlist_entries.length === 0) return;
  const index = playlist_entries.findIndex(([, id]) => id === current_video_id);
  const next_index = index === -1 ? 0 : (index + 1) % playlist_entries.length;
  play_video(playlist_entries[next_index][1]);
}

export function toggle_play_pause(): void {
  if (!current_player) return;
  const W = window as any;
  if (!W.YT) return;
  const state = current_player.getPlayerState();
  if (state === W.YT.PlayerState.PLAYING) current_player.pauseVideo();
  else current_player.playVideo();
}

export function stop_player(): void {
  if (!current_player) return;
  current_player.stopVideo();
  current_video_id = null;
  notify();
}

export function set_current_volume(v: number): void {
  current_volume = v;
  if (current_player) current_player.setVolume(v * 100);
}
