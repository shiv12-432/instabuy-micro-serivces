import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    proxy: {
      '/api': {
        // docker-compose maps container 8080 -> host 8081, so use 8081 when running with docker-compose
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
