import { useMemo } from "react";
import { useActivityRange } from "../../../app/providers/useActivityRange";
import {
  buildWeeklyReport,
  getWeeklyQueryRange,
} from "../../../entities/activity/lib/reports";
import { WeeklySummary } from "../../../widgets/weekly/WeeklySummary";
import { WeeklyTrend } from "../../../widgets/weekly/WeeklyTrend";
import { WeeklyInsights } from "../../../widgets/weekly/WeeklyInsights";
import { PageHeader } from "../../../shared/ui/PageHeader";

export function WeeklyPage() {
  const range = useMemo(() => getWeeklyQueryRange(), []);
  const { rows, loadState, errorMessage } = useActivityRange(
    range.queryStartISO,
    range.queryEndISO,
  );
  const report = useMemo(
    () => buildWeeklyReport(rows, range.currentStartISO, range.currentEndISO),
    [rows, range.currentStartISO, range.currentEndISO],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Weekly / Pattern review"
        title="이번 주 집중 패턴 요약"
        description="요일별 활동 시간과 앱별 변화를 비교합니다."
        meta={<>This week<br />Compare</>}
        tone="warm"
      />
      <WeeklyStateNotice loadState={loadState} errorMessage={errorMessage} />
      {report.hasData ? (
        <>
          <WeeklySummary summary={report.dailySummary} />
          <div className="grid gap-5 xl:grid-cols-2">
            <WeeklyTrend trend={report.appTrend} />
            <WeeklyInsights insights={report.insights} />
          </div>
        </>
      ) : loadState !== "loading" ? (
        <section className="surface-card flex min-h-56 items-center justify-center p-8 text-center text-muted">
          이번 주 활동 데이터가 없습니다.
        </section>
      ) : null}
    </div>
  );
}

function WeeklyStateNotice({
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
        <span>주간 활동 데이터를 불러오는 중입니다.</span>
      </section>
    );
  }
  if (loadState === "error") {
    return (
      <section className="status-banner status-banner-danger">
        <span className="status-banner-dot" aria-hidden />
        <span>
          주간 활동 데이터를 가져오지 못했습니다.
          {errorMessage ? ` ${errorMessage}` : ""}
        </span>
      </section>
    );
  }
  return null;
}
