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

export interface AccountTier {
  id: string;
  label: string;
  price: number;
}
