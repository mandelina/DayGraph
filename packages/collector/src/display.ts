import type { WindowBounds } from "./active-window";
import { formatError } from "./errors";
import { importOptionalModule } from "./optional-import";

type MonitorInfo = { id: number; bounds: WindowBounds };

let displayBackend = "coordinate-fallback";
let displayBackendError: string | null = null;
let monitorCache: { loadedAt: number; monitors: MonitorInfo[] } | null = null;

export async function calcDisplayId(bounds?: WindowBounds | undefined) {
  if (!bounds) return null;
  const monitors = await getMonitors();
  if (monitors.length > 0) {
    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
    const match = monitors.find((monitor) =>
      pointInBounds(center, monitor.bounds)
    );
    if (match) return match.id;
  }
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
    }
    return monitors;
  } catch (err) {
    displayBackend = "coordinate-fallback";
    displayBackendError = formatError(err);
    monitorCache = { loadedAt: now, monitors: [] };
    return [];
  }
}

function normalizeMonitors(rawMonitors: unknown): MonitorInfo[] {
  if (!Array.isArray(rawMonitors)) return [];
  return rawMonitors
    .map((monitor, index) => {
      const item = monitor as any;
      const source = item.bounds ?? item.workArea ?? item;
      const bounds = normalizeBounds(source);
      if (!bounds) return null;
      return {
        id: Number(item.id ?? item.displayId ?? index),
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
  if ([x, y, width, height].some((item) => Number.isNaN(item))) {
    return null;
  }
  return { x, y, width, height };
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
