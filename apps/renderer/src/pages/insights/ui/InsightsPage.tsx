import { useMemo } from "react";
import { useActivityRange } from "../../../app/providers/useActivityRange";
import {
  buildInsightReport,
  getWeeklyQueryRange,
} from "../../../entities/activity/lib/reports";
import { FocusPatternGrid } from "../../../widgets/insights/FocusPatternGrid";
import { AppBehaviorInsights } from "../../../widgets/insights/AppBehaviorInsights";
import { InsightSummary } from "../../../widgets/insights/InsightSummary";
import { PageHeader } from "../../../shared/ui/PageHeader";

export function InsightsPage() {
  const range = useMemo(() => getWeeklyQueryRange(), []);
  const { summary, loadState, errorMessage } = useActivityRange(
    range.currentStartISO,
    range.currentEndISO,
  );
  const report = useMemo(
    () =>
      buildInsightReport(summary, range.currentStartISO, range.currentEndISO),
    [summary, range.currentStartISO, range.currentEndISO],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Insights / Reflection"
        title="집중 패턴 자동 해석"
        description="기록된 활동에서 반복되는 패턴을 찾아봅니다."
        meta={<>Weekly<br />Patterns</>}
        tone="sage"
      />
      <InsightStateNotice loadState={loadState} errorMessage={errorMessage} />
      {report.hasData ? (
        <>
          <InsightSummary summary={report.summary} />
          <FocusPatternGrid patterns={report.patterns} />
          <AppBehaviorInsights insights={report.appInsights} />
        </>
      ) : loadState !== "loading" ? (
        <section className="surface-card flex min-h-56 items-center justify-center p-8 text-center text-muted">
          이번 주 활동 데이터가 없어 인사이트를 만들 수 없습니다.
        </section>
      ) : null}
    </div>
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
      <section className="status-banner status-banner-neutral">
        <span className="status-banner-dot" aria-hidden />
        <span>활동 데이터를 분석하는 중입니다.</span>
      </section>
    );
  }
  if (loadState === "error") {
    return (
      <section className="status-banner status-banner-danger">
        <span className="status-banner-dot" aria-hidden />
        <span>
          인사이트 데이터를 가져오지 못했습니다.
          {errorMessage ? ` ${errorMessage}` : ""}
        </span>
      </section>
    );
  }
  return null;
}
