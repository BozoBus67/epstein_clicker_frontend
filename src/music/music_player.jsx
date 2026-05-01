import { useState, useEffect, useRef } from 'react';
import {
  current_player, set_current_player,
  current_video_id, set_current_video_id,
  current_volume,
  playlist_entries, playlist_load_error, subscribe_playlist,
} from './audio_state';
import { useTierGate } from '../shared/hooks';
import { useTheme } from '../shared/theme';

// Single-page-app-wide singleton that resolves once the YouTube IFrame API
// finishes loading. The <script> tag in index.html sets window.YT and then
// calls window.onYouTubeIframeAPIReady — we hook that callback exactly once
// here and hand out the same Promise to every caller.
let yt_api_ready_promise = null;
function load_yt_api() {
  if (yt_api_ready_promise) return yt_api_ready_promise;
  yt_api_ready_promise = new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      resolve(window.YT);
    };
    // The <script> tag is async. If it's blocked (adblocker, network) we
    // never get YT — surface that to the user instead of hanging silently.
    setTimeout(() => {
      if (!window.YT || !window.YT.Player) {
        reject(new Error('YouTube IFrame API failed to load (adblocker or network).'));
      }
    }, 10000);
  });
  return yt_api_ready_promise;
}

export default function Music_Player() {
  const [open, setOpen] = useState(false);
  const [current_id, set_current_id] = useState(() => current_video_id);
  const [, force_update] = useState(0);
  const [api_error, set_api_error] = useState(null);
  const player_mount_ref = useRef(null);
  const { gate, lock_modal } = useTierGate(1);

  // Re-render when the playlist mutates (initial load, shuffle).
  useEffect(() => subscribe_playlist(() => force_update(n => n + 1)), []);

  // One-time setup: wait for the YT API, then create a hidden Player
  // instance whose iframe mounts into player_mount_ref. Tear down on
  // unmount so we don't leak iframes if Music_Player ever remounts.
  useEffect(() => {
    let player = null;
    let cancelled = false;
    load_yt_api().then((YT) => {
      if (cancelled || !player_mount_ref.current) return;
      player = new YT.Player(player_mount_ref.current, {
        height: '0',
        width: '0',
        playerVars: { controls: 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: () => {
            set_current_player(player);
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) play_next_after_current();
          },
          onError: (e) => {
            // Codes 100/101/150 = video unavailable / embedding disabled / removed.
            // Just skip to the next song so a single bad entry doesn't dead-end the player.
            console.warn('[yt-player] error code', e.data, '— skipping to next');
            play_next_after_current();
          },
        },
      });
    }).catch((err) => {
      console.error('[yt-player]', err);
      set_api_error(err.message);
    });
    return () => {
      cancelled = true;
      if (player) player.destroy();
      set_current_player(null);
    };
  }, []);

  // Close on outside click or Escape — only attached while open.
  useEffect(() => {
    if (!open) return;
    const handle_click_outside = (e) => {
      if (!e.target.closest('.music-player-container')) setOpen(false);
    };
    const handle_esc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handle_click_outside);
    document.addEventListener('keydown', handle_esc);
    return () => {
      document.removeEventListener('mousedown', handle_click_outside);
      document.removeEventListener('keydown', handle_esc);
    };
  }, [open]);

  const play_video = (video_id) => {
    if (!current_player) return;
    current_player.loadVideoById(video_id);
    current_player.setVolume(current_volume * 100);
    set_current_video_id(video_id);
    set_current_id(video_id);
  };

  // Find the next entry after the currently-playing one and start it.
  // Wrap-around: end of playlist → start over.
  const play_next_after_current = () => {
    if (playlist_entries.length === 0) return;
    const index = playlist_entries.findIndex(([, id]) => id === current_video_id);
    const next_index = index === -1 ? 0 : (index + 1) % playlist_entries.length;
    play_video(playlist_entries[next_index][1]);
  };

  // Click a song row: if it's the active one, toggle play/pause; otherwise switch.
  const on_song_click = (video_id) => {
    if (!current_player) return;
    if (current_id === video_id) {
      const state = current_player.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) current_player.pauseVideo();
      else current_player.playVideo();
    } else {
      play_video(video_id);
    }
  };

  return (
    <div className="music-player-container" style={{ position: 'relative' }}>
      <Music_Player_Button onClick={() => gate(() => setOpen(!open))} />
      {open && <Music_Player_Panel
        entries={playlist_entries}
        on_song_click={on_song_click}
        current_video_id={current_id}
        api_error={api_error}
        load_error={playlist_load_error}
      />}
      {/* Hidden YouTube iframe mount. Sized 0×0 because we only want audio;
          the player itself is fully controlled via the IFrame Player API. */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div ref={player_mount_ref} />
      </div>
      {lock_modal}
    </div>
  );
}

function Music_Player_Button({ onClick }) {
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:outline hover:outline-1 hover:cursor-pointer"
      style={{
        background: theme.accent,
        border: `1px solid ${theme.accent}`,
        fontSize: '16px',
        lineHeight: 1,
        padding: '4px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
    >
      🎵
    </button>
  );
}

function Music_Player_Panel({ entries, on_song_click, current_video_id, api_error, load_error }) {
  const selected_ref = useRef(null);

  useEffect(() => {
    if (selected_ref.current) {
      selected_ref.current.scrollIntoView({ block: 'start' });
    }
  }, []);

  // Either failure mode renders the same shell — list is empty, message
  // explains why. Both cases are loud (toast/console + visible message)
  // rather than a silent empty list.
  if (api_error || load_error || entries.length === 0) {
    return <Music_Player_Status_Panel message={api_error || load_error || 'Loading playlist…'} />;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      width: '260px',
      height: '200px',
      overflowY: 'scroll',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '8px',
      zIndex: 100,
    }}>
      {entries.map(([title, video_id]) => (
        <button
          type="button"
          key={video_id}
          ref={current_video_id === video_id ? selected_ref : null}
          onClick={() => on_song_click(video_id)}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            background: current_video_id === video_id ? '#f0f0f0' : 'none',
            border: 'none',
            padding: '6px 4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#111',
            borderBottom: '1px solid #ccc',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          className="hover:bg-gray-100"
        >
          {title}
        </button>
      ))}
    </div>
  );
}

// Used for the loading / API-blocked / fetch-failed states. Same outer
// chrome as the song list panel so the popover footprint is consistent.
function Music_Player_Status_Panel({ message }) {
  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      width: '260px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '14px 12px',
      zIndex: 100,
      fontSize: '13px',
      color: '#111',
      textAlign: 'center',
      lineHeight: 1.4,
    }}>
      {message}
    </div>
  );
}
