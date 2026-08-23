import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import type { WindowBounds } from "./active-window";
import { formatError } from "./errors";
import { importOptionalModule } from "./optional-import";

type MonitorInfo = { id: number; bounds: WindowBounds };
const execFile = promisify(execFileCallback);

const prebuiltDisplayHelpers = {
  darwin: fileURLToPath(
    new URL("../bin/darwin/daygraph-display-helper", import.meta.url),
  ),
} as const;

let displayBackend = "coordinate-fallback";
let displayBackendError: string | null = null;
let monitorCache: { loadedAt: number; monitors: MonitorInfo[] } | null = null;

export async function calcDisplayId(bounds?: WindowBounds | undefined) {
  if (!bounds) return null;
  const monitors = await getMonitors();
  const match = selectDisplayId(monitors, bounds);
  if (match !== null) return match;
  // 모니터 정보를 얻지 못하면 기존 좌표 기준 추정을 유지한다.
  return bounds.x < 1920 ? 0 : 1;
}

export function getDisplayStatus() {
  return {
    displayBackend,
    displayBackendError,
  };
}

async function getMonitors() {
  const now = Date.now();
  if (monitorCache && now - monitorCache.loadedAt < 5000) {
    return monitorCache.monitors;
  }

  try {
    if (process.platform === "darwin") {
      const monitors = await getMacOSMonitors();
      monitorCache = { loadedAt: now, monitors };
      if (monitors.length > 0) {
        displayBackend = "macos-core-graphics";
        displayBackendError = null;
      } else {
        displayBackend = "coordinate-fallback";
        displayBackendError = "macOS display helper returned no monitors";
      }
      return monitors;
    }

    const mod = await importOptionalModule<any>("node-window-manager");
    const manager = mod.windowManager ?? mod.default?.windowManager;
    const rawMonitors =
      typeof manager?.getMonitors === "function"
        ? manager.getMonitors()
        : typeof manager?.getDisplays === "function"
        ? manager.getDisplays()
        : [];
    const monitors = normalizeMonitors(rawMonitors);
    monitorCache = { loadedAt: now, monitors };
    if (monitors.length > 0) {
      displayBackend = "node-window-manager";
      displayBackendError = null;
    } else {
      displayBackend = "coordinate-fallback";
      displayBackendError = "node-window-manager returned no monitors";
    }
    return monitors;
  } catch (err) {
    displayBackend = "coordinate-fallback";
    displayBackendError = formatError(err);
    monitorCache = { loadedAt: now, monitors: [] };
    return [];
  }
}

async function getMacOSMonitors(): Promise<MonitorInfo[]> {
  const binaryPath = prebuiltDisplayHelpers.darwin;
  await fs.access(binaryPath);
  const result = await execFile(binaryPath, [], {
    encoding: "utf8",
    timeout: 1000,
    maxBuffer: 64 * 1024,
  });
  return parseMacOSMonitorOutput(result.stdout);
}

export function parseMacOSMonitorOutput(output: string): MonitorInfo[] {
  const rawMonitors = output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [id, x, y, width, height] = line.split(",").map(Number);
      return { id, bounds: { x, y, width, height } };
    });
  return normalizeMonitors(rawMonitors);
}

export function normalizeMonitors(rawMonitors: unknown): MonitorInfo[] {
  if (!Array.isArray(rawMonitors)) return [];
  return rawMonitors
    .map((monitor, index) => {
      if (!monitor || typeof monitor !== "object") return null;
      const item = monitor as any;
      let source = item.bounds ?? item.workArea ?? item;
      if (typeof item.getBounds === "function") {
        source = item.getBounds();
      } else if (typeof item.getWorkArea === "function") {
        source = item.getWorkArea();
      }
      const bounds = normalizeBounds(source);
      const id = Number(item.id ?? item.displayId ?? index);
      if (!Number.isFinite(id)) return null;
      if (!bounds) return null;
      return {
        id,
        bounds,
      };
    })
    .filter((monitor): monitor is MonitorInfo => monitor !== null);
}

function normalizeBounds(value: unknown): WindowBounds | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<WindowBounds>;
  const x = Number(source.x);
  const y = Number(source.y);
  const width = Number(source.width);
  const height = Number(source.height);
  if (
    [x, y, width, height].some((item) => !Number.isFinite(item)) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }
  return { x, y, width, height };
}

export function selectDisplayId(
  monitors: MonitorInfo[],
  bounds: WindowBounds,
) {
  const center = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
  const match = monitors.find((monitor) =>
    pointInBounds(center, monitor.bounds),
  );
  return match?.id ?? null;
}

function pointInBounds(
  point: { x: number; y: number },
  bounds: WindowBounds
) {
  return (
    point.x >= bounds.x &&
    point.x < bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y < bounds.y + bounds.height
  );
}
