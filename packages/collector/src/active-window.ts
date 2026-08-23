import { importOptionalModule } from "./optional-import";
import { formatError } from "./errors";

export type WindowBounds = { x: number; y: number; width: number; height: number };

export type ActiveWindowInfo = {
  app: string;
  path: string | null;
  bundleId: string | null;
  title: string;
  bounds?: WindowBounds | undefined;
};

type ActiveWindowStatus = {
  activeWindowBackend: "get-windows" | "unavailable";
  activeWindowBackendError: string | null;
};

let activeWindowBackend: ActiveWindowStatus["activeWindowBackend"] =
  "unavailable";
let activeWindowBackendError: string | null = "not initialized";
let lastLoggedError: string | null = null;

// 권한/네이티브 backend 실패 시 가짜 activity를 저장하지 않고 null을 반환한다.
export async function getActiveWindow(): Promise<ActiveWindowInfo | null> {
  try {
    const mod = await importOptionalModule<any>("get-windows");
    const activeWindow = mod.activeWindow ?? mod.default?.activeWindow;
    if (typeof activeWindow !== "function") {
      throw new Error("get-windows does not expose activeWindow");
    }
    const res = await activeWindow();
    if (!res) {
      activeWindowBackend = "get-windows";
      activeWindowBackendError = "no active window returned";
      return null;
    }

    activeWindowBackend = "get-windows";
    activeWindowBackendError = null;
    lastLoggedError = null;

    return {
      app: res.owner?.name ?? "Unknown",
      path: res.owner?.path ?? null,
      bundleId: res.owner?.bundleId ?? null,
      title: res.title ?? "Unknown",
      bounds: res.bounds as WindowBounds | undefined,
    };
  } catch (err) {
    activeWindowBackend = "unavailable";
    activeWindowBackendError = formatError(err);
    if (lastLoggedError !== activeWindowBackendError) {
      lastLoggedError = activeWindowBackendError;
      console.warn("[collector][active-window] unavailable", activeWindowBackendError);
    }
    return null;
  }
}

export function getActiveWindowStatus(): ActiveWindowStatus {
  return {
    activeWindowBackend,
    activeWindowBackendError,
  };
}
