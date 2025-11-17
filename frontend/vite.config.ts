import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // 开发时通过 proxy 转发 /api 到后端，避免浏览器 CORS 限制
  server: {
    proxy: {
      // 将 /api/** 转发到后端（示例目标 http://localhost:80）
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
