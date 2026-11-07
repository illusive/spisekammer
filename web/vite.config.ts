/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// The app's build, shown in Settings: the date and the short Git commit ("dev" without Git).
function appBuild(): { date: string; commit: string } {
  let commit = 'dev';
  try {
    commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || 'dev';
  } catch {
    // Not a Git checkout yet.
  }
  return { date: new Date().toISOString().slice(0, 10), commit };
}

export default defineConfig({
  define: { __APP_BUILD__: JSON.stringify(appBuild()) },
  // Relative paths and hash routes: the app works from any sub-path and any static host (S-001).
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      injectManifest: {
        globPatterns: ['**/*.{html,js,mjs,css,wasm,json,png,svg,ico,webmanifest,woff2,txt}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'Spisekammer',
        short_name: 'Spisekammer',
        description: 'Hvad du har derhjemme, og hvornår det skal bruges.',
        lang: 'da',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f6f1e7',
        theme_color: '#f6f1e7',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
