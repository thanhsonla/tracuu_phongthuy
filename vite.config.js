import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite config đã được tinh giản:
// - Toàn bộ API xử lý file (Huyền Không Các) đã chuyển sang server.js (Express)
// - Toàn bộ dữ liệu Hồ Sơ Dự Án đã chuyển sang SQLite qua server.js
// - Vite chỉ còn phục vụ Frontend (React) và proxy /api/* tới Backend

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
