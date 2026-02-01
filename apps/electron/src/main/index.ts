import { app, BrowserWindow, ipcMain } from "electron";
import { join, resolve, isAbsolute } from "node:path";
import { promises as fs } from "node:fs";
import { IPC } from "@daygraph/shared/ipc";

// 개발 디버깅: Electron의 Chromium 원격 디버깅 포트를 활성화해 VS Code가 렌더러에 attach 가능하도록 함
// mac/윈도우 공통. dev 모드에서만 설정
if (!app.isPackaged) {
  const port = process.env.ELECTRON_REMOTE_DEBUGGING_PORT || "9222";
  app.commandLine.appendSwitch("remote-debugging-port", port);
}

// 루트 경로를 고정해 상대 DATADIR이 항상 동일하게 동작하도록 보정
process.env.DAYGRAPH_ROOT ??= process.env.INIT_CWD ?? process.cwd();

async function createWindow() {
  // 개발: electron-vite가 제공하는 ELECTRON_RENDERER_URL 사용, 배포: 파일 로드
  const isDev = !app.isPackaged;
  // preload는 CJS(.cjs) 번들을 사용하여 ESM 파싱 오류를 피함
  const preloadPath = join(__dirname, "../preload/index.cjs");

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
/**
 * 앱 데이터가 저장될 userData/data 디렉터리를 생성하고 DATADIR 환경변수를 세팅
 */
// DATADIR가 설정돼 있으면 그대로 사용해 모든 프로세스가 한 DB를 바라보도록 함
async function ensureDataDir() {
  const configured = process.env.DATADIR;
  if (configured) {
    const base = process.env.DAYGRAPH_ROOT ?? process.env.INIT_CWD ?? process.cwd();
    const resolvedDir = isAbsolute(configured) ? configured : resolve(base, configured);
    try {
      await fs.mkdir(resolvedDir, { recursive: true });
    } catch (err) {
      console.error("[dataDir] mkdir failed", err);
    }
    process.env.DATADIR = resolvedDir;
    return resolvedDir;
  }

  const dir = join(app.getPath("userData"), "data");
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error("[dataDir] mkdir failed", err);
  }
  process.env.DATADIR = dir;
  return dir;
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

const collectorPort = Number(process.env.COLLECTOR_API_PORT || 8787);
const collectorHost = process.env.COLLECTOR_API_HOST || "127.0.0.1";
const collectorBaseUrl = process.env.COLLECTOR_API_URL || `http://${collectorHost}:${collectorPort}`;

// Typed IPC: collector HTTP API를 통해 당일 로그 조회
ipcMain.handle(IPC.channels.queryDay, async (_e, dateISO: string) => {
  try {
    const url = new URL("/logs", collectorBaseUrl);
    url.searchParams.set("date", dateISO);
    const res = await fetch(url, {
      headers: { "accept": "application/json" },
    });
    if (!res.ok) throw new Error(`collector api ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[queryDay] collector api failed:", err);
    return [];
  }
});

app.whenReady().then(async () => {
  await ensureDataDir();
  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
