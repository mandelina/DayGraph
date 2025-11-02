import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 표준 Vite React 설정
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false // 브라우저 자동 오픈 방지 → Electron에서만 확인
  }
})
