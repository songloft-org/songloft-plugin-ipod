import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'songloft-static-assets',
      apply: 'build',
      transformIndexHtml(html) {
        // Songloft injects a base URL ending at `/api/v1/jsplugin/<entryPath>/`.
        // Static files are served beneath its `static/` child route instead.
        return html.replace(/(["'])\.\/assets\//g, '$1static/assets/');
      },
    },
  ],
  root: 'frontend',
  publicDir: path.resolve(__dirname, 'frontend/public'),
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'static'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'frontend/index.html'),
    },
  },
});
