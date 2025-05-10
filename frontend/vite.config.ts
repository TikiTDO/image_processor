import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Read backend URL from environment or default to localhost
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5700';

export default defineConfig({
  server: {
    port: 5800,
    proxy: {
      '/api': BACKEND_URL,
      '/images': BACKEND_URL,
    },
  },
  // Load React plugin only for dev/build, skip for Vitest (test) to avoid native transforms
  plugins: process.env.VITEST ? [] : [react()],
  test: {
    // Use jsdom environment and setup files before tests
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    // Transform TS/TSX files in SSR context to support JSX in tests
    transformMode: {
      ssr: [/\.[jt]sx$/],
    },
  },
});