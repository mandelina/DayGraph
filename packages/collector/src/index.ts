import "dotenv/config";
import { insertActivity, queryDay } from "@daygraph/db/queries";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { createServer } from "node:http";
import { parse } from "node:url";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";
import { promises as fs } from "node:fs";
import { createInterface } from "node:readline";

// pnpm 실행 위치와 관계없이 루트 경로를 고정해 상대 DATADIR이 항상 동일 DB를 가리키도록 함
const repoRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
process.env.DAYGRAPH_ROOT ??= repoRoot;
const fallbackApps = ["Cat", "Rabbit", "Hamster"];
const bundlePathCache = new Map<string, string | null>();
const execFileAsync = promisify(execFile);
const prebuiltInputHelpers = {
  darwin: fileURLToPath(new URL("../bin/darwin/daygraph-input-helper", import.meta.url)),
} as const;

// 네이티브 의존성은 개발 편의상 optional로 두고, 실패 시 목업으로 대체
type ActiveWindowInfo = {
  app: string;
  path: string | null;
  bundleId: string | null;
  title: string;
  bounds?: { x: number; y: number; width: number; height: number } | undefined;
};

async function getActiveWindow(): Promise<ActiveWindowInfo> {
  try {
    const mod = await import("active-win");
    const res = await (mod.default as any)();

    return {
      app: res.owner?.name ?? "Unknown",
      path: res.owner?.path ?? null,
      bundleId: res.owner?.bundleId ?? null,
      title: res.title ?? "Unknown",
      bounds: res.bounds as
        | { x: number; y: number; width: number; height: number }
        | undefined,
    };
  } catch (e) {
    console.log("res error : ", e);

    // 목업: 간단 라운드 로빈 앱 이름
    const i = Math.floor(Date.now() / 5000) % fallbackApps.length;
    return {
      app: fallbackApps[i],
      path: null,
      bundleId: null,
      title: `${fallbackApps[i]} — Mock`,
      bounds: { x: 0, y: 0, width: 100, height: 100 },
    };
  }
}

// 입력 카운터는 별도 helper 프로세스 stdout 이벤트를 1초 버킷으로 누적
let clicks = 0;
let keypress = 0;
const missingPathApps = new Set<string>();
const missingBundleApps = new Set<string>();
let inputHelperProcess: ReturnType<typeof spawn> | null = null;
let inputBackend = "noop";
let inputBackendError: string | null = null;

async function setupInputHooks() {
  if (process.platform !== "darwin") {
    inputBackendError = `input helper unsupported on ${process.platform}`;
    console.warn("[collector][input]", inputBackendError);
    return;
  }

  try {
    const binary = await getPrebuiltInputHelperPath();
    await startMacInputHelper(binary);
    inputBackend = "macos-event-tap";
    inputBackendError = null;
    console.log("[collector][input] backend ready", inputBackend);
  } catch (err) {
    inputBackend = "noop";
    inputBackendError = formatError(err);
    console.error("[collector][input] helper setup failed", err);
  }
}

async function getPrebuiltInputHelperPath() {
  const binaryPath = prebuiltInputHelpers.darwin;
  try {
    await fs.access(binaryPath);
  } catch {
    throw new Error(
      `missing prebuilt input helper: ${binaryPath}. Run 'pnpm -C packages/collector build:helper:darwin'.`
    );
  }
  return binaryPath;
}

async function startMacInputHelper(binaryPath: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(binaryPath, [], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    inputHelperProcess = child;

    const lines = createInterface({ input: child.stdout });
    lines.on("line", (line) => {
      if (line === "k") {
        keypress += 1;
        return;
      }
      if (line === "c") {
        clicks += 1;
        return;
      }
      if (line) {
        console.warn("[collector][input] unknown event", line);
      }
    });

    child.stderr.on("data", (chunk) => {
      const message = chunk.toString().trim();
      if (message) {
        console.warn("[collector][input]", message);
      }
    });

    let settled = false;
    const readyTimer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve();
      }
    }, 150);

    child.once("error", (err) => {
      clearTimeout(readyTimer);
      lines.close();
      inputHelperProcess = null;
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    child.once("exit", (code, signal) => {
      clearTimeout(readyTimer);
      lines.close();
      inputHelperProcess = null;
      const reason = `helper exited (code=${code ?? "null"}, signal=${
        signal ?? "null"
      })`;
      inputBackend = "noop";
      inputBackendError = reason;
      if (!settled) {
        settled = true;
        reject(new Error(reason));
        return;
      }
      console.warn("[collector][input]", reason);
    });
  });
}

function stopInputHooks() {
  if (inputHelperProcess && !inputHelperProcess.killed) {
    inputHelperProcess.kill();
  }
}

function formatError(err: unknown) {
  if (err instanceof Error) return err.message;
  return String(err);
}

function calcDisplayId(
  bounds?: { x: number; y: number; width: number; height: number } | undefined
) {
  // 간단히 좌표 기준으로 가짜 디스플레이 ID 추정 (0 또는 1)
  if (!bounds) return null;
  return bounds.x < 1920 ? 0 : 1;
}

async function tick() {
  const win = await getActiveWindow();
  const now = new Date().toISOString();
  if (!win.path && !missingPathApps.has(win.app)) {
    missingPathApps.add(win.app);
    console.warn("[collector] app path missing", {
      app: win.app,
      title: win.title,
    });
  }
  if (!win.bundleId && !missingBundleApps.has(win.app)) {
    missingBundleApps.add(win.app);
    console.warn("[collector] bundle id missing", {
      app: win.app,
      title: win.title,
    });
  }
  let resolvedPath = win.path ?? null;
  if (process.platform === "darwin" && win.bundleId) {
    const canonical = await resolveAppPathFromBundleId(win.bundleId);
    if (canonical) {
      if (resolvedPath && resolvedPath !== canonical) {
        console.log("[collector] path patched", {
          app: win.app,
          from: resolvedPath,
          to: canonical,
        });
      }
      resolvedPath = canonical;
    } else {
      console.warn("[collector] bundleId resolve failed", {
        app: win.app,
        bundleId: win.bundleId,
      });
    }
  }
  await insertActivity({
    timestamp: now,
    app_name: win.app,
    app_path: resolvedPath,
    bundle_id: win.bundleId ?? null,
    window_title: win.title,
    display_id: calcDisplayId(win.bounds),
    is_active: true,
    clicks,
    keypress,
  });
  // 1초마다 집계 저장 후 초기화
  clicks = 0;
  keypress = 0;
}

/**
 * bundleId 기준으로 Spotlight/폴더 스캔을 수행해 대표 앱 경로를 캐시한다.
 */
async function resolveAppPathFromBundleId(bundleId: string) {
  if (bundlePathCache.has(bundleId)) {
    return bundlePathCache.get(bundleId) ?? null;
  }
  try {
    const spotlight = await runMdfind(bundleId);
    if (spotlight) {
      bundlePathCache.set(bundleId, spotlight);
      return spotlight;
    }
  } catch (err) {
    console.warn("[collector] mdfind failed", bundleId, err);
  }
  const fallback = await scanCommonAppDirs(bundleId);
  bundlePathCache.set(bundleId, fallback);
  return fallback;
}

/**
 * macOS Spotlight(mdfind)로 CFBundleIdentifier에 해당하는 .app 경로를 찾는다.
 */
async function runMdfind(bundleId: string): Promise<string | null> {
  const query = `kMDItemCFBundleIdentifier == "${bundleId}"`;
  const { stdout } = await execFileAsync("mdfind", [query]);
  const first = stdout
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.endsWith(".app"))[0];
  return first || null;
}

/**
 * Spotlight 실패 시 /Applications 등 대표 경로를 순회하며 번들을 찾는다.
 */
async function scanCommonAppDirs(bundleId: string) {
  const dirs = [
    "/Applications",
    join(homedir(), "Applications"),
    "/System/Applications",
  ];
  for (const dir of dirs) {
    const match = await findBundleInDir(dir, bundleId);
    if (match) return match;
  }
  return null;
}

/**
 * 주어진 디렉터리의 .app 폴더를 스캔해 Info.plist와 bundleId를 비교한다.
 */
async function findBundleInDir(baseDir: string, bundleId: string) {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.endsWith(".app")) {
        const full = join(baseDir, entry.name);
        const id = await readBundleId(full);
        if (id === bundleId) return full;
      }
    }
  } catch {}
  return null;
}

/**
 * Info.plist에서 CFBundleIdentifier 문자열을 추출한다.
 */
async function readBundleId(appPath: string) {
  try {
    const plist = await fs.readFile(join(appPath, "Contents", "Info.plist"), "utf8");
    const match = plist.match(/<key>CFBundleIdentifier<\/key>\s*<string>([^<]+)<\/string>/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function main() {
  await setupInputHooks();
  process.once("exit", stopInputHooks);
  process.once("SIGINT", () => {
    stopInputHooks();
    process.exit(0);
  });
  process.once("SIGTERM", () => {
    stopInputHooks();
    process.exit(0);
  });
  // 루프 ≤ 5ms/틱 유지: 실제 작업은 DB insert 1초/회
  setInterval(() => {
    void tick();
  }, 1000);
  startApiServer();
  // 프로세스 유지
  // eslint-disable-next-line
  console.log("[collector] started");
}

function startApiServer() {
  const port = Number(process.env.COLLECTOR_API_PORT || 8787);
  const host = process.env.COLLECTOR_API_HOST || "127.0.0.1";
  const server = createServer(async (req, res) => {
    const url = parse(req.url || "", true);
    if (req.method === "GET" && url.pathname === "/logs") {
      const date =
        typeof url.query.date === "string"
          ? url.query.date
          : new Date().toISOString().slice(0, 10);
      try {
        const rows = await queryDay(date);
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(rows));
      } catch (err) {
        console.error("[api] query failed", err);
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "collector query failed" }));
      }
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(port, host, () => {
    console.log(`[collector] api listening at http://${host}:${port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
