import { useEffect, useState } from "react";
import type { CollectorStatusResponse } from "@daygraph/shared/ipc";

const POLL_INTERVAL_MS = 5000;

export function useCollectorStatus(enabled = true) {
  const [status, setStatus] = useState<CollectorStatusResponse | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    const fetchStatus = () => {
      const request = window.api?.getCollectorStatus?.();
      if (!request) {
        if (!disposed) {
          setStatus(createUnavailableStatus("Electron API unavailable"));
        }
        return;
      }
      request
        .then((nextStatus) => {
          if (!disposed) setStatus(nextStatus);
        })
        .catch((error: unknown) => {
          if (!disposed) setStatus(createUnavailableStatus(formatError(error)));
        });
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, [enabled]);

  return status;
}

export function getCollectorStatusIssue(
  status: CollectorStatusResponse | null,
) {
  if (!status || (status.reachable && status.status === "healthy")) {
    return null;
  }
  return (
    status.error ??
    status.inputBackendError ??
    status.activeWindowBackendError ??
    status.displayBackendError ??
    status.lastTickError ??
    (status.reachable
      ? "Collector가 일부 기능만 사용 가능한 상태입니다."
      : "Collector에 연결할 수 없습니다.")
  );
}

export function createUnavailableStatus(error: string): CollectorStatusResponse {
  return {
    ok: false,
    status: "degraded",
    reachable: false,
    url: "",
    dataDir: null,
    dataQuality: "unavailable",
    activeWindowBackend: null,
    activeWindowBackendError: null,
    platform: null,
    inputBackend: null,
    inputBackendError: null,
    displayBackend: null,
    displayBackendError: null,
    pid: null,
    uptimeSeconds: null,
    tickRunning: false,
    skippedTicks: 0,
    lastTickAt: null,
    lastTickDurationMs: null,
    lastTickError: null,
    timestamp: new Date().toISOString(),
    error,
  };
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
