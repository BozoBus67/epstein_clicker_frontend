import { useState, useEffect, useRef } from 'react';
import { current_audio, set_current_audio, current_song_url, set_current_song_url } from '../../misc_info';

const songs = import.meta.glob(
  '/public/music/*.mp3',
  { eager: true, query: '?url', import: 'default' }
);
const song_urls = Object.values(songs);

function Music_Player_Panel({ on_song_click, current_url }) {
  const selected_ref = useRef(null);

  useEffect(() => {
    if (selected_ref.current) {
      selected_ref.current.scrollIntoView({ block: 'start' });
    }
  }, []);

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
      {Object.entries(songs).map(([path, url]) => {
        const filename = path.split('/').pop().replace('.mp3', '').replace(/\s*\[[^\]]+\]$/, '');
        return (
          <button
            key={path}
            ref={current_url === url ? selected_ref : null}
            onClick={() => on_song_click(url)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              background: current_url === url ? '#f0f0f0' : 'none',
              border: 'none',
              padding: '6px 4px',
              cursor: 'pointer',
              fontSize: '13px',
              borderBottom: '1px solid #ccc',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            className="hover:bg-gray-100"
          >
            {filename}
          </button>
        );
      })}
    </div>
  );
}

function Music_Player_Button({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="hover:outline hover:outline-1 hover:outline-yellow-400 hover:cursor-pointer"
      style={{
        background: 'none',
        border: 'none',
        fontSize: '20px',
        lineHeight: 1,
        padding: '4px',
        borderRadius: '4px',
      }}
    >
      🎵
    </button>
  );
}

export default function Music_Player() {
  const [open, setOpen] = useState(false);
  const [current_url, set_current_url] = useState(() => current_song_url);

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

  const change_song = (url) => {
    if (current_audio) {
      current_audio.pause();
      current_audio.currentTime = 0;
    }
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => play_next(url);
    set_current_audio(audio);
    set_current_song_url(url);
    set_current_url(url);
  };

  const play_next = (url) => {
    const index = song_urls.indexOf(url);
    const next_url = song_urls[(index + 1) % song_urls.length];
    change_song(next_url);
  };

  const on_song_click = (url) => {
    if (current_audio && current_url === url) {
      if (current_audio.paused) {
        current_audio.play();
      } else {
        current_audio.pause();
      }
    } else {
      change_song(url);
    }
  };

  return (
    <div className="music-player-container" style={{ position: 'relative' }}>
      <Music_Player_Button onClick={() => setOpen(!open)} />
      {open && <Music_Player_Panel on_song_click={on_song_click} current_url={current_url} />}
    </div>
  );
}
