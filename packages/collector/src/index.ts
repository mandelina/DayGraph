import "dotenv/config";
import { insertActivity } from "@daygraph/db/queries";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { resolveAppPathFromBundleId } from "./app-path";
import { getActiveWindow } from "./active-window";
import { startApiServer } from "./api";
import { calcDisplayId, getDisplayStatus } from "./display";
import { formatError } from "./errors";
import {
  getInputStatus,
  readInputCounts,
  resetInputCounts,
  setupInputHooks,
  stopInputHooks,
} from "./input";

// pnpm 실행 위치와 관계없이 루트 경로를 고정해 상대 DATADIR이 항상 동일 DB를 가리키도록 함
const repoRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
process.env.DAYGRAPH_ROOT ??= repoRoot;

const missingPathApps = new Set<string>();
const missingBundleApps = new Set<string>();
let isTickRunning = false;
let skippedTicks = 0;
let lastTickAt: string | null = null;
let lastTickDurationMs: number | null = null;
let lastTickError: string | null = null;

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
  const inputCounts = readInputCounts();
  await insertActivity({
    timestamp: now,
    app_name: win.app,
    app_path: resolvedPath,
    bundle_id: win.bundleId ?? null,
    window_title: win.title,
    display_id: await calcDisplayId(win.bounds),
    is_active: true,
    clicks: inputCounts.clicks,
    keypress: inputCounts.keypress,
  });
  // 1초마다 집계 저장 후 초기화
  resetInputCounts();
}

async function runTickOnce() {
  if (isTickRunning) {
    skippedTicks += 1;
    console.warn("[collector] skipped overlapping tick", { skippedTicks });
    return;
  }

  isTickRunning = true;
  const startedAt = Date.now();
  try {
    await tick();
    lastTickAt = new Date().toISOString();
    lastTickError = null;
  } catch (err) {
    lastTickError = formatError(err);
    console.error("[collector] tick failed", err);
  } finally {
    lastTickDurationMs = Date.now() - startedAt;
    isTickRunning = false;
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
    void runTickOnce();
  }, 1000);
  startApiServer(getHealthPayload);
  // 프로세스 유지
  console.log("[collector] started");
}

function getHealthPayload() {
  const inputStatus = getInputStatus();
  const displayStatus = getDisplayStatus();
  return {
    ok: true,
    platform: process.platform,
    inputBackend: inputStatus.inputBackend,
    inputBackendError: inputStatus.inputBackendError,
    displayBackend: displayStatus.displayBackend,
    displayBackendError: displayStatus.displayBackendError,
    pid: process.pid,
    uptimeSeconds: Math.round(process.uptime()),
    tickRunning: isTickRunning,
    skippedTicks,
    lastTickAt,
    lastTickDurationMs,
    lastTickError,
    timestamp: new Date().toISOString(),
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
