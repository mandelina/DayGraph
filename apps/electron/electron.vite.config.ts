import { defineConfig } from "electron-vite";
import { resolve } from "node:path";

// electron-vite 설정: main, preload만 번들하고,
// renderer는 별도 apps/renderer 가 dev 서버를 띄움
export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@daygraph/shared": resolve(__dirname, "../../packages/shared/src"),
        "@daygraph/db": resolve(__dirname, "../../packages/db/src"),
        "@daygraph/collector": resolve(
          __dirname,
          "../../packages/collector/src"
        ),
      },
    },
    build: {
      outDir: "dist/main",
      rollupOptions: {
        input: resolve(__dirname, "src/main/index.ts"),
        // 출력 파일 이름을 electron-vite가 기대하는 index.js로 고정
        output: { entryFileNames: "index.js" },
        // 네이티브 모듈은 번들에서 제외(런타임에 로드)
        external: ["better-sqlite3"],
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        "@daygraph/shared": resolve(__dirname, "../../packages/shared/src"),
        "@daygraph/db": resolve(__dirname, "../../packages/db/src"),
      },
    },
    build: {
      outDir: "dist/preload",
      // Electron의 preload는 CJS가 가장 호환성이 좋음
      // (일부 환경에서 ESM preload 파싱 오류 방지)
      rollupOptions: {
        input: resolve(__dirname, "src/preload/index.ts"),
        output: {
          // CommonJS 형식으로 번들
          format: "cjs",
          // 확장자를 .cjs로 명시하여 type:module 환경과 충돌 방지
          entryFileNames: "index.cjs",
        },
      },
    },
  },
  renderer: {
    // electron-vite가 apps/renderer를 직접 구동하도록 루트 지정
    root: resolve(__dirname, "../renderer"),
    build: {
      outDir: "dist/renderer",
      rollupOptions: {
        input: resolve(__dirname, "../renderer/index.html"),
      },
    },
    server: {
      port: 5173,
      strictPort: true, // 포트 고정(충돌 시 실패) → main의 기본값/VSCode 태스크와 일치
      open: false,
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 5173,
      },
    },
  },
});
