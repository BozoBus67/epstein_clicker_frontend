import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest config — kept separate from the renderer/main/preload Electron-build
// configs so the test pipeline doesn't drag in build-time concerns (and vice
// versa). Tests live colocated next to source as `*.test.js` / `*.test.jsx`;
// vitest auto-discovers them.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test_setup.js'],
  },
});
