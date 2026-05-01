import { useState, useEffect, useRef } from 'react';
import {
  current_video_id,
  play_video, toggle_play_pause,
  playlist_entries, playlist_load_error, yt_api_error,
  subscribe,
} from './audio_state';
import { useTierGate } from '../shared/hooks';
import { useTheme } from '../shared/theme';

export default function Music_Player() {
  const [open, setOpen] = useState(false);
  const [, force_update] = useState(0);
  const { gate, lock_modal } = useTierGate(1);

  // Re-render whenever the player state, playlist, or error fields mutate.
  // The actual YT.Player and playlist live as module state in audio_state,
  // so this component is pure UI — Music_Player can mount/unmount as the
  // user navigates and the player keeps playing.
  useEffect(() => subscribe(() => force_update(n => n + 1)), []);

  // Close on outside click / Escape — only attached while open.
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

  const on_song_click = (video_id) => {
    if (current_video_id === video_id) toggle_play_pause();
    else play_video(video_id);
  };

  return (
    <div className="music-player-container" style={{ position: 'relative' }}>
      <Music_Player_Button onClick={() => gate(() => setOpen(!open))} />
      {open && <Music_Player_Panel
        entries={playlist_entries}
        on_song_click={on_song_click}
        current_video_id={current_video_id}
        api_error={yt_api_error}
        load_error={playlist_load_error}
      />}
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
  // explains why. Both cases are loud (console + visible message) rather
  // than silent empty list.
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
