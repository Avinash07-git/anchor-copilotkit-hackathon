import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// CopilotKit v2 ships CSS built with Tailwind v4 (@layer base without @tailwind base).
// Our project uses Tailwind v3, which throws on that syntax. We unwrap @layer
// blocks using PostCSS so the rules are preserved but the cascade-layer wrapper
// is removed — giving us CopilotKit's popup styles without the Tailwind v3 error.
const fixCopilotKitCSS: Plugin = {
  name: 'fix-copilotkit-css',
  enforce: 'pre',
  async transform(code, id) {
    if (!id.includes('@copilotkit') || !id.match(/\.css(\?|$)/)) return;
    try {
      const { default: postcss } = await import('postcss');
      const root = postcss.parse(code);
      root.walkAtRules('layer', (rule) => {
        rule.replaceWith(rule.nodes ?? []);
      });
      return { code: root.toString(), map: null };
    } catch {
      return { code: '/* copilotkit css skipped */', map: null };
    }
  },
};

// Vite dev proxy: /api, /demo, and /agui all hit the FastAPI backend on :8000
// during local development. Production deployments serve the bundle next to
// the FastAPI app so no proxy is needed.
export default defineConfig({
  plugins: [fixCopilotKitCSS, react()],
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
