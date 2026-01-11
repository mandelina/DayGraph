import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";
import { promises as fs } from "node:fs";
// DB 쿼리는 런타임에 동적 import하여 네이티브 모듈 로딩 실패 시 앱 크래시 방지
import { IPC } from "@daygraph/shared/ipc";

// 개발 디버깅: Electron의 Chromium 원격 디버깅 포트를 활성화해 VS Code가 렌더러에 attach 가능하도록 함
// mac/윈도우 공통. dev 모드에서만 설정
if (!app.isPackaged) {
  const port = process.env.ELECTRON_REMOTE_DEBUGGING_PORT || "9222";
  app.commandLine.appendSwitch("remote-debugging-port", port);
}

async function createWindow() {
  // 개발: electron-vite가 제공하는 ELECTRON_RENDERER_URL 사용, 배포: 파일 로드
  const isDev = !app.isPackaged;
  const preloadPath = join(__dirname, "../preload/index.mjs");

  // dev에서 가끔 preload 산출물이 늦게 생성되어 ENOENT가 발생하는 경우가 있어 대기
  if (isDev) {
    await waitForFile(preloadPath).catch((e) => {
      console.warn("[preload wait]", String(e));
    });
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
    },
  });

  const devUrl = process.env.ELECTRON_RENDERER_URL || "http://localhost:5173";
  const prodUrl = "file://" + join(__dirname, "../renderer/index.html");
  await win.loadURL(isDev ? devUrl : prodUrl);

  // 로드 실패 원인 파악용 로깅 (mac에서 빈 창 문제 추적)
  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    console.error("[renderer did-fail-load]", { code, desc, url });
  });

  // 개발 편의: F12 또는 Ctrl/Cmd+Shift+I 로 DevTools 열기
  // before-input-event를 사용해 현재 창 범위에서만 처리 (globalShortcut 지양)
  if (isDev) {
    win.webContents.on("before-input-event", (event, input) => {
      const isF12 = input.type === "keyDown" && input.key === "F12";
      const isToggleDevTools =
        input.type === "keyDown" &&
        (input.control || input.meta) &&
        input.shift &&
        (input.key.toUpperCase() === "I" || input.code === "KeyI");
      if (isF12 || isToggleDevTools) {
        event.preventDefault();
        win.webContents.openDevTools({ mode: "detach" });
      }
    });
  }
}

// 파일 생성 대기 유틸리티 (dev 레이스 컨디션 완화)
async function waitForFile(file: string, timeoutMs = 15000, intervalMs = 100) {
  const start = Date.now();
  while (true) {
    try {
      await fs.access(file);
      return;
    } catch {}
    if (Date.now() - start > timeoutMs) {
      throw new Error(`timeout waiting for file: ${file}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
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
