import { useEffect, useState } from "react";
import type { CollectorStatusResponse } from "@daygraph/shared/ipc";
import { ScoreWeightsPanel } from "../../../widgets/settings/ScoreWeightsPanel";
import { DataPrivacyPanel } from "../../../widgets/settings/DataPrivacyPanel";
import { UIOptionsPanel } from "../../../widgets/settings/UIOptionsPanel";
import { SystemStatusPanel } from "../../../widgets/settings/SystemStatusPanel";
import { useSettingsMock } from "./mock-data";

export function SettingsPage() {
  const data = useSettingsMock();
  const collectorStatus = useCollectorStatus();
  return (
    <>
      <header className="bg-primary text-surface px-4 py-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide font-semibold">
            Settings
          </div>
          <div className="text-2xl font-bold">
            DayGraph 기준과 제어
          </div>
        </div>
        <div className="text-sm text-surface/70">환경 설정</div>
      </header>
      <ScoreWeightsPanel weights={data.scoreWeights} />
      <DataPrivacyPanel options={data.privacy} />
      <UIOptionsPanel options={data.uiOptions} />
      <SystemStatusPanel
        status={{
          ...data.systemStatus,
          collector: getCollectorLabel(collectorStatus),
          lastSync: getLastStatusLabel(collectorStatus),
          inputBackend: collectorStatus?.inputBackend ?? "unknown",
          displayBackend: collectorStatus?.displayBackend ?? "unknown",
          error:
            collectorStatus?.error ??
            collectorStatus?.inputBackendError ??
            collectorStatus?.displayBackendError ??
            collectorStatus?.lastTickError ??
            null,
        }}
      />
    </>
  );
}

function useCollectorStatus() {
  const [status, setStatus] = useState<CollectorStatusResponse | null>(null);

  useEffect(() => {
    let disposed = false;

    const fetchStatus = () => {
      window.api
        ?.getCollectorStatus?.()
        .then((nextStatus) => {
          if (!disposed) setStatus(nextStatus);
        })
        .catch((err) => {
          if (!disposed) {
            setStatus({
              ok: false,
              reachable: false,
              url: "",
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
              error: err instanceof Error ? err.message : String(err),
            });
          }
        });
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}

function getCollectorLabel(status: CollectorStatusResponse | null) {
  if (!status) return "checking";
  return status.reachable && status.ok ? "running" : "unreachable";
}

function getLastStatusLabel(status: CollectorStatusResponse | null) {
  if (!status) return "확인 중";
  return new Date(status.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
