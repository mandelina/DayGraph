import { useState } from "react";
import type { CollectorStatusResponse } from "@daygraph/shared/ipc";
import { ACTIVITY_SCORE_WEIGHTS } from "../../../entities/activity/lib/calculateScore";
import { ScoreWeightsPanel } from "../../../widgets/settings/ScoreWeightsPanel";
import { DataPrivacyPanel } from "../../../widgets/settings/DataPrivacyPanel";
import { UIOptionsPanel } from "../../../widgets/settings/UIOptionsPanel";
import { SystemStatusPanel } from "../../../widgets/settings/SystemStatusPanel";
import { PageHeader } from "../../../shared/ui/PageHeader";

export function SettingsPage({
  theme,
  collectorStatus,
}: {
  theme: "dark" | "light";
  collectorStatus: CollectorStatusResponse | null;
}) {
  const [openError, setOpenError] = useState<string | null>(null);

  const openDataDir = () => {
    const request = window.api?.openDataDir?.();
    if (!request) {
      setOpenError("Electron API unavailable; cannot open the data directory.");
      return;
    }
    request
      .then((result) => setOpenError(result.ok ? null : result.error))
      .catch((error: unknown) => setOpenError(formatError(error)));
  };

  const collectorRunning =
    collectorStatus?.reachable === true && collectorStatus.status !== "degraded";

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Settings / Trust center"
        title="DayGraph 기준과 제어"
        description="점수 계산, 저장 위치, 시스템 상태를 확인합니다."
        meta={<>Local<br />Settings</>}
        tone="neutral"
      />
      <ScoreWeightsPanel weights={ACTIVITY_SCORE_WEIGHTS} />
      <div className="grid gap-5 xl:grid-cols-2">
        <DataPrivacyPanel
          options={{
            dataDir: collectorStatus?.dataDir ?? "확인할 수 없음",
            collector: collectorRunning,
            inputBackend: collectorStatus?.inputBackend ?? "unknown",
            activeWindowBackend:
              collectorStatus?.activeWindowBackend ?? "unknown",
          }}
          openError={openError}
          onOpenDataDir={openDataDir}
        />
        <UIOptionsPanel
          options={{
            theme: theme === "dark" ? "Dark" : "Light",
            density: "Detailed",
          }}
        />
      </div>
      <SystemStatusPanel
        status={{
          collector: getCollectorLabel(collectorStatus),
          lastSync: getLastStatusLabel(collectorStatus),
          autoUpdate: "Not configured",
          inputBackend: collectorStatus?.inputBackend ?? "unknown",
          displayBackend: collectorStatus?.displayBackend ?? "unknown",
          activeWindowBackend:
            collectorStatus?.activeWindowBackend ?? "unknown",
          dataQuality: collectorStatus?.dataQuality ?? "unavailable",
          error:
            collectorStatus?.error ??
            collectorStatus?.inputBackendError ??
            collectorStatus?.activeWindowBackendError ??
            collectorStatus?.displayBackendError ??
            collectorStatus?.lastTickError ??
            null,
        }}
      />
    </div>
  );
}

function getCollectorLabel(status: CollectorStatusResponse | null) {
  if (!status) return "checking";
  if (!status.reachable) return "unreachable";
  return status.status === "degraded" ? "degraded" : "running";
}

function getLastStatusLabel(status: CollectorStatusResponse | null) {
  if (!status?.timestamp) return "확인 중";
  return new Date(status.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
