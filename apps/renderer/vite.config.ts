import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// 표준 Vite React 설정
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    open: false,
    hmr: {
      protocol: "ws",
      host: "127.0.0.1",
      port: 5173,
    },
  },
});
