import { get } from '../shared/api_client';

// Returns [{ video_id, title }, ...] from the backend, which proxies the
// YouTube Data API call (the API key stays server-side). Public endpoint —
// no auth needed; the playlist is the same for everyone.
export const api_get_playlist = () => get('/youtube_playlist');
