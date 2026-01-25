import { ScoreWeightsPanel } from "../../../widgets/settings/ScoreWeightsPanel";
import { DataPrivacyPanel } from "../../../widgets/settings/DataPrivacyPanel";
import { UIOptionsPanel } from "../../../widgets/settings/UIOptionsPanel";
import { SystemStatusPanel } from "../../../widgets/settings/SystemStatusPanel";
import { useSettingsMock } from "./mock-data";

export function SettingsPage() {
  const data = useSettingsMock();
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
      <SystemStatusPanel status={data.systemStatus} />
    </>
  );
}
