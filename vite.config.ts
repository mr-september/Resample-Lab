import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Allow overriding build base with `VITE_BASE` (set in CI). Defaults to project repo subpath.
    // Use a relative base for GitHub Pages docs deployment (set `VITE_BASE=./` in Actions).
    const buildBase = process.env.VITE_BASE ?? '/Resample-Lab/';

    return {
      base: buildBase,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
