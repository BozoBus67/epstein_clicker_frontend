import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // VITE_INCLUDE_MUSIC must be set to exactly 'true' or 'false' — anything
  // else (missing, typo, mistakenly empty) fails the build immediately so a
  // misconfigured env doesn't silently produce the wrong artifact.
  // 'true'  → bundle src/assets/music/*.mp3 into the build (Electron)
  // 'false' → swap music_glob for an empty stub (web/Vercel builds)
  const env = loadEnv(mode, __dirname, '');
  const raw_include_music = env.VITE_INCLUDE_MUSIC;
  if (raw_include_music !== 'true' && raw_include_music !== 'false') {
    throw new Error(
      `VITE_INCLUDE_MUSIC must be 'true' or 'false', got ${JSON.stringify(raw_include_music)}. ` +
      `Set it in .env (Electron) or in the deploy platform's env vars (Vercel).`
    );
  }
  const include_music = raw_include_music === 'true';

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
