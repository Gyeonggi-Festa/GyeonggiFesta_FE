import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis', // ✅ global 대신 globalThis 사용하도록 설정
  },
});
