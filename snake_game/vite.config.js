import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Relax CSP only during Vite dev server so React Fast Refresh and HMR WebSocket work
const devCspPlugin = () => ({
  name: 'dev-csp',
  apply: 'serve',
  transformIndexHtml(html) {
    return html.replace(
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:* http://localhost:*; img-src 'self' data:;",
    );
  },
});

export default defineConfig({
  plugins: [react(), devCspPlugin()],
  base: './', // Ensure relative paths for assets in production
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
