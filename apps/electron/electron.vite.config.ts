import { defineConfig } from "electron-vite";
import { resolve } from "node:path";

// electron-vite 설정: main, preload만 번들하고,
// renderer는 별도 apps/renderer 가 dev 서버를 띄움
export default defineConfig({
  main: {
    // dev에서 엔트리 인식 문제 방지: entry 명시
    entry: resolve(__dirname, "src/main/index.ts"),
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
    // dev에서 엔트리 인식 문제 방지: entry 명시
    entry: resolve(__dirname, "src/preload/index.ts"),
    resolve: {
      alias: {
        "@daygraph/shared": resolve(__dirname, "../../packages/shared/src"),
        "@daygraph/db": resolve(__dirname, "../../packages/db/src"),
      },
    },
    build: {
      outDir: "dist/preload",
      rollupOptions: {
        input: resolve(__dirname, "src/preload/index.ts"),
        output: { entryFileNames: "index.js" },
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
      open: false,
    },
  },
});
