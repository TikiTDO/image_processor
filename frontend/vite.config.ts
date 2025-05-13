import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Read backend URL from environment or default to localhost
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5700';

export default defineConfig({
  base: '/',
  server: {
    port: 5800,
    // Enable HTTPS using backend self-signed certificates
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../backend/certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../backend/certs/cert.pem')),
    },
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
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