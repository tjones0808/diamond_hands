import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Heavy 3rd-party deps in their own chunks so the initial bundle is lean.
          phaser: ['phaser'],
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
  }
});
