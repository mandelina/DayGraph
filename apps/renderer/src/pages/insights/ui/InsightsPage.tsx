import { useMemo } from "react";
import { useActivityRange } from "../../../app/providers/useActivityRange";
import {
  buildInsightReport,
  getWeeklyQueryRange,
} from "../../../entities/activity/lib/reports";
import { FocusPatternGrid } from "../../../widgets/insights/FocusPatternGrid";
import { AppBehaviorInsights } from "../../../widgets/insights/AppBehaviorInsights";
import { InsightSummary } from "../../../widgets/insights/InsightSummary";

export function InsightsPage() {
  const range = useMemo(() => getWeeklyQueryRange(), []);
  const { rows, loadState, errorMessage } = useActivityRange(
    range.currentStartISO,
    range.currentEndISO,
  );
  const report = useMemo(
    () =>
      buildInsightReport(rows, range.currentStartISO, range.currentEndISO),
    [rows, range.currentStartISO, range.currentEndISO],
  );

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
      <InsightStateNotice loadState={loadState} errorMessage={errorMessage} />
      {report.hasData ? (
        <>
          <InsightSummary summary={report.summary} />
          <FocusPatternGrid patterns={report.patterns} />
          <AppBehaviorInsights insights={report.appInsights} />
        </>
      ) : loadState !== "loading" ? (
        <section className="bg-card rounded-xl p-6 text-center text-muted">
          이번 주 활동 데이터가 없어 인사이트를 만들 수 없습니다.
        </section>
      ) : null}
    </>
  );
}

function InsightStateNotice({
  loadState,
  errorMessage,
}: {
  loadState: "loading" | "ready" | "empty" | "error";
  errorMessage: string | null;
}) {
  if (loadState === "loading") {
    return (
      <section className="bg-card rounded-xl p-3 text-sm text-muted">
        활동 데이터를 분석하는 중입니다.
      </section>
    );
  }
  if (loadState === "error") {
    return (
      <section className="bg-card rounded-xl border border-danger/40 p-3 text-sm text-danger">
        인사이트 데이터를 가져오지 못했습니다.
        {errorMessage ? ` ${errorMessage}` : ""}
      </section>
    );
  }
  return null;
}
