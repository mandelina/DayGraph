import { WeeklySummary } from "../../../widgets/weekly/WeeklySummary";
import { WeeklyTrend } from "../../../widgets/weekly/WeeklyTrend";
import { WeeklyInsights } from "../../../widgets/weekly/WeeklyInsights";
import { WeeklyMockData } from "../../weekly/ui/mock-data";

export function WeeklyPage() {
  const { dailySummary, appTrend, insights } = WeeklyMockData();
  return (
    <>
      <header className="bg-primary text-surface px-4 py-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide font-semibold">
            Weekly
          </div>
          <div className="text-2xl font-bold">
            이번 주 집중 패턴 요약
          </div>
        </div>
        <div className="text-sm text-surface/70">패턴 비교</div>
      </header>
      <WeeklySummary summary={dailySummary} />
      <WeeklyTrend trend={appTrend} />
      <WeeklyInsights insights={insights} />
    </>
  );
}
