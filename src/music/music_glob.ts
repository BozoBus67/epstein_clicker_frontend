// Eager glob of every mp3 in src/assets/music/. Loaded by audio_state.ts.
// In web builds (VITE_INCLUDE_MUSIC != 'true') Vite's resolve.alias swaps
// this file for music_glob.empty.ts so the ~280MB music folder isn't
// bundled into dist/assets/. See vite.renderer.config.mjs.
export const songs = import.meta.glob(
  '/src/assets/music/*.mp3',
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>;
