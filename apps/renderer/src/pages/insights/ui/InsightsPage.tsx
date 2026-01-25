import { FocusPatternGrid } from "../../../widgets/insights/FocusPatternGrid";
import { AppBehaviorInsights } from "../../../widgets/insights/AppBehaviorInsights";
import { InsightSummary } from "../../../widgets/insights/InsightSummary";
import { useInsightsMock } from "./mock-data";

export function InsightsPage() {
  const data = useInsightsMock();
  return (
    <>
      <header className="bg-accent text-foreground px-4 py-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide font-semibold text-foreground/80">
            Insights
          </div>
          <div className="text-2xl font-bold">집중 패턴 자동 해석</div>
        </div>
        <div className="text-sm text-foreground/70">해석과 회고</div>
      </header>
      <InsightSummary summary={data.summary} />
      <FocusPatternGrid patterns={data.patterns} />
      <AppBehaviorInsights insights={data.appInsights} />
    </>
  );
}
