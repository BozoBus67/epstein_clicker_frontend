import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Read VITE_INCLUDE_MUSIC from .env (Electron dev/build) or process.env
  // (Vercel sets it via the dashboard). When unset/false, we swap the mp3
  // glob for an empty stub so the music folder is excluded from web builds.
  const env = loadEnv(mode, __dirname, '');
  const include_music = env.VITE_INCLUDE_MUSIC === 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: include_music ? [] : [
        {
          find: /^.*\/music_glob$/,
          replacement: resolve(__dirname, 'src/music/music_glob.empty.ts'),
        },
      ],
    },
  };
});
