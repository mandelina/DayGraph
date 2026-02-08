import { app, BrowserWindow, ipcMain, nativeImage } from "electron";
import { join, resolve, isAbsolute } from "node:path";
import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
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
    const base =
      process.env.DAYGRAPH_ROOT ?? process.env.INIT_CWD ?? process.cwd();
    const resolvedDir = isAbsolute(configured)
      ? configured
      : resolve(base, configured);
    try {
      await fs.mkdir(resolvedDir, { recursive: true });
    } catch (err) {
      console.error("[dataDir] mkdir failed", err);
    }
    process.env.DATADIR = resolvedDir;
    await ensureIconDir(resolvedDir);
    console.log("[dataDir] using configured", { datadir: resolvedDir });
    return resolvedDir;
  }

  const dir = join(app.getPath("userData"), "data");
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error("[dataDir] mkdir failed", err);
  }
  process.env.DATADIR = dir;
  await ensureIconDir(dir);
  console.log("[dataDir] using userData", {
    userData: app.getPath("userData"),
    datadir: dir,
  });
  return dir;
}

async function ensureIconDir(baseDir: string) {
  const iconsDir = join(baseDir, "icons");
  try {
    await fs.mkdir(iconsDir, { recursive: true });
  } catch (err) {
    console.error("[iconsDir] mkdir failed", err);
  }
  iconCacheDir = iconsDir;
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
const collectorBaseUrl =
  process.env.COLLECTOR_API_URL || `http://${collectorHost}:${collectorPort}`;
const iconMemoryCache = new Map<
  string,
  { dataUrl: string | null; stamp: number | null }
>();
const bundlePathCache = new Map<string, string | null>();
let iconCacheDir: string | null = null;

async function ensureAppReady() {
  if (!app.isReady()) {
    await app.whenReady();
  }
}

// Typed IPC: collector HTTP API를 통해 당일 로그 조회
ipcMain.handle(IPC.channels.queryDay, async (_e, dateISO: string) => {
  try {
    const url = new URL("/logs", collectorBaseUrl);
    url.searchParams.set("date", dateISO);
    const res = await fetch(url, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`collector api ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[queryDay] collector api failed:", err);
    return [];
  }
});

ipcMain.handle(
  IPC.channels.getAppIcon,
  async (
    _e,
    payload?: { appPath?: string | null; bundleId?: string | null }
  ) => {
    const appPath = payload?.appPath ?? null;
    const bundleId = payload?.bundleId ?? null;

    if (bundleId) {
      console.log("[icon][request] bundle", { bundleId, appPath });
      const cacheKey = `bundle:${bundleId}`;
      const memoryHit = iconMemoryCache.get(cacheKey);
      if (memoryHit) {
        console.log("[icon][cache] bundle hit", bundleId);
        return memoryHit.dataUrl;
      }
      const resolvedPath = await resolveAppPathFromBundleId(bundleId);
      console.log("[icon][bundle] resolved", { bundleId, resolvedPath });
      if (resolvedPath) {
        const icon = await getIconFromPath(resolvedPath);
        iconMemoryCache.set(cacheKey, { dataUrl: icon, stamp: null });
        return icon;
      }
      iconMemoryCache.set(cacheKey, { dataUrl: null, stamp: null });
      return null;
    }

    if (!appPath) return null;
    return getIconFromPath(appPath);
  }
);

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

async function getFileMtime(target: string) {
  try {
    const stat = await fs.stat(target);
    return stat.mtimeMs;
  } catch (err) {
    console.warn("[getFileMtime] failed", target, err);
    return null;
  }
}

function getIconCachePaths(appPath: string) {
  if (!iconCacheDir) return null;
  const key = createHash("sha1").update(appPath).digest("hex");
  const iconPath = join(iconCacheDir, `${key}.png`);
  const metaPath = join(iconCacheDir, `${key}.json`);
  return { iconPath, metaPath };
}

async function readIconFromDisk(appPath: string, mtime: number) {
  const paths = getIconCachePaths(appPath);
  if (!paths) return null;
  try {
    const metaRaw = await fs.readFile(paths.metaPath, "utf8");
    const meta = JSON.parse(metaRaw) as { mtime: number };
    if (Math.abs(meta.mtime - mtime) > 1) {
      return null;
    }
    const buffer = await fs.readFile(paths.iconPath);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

async function persistIcon(
  appPath: string,
  icon: nativeImage,
  mtime: number
): Promise<string | null> {
  const paths = getIconCachePaths(appPath);
  const buffer = icon.toPNG();
  if (paths) {
    try {
      await fs.writeFile(paths.iconPath, buffer);
      await fs.writeFile(
        paths.metaPath,
        JSON.stringify({ mtime, savedAt: Date.now() }),
        "utf8"
      );
    } catch (err) {
      console.warn("[persistIcon] failed", err);
    }
  }
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function getIconFromPath(appPath: string) {
  const cacheKey = `path:${appPath}`;
  const mtime = await getFileMtime(appPath);
  if (!mtime) return null;

  const memoryHit = iconMemoryCache.get(cacheKey);
  if (
    memoryHit &&
    memoryHit.stamp !== null &&
    Math.abs(memoryHit.stamp - mtime) < 1
  ) {
    console.log("[icon][cache] path hit", appPath);
    return memoryHit.dataUrl;
  }

  const diskHit = await readIconFromDisk(appPath, mtime);
  if (diskHit !== null) {
    console.log("[icon][disk] path hit", appPath);
    iconMemoryCache.set(cacheKey, { dataUrl: diskHit, stamp: mtime });
    return diskHit;
  }

  const bundleIcon = await loadBundleIcon(appPath);
  if (bundleIcon) {
    const dataUrl = await persistIcon(appPath, bundleIcon, mtime);
    console.log("[icon][bundle-file] fetched", appPath);
    iconMemoryCache.set(cacheKey, { dataUrl, stamp: mtime });
    return dataUrl;
  }

  try {
    await ensureAppReady();
    const fallbackIcon = await app.getFileIcon(appPath, { size: "normal" });
    const dataUrl = await persistIcon(appPath, fallbackIcon, mtime);
    console.log("[icon][file] fetched", appPath);
    iconMemoryCache.set(cacheKey, { dataUrl, stamp: mtime });
    return dataUrl;
  } catch (err) {
    console.warn("[getAppIcon:path] failed", appPath, err);
    iconMemoryCache.set(cacheKey, { dataUrl: null, stamp: mtime });
    return null;
  }
}

async function loadBundleIcon(appPath: string) {
  await ensureAppReady();
  const infoPlist = join(appPath, "Contents", "Info.plist");
  try {
    const plistRaw = await fs.readFile(infoPlist, "utf8");
    const iconNames = extractIconNames(plistRaw);
    console.log("[icon][bundle-file] candidates", { appPath, infoPlist, iconNames });
    for (const name of iconNames) {
      const normalized = name.endsWith(".icns") ? name : `${name}.icns`;
      const iconPath = join(appPath, "Contents", "Resources", normalized);
      try {
        await fs.access(iconPath);
        console.log("[icon][bundle-file] candidate exists", { iconPath });
        const pngBuffer = await convertIcnsToPng(iconPath);
        if (pngBuffer) {
          const image = nativeImage.createFromBuffer(pngBuffer);
          if (!image.isEmpty()) {
            console.log("[icon][bundle-file] hit", { appPath, iconPath });
            return image;
          }
          console.warn("[icon][bundle-file] buffer empty image", { iconPath });
        } else {
          console.warn("[icon][bundle-file] conversion failed", { iconPath });
        }
        const fallbackImage = nativeImage.createFromPath(iconPath);
        if (!fallbackImage.isEmpty()) {
          console.log("[icon][bundle-file] fallback hit", { appPath, iconPath });
          return fallbackImage;
        }
        console.warn("[icon][bundle-file] empty image", { iconPath });
      } catch (err) {
        console.warn("[icon][bundle-file] candidate missing", { iconPath, err });
        continue;
      }
    }
  } catch (err) {
    console.warn("[icon][bundle-file] plist read failed", appPath, err);
  }
  console.warn("[icon][bundle-file] no icon found", appPath);
  return null;
}

function extractIconNames(plistRaw: string) {
  const names = new Set<string>();
  const single = plistRaw.match(
    /<key>CFBundleIconFile<\/key>\s*<string>([^<]+)<\/string>/
  );
  if (single?.[1]) names.add(single[1]);
  const iconName = plistRaw.match(
    /<key>CFBundleIconName<\/key>\s*<string>([^<]+)<\/string>/
  );
  if (iconName?.[1]) names.add(iconName[1]);
  const arrayMatch = plistRaw.match(
    /<key>CFBundleIconFiles<\/key>\s*<array>([\s\S]*?)<\/array>/
  );
  if (arrayMatch) {
    for (const match of arrayMatch[1].matchAll(/<string>([^<]+)<\/string>/g)) {
      if (match[1]) names.add(match[1]);
    }
  }
  if (names.size === 0) {
    names.add("AppIcon");
    names.add("Icon");
  }
  return Array.from(names);
}

async function convertIcnsToPng(iconPath: string) {
  let workspace: string | null = null;
  try {
    workspace = await fs.mkdtemp(join(tmpdir(), "daygraph-icon-"));
    const iconsetDir = join(workspace, "icon.iconset");
    await fs.mkdir(iconsetDir, { recursive: true });
    await execFileAsync("iconutil", ["-c", "iconset", iconPath, "-o", iconsetDir]);
    const preferred = [
      "icon_1024x1024.png",
      "icon_512x512x2.png",
      "icon_512x512.png",
      "icon_256x256.png",
      "icon_128x128.png",
      "icon_64x64.png",
      "icon_32x32.png",
      "icon_16x16.png",
    ];
    for (const file of preferred) {
      const target = join(iconsetDir, file);
      try {
        const buffer = await fs.readFile(target);
        if (buffer.length > 0) {
          console.log("[icon][bundle-file] iconutil hit", { iconPath, target });
          return buffer;
        }
      } catch {}
    }
    const files = await fs.readdir(iconsetDir);
    for (const file of files) {
      if (!file.endsWith(".png")) continue;
      const target = join(iconsetDir, file);
      try {
        const buffer = await fs.readFile(target);
        if (buffer.length > 0) {
          console.log("[icon][bundle-file] iconutil fallback", {
            iconPath,
            target,
          });
          return buffer;
        }
      } catch {}
    }
    console.warn("[icon][bundle-file] iconutil produced no png", { iconPath });
    return null;
  } catch (err) {
    console.warn("[icon][bundle-file] iconutil failed", { iconPath, err });
    return null;
  } finally {
    if (workspace) {
      await fs.rm(workspace, { recursive: true, force: true }).catch(() => {});
    }
  }
}

async function resolveAppPathFromBundleId(bundleId: string) {
  if (process.platform !== "darwin") return null;
  if (bundlePathCache.has(bundleId)) {
    return bundlePathCache.get(bundleId) ?? null;
  }
  try {
    const spotlightPath = await runMdfind(bundleId);
    console.log("[icon][bundle] spotlight", { bundleId, spotlightPath });
    if (spotlightPath) {
      bundlePathCache.set(bundleId, spotlightPath);
      return spotlightPath;
    }
  } catch (err) {
    console.warn("[resolveAppPath] mdfind failed", bundleId, err);
  }

  const fallback = await scanCommonAppDirs(bundleId);
  console.log("[icon][bundle] fallback", { bundleId, fallback });
  bundlePathCache.set(bundleId, fallback);
  return fallback;
}

const execFileAsync = promisify(execFile);

async function runMdfind(bundleId: string): Promise<string | null> {
  const query = `kMDItemCFBundleIdentifier == "${bundleId}"`;
  const { stdout } = await execFileAsync("mdfind", [query]);
  const line = stdout
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.endsWith(".app"))[0];
  return line || null;
}

async function scanCommonAppDirs(bundleId: string) {
  const dirs = [
    "/Applications",
    join(app.getPath("home"), "Applications"),
    "/System/Applications",
  ];
  for (const dir of dirs) {
    const match = await findBundleInDir(dir, bundleId);
    if (match) {
      return match;
    }
  }
  return null;
}

async function findBundleInDir(baseDir: string, bundleId: string) {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.endsWith(".app")) {
        const fullPath = join(baseDir, entry.name);
        const id = await readBundleId(fullPath);
        if (id === bundleId) {
          return fullPath;
        }
      }
    }
  } catch {}
  return null;
}

async function readBundleId(appPath: string) {
  try {
    const infoPlist = join(appPath, "Contents", "Info.plist");
    const raw = await fs.readFile(infoPlist, "utf8");
    const match = raw.match(
      /<key>CFBundleIdentifier<\/key>\s*<string>([^<]+)<\/string>/
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
