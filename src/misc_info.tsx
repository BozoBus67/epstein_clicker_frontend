// HTMLAudioElement and current song URL are not Redux-serializable so they live outside the store
export let current_audio: HTMLAudioElement | null = null;
export let current_song_url: string | null = null;

export function set_current_audio(audio: HTMLAudioElement | null): void {
  current_audio = audio;
}

export function set_current_song_url(url: string | null): void {
  current_song_url = url;
}

export interface AccountTier {
  id: string;
  label: string;
  price: number;
}
