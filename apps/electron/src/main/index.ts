import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";
// DB 쿼리는 런타임에 동적 import하여 네이티브 모듈 로딩 실패 시 앱 크래시 방지
import { IPC } from "@daygraph/shared/ipc";

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // electron-vite는 preload를 ESM으로 빌드하여 index.mjs를 생성
      preload: join(__dirname, "../preload/index.mjs"),
    },
  });

  // 개발: electron-vite가 제공하는 ELECTRON_RENDERER_URL 사용, 배포: 파일 로드
  const isDev = !app.isPackaged;
  const devUrl = process.env.ELECTRON_RENDERER_URL || "http://localhost:5173";
  const prodUrl = "file://" + join(__dirname, "../renderer/index.html");
  await win.loadURL(isDev ? devUrl : prodUrl);
}

// Typed IPC: 당일 로그 조회
ipcMain.handle(IPC.channels.queryDay, async (_e, dateISO: string) => {
  try {
    const mod = await import("@daygraph/db/queries");
    return await mod.queryDay(dateISO);
  } catch (err) {
    console.error("[queryDay] failed:", err);
    // 네이티브 모듈 미빌드 시에도 앱이 뜨도록 빈 배열 반환
    return [];
  }
});

app.whenReady().then(async () => {
  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
