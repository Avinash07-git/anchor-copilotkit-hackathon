import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite dev proxy: /api, /demo, and /agui all hit the FastAPI backend on :8000
// during local development. Production deployments serve the bundle next to
// the FastAPI app so no proxy is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api':    { target: 'http://localhost:8000', changeOrigin: true },
      '/demo':   { target: 'http://localhost:8000', changeOrigin: true },
      '/family': { target: 'http://localhost:8000', changeOrigin: true },
      '/health': { target: 'http://localhost:8000', changeOrigin: true },
      '/agui':   { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
});
